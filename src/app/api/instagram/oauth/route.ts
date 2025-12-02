import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code')
    const error = req.nextUrl.searchParams.get('error')

    if (error) {
        console.error('Instagram OAuth error:', error)
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?error=instagram_auth_failed`
        )
    }

    if (!code) {
        // Step 1: Redirect to Instagram OAuth
        const clientId = process.env.INSTAGRAM_APP_ID
        const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/instagram/oauth`
        const scope = 'instagram_basic,instagram_manage_messages,instagram_manage_comments'

        const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`

        return NextResponse.redirect(authUrl)
    }

    // Step 2: Exchange code for access token
    try {
        const supabase = await createServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`)
        }

        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.INSTAGRAM_APP_ID!,
                client_secret: process.env.INSTAGRAM_APP_SECRET!,
                grant_type: 'authorization_code',
                redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/instagram/oauth`,
                code: code,
            }),
        })

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token')
        }

        const tokenData = await tokenResponse.json()
        const shortLivedToken = tokenData.access_token
        const igUserId = tokenData.user_id

        // Exchange short-lived token for long-lived token (60 days)
        const longLivedResponse = await fetch(
            `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`
        )

        if (!longLivedResponse.ok) {
            throw new Error('Failed to get long-lived token')
        }

        const longLivedData = await longLivedResponse.json()
        const longLivedToken = longLivedData.access_token

        // Get Instagram account details
        const profileResponse = await fetch(
            `https://graph.instagram.com/${igUserId}?fields=id,username&access_token=${longLivedToken}`
        )

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch Instagram profile')
        }

        const profileData = await profileResponse.json()

        // Save to database
        const { data: existingAccount } = await supabase
            .from('instagram_accounts')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (existingAccount) {
            // Update existing account
            await supabase
                .from('instagram_accounts')
                .update({
                    ig_account_id: profileData.id,
                    ig_username: profileData.username,
                    ig_access_token: longLivedToken,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingAccount.id)
        } else {
            // Create new account
            const { data: newAccount } = await supabase
                .from('instagram_accounts')
                .insert({
                    user_id: user.id,
                    ig_account_id: profileData.id,
                    ig_username: profileData.username,
                    ig_access_token: longLivedToken,
                })
                .select()
                .single()

            // Create automation config if it doesn't exist
            const { data: existingConfig } = await supabase
                .from('automation_configs')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (!existingConfig && newAccount) {
                await supabase
                    .from('automation_configs')
                    .insert({
                        user_id: user.id,
                        instagram_account_id: newAccount.id,
                        llm_provider: 'gemini',
                        llm_model: 'gemini-2.0-flash',
                        system_prompt: 'You are a helpful assistant that responds to Instagram messages professionally and warmly.',
                        dm_auto_reply_enabled: false,
                        comment_auto_reply_enabled: false,
                    })
            }
        }

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?connected=true`
        )
    } catch (error) {
        console.error('Instagram OAuth error:', error)
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?error=connection_failed`
        )
    }
}

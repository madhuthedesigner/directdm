import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createServerClient()

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Check if user exists in our users table
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.user.id)
                .single()

            // If user doesn't exist, create profile
            if (!existingUser) {
                await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: data.user.email!,
                    })

                // Redirect to onboarding for new users
                return NextResponse.redirect(`${origin}/onboarding`)
            }

            // Existing user - redirect to dashboard
            return NextResponse.redirect(`${origin}/dashboard`)
        }
    }

    // If there's an error, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

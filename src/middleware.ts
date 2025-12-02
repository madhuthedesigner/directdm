import { createServerClient } from '@/lib/supabase'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const supabase = await createServerClient()

    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession()

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup')
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
    const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')

    // Redirect authenticated users away from auth pages
    if (session && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users to login
    if (!session && (isDashboard || isOnboarding)) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api/webhooks (Instagram webhooks don't need auth)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks).*)',
    ],
}

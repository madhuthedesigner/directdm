import { createServerClient } from "@/lib/supabase";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <Link href="/dashboard">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                            DirectDM
                        </h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/messages"
                        className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        Messages
                    </Link>
                    <Link
                        href="/dashboard/posts"
                        className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        Posts
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        Settings
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        Analytics
                    </Link>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-border space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center text-white font-medium">
                            {user.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                            <p className="text-xs text-muted-foreground">Free Plan</p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}

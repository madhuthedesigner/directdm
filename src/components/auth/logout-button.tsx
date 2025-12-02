"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full px-4 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors disabled:opacity-50"
        >
            {loading ? 'Signing out...' : 'Sign Out'}
        </button>
    );
}

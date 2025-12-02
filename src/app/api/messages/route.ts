import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/messages
 * Get message history with pagination
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Get user's config
        const { data: config } = await supabase
            .from("automation_configs")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!config) {
            return NextResponse.json({ messages: [], total: 0 });
        }

        const { data, error, count } = await supabase
            .from("messages")
            .select("*", { count: "exact" })
            .eq("automation_config_id", (config as any).id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            messages: data || [],
            total: count || 0,
            limit,
            offset,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/config
 * Get automation configuration for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("automation_configs")
            .select("*, instagram_accounts(*)")
            .eq("user_id", user.id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching config:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/config
 * Update automation configuration
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const {
            llmProvider,
            llmModel,
            llmApiKey,
            dmAutoReplyEnabled,
            commentAutoReplyEnabled,
        } = body;

        const { data, error } = await supabase
            .from("automation_configs")
            .update({
                llm_provider: llmProvider,
                llm_model: llmModel,
                llm_api_key: llmApiKey,
                dm_auto_reply_enabled: dmAutoReplyEnabled,
                comment_auto_reply_enabled: commentAutoReplyEnabled,
            })
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/posts/[postId]
 * Get automation settings for a specific post
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const supabase = await createServerClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;

        // Get user's config
        const { data: config } = await supabase
            .from("automation_configs")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!config) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const { data, error } = await supabase
            .from("post_automation_settings")
            .select("*")
            .eq("automation_config_id", (config as any).id)
            .eq("instagram_post_id", postId)
            .single();

        if (error && error.code !== 'PGRST116') {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || {
            is_enabled: false,
            keyword_triggers: [],
            reply_to_all_comments: false,
        });
    } catch (error) {
        console.error("Error fetching post settings:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/posts/[postId]
 * Update automation settings for a specific post
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const supabase = await createServerClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;
        const body = await request.json();
        const { isEnabled, keywordTriggers, replyToAllComments } = body;

        // Get user's config
        const { data: config } = await supabase
            .from("automation_configs")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!config) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const { data, error } = await supabase
            .from("post_automation_settings")
            .upsert({
                automation_config_id: (config as any).id,
                instagram_post_id: postId,
                is_enabled: isEnabled,
                keyword_triggers: keywordTriggers || [],
                reply_to_all_comments: replyToAllComments || false,
            } as any)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating post settings:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { InstagramAPI } from "@/lib/instagram-api";

/**
 * GET /api/posts
 * Get Instagram posts with automation settings
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        //Get user's automation config
        const { data: config } = await supabase
            .from("automation_configs")
            .select("*, instagram_accounts(*)")
            .eq("user_id", user.id)
            .single();

        if (!config) {
            return NextResponse.json({ error: "No automation config found" }, { status: 404 });
        }

        // Fetch posts from Instagram API
        const instagramAPI = new InstagramAPI((config as any).instagram_accounts.ig_access_token);
        const posts = await instagramAPI.getPosts((config as any).instagram_accounts.ig_account_id);

        // Get automation settings for these posts
        const { data: settings } = await supabase
            .from("post_automation_settings")
            .select("*")
            .eq("automation_config_id", (config as any).id);

        // Merge settings with posts
        const postsWithSettings = posts.map((post) => {
            const setting = (settings as any[])?.find(
                (s) => s.instagram_post_id === post.id
            );
            return {
                ...post,
                automation: setting || {
                    is_enabled: false,
                    keyword_triggers: [],
                    reply_to_all_comments: false,
                },
            };
        });

        return NextResponse.json(postsWithSettings);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

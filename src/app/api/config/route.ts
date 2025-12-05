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
            llm_provider,
            llm_model,
            llm_api_key,
            system_prompt,
            dm_auto_reply_enabled,
            comment_auto_reply_enabled,
        } = body;

        const updateData: any = {
            dm_auto_reply_enabled,
            comment_auto_reply_enabled,
        };

        if (llm_provider) updateData.llm_provider = llm_provider;
        if (llm_model) updateData.llm_model = llm_model;
        if (llm_api_key) updateData.llm_api_key = llm_api_key;
        if (system_prompt !== undefined) updateData.system_prompt = system_prompt;

        // @ts-ignore - Supabase generated types issue
        const { data, error } = await supabase
            .from("automation_configs")
            .update(updateData as any)
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

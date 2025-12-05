import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerClient();
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
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Build update object dynamically
        const updateData: Record<string, any> = {};

        if (body.llm_provider !== undefined) updateData.llm_provider = body.llm_provider;
        if (body.llm_model !== undefined) updateData.llm_model = body.llm_model;
        if (body.llm_api_key) updateData.llm_api_key = body.llm_api_key;
        if (body.system_prompt !== undefined) updateData.system_prompt = body.system_prompt;
        if (body.dm_auto_reply_enabled !== undefined) updateData.dm_auto_reply_enabled = body.dm_auto_reply_enabled;
        if (body.comment_auto_reply_enabled !== undefined) updateData.comment_auto_reply_enabled = body.comment_auto_reply_enabled;

        const result: any = await supabase
            .from("automation_configs")
            .update(updateData)
            .eq("user_id", user.id)
            .select()
            .single();

        if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

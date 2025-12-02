import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/config/system-prompt
 * Update system prompt for AI generation
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
        const { systemPrompt } = body;

        if (!systemPrompt) {
            return NextResponse.json(
                { error: "System prompt required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("automation_configs")
            .update({
                system_prompt: systemPrompt,
                system_prompt_updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating system prompt:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/analytics
 * Get analytics data for a specific time period
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
        const days = parseInt(searchParams.get("days") || "7");

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        // Get user's config
        const { data: config } = await supabase
            .from("automation_configs")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!config) {
            return NextResponse.json({
                daily: [],
                summary: {
                    total_dms: 0,
                    total_comments: 0,
                    total_auto_replies: 0,
                    total_cost: 0,
                },
            });
        }

        // Fetch daily analytics
        const { data: dailyData, error: dailyError } = await supabase
            .from("analytics")
            .select("*")
            .eq("automation_config_id", (config as any).id)
            .gte("date", startDateStr)
            .lte("date", endDateStr)
            .order("date", { ascending: true });

        if (dailyError) {
            return NextResponse.json({ error: dailyError.message }, { status: 500 });
        }

        // Calculate summary
        const summary = (dailyData || []).reduce(
            (acc: any, day: any) => ({
                total_dms: acc.total_dms + day.dm_received,
                total_comments: acc.total_comments + day.comments_received,
                total_auto_replies:
                    acc.total_auto_replies +
                    day.dm_auto_replied +
                    day.comments_auto_replied,
                total_cost: acc.total_cost + parseFloat(day.ai_api_cost_usd),
            }),
            { total_dms: 0, total_comments: 0, total_auto_replies: 0, total_cost: 0 }
        );

        return NextResponse.json({
            daily: dailyData || [],
            summary,
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

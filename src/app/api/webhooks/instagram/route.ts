import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import {
    InstagramAPI,
    verifyWebhookSignature,
    matchesKeywords,
} from "@/lib/instagram-api";
import { LLMAPI } from "@/lib/llm-api";
import { InstagramWebhookPayload } from "@/types/instagram";

/**
 * GET /api/webhooks/instagram
 * Webhook verification endpoint for Instagram
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken) {
        console.log("Webhook verified successfully");
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST /api/webhooks/instagram
 * Handle incoming Instagram webhook events (DMs and Comments)
 */
export async function POST(request: NextRequest) {
    try {
        // Verify webhook signature
        const signature = request.headers.get("x-hub-signature-256") || "";
        const bodyText = await request.text();

        if (
            !verifyWebhookSignature(
                bodyText,
                signature,
                process.env.INSTAGRAM_APP_SECRET!
            )
        ) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 403 }
            );
        }

        const payload: InstagramWebhookPayload = JSON.parse(bodyText);
        console.log("Webhook payload received:", JSON.stringify(payload));

        // Process each entry
        for (const entry of payload.entry) {
            // Handle messaging events (DMs)
            if (entry.messaging) {
                for (const event of entry.messaging) {
                    await handleDMEvent(event);
                }
            }

            // Handle changes events (Comments)
            if (entry.changes) {
                for (const change of entry.changes) {
                    if (change.field === "comments") {
                        await handleCommentEvent(change.value);
                    }
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle Instagram DM event
 */
async function handleDMEvent(event: any) {
    const startTime = Date.now();

    try {
        const supabase = createServerClient();

        // Extract message data
        const senderId = event.sender.id;
        const messageId = event.message?.mid;
        const messageText = event.message?.text;

        if (!messageText || !messageId) {
            console.log("No message text or ID, skipping");
            return;
        }

        // Find the automation config for this Instagram account
        const { data: configs } = await supabase
            .from("automation_configs")
            .select("*, instagram_accounts(*)")
            .eq("instagram_accounts.ig_account_id", event.recipient.id)
            .eq("dm_auto_reply_enabled", true)
            .limit(1);

        if (!configs || configs.length === 0) {
            console.log("No active automation config found");
            return;
        }

        const config = configs[0] as any;

        // Check if message already processed
        const { data: existingMessage } = await supabase
            .from("messages")
            .select("id")
            .eq("ig_message_id", messageId)
            .limit(1);

        if (existingMessage && existingMessage.length > 0) {
            console.log("Message already processed, skipping");
            return;
        }

        // Generate AI reply
        const llmResponse = await LLMAPI.generateReply(
            config.llm_provider,
            config.llm_model,
            config.llm_api_key,
            {
                prompt: messageText,
                systemPrompt: config.system_prompt,
            }
        );

        // Send reply via Instagram API
        const instagramAPI = new InstagramAPI(
            (config as any).instagram_accounts.ig_access_token
        );

        // Find or create conversation ID
        const conversationId = `${senderId}_${event.recipient.id}`;

        await instagramAPI.sendMessage(conversationId, llmResponse.text);

        const processingTime = Date.now() - startTime;

        // Log message to database
        await supabase.from("messages").insert({
            automation_config_id: config.id,
            ig_message_id: messageId,
            message_type: "dm",
            sender_username: senderId,
            sender_id: senderId,
            content: messageText,
            conversation_id: conversationId,
            processed_at: new Date().toISOString(),
            auto_reply_sent: true,
            auto_reply_content: llmResponse.text,
            ai_model_used: llmResponse.model,
            processing_time_ms: processingTime,
        });

        // Update analytics
        await updateAnalytics(config.id, "dm", llmResponse.costUsd);

        console.log(`DM auto-reply sent successfully in ${processingTime}ms`);
    } catch (error) {
        console.error("Error handling DM event:", error);
    }
}

/**
 * Handle Instagram Comment event
 */
async function handleCommentEvent(value: any) {
    const startTime = Date.now();

    try {
        const supabase = createServerClient();

        // Extract comment data
        const commentId = value.id;
        const commentText = value.text;
        const senderId = value.from?.id;
        const senderUsername = value.from?.username;
        const postId = value.media?.id;

        if (!commentText || !commentId || !postId) {
            console.log("Missing comment data, skipping");
            return;
        }

        // Find automation config and post settings
        const { data: postSettings } = await supabase
            .from("post_automation_settings")
            .select("*, automation_configs(*, instagram_accounts(*))")
            .eq("instagram_post_id", postId)
            .eq("is_enabled", true)
            .limit(1);

        if (!postSettings || postSettings.length === 0) {
            console.log("No active post automation settings found");
            return;
        }

        const setting = postSettings[0];
        const config = setting.automation_configs as any;

        // Check if comment auto-reply is enabled
        if (!config.comment_auto_reply_enabled) {
            console.log("Comment auto-reply disabled");
            return;
        }

        // Check keyword matching
        if (
            !setting.reply_to_all_comments &&
            !matchesKeywords(commentText, setting.keyword_triggers)
        ) {
            console.log("Comment does not match keywords, skipping");
            return;
        }

        // Check if comment already processed
        const { data: existingMessage } = await supabase
            .from("messages")
            .select("id")
            .eq("ig_message_id", commentId)
            .limit(1);

        if (existingMessage && existingMessage.length > 0) {
            console.log("Comment already processed, skipping");
            return;
        }

        // Generate AI reply
        const llmResponse = await LLMAPI.generateReply(
            config.llm_provider,
            config.llm_model,
            config.llm_api_key,
            {
                prompt: commentText,
                systemPrompt: config.system_prompt,
            }
        );

        // Send reply via Instagram API
        const instagramAPI = new InstagramAPI(
            (config as any).instagram_accounts.ig_access_token
        );

        await instagramAPI.replyToComment(commentId, llmResponse.text);

        const processingTime = Date.now() - startTime;

        // Log message to database
        await supabase.from("messages").insert({
            automation_config_id: config.id,
            ig_message_id: commentId,
            message_type: "comment",
            sender_username: senderUsername || senderId,
            sender_id: senderId,
            content: commentText,
            post_id: postId,
            comment_id: commentId,
            processed_at: new Date().toISOString(),
            auto_reply_sent: true,
            auto_reply_content: llmResponse.text,
            ai_model_used: llmResponse.model,
            processing_time_ms: processingTime,
        });

        // Update analytics
        await updateAnalytics(config.id, "comment", llmResponse.costUsd);

        console.log(`Comment auto-reply sent successfully in ${processingTime}ms`);
    } catch (error) {
        console.error("Error handling comment event:", error);
    }
}

/**
 * Update analytics
 */
async function updateAnalytics(
    configId: string,
    type: "dm" | "comment",
    cost: number
) {
    const supabase = createServerClient() as any;
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
        .from("analytics")
        .select("*")
        .eq("automation_config_id", configId)
        .eq("date", today)
        .limit(1);

    if (existing && existing.length > 0) {
        // Update existing analytics
        const analytics = (existing as any[])[0];
        await supabase
            .from("analytics")
            .update({
                dm_received:
                    analytics.dm_received + (type === "dm" ? 1 : 0),
                dm_auto_replied:
                    analytics.dm_auto_replied + (type === "dm" ? 1 : 0),
                comments_received:
                    analytics.comments_received + (type === "comment" ? 1 : 0),
                comments_auto_replied:
                    analytics.comments_auto_replied + (type === "comment" ? 1 : 0),
                ai_api_calls: analytics.ai_api_calls + 1,
                ai_api_cost_usd: Number(analytics.ai_api_cost_usd) + cost,
            } as any)
            .eq("id", analytics.id);
    } else {
        // Create new analytics entry
        await supabase.from("analytics").insert({
            automation_config_id: configId,
            date: today,
            dm_received: type === "dm" ? 1 : 0,
            dm_auto_replied: type === "dm" ? 1 : 0,
            comments_received: type === "comment" ? 1 : 0,
            comments_auto_replied: type === "comment" ? 1 : 0,
            ai_api_calls: 1,
            ai_api_cost_usd: cost,
        } as any);
    }
}

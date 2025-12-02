// Instagram Graph API Integration
import axios from "axios";
import {
    InstagramPost,
    InstagramComment,
    InstagramConversation,
    InstagramMessage,
    InstagramUserProfile,
} from "@/types/instagram";

const INSTAGRAM_API_BASE = "https://graph.instagram.com/v20.0";
const FACEBOOK_API_BASE = "https://graph.facebook.com/v20.0";

export class InstagramAPI {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    /**
     * Get user's Instagram Business Account profile
     */
    async getUserProfile(userId: string): Promise<InstagramUserProfile> {
        const response = await axios.get(`${INSTAGRAM_API_BASE}/${userId}`, {
            params: {
                fields: "id,username,account_type,media_count",
                access_token: this.accessToken,
            },
        });
        return response.data;
    }

    /**
     * Get user's recent posts
     */
    async getPosts(userId: string, limit = 25): Promise<InstagramPost[]> {
        const response = await axios.get(`${INSTAGRAM_API_BASE}/${userId}/media`, {
            params: {
                fields:
                    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username",
                limit,
                access_token: this.accessToken,
            },
        });
        return response.data.data || [];
    }

    /**
     * Get comments on a specific media post
     */
    async getComments(mediaId: string): Promise<InstagramComment[]> {
        const response = await axios.get(
            `${INSTAGRAM_API_BASE}/${mediaId}/comments`,
            {
                params: {
                    fields: "id,text,username,timestamp,from",
                    access_token: this.accessToken,
                },
            }
        );
        return response.data.data || [];
    }

    /**
     * Reply to a comment
     */
    async replyToComment(commentId: string, message: string): Promise<{ id: string }> {
        const response = await axios.post(
            `${INSTAGRAM_API_BASE}/${commentId}/replies`,
            null,
            {
                params: {
                    message,
                    access_token: this.accessToken,
                },
            }
        );
        return response.data;
    }

    /**
     * Get conversations (for DMs)
     */
    async getConversations(pageId: string): Promise<InstagramConversation[]> {
        const response = await axios.get(
            `${FACEBOOK_API_BASE}/${pageId}/conversations`,
            {
                params: {
                    platform: "instagram",
                    fields: "id,participants,updated_time,message_count",
                    access_token: this.accessToken,
                },
            }
        );
        return response.data.data || [];
    }

    /**
     * Get messages from a conversation
     */
    async getMessages(conversationId: string): Promise<InstagramMessage[]> {
        const response = await axios.get(
            `${FACEBOOK_API_BASE}/${conversationId}/messages`,
            {
                params: {
                    fields: "id,from,message,created_time",
                    access_token: this.accessToken,
                },
            }
        );
        return response.data.data || [];
    }

    /**
     * Send a DM reply to a conversation
     */
    async sendMessage(
        conversationId: string,
        message: string
    ): Promise<{ id: string }> {
        const response = await axios.post(
            `${FACEBOOK_API_BASE}/${conversationId}/messages`,
            null,
            {
                params: {
                    message,
                    access_token: this.accessToken,
                },
            }
        );
        return response.data;
    }

    /**
     * Exchange short-lived token for long-lived token
     */
    static async exchangeToken(
        shortLivedToken: string,
        appId: string,
        appSecret: string
    ): Promise<{ access_token: string; expires_in: number }> {
        const response = await axios.get(`${FACEBOOK_API_BASE}/oauth/access_token`, {
            params: {
                grant_type: "fb_exchange_token",
                client_id: appId,
                client_secret: appSecret,
                fb_exchange_token: shortLivedToken,
            },
        });
        return response.data;
    }
}

/**
 * Verify Instagram webhook signature
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    appSecret: string
): boolean {
    const crypto = require("crypto");
    const expectedSignature = crypto
        .createHmac("sha256", appSecret)
        .update(payload)
        .digest("hex");

    return `sha256=${expectedSignature}` === signature;
}

/**
 * Match keywords in message content
 */
export function matchesKeywords(
    messageContent: string,
    keywords: string[]
): boolean {
    if (!keywords || keywords.length === 0) return true;
    const lowerContent = messageContent.toLowerCase();
    return keywords.some((keyword) =>
        lowerContent.includes(keyword.toLowerCase())
    );
}

export const MESSAGE_TYPES = {
    DM: "dm",
    COMMENT: "comment",
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

// API Endpoints
export const API_ROUTES = {
    CONFIG: "/api/config",
    SYSTEM_PROMPT: "/api/config/system-prompt",
    POSTS: "/api/posts",
    MESSAGES: "/api/messages",
    ANALYTICS: "/api/analytics",
    AI_GENERATE: "/api/ai/generate-reply",
    INSTAGRAM_WEBHOOK: "/api/webhooks/instagram",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// AI Generation
export const MAX_REPLY_TOKENS = 150;
export const AI_TEMPERATURE = 0.7;
export const AI_TOP_P = 0.95;

// Rate Limiting
export const WEBHOOK_RATE_LIMIT = 100; // requests per minute per user

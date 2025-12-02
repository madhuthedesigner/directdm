export const APP_NAME = "DirectDM";
export const APP_DESCRIPTION = "AI-powered Instagram Auto-Reply System";

// LLM Providers
export const LLM_PROVIDERS = {
    GEMINI: "gemini",
    CLAUDE: "claude",
    OPENAI: "openai",
} as const;

export type LLMProvider = (typeof LLM_PROVIDERS)[keyof typeof LLM_PROVIDERS];

// LLM Models
export const LLM_MODELS = {
    GEMINI_FLASH: "gemini-2.0-flash-exp",
    GEMINI_PRO: "gemini-1.5-pro",
    CLAUDE_SONNET: "claude-3-5-sonnet-20241022",
    CLAUDE_HAIKU: "claude-3-5-haiku-20241022",
} as const;

// Message Types
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

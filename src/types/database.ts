// Database schema types for DirectDM
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            instagram_accounts: {
                Row: {
                    id: string;
                    user_id: string;
                    ig_account_id: string;
                    ig_username: string;
                    ig_access_token: string;
                    token_expires_at: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    ig_account_id: string;
                    ig_username: string;
                    ig_access_token: string;
                    token_expires_at?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    ig_account_id?: string;
                    ig_username?: string;
                    ig_access_token?: string;
                    token_expires_at?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            automation_configs: {
                Row: {
                    id: string;
                    user_id: string;
                    instagram_account_id: string;
                    llm_provider: string;
                    llm_model: string;
                    llm_api_key: string;
                    system_prompt: string;
                    system_prompt_updated_at: string | null;
                    dm_auto_reply_enabled: boolean;
                    comment_auto_reply_enabled: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    instagram_account_id: string;
                    llm_provider: string;
                    llm_model: string;
                    llm_api_key: string;
                    system_prompt: string;
                    system_prompt_updated_at?: string | null;
                    dm_auto_reply_enabled?: boolean;
                    comment_auto_reply_enabled?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    instagram_account_id?: string;
                    llm_provider?: string;
                    llm_model?: string;
                    llm_api_key?: string;
                    system_prompt?: string;
                    system_prompt_updated_at?: string | null;
                    dm_auto_reply_enabled?: boolean;
                    comment_auto_reply_enabled?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            post_automation_settings: {
                Row: {
                    id: string;
                    automation_config_id: string;
                    instagram_post_id: string;
                    is_enabled: boolean;
                    keyword_triggers: string[];
                    reply_to_all_comments: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    automation_config_id: string;
                    instagram_post_id: string;
                    is_enabled?: boolean;
                    keyword_triggers?: string[];
                    reply_to_all_comments?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    automation_config_id?: string;
                    instagram_post_id?: string;
                    is_enabled?: boolean;
                    keyword_triggers?: string[];
                    reply_to_all_comments?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            messages: {
                Row: {
                    id: string;
                    automation_config_id: string;
                    ig_message_id: string;
                    message_type: string;
                    sender_username: string;
                    sender_id: string;
                    content: string;
                    post_id: string | null;
                    comment_id: string | null;
                    conversation_id: string | null;
                    processed_at: string | null;
                    auto_reply_sent: boolean;
                    auto_reply_content: string | null;
                    ai_model_used: string | null;
                    processing_time_ms: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    automation_config_id: string;
                    ig_message_id: string;
                    message_type: string;
                    sender_username: string;
                    sender_id: string;
                    content: string;
                    post_id?: string | null;
                    comment_id?: string | null;
                    conversation_id?: string | null;
                    processed_at?: string | null;
                    auto_reply_sent?: boolean;
                    auto_reply_content?: string | null;
                    ai_model_used?: string | null;
                    processing_time_ms?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    automation_config_id?: string;
                    ig_message_id?: string;
                    message_type?: string;
                    sender_username?: string;
                    sender_id?: string;
                    content?: string;
                    post_id?: string | null;
                    comment_id?: string | null;
                    conversation_id?: string | null;
                    processed_at?: string | null;
                    auto_reply_sent?: boolean;
                    auto_reply_content?: string | null;
                    ai_model_used?: string | null;
                    processing_time_ms?: number | null;
                    created_at?: string;
                };
            };
            analytics: {
                Row: {
                    id: string;
                    automation_config_id: string;
                    date: string;
                    dm_received: number;
                    dm_auto_replied: number;
                    comments_received: number;
                    comments_auto_replied: number;
                    ai_api_calls: number;
                    ai_api_cost_usd: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    automation_config_id: string;
                    date?: string;
                    dm_received?: number;
                    dm_auto_replied?: number;
                    comments_received?: number;
                    comments_auto_replied?: number;
                    ai_api_calls?: number;
                    ai_api_cost_usd?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    automation_config_id?: string;
                    date?: string;
                    dm_received?: number;
                    dm_auto_replied?: number;
                    comments_received?: number;
                    comments_auto_replied?: number;
                    ai_api_calls?: number;
                    ai_api_cost_usd?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}

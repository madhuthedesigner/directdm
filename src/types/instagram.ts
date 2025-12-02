// Instagram Graph API Types

export interface InstagramWebhookEntry {
    id: string;
    time: number;
    messaging?: InstagramMessaging[];
    changes?: InstagramChange[];
}

export interface InstagramMessaging {
    sender: {
        id: string;
    };
    recipient: {
        id: string;
    };
    timestamp: number;
    message?: {
        mid: string;
        text: string;
    };
}

export interface InstagramChange {
    field: string;
    value: InstagramChangeValue;
}

export interface InstagramChangeValue {
    from?: {
        id: string;
        username: string;
    };
    media?: {
        id: string;
        media_product_type: string;
    };
    id: string;
    text?: string;
    parent_id?: string;
}

export interface InstagramWebhookPayload {
    object: string;
    entry: InstagramWebhookEntry[];
}

export interface InstagramPost {
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink: string;
    timestamp: string;
    username: string;
}

export interface InstagramComment {
    id: string;
    text: string;
    username: string;
    timestamp: string;
    from: {
        id: string;
        username: string;
    };
}

export interface InstagramConversation {
    id: string;
    participants: {
        data: Array<{
            id: string;
            username: string;
        }>;
    };
    updated_time: string;
    message_count: number;
}

export interface InstagramMessage {
    id: string;
    from: {
        id: string;
        username: string;
    };
    message: string;
    created_time: string;
}

export interface InstagramOAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface InstagramUserProfile {
    id: string;
    username: string;
    account_type: string;
    media_count: number;
}

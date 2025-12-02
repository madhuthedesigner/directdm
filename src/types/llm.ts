// LLM API Types

export interface LLMGenerateRequest {
    prompt: string;
    systemPrompt: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
}

export interface LLMGenerateResponse {
    text: string;
    tokensUsed: {
        input: number;
        output: number;
        total: number;
    };
    costUsd: number;
    model: string;
    provider: string;
}

// Gemini API Types
export interface GeminiContent {
    role: string;
    parts: Array<{
        text: string;
    }>;
}

export interface GeminiGenerateRequest {
    system_instruction?: {
        parts: Array<{
            text: string;
        }>;
    };
    contents: GeminiContent[];
    generation_config?: {
        temperature?: number;
        top_p?: number;
        max_output_tokens?: number;
    };
}

export interface GeminiGenerateResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
            role: string;
        };
        finishReason: string;
        index: number;
    }>;
    usageMetadata: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

// Claude API Types
export interface ClaudeMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ClaudeGenerateRequest {
    model: string;
    max_tokens: number;
    temperature?: number;
    top_p?: number;
    system?: string;
    messages: ClaudeMessage[];
}

export interface ClaudeGenerateResponse {
    id: string;
    type: string;
    role: string;
    content: Array<{
        type: string;
        text: string;
    }>;
    model: string;
    stop_reason: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

// LLM API Integration (Gemini & Claude)
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import {
    LLMGenerateRequest,
    LLMGenerateResponse,
    ClaudeGenerateRequest,
    ClaudeGenerateResponse,
} from "@/types/llm";
import { LLM_PROVIDERS, MAX_REPLY_TOKENS, AI_TEMPERATURE, AI_TOP_P } from "./constants";

/**
 * LLM API Cost Calculator
 */
export class LLMCostCalculator {
    // Pricing per million tokens (as of Dec 2024)
    private static readonly PRICING: Record<string, Record<string, { input: number; output: number }>> = {
        [LLM_PROVIDERS.GEMINI]: {
            "gemini-2.0-flash-exp": { input: 0.0, output: 0.0 }, // Free during preview
            "gemini-1.5-pro": { input: 1.25, output: 5.0 },
        },
        [LLM_PROVIDERS.CLAUDE]: {
            "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
            "claude-3-5-haiku-20241022": { input: 1.0, output: 5.0 },
        },
    };

    static calculate(
        provider: string,
        model: string,
        inputTokens: number,
        outputTokens: number
    ): number {
        const pricing = this.PRICING[provider]?.[model];
        if (!pricing) return 0;

        const inputCost = (inputTokens / 1_000_000) * pricing.input;
        const outputCost = (outputTokens / 1_000_000) * pricing.output;

        return inputCost + outputCost;
    }
}

/**
 * Gemini API Wrapper
 */
export class GeminiAPI {
    private genAI: GoogleGenerativeAI;
    private model: string;

    constructor(apiKey: string, model = "gemini-2.0-flash-exp") {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = model;
    }

    async generateReply(request: LLMGenerateRequest): Promise<LLMGenerateResponse> {
        const startTime = Date.now();

        const model = this.genAI.getGenerativeModel({
            model: this.model,
            systemInstruction: request.systemPrompt,
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: request.prompt }] }],
            generationConfig: {
                maxOutputTokens: request.maxTokens || MAX_REPLY_TOKENS,
                temperature: request.temperature || AI_TEMPERATURE,
                topP: request.topP || AI_TOP_P,
            },
        });

        const response = result.response;
        const text = response.text();

        // Get token usage
        const usage = response.usageMetadata;
        const inputTokens = usage?.promptTokenCount || 0;
        const outputTokens = usage?.candidatesTokenCount || 0;
        const totalTokens = usage?.totalTokenCount || 0;

        // Calculate cost
        const costUsd = LLMCostCalculator.calculate(
            LLM_PROVIDERS.GEMINI,
            this.model,
            inputTokens,
            outputTokens
        );

        return {
            text,
            tokensUsed: {
                input: inputTokens,
                output: outputTokens,
                total: totalTokens,
            },
            costUsd,
            model: this.model,
            provider: LLM_PROVIDERS.GEMINI,
        };
    }
}

/**
 * Claude API Wrapper
 */
export class ClaudeAPI {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model = "claude-3-5-sonnet-20241022") {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generateReply(request: LLMGenerateRequest): Promise<LLMGenerateResponse> {
        const payload: ClaudeGenerateRequest = {
            model: this.model,
            max_tokens: request.maxTokens || MAX_REPLY_TOKENS,
            temperature: request.temperature || AI_TEMPERATURE,
            top_p: request.topP || AI_TOP_P,
            system: request.systemPrompt,
            messages: [
                {
                    role: "user",
                    content: request.prompt,
                },
            ],
        };

        const response = await axios.post<ClaudeGenerateResponse>(
            "https://api.anthropic.com/v1/messages",
            payload,
            {
                headers: {
                    "x-api-key": this.apiKey,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
            }
        );

        const data = response.data;
        const text = data.content[0]?.text || "";

        // Get token usage
        const inputTokens = data.usage.input_tokens;
        const outputTokens = data.usage.output_tokens;
        const totalTokens = inputTokens + outputTokens;

        // Calculate cost
        const costUsd = LLMCostCalculator.calculate(
            LLM_PROVIDERS.CLAUDE,
            this.model,
            inputTokens,
            outputTokens
        );

        return {
            text,
            tokensUsed: {
                input: inputTokens,
                output: outputTokens,
                total: totalTokens,
            },
            costUsd,
            model: this.model,
            provider: LLM_PROVIDERS.CLAUDE,
        };
    }
}

/**
 * Universal LLM API Client
 */
export class LLMAPI {
    static async generateReply(
        provider: string,
        model: string,
        apiKey: string,
        request: LLMGenerateRequest
    ): Promise<LLMGenerateResponse> {
        switch (provider) {
            case LLM_PROVIDERS.GEMINI:
                const gemini = new GeminiAPI(apiKey, model);
                return await gemini.generateReply(request);

            case LLM_PROVIDERS.CLAUDE:
                const claude = new ClaudeAPI(apiKey, model);
                return await claude.generateReply(request);

            default:
                throw new Error(`Unsupported LLM provider: ${provider}`);
        }
    }
}

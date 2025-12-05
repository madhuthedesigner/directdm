// LLM API Integration (Gemini Only)
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MAX_REPLY_TOKENS, AI_TEMPERATURE, AI_TOP_P } from "./constants";

/**
 * LLM API Cost Calculator
 */
export class LLMCostCalculator {
    // Pricing per million tokens (as of Dec 2024)
    private static readonly PRICING: Record<string, { input: number; output: number }> = {
        "gemini-2.0-flash": { input: 0.0, output: 0.0 }, // Free
        "gemini-2.0-flash-exp": { input: 0.0, output: 0.0 }, // Free during preview
        "gemini-1.5-pro": { input: 1.25, output: 5.0 },
    };

    static calculate(
        model: string,
        inputTokens: number,
        outputTokens: number
    ): number {
        const pricing = this.PRICING[model];
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

    constructor(apiKey: string, model: string = "gemini-2.0-flash") {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = model;
    }

    async generateReply(
        systemPrompt: string,
        userMessage: string
    ): Promise<{
        reply: string;
        inputTokens: number;
        outputTokens: number;
    }> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: this.model,
                systemInstruction: systemPrompt,
                generationConfig: {
                    maxOutputTokens: MAX_REPLY_TOKENS,
                    temperature: AI_TEMPERATURE,
                    topP: AI_TOP_P,
                },
            });

            const result = await model.generateContent(userMessage);
            const response = result.response;
            const text = response.text();

            // Get token usage
            const usageMetadata = response.usageMetadata;
            const inputTokens = usageMetadata?.promptTokenCount || 0;
            const outputTokens = usageMetadata?.candidatesTokenCount || 0;

            return {
                reply: text,
                inputTokens,
                outputTokens,
            };
        } catch (error) {
            console.error("Gemini API error:", error);
            throw new Error("Failed to generate AI reply");
        }
    }
}

/**
 * Main LLM API Class
 */
export class LLMAPI {
    static async generateReply(
        apiKey: string,
        model: string,
        systemPrompt: string,
        userMessage: string
    ): Promise<{
        reply: string;
        inputTokens: number;
        outputTokens: number;
        costUSD: number;
    }> {
        const gemini = new GeminiAPI(apiKey, model);
        const result = await gemini.generateReply(systemPrompt, userMessage);

        const cost = LLMCostCalculator.calculate(
            model,
            result.inputTokens,
            result.outputTokens
        );

        return {
            ...result,
            costUSD: cost,
        };
    }
}

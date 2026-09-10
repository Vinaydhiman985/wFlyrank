import { GoogleGenAI, Type } from "@google/genai";
import type { Schema } from "@google/genai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI(); // Automatically picks up process.env.GEMINI_API_KEY

// 1. Zod Schema for runtime type trust
export const ReceiptSchema = z.object({
    merchantName: z.string().describe("Name of the store or vendor"),
    totalAmount: z.number().describe("Total amount paid including taxes"),
    currency: z.string().length(3).describe("ISO 4217 currency code like USD or INR"),
    category: z.enum(["Food", "Travel", "Utilities", "Shopping", "Other"]),
    itemsSummary: z.array(z.string()).describe("List of core items bought"),
});

export type ReceiptData = z.infer<typeof ReceiptSchema>;

// Corresponding Gemini Schema for forced structural output
const geminiReceiptSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        merchantName: { type: Type.STRING },
        totalAmount: { type: Type.NUMBER },
        currency: { type: Type.STRING },
        category: { type: Type.STRING, enum: ["Food", "Travel", "Utilities", "Shopping", "Other"] },
        itemsSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["merchantName", "totalAmount", "currency", "category", "itemsSummary"],
};

/**
 * Calls Gemini with timeout and exponential backoff retries, then validates with Zod.
 */
export async function extractReceiptData(rawText: string, retries = 3, timeoutMs = 6000): Promise<ReceiptData> {
    if (!rawText || rawText.trim() === "") {
        throw new Error("Raw receipt text cannot be empty.");
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Setup timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const apiCall = ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: `Extract structure from this receipt text: \n"""${rawText}"""`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: geminiReceiptSchema,
                    systemInstruction: "You are a robust data extraction service. Extract clean JSON matching the schema.",
                },
            });

            // Race API against timeout
            const result = await Promise.race([
                apiCall,
                new Promise((_, reject) => setTimeout(() => reject(new Error("AI Model Request Timed Out")), timeoutMs))
            ]) as any;

            clearTimeout(timeoutId);

            const textResponse = result.text();
            if (!textResponse) throw new Error("Received empty response from model.");

            // Parse JSON and validate strictly using Zod
            const rawJson = JSON.parse(textResponse);
            const validatedData = ReceiptSchema.parse(rawJson);

            return validatedData;

        } catch (error: any) {
            console.warn(`Attempt ${attempt}/${retries} failed: ${error.message}`);
            if (attempt === retries) {
                throw new Error(`Extraction failed after ${retries} attempts: ${error.message}`);
            }
            // Wait before retrying (exponential backoff)
            await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 400));
        }
    }
    throw new Error("Unexpected end of retry loop.");
}
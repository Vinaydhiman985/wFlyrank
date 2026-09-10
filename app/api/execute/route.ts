import { NextResponse } from "next/server";
import OpenAI from "openai";
import { inngest } from "@/inngest/client";

function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is missing. Add it to your .env.local file.");
    }

    return new OpenAI({ apiKey });
}

async function evaluateDecision(prompt: string, inputData: string) {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are a binary decision engine. Read the prompt and input, and return ONLY the exact word 'YES' or 'NO'. No punctuation, no explanation.",
            },
            {
                role: "user",
                content: `Input data: "${inputData}"\n\nPrompt: ${prompt}`,
            },
        ],
        temperature: 0,
    });

    const result =
        response.choices[0]?.message?.content?.trim().toUpperCase() || "NO";

    return result === "YES" ? "YES" : "NO";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            nodes = [],
            edges = [],
            inputData = "I need help resetting my password.",
        } = body;

        if (!nodes.length) {
            return NextResponse.json(
                { success: false, error: "At least one workflow node is required." },
                { status: 400 }
            );
        }

        const history: string[] = [];

        let currentNode = nodes.find((node: any) => node.id === "node-1") ?? nodes[0];

        while (currentNode) {
            const prompt = currentNode.data?.prompt ?? "";
            const decision = await evaluateDecision(prompt, inputData);

            history.push(`Node [${currentNode.id}] evaluated -> ${decision}`);

            const matchingEdge = edges.find(
                (edge: any) =>
                    edge.source === currentNode.id &&
                    edge.sourceHandle?.toLowerCase() === decision.toLowerCase()
            );

            if (!matchingEdge) {
                history.push(
                    `Workflow ended: No outgoing '${decision}' edge from node ${currentNode.id}`
                );
                break;
            }

            currentNode = nodes.find((node: any) => node.id === matchingEdge.target);
        }

        let eventIds: string[] = [];

        try {
            const result = await inngest.send({
                name: "workflow/run",
                data: { nodes, edges, inputData },
            });
            eventIds = result.ids;
        } catch (error: any) {
            history.push(`Background event dispatch warning: ${error.message}`);
        }

        return NextResponse.json({ success: true, history, eventIds });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

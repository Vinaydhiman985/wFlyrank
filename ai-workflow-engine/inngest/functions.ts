import OpenAI from "openai";
import { inngest } from "./client";

function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is missing. Add it to your .env.local file.");
    }

    return new OpenAI({ apiKey });
}

export const executeWorkflowFunction = inngest.createFunction(
    {
        id: "execute-ai-workflow",
        triggers: [{ event: "workflow/run" }],
    },
    async ({ event, step }) => {
        const { nodes, edges, inputData } = event.data;

        let currentNode = nodes.find((node: any) => node.id === "node-1");
        const executionHistory: string[] = [];

        while (currentNode) {
            const promptText = currentNode.data.prompt;

            const decision = await step.run(`evaluate-${currentNode.id}`, async () => {
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
                            content: `Input data: "${inputData}"\n\nPrompt: ${promptText}`,
                        },
                    ],
                    temperature: 0,
                });

                const result =
                    response.choices[0]?.message?.content?.trim().toUpperCase() || "NO";

                return result === "YES" ? "YES" : "NO";
            });

            executionHistory.push(`Node ${currentNode.id} evaluated to: ${decision}`);

            const matchingEdge = edges.find(
                (edge: any) =>
                    edge.source === currentNode.id &&
                    edge.sourceHandle?.toLowerCase() === decision.toLowerCase()
            );

            if (!matchingEdge) {
                executionHistory.push(
                    `Workflow terminated: No outgoing '${decision}' edge from node ${currentNode.id}`
                );
                break;
            }

            currentNode = nodes.find((node: any) => node.id === matchingEdge.target);
        }

        return { success: true, history: executionHistory };
    }
);

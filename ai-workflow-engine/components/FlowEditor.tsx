'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    addEdge,
    useEdgesState,
    useNodesState,
    type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DecisionNode } from "./DecisionNode";

const nodeTypes = { decision: DecisionNode };
const STORAGE_KEY = "ai-workflow-engine-flow";

const initialNodes = [
    {
        id: "node-1",
        type: "decision",
        position: { x: 250, y: 50 },
        data: {
            id: "node-1",
            prompt: "Is the user requesting technical support?",
        },
    },
];

export default function FlowEditor({
    onRun,
}: {
    onRun: (flow: any) => Promise<any>;
}) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedPrompt, setSelectedPrompt] = useState("");
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [inputData, setInputData] = useState(
        "I need help resetting my account password."
    );
    const [logs, setLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const importInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return;
            }

            const parsed = JSON.parse(saved);

            if (parsed.nodes?.length) {
                setNodes(parsed.nodes);
            }

            if (parsed.edges?.length) {
                setEdges(parsed.edges);
            }
        } catch (error) {
            console.error("Failed to load saved workflow:", error);
        }
    }, [setEdges, setNodes]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const addNode = () => {
        const id = `node-${nodes.length + 1}`;
        const newNode = {
            id,
            type: "decision",
            position: { x: Math.random() * 400, y: nodes.length * 150 + 50 },
            data: { id, prompt: "New decision prompt..." },
        };

        setNodes((nds) => [...nds, newNode]);
        setLogs((prev) => [...prev, `Added new decision node ${id}.`]);
    };

    const handleNodeClick = (_: any, node: any) => {
        setSelectedNodeId(node.id);
        setSelectedPrompt(node.data.prompt);
    };

    const updatePrompt = () => {
        if (!selectedNodeId) return;

        setNodes((nds) =>
            nds.map((node) =>
                node.id === selectedNodeId
                    ? { ...node, data: { ...node.data, prompt: selectedPrompt } }
                    : node
            )
        );

        setLogs((prev) => [
            ...prev,
            `Updated prompt for node ${selectedNodeId}.`,
        ]);
    };

    const saveWorkflow = useCallback(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ nodes, edges }, null, 2)
        );
        setLogs((prev) => [...prev, "Workflow saved to localStorage."]);
    }, [edges, nodes]);

    const loadWorkflow = useCallback(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                setLogs((prev) => [...prev, "No saved workflow found."]);
                return;
            }

            const parsed = JSON.parse(saved);
            setNodes(parsed.nodes || initialNodes);
            setEdges(parsed.edges || []);
            setSelectedNodeId(null);
            setSelectedPrompt("");
            setLogs((prev) => [...prev, "Workflow loaded from localStorage."]);
        } catch (error) {
            setLogs((prev) => [...prev, "Failed to load saved workflow."]);
            console.error(error);
        }
    }, [setEdges, setNodes]);

    const exportJSON = useCallback(() => {
        const file = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ai_workflow.json";
        link.click();
        URL.revokeObjectURL(url);
        setLogs((prev) => [...prev, "Workflow exported as JSON."]);
    }, [edges, nodes]);

    const importJSON = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];

            if (!file) {
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const parsed = JSON.parse(String(reader.result || "{}"));
                    const importedNodes = parsed.nodes || initialNodes;
                    const importedEdges = parsed.edges || [];

                    setNodes(importedNodes);
                    setEdges(importedEdges);
                    setSelectedNodeId(null);
                    setSelectedPrompt("");
                    setLogs((prev) => [...prev, "Workflow imported from JSON file."]);
                } catch (error) {
                    setLogs((prev) => [...prev, "Invalid JSON workflow file."]);
                    console.error(error);
                }
            };

            reader.readAsText(file);
            event.target.value = "";
        },
        [setEdges, setNodes]
    );

    const handleRunWorkflow = useCallback(async () => {
        if (isRunning) {
            return;
        }

        setIsRunning(true);
        setLogs((prev) => [...prev, "--- Starting Workflow Execution ---"]);

        try {
            const data = await onRun({ nodes, edges, inputData });

            if (data?.history?.length) {
                data.history.forEach((stepLog: string) => {
                    setLogs((prev) => [...prev, stepLog]);
                });
            }

            if (data?.eventIds?.length) {
                setLogs((prev) => [
                    ...prev,
                    `Event sent successfully. Inngest IDs: ${data.eventIds.join(", ")}`,
                ]);
            }

            setLogs((prev) => [...prev, "--- Workflow Execution Complete ---"]);
        } catch (error: any) {
            setLogs((prev) => [...prev, `Network Error: ${error.message}`]);
        } finally {
            setIsRunning(false);
        }
    }, [edges, inputData, isRunning, nodes, onRun]);

    return (
        <div className="flex h-screen w-full bg-slate-100">
            <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={importJSON}
            />

            <div className="h-full flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>

            <div className="z-10 flex w-[24rem] flex-col gap-4 border-l border-slate-200 bg-white p-4 shadow-lg">
                <h2 className="text-lg font-bold text-slate-800">AI Workflow Inspector</h2>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={addNode}
                        className="flex-1 rounded bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
                    >
                        + Add Node
                    </button>
                    <button
                        onClick={saveWorkflow}
                        className="rounded bg-slate-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                    >
                        Save
                    </button>
                    <button
                        onClick={loadWorkflow}
                        className="rounded bg-slate-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                    >
                        Load
                    </button>
                    <button
                        onClick={exportJSON}
                        className="rounded bg-emerald-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-800"
                    >
                        Export
                    </button>
                    <button
                        onClick={() => importInputRef.current?.click()}
                        className="rounded bg-amber-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-700"
                    >
                        Import
                    </button>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">
                        Test Input Data
                    </label>
                    <input
                        type="text"
                        className="rounded border p-2 text-xs text-slate-800"
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                    />
                </div>

                {selectedNodeId ? (
                    <div className="flex flex-col gap-2 border-t pt-3">
                        <label className="text-xs font-semibold text-slate-700">
                            Edit Prompt ({selectedNodeId})
                        </label>
                        <textarea
                            className="h-28 rounded border p-2 text-xs text-slate-800"
                            value={selectedPrompt}
                            onChange={(e) => setSelectedPrompt(e.target.value)}
                        />
                        <button
                            onClick={updatePrompt}
                            className="rounded bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-900"
                        >
                            Update Prompt
                        </button>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400">
                        Click any node on the canvas to edit its prompt.
                    </p>
                )}

                <div className="mt-auto border-t pt-3">
                    <button
                        onClick={handleRunWorkflow}
                        disabled={isRunning}
                        className="w-full rounded bg-emerald-600 py-3 font-bold text-sm text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                    >
                        {isRunning ? "Running..." : "Run Workflow"}
                    </button>
                </div>

                <div className="h-52 overflow-y-auto rounded border bg-slate-900 p-2 font-mono text-xs text-emerald-400">
                    <div className="mb-1 text-slate-400 font-bold">
                        // Execution History & Logs
                    </div>
                    {logs.length === 0 && (
                        <div className="text-slate-600">
                            Run workflow to see live AI steps...
                        </div>
                    )}
                    {logs.map((log, index) => (
                        <div key={`${log}-${index}`} className="mb-1">
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

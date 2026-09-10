"use client";

import React, { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

type DecisionNodeData = {
    id?: string;
    prompt?: string;
};

type DecisionNodeType = Node<DecisionNodeData, "decision">;

export const DecisionNode = memo(({ data }: NodeProps<DecisionNodeType>) => {
    return (
        <div className="w-64 rounded-xl border-2 border-slate-800 bg-white p-4 shadow-md">
            <Handle
                type="target"
                position={Position.Top}
                className="h-3 w-3 bg-slate-800"
            />

            <div className="mb-1 text-sm font-semibold text-slate-900">
                AI Decision Node
            </div>
            <div className="mb-2 text-xs text-slate-500">ID: {data.id}</div>

            <div className="rounded border bg-slate-50 p-2 text-xs text-slate-700">
                <span className="font-medium">Prompt:</span> {String(data.prompt || "Enter prompt...")}
            </div>

            <div className="mt-4 flex justify-between text-xs font-bold">
                <div className="flex items-center gap-1 text-emerald-600">
                    <span>YES</span>
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="yes"
                        className="relative! h-3! w-3! transform-none! bg-emerald-600!"
                    />
                </div>
                <div className="flex items-center gap-1 text-rose-600">
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="no"
                        className="relative! h-3! w-3! transform-none! bg-rose-600!"
                    />
                    <span>NO</span>
                </div>
            </div>
        </div>
    );
});

DecisionNode.displayName = "DecisionNode";

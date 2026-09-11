'use client';

import FlowEditor from "@/components/FlowEditor";

export default function Page() {
  const handleRunWorkflow = async (flowData: any) => {
    const response = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flowData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Workflow execution failed.");
    }

    return data;
  };

  return (
    <main className="h-screen w-screen overflow-hidden">
      <FlowEditor onRun={handleRunWorkflow} />
    </main>
  );
}

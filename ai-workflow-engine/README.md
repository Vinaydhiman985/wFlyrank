# AI Workflow Engine (Assignment 7 - Part 1)

A visual AI workflow system where each node represents an AI decision step returning either YES or NO. The workflow execution runs through Inngest and OpenAI, while the frontend visualizes and edits the flow using React Flow.

---

## Features

- Visual Flow Editor: Powered by React Flow to add, position, and connect decision nodes with custom YES and NO output handles.
- AI-Powered Branching Logic: Evaluates node prompts dynamically using OpenAI (gpt-4o-mini), enforcing strict binary decisions (YES or NO).
- Inngest Orchestration: Executes workflows reliably with background step tracking and event-driven architecture.
- Developer Polish & UI Tools:
  - Live execution history and step logs.
  - LocalStorage save and load capabilities.
  - JSON workflow export.
  - Interactive prompt inspector.

---

## Project Structure

```text
ai-workflow-engine/
├── app/
│   ├── api/
│   │   ├── execute/
│   │   │   └── route.ts
│   │   └── inngest/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DecisionNode.tsx
│   └── FlowEditor.tsx
├── inngest/
│   ├── client.ts
│   └── functions.ts
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── README.md
└── .env.local
```

---

## Getting Started & Installation

### 1. Prerequisites
- Node.js (v18+ recommended)
- OpenAI API Key

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

---

## Running the Application

You will need 2 terminal windows running simultaneously:

### Terminal 1: Start the Next.js App
```bash
npm run dev
```

This runs the application on `http://localhost:3000`.

### Terminal 2: Start the Inngest Dev Server
```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

This opens the local dashboard at `http://localhost:8288`.

---

## Usage Guide
1. Configure Nodes: Click on any decision node on the canvas to edit its custom prompt in the Inspector sidebar.
2. Connect Paths: Draw edges from the bottom handles (YES or NO) of one node to the target input handle of another node.
3. Run Workflow: Enter test input data and click Run Workflow to watch real-time node traversal and AI evaluation output in the logs panel.
4. Export / Save: Use the toolbar buttons to save your workflow to LocalStorage or export it as a JSON file.

---

## Notes

- The app uses `gpt-4o-mini` for binary decision evaluation.
- Execution history is shown directly in the frontend logs panel.
- workflows can be saved locally and reloaded at any time.

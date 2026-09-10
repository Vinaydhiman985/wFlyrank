# Trustworthy AI Endpoint (Assignment 6)

A production-ready Express API that integrates Google Gemini for structured receipt/invoice data extraction, with runtime schema validation, request timeouts, retry handling, and automated tests.

---

## Features

- Strict schema enforcement using Zod and Gemini structured outputs
- Resilient AI calls with timeout handling and exponential backoff retries
- Express endpoint for receipt extraction
- Comprehensive automated test coverage
- Environment-based configuration for API keys

---

## Tech Stack

- TypeScript
- Node.js
- Express.js
- Google Gen AI SDK (`@google/genai`)
- Zod
- Jest + Supertest

---

## Project Structure

```text
trustworthy-ai-endpoint/
├── src/
│   ├── aiService.ts
│   ├── index.ts
│   └── index.test.ts
├── .env
├── jest.config.cjs
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites

- Node.js installed
- A Gemini API key from Google AI Studio

### 2. Installation

```bash
git clone <repository-url>
cd trustworthy-ai-endpoint
npm install
```

### 3. Environment Setup

Create a `.env` file in the project root:

```env
PORT=3000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Run the Server

```bash
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

---

## API Usage

### Extract Receipt Data

- Endpoint: `POST /api/extract`
- Headers: `Content-Type: application/json`

Request body:

```json
{
  "rawText": "Starbucks Coffee - Total: $5.50 USD. Items: Cappuccino"
}
```

Example curl request:

```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"rawText":"Starbucks Coffee - Total: $5.50 USD. Items: Cappuccino"}'
```

Successful response example:

```json
{
  "success": true,
  "data": {
    "merchantName": "Starbucks",
    "totalAmount": 5.5,
    "currency": "USD",
    "category": "Food",
    "itemsSummary": ["Cappuccino"]
  }
}
```

---

## Running Tests

```bash
npm test
```

The project includes 8 automated tests covering:

- valid receipt extraction
- messy/unstructured input
- missing `rawText`
- empty input handling
- schema violation handling
- timeout handling
- successful extraction response flow
- error propagation for repeated failures

---

## Notes

- The current test setup uses `jest --forceExit` so Jest can finish cleanly after running the suite.
- The AI service currently uses the supported Gemini model `gemini-3.6-flash`.

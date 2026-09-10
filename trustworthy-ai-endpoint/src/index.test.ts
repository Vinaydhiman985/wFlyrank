import request from "supertest";
import app from "./index";
import * as aiService from "./aiService";

describe("POST /api/extract - Trustworthy AI Endpoint Tests", () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test 1: Standard Valid Input
    it("1. Should successfully extract data from a clean receipt", async () => {
        jest.spyOn(aiService, "extractReceiptData").mockResolvedValue({
            merchantName: "Starbucks",
            totalAmount: 5.50,
            currency: "USD",
            category: "Food",
            itemsSummary: ["Cappuccino"]
        });

        const res = await request(app)
            .post("/api/extract")
            .send({ rawText: "Starbucks Coffee - Total: $5.50 USD. Items: Cappuccino" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.merchantName).toBeDefined();
        expect(res.body.data.totalAmount).toBe(5.50);
    });

    // Test 2: Messy / Unstructured Input Handling
    it("2. Should handle unstructured, messy chat-like receipt text", async () => {
        jest.spyOn(aiService, "extractReceiptData").mockResolvedValue({
            merchantName: "Amazon",
            totalAmount: 1200,
            currency: "INR",
            category: "Shopping",
            itemsSummary: ["Shoes"]
        });

        const res = await request(app)
            .post("/api/extract")
            .send({ rawText: "hey paid Rs 1200 at amazon for shoes yesterday evening" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.totalAmount).toBe(1200);
        expect(res.body.data.currency).toBe("INR");
    });

    // Test 3: Bad Request / Missing Payload Validation
    it("3. Should return 400 status when rawText is missing", async () => {
        const res = await request(app)
            .post("/api/extract")
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain("Missing or invalid");
    });

    // Test 4: Empty String Validation
    it("4. Should reject empty string inputs cleanly", async () => {
        const res = await request(app)
            .post("/api/extract")
            .send({ rawText: "   " });

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });

    // Test 5: Zod Schema Enforcement (Mocking invalid model output)
    it("5. Should catch and fail if model returns schema-violating data types", async () => {
        jest.spyOn(aiService, "extractReceiptData").mockRejectedValueOnce(
            new Error("Zod validation failed: Expected number, received string at totalAmount")
        );

        const res = await request(app)
            .post("/api/extract")
            .send({ rawText: "Test receipt" });

        expect(res.status).toBe(500);
        expect(res.body.error).toContain("Zod validation failed");
    });

    // Test 6: Timeout Simulation
    it("6. Should handle timeout scenarios gracefully", async () => {
        jest.spyOn(aiService, "extractReceiptData").mockRejectedValueOnce(
            new Error("AI Model Request Timed Out")
        );

        const res = await request(app)
            .post("/api/extract")
            .send({ rawText: "Slow receipt" });

        expect(res.status).toBe(500);
        expect(res.body.error).toContain("Timed Out");
    });

    // Test 7: Successful AI Extraction
    it("7. Should return a successful extraction payload when the AI service resolves", async () => {
        jest.spyOn(aiService, "extractReceiptData").mockResolvedValue({
            merchantName: "Swiggy",
            totalAmount: 450,
            currency: "INR",
            category: "Food",
            itemsSummary: ["Biryani"]
        });

        const res = await request(app)
            .post("/api/extract")
            .send({ rawText: "Swiggy bill 450 INR" });

        expect(res.status).toBe(200);
        expect(res.body.data.merchantName).toBe("Swiggy");
    });

    // Test 8: Max Retries Exceeded Failure Bubble-up
    it("8. Should fail with proper error message when max retries are exceeded", async () => {
        jest.spyOn(aiService, "extractReceiptData").mockRejectedValueOnce(
            new Error("Extraction failed after 3 attempts: Persistent network failure")
        );

        const res = await request(app)
            .post("/api/extract")
            .send({ rawText: "Broken API receipt" });

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain("Extraction failed after 3 attempts");
    });

});
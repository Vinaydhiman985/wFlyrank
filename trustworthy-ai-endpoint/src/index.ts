import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as aiService from "./aiService";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// The Required Endpoint
app.post("/api/extract", async (req: Request, res: Response) => {
    const { rawText } = req.body;

    if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({
            success: false,
            error: "Bad Request: Missing or invalid 'rawText' field."
        });
    }

    try {
        const data = await aiService.extractReceiptData(rawText);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal server error during LLM extraction."
        });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
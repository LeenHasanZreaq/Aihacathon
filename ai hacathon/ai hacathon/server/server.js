import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve a simple index from ./public to handle GET /
app.use(express.static("public"));

// Development Content Security Policy: allow same-origin, inline styles, and local connections
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; connect-src 'self' http://localhost:3000 ws:; style-src 'self' 'unsafe-inline'"
    );
    console.log("CSP middleware applied for", req.method, req.url);
    next();
});

// Use API_KEY from environment - supports both OpenAI and Gemini
const API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
const USE_OPENAI = !!process.env.OPENAI_API_KEY;

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    const tasks = req.body.tasks || [];

    if (!userMessage) {
        return res.status(400).json({ reply: "Message is empty" });
    }

    if (!API_KEY) {
        return res.status(500).json({ reply: "Server misconfigured: set OPENAI_API_KEY or GEMINI_API_KEY env var" });
    }

    try {
        let url, payload, headers;
        
        // Build system prompt with task context
        const taskContext = tasks.length > 0 
            ? `The user has the following tasks:\n${JSON.stringify(tasks, null, 2)}\n\nPlease consider these tasks when responding.`
            : "";

        if (USE_OPENAI) {
            // OpenAI API
            url = "https://api.openai.com/v1/chat/completions";
            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            };
            payload = {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `You are a helpful assistant. ${taskContext}` },
                    { role: "user", content: userMessage }
                ]
            };
        } else {
            // Google Gemini API (Free Tier)
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
            headers = { "Content-Type": "application/json" };
            payload = {
                contents: [
                    {
                        parts: [
                            { text: taskContext + "\n\nUser message: " + userMessage }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800
                }
            };
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        console.log("API response:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("API error:", data);
            return res.status(response.status).json({ reply: `API Error: ${data.error?.message || "Unknown error"}` });
        }

        // Extract reply based on API used
        const reply = USE_OPENAI
            ? data.choices?.[0]?.message?.content || "Could not extract response"
            : data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not extract response";

        res.json({ reply });
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ reply: `Error connecting to ${USE_OPENAI ? 'OpenAI' : 'Gemini'} API` });
    }
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});



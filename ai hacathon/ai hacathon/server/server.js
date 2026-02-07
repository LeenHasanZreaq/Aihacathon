// Simple Express server to handle chat requests and proxy them to OpenAI or Google Gemini API
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve a simple index from ./public to handle GET /
app.use(express.static("public"));

// Development Content Security Policy: allow same-origin, inline styles, and local connections
app.use((req, res, next) => {
    // In production, you should use a stricter CSP and serve the frontend from the same origin as the backend
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; connect-src 'self' http://localhost:3000 ws:; style-src 'self' 'unsafe-inline'"
    );
    // Log the CSP header for debugging purposes
    console.log("CSP middleware applied for", req.method, req.url);
    next();
});

// Use API_KEY from environment - supports both OpenAI and Gemini
const API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
const USE_OPENAI = !!process.env.OPENAI_API_KEY;

// Endpoint to handle chat messages
app.post("/chat", async (req, res) => {
    // The message from the user, sent in the request body as { message: "User's message", tasks: [...] }
    const userMessage = req.body.message;
    // Optional tasks array that the frontend can send to provide additional context for the assistant
    const tasks = req.body.tasks || [];

    // Basic validation
    if (!userMessage) {
        // If the message is empty, return a 400 Bad Request with an error message
        return res.status(400).json({ reply: "Message is empty" });
    }

    // Check if API_KEY is set, if not return a 500 Internal Server Error with an error message
    if (!API_KEY) {
        return res.status(500).json({ reply: "Server misconfigured: set OPENAI_API_KEY or GEMINI_API_KEY env var" });
    }

    // Log the incoming message and tasks for debugging purposes
    try {
        let url, payload, headers;
        
        // Build system prompt with task context if tasks are provided. This allows the assistant to consider the user's current tasks when generating a response.
        const taskContext = tasks.length > 0 
            ? `The user has the following tasks:\n${JSON.stringify(tasks, null, 2)}\n\nPlease consider these tasks when responding.`
            : "";

    // Depending on which API key is set, we will either call the OpenAI API or the Google Gemini API. 
    // The request payload and endpoint differ between the two APIs, so we construct them accordingly.

        if (USE_OPENAI) {
            // OpenAI API
            url = "https://api.openai.com/v1/chat/completions";
            headers = {
                // Set the Content-Type to application/json for both APIs. For OpenAI, we also need to include the Authorization header with the Bearer token.
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            };
            // For OpenAI, we use the chat completion format,
            //  where we provide a system message that includes the task context (if any) and a user message.
            //  The model used is gpt-3.5-turbo, which is a powerful language model suitable for conversational tasks.
            payload = {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `You are a helpful assistant. ${taskContext}` },
                    { role: "user", content: userMessage }
                ]
            };

            // Log the request payload for debugging purposes
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
                // The generationConfig allows us to control the behavior of the response generation.
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800
                }
            };
        }

        // Log the API request details for debugging purposes
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });

        // Parse the API response as JSON. If parsing fails,
        //  we catch the error and use an empty object to avoid crashing the server.
        const data = await response.json().catch(() => ({}));
        console.log("API response:", JSON.stringify(data, null, 2));

        // Check if the API response is not OK (status code outside the 200-299 range). 
        // If it's not OK, we log the error and return a JSON response with an error message.
        if (!response.ok) {
            console.error("API error:", data);
            return res.status(response.status).json({ reply: `API Error: ${data.error?.message || "Unknown error"}` });
        }

        // Extract reply based on API used - for OpenAI, we look for the content of the first message in the choices array.
        // For Gemini, we look for the text in the first part of the candidates array. If we can't extract a response, we return a default error message.
        const reply = USE_OPENAI
            ? data.choices?.[0]?.message?.content || "Could not extract response"
            : data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not extract response";

            // Log the extracted reply for debugging purposes
        res.json({ reply });
    } 
    
    // If any error occurs during the API call or response processing, 
    // we catch it,
    //  log the error for debugging purposes, and return a 500 Internal Server Error with a JSON response containing an error message.

    catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ reply: `Error connecting to ${USE_OPENAI ? 'OpenAI' : 'Gemini'} API` });
    }
});


// Start the server on port 3000 and log a message to the console indicating that the server is running and providing the URL to access it.
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});



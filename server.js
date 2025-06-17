import express from "express";
import fetch from "node-fetch";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public")); // serve your HTML/CSS/JS

// 🔁 GPT summary endpoint (used by your frontend)
app.post("/api/gpt-summary", async (req, res) => {
  const { prompt } = req.body;

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You're a friendly assistant who summarizes tutor preferences warmly and helpfully.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      },
    );

    const data = await openaiRes.json();
    res.json(data);
  } catch (err) {
    console.error("❌ OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Simple test endpoint to verify OpenAI setup
app.get("/test", async (req, res) => {
  const testPrompt =
    "Give a friendly one-line description of a tutor who is calm, structured, and clear.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You're a friendly assistant who summarizes tutor preferences warmly and helpfully.",
          },
          { role: "user", content: testPrompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || "⚠️ No response from OpenAI";
    res.send(reply);
  } catch (err) {
    console.error("❌ Test OpenAI error:", err);
    res.status(500).send("Test OpenAI call failed");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`),
);

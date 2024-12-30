import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "GPT-4o", // Updated to a supported model
        messages: [{ role: "user", content: prompt }], // Chat format
        max_tokens: 100, // Limit the response length
        temperature: 0.7, // Adjust response creativity
      }),
    });
  
    const data = await response.json();
    console.log("OpenAI API Response:", data);
  
    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      return res
        .status(response.status)
        .json({ error: data.error?.message || "Error from OpenAI" });
    }
  
    const text = data.choices?.[0]?.message?.content || "No response";
  
    res.status(200).json({ text });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  
  
}

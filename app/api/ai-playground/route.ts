import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // keep secret
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // faster and cheaper for demos
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant demonstrating Deepak Kumar's AI integration capabilities in React and Node.js applications.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return Response.json({
      response: completion.choices[0]?.message?.content || "",
    });
  } catch (error) {
    console.error("AI API Error:", error);

    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
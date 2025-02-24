import OpenAI from "openai";
import { NextResponse, NextRequest } from "next/server";

// Debugging: Log the API key to check if it's being picked up
console.log("Current OpenAI API Key:", process.env.OPENAI_API_KEY);

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

// Initialize OpenAI client (No need to pass the key manually)
const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { title, contentSnippet } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides friendly, conversational summaries of articles. Keep your responses concise but engaging.Give me a fun fact at last and give me comma seperated words at last important",
        },
        {
          role: "user",
          content: `Please provide a friendly summary of this article:\nTitle: ${title}\n${contentSnippet ? `Content: ${contentSnippet}` : ""}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract and validate response
    const summary = completion.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      return NextResponse.json({ error: "No summary generated" }, { status: 500 });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate summary" },
      { status: 500 }
    );
  }
}

// Optional: Use Edge Runtime for performance (Vercel deployment)
export const config = { runtime: "edge" };

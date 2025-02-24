import OpenAI from "openai";
import { NextResponse, NextRequest } from "next/server";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

// Initialize OpenAI client
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

    // Call OpenAI API for article analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that analyzes article content. Provide analysis in JSON format with the following fields: categories (array of 3 main categories), sentiment (positive, negative, or neutral), keywords (array of 5 most relevant keywords), readingTimeMinutes (estimated reading time).",
        },
        {
          role: "user",
          content: `Analyze this article and return JSON data only:\nTitle: ${title}\n${contentSnippet ? `Content: ${contentSnippet}` : ""}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500,
    });

    // Extract and validate response
    const analysisText = completion.choices?.[0]?.message?.content?.trim();
    if (!analysisText) {
      return NextResponse.json({ error: "No analysis generated" }, { status: 500 });
    }

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse analysis" }, { status: 500 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze article" },
      { status: 500 }
    );
  }
}

// Use Edge Runtime for performance (Vercel deployment)
export const config = { runtime: "edge" };
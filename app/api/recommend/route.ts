import OpenAI from "openai";
import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import type { Article } from "@/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

// Initialize OpenAI client
const openai = new OpenAI();

// Load all articles from all feeds for recommendation
async function getAllArticles(): Promise<Article[]> {
  try {
    // Get feeds
    const feedsPath = path.join(process.cwd(), "data", "feeds.json");
    const feedsData = await fs.promises.readFile(feedsPath, "utf8");
    const feeds = JSON.parse(feedsData);
    
    // For simplicity in this example, we're using local data.
    // In a real implementation, you would fetch articles from all feeds
    // and store them in a database for faster access.
    
    // Return a sample of articles for demonstration
    return [
      {
        title: "The Future of AI in Content Curation",
        link: "https://example.com/article1",
        pubDate: new Date().toISOString(),
        contentSnippet: "AI is transforming how we discover and consume content online.",
        guid: "article1"
      },
      {
        title: "Latest Developments in Web Technologies",
        link: "https://example.com/article2",
        pubDate: new Date().toISOString(),
        contentSnippet: "New frameworks and tools are changing web development.",
        guid: "article2"
      },
      {
        title: "Understanding RSS Technology",
        link: "https://example.com/article3",
        pubDate: new Date().toISOString(),
        contentSnippet: "RSS remains relevant for content distribution despite newer technologies.",
        guid: "article3"
      }
    ];
  } catch (error) {
    console.error("Error loading articles:", error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { articleId, userPreferences, recentlyRead } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    // Get all available articles
    const allArticles = await getAllArticles();
    
    // Find the current article
    // In a real implementation, you would query this from a database
    const currentArticle = allArticles.find(a => a.guid === articleId) || {
      title: "Unknown Article",
      contentSnippet: ""
    };

    // Call OpenAI API for recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI recommendation engine. Based on an article and user preferences, recommend similar articles from the available collection. Return JSON with an array of recommended article IDs and a brief explanation for each recommendation.",
        },
        {
          role: "user",
          content: `Current article: ${currentArticle.title}\n${currentArticle.contentSnippet}\n\nUser preferences: ${JSON.stringify(userPreferences || {})}\n\nRecently read: ${JSON.stringify(recentlyRead || [])}\n\nAvailable articles: ${JSON.stringify(allArticles.map(a => ({ id: a.guid, title: a.title, snippet: a.contentSnippet })))}`
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 500,
    });

    // Extract recommendations
    const recommendationsText = completion.choices?.[0]?.message?.content?.trim();
    if (!recommendationsText) {
      return NextResponse.json({ error: "No recommendations generated" }, { status: 500 });
    }

    // Parse JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse recommendations" }, { status: 500 });
    }

    return NextResponse.json({
      recommendations,
      // Include full article objects for the recommended IDs
      articles: allArticles.filter(article => 
        recommendations.recommendedArticles?.includes(article.guid)
      )
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

// Use Edge Runtime for performance (Vercel deployment)
export const config = { runtime: "edge" };
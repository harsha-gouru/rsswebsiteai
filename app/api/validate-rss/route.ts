import { NextResponse, NextRequest } from "next/server"
import Parser from "rss-parser"

const parser = new Parser()

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Try to validate URL format
    try {
      new URL(url)
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Try to fetch and parse the RSS feed
    try {
      const feed = await parser.parseURL(url)
      
      // Return feed information
      return NextResponse.json({
        title: feed.title || "Untitled Feed",
        description: feed.description || "",
        link: feed.link || url,
        items: feed.items?.length || 0,
        isValid: true
      })
    } catch (error) {
      console.error("RSS parsing error:", error)
      return NextResponse.json(
        { 
          error: "Could not parse RSS feed from this URL. Please check the URL and try again.",
          isValid: false
        },
        { status: 422 }
      )
    }
  } catch (error) {
    console.error("Validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate feed" },
      { status: 500 }
    )
  }
}

// Use Edge Runtime for performance
export const config = { runtime: "edge" }
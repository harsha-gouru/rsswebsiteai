import { NextResponse } from "next/server"
import Parser from "rss-parser"

const parser = new Parser({
  headers: {
    Accept: "application/rss+xml, application/xml, application/atom+xml",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
  timeout: 10000,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const feedUrl = searchParams.get("feedUrl")

  if (!feedUrl) {
    return NextResponse.json({ error: "Feed URL is required" }, { status: 400 })
  }

  try {
    // First try to fetch the feed content
    const response = await fetch(feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/xml, application/atom+xml",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const feedContent = await response.text()

    // Then parse the feed content
    const feed = await parser.parseString(feedContent)

    // Transform and validate the feed items
    const articles = feed.items.map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "#",
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet || item.description || "",
      guid: item.guid || item.id || item.link || Math.random().toString(36).substring(7),
    }))

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Error fetching feed:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch feed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}


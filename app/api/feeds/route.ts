import { NextResponse, NextRequest } from "next/server"
import fs from "fs"
import path from "path"
import type { Feed } from "@/types"

// Helper function to read the feeds file
const getFeeds = (): Feed[] => {
  const filePath = path.join(process.cwd(), "data", "feeds.json")
  const fileContents = fs.readFileSync(filePath, "utf8")
  return JSON.parse(fileContents)
}

// Helper function to write to the feeds file
const writeFeeds = (feeds: Feed[]): void => {
  const filePath = path.join(process.cwd(), "data", "feeds.json")
  fs.writeFileSync(filePath, JSON.stringify(feeds, null, 2), "utf8")
}

export async function GET() {
  try {
    const feeds = getFeeds()
    return NextResponse.json(feeds)
  } catch (error) {
    console.error("Error fetching feeds:", error)
    return NextResponse.json({ error: "Failed to fetch feeds" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, title } = await req.json()

    // Validate inputs
    if (!url || !title) {
      return NextResponse.json(
        { error: "URL and title are required" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Get existing feeds
    const feeds = getFeeds()

    // Check if feed already exists
    if (feeds.some(feed => feed.url === url)) {
      return NextResponse.json(
        { error: "This feed URL already exists" },
        { status: 409 }
      )
    }

    // Add new feed
    const newFeed: Feed = { url, title }
    feeds.push(newFeed)

    // Save updated feeds
    writeFeeds(feeds)

    return NextResponse.json(newFeed, { status: 201 })
  } catch (error) {
    console.error("Error adding feed:", error)
    return NextResponse.json(
      { error: "Failed to add feed" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Get existing feeds
    const feeds = getFeeds()
    
    // Check if feed exists
    const feedIndex = feeds.findIndex(feed => feed.url === url)
    if (feedIndex === -1) {
      return NextResponse.json(
        { error: "Feed not found" },
        { status: 404 }
      )
    }

    // Remove feed
    const removedFeed = feeds.splice(feedIndex, 1)[0]
    
    // Save updated feeds
    writeFeeds(feeds)

    return NextResponse.json(removedFeed)
  } catch (error) {
    console.error("Error deleting feed:", error)
    return NextResponse.json(
      { error: "Failed to delete feed" },
      { status: 500 }
    )
  }
}


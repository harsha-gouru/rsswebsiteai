import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "feeds.json")
  const fileContents = fs.readFileSync(filePath, "utf8")
  const feeds = JSON.parse(fileContents)
  return NextResponse.json(feeds)
}


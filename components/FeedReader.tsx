"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FeedList from "./FeedList"
import ArticleList from "./ArticleList"
import type { Feed, Article } from "../types"

export default function FeedReader() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/feeds")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error("Invalid feed data received")
      }
      setFeeds(data)
    } catch (error) {
      setError("Failed to load feeds. Please try again later.")
      console.error("Error fetching feeds:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedSelect = async (feed: Feed) => {
    setSelectedFeed(feed)
    setIsLoading(true)
    setError(null)
    setArticles([]) // Clear current articles while loading

    try {
      const response = await fetch(`/api/articles?feedUrl=${encodeURIComponent(feed.url)}`)
      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid article data received")
      }

      setArticles(data)
      router.push(`/?feed=${encodeURIComponent(feed.url)}`)
    } catch (error) {
      setError(
        error instanceof Error
          ? `Failed to load articles: ${error.message}`
          : "Failed to load articles. Please try again later.",
      )
      console.error("Error fetching articles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <FeedList feeds={feeds} onSelectFeed={handleFeedSelect} selectedFeed={selectedFeed} isLoading={isLoading} />
      {error ? (
        <div className="w-full md:w-2/3 bg-secondary text-primary p-4 rounded">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => (selectedFeed ? handleFeedSelect(selectedFeed) : fetchFeeds())}
            className="px-4 py-2 bg-primary text-secondary rounded hover:bg-accent"
          >
            Try Again
          </button>
        </div>
      ) : isLoading ? (
        <div className="w-full md:w-2/3 bg-secondary text-primary p-4 rounded">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <p>Loading...</p>
          </div>
        </div>
      ) : (
        <ArticleList articles={articles} />
      )}
    </div>
  )
}


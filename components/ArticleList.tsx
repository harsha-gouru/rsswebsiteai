"use client"

import type React from "react"

import { useState } from "react"
import type { Article } from "../types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface ArticleListProps {
  articles: Article[]
}

interface SummaryResponse {
  summary?: string
  error?: string
}

export default function ArticleList({ articles }: ArticleListProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleArticleClick = async (e: React.MouseEvent, article: Article) => {
    e.preventDefault()
    setSelectedArticle(article)
    setIsLoading(true)
    setError(null)
    setSummary("")

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          contentSnippet: article.contentSnippet || "",
        }),
      })

      let data: SummaryResponse

      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Parse error:", parseError)
        throw new Error("Failed to parse server response")
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate summary")
      }

      if (!data.summary) {
        throw new Error("No summary received")
      }

      setSummary(data.summary)
    } catch (error) {
      console.error("Error fetching summary:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred while generating the summary")
      setSelectedArticle(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (articles.length === 0) {
    return (
      <div className="w-full md:w-2/3 bg-secondary text-primary p-4 rounded">
        <p className="text-muted-foreground">Select a feed to view articles</p>
      </div>
    )
  }

  return (
    <div className="w-full md:w-2/3 bg-secondary text-primary p-4 rounded">
      <h2 className="text-xl font-bold mb-4">Articles</h2>
      <div className="grid gap-4">
        {selectedArticle && !error && (
          <Card className="p-4 mb-4 bg-primary text-secondary">
            <h3 className="font-bold mb-2">Article Summary</h3>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div>
                <p>Generating summary...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm whitespace-pre-line space-y-2">
                  <p>{summary}</p>
                </div>
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setSelectedArticle(null)}>
                    Back to List
                  </Button>
                  <Button variant="secondary" onClick={() => window.open(selectedArticle.link, "_blank")}>
                    Read Full Article
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}
        {error && (
          <Card className="p-4 mb-4 bg-destructive text-destructive-foreground">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setError(null)
                setSelectedArticle(null)
              }}
              className="mt-2"
            >
              Dismiss
            </Button>
          </Card>
        )}
        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.guid} className="border-b border-gray-200 pb-4 last:border-0">
              <h3 className="text-lg font-bold hover:text-accent">
                <a href={article.link} onClick={(e) => handleArticleClick(e, article)} className="hover:underline">
                  {article.title}
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {new Date(article.pubDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {article.contentSnippet && (
                <p className="text-sm text-muted-foreground line-clamp-3">{article.contentSnippet}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


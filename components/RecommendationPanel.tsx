"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Article, ArticleRecommendation } from "@/types"
import { Lightbulb, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RecommendationPanelProps {
  currentArticle: Article
  userPreferences?: any
  onSelectArticle: (article: Article) => void
}

export default function RecommendationPanel({ 
  currentArticle, 
  userPreferences,
  onSelectArticle 
}: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<ArticleRecommendation | null>(null)
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Track recently read articles (could be expanded to use localStorage for persistence)
  const [recentlyRead, setRecentlyRead] = useState<string[]>([])
  
  useEffect(() => {
    // When the current article changes, add it to recently read
    if (currentArticle?.guid && !recentlyRead.includes(currentArticle.guid)) {
      setRecentlyRead(prev => [currentArticle.guid, ...prev].slice(0, 10))
    }
  }, [currentArticle, recentlyRead])
  
  const fetchRecommendations = async () => {
    if (!currentArticle?.guid) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId: currentArticle.guid,
          userPreferences,
          recentlyRead
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get recommendations")
      }
      
      const data = await response.json()
      setRecommendations(data.recommendations)
      setRecommendedArticles(data.articles || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get recommendations")
      console.error("Error getting recommendations:", err)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    // Reset recommendations when the current article changes
    setRecommendations(null)
    setRecommendedArticles([])
    
    // Automatically fetch recommendations for the new article
    if (currentArticle?.guid) {
      fetchRecommendations()
    }
  }, [currentArticle])
  
  if (!currentArticle) {
    return null
  }
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Related Articles
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on your reading
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-3">{error}</p>
            <Button onClick={fetchRecommendations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : recommendedArticles.length > 0 ? (
          <div className="space-y-3">
            {recommendedArticles.map((article) => (
              <TooltipProvider key={article.guid}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="p-3 border rounded-md cursor-pointer hover:bg-secondary"
                      onClick={() => onSelectArticle(article)}
                    >
                      <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {article.contentSnippet}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {recommendations?.explanations?.[article.guid] || 
                        "Recommended based on your current article"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ) : recommendations ? (
          <p className="text-center py-4 text-gray-500">
            No recommendations found for this article.
          </p>
        ) : (
          <div className="text-center py-4">
            <Button onClick={fetchRecommendations}>
              Get Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
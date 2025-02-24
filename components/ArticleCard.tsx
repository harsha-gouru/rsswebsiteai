"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Article, ArticleAnalysis } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  BookOpen, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  ThumbsDown, 
  ThumbsUp, 
  HelpCircle,
  Tag
} from "lucide-react"

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  const analyzeArticle = async () => {
    if (analysis) return // Don't re-analyze if we already have data
    
    setIsLoadingAnalysis(true)
    setError(null)
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          contentSnippet: article.contentSnippet,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze article")
      }
      
      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      console.error("Error analyzing article:", err)
    } finally {
      setIsLoadingAnalysis(false)
    }
  }

  const getSummary = async () => {
    if (summary) return // Don't summarize if we already have data
    
    setIsLoadingSummary(true)
    setError(null)
    
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          contentSnippet: article.contentSnippet,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get summary")
      }
      
      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      console.error("Error getting summary:", err)
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="text-green-500" />
      case "negative":
        return <ThumbsDown className="text-red-500" />
      default:
        return <HelpCircle className="text-gray-500" />
    }
  }

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {article.title}
        </CardTitle>
        <CardDescription className="flex items-center mt-2 text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {formatDate(article.pubDate)}
          {analysis && (
            <span className="ml-2 flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {analysis.readingTimeMinutes} min read
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="summary" onClick={getSummary}>AI Summary</TabsTrigger>
            <TabsTrigger value="analysis" onClick={analyzeArticle}>AI Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content">
            <p className="text-gray-700">{article.contentSnippet}</p>
          </TabsContent>
          
          <TabsContent value="summary">
            {isLoadingSummary ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : summary ? (
              <div className="prose">
                <p className="text-gray-700">{summary}</p>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="text-center py-4">
                <Button onClick={getSummary}>Generate AI Summary</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis">
            {isLoadingAnalysis ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <Tag className="h-4 w-4 mr-1" />
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.categories.map((category, i) => (
                      <Badge key={i} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Sentiment
                  </h4>
                  <div className="flex items-center mt-1">
                    {getSentimentIcon(analysis.sentiment)}
                    <span className="ml-1 capitalize">{analysis.sentiment}</span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="text-center py-4">
                <Button onClick={analyzeArticle}>Analyze with AI</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <a 
          href={article.link} 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          Read Full Article
          <ExternalLink className="h-4 w-4 ml-1" />
        </a>
      </CardFooter>
    </Card>
  )
}
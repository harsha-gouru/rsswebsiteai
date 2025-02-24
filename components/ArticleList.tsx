"use client"

import type React from "react"

import { useState } from "react"
import type { Article, ArticleAnalysis, UserPreferences } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Settings, RefreshCw, Lightbulb, Tag, BarChart3, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ArticleCard from "@/components/ArticleCard"

interface ArticleListProps {
  articles: Article[]
}

interface SummaryResponse {
  summary?: string
  error?: string
}

interface AnalysisResponse {
  categories?: string[]
  sentiment?: "positive" | "negative" | "neutral"
  keywords?: string[]
  readingTimeMinutes?: number
  error?: string
}

export default function ArticleList({ articles }: ArticleListProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("content")
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    preferredCategories: ["Technology", "News", "Science"],
    readingLevel: "intermediate",
    maxReadingTime: 10,
    interests: []
  })
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)

  const handleArticleClick = async (e: React.MouseEvent, article: Article) => {
    e.preventDefault()
    setSelectedArticle(article)
    setActiveTab("content")
    setError(null)
    setSummary("")
    setAnalysis(null)
    
    // Clear previous recommendations when selecting a new article
    setRecommendedArticles([])
    
    // Fetch recommendations for the new article
    fetchRecommendations(article)
  }

  const getSummary = async (article: Article) => {
    if (summary) return
    
    setIsLoadingSummary(true)
    setError(null)
    
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
    } finally {
      setIsLoadingSummary(false)
    }
  }
  
  const getAnalysis = async (article: Article) => {
    if (analysis) return
    
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
          contentSnippet: article.contentSnippet || "",
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze article")
      }
      
      const data: AnalysisResponse = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (!data.categories || !data.keywords || !data.sentiment) {
        throw new Error("Incomplete analysis data received")
      }
      
      setAnalysis({
        categories: data.categories,
        keywords: data.keywords,
        sentiment: data.sentiment,
        readingTimeMinutes: data.readingTimeMinutes || 3
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze article")
      console.error("Error analyzing article:", err)
    } finally {
      setIsLoadingAnalysis(false)
    }
  }
  
  const fetchRecommendations = async (article: Article) => {
    setIsLoadingRecommendations(true)
    
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId: article.guid,
          userPreferences
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to get recommendations")
      }
      
      const data = await response.json()
      
      // Find the articles from our articles list that match the recommended article IDs
      const recommended = articles.filter(a => 
        data.recommendations?.recommendedArticles?.includes(a.guid) &&
        a.guid !== article.guid
      )
      
      setRecommendedArticles(recommended)
    } catch (err) {
      console.error("Error getting recommendations:", err)
      // Don't show error for recommendations as it's not critical
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "text-green-500"
      case "negative": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  if (articles.length === 0) {
    return (
      <div className="w-full md:w-2/3 bg-secondary text-primary p-4 rounded">
        <p className="text-muted-foreground">Select a feed to view articles</p>
      </div>
    )
  }

  // The current article is either the one selected by the user or the first one in the list
  const currentArticle = selectedArticle || articles[0]

  return (
    <div className="w-full md:w-2/3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Articles</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-secondary text-primary border-2 border-primary">
            <DialogHeader>
              <DialogTitle className="text-primary">Reading Preferences</DialogTitle>
              <DialogDescription className="text-primary opacity-80">
                Customize your reading experience and recommendations
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-primary">Preferred Categories</h3>
                <div className="space-y-2">
                  {["Technology", "News", "Science", "Business", "Health"].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`} 
                        checked={userPreferences.preferredCategories?.includes(category)}
                        onCheckedChange={(checked) => {
                          const newCategories = checked 
                            ? [...(userPreferences.preferredCategories || []), category]
                            : (userPreferences.preferredCategories || []).filter(c => c !== category)
                          
                          setUserPreferences({
                            ...userPreferences,
                            preferredCategories: newCategories
                          })
                        }}
                      />
                      <Label htmlFor={`category-${category}`} className="text-primary">{category}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 text-primary">Reading Level</h3>
                <RadioGroup 
                  value={userPreferences.readingLevel}
                  onValueChange={(value) => 
                    setUserPreferences({
                      ...userPreferences, 
                      readingLevel: value as "beginner" | "intermediate" | "advanced"
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="text-primary">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="text-primary">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="text-primary">Advanced</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 text-primary">Max Reading Time (minutes)</h3>
                <Input 
                  type="number"
                  min="1"
                  max="60"
                  value={userPreferences.maxReadingTime || 10}
                  onChange={(e) => 
                    setUserPreferences({
                      ...userPreferences,
                      maxReadingTime: parseInt(e.target.value)
                    })
                  }
                  className="bg-white dark:bg-gray-800 text-primary"
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 text-primary">Interests (comma separated)</h3>
                <Input 
                  type="text"
                  placeholder="AI, programming, climate change"
                  value={userPreferences.interests?.join(", ") || ""}
                  onChange={(e) => 
                    setUserPreferences({
                      ...userPreferences,
                      interests: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    })
                  }
                  className="bg-white dark:bg-gray-800 text-primary"
                />
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => {
                // Force refresh recommendations with new preferences
                if (currentArticle) {
                  fetchRecommendations(currentArticle)
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Preferences
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Main Article Card */}
      <Card className="mb-4 bg-secondary p-4">
        <h3 className="text-xl font-bold mb-2">{currentArticle.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {new Date(currentArticle.pubDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {analysis && (
            <span className="ml-2 inline-flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {analysis.readingTimeMinutes} min read
            </span>
          )}
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="summary" onClick={() => getSummary(currentArticle)}>
              AI Summary
            </TabsTrigger>
            <TabsTrigger value="analysis" onClick={() => getAnalysis(currentArticle)}>
              AI Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content">
            <p className="text-gray-700 mb-4">{currentArticle.contentSnippet}</p>
          </TabsContent>
          
          <TabsContent value="summary">
            {isLoadingSummary ? (
              <div className="flex items-center space-x-2 py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <p>Generating summary...</p>
              </div>
            ) : summary ? (
              <div className="mb-4 text-sm whitespace-pre-line space-y-2">
                <p>{summary}</p>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 text-red-500 mb-4">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Button onClick={() => getSummary(currentArticle)}>
                  Generate AI Summary
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis">
            {isLoadingAnalysis ? (
              <div className="flex items-center space-x-2 py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <p>Analyzing article...</p>
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
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    Sentiment
                  </h4>
                  <p className={`capitalize ${getSentimentColor(analysis.sentiment)}`}>
                    {analysis.sentiment}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 text-red-500 mb-4">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Button onClick={() => getAnalysis(currentArticle)}>
                  Analyze with AI
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <a 
            href={currentArticle.link} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Read full article
          </a>
        </div>
      </Card>
      
      {/* Recommendations Panel */}
      {recommendedArticles.length > 0 && (
        <Card className="mb-6 p-4">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            <h3 className="text-lg font-bold">Recommended Articles</h3>
          </div>
          
          <div className="space-y-3">
            {recommendedArticles.map((article) => (
              <div 
                key={article.guid} 
                className="p-3 border rounded-md cursor-pointer hover:bg-secondary/80"
                onClick={(e) => handleArticleClick(e, article)}
              >
                <h4 className="font-medium text-sm">{article.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {article.contentSnippet}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Article List */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold">All Articles</h3>
        <ul className="space-y-6">
          {articles.map((article) => (
            article.guid !== currentArticle.guid && (
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
            )
          ))}
        </ul>
      </div>
    </div>
  )
}


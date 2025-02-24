export interface Feed {
  url: string
  title: string
}

export interface Article {
  title: string
  link: string
  pubDate: string
  contentSnippet: string
  guid: string
}

export interface ArticleAnalysis {
  categories: string[]
  sentiment: "positive" | "negative" | "neutral"
  keywords: string[]
  readingTimeMinutes: number
}

export interface ArticleRecommendation {
  recommendedArticles: string[]
  explanations: {
    [articleId: string]: string
  }
}

export interface UserPreferences {
  preferredCategories?: string[]
  readingLevel?: "beginner" | "intermediate" | "advanced"
  maxReadingTime?: number
  interests?: string[]
}


"use client"

import { useState } from "react"
import type { Feed } from "@/types"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2, Rss, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FeedListProps {
  feeds: Feed[]
  onSelectFeed: (feed: Feed) => void
  selectedFeed: Feed | null
  isLoading: boolean
}

export default function FeedList({ feeds, onSelectFeed, selectedFeed, isLoading }: FeedListProps) {
  const [showAddFeedDialog, setShowAddFeedDialog] = useState(false)
  const [newFeedUrl, setNewFeedUrl] = useState("")
  const [newFeedTitle, setNewFeedTitle] = useState("")
  const [isAddingFeed, setIsAddingFeed] = useState(false)
  const [feedAddSuccess, setFeedAddSuccess] = useState(false)
  const [feedAddError, setFeedAddError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [feedToDelete, setFeedToDelete] = useState<Feed | null>(null)
  const [isDeletingFeed, setIsDeletingFeed] = useState(false)
  
  const validateRssFeed = async (url: string) => {
    try {
      const response = await fetch("/api/validate-rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to validate feed")
      }
      
      return data
    } catch (err) {
      console.error("Error validating feed:", err)
      throw err
    }
  }
  
  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset states
    setFeedAddSuccess(false)
    setFeedAddError(null)
    setIsAddingFeed(true)
    
    try {
      // Validate inputs
      if (!newFeedUrl.trim()) {
        throw new Error("Please provide a feed URL")
      }
      
      // Check if URL is valid
      try {
        new URL(newFeedUrl)
      } catch (e) {
        throw new Error("Please enter a valid URL")
      }
      
      // Validate RSS feed
      const feedValidation = await validateRssFeed(newFeedUrl)
      
      if (!feedValidation.isValid) {
        throw new Error(feedValidation.error || "Invalid RSS feed")
      }
      
      // Use the title from the feed if no title was provided
      const feedTitle = newFeedTitle.trim() || feedValidation.title || "Untitled Feed"
      
      // Add the feed
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newFeedUrl, title: feedTitle })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add feed")
      }
      
      // Success! Clear form and show success message
      setFeedAddSuccess(true)
      setNewFeedUrl("")
      setNewFeedTitle("")
      
      // Close dialog after a short delay
      setTimeout(() => {
        setShowAddFeedDialog(false)
        setFeedAddSuccess(false)
      }, 1500)
      
    } catch (err) {
      console.error("Error adding feed:", err)
      setFeedAddError(err instanceof Error ? err.message : "Failed to add feed")
    } finally {
      setIsAddingFeed(false)
    }
  }
  
  const handleDeleteFeed = async (feed: Feed) => {
    setFeedToDelete(feed)
    setShowDeleteConfirm(true)
  }
  
  const confirmDeleteFeed = async () => {
    if (!feedToDelete) return
    
    setIsDeletingFeed(true)
    
    try {
      const response = await fetch("/api/feeds", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedToDelete.url })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete feed")
      }
      
      // Close dialog
      setShowDeleteConfirm(false)
      setFeedToDelete(null)
      
    } catch (err) {
      console.error("Error deleting feed:", err)
      // Show error to user
      setFeedAddError(err instanceof Error ? err.message : "Failed to delete feed")
    } finally {
      setIsDeletingFeed(false)
    }
  }
  
  // Helper to check if a URL is valid
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString)
      return true
    } catch (e) {
      return false
    }
  }
  
  // Preview component to show during URL input
  const UrlPreview = () => {
    if (!newFeedUrl) return null
    
    return (
      <div className="mt-2">
        {isValidUrl(newFeedUrl) ? (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs">Valid URL format</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1 border-red-300">
            <AlertCircle className="h-3 w-3 text-red-500" />
            <span className="text-xs">Invalid URL format</span>
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="w-full md:w-1/3 bg-primary text-secondary p-4 rounded h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Rss className="mr-2 h-5 w-5" />
          RSS Feeds
        </h2>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setShowAddFeedDialog(true)}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Feed
        </Button>
      </div>
      
      {feeds.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm mb-4">No feeds available</p>
          <Button 
            variant="secondary" 
            onClick={() => setShowAddFeedDialog(true)}
            className="flex items-center mx-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Your First Feed
          </Button>
        </div>
      ) : (
        <ul className="space-y-1">
          {feeds.map((feed) => (
            <li key={feed.url} className="flex items-center group">
              <button
                disabled={isLoading}
                className={`flex-grow text-left p-2 rounded-md transition-colors hover:bg-accent ${
                  selectedFeed?.url === feed.url
                    ? "bg-accent"
                    : ""
                } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => onSelectFeed(feed)}
              >
                {feed.title}
              </button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFeed(feed)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove feed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      )}
      
      {/* Add Feed Dialog */}
      <Dialog open={showAddFeedDialog} onOpenChange={setShowAddFeedDialog}>
        <DialogContent className="bg-secondary text-primary border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" /> 
              Add RSS Feed
            </DialogTitle>
            <DialogDescription className="text-primary opacity-80">
              Add a new RSS feed to your reader
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddFeed}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="feed-url" className="text-primary">Feed URL</Label>
                <Input
                  id="feed-url"
                  placeholder="https://example.com/feed.xml"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="bg-white dark:bg-gray-800 text-primary"
                />
                <UrlPreview />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feed-title" className="text-primary">
                  Feed Title <span className="text-xs text-primary/60">(optional - will use feed's title if blank)</span>
                </Label>
                <Input
                  id="feed-title"
                  placeholder="My Awesome Feed"
                  value={newFeedTitle}
                  onChange={(e) => setNewFeedTitle(e.target.value)}
                  className="bg-white dark:bg-gray-800 text-primary"
                />
              </div>
              
              {feedAddSuccess && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Feed added successfully!</AlertDescription>
                </Alert>
              )}
              
              {feedAddError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{feedAddError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddFeedDialog(false)}
                disabled={isAddingFeed}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingFeed}>
                {isAddingFeed ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>Add Feed</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-secondary text-primary border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="text-primary">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-primary opacity-80">
              Are you sure you want to remove this feed?
            </DialogDescription>
          </DialogHeader>
          
          {feedToDelete && (
            <div className="py-4">
              <p className="font-medium">{feedToDelete.title}</p>
              <p className="text-sm text-primary/70 truncate">{feedToDelete.url}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeletingFeed}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteFeed}
              disabled={isDeletingFeed}
            >
              {isDeletingFeed ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


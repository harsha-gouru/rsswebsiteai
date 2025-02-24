import type { Feed } from "@/types"

interface FeedListProps {
  feeds: Feed[]
  onSelectFeed: (feed: Feed) => void
  selectedFeed: Feed | null
  isLoading: boolean
}

export default function FeedList({ feeds, onSelectFeed, selectedFeed, isLoading }: FeedListProps) {
  return (
    <div className="w-full md:w-1/3 bg-primary text-secondary p-4 rounded">
      <h2 className="text-xl font-bold mb-4">Feeds</h2>
      {feeds.length === 0 && !isLoading ? (
        <p className="text-sm">No feeds available</p>
      ) : (
        <ul className="space-y-1">
          {feeds.map((feed) => (
            <li
              key={feed.url}
              className={`cursor-pointer p-2 hover:bg-accent transition-colors ${
                selectedFeed?.url === feed.url ? "bg-accent" : ""
              } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => onSelectFeed(feed)}
            >
              {feed.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


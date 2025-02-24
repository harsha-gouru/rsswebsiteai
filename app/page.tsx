import { Suspense } from "react"
import FeedReader from "../components/FeedReader"

export default function Home() {
  return (
    <main className="min-h-screen bg-secondary text-primary font-mono p-4">
      <h1 className="text-2xl font-bold mb-4">Retro RSS Reader</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <FeedReader />
      </Suspense>
    </main>
  )
}


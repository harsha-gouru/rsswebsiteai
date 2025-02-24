import { OpenAIClient } from "@/node_modules/ai"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

export const openaiClient = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})


import OpenAI from 'openai'

// Single instance of OpenAI client
let _openai: OpenAI | null = null

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Please add it to .env.local')
  }

  if (!_openai) {
    const isGroq = process.env.OPENAI_API_KEY.startsWith('gsk_')
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      ...(isGroq ? { baseURL: 'https://api.groq.com/openai/v1' } : {})
    })
  }

  return _openai
}

export const OPENAI_AVAILABLE = Boolean(process.env.OPENAI_API_KEY)

import { type NextRequest, NextResponse } from "next/server"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { logger } from "@/lib/logger"

const OPENROUTER_API_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free"
const MAX_RETRIES = 2
const DEFAULT_BACKOFF_MS = 800
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(req, RATE_LIMITS.CHAT)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { messages } = await req.json()
    
    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Add system prompt for school context
    const systemMessage = {
      role: "system",
      content: `You are MMW Hubix AI Assistant, a helpful AI for students and staff at the school. You can help with:
      - Campus navigation and building locations
      - School schedules and bell times
      - Important dates and events
      - Basic IT support and troubleshooting
      - School policies and procedures
      - General academic assistance
      
      Keep responses concise, helpful, and school-appropriate. If you don't know something specific about the school, acknowledge it and suggest contacting the appropriate office.`,
    }

    const tm = process.env.TEST_MODE
    const ne = process.env.NODE_ENV
    if (!process.env.OPENROUTER_API_KEY) {
      if (tm === 'true' || ne === 'test') {
        return NextResponse.json({ message: "[TEST MODE] AI response stub." })
      }
      logger.error("OpenRouter API key not configured")
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mmw-hubix.vercel.app", // Optional: helps with rate limiting
      "X-Title": "MMW Hubix AI Assistant",
    }

    const payload = {
      model: OPENROUTER_MODEL,
      messages: [systemMessage, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    }

    let attempt = 0
    while (attempt <= MAX_RETRIES) {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage = data.choices[0]?.message?.content || "Sorry, I encountered an error. Please try again."
        return NextResponse.json({ message: assistantMessage })
      }

      const status = response.status
      const errorText = await response.text()

      // Handle rate limit explicitly with optional retry/backoff
      if (status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After")
        const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : DEFAULT_BACKOFF_MS * (attempt + 1)

        logger.warn(`OpenRouter rate-limited (429). Attempt ${attempt + 1}/${MAX_RETRIES + 1}. Retrying in ${retryAfterMs}ms`)

        if (attempt < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, retryAfterMs))
          attempt++
          continue
        }

        // Return graceful 429 after exhausting retries
        return NextResponse.json(
          {
            error: "AI provider is rate-limited. Please retry shortly.",
            details: tryParseJson(errorText) || errorText,
          },
          {
            status: 429,
            headers: {
              "Retry-After": retryAfterHeader || Math.ceil(retryAfterMs / 1000).toString(),
            },
          }
        )
      }

      // Auth/config errors from upstream
      if (status === 401 || status === 403) {
        logger.error(`OpenRouter auth/config error: ${status} - ${errorText}`)
        return NextResponse.json({ error: "AI service unauthorized or misconfigured. Check OpenRouter API key." }, { status: 503 })
      }

      // Other upstream errors
      logger.error(`OpenRouter API error: ${status} - ${errorText}`)
      return NextResponse.json({ error: "AI service error. Please try again later." }, { status: 502 })
    }

    // Fallback (should not reach here)
    return NextResponse.json({ error: "Unexpected AI service state" }, { status: 500 })
  } catch (error) {
    logger.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 })
  }
}

function tryParseJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

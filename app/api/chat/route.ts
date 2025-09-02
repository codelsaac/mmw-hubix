import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mmw-hubix.vercel.app", // Optional: helps with rate limiting
        "X-Title": "MMW Hubix AI Assistant",
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: [systemMessage, ...messages],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenRouter API error: ${response.status} - ${errorText}`)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content || "Sorry, I encountered an error. Please try again."

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 })
  }
}

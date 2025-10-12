import { NextResponse } from "next/server"
import auth from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Allow all authenticated users to read team notes
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the first (and only) team notes record
    let teamNotes = await prisma.teamNotes.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    // If no notes exist, create empty notes
    if (!teamNotes) {
      teamNotes = await prisma.teamNotes.create({
        data: {
          content: "",
        },
      })
    }

    return NextResponse.json(teamNotes)
  } catch (error) {
    console.error("Failed to fetch team notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    
    // Only admins can update team notes
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { content } = await req.json()

    if (typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 })
    }

    // Get existing notes or create new
    let teamNotes = await prisma.teamNotes.findFirst()

    if (teamNotes) {
      // Update existing
      teamNotes = await prisma.teamNotes.update({
        where: { id: teamNotes.id },
        data: {
          content,
          updatedBy: session.user.id,
        },
      })
    } else {
      // Create new
      teamNotes = await prisma.teamNotes.create({
        data: {
          content,
          updatedBy: session.user.id,
        },
      })
    }

    return NextResponse.json(teamNotes)
  } catch (error) {
    console.error("Failed to update team notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-server"
import { UserRole } from "@/lib/permissions"

export async function GET() {
  try {
    // Allow all authenticated users to read team notes
    await requireAuthAPI()

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
    // Only admins can update team notes
    const user = await requireAuthAPI([UserRole.ADMIN])

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
          updatedBy: user.id,
        },
      })
    } else {
      // Create new
      teamNotes = await prisma.teamNotes.create({
        data: {
          content,
          updatedBy: user.id,
        },
      })
    }

    return NextResponse.json(teamNotes)
  } catch (error) {
    console.error("Failed to update team notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

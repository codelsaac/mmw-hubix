import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getSetting } from "@/lib/settings-service"
import { UserRole as PrismaUserRole } from "@prisma/client"

// Registration validation schema
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
})

const DEFAULT_ROLE: PrismaUserRole = "STUDENT" as PrismaUserRole

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(req: Request) {
  try {
    // Check if registration is enabled
    const registrationEnabled = await getSetting("registrationEnabled")
    if (!registrationEnabled) {
      return NextResponse.json(
        { error: "User registration is currently disabled" },
        { status: 403 }
      )
    }

    const body = await req.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      )
    }

    // Create new user with STUDENT role (registered, view-only access)
    const newUser = await prisma.user.create({
      data: {
        username: validatedData.username,
        password: validatedData.password, // TODO: Hash password in production
        name: validatedData.name,
        role: DEFAULT_ROLE, // Default role for new registrations
        isActive: true,
        permissions: null,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        department: true,
      },
    })

    logger.log("New user registered:", {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    })

    return NextResponse.json({
      message: "Registration successful! You can now login with your credentials.",
      user: newUser,
    })

  } catch (error) {
    logger.error("Registration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}

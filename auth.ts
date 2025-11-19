import NextAuth, { NextAuthOptions } from "next-auth"
import { UserRole } from "@/lib/permissions"
import CredentialsProvider from "next-auth/providers/credentials"
import { getCurrentPassword } from "@/lib/password-utils"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

// Enhanced user accounts with role-based access control
const DEMO_ACCOUNTS = [
  // Guest - Public access with training materials
  { 
    id: "0", 
    username: process.env.DEMO_GUEST_USERNAME || "guest", 
    password: process.env.DEMO_GUEST_PASSWORD || "guest123", 
    name: "Guest User", 
    role: UserRole.STUDENT, 
    department: "Public",
    description: "Public access to training videos and learning materials"
  },
  // Admin - Full system access
  { 
    id: "1", 
    username: process.env.DEMO_ADMIN_USERNAME || "admin", 
    password: process.env.DEMO_ADMIN_PASSWORD || "admin123", 
    name: "System Administrator", 
    role: UserRole.ADMIN, 
    department: "Admin",
    description: "Can manage entire website and IT Perfect system features"
  },
  // Helper - IT Perfect system management only
  { 
    id: "2", 
    username: "helper", 
    password: process.env.DEMO_HELPER_PASSWORD || "helper123", 
    name: "IT Assistant", 
    role: UserRole.HELPER, 
    department: "IT",
    description: "Can manage IT Perfect system but cannot access website admin features"
  },
]

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  pages: {
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        
        try {
          // First check database users
          const dbUser = await prisma.user.findUnique({
            where: { username: credentials.username },
            select: {
              id: true,
              username: true,
              name: true,
              role: true,
              department: true,
              permissions: true,
              isActive: true,
              lastLoginAt: true,
              password: true
            }
          })

          // Check if database user exists and has a password set
          if (dbUser && dbUser.isActive && dbUser.password) {
            // TODO: Use bcrypt.compare() for production
            // For now, plaintext comparison for demo purposes
            if (credentials.password === dbUser.password) {
              // Update last login time
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { lastLoginAt: new Date() }
              }).catch(err => logger.error("Failed to update lastLoginAt:", err))
              
              return {
                id: dbUser.id,
                username: dbUser.username,
                name: dbUser.name || dbUser.username,
                role: dbUser.role,
                department: dbUser.department || undefined,
                permissions: dbUser.permissions || undefined
              }
            } else {
              // Wrong password
              return null
            }
          }
        } catch (error) {
          logger.error("Database query error during auth:", error)
        }
        
        // Check demo accounts
        const user = DEMO_ACCOUNTS.find(
          account => account.username === credentials.username
        )
        
        if (user) {
          // Check if user has updated their password
          const currentPassword = getCurrentPassword(user.id)
          const passwordToCheck = currentPassword || user.password
          
          if (credentials.password === passwordToCheck) {
            // Try to get permissions from database if user exists
            try {
              const dbUser = await prisma.user.findUnique({
                where: { username: user.username },
                select: {
                  id: true,
                  permissions: true
                }
              })

              // Update last login time
              if (dbUser) {
                await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { lastLoginAt: new Date() }
                })
              }

              return {
                id: dbUser?.id || user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                department: user.department,
                description: user.description,
                permissions: dbUser?.permissions || null
              }
            } catch (error) {
              logger.error("Error loading user permissions:", error)
              // Fallback to basic user info without custom permissions
              return {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                department: user.department,
                description: user.description,
                permissions: null
              }
            }
          }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      
      if (token.username && session.user) {
        session.user.username = token.username as string
      }
      
      if (token.role && session.user) {
        session.user.role = token.role as string
      }

      if (token.department && session.user) {
        session.user.department = token.department as string
      }

      if (token.description && session.user) {
        session.user.description = token.description as string
      }

      // Load fresh permissions from database on each session check
      if (token.username && session.user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { username: token.username as string },
            select: { permissions: true }
          })
          
          if (dbUser) {
            session.user.permissions = dbUser.permissions
            token.permissions = dbUser.permissions
          }
        } catch (error) {
          logger.error("Error loading permissions in session:", error)
        }
      }

      // Use cached permissions if available
      if (token.permissions !== undefined && session.user) {
        session.user.permissions = token.permissions as string | null
      }
      
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.username = user.username
        token.role = user.role
        token.department = user.department
        token.description = user.description
        token.permissions = user.permissions
      }
      return token
    },
  },
}

export default NextAuth(authOptions)
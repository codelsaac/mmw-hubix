import NextAuth, { NextAuthOptions } from "next-auth"
import { UserRole } from "@/lib/permissions"
import CredentialsProvider from "next-auth/providers/credentials"

// Enhanced user accounts with role-based access control
const DEMO_ACCOUNTS = [
  // Guest - Public access with training materials
  { 
    id: "0", 
    username: process.env.DEMO_GUEST_USERNAME || "guest", 
    password: process.env.DEMO_GUEST_PASSWORD || "guest123", 
    name: "Guest User", 
    role: UserRole.GUEST, 
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
        
        // Check demo accounts
        const user = DEMO_ACCOUNTS.find(
          account => account.username === credentials.username && account.password === credentials.password
        )
        
        if (user) {
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            department: user.department,
            description: user.description
          }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    session({ session, token }) {
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
      
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.username = user.username
        token.role = user.role
        token.department = user.department
        token.description = user.description
      }
      return token
    },
  },
}

export default NextAuth(authOptions)
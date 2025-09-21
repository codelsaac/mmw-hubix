import NextAuth, { NextAuthOptions } from "next-auth"
import { UserRole } from "@/lib/permissions"
import CredentialsProvider from "next-auth/providers/credentials"

// Enhanced user accounts with role-based access control
const DEMO_ACCOUNTS = [
  // Guest - Public access with training materials
  { 
    id: "0", 
    email: "guest@cccmmw.edu.hk", 
    password: "guest123", 
    name: "Guest User", 
    role: UserRole.GUEST, 
    department: "Public",
    description: "Public access to training videos and learning materials"
  },
  // Admin - Full system access
  { 
    id: "1", 
    email: "admin@cccmmw.edu.hk", 
    password: "mmw2025", 
    name: "System Administrator", 
    role: UserRole.ADMIN, 
    department: "Admin",
    description: "Can manage entire website and IT Perfect system features"
  },
  // Alternative admin login passwords
  { 
    id: "1", 
    email: "admin@cccmmw.edu.hk", 
    password: "admin123", 
    name: "System Administrator", 
    role: UserRole.ADMIN, 
    department: "Admin",
    description: "Can manage entire website and IT Perfect system features"
  },
  { 
    id: "1", 
    email: "admin@cccmmw.edu.hk", 
    password: "mmw-admin-2025", 
    name: "System Administrator", 
    role: UserRole.ADMIN, 
    department: "Admin",
    description: "Can manage entire website and IT Perfect system features"
  },
  // Helper - IT Perfect system management only
  { 
    id: "2", 
    email: "helper@cccmmw.edu.hk", 
    password: "helper123", 
    name: "IT Assistant", 
    role: UserRole.HELPER, 
    department: "IT",
    description: "Can manage IT Perfect system but cannot access website admin features"
  },
  { 
    id: "3", 
    email: "ithelper@cccmmw.edu.hk", 
    password: "ithelper2025", 
    name: "IT System Assistant", 
    role: UserRole.HELPER, 
    department: "IT",
    description: "Can manage IT Perfect system but cannot access website admin features"
  },
  // IT Prefect - View only access
  { 
    id: "4", 
    email: "itprefect@cccmmw.edu.hk", 
    password: "prefect123", 
    name: "IT Prefect Member", 
    role: UserRole.GUEST, 
    department: "IT",
    description: "View-only access to training videos and resources"
  },
  { 
    id: "5", 
    email: "student1@cccmmw.edu.hk", 
    password: "student123", 
    name: "Student Zhang", 
    role: UserRole.GUEST, 
    department: "IT",
    description: "View-only access to training videos and resources"
  },
  { 
    id: "6", 
    email: "student2@cccmmw.edu.hk", 
    password: "student456", 
    name: "Student Li", 
    role: UserRole.GUEST, 
    department: "IT",
    description: "View-only access to training videos and resources"
  }
]
 
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Check demo accounts
        const user = DEMO_ACCOUNTS.find(
          account => account.email === credentials.email && account.password === credentials.password
        )
        
        if (user) {
          return {
            id: user.id,
            email: user.email,
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
        token.role = user.role
        token.department = user.department
        token.description = user.description
      }
      return token
    },
  },
  pages: {
    signIn: '/',
  },
}

export default NextAuth(authOptions)
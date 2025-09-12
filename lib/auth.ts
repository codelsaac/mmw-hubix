"use client"

import { signIn, signOut } from "next-auth/react"
import { UserRole } from "@/lib/permissions"

export class AuthService {
  private static instance: AuthService | null = null
  
  // Enhanced user accounts with role-based access control
  private readonly DEMO_ACCOUNTS = [
    // Guest account - Public access with training materials
    { email: "guest@cccmmw.edu.hk", password: "guest123", role: UserRole.GUEST, name: "Guest User" },
    
    // Admin accounts - Full system access
    { email: "admin@cccmmw.edu.hk", password: "mmw2025", role: UserRole.ADMIN, name: "System Administrator" },
    { email: "admin@cccmmw.edu.hk", password: "admin123", role: UserRole.ADMIN, name: "System Administrator" },
    { email: "admin@cccmmw.edu.hk", password: "mmw-admin-2025", role: UserRole.ADMIN, name: "System Administrator" },
    
    // Helper accounts - IT Perfect system management only
    { email: "helper@cccmmw.edu.hk", password: "helper123", role: UserRole.HELPER, name: "IT Assistant" },
    { email: "ithelper@cccmmw.edu.hk", password: "ithelper2025", role: UserRole.HELPER, name: "IT System Assistant" },
    
    // IT Prefect accounts - View only access
    { email: "itprefect@cccmmw.edu.hk", password: "prefect123", role: UserRole.IT_PREFECT, name: "IT Prefect" },
    { email: "student1@cccmmw.edu.hk", password: "student123", role: UserRole.IT_PREFECT, name: "Student Zhang" },
    { email: "student2@cccmmw.edu.hk", password: "student456", role: UserRole.IT_PREFECT, name: "Student Li" }
  ]

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    // Check if credentials match demo accounts
    const account = this.DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password)
    
    if (!account) {
      throw new Error("Invalid email or password")
    }

    try {
      // Use NextAuth credentials signin
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Authentication failed")
      }
    } catch (error) {
      console.error("Auth service error:", error)
      throw error
    }
  }

  async signInWithPassword(password: string): Promise<void> {
    // Check if password matches any admin account passwords
    const adminAccount = this.DEMO_ACCOUNTS.find(acc => 
      acc.role === UserRole.ADMIN && acc.password === password
    )

    if (!adminAccount) {
      throw new Error("Invalid admin password")
    }

    try {
      // Use NextAuth credentials signin with admin email/password
      const result = await signIn("credentials", {
        email: adminAccount.email,
        password: adminAccount.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Authentication failed")
      }
    } catch (error) {
      console.error("Auth service error:", error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut({ redirect: false })
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  isValidAdminPassword(password: string): boolean {
    return this.DEMO_ACCOUNTS.some(acc => 
      acc.role === UserRole.ADMIN && acc.password === password
    )
  }

  isValidAccount(email: string, password: string): boolean {
    return this.DEMO_ACCOUNTS.some(acc => acc.email === email && acc.password === password)
  }

  getUserRole(email: string, password: string): UserRole | null {
    const account = this.DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password)
    return account ? account.role : null
  }

  getAccountByCredentials(email: string, password: string) {
    return this.DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password)
  }
}

"use client"

import { signIn, signOut } from "next-auth/react"
import { UserRole } from "@/lib/permissions"

export class AuthService {
  private static instance: AuthService | null = null
  
  // Enhanced user accounts with role-based access control
  private readonly DEMO_ACCOUNTS = [
    // Guest account - Public access with training materials
    { username: "guest", password: "guest123", role: UserRole.GUEST, name: "Guest User" },
    
    // Admin accounts - Full system access
    { username: "admin", password: "mmw2025", role: UserRole.ADMIN, name: "System Administrator" },
    { username: "admin", password: "admin123", role: UserRole.ADMIN, name: "System Administrator" },
    { username: "admin", password: "mmw-admin-2025", role: UserRole.ADMIN, name: "System Administrator" },
    
    // Helper accounts - IT Perfect system management only
    { username: "helper", password: "helper123", role: UserRole.HELPER, name: "IT Assistant" },
    { username: "ithelper", password: "ithelper2025", role: UserRole.HELPER, name: "IT System Assistant" },
    
    // Guest accounts - View only access
    { username: "guest1", password: "guest123", role: UserRole.GUEST, name: "Guest User" },
    { username: "student1", password: "student123", role: UserRole.GUEST, name: "Student Zhang" },
    { username: "student2", password: "student456", role: UserRole.GUEST, name: "Student Li" }
  ]

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signInWithUsername(username: string, password: string): Promise<void> {
    // Check if credentials match demo accounts
    const account = this.DEMO_ACCOUNTS.find(acc => acc.username === username && acc.password === password)
    
    if (!account) {
      throw new Error("Invalid username or password")
    }

    try {
      // Use NextAuth credentials signin
      const result = await signIn("credentials", {
        username,
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
      // Use NextAuth credentials signin with admin username/password
      const result = await signIn("credentials", {
        username: adminAccount.username,
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

  isValidAccount(username: string, password: string): boolean {
    return this.DEMO_ACCOUNTS.some(acc => acc.username === username && acc.password === password)
  }

  getUserRole(username: string, password: string): UserRole | null {
    const account = this.DEMO_ACCOUNTS.find(acc => acc.username === username && acc.password === password)
    return account ? account.role : null
  }

  getAccountByCredentials(username: string, password: string) {
    return this.DEMO_ACCOUNTS.find(acc => acc.username === username && acc.password === password)
  }
}

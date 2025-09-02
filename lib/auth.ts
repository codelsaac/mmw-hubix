"use client"

import { signIn, signOut } from "next-auth/react"

export class AuthService {
  private static instance: AuthService | null = null
  
  // Admin passwords for demo purposes
  private readonly ADMIN_PASSWORDS = ["admin123", "mmw-admin-2025"]
  
  // Demo user accounts
  private readonly DEMO_ACCOUNTS = [
    { email: "admin@cccmmw.edu.hk", password: "mmw2025", role: "admin" },
    { email: "itprefect@cccmmw.edu.hk", password: "prefect123", role: "user" }
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
    // Check if password matches admin passwords and map to admin account
    let adminAccount = null
    if (password === "admin123" || password === "mmw-admin-2025") {
      adminAccount = { email: "admin@cccmmw.edu.hk", password: "mmw2025" }
    }

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
    return this.ADMIN_PASSWORDS.includes(password)
  }

  isValidAccount(email: string, password: string): boolean {
    return this.DEMO_ACCOUNTS.some(acc => acc.email === email && acc.password === password)
  }
}

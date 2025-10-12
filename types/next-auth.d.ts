import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      department?: string
      description?: string
      permissions?: string | null
    }
  }

  interface User {
    id: string
    username?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
    department?: string
    description?: string
    permissions?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string
    role?: string
    department?: string
    description?: string
    permissions?: string | null
  }
}

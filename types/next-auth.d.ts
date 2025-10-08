import { DefaultSession } from "next-auth"

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
    } & DefaultSession["user"]
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
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    username?: string
    role?: string
    department?: string
    description?: string
  }
}

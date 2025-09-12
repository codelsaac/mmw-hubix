import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export interface AuthUser {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  department?: string
  description?: string
}

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const refreshUser = async () => {
    try {
      // Refresh the session data
      await update()
      // Force a router refresh to ensure latest data
      router.refresh()
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return {
    user: session?.user as AuthUser | undefined,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === "ADMIN",
    isHelper: session?.user?.role === "HELPER",
    isITPrefect: session?.user?.role === "IT_PREFECT",
    signOut: handleSignOut,
    refreshUser
  }
}

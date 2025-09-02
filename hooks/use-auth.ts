import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

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

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    isAdmin: session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || session?.user?.role === "admin",
    isITPrefect: session?.user?.department === "IT" || session?.user?.role === "admin",
    refreshUser
  }
}

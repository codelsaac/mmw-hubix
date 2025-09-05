"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Eye, EyeOff } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"

export function DiscreteAdminLogin() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { refreshUser, user, isAuthenticated } = useAuth()

  // Don't show if user is already admin
  if (isAuthenticated && user?.role === "admin") {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsLoading(true)
    setError("")

    try {
      await AuthService.getInstance().signInWithPassword(password)
      await refreshUser()
      
      setPassword("")
      setIsExpanded(false)
      router.push("/admin")
    } catch (err) {
      setError("Invalid password")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="h-8 w-8 p-0 opacity-30 hover:opacity-60 transition-opacity"
        >
          <Shield className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Admin</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(false)
              setPassword("")
              setError("")
            }}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="text-xs h-8 pr-8"
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1 h-6 w-6 p-0"
          >
            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>

        {error && (
          <div className="text-xs text-red-500">{error}</div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !password.trim()}
          className="w-full h-7 text-xs"
        >
          {isLoading ? "..." : "Login"}
        </Button>
      </form>
    </div>
  )
}
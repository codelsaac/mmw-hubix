"use client"

import * as React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, UserCheck } from "lucide-react"

interface SimpleLoginDialogProps {
  children?: React.ReactNode
}

export function SimpleLoginDialog({ children }: SimpleLoginDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Login failed. Please check your username and password.")
      } else {
        setOpen(false)
        setUsername("")
        setPassword("")
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const guestLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        username: "guest",
        password: "guest123",
        redirect: false,
      })

      if (result?.error) {
        setError("Guest login failed")
      } else {
        setOpen(false)
      }
    } catch (error) {
      setError("Guest login error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>MMW Hubix Login</DialogTitle>
          <DialogDescription>
            Sign in with your credentials or continue as guest
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guest Access Button */}
          <div className="text-center">
            <Button
              onClick={guestLogin}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              {isLoading ? "Accessing..." : "Continue as Guest"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Browse content without logging in
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or login with credentials
              </span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

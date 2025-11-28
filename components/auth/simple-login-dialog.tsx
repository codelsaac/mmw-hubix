"use client"

import * as React from "react"
import { useState } from "react"
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
import { LogIn, UserPlus } from "lucide-react"
import { RegistrationForm } from "./registration-form"
import { useSettings } from "@/hooks/use-settings"
import { signIn } from "@/lib/auth-client"

interface SimpleLoginDialogProps {
  children?: React.ReactNode
}

export function SimpleLoginDialog({ children }: SimpleLoginDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showRegistration, setShowRegistration] = useState(false)
  const { settings } = useSettings()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn.username({
        username,
        password,
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

  const switchToRegistration = () => {
    setShowRegistration(true)
    setError("")
    setUsername("")
    setPassword("")
  }

  const switchToLogin = () => {
    setShowRegistration(false)
    setError("")
    setUsername("")
    setPassword("")
  }

  return (
    <>
      <Dialog open={open && !showRegistration} onOpenChange={setOpen}>
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
              Sign in with your credentials to access the IT Prefect system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Manual Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
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
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="password"
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

            {/* Registration Button */}
            {settings.registrationEnabled && (
              <div className="text-center pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={switchToRegistration}
                  disabled={isLoading}
                  className="text-primary hover:text-primary/80"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  New User? Create Account
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Form Dialog */}
      <RegistrationForm
        open={open && showRegistration}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(false)
            setShowRegistration(false)
          }
        }}
        onSwitchToLogin={switchToLogin}
      />
    </>
  )
}

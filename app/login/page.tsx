"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { LogIn } from "lucide-react"
import { signIn } from "@/lib/auth-client"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Get form values directly from input elements to ensure we get the latest values
      const usernameInput = event.currentTarget.elements.namedItem('username') as HTMLInputElement
      const passwordInput = event.currentTarget.elements.namedItem('password') as HTMLInputElement
      
      const username = usernameInput.value
      const password = passwordInput.value
      
      console.log('Attempting direct fetch login with:', { username, password })
      
      const response = await fetch('/api/better-auth/sign-in/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: 'include', // Important for cookies
      })
      
      const result = await response.json()
      console.log('Direct fetch result:', result)

      if (!response.ok) {
        setError(`Login failed: ${result.error?.message || "Invalid username or password"}`)
        console.error('Login error:', result)
      } else {
        console.log('Login successful, redirecting to dashboard...')
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">Sign in to MMW Hubix</CardTitle>
          <CardDescription>
            Use your IT Prefect or admin account to access the IT Perfect Hub and admin tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LogIn, Shield, Users, Eye, UserCheck } from "lucide-react"
import { UserRole } from "@/lib/permissions"

interface UnifiedLoginDialogProps {
  children?: React.ReactNode
}

export function UnifiedLoginDialog({ children }: UnifiedLoginDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Login failed. Please check your email and password.")
      } else {
        setOpen(false)
        setEmail("")
        setPassword("")
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Quick login failed")
      } else {
        setOpen(false)
      }
    } catch (error) {
      setError("Login error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const guestLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: "guest@cccmmw.edu.hk",
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

  const adminAccounts = [
    {
      role: UserRole.ADMIN,
      name: "System Administrator",
      email: "admin@cccmmw.edu.hk",
      password: "mmw2025",
      description: "Full website and system management",
      icon: Shield,
      variant: "destructive" as const
    }
  ]

  const internalAccounts = [
    {
      role: UserRole.HELPER,
      name: "IT Assistant",
      email: "helper@cccmmw.edu.hk", 
      password: "helper123",
      description: "IT Perfect system management",
      icon: Users,
      variant: "default" as const
    },
    {
      role: UserRole.IT_PREFECT,
      name: "IT Prefect",
      email: "itprefect@cccmmw.edu.hk",
      password: "prefect123", 
      description: "View training videos and resources",
      icon: Eye,
      variant: "secondary" as const
    }
  ]

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>MMW Hubix Access</DialogTitle>
          <DialogDescription>
            Choose your access type or login with your credentials
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="guest" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guest">Guest</TabsTrigger>
            <TabsTrigger value="internal">Internal System</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="login">Manual Login</TabsTrigger>
          </TabsList>

          {/* Guest Access */}
          <TabsContent value="guest" className="space-y-4">
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Guest Access</CardTitle>
                </div>
                <CardDescription>
                  Browse public content and access training videos and learning materials without logging in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={guestLogin}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? "Accessing..." : "Continue as Guest"}
                </Button>
              </CardContent>
            </Card>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Internal System (IT Perfect) */}
          <TabsContent value="internal" className="space-y-4">
            <div className="space-y-3">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">IT Perfect Internal System</h3>
                <p className="text-sm text-muted-foreground">For IT team members and prefects</p>
              </div>
              {internalAccounts.map((account) => {
                const IconComponent = account.icon
                return (
                  <Card key={account.email} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <CardTitle className="text-sm">{account.name}</CardTitle>
                        </div>
                        <Badge variant={account.variant} className="text-xs">
                          {account.role}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {account.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => quickLogin(account.email, account.password)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : `Login as ${account.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Website Administration */}
          <TabsContent value="admin" className="space-y-4">
            <div className="space-y-3">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">Website Administration</h3>
                <p className="text-sm text-muted-foreground">For system administrators only</p>
              </div>
              {adminAccounts.map((account) => {
                const IconComponent = account.icon
                return (
                  <Card key={account.email} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <CardTitle className="text-sm">{account.name}</CardTitle>
                        </div>
                        <Badge variant={account.variant} className="text-xs">
                          {account.role}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {account.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => quickLogin(account.email, account.password)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : `Login as ${account.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Manual Login */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@cccmmw.edu.hk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

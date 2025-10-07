"use client"

import type React from "react"
import Link from "next/link"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Home } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "prefect" | "admin"
}

export function ProtectedRoute({ children, requiredRole = "prefect" }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to sign in with your IT Prefect account to access this area.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Main Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requiredRole === "admin" && user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need administrator privileges to access this area. Contact your IT Prefect admin for assistance.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

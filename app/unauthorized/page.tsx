import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <Icons.logo className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insufficient Permissions</CardTitle>
          <CardDescription>Your current role cannot access the requested resource.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              If you believe this is an error, please contact the system administrator or sign in with an account that has appropriate permissions.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

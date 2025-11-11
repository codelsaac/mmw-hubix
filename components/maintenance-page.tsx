"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Settings, Clock } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"

export function MaintenancePage() {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-serif">{settings.siteName}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
              <Settings className="w-5 h-5" />
              Under Maintenance
            </h2>
            <p className="text-muted-foreground">
              We&apos;re currently performing scheduled maintenance to improve your experience.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Please check back shortly
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{settings.siteDescription}</p>
        </CardContent>
      </Card>
    </div>
  )
}

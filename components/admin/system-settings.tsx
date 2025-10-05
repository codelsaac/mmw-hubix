"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Database, Shield, Bell, Palette, Download, Upload, CheckCircle } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { toast } from "sonner"

import { logger } from "@/lib/logger"
export function SystemSettings() {
  const { settings, updateSettings } = useSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
    setHasChanges(false)
  }, [settings])

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveSettings = () => {
    updateSettings(localSettings)
    setHasChanges(false)
    toast.success("Settings saved successfully!", {
      description: "Changes have been applied to the website.",
      icon: <CheckCircle className="w-4 h-4" />,
    })
    logger.log("[v0] Settings saved and applied to website:", localSettings)
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "mmw-hubix-settings.json"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Settings exported successfully!")
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string)
            updateSettings(importedSettings)
            toast.success("Settings imported successfully!")
          } catch (error) {
            toast.error("Failed to import settings. Invalid file format.")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">System Settings</h2>
            <p className="text-muted-foreground">Configure global system settings and preferences</p>
          </div>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Unsaved Changes
          </Badge>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic site configuration and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={localSettings.siteName}
                    onChange={(e) => handleSettingChange("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={localSettings.maxFileSize}
                    onChange={(e) => handleSettingChange("maxFileSize", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={localSettings.siteDescription}
                  onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={localSettings.allowedFileTypes}
                  onChange={(e) => handleSettingChange("allowedFileTypes", e.target.value)}
                  placeholder="pdf,doc,docx,jpg,png"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-yellow-50">
                <div className="space-y-0.5">
                  <Label className="font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable site access for maintenance</p>
                  {localSettings.maintenanceMode && (
                    <p className="text-sm text-yellow-600 font-medium">⚠️ Website is currently in maintenance mode</p>
                  )}
                </div>
                <Switch
                  checked={localSettings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                </div>
                <Switch
                  checked={localSettings.registrationEnabled}
                  onCheckedChange={(checked) => handleSettingChange("registrationEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... existing security, notifications, backup tabs ... */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security policies and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={localSettings.sessionTimeout}
                    onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={localSettings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange("maxLoginAttempts", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Security Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SSL Certificate</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Two-Factor Authentication</span>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Password Policy</span>
                      <Badge variant="default">Enforced</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                </div>
                <Switch
                  checked={localSettings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup & Data Management
              </CardTitle>
              <CardDescription>Configure automatic backups and data export/import</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Enable scheduled system backups</p>
                </div>
                <Switch
                  checked={localSettings.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <select
                  className="w-full p-2 border border-border rounded-md"
                  value={localSettings.backupFrequency}
                  onChange={(e) => handleSettingChange("backupFrequency", e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleExportData} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button onClick={handleImportData} variant="outline" className="flex-1 bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize the visual appearance of the portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        id: "school-blue-yellow",
                        name: "School Blue & Yellow",
                        colors: ["#87CEEB", "#003366", "#FFD700"],
                      },
                      { id: "classic-blue", name: "Classic Blue", colors: ["#E3F2FD", "#1976D2", "#FFC107"] },
                      { id: "green-gold", name: "Green & Gold", colors: ["#E8F5E8", "#2E7D32", "#FF8F00"] },
                    ].map((theme) => (
                      <div
                        key={theme.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                          localSettings.colorTheme === theme.id ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => handleSettingChange("colorTheme", theme.id)}
                      >
                        <div className="flex gap-2 mb-2">
                          {theme.colors.map((color, index) => (
                            <div key={index} className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <p className="text-sm font-medium">{theme.name}</p>
                        {localSettings.colorTheme === theme.id && <CheckCircle className="w-4 h-4 text-primary mt-1" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          size="lg"
          disabled={!hasChanges}
          className={hasChanges ? "bg-primary" : ""}
        >
          {hasChanges ? "Save All Settings" : "All Settings Saved"}
        </Button>
      </div>
    </div>
  )
}

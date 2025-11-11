"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

interface ProfileData {
  name: string
  email: string
  department: string
  username: string
  role: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function UserProfile() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  
  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    department: "",
    username: "",
    role: ""
  })
  
  // Password data
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        department: user.department || "",
        username: user.username || "",
        role: user.role || ""
      })
    }
  }, [user])

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      // Build payload, only include fields with values
      const payload: Record<string, string> = {}
      
      if (profileData.name.trim()) {
        payload.name = profileData.name.trim()
      }
      if (profileData.email.trim()) {
        payload.email = profileData.email.trim()
      }
      if (profileData.department.trim()) {
        payload.department = profileData.department.trim()
      }

      logger.log('[PROFILE_UPDATE] Sending payload:', payload)

      const response = await fetch('/api/dashboard/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('[PROFILE_UPDATE] API error:', error)
        const errorMsg = error.details 
          ? `Validation error: ${error.details.map((d: any) => d.message).join(', ')}`
          : error.error || error.message || 'Failed to update profile'
        throw new Error(errorMsg)
      }

      const updatedUser = await response.json()
      await refreshUser()
      
      toast.success("Profile updated successfully!", {
        description: "Your profile information has been saved.",
        icon: <CheckCircle className="w-4 h-4" />,
      })
      
      logger.log("Profile updated:", updatedUser)
    } catch (error) {
      logger.error('Profile update error:', error)
      toast.error("Failed to update profile", {
        description: error instanceof Error ? error.message : "Please try again.",
        icon: <AlertCircle className="w-4 h-4" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both password fields match.",
        icon: <AlertCircle className="w-4 h-4" />,
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters long.",
        icon: <AlertCircle className="w-4 h-4" />,
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to change password')
      }

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      toast.success("Password changed successfully!", {
        description: "Your password has been updated.",
        icon: <CheckCircle className="w-4 h-4" />,
      })
      
      logger.log("Password changed successfully")
    } catch (error) {
      logger.error('Password change error:', error)
      toast.error("Failed to change password", {
        description: error instanceof Error ? error.message : "Please check your current password and try again.",
        icon: <AlertCircle className="w-4 h-4" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500"
      case "HELPER":
        return "bg-blue-500"
      case "GUEST":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "System Administrator"
      case "HELPER":
        return "IT Assistant"
      case "GUEST":
        return "Guest User"
      default:
        return role
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-3">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">My Profile</h2>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10 transition-all duration-300 hover:ring-primary/30 hover:scale-110">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="font-medium">{user.name}</p>
            <Badge className={`text-xs text-white ${getRoleColor(user.role || "")}`}>
              {getRoleLabel(user.role || "")}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your username"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    autoComplete="organization-title"
                    value={profileData.department}
                    onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter your department"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={isLoading} className="transition-all duration-300 hover:scale-105">
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password for better security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter your new password"
                />
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your new password"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={isLoading} className="transition-all duration-300 hover:scale-105">
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

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
import { LogIn, Shield, Users, Eye } from "lucide-react"
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
        setError("登入失敗，請檢查您的電子郵件和密碼")
      } else {
        setOpen(false)
        setEmail("")
        setPassword("")
      }
    } catch (error) {
      setError("登入過程中發生錯誤，請稍後再試")
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
        setError("快速登入失敗")
      } else {
        setOpen(false)
      }
    } catch (error) {
      setError("登入過程中發生錯誤")
    } finally {
      setIsLoading(false)
    }
  }

  const demoAccounts = [
    {
      role: UserRole.ADMIN,
      name: "系統管理員",
      email: "admin@cccmmw.edu.hk",
      password: "mmw2025",
      description: "完整系統管理權限",
      icon: Shield,
      variant: "destructive" as const
    },
    {
      role: UserRole.HELPER,
      name: "IT助手",
      email: "helper@cccmmw.edu.hk", 
      password: "helper123",
      description: "IT系統管理權限",
      icon: Users,
      variant: "default" as const
    },
    {
      role: UserRole.IT_PREFECT,
      name: "IT學會成員",
      email: "itprefect@cccmmw.edu.hk",
      password: "prefect123", 
      description: "僅查看權限",
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
            登入
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>MMW Hubix 登入</DialogTitle>
          <DialogDescription>
            請選擇您的登入方式或使用測試帳戶
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">帳戶登入</TabsTrigger>
            <TabsTrigger value="demo">測試帳戶</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
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
                <Label htmlFor="password">密碼</Label>
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
                {isLoading ? "登入中..." : "登入"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="demo" className="space-y-4">
            <div className="space-y-3">
              {demoAccounts.map((account) => {
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
                        {isLoading ? "登入中..." : `以${account.name}身份登入`}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

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
        <h1 className="text-3xl font-bold tracking-tight mb-2">訊問被拒絕</h1>
        <p className="text-muted-foreground">
          您沒有權限訪問此頁面
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>權限不足</CardTitle>
          <CardDescription>
            您當前的用戶角色無法訪問所請求的資源
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              如果您認為這是一個錯誤，請聯繫系統管理員或使用具有適當權限的帳戶登入。
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="font-medium">用戶角色說明：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>系統管理員：</strong> 可管理整個網站和IT Perfect系統</li>
              <li><strong>IT助手：</strong> 可管理IT Perfect系統，但無法訪問網站管理功能</li>
              <li><strong>IT學會成員：</strong> 只能查看教學影片和資料，無管理權限</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button asChild>
              <Link href="/">返回首頁</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">前往儀表板</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

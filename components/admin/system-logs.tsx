"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"

const mockLogs = [
  {
    id: 1,
    timestamp: "2024-01-15 14:32:15",
    level: "info",
    category: "auth",
    message: "User login successful",
    user: "sarah.chen@school.edu",
    ip: "192.168.1.100",
    details: "Google OAuth authentication completed successfully",
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:28:42",
    level: "warning",
    category: "system",
    message: "High memory usage detected",
    user: "system",
    ip: "localhost",
    details: "Memory usage reached 85% of available capacity",
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:25:18",
    level: "error",
    category: "api",
    message: "Failed to connect to external service",
    user: "system",
    ip: "localhost",
    details: "Connection timeout to library.school.edu after 30 seconds",
  },
  {
    id: 4,
    timestamp: "2024-01-15 14:20:33",
    level: "info",
    category: "content",
    message: "New announcement published",
    user: "marcus.johnson@school.edu",
    ip: "192.168.1.105",
    details: "Computer Club Workshop announcement created and published",
  },
  {
    id: 5,
    timestamp: "2024-01-15 14:15:07",
    level: "success",
    category: "backup",
    message: "Daily backup completed successfully",
    user: "system",
    ip: "localhost",
    details: "Database backup saved to backup-2024-01-15.sql (2.4MB)",
  },
]

export function SystemLogs() {
  const [logs, setLogs] = useState(mockLogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = selectedLevel === "all" || log.level === selectedLevel
    const matchesCategory = selectedCategory === "all" || log.category === selectedCategory
    return matchesSearch && matchesLevel && matchesCategory
  })

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "success":
        return "default"
      default:
        return "outline"
    }
  }

  const handleExportLogs = () => {
    console.log("[v0] Exporting system logs")
    // Export functionality
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">System Logs</h2>
            <p className="text-muted-foreground">Monitor system activity and troubleshoot issues</p>
          </div>
        </div>
        <Button onClick={handleExportLogs}>
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="backup">Backup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity ({filteredLogs.length} entries)</CardTitle>
          <CardDescription>System logs and activity monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                <div className="flex-shrink-0 mt-1">{getLevelIcon(log.level)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                      {log.level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {log.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                  </div>
                  <p className="font-medium">{log.message}</p>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>User: {log.user}</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

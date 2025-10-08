import { requireITSystemAccess } from "@/lib/auth-server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Server,
  Shield,
  Monitor,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import NextLink from "next/link"

const systemMetrics = [
  {
    title: "Server Status",
    value: "Online",
    description: "Main server operational",
    icon: Server,
    status: "healthy",
    href: "/admin/it-system/server"
  },
  {
    title: "Network Health",
    value: "Good",
    description: "All systems connected",
    icon: Wifi,
    status: "healthy",
    href: "/admin/it-system/network"
  },
  {
    title: "Storage Usage",
    value: "65%",
    description: "Available disk space",
    icon: HardDrive,
    status: "warning",
    href: "/admin/it-system/storage"
  },
  {
    title: "Security Status",
    value: "Protected",
    description: "Threats monitored",
    icon: Shield,
    status: "healthy",
    href: "/admin/it-system/security"
  },
]

const recentActivities = [
  {
    action: "System backup completed",
    time: "2 hours ago",
    status: "success"
  },
  {
    action: "Security scan finished",
    time: "4 hours ago",
    status: "success"
  },
  {
    action: "User access review",
    time: "1 day ago",
    status: "pending"
  },
  {
    action: "Software updates pending",
    time: "2 days ago",
    status: "warning"
  }
]

export default async function ITSystemPage() {
  // Server-side authentication check
  const user = await requireITSystemAccess()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">IT System Management</h2>
            <p className="text-muted-foreground">Monitor and manage IT infrastructure</p>
          </div>
        </div>

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemMetrics.map((metric) => (
            <NextLink key={metric.title} href={metric.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {metric.status === "healthy" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {metric.status === "warning" && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <Badge
                      variant={metric.status === "healthy" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {metric.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </NextLink>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                System Health Overview
              </CardTitle>
              <CardDescription>Current status of all IT systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Status</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Maintenance</span>
                <span className="text-sm text-muted-foreground">Today, 3:00 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm text-muted-foreground">99.9% (30 days)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-sm text-muted-foreground">12 online</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>Latest system events and actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activity.status === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {activity.status === "warning" && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    {activity.status === "pending" && (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm">{activity.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Common IT management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" asChild>
                <NextLink href="/admin/it-system/server">
                  <Server className="w-4 h-4 mr-2" />
                  Server Config
                </NextLink>
              </Button>
              <Button variant="outline" asChild>
                <NextLink href="/admin/it-system/network">
                  <Wifi className="w-4 h-4 mr-2" />
                  Network Setup
                </NextLink>
              </Button>
              <Button variant="outline" asChild>
                <NextLink href="/admin/it-system/security">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </NextLink>
              </Button>
              <Button variant="outline" asChild>
                <NextLink href="/admin/it-system/backups">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Backups
                </NextLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

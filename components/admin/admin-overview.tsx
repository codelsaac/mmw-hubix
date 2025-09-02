import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, FileText, Calendar, PlayCircle, Activity, Shield } from "lucide-react"
import NextLink from "next/link"

const adminStats = [
  {
    title: "Resource Links",
    value: "36",
    description: "Active homepage links",
    icon: PlayCircle, // Renamed from Link to avoid conflict
    trend: "+3 this week",
    href: "/admin/resources",
  },
  {
    title: "Announcements",
    value: "12",
    description: "Published club events",
    icon: FileText,
    trend: "+2 pending approval",
    href: "/admin/announcements",
  },
  {
    title: "Team Members",
    value: "15",
    description: "Active IT Prefects",
    icon: Users,
    trend: "+1 new member",
    href: "/admin/users",
  },
  {
    title: "Training Videos",
    value: "24",
    description: "Available resources",
    icon: Calendar, // Renamed from Link to avoid conflict
    trend: "98% completion rate",
    href: "/dashboard/training",
  },
]

const recentActivity = [
  {
    id: 1,
    type: "resource",
    title: "New Resource Added",
    description: "Library System link updated",
    user: "Sarah Chen",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    type: "announcement",
    title: "Event Published",
    description: "Computer Club Workshop scheduled",
    user: "Marcus Johnson",
    time: "4 hours ago",
    status: "published",
  },
  {
    id: 3,
    type: "user",
    title: "Role Updated",
    description: "Alex Thompson promoted to Senior Prefect",
    user: "Sarah Chen",
    time: "1 day ago",
    status: "completed",
  },
  {
    id: 4,
    type: "system",
    title: "Backup Completed",
    description: "Weekly system backup successful",
    user: "System",
    time: "2 days ago",
    status: "automated",
  },
]

const pendingTasks = [
  {
    id: 1,
    title: "Review Pending Announcements",
    description: "3 club events awaiting approval",
    priority: "high",
    dueDate: "Today",
  },
  {
    id: 2,
    title: "Update Training Materials",
    description: "New security protocols documentation",
    priority: "medium",
    dueDate: "This Week",
  },
  {
    id: 3,
    title: "User Access Review",
    description: "Quarterly access permissions audit",
    priority: "medium",
    dueDate: "Next Week",
  },
]

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage all aspects of the MMW Hubix portal</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <NextLink key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <p className="text-xs text-primary mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          </NextLink>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Admin Activity
            </CardTitle>
            <CardDescription>Latest content management actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "published"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Items requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                  <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                </div>
                <Badge
                  variant={
                    task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                  }
                  className="text-xs ml-2"
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <NextLink href="/admin/resources">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <PlayCircle className="w-4 h-4 mr-2" />
                Manage Resources
              </Button>
            </NextLink>
            <NextLink href="/admin/announcements">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Manage Events
              </Button>
            </NextLink>
            <NextLink href="/admin/users">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </NextLink>
            <NextLink href="/admin/settings">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </NextLink>
            <NextLink href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Activity className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </NextLink>
            <NextLink href="/admin/logs">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="w-4 h-4 mr-2" />
                System Logs
              </Button>
            </NextLink>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

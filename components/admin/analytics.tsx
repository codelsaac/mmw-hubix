"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, Eye, Clock, Download } from "lucide-react"

const usageData = [
  { name: "Mon", users: 45, pageViews: 234 },
  { name: "Tue", users: 52, pageViews: 287 },
  { name: "Wed", users: 48, pageViews: 256 },
  { name: "Thu", users: 61, pageViews: 342 },
  { name: "Fri", users: 55, pageViews: 298 },
  { name: "Sat", users: 23, pageViews: 123 },
  { name: "Sun", users: 18, pageViews: 98 },
]

const resourceData = [
  { name: "Student Portal", clicks: 1250, color: "#003366" },
  { name: "Library System", clicks: 890, color: "#FFD700" },
  { name: "E-Learning", clicks: 567, color: "#87CEEB" },
  { name: "Exam Schedule", clicks: 234, color: "#4A90E2" },
]

export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor system usage and performance metrics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Users", value: "156", change: "+12%", icon: Users, color: "text-blue-600" },
          { title: "Page Views", value: "2,847", change: "+8%", icon: Eye, color: "text-green-600" },
          { title: "Avg. Session", value: "12m 34s", change: "+5%", icon: Clock, color: "text-purple-600" },
          { title: "Resources Used", value: "24", change: "+3", icon: Download, color: "text-orange-600" },
        ].map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span> from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Usage Trends</CardTitle>
            <CardDescription>Daily active users and page views</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#003366" strokeWidth={2} />
                <Line type="monotone" dataKey="pageViews" stroke="#FFD700" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>Most accessed resources this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="clicks"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>Real-time system health and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Server Response Time", value: "245ms", status: "good" },
              { label: "Database Queries", value: "1,234/min", status: "good" },
              { label: "Error Rate", value: "0.02%", status: "excellent" },
              { label: "Uptime", value: "99.98%", status: "excellent" },
              { label: "Storage Used", value: "2.4GB / 10GB", status: "good" },
              { label: "Active Sessions", value: "23", status: "normal" },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <p className="text-lg font-bold">{metric.value}</p>
                </div>
                <Badge
                  variant={
                    metric.status === "excellent" ? "default" : metric.status === "good" ? "secondary" : "outline"
                  }
                >
                  {metric.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

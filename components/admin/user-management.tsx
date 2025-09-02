"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, UserPlus, Edit, Trash2, Shield, Mail, Calendar } from "lucide-react"

const mockUsers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@school.edu",
    role: "admin",
    status: "active",
    joinDate: "2023-09-01",
    lastLogin: "2024-01-15",
    avatar: "/professional-woman-diverse.png",
    specialties: ["Network Management", "Security"],
  },
  {
    id: 2,
    name: "Marcus Johnson",
    email: "marcus.johnson@school.edu",
    role: "admin",
    status: "active",
    joinDate: "2023-09-01",
    lastLogin: "2024-01-14",
    avatar: "/professional-man.png",
    specialties: ["Hardware Support", "Training"],
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@school.edu",
    role: "prefect",
    status: "active",
    joinDate: "2023-10-15",
    lastLogin: "2024-01-15",
    avatar: "/professional-woman-tech.png",
    specialties: ["Software Support", "Documentation"],
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@school.edu",
    role: "prefect",
    status: "active",
    joinDate: "2023-11-01",
    lastLogin: "2024-01-13",
    avatar: "/professional-man-tech.png",
    specialties: ["Database Management", "Web Development"],
  },
  {
    id: 5,
    name: "Alex Thompson",
    email: "alex.thompson@school.edu",
    role: "prefect",
    status: "pending",
    joinDate: "2024-01-10",
    lastLogin: "Never",
    avatar: "/young-professional.png",
    specialties: ["User Support", "Mobile Devices"],
  },
]

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [editingUser, setEditingUser] = useState<(typeof mockUsers)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
  }

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
  }

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === "admin" ? "default" : "secondary"
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "inactive":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage IT Prefect team members and their roles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingUser(null)
                setIsDialogOpen(true)
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <UserDialog
            user={editingUser}
            onSave={(userData) => {
              if (editingUser) {
                setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)))
              } else {
                const newUser = {
                  id: Date.now(),
                  ...userData,
                  joinDate: new Date().toISOString().split("T")[0],
                  lastLogin: "Never",
                  avatar: "/placeholder.svg",
                }
                setUsers([...users, newUser])
              }
              setEditingUser(null)
              setIsDialogOpen(false)
            }}
            onCancel={() => {
              setEditingUser(null)
              setIsDialogOpen(false)
            }}
          />
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="prefect">Prefect</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {user.role === "admin" ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          "Prefect"
                        )}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingUser(user)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last login: {user.lastLogin === "Never" ? "Never" : new Date(user.lastLogin).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {user.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prefect">Prefect</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={user.status} onValueChange={(value) => handleStatusChange(user.id, value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function UserDialog({
  user,
  onSave,
  onCancel,
}: {
  user: (typeof mockUsers)[0] | null
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "prefect",
    status: user?.status || "pending",
    specialties: user?.specialties || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogDescription>
          {user ? "Update user information and permissions." : "Add a new IT Prefect team member."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            School Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john.doe@school.edu"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefect">Prefect</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{user ? "Update" : "Add"} User</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

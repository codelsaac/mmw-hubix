"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, UserPlus, Edit, Trash2 } from "lucide-react"
import { AddUserForm } from "./add-user-form"
import { logger } from "@/lib/logger"

type RoleValue = 'ADMIN' | 'HELPER' | 'GUEST'

interface UserForGrid {
  id: string
  name?: string | null
  email?: string | null
  role: RoleValue
  department?: string | null
  isActive?: boolean
  lastLoginAt?: string | null
}

const ROLE_OPTIONS: RoleValue[] = ['ADMIN', 'HELPER', 'GUEST']

export function UserManagementSimple() {
  const [users, setUsers] = useState<UserForGrid[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserForGrid | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data: any[] = await response.json()
        const formattedUsers: UserForGrid[] = data.map((user: any) => ({
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          role: user.role as RoleValue,
          department: user.department ?? null,
          isActive: user.isActive ?? true,
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null
        }))
        setUsers(formattedUsers)
      } catch (error) {
        logger.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const name = (user.name ?? '').toLowerCase()
    const email = (user.email ?? '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  const handleEditUser = (user: UserForGrid) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
      }
    } catch (error) {
      logger.error('Error deleting user:', error)
    }
  }

  const handleUpdateUser = async (updatedUser: UserForGrid) => {
    try {
      const response = await fetch(`/api/admin/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      })
      if (response.ok) {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
        setEditingUser(null)
        setIsDialogOpen(false)
      }
    } catch (error) {
      logger.error('Error updating user:', error)
    }
  }

  const getRoleBadgeVariant = (role: RoleValue) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'HELPER': return 'default'
      case 'GUEST': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Update user information' : 'Create a new user account'}
                  </DialogDescription>
                </DialogHeader>
                <AddUserForm 
                  user={editingUser}
                  onSuccess={() => {
                    setIsDialogOpen(false)
                    setEditingUser(null)
                    // Refresh users list
                    window.location.reload()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Department</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Last Login</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-4 align-middle">{user.name || 'N/A'}</td>
                      <td className="p-4 align-middle">{user.email || 'N/A'}</td>
                      <td className="p-4 align-middle">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">{user.department || 'N/A'}</td>
                      <td className="p-4 align-middle">
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
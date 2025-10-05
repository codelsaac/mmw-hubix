"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Search, UserPlus, Trash2 } from "lucide-react"
import { AddUserForm } from "./add-user-form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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

export function UserManagement() {
  const [users, setUsers] = useState<UserForGrid[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setIsLoading(true)
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
      console.error(error)
      alert("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  function handleAddUserSuccess(newUser: any) {
    const formattedUser: UserForGrid = {
      id: newUser.id,
      name: newUser.name ?? null,
      email: newUser.email ?? null,
      role: newUser.role as RoleValue,
      department: newUser.department ?? null,
      isActive: newUser.isActive ?? true,
      lastLoginAt: newUser.lastLoginAt ? new Date(newUser.lastLoginAt).toISOString() : null
    }
    setUsers(prev => [...prev, formattedUser])
    setIsDialogOpen(false)
    alert("User added successfully")
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [userId] })
      })
      if (!res.ok) throw new Error('Failed to delete user')
      setUsers(prev => prev.filter(u => u.id !== userId))
      alert("User deleted successfully")
    } catch (e) {
      console.error(e)
      alert("Failed to delete user")
    }
  }

  const filteredUsers = users.filter((user) => {
    const name = (user.name ?? '').toLowerCase()
    const email = (user.email ?? '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  const getRoleBadgeVariant = (role: RoleValue) => {
    switch (role) {
      case 'ADMIN': return 'default'
      case 'HELPER': return 'secondary'
      case 'GUEST': return 'outline'
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
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <AddUserForm onSuccess={handleAddUserSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.id}</TableCell>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


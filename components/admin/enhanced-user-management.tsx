"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  Users,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Settings
} from "lucide-react"
import { AddUserForm } from "./add-user-form"
import { logger } from "@/lib/logger"

type RoleValue = 'ADMIN' | 'HELPER' | 'STUDENT'
type UserStatus = 'active' | 'inactive' | 'all'

interface UserForGrid {
  id: string
  username: string
  name?: string | null
  email?: string | null
  role: RoleValue
  department?: string | null
  isActive: boolean
  lastLoginAt?: string | null
  createdAt?: string | null
}

interface FilterState {
  search: string
  role: RoleValue | 'all'
  department: string
  status: UserStatus
}



const IT_DEPARTMENTS = [
  'IT Management',
  'System Administration',
  'Network Operations',
  'Development',
  'Security',
  'Support',
  'Training',
  'General'
]

export function EnhancedUserManagement() {
  const [users, setUsers] = useState<UserForGrid[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserForGrid | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: 'all',
    department: 'all',
    status: 'all'
  })
  
  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data: any[] = await response.json()
      const formattedUsers: UserForGrid[] = data.map((user: any) => ({
        id: user.id,
        username: user.username,
        name: user.name ?? null,
        email: user.email ?? null,
        role: user.role as RoleValue,
        department: user.department ?? null,
        isActive: user.isActive ?? true,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined
      }))
      setUsers(formattedUsers)
    } catch (error) {
      logger.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and search logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = !filters.search || 
      user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.username.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesRole = filters.role === 'all' || user.role === filters.role
    const matchesDepartment = filters.department === 'all' || user.department === filters.department
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && user.isActive) ||
      (filters.status === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(user => user.id)))
    }
  }

  const handleEditUser = (user: UserForGrid) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const mapToGridUser = (user: any): UserForGrid => ({
    id: user.id,
    username: user.username,
    name: user.name ?? null,
    email: user.email ?? null,
    role: user.role as RoleValue,
    department: user.department ?? null,
    isActive: user.isActive ?? true,
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined
  })

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [userId] })
      })
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        setSelectedUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      }
    } catch (error) {
      logger.error('Error deleting user:', error)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedUsers.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)?`)) return
    
    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedUsers) })
      })
      if (response.ok) {
        setUsers(users.filter(u => !selectedUsers.has(u.id)))
        setSelectedUsers(new Set())
      }
    } catch (error) {
      logger.error('Error batch deleting users:', error)
    }
  }

  const handleBatchRoleUpdate = async (newRole: RoleValue) => {
    if (selectedUsers.size === 0) return
    
    try {
      const updates = Array.from(selectedUsers).map(id => ({ id, role: newRole }))
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        const updatedUsers = await response.json()
        setUsers(prev => prev.map(user => 
          selectedUsers.has(user.id) 
            ? { ...user, role: newRole }
            : user
        ))
        setSelectedUsers(new Set())
      }
    } catch (error) {
      logger.error('Error updating user roles:', error)
    }
  }

  const handleBatchStatusUpdate = async (isActive: boolean) => {
    if (selectedUsers.size === 0) return
    
    try {
      const updates = Array.from(selectedUsers).map(id => ({ id, isActive }))
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          selectedUsers.has(user.id) 
            ? { ...user, isActive }
            : user
        ))
        setSelectedUsers(new Set())
      }
    } catch (error) {
      logger.error('Error updating user status:', error)
    }
  }

  const getRoleBadgeVariant = (role: RoleValue) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'HELPER': return 'default'
      case 'STUDENT': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusBadge = (user: UserForGrid) => {
    return user.isActive ? (
      <Badge variant="outline" className="text-green-600 border-green-600">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-600">
        <UserX className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const uniqueDepartments = Array.from(new Set(users.map(u => u.department).filter(Boolean)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management ({filteredUsers.length} users)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              >
                {viewMode === 'table' ? 'Card View' : 'Table View'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="max-w-sm"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={filters.role} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, role: value as RoleValue }))
                }>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="HELPER">Helper</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.department} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, department: value }))
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, status: value as UserStatus }))
                }>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ search: '', role: 'all', department: 'all', status: 'all' })}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Batch Actions */}
            {selectedUsers.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUsers.size} user(s) selected
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-1" />
                        Change Role
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Set Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBatchRoleUpdate('ADMIN')}>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchRoleUpdate('HELPER')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Helper
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchRoleUpdate('STUDENT')}>
                        <Users className="h-4 w-4 mr-2" />
                        Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBatchStatusUpdate(true)}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchStatusUpdate(false)}>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedUsers(new Set())}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Add User Button */}
            <div className="flex items-center justify-between">
              <div />
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
                    onSuccess={(savedUser) => {
                      const formattedUser = mapToGridUser(savedUser)
                      setUsers(prev => {
                        const exists = prev.some(u => u.id === formattedUser.id)
                        return exists
                          ? prev.map(u => (u.id === formattedUser.id ? formattedUser : u))
                          : [formattedUser, ...prev]
                      })
                      setIsDialogOpen(false)
                      setEditingUser(null)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username} {user.email && `• ${user.email}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedUsers.map((user) => (
                <Card key={user.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg">{user.name || 'N/A'}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      @{user.username}
                      {user.email && <div>{user.email}</div>}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                        {getStatusBadge(user)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Department: {user.department || 'N/A'}</div>
                        <div>
                          Last Login: {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2)
                    if (page > totalPages) return null
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
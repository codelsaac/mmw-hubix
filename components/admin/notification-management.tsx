"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle, Clock, Users, User, Globe, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ANNOUNCEMENT', 'SYSTEM']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  link: z.string().url().optional().or(z.literal('')),
  targetType: z.enum(['all', 'role', 'user', 'guests']),
  targetRole: z.enum(['ADMIN', 'HELPER', 'GUEST']).optional(),
  targetUserId: z.string().optional(),
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  isRead: boolean
  userId: string | null
  link: string | null
  metadata: string | null
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  username: string
  role: string
  isActive: boolean
}

const notificationTypes = [
  { value: 'INFO', label: 'Information', color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'SUCCESS', label: 'Success', color: 'text-green-500', bg: 'bg-green-50' },
  { value: 'WARNING', label: 'Warning', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { value: 'ERROR', label: 'Error', color: 'text-red-500', bg: 'bg-red-50' },
  { value: 'ANNOUNCEMENT', label: 'Announcement', color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: 'SYSTEM', label: 'System', color: 'text-gray-500', bg: 'bg-gray-50' },
]

const priorityLevels = [
  { value: 'LOW', label: 'Low', color: 'text-gray-500', bg: 'bg-gray-50' },
  { value: 'NORMAL', label: 'Normal', color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'HIGH', label: 'High', color: 'text-orange-500', bg: 'bg-orange-50' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-500', bg: 'bg-red-50' },
]

export function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'INFO',
      priority: 'NORMAL',
      link: '',
      targetType: 'all',
    },
  })

  const targetType = form.watch('targetType')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [notificationsRes, usersRes] = await Promise.all([
        fetch('/api/admin/notifications'),
        fetch('/api/admin/users'),
      ])

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        setNotifications(notificationsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.filter((user: User) => user.isActive))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: NotificationFormData) => {
    try {
      setIsSubmitting(true)

      const payload = {
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        link: data.link || undefined,
        targetType: data.targetType,
        targetRole: data.targetRole,
        targetUserId: data.targetUserId,
      }

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Notification sent successfully')
        form.reset()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id] }),
      })

      if (response.ok) {
        toast.success('Notification deleted')
        fetchData()
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'WARNING': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'ANNOUNCEMENT': return <Users className="w-4 h-4 text-purple-500" />
      case 'SYSTEM': return <Clock className="w-4 h-4 text-gray-500" />
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />
    }
  }

  const getTargetDescription = (notification: Notification) => {
    if (notification.userId === null) {
      try {
        const metadata = JSON.parse(notification.metadata || '{}')
        if (metadata.targetType === 'all') {
          return 'All users (including guests)'
        } else if (metadata.targetType === 'role') {
          return `${metadata.targetRole} users`
        } else if (metadata.targetType === 'guests') {
          return 'Guest users only'
        }
        return 'All users (including guests)'
      } catch {
        return 'All users (including guests)'
      }
    }
    const user = users.find(u => u.id === notification.userId)
    return user ? `User: ${user.username}` : 'Unknown user'
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Send Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
          <CardDescription>
            Create and send notifications to users or groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Notification title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notification message" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {notificationTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <span className={cn('w-2 h-2 rounded-full', type.bg)} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityLevels.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center gap-2">
                                <span className={cn('w-2 h-2 rounded-full', priority.bg)} />
                                {priority.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional link that users can click to navigate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            All users (including guests)
                          </div>
                        </SelectItem>
                        <SelectItem value="guests">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Guest users only
                          </div>
                        </SelectItem>
                        <SelectItem value="role">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Specific role
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Specific user
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {targetType === 'role' && (
                <FormField
                  control={form.control}
                  name="targetRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="HELPER">Helper</SelectItem>
                          <SelectItem value="GUEST">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {targetType === 'user' && (
                <FormField
                  control={form.control}
                  name="targetUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{user.role}</Badge>
                                {user.username}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Sending...' : 'Send Notification'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            View and manage sent notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] lg:h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications sent</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <div>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {getTargetDescription(notification)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                        <Badge 
                          variant={notification.priority === 'URGENT' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <span>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}


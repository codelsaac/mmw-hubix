"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Bell, Check, CheckCheck, X, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useNotifications, type Notification } from '@/hooks/use-notifications'
import { toast } from 'sonner'

const notificationIcons = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ERROR: AlertCircle,
  ANNOUNCEMENT: Megaphone,
  SYSTEM: Info,
}

const notificationColors = {
  INFO: 'text-blue-500',
  SUCCESS: 'text-green-500',
  WARNING: 'text-yellow-500',
  ERROR: 'text-red-500',
  ANNOUNCEMENT: 'text-purple-500',
  SYSTEM: 'text-gray-500',
}

const priorityColors = {
  LOW: 'border-l-gray-300',
  NORMAL: 'border-l-blue-400',
  HIGH: 'border-l-orange-400',
  URGENT: 'border-l-red-500',
}

function NotificationItem({ notification, onMarkRead, onDelete }: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const Icon = notificationIcons[notification.type]
  const iconColor = notificationColors[notification.type]
  const priorityColor = priorityColors[notification.priority]

  const content = (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg border-l-4 transition-colors',
        priorityColor,
        notification.isRead
          ? 'bg-muted/30 hover:bg-muted/50'
          : 'bg-background hover:bg-muted/30 font-medium'
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconColor)} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            'text-sm leading-tight',
            notification.isRead && 'text-muted-foreground'
          )}>
            {notification.title}
          </h4>
          {!notification.isRead && (
            <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
          )}
        </div>
        
        <p className={cn(
          'text-xs mt-1 line-clamp-2',
          notification.isRead ? 'text-muted-foreground' : 'text-foreground/80'
        )}>
          {notification.message}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {new Date(notification.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          
          <div className="flex gap-1">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onMarkRead(notification.id)
                }}
              >
                <Check className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(notification.id)
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={() => onMarkRead(notification.id)}>
        {content}
      </Link>
    )
  }

  return content
}

export function NotificationBar() {
  const { status } = useSession()
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    deleteAllRead,
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)

  // Don't render notification bell if user is not authenticated
  if (status !== 'authenticated') {
    return null
  }

  const handleMarkRead = async (id: string) => {
    const success = await markAsRead([id])
    if (success) {
      toast.success('Notification marked as read')
    }
  }

  const handleMarkAllRead = async () => {
    const success = await markAllAsRead()
    if (success) {
      toast.success('All notifications marked as read')
    }
  }

  const handleDelete = async (id: string) => {
    const success = await deleteNotifications([id])
    if (success) {
      toast.success('Notification deleted')
    }
  }

  const handleDeleteAllRead = async () => {
    const success = await deleteAllRead()
    if (success) {
      toast.success('Read notifications cleared')
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-8 px-2"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all
              </Button>
            )}
            {notifications.some(n => n.isRead) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteAllRead}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

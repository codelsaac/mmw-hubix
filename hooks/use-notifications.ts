"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { logger } from '@/lib/logger'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ANNOUNCEMENT' | 'SYSTEM'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isRead: boolean
  userId?: string | null
  link?: string | null
  metadata?: string | null
  createdAt: string
  updatedAt: string
}

export function useNotifications() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async (unreadOnly: boolean = false) => {
    // Don't fetch if user is not authenticated or still loading
    if (status === 'loading') {
      setIsLoading(true)
      return
    }
    
    if (status !== 'authenticated' || !session?.user) {
      setIsLoading(false)
      setNotifications([])
      setUnreadCount(0)
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const url = `/api/notifications?unreadOnly=${unreadOnly}&limit=50`
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        // Silently fail for 401/403 errors (authentication/authorization issues)
        if (response.status === 401 || response.status === 403) {
          setNotifications([])
          setUnreadCount(0)
          setError(null) // Don't set error for auth issues
          return
        }
        throw new Error('Failed to fetch notifications')
      }
      
      const data: Notification[] = await response.json()
      setNotifications(data)
      
      // Count unread notifications
      const unread = data.filter(n => !n.isRead).length
      setUnreadCount(unread)
      
    } catch (err) {
      // Silently fail - don't log errors for unauthenticated users
      if (status === 'authenticated') {
        logger.error('Error fetching notifications:', err)
        setError(err instanceof Error ? err.message : 'Failed to load notifications')
      }
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [session, status])

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read')
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      )
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))

      return true
    } catch (err) {
      logger.error('Error marking notifications as read:', err)
      return false
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)

      return true
    } catch (err) {
      logger.error('Error marking all notifications as read:', err)
      return false
    }
  }, [])

  const deleteNotifications = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete notifications')
      }

      // Update local state
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)))
      
      // Update unread count
      const deletedUnread = notifications.filter(
        n => notificationIds.includes(n.id) && !n.isRead
      ).length
      setUnreadCount(prev => Math.max(0, prev - deletedUnread))

      return true
    } catch (err) {
      logger.error('Error deleting notifications:', err)
      return false
    }
  }, [notifications])

  const deleteAllRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete read notifications')
      }

      // Update local state - keep only unread
      setNotifications(prev => prev.filter(n => !n.isRead))

      return true
    } catch (err) {
      logger.error('Error deleting read notifications:', err)
      return false
    }
  }, [])

  // Auto-refresh every 30 seconds (only for authenticated users)
  useEffect(() => {
    // Only fetch and refresh for authenticated users
    if (status === 'authenticated' && session?.user) {
      fetchNotifications()
      
      const interval = setInterval(() => {
        fetchNotifications()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    } else if (status === 'unauthenticated') {
      // Clear notifications for unauthenticated users
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      setError(null)
    }
  }, [fetchNotifications, status, session])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    deleteAllRead,
  }
}

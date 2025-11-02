"use client"

import useSWR from 'swr'
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

// Fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  
  if (!response.ok) {
    // Don't throw for auth errors, just return empty array
    if (response.status === 401 || response.status === 403) {
      return []
    }
    throw new Error('Failed to fetch notifications')
  }
  
  return response.json()
}

export function useNotifications() {
  const { data: session, status } = useSession()
  
  // Only fetch when authenticated
  const shouldFetch = status === 'authenticated' && session?.user
  
  // Use SWR for automatic polling and deduplication
  const { data, error, mutate, isLoading } = useSWR<Notification[]>(
    shouldFetch ? '/api/notifications?unreadOnly=false&limit=50' : null,
    fetcher,
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: false, // Don't refetch on tab focus
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 1,
      shouldRetryOnError: false,
    }
  )
  
  const notifications = data || []
  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read')
      }

      // Optimistically update
      await mutate(
        notifications.map(n =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        ),
        false
      )

      return true
    } catch (err) {
      logger.error('Error marking notifications as read:', err)
      return false
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Optimistically update
      await mutate(
        notifications.map(n => ({ ...n, isRead: true })),
        false
      )

      return true
    } catch (err) {
      logger.error('Error marking all notifications as read:', err)
      return false
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete notifications')
      }

      // Optimistically update
      await mutate(
        notifications.filter(n => !notificationIds.includes(n.id)),
        false
      )

      return true
    } catch (err) {
      logger.error('Error deleting notifications:', err)
      return false
    }
  }

  const deleteAllRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete read notifications')
      }

      // Optimistically update - keep only unread
      await mutate(
        notifications.filter(n => !n.isRead),
        false
      )

      return true
    } catch (err) {
      logger.error('Error deleting read notifications:', err)
      return false
    }
  }

  // Sync guest read state on login
  const syncGuestReadState = async (guestReadIds: string[]) => {
    if (guestReadIds.length === 0) return

    try {
      // Mark notifications that were read as guest
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: guestReadIds }),
      })

      if (response.ok) {
        await mutate() // Refresh notifications
        logger.log(`Synced ${guestReadIds.length} guest read notifications`)
      }
    } catch (err) {
      logger.error('Error syncing guest read state:', err)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error: error ? 'Failed to load notifications' : null,
    fetchNotifications: mutate, // SWR's mutate revalidates
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    deleteAllRead,
    syncGuestReadState,
  }
}

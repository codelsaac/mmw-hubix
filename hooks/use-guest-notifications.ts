"use client"

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { logger } from '@/lib/logger'

export interface GuestNotification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ANNOUNCEMENT' | 'SYSTEM'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  link?: string | null
  metadata?: string | null
  createdAt: string
  updatedAt: string
}

interface LocalNotificationState {
  readIds: string[]
  lastActivity: number
}

const STORAGE_KEY = 'mmw-hubix-guest-notifications'
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

// Fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch public notifications')
  }
  
  return response.json()
}

function getLocalState(): LocalNotificationState {
  if (typeof window === 'undefined') {
    return { readIds: [], lastActivity: Date.now() }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { readIds: [], lastActivity: Date.now() }
    }

    const state: LocalNotificationState = JSON.parse(stored)
    
    // Check if data is older than 1 year
    if (Date.now() - state.lastActivity > ONE_YEAR_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return { readIds: [], lastActivity: Date.now() }
    }

    return state
  } catch (error) {
    logger.error('Error loading guest notification state:', error)
    return { readIds: [], lastActivity: Date.now() }
  }
}

function saveLocalState(state: LocalNotificationState) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      lastActivity: Date.now()
    }))
  } catch (error) {
    logger.error('Error saving guest notification state:', error)
  }
}

export function useGuestNotifications() {
  const [localState, setLocalState] = useState<LocalNotificationState>(() => getLocalState())

  // Use SWR for automatic polling
  const { data, error, mutate, isLoading } = useSWR<GuestNotification[]>(
    '/api/public/notifications?limit=50',
    fetcher,
    {
      refreshInterval: 60000, // Poll every 60 seconds for guests
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      errorRetryCount: 2,
      shouldRetryOnError: true,
    }
  )

  const notifications = (data || []).map(n => ({
    ...n,
    isRead: localState.readIds.includes(n.id)
  }))

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = async (notificationIds: string[]) => {
    const newState = {
      ...localState,
      readIds: [...new Set([...localState.readIds, ...notificationIds])]
    }
    setLocalState(newState)
    saveLocalState(newState)
    return true
  }

  const markAllAsRead = async () => {
    const allIds = notifications.map(n => n.id)
    const newState = {
      ...localState,
      readIds: [...new Set([...localState.readIds, ...allIds])]
    }
    setLocalState(newState)
    saveLocalState(newState)
    return true
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    await markAsRead(notificationIds)
    return true
  }

  const deleteAllRead = async () => {
    // For guests, this is a no-op since we keep read state
    // Could optionally clear old read IDs in future
    return true
  }

  // Export read state for syncing on login
  const getReadState = () => localState.readIds

  // Clear local state (used after sync on login)
  const clearLocalState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    setLocalState({ readIds: [], lastActivity: Date.now() })
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error: error ? 'Failed to load notifications' : null,
    fetchNotifications: mutate,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    deleteAllRead,
    getReadState,
    clearLocalState,
  }
}

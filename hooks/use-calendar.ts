"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"

import { logger } from "@/lib/logger"
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  eventType: 'meeting' | 'training' | 'maintenance' | 'orientation' | 'general'
  attendees?: string[]
  isInternal?: boolean
  createdBy?: string
  creator?: {
    name?: string
    email?: string
  }
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let internalEvents: CalendarEvent[] = []

      // Load internal events (IT Prefect only) when authenticated
      if (isAuthenticated) {
        const internalResponse = await fetch('/api/dashboard/internal-events')
        if (internalResponse.ok) {
          const data = await internalResponse.json()
          internalEvents = data.map((event: any) => ({
            ...event,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            isInternal: true,
            attendees: event.attendees ? JSON.parse(event.attendees) : []
          }))
        }
      }

      // Load public events
      let publicEvents: CalendarEvent[] = []

      if (isAuthenticated) {
        const adminResponse = await fetch('/api/admin/calendar')
        if (adminResponse.ok) {
          const data = await adminResponse.json()
          publicEvents = data.map((event: any) => ({
            ...event,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            isInternal: false
          }))
        } else {
          const fallbackResponse = await fetch('/api/public/calendar')
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json()
            publicEvents = data.map((event: any) => ({
              ...event,
              startTime: new Date(event.startTime),
              endTime: new Date(event.endTime),
              isInternal: false
            }))
          }
        }
      } else {
        const publicResponse = await fetch('/api/public/calendar')
        if (publicResponse.ok) {
          const data = await publicResponse.json()
          publicEvents = data.map((event: any) => ({
            ...event,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            isInternal: false
          }))
        }
      }

      setEvents([...internalEvents, ...publicEvents])
    } catch (err) {
      logger.error('Error loading calendar events:', err)
      setError('Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Create internal event
  const createInternalEvent = async (eventData: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    location?: string
    eventType?: string
    attendees?: string[]
  }) => {
    try {
      const response = await fetch('/api/dashboard/internal-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          startTime: eventData.startTime.toISOString(),
          endTime: eventData.endTime.toISOString(),
          attendees: eventData.attendees || []
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        logger.error('Internal Event API Error:', response.status, errorData)
        throw new Error(`Failed to create internal event: ${response.status} - ${errorData}`)
      }

      const newEvent = await response.json()
      
      // Add to local state
      const formattedEvent: CalendarEvent = {
        ...newEvent,
        startTime: new Date(newEvent.startTime),
        endTime: new Date(newEvent.endTime),
        isInternal: true,
        attendees: newEvent.attendees ? JSON.parse(newEvent.attendees) : []
      }
      
      setEvents(prev => [...prev, formattedEvent])
      return formattedEvent
    } catch (err) {
      logger.error('Error creating internal event:', err)
      throw err
    }
  }

  // Create public calendar event
  const createPublicEvent = async (eventData: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    location?: string
    eventType?: string
    isVisible?: boolean
  }) => {
    try {
      const response = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          startTime: eventData.startTime.toISOString(),
          endTime: eventData.endTime.toISOString(),
          isVisible: eventData.isVisible ?? true
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        logger.error('API Error:', response.status, errorData)
        throw new Error(`Failed to create public event: ${response.status} - ${errorData}`)
      }

      const newEvent = await response.json()
      
      // Add to local state
      const formattedEvent: CalendarEvent = {
        ...newEvent,
        startTime: new Date(newEvent.startTime),
        endTime: new Date(newEvent.endTime),
        isInternal: false
      }
      
      setEvents(prev => [...prev, formattedEvent])
      return formattedEvent
    } catch (err) {
      logger.error('Error creating public event:', err)
      throw err
    }
  }

  // Update event
  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const event = events.find(e => e.id === eventId)
      if (!event) throw new Error('Event not found')

      const endpoint = event.isInternal 
        ? `/api/dashboard/internal-events/${eventId}`
        : `/api/admin/calendar/${eventId}`

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      const updatedEvent = await response.json()
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? {
              ...updatedEvent,
              startTime: new Date(updatedEvent.startTime),
              endTime: new Date(updatedEvent.endTime),
              isInternal: event.isInternal,
              attendees: updatedEvent.attendees ? JSON.parse(updatedEvent.attendees) : []
            }
          : e
      ))

      return updatedEvent
    } catch (err) {
      logger.error('Error updating event:', err)
      throw err
    }
  }

  // Delete event
  const deleteEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId)
      if (!event) throw new Error('Event not found')

      const endpoint = event.isInternal 
        ? `/api/dashboard/internal-events/${eventId}`
        : `/api/admin/calendar/${eventId}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      // Remove from local state
      setEvents(prev => prev.filter(e => e.id !== eventId))
      return true
    } catch (err) {
      logger.error('Error deleting event:', err)
      throw err
    }
  }

  // Load events on mount
  useEffect(() => {
    loadEvents()
  }, [isAuthenticated, loadEvents])

  return {
    events,
    loading,
    error,
    loadEvents,
    createInternalEvent,
    createPublicEvent,
    updateEvent,
    deleteEvent,
  }
}

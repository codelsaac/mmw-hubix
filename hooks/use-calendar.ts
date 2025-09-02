"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"

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
  const { user, isAuthenticated } = useAuth()

  // Load events from database
  const loadEvents = async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      // Load internal events (IT Prefect only)
      const internalResponse = await fetch('/api/dashboard/internal-events')
      let internalEvents: CalendarEvent[] = []
      
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

      // Load public events (that admins/IT can manage)
      const publicResponse = await fetch('/api/admin/calendar')
      let publicEvents: CalendarEvent[] = []
      
      if (publicResponse.ok) {
        const data = await publicResponse.json()
        publicEvents = data.map((event: any) => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          isInternal: false
        }))
      } else if (publicResponse.status !== 401) {
        // If not unauthorized, try public endpoint
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

      setEvents([...internalEvents, ...publicEvents])
    } catch (err) {
      console.error('Error loading calendar events:', err)
      setError('Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }

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
        console.error('Internal Event API Error:', response.status, errorData)
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
      console.error('Error creating internal event:', err)
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
        console.error('API Error:', response.status, errorData)
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
      console.error('Error creating public event:', err)
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
      console.error('Error updating event:', err)
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
      console.error('Error deleting event:', err)
      throw err
    }
  }

  // Load events on mount
  useEffect(() => {
    loadEvents()
  }, [isAuthenticated])

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

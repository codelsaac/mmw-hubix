"use client"

import { useState, useEffect } from 'react'

import { logger } from "@/lib/logger"
interface Settings {
  isMaintenanceMode: boolean
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    isMaintenanceMode: false
  })
  const [isHydrated, setIsHydrated] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setSettings(parsed)
        } catch (error) {
          logger.error('Failed to parse saved settings:', error)
        }
      }
    }
  }, [])

  // Save settings to localStorage whenever they change (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('app-settings', JSON.stringify(settings))
    }
  }, [settings, isHydrated])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return {
    ...settings,
    updateSettings,
    isHydrated
  }
}

"use client"

import { useState, useEffect } from 'react'

interface Settings {
  isMaintenanceMode: boolean
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    isMaintenanceMode: false
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return {
    ...settings,
    updateSettings
  }
}

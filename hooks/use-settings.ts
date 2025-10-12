"use client"

import { useState, useEffect, useCallback } from 'react'
import { logger } from "@/lib/logger"
import { toast } from "sonner"

export interface Settings {
  // General Settings
  siteName: string
  siteDescription: string
  maxFileSize: string
  allowedFileTypes: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  
  // Security Settings
  sessionTimeout: string
  maxLoginAttempts: string
  
  // Notification Settings
  emailNotifications: boolean
  
  // Backup Settings
  autoBackup: boolean
  backupFrequency: string
  
  // Appearance Settings
  colorTheme: string
  
  // Legacy
  isMaintenanceMode?: boolean
}

const defaultSettings: Settings = {
  siteName: "MMW Hubix",
  siteDescription: "School Information Portal for C.C.C. Mong Man Wai College",
  maxFileSize: "10",
  allowedFileTypes: "pdf,doc,docx,jpg,png,mp4",
  maintenanceMode: false,
  registrationEnabled: false,
  sessionTimeout: "30",
  maxLoginAttempts: "5",
  emailNotifications: true,
  autoBackup: true,
  backupFrequency: "weekly",
  colorTheme: "school-blue-yellow",
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load settings from database on mount
  useEffect(() => {
    setIsHydrated(true)
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/settings')
      
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
        logger.log('Settings loaded from database:', data)
      } else {
        // Fallback to localStorage if API fails
        if (typeof window !== 'undefined') {
          const savedSettings = localStorage.getItem('mmw-hubix-settings')
          if (savedSettings) {
            try {
              const parsed = JSON.parse(savedSettings)
              setSettings({ ...defaultSettings, ...parsed })
              logger.log('Settings loaded from localStorage (fallback)')
            } catch (error) {
              logger.error('Failed to parse saved settings:', error)
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load settings:', error)
      // Use default settings on error
      setSettings(defaultSettings)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      // Optimistically update UI
      setSettings(prev => ({ ...prev, ...newSettings }))
      
      // Save to database
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })
      
      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings({ ...defaultSettings, ...updatedSettings })
        logger.log('Settings saved to database:', updatedSettings)
        
        // Also save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('mmw-hubix-settings', JSON.stringify(updatedSettings))
        }
      } else {
        // Revert on error
        await loadSettings()
        toast.error('Failed to save settings to database')
      }
    } catch (error) {
      logger.error('Failed to update settings:', error)
      // Revert on error
      await loadSettings()
      toast.error('Failed to save settings')
    }
  }, [])

  return {
    settings,
    updateSettings,
    isLoading,
    isHydrated,
    refreshSettings: loadSettings,
  }
}

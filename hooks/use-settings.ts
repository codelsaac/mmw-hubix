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
  
  // Backup Settings
  autoBackup: boolean
  backupFrequency: string
  
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
  autoBackup: true,
  backupFrequency: "weekly",
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
      
      // First try public settings (always available)
      const publicResponse = await fetch('/api/settings')
      
      if (publicResponse.ok) {
        const publicData = await publicResponse.json()
        setSettings({ ...defaultSettings, ...publicData })
        logger.log('Public settings loaded from database:', publicData)
        
        // Try to get admin settings if user might be authenticated
        // This won't throw errors, just silently fail if not authenticated
        try {
          const adminResponse = await fetch('/api/admin/settings')
          if (adminResponse.ok) {
            const adminData = await adminResponse.json()
            setSettings({ ...defaultSettings, ...publicData, ...adminData })
            logger.log('Admin settings merged with public settings')
          }
        } catch (adminError) {
          // Silently ignore admin errors - user is not authenticated
          logger.debug('Admin settings not available (user not authenticated)')
        }
      } else {
        // Log response status and try to get error details
        const errorData = await publicResponse.json().catch(() => ({}))
        logger.error(`Public settings endpoint returned ${publicResponse.status}:`, errorData)
        throw new Error(`Public settings endpoint failed with status ${publicResponse.status}: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      logger.error('Failed to load settings:', error)
      
      // Use localStorage fallback
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('mmw-hubix-settings')
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings)
            setSettings({ ...defaultSettings, ...parsed })
            logger.log('Settings loaded from localStorage (fallback)')
            return
          } catch (parseError) {
            logger.error('Failed to parse saved settings:', parseError)
          }
        }
      }
      
      // Use default settings on error
      logger.warn('Using default settings due to error loading from database')
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
        // Handle authentication errors gracefully
        if (response.status === 401 || response.status === 403) {
          toast.error('Authentication required to save settings')
        } else {
          toast.error('Failed to save settings to database')
        }
        
        // Revert on error
        await loadSettings()
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

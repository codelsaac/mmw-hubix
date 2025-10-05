"use client"

import { useState, useEffect } from 'react'
import { logger } from "@/lib/logger"

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
  const [isHydrated, setIsHydrated] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('mmw-hubix-settings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setSettings({ ...defaultSettings, ...parsed })
        } catch (error) {
          logger.error('Failed to parse saved settings:', error)
        }
      }
    }
  }, [])

  // Save settings to localStorage whenever they change (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('mmw-hubix-settings', JSON.stringify(settings))
    }
  }, [settings, isHydrated])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return {
    settings,
    updateSettings,
    isHydrated
  }
}

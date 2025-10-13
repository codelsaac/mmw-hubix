import { prisma } from "@/lib/prisma"

export interface SettingDefinition {
  key: string
  value: string
  category: string
  label?: string
  type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON"
  isPublic?: boolean
}

/**
 * Default settings configuration
 */
export const DEFAULT_SETTINGS: SettingDefinition[] = [
  // General Settings
  {
    key: "siteName",
    value: "MMW Hubix",
    category: "general",
    label: "Site Name",
    type: "STRING",
    isPublic: true,
  },
  {
    key: "siteDescription",
    value: "School Information Portal for C.C.C. Mong Man Wai College",
    category: "general",
    label: "Site Description",
    type: "STRING",
    isPublic: true,
  },
  {
    key: "maxFileSize",
    value: "10",
    category: "general",
    label: "Max File Size (MB)",
    type: "NUMBER",
    isPublic: false,
  },
  {
    key: "allowedFileTypes",
    value: "pdf,doc,docx,jpg,png,mp4",
    category: "general",
    label: "Allowed File Types",
    type: "STRING",
    isPublic: false,
  },
  {
    key: "maintenanceMode",
    value: "false",
    category: "general",
    label: "Maintenance Mode",
    type: "BOOLEAN",
    isPublic: true,
  },
  {
    key: "registrationEnabled",
    value: "false",
    category: "general",
    label: "User Registration",
    type: "BOOLEAN",
    isPublic: false,
  },
  // Security Settings
  {
    key: "sessionTimeout",
    value: "30",
    category: "security",
    label: "Session Timeout (minutes)",
    type: "NUMBER",
    isPublic: false,
  },
  {
    key: "maxLoginAttempts",
    value: "5",
    category: "security",
    label: "Max Login Attempts",
    type: "NUMBER",
    isPublic: false,
  },
  // Notification Settings
  {
    key: "emailNotifications",
    value: "true",
    category: "notifications",
    label: "Email Notifications",
    type: "BOOLEAN",
    isPublic: false,
  },
  // Backup Settings
  {
    key: "autoBackup",
    value: "true",
    category: "backup",
    label: "Automatic Backup",
    type: "BOOLEAN",
    isPublic: false,
  },
  {
    key: "backupFrequency",
    value: "weekly",
    category: "backup",
    label: "Backup Frequency",
    type: "STRING",
    isPublic: false,
  },
]

/**
 * Initialize default settings in database
 */
export async function initializeSettings() {
  try {
    const existingSettings = await prisma.siteSetting.count()
    
    if (existingSettings === 0) {
      // Insert default settings one by one to handle duplicates
      for (const setting of DEFAULT_SETTINGS) {
        try {
          await prisma.siteSetting.create({
            data: setting,
          })
        } catch (error) {
          // Skip if setting already exists (unique constraint violation)
          if ((error as any).code !== 'P2002') {
            throw error
          }
        }
      }
      console.log(`✅ Initialized ${DEFAULT_SETTINGS.length} default settings`)
    }
    
    return true
  } catch (error) {
    console.error("Failed to initialize settings:", error)
    return false
  }
}

/**
 * Get all settings as key-value object
 */
export async function getAllSettings(includePrivate = false) {
  try {
    await initializeSettings()
    
    const settings = await prisma.siteSetting.findMany({
      where: includePrivate ? {} : { isPublic: true },
    })
    
    const settingsObject: Record<string, any> = {}
    
    for (const setting of settings) {
      settingsObject[setting.key] = parseSettingValue(setting.value, setting.type)
    }
    
    return settingsObject
  } catch (error) {
    console.error("Failed to get settings:", error)
    throw error
  }
}

/**
 * Get setting by key
 */
export async function getSetting(key: string) {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    })
    
    if (!setting) {
      // Return default if exists
      const defaultSetting = DEFAULT_SETTINGS.find((s) => s.key === key)
      if (defaultSetting) {
        return parseSettingValue(defaultSetting.value, defaultSetting.type)
      }
      return null
    }
    
    return parseSettingValue(setting.value, setting.type)
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error)
    return null
  }
}

/**
 * Update single setting
 */
export async function updateSetting(key: string, value: any) {
  try {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value)
    
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: stringValue },
      create: {
        key,
        value: stringValue,
        category: "general",
        type: "STRING",
      },
    })
    
    return setting
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error)
    throw error
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(settings: Record<string, any>) {
  try {
    const updates = Object.entries(settings).map(([key, value]) => {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value)
      
      return prisma.siteSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: {
          key,
          value: stringValue,
          category: "general",
          type: typeof value === "boolean" ? "BOOLEAN" : typeof value === "number" ? "NUMBER" : "STRING",
        },
      })
    })
    
    await Promise.all(updates)
    
    return true
  } catch (error) {
    console.error("Failed to update settings:", error)
    throw error
  }
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(category: string) {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { category },
    })
    
    const settingsObject: Record<string, any> = {}
    
    for (const setting of settings) {
      settingsObject[setting.key] = parseSettingValue(setting.value, setting.type)
    }
    
    return settingsObject
  } catch (error) {
    console.error(`Failed to get settings for category ${category}:`, error)
    throw error
  }
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string) {
  try {
    await prisma.siteSetting.delete({
      where: { key },
    })
    
    return true
  } catch (error) {
    console.error(`Failed to delete setting ${key}:`, error)
    throw error
  }
}

/**
 * Helper function to parse setting value based on type
 */
function parseSettingValue(value: string, type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON"): any {
  switch (type) {
    case "BOOLEAN":
      return value === "true" || value === "1"
    case "NUMBER":
      return parseFloat(value)
    case "JSON":
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    case "STRING":
    default:
      return value
  }
}

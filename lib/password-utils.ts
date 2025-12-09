// For demo purposes, we'll store updated passwords in a simple in-memory store
// In a real application, this would be stored securely in the database
const passwordUpdates = new Map<string, string>()

// Demo accounts for password verification
const DEMO_ACCOUNTS = [
  { 
    id: "1", 
    username: process.env.DEMO_ADMIN_USERNAME || "admin", 
    password: process.env.DEMO_ADMIN_PASSWORD || "admin123"
  },
  { 
    id: "2", 
    username: "helper", 
    password: process.env.DEMO_HELPER_PASSWORD || "helper123"
  },
]

/**
 * Get current password for a user (for login verification)
 */
export function getCurrentPassword(userId: string): string | null {
  const updatedPassword = passwordUpdates.get(userId)
  if (updatedPassword) {
    return updatedPassword
  }
  
  const demoAccount = DEMO_ACCOUNTS.find(account => account.id === userId)
  return demoAccount?.password || null
}

/**
 * Update password for a user
 */
export function updatePassword(userId: string, newPassword: string): void {
  passwordUpdates.set(userId, newPassword)
}

/**
 * Verify current password for a user
 */
export function verifyCurrentPassword(userId: string, currentPassword: string): boolean {
  const currentPasswordToCheck = getCurrentPassword(userId)
  if (!currentPasswordToCheck) {
    return false
  }
  return currentPassword === currentPasswordToCheck
}

/**
 * Get demo account by ID
 */
export function getDemoAccount(userId: string) {
  return DEMO_ACCOUNTS.find(account => account.id === userId)
}

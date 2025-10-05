// Simple in-memory lock for preventing race conditions
class DatabaseLock {
  private locks = new Map<string, Promise<any>>()

  async withLock<T>(key: string, operation: () => Promise<T>): Promise<T> {
    // If there's already a lock for this key, wait for it
    if (this.locks.has(key)) {
      await this.locks.get(key)
    }

    // Create a new lock for this operation
    const lockPromise = this.executeWithLock(key, operation)
    this.locks.set(key, lockPromise)

    try {
      const result = await lockPromise
      return result
    } finally {
      // Remove the lock when done
      this.locks.delete(key)
    }
  }

  private async executeWithLock<T>(key: string, operation: () => Promise<T>): Promise<T> {
    return operation()
  }
}

export const dbLock = new DatabaseLock()

// Helper function for database operations with locking
export async function withDatabaseLock<T>(
  key: string, 
  operation: () => Promise<T>
): Promise<T> {
  return dbLock.withLock(key, operation)
}
/**
 * Server-side notification service
 * Use this to create notifications from API routes or server actions
 */

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ANNOUNCEMENT' | 'SYSTEM'
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

interface CreateNotificationInput {
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
  userId?: string | null // Specific user, or null for system-wide
  link?: string
  metadata?: string
}

export const NotificationService = {
  /**
   * Create a notification for a specific user
   */
  async createForUser(userId: string, input: Omit<CreateNotificationInput, 'userId'>) {
    try {
      return await prisma.notification.create({
        data: {
          title: input.title,
          message: input.message,
          type: input.type || 'INFO',
          priority: input.priority || 'NORMAL',
          userId,
          link: input.link,
          metadata: input.metadata,
        }
      })
    } catch (error) {
      logger.error('Error creating notification for user:', error)
      throw error
    }
  },

  /**
   * Create a system-wide notification (visible to all users)
   */
  async createSystemNotification(input: Omit<CreateNotificationInput, 'userId'>) {
    try {
      return await prisma.notification.create({
        data: {
          title: input.title,
          message: input.message,
          type: input.type || 'SYSTEM',
          priority: input.priority || 'NORMAL',
          userId: null, // System-wide
          link: input.link,
          metadata: input.metadata,
        }
      })
    } catch (error) {
      logger.error('Error creating system notification:', error)
      throw error
    }
  },

  /**
   * Create notification for all active users
   */
  async createForAllUsers(input: Omit<CreateNotificationInput, 'userId'>) {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      })

      await prisma.notification.createMany({
        data: users.map(user => ({
          title: input.title,
          message: input.message,
          type: input.type || 'INFO',
          priority: input.priority || 'NORMAL',
          userId: user.id,
          link: input.link,
          metadata: input.metadata,
        }))
      })

      return { count: users.length }
    } catch (error) {
      logger.error('Error creating notifications for all users:', error)
      throw error
    }
  },

  /**
   * Create notification for users with specific role
   */
  async createForRole(role: 'ADMIN' | 'HELPER' | 'GUEST', input: Omit<CreateNotificationInput, 'userId'>) {
    try {
      const users = await prisma.user.findMany({
        where: { role, isActive: true },
        select: { id: true }
      })

      await prisma.notification.createMany({
        data: users.map(user => ({
          title: input.title,
          message: input.message,
          type: input.type || 'INFO',
          priority: input.priority || 'NORMAL',
          userId: user.id,
          link: input.link,
          metadata: input.metadata,
        }))
      })

      return { count: users.length }
    } catch (error) {
      logger.error('Error creating notifications for role:', error)
      throw error
    }
  },

  /**
   * Delete old read notifications (cleanup utility)
   */
  async cleanupOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: {
            lt: cutoffDate
          }
        }
      })

      logger.log(`Cleaned up ${result.count} old notifications`)
      return result.count
    } catch (error) {
      logger.error('Error cleaning up notifications:', error)
      throw error
    }
  }
}

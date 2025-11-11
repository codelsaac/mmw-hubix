import { User, UserRole, Prisma } from '@prisma/client';
import { BaseRepository, NotFoundError, DuplicateError } from './base.repository';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'UserRepository' });

/**
 * User with safe fields (excluding sensitive data)
 */
export type SafeUser = Omit<User, 'password'>;

/**
 * User Repository
 * Handles all database operations for users
 */
export class UserRepository extends BaseRepository<SafeUser> {
  /**
   * Find user by ID (excluding password)
   */
  async findById(id: string): Promise<SafeUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          name: true,
          image: true,
          role: true,
          department: true,
          permissions: true,
          isActive: true,
          lastLoginAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error('Error finding user by ID', error as Error, { id });
      throw error;
    }
  }

  /**
   * Find user by username (including password for auth)
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      return user;
    } catch (error) {
      logger.error('Error finding user by username', error as Error, { username });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          name: true,
          image: true,
          role: true,
          department: true,
          permissions: true,
          isActive: true,
          lastLoginAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error('Error finding user by email', error as Error, { email });
      throw error;
    }
  }

  /**
   * Find users with filters
   */
  async findMany(filter?: {
    role?: UserRole;
    department?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<SafeUser[]> {
    try {
      const where: Prisma.UserWhereInput = {};

      if (filter?.role) {
        where.role = filter.role;
      }

      if (filter?.department) {
        where.department = filter.department;
      }

      if (filter?.searchQuery) {
        where.OR = [
          { username: { contains: filter.searchQuery } },
          { name: { contains: filter.searchQuery } },
          { email: { contains: filter.searchQuery } },
        ];
      }

      const users = await this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          name: true,
          image: true,
          role: true,
          department: true,
          permissions: true,
          isActive: true,
          lastLoginAt: true,
        },
        orderBy: { username: 'asc' },
        take: filter?.limit,
        skip: filter?.offset,
      });

      return users;
    } catch (error) {
      logger.error('Error finding users', error as Error, { filter });
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<SafeUser> {
    try {
      const user = await this.prisma.user.create({
        data,
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          name: true,
          image: true,
          role: true,
          department: true,
          permissions: true,
          isActive: true,
          lastLoginAt: true,
        },
      });

      logger.info('User created', { userId: user.id, username: user.username });
      return user;
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new DuplicateError('User', field, data[field as keyof typeof data]);
      }
      logger.error('Error creating user', error as Error, { data });
      throw error;
    }
  }

  /**
   * Update a user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<SafeUser> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          name: true,
          image: true,
          role: true,
          department: true,
          permissions: true,
          isActive: true,
          lastLoginAt: true,
        },
      });

      logger.info('User updated', { userId: id });
      return user;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('User', id);
      }
      if (error.code === 'P2002') {
        throw new DuplicateError('User', error.meta?.target?.[0] || 'field', data);
      }
      logger.error('Error updating user', error as Error, { id, data });
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      logger.info('User deleted', { userId: id });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('User', id);
      }
      logger.error('Error deleting user', error as Error, { id });
      throw error;
    }
  }

  /**
   * Count users
   */
  async count(filter?: {
    role?: UserRole;
    department?: string;
  }): Promise<number> {
    try {
      const where: Prisma.UserWhereInput = {};

      if (filter?.role) {
        where.role = filter.role;
      }

      if (filter?.department) {
        where.department = filter.department;
      }

      return await this.prisma.user.count({ where });
    } catch (error) {
      logger.error('Error counting users', error as Error, { filter });
      throw error;
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('User', id);
      }
      logger.error('Error updating last login', error as Error, { id });
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<SafeUser[]> {
    return this.findMany({ role });
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(department: string): Promise<SafeUser[]> {
    return this.findMany({ department });
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      return user !== null;
    } catch (error) {
      logger.error('Error checking username existence', error as Error, { username });
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      return user !== null;
    } catch (error) {
      logger.error('Error checking email existence', error as Error, { email });
      throw error;
    }
  }
}

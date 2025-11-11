import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Base Repository Pattern
 * 
 * Provides common CRUD operations for all repositories.
 * Extend this class to create specific repositories.
 */
export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Find a single record by ID
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * Find multiple records with optional filters
   */
  abstract findMany(filter?: any): Promise<T[]>;

  /**
   * Create a new record
   */
  abstract create(data: any): Promise<T>;

  /**
   * Update an existing record
   */
  abstract update(id: string, data: any): Promise<T>;

  /**
   * Delete a record by ID
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Count records matching filter
   */
  abstract count(filter?: any): Promise<number>;

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    const record = await this.findById(id);
    return record !== null;
  }

  /**
   * Find all records (use with caution for large datasets)
   */
  async findAll(): Promise<T[]> {
    return this.findMany();
  }

  /**
   * Paginated find with cursor-based pagination
   */
  async findPaginated(params: {
    cursor?: string;
    take?: number;
    filter?: any;
  }): Promise<{ data: T[]; nextCursor: string | null }> {
    // Override in specific repositories if needed
    const data = await this.findMany(params.filter);
    return { data, nextCursor: null };
  }

  /**
   * Transaction helper
   */
  protected async transaction<R>(
    fn: (tx: PrismaClient) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(async (tx) => {
      return fn(tx as PrismaClient);
    });
  }
}

/**
 * Repository error types
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'DUPLICATE' | 'VALIDATION' | 'DATABASE_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', { resource, id });
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends RepositoryError {
  constructor(resource: string, field: string, value: any) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      'DUPLICATE',
      { resource, field, value }
    );
    this.name = 'DuplicateError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION', details);
    this.name = 'ValidationError';
  }
}

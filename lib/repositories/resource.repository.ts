import { Resource, Prisma } from '@prisma/client';
import { BaseRepository, NotFoundError, DuplicateError } from './base.repository';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'ResourceRepository' });

/**
 * Resource with relations
 */
export type ResourceWithRelations = Resource & {
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
  creator?: {
    id: string;
    name?: string | null;
    username: string;
  } | null;
};

/**
 * Resource Repository
 * Handles all database operations for resources
 */
export class ResourceRepository extends BaseRepository<Resource> {
  /**
   * Find resource by ID with optional relations
   */
  async findById(id: string, includeRelations = true): Promise<ResourceWithRelations | null> {
    try {
      const resource = await this.prisma.resource.findUnique({
        where: { id },
        include: includeRelations
          ? {
              category: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  color: true,
                },
              },
              creator: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            }
          : undefined,
      });

      return resource as ResourceWithRelations | null;
    } catch (error) {
      logger.error('Error finding resource by ID', error as Error, { id });
      throw error;
    }
  }

  /**
   * Find resources with filters
   */
  async findMany(filter?: {
    categoryId?: string;
    status?: string;
    searchQuery?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ResourceWithRelations[]> {
    try {
      const where: Prisma.ResourceWhereInput = {};

      if (filter?.categoryId) {
        where.categoryId = filter.categoryId;
      }

      if (filter?.status) {
        where.status = filter.status;
      }

      if (filter?.createdBy) {
        where.createdBy = filter.createdBy;
      }

      if (filter?.searchQuery) {
        where.OR = [
          { name: { contains: filter.searchQuery } },
          { description: { contains: filter.searchQuery } },
        ];
      }

      const resources = await this.prisma.resource.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filter?.limit,
        skip: filter?.offset,
      });

      return resources as ResourceWithRelations[];
    } catch (error) {
      logger.error('Error finding resources', error as Error, { filter });
      throw error;
    }
  }

  /**
   * Create a new resource
   */
  async create(data: Prisma.ResourceCreateInput): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.create({
        data,
      });

      logger.info('Resource created', { resourceId: resource.id, name: resource.name });
      return resource;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new DuplicateError('Resource', error.meta?.target?.[0] || 'field', data);
      }
      logger.error('Error creating resource', error as Error, { data });
      throw error;
    }
  }

  /**
   * Update a resource
   */
  async update(id: string, data: Prisma.ResourceUpdateInput): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.update({
        where: { id },
        data,
      });

      logger.info('Resource updated', { resourceId: id });
      return resource;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Resource', id);
      }
      if (error.code === 'P2002') {
        throw new DuplicateError('Resource', error.meta?.target?.[0] || 'field', data);
      }
      logger.error('Error updating resource', error as Error, { id, data });
      throw error;
    }
  }

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.resource.delete({
        where: { id },
      });

      logger.info('Resource deleted', { resourceId: id });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Resource', id);
      }
      logger.error('Error deleting resource', error as Error, { id });
      throw error;
    }
  }

  /**
   * Count resources
   */
  async count(filter?: {
    categoryId?: string;
    status?: string;
    searchQuery?: string;
  }): Promise<number> {
    try {
      const where: Prisma.ResourceWhereInput = {};

      if (filter?.categoryId) {
        where.categoryId = filter.categoryId;
      }

      if (filter?.status) {
        where.status = filter.status;
      }

      if (filter?.searchQuery) {
        where.OR = [
          { name: { contains: filter.searchQuery } },
          { description: { contains: filter.searchQuery } },
        ];
      }

      return await this.prisma.resource.count({ where });
    } catch (error) {
      logger.error('Error counting resources', error as Error, { filter });
      throw error;
    }
  }

  /**
   * Increment clicks counter
   */
  async incrementClicks(id: string): Promise<void> {
    try {
      await this.prisma.resource.update({
        where: { id },
        data: {
          clicks: { increment: 1 },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Resource', id);
      }
      logger.error('Error incrementing clicks', error as Error, { id });
      throw error;
    }
  }

  /**
   * Get top resources by clicks
   */
  async getTopResources(limit: number = 10): Promise<ResourceWithRelations[]> {
    try {
      const resources = await this.prisma.resource.findMany({
        where: { status: 'active' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
        orderBy: { clicks: 'desc' },
        take: limit,
      });

      return resources as ResourceWithRelations[];
    } catch (error) {
      logger.error('Error getting top resources', error as Error, { limit });
      throw error;
    }
  }

  /**
   * Get resources by category
   */
  async getByCategory(categoryId: string): Promise<ResourceWithRelations[]> {
    return this.findMany({ categoryId, status: 'active' });
  }

  /**
   * Get resources grouped by category
   */
  async getResourcesGroupedByCategory(): Promise<
    Array<{
      category: { id: string; name: string; icon?: string | null; color?: string | null } | null;
      resources: ResourceWithRelations[];
    }>
  > {
    try {
      const resources = await this.findMany({ status: 'active' });

      // Group by category
      const grouped = resources.reduce((acc, resource) => {
        const categoryId = resource.categoryId || 'uncategorized';
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: resource.category || null,
            resources: [],
          };
        }
        acc[categoryId].resources.push(resource);
        return acc;
      }, {} as Record<string, { category: any; resources: ResourceWithRelations[] }>);

      return Object.values(grouped);
    } catch (error) {
      logger.error('Error getting resources grouped by category', error as Error);
      throw error;
    }
  }
}

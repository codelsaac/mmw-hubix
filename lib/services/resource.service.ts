import { Resource } from '@prisma/client';
import {
  ResourceRepository,
  ResourceWithRelations,
} from '@/lib/repositories/resource.repository';
import { ValidationError } from '@/lib/repositories/base.repository';
import { InputSanitizer } from '@/lib/security/sanitizer';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'ResourceService' });

/**
 * Resource Service
 * Contains business logic for resource operations
 */
export class ResourceService {
  private repository: ResourceRepository;

  constructor() {
    this.repository = new ResourceRepository();
  }

  /**
   * Get resource by ID
   */
  async getResourceById(id: string): Promise<ResourceWithRelations | null> {
    logger.debug('Getting resource by ID', { id });
    return this.repository.findById(id);
  }

  /**
   * Get all resources with optional filters
   */
  async getAllResources(params?: {
    categoryId?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<ResourceWithRelations[]> {
    logger.debug('Getting all resources', params);

    // Sanitize search query if provided
    const sanitizedParams = params
      ? {
          ...params,
          searchQuery: params.searchQuery
            ? InputSanitizer.sanitizeText(params.searchQuery)
            : undefined,
        }
      : undefined;

    return this.repository.findMany({
      ...sanitizedParams,
      status: 'active', // Only return active resources
    });
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(categoryId: string): Promise<ResourceWithRelations[]> {
    logger.debug('Getting resources by category', { categoryId });
    return this.repository.getByCategory(categoryId);
  }

  /**
   * Get resources grouped by category
   */
  async getResourcesGroupedByCategory() {
    logger.debug('Getting resources grouped by category');
    return this.repository.getResourcesGroupedByCategory();
  }

  /**
   * Create a new resource
   */
  async createResource(data: {
    name: string;
    url: string;
    description?: string;
    icon?: string;
    categoryId?: string;
    createdBy?: string;
  }): Promise<Resource> {
    logger.info('Creating resource', { name: data.name });

    // Validate required fields
    if (!data.name || !data.url) {
      throw new ValidationError('Name and URL are required', { data });
    }

    // Sanitize inputs
    const safeName = InputSanitizer.sanitizeText(data.name);
    const safeUrl = InputSanitizer.sanitizeUrl(data.url);
    const safeDescription = data.description
      ? InputSanitizer.sanitizeHtml(data.description)
      : undefined;

    if (!safeUrl) {
      throw new ValidationError('Invalid URL format', { url: data.url });
    }

    if (safeName.length < 2) {
      throw new ValidationError('Name must be at least 2 characters', { name: data.name });
    }

    // Create resource
    return this.repository.create({
      name: safeName,
      url: safeUrl,
      description: safeDescription,
      icon: data.icon,
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      creator: data.createdBy ? { connect: { id: data.createdBy } } : undefined,
    });
  }

  /**
   * Update a resource
   */
  async updateResource(
    id: string,
    data: {
      name?: string;
      url?: string;
      description?: string;
      icon?: string;
      categoryId?: string | null;
      status?: string;
    }
  ): Promise<Resource> {
    logger.info('Updating resource', { id });

    // Sanitize inputs
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = InputSanitizer.sanitizeText(data.name);
      if (updateData.name.length < 2) {
        throw new ValidationError('Name must be at least 2 characters', { name: data.name });
      }
    }

    if (data.url !== undefined) {
      updateData.url = InputSanitizer.sanitizeUrl(data.url);
      if (!updateData.url) {
        throw new ValidationError('Invalid URL format', { url: data.url });
      }
    }

    if (data.description !== undefined) {
      updateData.description = data.description
        ? InputSanitizer.sanitizeHtml(data.description)
        : null;
    }

    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }

    if (data.categoryId !== undefined) {
      if (data.categoryId === null) {
        updateData.category = { disconnect: true };
      } else {
        updateData.category = { connect: { id: data.categoryId } };
      }
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    return this.repository.update(id, updateData);
  }

  /**
   * Delete a resource
   */
  async deleteResource(id: string): Promise<void> {
    logger.info('Deleting resource', { id });
    await this.repository.delete(id);
  }

  /**
   * Track resource click
   */
  async trackClick(id: string): Promise<void> {
    logger.debug('Tracking resource click', { id });
    await this.repository.incrementClicks(id);
  }

  /**
   * Get top resources
   */
  async getTopResources(limit: number = 10): Promise<ResourceWithRelations[]> {
    logger.debug('Getting top resources', { limit });
    return this.repository.getTopResources(limit);
  }

  /**
   * Search resources
   */
  async searchResources(query: string, limit: number = 20): Promise<ResourceWithRelations[]> {
    logger.debug('Searching resources', { query, limit });

    const safeQuery = InputSanitizer.sanitizeText(query);

    if (safeQuery.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters', { query });
    }

    return this.repository.findMany({
      searchQuery: safeQuery,
      status: 'active',
      limit,
    });
  }

  /**
   * Get resource statistics
   */
  async getResourceStats() {
    logger.debug('Getting resource statistics');

    const [total, active, byCategory] = await Promise.all([
      this.repository.count(),
      this.repository.count({ status: 'active' }),
      this.repository.getResourcesGroupedByCategory(),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byCategory: byCategory.map((group) => ({
        category: group.category?.name || 'Uncategorized',
        count: group.resources.length,
      })),
    };
  }
}

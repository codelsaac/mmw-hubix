import { Article, ArticleStatus, Prisma } from '@prisma/client';
import { BaseRepository, NotFoundError, DuplicateError } from './base.repository';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'ArticleRepository' });

/**
 * Article with relations
 */
export type ArticleWithRelations = Article & {
  creator?: {
    id: string;
    name?: string | null;
    username: string;
  } | null;
};

/**
 * Article Repository
 * Handles all database operations for articles
 */
export class ArticleRepository extends BaseRepository<Article> {
  /**
   * Find article by ID with optional relations
   */
  async findById(id: string, includeRelations = true): Promise<ArticleWithRelations | null> {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id },
        include: includeRelations
          ? {
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

      return article as ArticleWithRelations | null;
    } catch (error) {
      logger.error('Error finding article by ID', error as Error, { id });
      throw error;
    }
  }

  /**
   * Find article by slug
   */
  async findBySlug(slug: string): Promise<ArticleWithRelations | null> {
    try {
      const article = await this.prisma.article.findUnique({
        where: { slug },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      return article as ArticleWithRelations | null;
    } catch (error) {
      logger.error('Error finding article by slug', error as Error, { slug });
      throw error;
    }
  }

  /**
   * Find articles with filters
   */
  async findMany(filter?: {
    status?: ArticleStatus;
    category?: string;
    searchQuery?: string;
    createdBy?: string;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ArticleWithRelations[]> {
    try {
      const where: Prisma.ArticleWhereInput = {};

      if (filter?.status) {
        where.status = filter.status;
      }

      if (filter?.category) {
        where.category = filter.category;
      }

      if (filter?.createdBy) {
        where.createdBy = filter.createdBy;
      }

      if (filter?.isPublic !== undefined) {
        where.isPublic = filter.isPublic;
      }

      if (filter?.searchQuery) {
        where.OR = [
          { title: { contains: filter.searchQuery } },
          { excerpt: { contains: filter.searchQuery } },
          { content: { contains: filter.searchQuery } },
        ];
      }

      const articles = await this.prisma.article.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: filter?.limit,
        skip: filter?.offset,
      });

      return articles as ArticleWithRelations[];
    } catch (error) {
      logger.error('Error finding articles', error as Error, { filter });
      throw error;
    }
  }

  /**
   * Create a new article
   */
  async create(data: Prisma.ArticleCreateInput): Promise<Article> {
    try {
      const article = await this.prisma.article.create({
        data,
      });

      logger.info('Article created', { articleId: article.id, title: article.title });
      return article;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new DuplicateError('Article', 'slug', data.slug);
      }
      logger.error('Error creating article', error as Error, { data });
      throw error;
    }
  }

  /**
   * Update an article
   */
  async update(id: string, data: Prisma.ArticleUpdateInput): Promise<Article> {
    try {
      const article = await this.prisma.article.update({
        where: { id },
        data,
      });

      logger.info('Article updated', { articleId: id });
      return article;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Article', id);
      }
      if (error.code === 'P2002') {
        throw new DuplicateError('Article', error.meta?.target?.[0] || 'field', data);
      }
      logger.error('Error updating article', error as Error, { id, data });
      throw error;
    }
  }

  /**
   * Delete an article
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.article.delete({
        where: { id },
      });

      logger.info('Article deleted', { articleId: id });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Article', id);
      }
      logger.error('Error deleting article', error as Error, { id });
      throw error;
    }
  }

  /**
   * Count articles
   */
  async count(filter?: {
    status?: ArticleStatus;
    category?: string;
    isPublic?: boolean;
  }): Promise<number> {
    try {
      const where: Prisma.ArticleWhereInput = {};

      if (filter?.status) {
        where.status = filter.status;
      }

      if (filter?.category) {
        where.category = filter.category;
      }

      if (filter?.isPublic !== undefined) {
        where.isPublic = filter.isPublic;
      }

      return await this.prisma.article.count({ where });
    } catch (error) {
      logger.error('Error counting articles', error as Error, { filter });
      throw error;
    }
  }

  /**
   * Increment views counter
   */
  async incrementViews(id: string): Promise<void> {
    try {
      await this.prisma.article.update({
        where: { id },
        data: {
          views: { increment: 1 },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Article', id);
      }
      logger.error('Error incrementing views', error as Error, { id });
      throw error;
    }
  }

  /**
   * Get published articles
   */
  async getPublished(limit?: number): Promise<ArticleWithRelations[]> {
    return this.findMany({
      status: ArticleStatus.PUBLISHED,
      isPublic: true,
      limit,
    });
  }

  /**
   * Get featured articles
   */
  async getFeatured(limit: number = 5): Promise<ArticleWithRelations[]> {
    try {
      const articles = await this.prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          isPublic: true,
          featuredImage: { not: null },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: [{ views: 'desc' }, { publishedAt: 'desc' }],
        take: limit,
      });

      return articles as ArticleWithRelations[];
    } catch (error) {
      logger.error('Error getting featured articles', error as Error, { limit });
      throw error;
    }
  }

  /**
   * Publish an article
   */
  async publish(id: string): Promise<Article> {
    return this.update(id, {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
    });
  }

  /**
   * Unpublish an article
   */
  async unpublish(id: string): Promise<Article> {
    return this.update(id, {
      status: ArticleStatus.DRAFT,
    });
  }

  /**
   * Archive an article
   */
  async archive(id: string): Promise<Article> {
    return this.update(id, {
      status: ArticleStatus.ARCHIVED,
    });
  }
}

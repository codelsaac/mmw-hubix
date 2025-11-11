import { Article, ArticleStatus } from '@prisma/client';
import {
  ArticleRepository,
  ArticleWithRelations,
} from '@/lib/repositories/article.repository';
import { ValidationError } from '@/lib/repositories/base.repository';
import { InputSanitizer } from '@/lib/security/sanitizer';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'ArticleService' });

/**
 * Article Service
 * Contains business logic for article operations
 */
export class ArticleService {
  private repository: ArticleRepository;

  constructor() {
    this.repository = new ArticleRepository();
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<ArticleWithRelations | null> {
    logger.debug('Getting article by ID', { id });
    return this.repository.findById(id);
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
    logger.debug('Getting article by slug', { slug });
    const article = await this.repository.findBySlug(slug);

    // Increment views if article exists and is published
    if (article && article.status === ArticleStatus.PUBLISHED) {
      await this.repository.incrementViews(article.id);
    }

    return article;
  }

  /**
   * Get all articles with optional filters
   */
  async getAllArticles(params?: {
    status?: ArticleStatus;
    category?: string;
    searchQuery?: string;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ArticleWithRelations[]> {
    logger.debug('Getting all articles', params);

    // Sanitize search query if provided
    const sanitizedParams = params
      ? {
          ...params,
          searchQuery: params.searchQuery
            ? InputSanitizer.sanitizeText(params.searchQuery)
            : undefined,
        }
      : undefined;

    return this.repository.findMany(sanitizedParams);
  }

  /**
   * Get published articles (public only)
   */
  async getPublishedArticles(limit?: number): Promise<ArticleWithRelations[]> {
    logger.debug('Getting published articles', { limit });
    return this.repository.getPublished(limit);
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(limit: number = 5): Promise<ArticleWithRelations[]> {
    logger.debug('Getting featured articles', { limit });
    return this.repository.getFeatured(limit);
  }

  /**
   * Create a new article
   */
  async createArticle(data: {
    title: string;
    content: string;
    excerpt?: string;
    slug?: string;
    status?: ArticleStatus;
    category?: string;
    tags?: string[];
    featuredImage?: string;
    isPublic?: boolean;
    createdBy?: string;
  }): Promise<Article> {
    logger.info('Creating article', { title: data.title });

    // Validate required fields
    if (!data.title || !data.content) {
      throw new ValidationError('Title and content are required', { data });
    }

    // Sanitize inputs
    const safeTitle = InputSanitizer.sanitizeText(data.title);
    const safeContent = InputSanitizer.sanitizeHtml(data.content);
    const safeExcerpt = data.excerpt
      ? InputSanitizer.sanitizeText(data.excerpt)
      : this.generateExcerpt(safeContent);

    // Generate slug if not provided
    const slug = data.slug
      ? InputSanitizer.sanitizeText(data.slug).toLowerCase().replace(/\s+/g, '-')
      : this.generateSlug(safeTitle);

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new ValidationError('Slug can only contain lowercase letters, numbers, and hyphens', {
        slug,
      });
    }

    // Sanitize tags
    const tags = data.tags
      ? JSON.stringify(data.tags.map((tag) => InputSanitizer.sanitizeText(tag)))
      : null;

    // Create article
    return this.repository.create({
      title: safeTitle,
      content: safeContent,
      excerpt: safeExcerpt,
      slug,
      status: data.status || ArticleStatus.DRAFT,
      category: data.category,
      tags,
      featuredImage: data.featuredImage,
      isPublic: data.isPublic ?? true,
      publishedAt: data.status === ArticleStatus.PUBLISHED ? new Date() : null,
      creator: data.createdBy ? { connect: { id: data.createdBy } } : undefined,
    });
  }

  /**
   * Update an article
   */
  async updateArticle(
    id: string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      slug?: string;
      status?: ArticleStatus;
      category?: string;
      tags?: string[];
      featuredImage?: string | null;
      isPublic?: boolean;
    }
  ): Promise<Article> {
    logger.info('Updating article', { id });

    const updateData: any = {};

    if (data.title !== undefined) {
      updateData.title = InputSanitizer.sanitizeText(data.title);
      if (updateData.title.length < 3) {
        throw new ValidationError('Title must be at least 3 characters', { title: data.title });
      }
    }

    if (data.content !== undefined) {
      updateData.content = InputSanitizer.sanitizeHtml(data.content);
    }

    if (data.excerpt !== undefined) {
      updateData.excerpt = InputSanitizer.sanitizeText(data.excerpt);
    }

    if (data.slug !== undefined) {
      updateData.slug = InputSanitizer.sanitizeText(data.slug)
        .toLowerCase()
        .replace(/\s+/g, '-');
      if (!/^[a-z0-9-]+$/.test(updateData.slug)) {
        throw new ValidationError(
          'Slug can only contain lowercase letters, numbers, and hyphens',
          { slug: data.slug }
        );
      }
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
      // Set publishedAt when publishing
      if (data.status === ArticleStatus.PUBLISHED) {
        const existing = await this.repository.findById(id, false);
        if (existing && !existing.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
    }

    if (data.category !== undefined) {
      updateData.category = data.category;
    }

    if (data.tags !== undefined) {
      updateData.tags = JSON.stringify(
        data.tags.map((tag) => InputSanitizer.sanitizeText(tag))
      );
    }

    if (data.featuredImage !== undefined) {
      updateData.featuredImage = data.featuredImage;
    }

    if (data.isPublic !== undefined) {
      updateData.isPublic = data.isPublic;
    }

    return this.repository.update(id, updateData);
  }

  /**
   * Delete an article
   */
  async deleteArticle(id: string): Promise<void> {
    logger.info('Deleting article', { id });
    await this.repository.delete(id);
  }

  /**
   * Publish an article
   */
  async publishArticle(id: string): Promise<Article> {
    logger.info('Publishing article', { id });
    return this.repository.publish(id);
  }

  /**
   * Unpublish an article
   */
  async unpublishArticle(id: string): Promise<Article> {
    logger.info('Unpublishing article', { id });
    return this.repository.unpublish(id);
  }

  /**
   * Archive an article
   */
  async archiveArticle(id: string): Promise<Article> {
    logger.info('Archiving article', { id });
    return this.repository.archive(id);
  }

  /**
   * Search articles
   */
  async searchArticles(
    query: string,
    limit: number = 20
  ): Promise<ArticleWithRelations[]> {
    logger.debug('Searching articles', { query, limit });

    const safeQuery = InputSanitizer.sanitizeText(query);

    if (safeQuery.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters', { query });
    }

    return this.repository.findMany({
      searchQuery: safeQuery,
      status: ArticleStatus.PUBLISHED,
      isPublic: true,
      limit,
    });
  }

  /**
   * Get article statistics
   */
  async getArticleStats() {
    logger.debug('Getting article statistics');

    const [total, published, draft, archived] = await Promise.all([
      this.repository.count(),
      this.repository.count({ status: ArticleStatus.PUBLISHED }),
      this.repository.count({ status: ArticleStatus.DRAFT }),
      this.repository.count({ status: ArticleStatus.ARCHIVED }),
    ]);

    return {
      total,
      published,
      draft,
      archived,
    };
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string, length: number = 200): string {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    // Trim to length
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}

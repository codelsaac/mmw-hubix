import { Category, Prisma } from '@prisma/client';
import { BaseRepository, NotFoundError, DuplicateError } from './base.repository';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'CategoryRepository' });

export class CategoryRepository extends BaseRepository<Category> {
  async findById(id: string): Promise<Category | null> {
    try {
      return await this.prisma.category.findUnique({ where: { id } });
    } catch (error) {
      logger.error('Error finding category', error as Error, { id });
      throw error;
    }
  }

  async findMany(filter?: { isActive?: boolean }): Promise<Category[]> {
    try {
      const where: Prisma.CategoryWhereInput = {};
      if (filter?.isActive !== undefined) {
        where.isActive = filter.isActive;
      }

      return await this.prisma.category.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });
    } catch (error) {
      logger.error('Error finding categories', error as Error);
      throw error;
    }
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    try {
      const category = await this.prisma.category.create({ data });
      logger.info('Category created', { id: category.id, name: category.name });
      return category;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new DuplicateError('Category', 'name', data.name);
      }
      logger.error('Error creating category', error as Error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    try {
      const category = await this.prisma.category.update({ where: { id }, data });
      logger.info('Category updated', { id });
      return category;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Category', id);
      }
      if (error.code === 'P2002') {
        throw new DuplicateError('Category', 'name', data.name);
      }
      logger.error('Error updating category', error as Error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.category.delete({ where: { id } });
      logger.info('Category deleted', { id });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Category', id);
      }
      logger.error('Error deleting category', error as Error);
      throw error;
    }
  }

  async count(filter?: { isActive?: boolean }): Promise<number> {
    const where: Prisma.CategoryWhereInput = filter?.isActive !== undefined
      ? { isActive: filter.isActive }
      : {};
    return await this.prisma.category.count({ where });
  }

  async getActive(): Promise<Category[]> {
    return this.findMany({ isActive: true });
  }
}

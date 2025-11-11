import { Announcement, Prisma } from '@prisma/client';
import { BaseRepository, NotFoundError } from './base.repository';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'AnnouncementRepository' });

export type AnnouncementWithCreator = Announcement & {
  creator?: {
    id: string;
    name?: string | null;
    username: string;
  } | null;
};

export class AnnouncementRepository extends BaseRepository<Announcement> {
  async findById(id: string): Promise<AnnouncementWithCreator | null> {
    try {
      return await this.prisma.announcement.findUnique({
        where: { id },
        include: {
          creator: {
            select: { id: true, name: true, username: true },
          },
        },
      });
    } catch (error) {
      logger.error('Error finding announcement', error as Error, { id });
      throw error;
    }
  }

  async findMany(filter?: {
    type?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<AnnouncementWithCreator[]> {
    try {
      const where: Prisma.AnnouncementWhereInput = {};

      if (filter?.type) {
        where.type = filter.type;
      }

      if (filter?.searchQuery) {
        where.OR = [
          { title: { contains: filter.searchQuery } },
          { description: { contains: filter.searchQuery } },
        ];
      }

      return await this.prisma.announcement.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, username: true },
          },
        },
        orderBy: { date: 'desc' },
        take: filter?.limit,
        skip: filter?.offset,
      });
    } catch (error) {
      logger.error('Error finding announcements', error as Error);
      throw error;
    }
  }

  async create(data: Prisma.AnnouncementCreateInput): Promise<Announcement> {
    try {
      const announcement = await this.prisma.announcement.create({ data });
      logger.info('Announcement created', { id: announcement.id });
      return announcement;
    } catch (error) {
      logger.error('Error creating announcement', error as Error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.AnnouncementUpdateInput): Promise<Announcement> {
    try {
      const announcement = await this.prisma.announcement.update({
        where: { id },
        data,
      });
      logger.info('Announcement updated', { id });
      return announcement;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Announcement', id);
      }
      logger.error('Error updating announcement', error as Error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.announcement.delete({ where: { id } });
      logger.info('Announcement deleted', { id });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Announcement', id);
      }
      logger.error('Error deleting announcement', error as Error);
      throw error;
    }
  }

  async count(filter?: { type?: string }): Promise<number> {
    const where: Prisma.AnnouncementWhereInput = filter?.type ? { type: filter.type } : {};
    return await this.prisma.announcement.count({ where });
  }

  async getUpcoming(limit: number = 10): Promise<AnnouncementWithCreator[]> {
    return await this.prisma.announcement.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: { date: 'asc' },
      take: limit,
    });
  }
}

import { HistoryEvent, Prisma } from '@prisma/client';
import { BaseRepository, NotFoundError } from './base.repository';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'HistoryEventRepository' });

export type HistoryEventWithCreator = HistoryEvent & {
  creator?: {
    id: string;
    name?: string | null;
    username: string;
  } | null;
};

export class HistoryEventRepository extends BaseRepository<HistoryEvent> {
  async findById(id: string): Promise<HistoryEventWithCreator | null> {
    try {
      return await this.prisma.historyEvent.findUnique({
        where: { id },
        include: {
          creator: {
            select: { id: true, name: true, username: true },
          },
        },
      });
    } catch (error) {
      logger.error('Error finding history event', error as Error, { id });
      throw error;
    }
  }

  async findMany(filter?: { status?: string; limit?: number; offset?: number }): Promise<HistoryEventWithCreator[]> {
    try {
      const where: Prisma.HistoryEventWhereInput = {};

      if (filter?.status) {
        where.status = filter.status;
      }

      return await this.prisma.historyEvent.findMany({
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
      logger.error('Error finding history events', error as Error, { filter });
      throw error;
    }
  }

  async create(data: Prisma.HistoryEventCreateInput): Promise<HistoryEvent> {
    try {
      const event = await this.prisma.historyEvent.create({ data });
      logger.info('History event created', { id: event.id });
      return event;
    } catch (error) {
      logger.error('Error creating history event', error as Error, { data });
      throw error;
    }
  }

  async update(id: string, data: Prisma.HistoryEventUpdateInput): Promise<HistoryEvent> {
    try {
      const event = await this.prisma.historyEvent.update({
        where: { id },
        data,
      });
      logger.info('History event updated', { id });
      return event;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('HistoryEvent', id);
      }
      logger.error('Error updating history event', error as Error, { id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.historyEvent.delete({ where: { id } });
      logger.info('History event deleted', { id });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('HistoryEvent', id);
      }
      logger.error('Error deleting history event', error as Error, { id });
      throw error;
    }
  }

  async count(filter?: { status?: string }): Promise<number> {
    const where: Prisma.HistoryEventWhereInput = filter?.status ? { status: filter.status } : {};
    return await this.prisma.historyEvent.count({ where });
  }
}

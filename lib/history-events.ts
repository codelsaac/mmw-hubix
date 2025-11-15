import { logger } from '@/lib/logger';

export type HistoryEventStatus = 'active' | 'archived';

export interface HistoryEventItem {
  id: string;
  title: string;
  description?: string;
  year: string;
  dateLabel: string;
  location?: string;
  imageUrl?: string;
  tags: string[];
  rawDate: string;
  status: HistoryEventStatus;
}

export interface CreateHistoryEventRequest {
  title: string;
  description?: string;
  date: string; // ISO or YYYY-MM-DD
  location?: string;
  imageUrl?: string;
  tags?: string[];
  status?: HistoryEventStatus;
}

export type UpdateHistoryEventRequest = Partial<CreateHistoryEventRequest>;

export class HistoryEventService {
  private static readonly API_BASE = '/api/dashboard/history-events';

  static async getEvents(): Promise<HistoryEventItem[]> {
    try {
      const response = await fetch(this.API_BASE);
      if (!response.ok) throw new Error('Failed to fetch history events');
      return await response.json();
    } catch (error) {
      logger.error('Error fetching history events:', error);
      return [];
    }
  }

  static async createEvent(data: CreateHistoryEventRequest): Promise<HistoryEventItem | null> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create history event');
      return await response.json();
    } catch (error) {
      logger.error('Error creating history event:', error);
      return null;
    }
  }

  static async updateEvent(id: string, data: UpdateHistoryEventRequest): Promise<HistoryEventItem | null> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update history event');
      return await response.json();
    } catch (error) {
      logger.error('Error updating history event:', error);
      return null;
    }
  }

  static async deleteEvent(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      logger.error('Error deleting history event:', error);
      return false;
    }
  }
}

import useSWR from 'swr';
import { HistoryEventItem, HistoryEventService, CreateHistoryEventRequest, UpdateHistoryEventRequest } from '@/lib/history-events';
import { logger } from '@/lib/logger';

const fetcher = () => HistoryEventService.getEvents();

export function useHistoryEvents() {
  const { data, error, isLoading, mutate } = useSWR<HistoryEventItem[]>(
    '/api/dashboard/history-events',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      errorRetryCount: 2,
    }
  );

  const events = data || [];

  const addEvent = async (payload: CreateHistoryEventRequest): Promise<HistoryEventItem | null> => {
    try {
      const created = await HistoryEventService.createEvent(payload);
      if (created) {
        await mutate([created, ...events], false);
        return created;
      }
      return null;
    } catch (err) {
      logger.error('Error adding history event:', err);
      return null;
    }
  };

  const updateEvent = async (id: string, payload: UpdateHistoryEventRequest): Promise<HistoryEventItem | null> => {
    try {
      const updated = await HistoryEventService.updateEvent(id, payload);
      if (updated) {
        await mutate(events.map(event => (event.id === id ? updated : event)), false);
        return updated;
      }
      return null;
    } catch (err) {
      logger.error('Error updating history event:', err);
      return null;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      const success = await HistoryEventService.deleteEvent(id);
      if (success) {
        await mutate(events.filter(event => event.id !== id), false);
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Error deleting history event:', err);
      return false;
    }
  };

  return {
    events,
    loading: isLoading,
    error: error ? 'Failed to load history events' : null,
    addEvent,
    updateEvent,
    deleteEvent,
    refresh: mutate,
  };
}

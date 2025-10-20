// Consolidated Training Hook with SWR for better performance
import useSWR from 'swr'
import { TrainingResource, TrainingService, CreateResourceRequest } from '@/lib/training'
import { logger } from "@/lib/logger"

// Fetcher function for SWR
const fetcher = () => TrainingService.getResources()

export function useTraining() {
  // Use SWR for automatic caching, deduplication, and revalidation
  const { data, error, isLoading, mutate } = useSWR<TrainingResource[]>(
    '/api/training',
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch when tab gains focus
      revalidateOnReconnect: true, // Refetch when connection restored
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
      errorRetryCount: 2, // Retry failed requests twice
    }
  )

  const resources = data || []

  const addResource = async (data: CreateResourceRequest): Promise<TrainingResource | null> => {
    try {
      const newResource = await TrainingService.createResource(data)
      if (newResource) {
        // Optimistic update: immediately show new resource
        await mutate([newResource, ...resources], false)
        return newResource
      }
      return null
    } catch (err) {
      logger.error('Error creating resource:', err)
      return null
    }
  }

  const deleteResource = async (id: number): Promise<boolean> => {
    try {
      const success = await TrainingService.deleteResource(id)
      if (success) {
        // Optimistic update: immediately remove resource
        await mutate(resources.filter(r => r.id !== id), false)
        return true
      }
      return false
    } catch (err) {
      logger.error('Error deleting resource:', err)
      return false
    }
  }

  const updateViews = async (id: number) => {
    try {
      await TrainingService.updateViews(id)
      // Optimistic update: immediately update view count
      await mutate(
        resources.map(r => (r.id === id ? { ...r, views: r.views + 1 } : r)),
        false
      )
    } catch (err) {
      logger.error('Error updating views:', err)
    }
  }

  const clearAllResources = async () => {
    await mutate([], false)
  }

  return {
    resources,
    loading: isLoading,
    error: error ? 'Failed to load training resources' : null,
    addResource,
    deleteResource,
    updateViews,
    clearAllResources,
    refresh: mutate // SWR's mutate function revalidates data
  }
}

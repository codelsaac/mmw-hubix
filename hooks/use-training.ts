// Consolidated Training Hook
import { useState, useEffect } from 'react'
import { TrainingResource, TrainingService, CreateResourceRequest } from '@/lib/training'

export function useTraining() {
  const [resources, setResources] = useState<TrainingResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load resources on mount
  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await TrainingService.getResources()
      setResources(data)
    } catch (err) {
      setError('Failed to load training resources')
      console.error('Error loading resources:', err)
    } finally {
      setLoading(false)
    }
  }

  const addResource = async (data: CreateResourceRequest): Promise<TrainingResource | null> => {
    try {
      const newResource = await TrainingService.createResource(data)
      if (newResource) {
        setResources(prev => [newResource, ...prev])
        return newResource
      }
      return null
    } catch (err) {
      setError('Failed to create resource')
      console.error('Error creating resource:', err)
      return null
    }
  }

  const deleteResource = async (id: number): Promise<boolean> => {
    try {
      const success = await TrainingService.deleteResource(id)
      if (success) {
        setResources(prev => prev.filter(r => r.id !== id))
        return true
      }
      return false
    } catch (err) {
      setError('Failed to delete resource')
      console.error('Error deleting resource:', err)
      return false
    }
  }

  const updateViews = async (id: number) => {
    try {
      await TrainingService.updateViews(id)
      setResources(prev => 
        prev.map(r => 
          r.id === id ? { ...r, views: r.views + 1 } : r
        )
      )
    } catch (err) {
      console.error('Error updating views:', err)
    }
  }

  const clearAllResources = () => {
    setResources([])
  }

  return {
    resources,
    loading,
    error,
    addResource,
    deleteResource,
    updateViews,
    clearAllResources,
    refresh: loadResources
  }
}

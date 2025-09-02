"use client"

import { useState, useEffect } from "react"
import { getDashboardService, type DashboardStats, type Activity, type Task } from "@/lib/dashboard-data"

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const service = getDashboardService()
      setStats(service.getStats())
      setActivities(service.getActivities())
      setTasks(service.getTasks())
      setLoading(false)
    }

    loadData()
  }, [])

  const completeTask = (taskId: number) => {
    const service = getDashboardService()
    service.completeTask(taskId)
    setTasks(service.getTasks())
    setActivities(service.getActivities())
  }

  const addActivity = (activity: Omit<Activity, "id">) => {
    const service = getDashboardService()
    service.addActivity(activity)
    setActivities(service.getActivities())
  }

  const refreshData = () => {
    const service = getDashboardService()
    setStats(service.getStats())
    setActivities(service.getActivities())
    setTasks(service.getTasks())
  }

  return {
    stats,
    activities,
    tasks,
    loading,
    completeTask,
    addActivity,
    refreshData,
  }
}

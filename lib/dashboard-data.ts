import { logger } from "@/lib/logger"
export interface DashboardStats {
  activePrefects: number
  upcomingEvents: number
  trainingVideos: number
  systemUptime: string
}

export interface Activity {
  id: number
  type: "meeting" | "training" | "system" | "announcement"
  title: string
  description: string
  time: string
  status: "completed" | "new" | "in-progress"
}

export interface Task {
  id: number
  title: string
  dueDate: string
  priority: "high" | "medium" | "low"
  completed: boolean
}

class DashboardService {
  private static instance: DashboardService
  private stats: DashboardStats
  private activities: Activity[]
  private tasks: Task[]

  constructor() {
    this.stats = this.loadStats()
    this.activities = this.loadActivities()
    this.tasks = this.loadTasks()
  }

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService()
    }
    return DashboardService.instance
  }

  private loadStats(): DashboardStats {
    if (typeof window === 'undefined') {
      // Server-side fallback
      return {
        activePrefects: 12,
        upcomingEvents: 5,
        trainingVideos: 24,
        systemUptime: "98%",
      }
    }

    try {
      const saved = localStorage.getItem("dashboard-stats")
      return saved
        ? JSON.parse(saved)
        : {
            activePrefects: 12,
            upcomingEvents: 5,
            trainingVideos: 24,
            systemUptime: "98%",
          }
    } catch (error) {
      logger.error('Error loading dashboard stats:', error)
      return {
        activePrefects: 12,
        upcomingEvents: 5,
        trainingVideos: 24,
        systemUptime: "98%",
      }
    }
  }

  private loadActivities(): Activity[] {
    const defaultActivities = [
      {
        id: 1,
        type: "meeting" as const,
        title: "Weekly Team Meeting",
        description: "Discussed new security protocols",
        time: "2 hours ago",
        status: "completed" as const,
      },
      {
        id: 2,
        type: "training" as const,
        title: "New Training Video Added",
        description: "Network Troubleshooting Basics",
        time: "1 day ago",
        status: "new" as const,
      },
      {
        id: 3,
        type: "system" as const,
        title: "System Maintenance",
        description: "Scheduled maintenance completed",
        time: "2 days ago",
        status: "completed" as const,
      },
    ]

    if (typeof window === 'undefined') {
      return defaultActivities
    }

    try {
      const saved = localStorage.getItem("dashboard-activities")
      return saved ? JSON.parse(saved) : defaultActivities
    } catch (error) {
      logger.error('Error loading dashboard activities:', error)
      return defaultActivities
    }
  }

  private loadTasks(): Task[] {
    const defaultTasks = [
      {
        id: 1,
        title: "Prepare Monthly Report",
        dueDate: "Tomorrow",
        priority: "high" as const,
        completed: false,
      },
      {
        id: 2,
        title: "Update Training Materials",
        dueDate: "This Week",
        priority: "medium" as const,
        completed: false,
      },
      {
        id: 3,
        title: "Review New Prefect Applications",
        dueDate: "Next Week",
        priority: "low" as const,
        completed: false,
      },
    ]

    if (typeof window === 'undefined') {
      return defaultTasks
    }

    try {
      const saved = localStorage.getItem("dashboard-tasks")
      return saved ? JSON.parse(saved) : defaultTasks
    } catch (error) {
      logger.error('Error loading dashboard tasks:', error)
      return defaultTasks
    }
  }

  private saveStats() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("dashboard-stats", JSON.stringify(this.stats))
      } catch (error) {
        logger.error('Error saving dashboard stats:', error)
      }
    }
  }

  private saveActivities() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("dashboard-activities", JSON.stringify(this.activities))
      } catch (error) {
        logger.error('Error saving dashboard activities:', error)
      }
    }
  }

  private saveTasks() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("dashboard-tasks", JSON.stringify(this.tasks))
      } catch (error) {
        logger.error('Error saving dashboard tasks:', error)
      }
    }
  }

  getStats(): DashboardStats {
    return { ...this.stats }
  }

  getActivities(): Activity[] {
    return [...this.activities]
  }

  getTasks(): Task[] {
    return [...this.tasks]
  }

  addActivity(activity: Omit<Activity, "id">): void {
    const newActivity = {
      ...activity,
      id: Math.max(...this.activities.map((a) => a.id), 0) + 1,
    }
    this.activities.unshift(newActivity)
    if (this.activities.length > 10) {
      this.activities = this.activities.slice(0, 10)
    }
    this.saveActivities()
  }

  completeTask(taskId: number): void {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.completed = true
      this.saveTasks()
      this.addActivity({
        type: "system",
        title: "Task Completed",
        description: task.title,
        time: "Just now",
        status: "completed",
      })
    }
  }

  updateStats(newStats: Partial<DashboardStats>): void {
    this.stats = { ...this.stats, ...newStats }
    this.saveStats()
  }
}

// Export a function to get the service instance (lazy loading)
export const getDashboardService = () => {
  if (typeof window === 'undefined') {
    // Return a mock service for server-side rendering
    return {
      getStats: () => ({
        activePrefects: 12,
        upcomingEvents: 5,
        trainingVideos: 24,
        systemUptime: "98%",
      }),
      getActivities: () => [],
      getTasks: () => [],
      addActivity: () => {},
      completeTask: () => {},
      updateStats: () => {},
    }
  }
  return DashboardService.getInstance()
}

// For backward compatibility, but should be replaced with getDashboardService()
export const dashboardService = typeof window !== 'undefined' ? DashboardService.getInstance() : getDashboardService()

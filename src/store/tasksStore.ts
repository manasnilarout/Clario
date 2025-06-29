import { create } from 'zustand'
import { Task, TaskFilters } from '../types'

interface TasksState {
  tasks: Task[]
  selectedTask: Task | null
  filters: TaskFilters
  isLoading: boolean
  error: string | null
  viewMode: 'list' | 'kanban' | 'calendar'
}

interface TasksActions {
  // CRUD operations
  createTask: (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Task management
  selectTask: (task: Task | null) => void
  moveTask: (id: string, newStatus: Task['status']) => void
  assignTask: (id: string, assignee: string) => void

  // Filtering and views
  setFilters: (filters: Partial<TaskFilters>) => void
  clearFilters: () => void
  setViewMode: (mode: 'list' | 'kanban' | 'calendar') => void

  // Utility functions
  getTasksByStatus: (status: Task['status']) => Task[]
  getTasksByAssignee: (assignee: string) => Task[]
  getOverdueTasks: () => Task[]
  getTasksForToday: () => Task[]

  // Data fetching
  fetchTasks: () => Promise<void>

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type TasksStore = TasksState & TasksActions

export const useTasksStore = create<TasksStore>((set, get) => ({
  // State
  tasks: [],
  selectedTask: null,
  filters: {},
  isLoading: false,
  error: null,
  viewMode: 'list',

  // Actions
  createTask: taskData => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdBy: 'current-user', // Should come from auth store
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => ({
      tasks: [...state.tasks, newTask],
    }))
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
      ),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, ...updates, updatedAt: new Date() }
          : state.selectedTask,
    }))
  },

  deleteTask: (id: string) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
    }))
  },

  selectTask: (task: Task | null) => {
    set({ selectedTask: task })
  },

  moveTask: (id: string, newStatus: Task['status']) => {
    get().updateTask(id, { status: newStatus })
  },

  assignTask: (id: string, assignee: string) => {
    get().updateTask(id, { assignee })
  },

  setFilters: (filters: Partial<TaskFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  setViewMode: (mode: 'list' | 'kanban' | 'calendar') => {
    set({ viewMode: mode })
  },

  getTasksByStatus: (status: Task['status']) => {
    const { tasks } = get()
    return tasks.filter(task => task.status === status)
  },

  getTasksByAssignee: (assignee: string) => {
    const { tasks } = get()
    return tasks.filter(task => task.assignee === assignee)
  },

  getOverdueTasks: () => {
    const { tasks } = get()
    const now = new Date()
    return tasks.filter(
      task => task.dueDate && task.dueDate < now && task.status !== 'done'
    )
  },

  getTasksForToday: () => {
    const { tasks } = get()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter(
      task => task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
    )
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

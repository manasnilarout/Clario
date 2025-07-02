import { create } from 'zustand'
import {
  Task,
  TaskFilter,
  TaskViewMode,
  TaskSortOption,
  TaskStats,
  CreateTaskData,
  UpdateTaskData,
  TaskTemplate,
  KanbanBoard,
  TaskSearchResult,
} from '../types/task'
import { tasksService } from '../services/tasksService'

interface TasksState {
  // Core data
  tasks: Task[]
  filteredTasks: Task[]
  selectedTasks: string[]
  selectedTask: Task | null

  // UI state
  viewMode: TaskViewMode
  sortBy: TaskSortOption
  filter: TaskFilter
  searchQuery: string
  isLoading: boolean
  error: string | null

  // Modal states
  isCreating: boolean
  isEditing: boolean
  editingTaskId: string | null
  showCompletedTasks: boolean

  // Organization
  categories: string[]
  projects: string[]
  stats: TaskStats | null

  // Templates and boards
  templates: TaskTemplate[]
  kanbanBoard: KanbanBoard | null
}

interface TasksActions {
  // CRUD operations
  createTask: (taskData: CreateTaskData) => Promise<Task>
  updateTask: (id: string, updates: UpdateTaskData) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<void>
  setTaskStatus: (id: string, status: Task['status']) => Promise<void>

  // Bulk operations
  selectTask: (id: string) => void
  deselectTask: (id: string) => void
  selectAllTasks: () => void
  deselectAllTasks: () => void
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => Promise<void>
  bulkDeleteTasks: (ids: string[]) => Promise<void>

  // Search and filtering
  setSearchQuery: (query: string) => void
  setFilter: (filter: Partial<TaskFilter>) => void
  clearFilters: () => void
  setSortBy: (sort: TaskSortOption) => void
  applyFilters: () => void

  // View management
  setViewMode: (mode: TaskViewMode) => void
  setShowCompletedTasks: (show: boolean) => void

  // Modal management
  startCreating: () => void
  stopCreating: () => void
  startEditing: (taskId: string) => void
  stopEditing: () => void

  // Data fetching
  fetchTasks: () => Promise<void>
  refreshTasks: () => Promise<void>

  // Templates
  fetchTemplates: () => Promise<void>
  createTaskFromTemplate: (
    templateId: string,
    customData?: Partial<CreateTaskData>
  ) => Promise<Task | null>

  // Kanban
  fetchKanbanBoard: () => Promise<void>
  moveTaskInKanban: (taskId: string, newStatus: Task['status']) => Promise<void>

  // Statistics
  fetchStats: () => Promise<void>

  // Integration
  createTaskFromMeeting: (
    meetingId: string,
    actionItems: string[]
  ) => Promise<Task[]>
  linkTaskToContact: (taskId: string, contactId: string) => Promise<void>

  // Search
  searchTasks: (query: string) => Promise<TaskSearchResult>

  // Utility functions
  getTasksByStatus: (status: Task['status']) => Task[]
  getTasksByAssignee: (assignee: string) => Task[]
  getOverdueTasks: () => Task[]
  getTasksForToday: () => Task[]
  getTasksForWeek: () => Task[]
  getSubtasks: (parentTaskId: string) => Task[]

  // Error handling
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type TasksStore = TasksState & TasksActions

export const useTasksStore = create<TasksStore>((set, get) => ({
  // Initial state
  tasks: [],
  filteredTasks: [],
  selectedTasks: [],
  selectedTask: null,
  viewMode: 'list',
  sortBy: 'created_date',
  filter: {},
  searchQuery: '',
  isLoading: false,
  error: null,
  isCreating: false,
  isEditing: false,
  editingTaskId: null,
  showCompletedTasks: true,
  categories: [],
  projects: [],
  stats: null,
  templates: [],
  kanbanBoard: null,

  // CRUD operations
  createTask: async (taskData: CreateTaskData) => {
    set({ isLoading: true, error: null })
    try {
      const newTask = await tasksService.createTask(taskData)
      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
        isCreating: false,
      }))
      get().applyFilters()
      return newTask
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
        isLoading: false,
      })
      throw error
    }
  },

  updateTask: async (id: string, updates: UpdateTaskData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTask = tasksService.updateTask(id, updates)
      if (updatedTask) {
        set(state => ({
          tasks: state.tasks.map(task => (task.id === id ? updatedTask : task)),
          selectedTask:
            state.selectedTask?.id === id ? updatedTask : state.selectedTask,
          isLoading: false,
        }))
        get().applyFilters()
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
        isLoading: false,
      })
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const success = tasksService.deleteTask(id)
      if (success) {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id),
          selectedTasks: state.selectedTasks.filter(taskId => taskId !== id),
          selectedTask:
            state.selectedTask?.id === id ? null : state.selectedTask,
          isLoading: false,
        }))
        get().applyFilters()
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
        isLoading: false,
      })
    }
  },

  completeTask: async (id: string) => {
    await get().updateTask(id, { status: 'completed', progress: 100 })
  },

  setTaskStatus: async (id: string, status: Task['status']) => {
    await get().updateTask(id, { status })
  },

  // Selection operations
  selectTask: (id: string) => {
    set(state => ({
      selectedTasks: state.selectedTasks.includes(id)
        ? state.selectedTasks
        : [...state.selectedTasks, id],
    }))
  },

  deselectTask: (id: string) => {
    set(state => ({
      selectedTasks: state.selectedTasks.filter(taskId => taskId !== id),
    }))
  },

  selectAllTasks: () => {
    const { filteredTasks } = get()
    set({ selectedTasks: filteredTasks.map(task => task.id) })
  },

  deselectAllTasks: () => {
    set({ selectedTasks: [] })
  },

  // Bulk operations
  bulkUpdateTasks: async (ids: string[], updates: Partial<Task>) => {
    set({ isLoading: true, error: null })
    try {
      set(state => ({
        tasks: state.tasks.map(task =>
          ids.includes(task.id)
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        ),
        isLoading: false,
      }))
      get().applyFilters()
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update tasks',
        isLoading: false,
      })
    }
  },

  bulkDeleteTasks: async (ids: string[]) => {
    set({ isLoading: true, error: null })
    try {
      set(state => ({
        tasks: state.tasks.filter(task => !ids.includes(task.id)),
        selectedTasks: [],
        isLoading: false,
      }))
      get().applyFilters()
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete tasks',
        isLoading: false,
      })
    }
  },

  // Search and filtering
  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
    get().applyFilters()
  },

  setFilter: (filter: Partial<TaskFilter>) => {
    set(state => ({ filter: { ...state.filter, ...filter } }))
    get().applyFilters()
  },

  clearFilters: () => {
    set({ filter: {}, searchQuery: '' })
    get().applyFilters()
  },

  setSortBy: (sort: TaskSortOption) => {
    set({ sortBy: sort })
    get().applyFilters()
  },

  applyFilters: () => {
    const { tasks, sortBy, showCompletedTasks } = get()

    let filtered = tasks

    if (!showCompletedTasks) {
      filtered = filtered.filter(task => task.status !== 'completed')
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.getTime() - b.dueDate.getTime()
        case 'priority':
          const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'status':
          return a.status.localeCompare(b.status)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'assignee':
          return (a.assignedTo || '').localeCompare(b.assignedTo || '')
        case 'progress':
          return b.progress - a.progress
        case 'created_date':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

    set({ filteredTasks: filtered })
  },

  // View management
  setViewMode: (mode: TaskViewMode) => {
    set({ viewMode: mode })
  },

  setShowCompletedTasks: (show: boolean) => {
    set({ showCompletedTasks: show })
    get().applyFilters()
  },

  // Modal management
  startCreating: () => set({ isCreating: true }),
  stopCreating: () => set({ isCreating: false }),
  startEditing: (taskId: string) =>
    set({ isEditing: true, editingTaskId: taskId }),
  stopEditing: () => set({ isEditing: false, editingTaskId: null }),

  // Data fetching
  fetchTasks: async () => {
    console.log('fetchTasks: Starting...')
    set({ isLoading: true, error: null })
    try {
      console.log('fetchTasks: Calling tasksService.getAllTasks()...')
      const tasks = await tasksService.getAllTasks()
      console.log('fetchTasks: Got tasks:', tasks.length)

      // Extract categories and projects from tasks
      const categories = [
        ...new Set(tasks.map(task => task.category).filter(Boolean)),
      ] as string[]
      const projects = [
        ...new Set(tasks.map(task => task.project).filter(Boolean)),
      ] as string[]

      console.log(
        'fetchTasks: Setting state with tasks, categories, projects...'
      )
      set({
        tasks,
        categories,
        projects,
        isLoading: false,
      })
      console.log('fetchTasks: Applying filters...')
      get().applyFilters()
      console.log('fetchTasks: Complete!')
    } catch (error) {
      console.error('fetchTasks: Error occurred:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        isLoading: false,
      })
    }
  },

  refreshTasks: async () => {
    await get().fetchTasks()
  },

  // Templates
  fetchTemplates: async () => {
    try {
      const templates = tasksService.getTaskTemplates()
      set({ templates })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch templates',
      })
    }
  },

  createTaskFromTemplate: async (
    templateId: string,
    customData?: Partial<CreateTaskData>
  ) => {
    set({ isLoading: true, error: null })
    try {
      const newTask = await tasksService.createTaskFromTemplate(
        templateId,
        customData
      )
      if (newTask) {
        set(state => ({
          tasks: [...state.tasks, newTask],
          isLoading: false,
        }))
        get().applyFilters()
      }
      return newTask
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create task from template',
        isLoading: false,
      })
      return null
    }
  },

  // Kanban
  fetchKanbanBoard: async () => {
    try {
      const kanbanBoard = tasksService.getKanbanBoard()
      set({ kanbanBoard })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch kanban board',
      })
    }
  },

  moveTaskInKanban: async (taskId: string, newStatus: Task['status']) => {
    await get().updateTask(taskId, { status: newStatus })
  },

  // Statistics
  fetchStats: async () => {
    try {
      const stats = tasksService.getTaskStats()
      set({ stats })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      })
    }
  },

  // Integration
  createTaskFromMeeting: async (meetingId: string, actionItems: string[]) => {
    set({ isLoading: true, error: null })
    try {
      const newTasks = actionItems.map(actionItem => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        title: actionItem,
        description: `Action item from meeting`,
        status: 'not_started' as const,
        priority: 'medium' as const,
        type: 'meeting_followup' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'temp-user',
        meetingId,
        tags: ['meeting-action'],
        watchers: [],
        subtasks: [],
        dependencies: [],
        attachments: [],
        comments: [],
        reminders: [],
        checklistItems: [],
        progress: 0,
        timeSpent: 0,
        isPrivate: false,
        isArchived: false,
      }))

      set(state => ({
        tasks: [...state.tasks, ...newTasks],
        isLoading: false,
      }))
      get().applyFilters()
      return newTasks
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create tasks from meeting',
        isLoading: false,
      })
      return []
    }
  },

  linkTaskToContact: async (taskId: string, contactId: string) => {
    await get().updateTask(taskId, { contactId })
  },

  // Search
  searchTasks: async (query: string) => {
    try {
      const { tasks } = get()
      const searchLower = query.toLowerCase()
      const matchingTasks = tasks.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )

      return {
        tasks: matchingTasks,
        suggestions: {
          tags: [],
          assignees: [],
          projects: [],
          categories: [],
        },
        totalCount: matchingTasks.length,
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to search tasks',
      })
      throw error
    }
  },

  // Utility functions
  getTasksByStatus: (status: Task['status']) => {
    return tasksService.getTasksByStatus(status)
  },

  getTasksByAssignee: (assignee: string) => {
    return tasksService.getTasksByAssignee(assignee)
  },

  getOverdueTasks: () => {
    return tasksService.getOverdueTasks()
  },

  getTasksForToday: () => {
    return tasksService.getTasksDueToday()
  },

  getTasksForWeek: () => {
    return tasksService.getTasksDueThisWeek()
  },

  getSubtasks: (parentTaskId: string) => {
    const { tasks } = get()
    return tasks.filter(task => task.parentTaskId === parentTaskId)
  },

  // Error handling
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

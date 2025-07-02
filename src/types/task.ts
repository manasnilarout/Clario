// Comprehensive Task Management Type Definitions

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType

  // Scheduling
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  startDate?: Date
  completedAt?: Date
  estimatedDuration?: number // minutes
  actualDuration?: number // minutes

  // Assignment & Collaboration
  assignedTo?: string // Contact ID
  createdBy: string
  delegatedBy?: string
  watchers: string[] // Contact IDs

  // Organization
  category?: string
  tags: string[]
  project?: string
  parentTaskId?: string // For subtasks
  subtasks: Task[]

  // Integration
  meetingId?: string // From meeting action items
  contactId?: string // Related contact

  // Progress & Tracking
  progress: number // 0-100
  timeSpent: number // minutes
  checklistItems: ChecklistItem[]
  dependencies: TaskDependency[]

  // Metadata
  isPrivate: boolean
  isArchived: boolean
  attachments: TaskAttachment[]
  comments: TaskComment[]
  reminders: TaskReminder[]
  location?: string
}

export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskType =
  | 'task'
  | 'action_item'
  | 'reminder'
  | 'meeting_followup'
  | 'project_milestone'
  | 'personal'
  | 'delegated'

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  dueDate?: Date
  assignedTo?: string
}

export interface TaskDependency {
  id: string
  taskId: string
  type: 'blocks' | 'blocked_by' | 'related'
  description?: string
}

export interface TaskComment {
  id: string
  content: string
  author: string
  createdAt: Date
  isInternal: boolean
}

export interface TaskReminder {
  id: string
  datetime: Date
  type: 'notification' | 'email'
  message?: string
  sent: boolean
}

export interface TaskAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: Date
}

// Task Management State Types
export type TaskViewMode = 'list' | 'kanban' | 'calendar' | 'timeline'

export type TaskSortOption =
  | 'created_date'
  | 'due_date'
  | 'priority'
  | 'status'
  | 'title'
  | 'assignee'
  | 'progress'

export interface TaskFilter {
  search?: string
  status?: TaskStatus[]
  priority?: TaskPriority[]
  type?: TaskType[]
  assignedTo?: string[]
  category?: string[]
  tags?: string[]
  project?: string[]
  dueDate?: {
    start?: Date
    end?: Date
  }
  overdue?: boolean
  hasSubtasks?: boolean
  isArchived?: boolean
}

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  overdue: number
  completionRate: number
  averageTimeToComplete: number // days
  productivityScore: number
  weeklyProgress: {
    week: string
    completed: number
    created: number
  }[]
}

// Form Data Types
export interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  type: TaskType
  dueDate?: Date
  startDate?: Date
  estimatedDuration?: number
  assignedTo?: string
  category?: string
  tags: string[]
  project?: string
  parentTaskId?: string
  meetingId?: string
  contactId?: string
  checklistItems: Omit<ChecklistItem, 'id'>[]
  location?: string
  isPrivate: boolean
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus
  progress?: number
  timeSpent?: number
  completedAt?: Date
  actualDuration?: number
}

// Bulk Operations
export interface BulkTaskUpdate {
  taskIds: string[]
  updates: {
    status?: TaskStatus
    priority?: TaskPriority
    assignedTo?: string
    category?: string
    tags?: string[]
    project?: string
    dueDate?: Date
    isArchived?: boolean
  }
}

// Task Template Types
export interface TaskTemplate {
  id: string
  name: string
  description: string
  category: string
  defaultPriority: TaskPriority
  defaultDuration: number
  checklistTemplate: Omit<ChecklistItem, 'id' | 'completed'>[]
  tags: string[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  usageCount: number
}

// Kanban Board Types
export interface KanbanColumn {
  id: string
  title: string
  status: TaskStatus
  limit?: number
  order: number
  color?: string
  isCollapsed: boolean
}

export interface KanbanBoard {
  id: string
  name: string
  columns: KanbanColumn[]
  settings: {
    showSubtasks: boolean
    showProgress: boolean
    showDueDate: boolean
    showAssignee: boolean
    compactMode: boolean
  }
}

// Calendar Integration Types
export interface TaskCalendarEvent {
  id: string
  taskId: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  color: string
  type: 'task' | 'deadline' | 'reminder'
  priority: TaskPriority
  status: TaskStatus
}

// Timeline/Gantt Types
export interface TimelineTask {
  id: string
  title: string
  start: Date
  end: Date
  progress: number
  dependencies: string[]
  assignee?: string
  priority: TaskPriority
  status: TaskStatus
  parent?: string
  children?: TimelineTask[]
}

// Activity & History Types
export interface TaskActivity {
  id: string
  taskId: string
  userId: string
  action: TaskActivityAction
  details: string
  metadata?: Record<string, any>
  createdAt: Date
}

export type TaskActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'assigned'
  | 'commented'
  | 'completed'
  | 'archived'
  | 'deleted'
  | 'due_date_changed'
  | 'priority_changed'
  | 'attachment_added'
  | 'checklist_updated'

// Search and Auto-complete Types
export interface TaskSearchResult {
  tasks: Task[]
  suggestions: {
    tags: string[]
    assignees: string[]
    projects: string[]
    categories: string[]
  }
  totalCount: number
}

// Notification Types
export interface TaskNotification {
  id: string
  taskId: string
  type: TaskNotificationType
  message: string
  read: boolean
  createdAt: Date
  recipientId: string
}

export type TaskNotificationType =
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'task_completed'
  | 'task_commented'
  | 'task_blocked'
  | 'dependency_completed'
  | 'reminder'

// Integration Types
export interface TaskIntegration {
  id: string
  taskId: string
  externalId: string
  platform: 'email' | 'calendar' | 'slack' | 'jira' | 'asana' | 'trello'
  syncStatus: 'synced' | 'pending' | 'error'
  lastSync: Date
  metadata: Record<string, any>
}

// Reporting Types
export interface TaskReport {
  id: string
  name: string
  type:
    | 'productivity'
    | 'team_performance'
    | 'project_progress'
    | 'time_tracking'
  dateRange: {
    start: Date
    end: Date
  }
  filters: TaskFilter
  data: Record<string, any>
  generatedAt: Date
  generatedBy: string
}

// Export Types
export interface TaskExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf'
  fields: string[]
  filters: TaskFilter
  includeSubtasks: boolean
  includeComments: boolean
  includeAttachments: boolean
}

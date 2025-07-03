import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  CreateTaskData,
  UpdateTaskData,
  TaskFilter,
  TaskStats,
  ChecklistItem,
  TaskComment,
  TaskDependency,
  TaskTemplate,
  KanbanBoard,
  KanbanColumn,
  TaskSearchResult,
  BulkTaskUpdate,
} from '../types/task'
import { contactsService } from './contactsService'
import { meetingsService } from './meetingsService'

// Mock data generation utilities
const generateTaskId = () =>
  `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const generateChecklistItemId = () =>
  `checklist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const generateCommentId = () =>
  `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const generateDependencyId = () =>
  `dependency_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const generateTemplateId = () =>
  `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

// Helper functions
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const getRandomDateInRange = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

const getRandomPastDate = (daysBack: number): Date => {
  const now = new Date()
  return new Date(
    now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000
  )
}

const getRandomFutureDate = (daysAhead: number): Date => {
  const now = new Date()
  return new Date(
    now.getTime() + Math.random() * daysAhead * 24 * 60 * 60 * 1000
  )
}

// Task categories and projects
const taskCategories = [
  'Development',
  'Marketing',
  'Sales',
  'Operations',
  'Design',
  'Research',
  'Admin',
  'Personal',
  'Strategic',
  'Customer Success',
  'HR',
  'Finance',
]

const projects = [
  'Q4 Product Launch',
  'Website Redesign',
  'Mobile App Development',
  'Customer Onboarding',
  'Marketing Campaign',
  'Sales Process Optimization',
  'Team Building Initiative',
  'Performance Review Process',
  'Cost Reduction Project',
  'Partnership Development',
  'Training Program',
  'Infrastructure Upgrade',
]

const taskTags = [
  'urgent',
  'client-facing',
  'internal',
  'review-needed',
  'blocked',
  'waiting-approval',
  'research',
  'documentation',
  'testing',
  'design',
  'backend',
  'frontend',
  'mobile',
  'analytics',
  'security',
  'performance',
  'bug-fix',
  'feature',
  'enhancement',
  'maintenance',
]

// Task titles for different types
// Define status and priority values as arrays (module level)
const taskStatuses: TaskStatus[] = [
  'not_started',
  'in_progress',
  'waiting',
  'blocked',
  'completed',
  'cancelled',
]
const taskPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
const taskTypes: TaskType[] = [
  'task',
  'action_item',
  'reminder',
  'meeting_followup',
  'project_milestone',
  'personal',
  'delegated',
]

const taskTitles = {
  development: [
    'Implement user authentication system',
    'Fix responsive layout issues',
    'Add search functionality to dashboard',
    'Optimize database queries',
    'Implement real-time notifications',
    'Update API documentation',
    'Refactor legacy code modules',
    'Add unit tests for core features',
    'Integrate third-party payment gateway',
    'Implement data export functionality',
  ],
  marketing: [
    'Create social media content calendar',
    'Design email marketing templates',
    'Analyze competitor pricing strategies',
    'Develop brand guidelines document',
    'Plan product launch campaign',
    'Optimize landing page conversion',
    'Create customer testimonial videos',
    'Research target audience demographics',
    'Design trade show booth layout',
    'Write product feature blog posts',
  ],
  sales: [
    'Prepare quarterly sales presentation',
    'Update CRM contact database',
    'Follow up with warm leads',
    'Create sales proposal template',
    'Analyze sales pipeline metrics',
    'Schedule client check-in calls',
    'Prepare competitive analysis report',
    'Update pricing strategy document',
    'Create onboarding materials',
    'Review contract terms with legal',
  ],
  operations: [
    'Streamline invoice processing workflow',
    'Update employee handbook',
    'Implement new project management tool',
    'Conduct team performance reviews',
    'Optimize supply chain processes',
    'Create disaster recovery plan',
    'Update security protocols',
    'Implement cost tracking system',
    'Develop training curriculum',
    'Review vendor contracts',
  ],
  personal: [
    'Complete professional development course',
    'Update LinkedIn profile',
    'Prepare for team presentation',
    'Review quarterly goals',
    'Organize workspace',
    'Update project portfolio',
    'Schedule health check-up',
    'Plan vacation time',
    'Read industry research papers',
    'Attend networking event',
  ],
}

// Generate realistic task descriptions
const generateTaskDescription = (_title: string, type: TaskType): string => {
  const descriptions = {
    task: 'This task requires careful planning and execution. Key deliverables include comprehensive documentation and stakeholder approval.',
    action_item:
      'Follow-up action item from recent meeting. Requires coordination with team members and timely completion.',
    reminder:
      'Important reminder to ensure critical deadlines are met and processes are followed.',
    meeting_followup:
      'Action item generated from meeting discussion. Requires follow-up with relevant stakeholders.',
    project_milestone:
      'Critical milestone in project timeline. Success metrics and completion criteria clearly defined.',
    personal:
      'Personal development task to enhance skills and professional growth.',
    delegated:
      'Task delegated to team member. Requires clear communication of expectations and deadlines.',
  }

  return (
    descriptions[type] ||
    'Standard task requiring completion within specified timeframe.'
  )
}

// Generate realistic checklist items
const generateChecklistItems = async (
  _taskType: TaskType,
  count: number
): Promise<ChecklistItem[]> => {
  const commonItems = [
    'Research requirements and constraints',
    'Draft initial proposal or plan',
    'Review with team members',
    'Incorporate feedback and revisions',
    'Final review and approval',
    'Implementation or execution',
    'Testing and quality assurance',
    'Documentation and handover',
  ]

  const contacts = await contactsService.getContacts()

  const items = getRandomItems(commonItems, count).map(title => ({
    id: generateChecklistItemId(),
    title,
    completed: Math.random() > 0.6,
    dueDate: Math.random() > 0.7 ? getRandomFutureDate(14) : undefined,
    assignedTo: Math.random() > 0.8 ? getRandomItem(contacts).id : undefined,
  }))

  return items
}

// Generate task comments
const generateTaskComments = async (
  _taskId: string,
  count: number
): Promise<TaskComment[]> => {
  const commentTexts = [
    'Great progress on this task! Keep up the good work.',
    'Need to address some dependencies before proceeding.',
    'Updated the timeline based on new requirements.',
    'Coordination with external team required.',
    'Blocking issue has been resolved, proceeding as planned.',
    'Quality review completed, ready for next phase.',
    'Documentation updated with latest changes.',
    'Stakeholder approval received, moving forward.',
  ]

  const contacts = await contactsService.getContacts()

  return Array.from({ length: count }, () => ({
    id: generateCommentId(),
    content: getRandomItem(commentTexts),
    author: getRandomItem(contacts).id,
    createdAt: getRandomPastDate(30),
    isInternal: Math.random() > 0.3,
  }))
}

// Generate task dependencies
const generateTaskDependencies = (
  taskId: string,
  allTasks: Task[]
): TaskDependency[] => {
  if (Math.random() > 0.3) return [] // 30% chance of having dependencies

  const dependencyTypes: ('blocks' | 'blocked_by' | 'related')[] = [
    'blocks',
    'blocked_by',
    'related',
  ]
  const potentialDependencies = allTasks.filter(task => task.id !== taskId)

  if (potentialDependencies.length === 0) return []

  return getRandomItems(
    potentialDependencies,
    Math.floor(Math.random() * 3) + 1
  ).map(task => ({
    id: generateDependencyId(),
    taskId: task.id,
    type: getRandomItem(dependencyTypes),
    description: `Task dependency: ${task.title}`,
  }))
}

// Generate mock tasks
const generateMockTasks = async (): Promise<Task[]> => {
  try {
    // Batch async operations outside the loop for better performance
    const [contacts, meetings] = await Promise.all([
      contactsService.getContacts(),
      meetingsService.getMeetings(),
    ])

    const tasks: Task[] = []

    // Generate 15 tasks for optimal performance
    for (let i = 0; i < 15; i++) {
      // console.log(`generateMockTasks: Processing task ${i}/50...`)
      const taskType = getRandomItem(taskTypes)
      const category = getRandomItem(taskCategories)
      const categoryKey = category
        .toLowerCase()
        .replace(/\s+/g, '_') as keyof typeof taskTitles

      // Get appropriate titles for the category
      const availableTitles = taskTitles[categoryKey] || taskTitles.development
      const title = `${getRandomItem(availableTitles)} ${i > 200 ? `(${category})` : ''}`

      const createdDate = getRandomPastDate(90)
      const dueDate = Math.random() > 0.3 ? getRandomFutureDate(60) : undefined
      const startDate = Math.random() > 0.5 ? getRandomPastDate(30) : undefined

      const status = getRandomItem(taskStatuses)
      const priority = getRandomItem(taskPriorities)

      const completedAt =
        status === 'completed' ? getRandomPastDate(30) : undefined
      const estimatedDuration = Math.floor(Math.random() * 480) + 30 // 30 minutes to 8 hours
      const actualDuration =
        status === 'completed'
          ? Math.floor(estimatedDuration * (0.8 + Math.random() * 0.4))
          : 0

      const assignedTo =
        Math.random() > 0.2 ? getRandomItem(contacts).id : undefined
      const createdBy = getRandomItem(contacts).id

      const progress =
        status === 'completed'
          ? 100
          : status === 'in_progress'
            ? Math.floor(Math.random() * 80) + 10
            : status === 'not_started'
              ? 0
              : Math.floor(Math.random() * 60) + 20

      const timeSpent =
        status === 'in_progress' || status === 'completed'
          ? Math.floor(Math.random() * estimatedDuration)
          : 0

      // Simplified: no checklist items or comments for faster loading
      const checklistItems: ChecklistItem[] = []
      const comments: TaskComment[] = []

      const task: Task = {
        id: generateTaskId(),
        title,
        description: generateTaskDescription(title, taskType),
        status,
        priority,
        type: taskType,
        createdAt: createdDate,
        updatedAt: getRandomDateInRange(createdDate, new Date()),
        dueDate,
        startDate,
        completedAt,
        estimatedDuration,
        actualDuration,
        assignedTo,
        createdBy,
        delegatedBy:
          Math.random() > 0.9 ? getRandomItem(contacts).id : undefined,
        watchers: getRandomItems(contacts, Math.floor(Math.random() * 3)).map(
          c => c.id
        ),
        category,
        tags: getRandomItems(taskTags, Math.floor(Math.random() * 4) + 1),
        project: Math.random() > 0.4 ? getRandomItem(projects) : undefined,
        parentTaskId:
          Math.random() > 0.9 && tasks.length > 0
            ? getRandomItem(tasks).id
            : undefined,
        subtasks: [], // Will be populated later
        meetingId:
          Math.random() > 0.7 && meetings.length > 0
            ? getRandomItem(meetings).id
            : undefined,
        contactId: Math.random() > 0.6 ? getRandomItem(contacts).id : undefined,
        progress,
        timeSpent,
        checklistItems,
        dependencies: [], // Will be populated after all tasks are created
        isPrivate: Math.random() > 0.8,
        isArchived: Math.random() > 0.95,
        attachments: [], // Simplified for demo
        comments,
        reminders: [], // Simplified for demo
        location: Math.random() > 0.8 ? 'Office' : undefined,
      }

      tasks.push(task)
    }

    // Skip dependency generation for faster loading
    // tasks.forEach(task => {
    //   task.dependencies = generateTaskDependencies(task.id, tasks)
    // })

    return tasks
  } catch (error) {
    console.error('Error generating mock tasks:', error)
    return []
  }
}

// Generate subtasks for parent tasks
const generateSubtasks = (tasks: Task[]): Task[] => {
  const parentTasks = tasks.filter(
    task => !task.parentTaskId && Math.random() > 0.8
  )

  parentTasks.forEach(parentTask => {
    const subtaskCount = Math.floor(Math.random() * 3) + 1
    const subtasks = []

    for (let i = 0; i < subtaskCount; i++) {
      const subtask: Task = {
        ...parentTask,
        id: generateTaskId(),
        title: `${parentTask.title} - Subtask ${i + 1}`,
        parentTaskId: parentTask.id,
        subtasks: [],
        progress: Math.floor(Math.random() * 100),
        priority: getRandomItem(taskPriorities),
        status: getRandomItem(taskStatuses),
        createdAt: new Date(
          parentTask.createdAt.getTime() + i * 24 * 60 * 60 * 1000
        ),
      }

      subtasks.push(subtask)
      tasks.push(subtask)
    }

    parentTask.subtasks = subtasks
  })

  return tasks
}

// Generate default Kanban board
const generateDefaultKanbanBoard = (): KanbanBoard => {
  const columns: KanbanColumn[] = [
    {
      id: 'not_started',
      title: 'To Do',
      status: 'not_started',
      order: 0,
      color: '#e3f2fd',
      isCollapsed: false,
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      status: 'in_progress',
      order: 1,
      color: '#fff3e0',
      isCollapsed: false,
      limit: 5,
    },
    {
      id: 'waiting',
      title: 'Waiting',
      status: 'waiting',
      order: 2,
      color: '#fce4ec',
      isCollapsed: false,
    },
    {
      id: 'blocked',
      title: 'Blocked',
      status: 'blocked',
      order: 3,
      color: '#ffebee',
      isCollapsed: false,
    },
    {
      id: 'completed',
      title: 'Completed',
      status: 'completed',
      order: 4,
      color: '#e8f5e8',
      isCollapsed: false,
    },
  ]

  return {
    id: 'default-board',
    name: 'Default Task Board',
    columns,
    settings: {
      showSubtasks: true,
      showProgress: true,
      showDueDate: true,
      showAssignee: true,
      compactMode: false,
    },
  }
}

// Generate task templates
const generateTaskTemplates = (): TaskTemplate[] => {
  const templates = [
    {
      name: 'Project Kickoff',
      description: 'Standard template for project kickoff tasks',
      category: 'Project Management',
      defaultPriority: 'high' as TaskPriority,
      defaultDuration: 240,
      checklistTemplate: [
        { title: 'Define project scope and objectives', completed: false },
        { title: 'Identify key stakeholders', completed: false },
        { title: 'Create project timeline', completed: false },
        { title: 'Set up project communication channels', completed: false },
        { title: 'Schedule regular check-in meetings', completed: false },
      ],
      tags: ['project', 'kickoff', 'planning'],
    },
    {
      name: 'Bug Fix',
      description: 'Template for handling bug fixes',
      category: 'Development',
      defaultPriority: 'medium' as TaskPriority,
      defaultDuration: 120,
      checklistTemplate: [
        { title: 'Reproduce the bug', completed: false },
        { title: 'Identify root cause', completed: false },
        { title: 'Implement fix', completed: false },
        { title: 'Test the fix', completed: false },
        { title: 'Deploy to production', completed: false },
      ],
      tags: ['bug', 'development', 'fix'],
    },
    {
      name: 'Marketing Campaign',
      description: 'Template for marketing campaign tasks',
      category: 'Marketing',
      defaultPriority: 'high' as TaskPriority,
      defaultDuration: 480,
      checklistTemplate: [
        { title: 'Define campaign objectives', completed: false },
        { title: 'Identify target audience', completed: false },
        { title: 'Create campaign materials', completed: false },
        { title: 'Set up tracking and analytics', completed: false },
        { title: 'Launch campaign', completed: false },
        { title: 'Monitor and optimize', completed: false },
      ],
      tags: ['marketing', 'campaign', 'promotion'],
    },
  ]

  return templates.map(template => ({
    id: generateTemplateId(),
    ...template,
    isPublic: true,
    createdBy: 'system',
    createdAt: getRandomPastDate(60),
    usageCount: Math.floor(Math.random() * 50) + 1,
  }))
}

// Initialize mock data
let mockTasks: Task[] = []
let mockTemplates: TaskTemplate[] = []
let mockKanbanBoard: KanbanBoard

// Initialize data
const initializeData = async () => {
  console.log(
    'initializeData: Starting, current mockTasks length:',
    mockTasks.length
  )
  if (mockTasks.length === 0) {
    console.log('initializeData: Generating mock tasks...')
    const baseTasks = await generateMockTasks()
    console.log('initializeData: Base tasks generated:', baseTasks.length)
    mockTasks = generateSubtasks(baseTasks)
    console.log(
      'initializeData: Subtasks generated, total tasks:',
      mockTasks.length
    )
    mockTemplates = generateTaskTemplates()
    console.log('initializeData: Templates generated:', mockTemplates.length)
    mockKanbanBoard = generateDefaultKanbanBoard()
    console.log('initializeData: Kanban board generated')
  } else {
    console.log('initializeData: Data already initialized, skipping')
  }
}

// Service implementation
export const tasksService = {
  // Task CRUD operations
  getAllTasks: async (): Promise<Task[]> => {
    console.log('tasksService.getAllTasks: Starting...')
    await initializeData()
    console.log(
      'tasksService.getAllTasks: Data initialized, mockTasks length:',
      mockTasks.length
    )
    const filteredTasks = mockTasks.filter(task => !task.isArchived)
    console.log(
      'tasksService.getAllTasks: Returning filtered tasks:',
      filteredTasks.length
    )
    return filteredTasks
  },

  getTaskById: (id: string): Task | undefined => {
    return mockTasks.find(task => task.id === id)
  },

  createTask: async (taskData: CreateTaskData): Promise<Task> => {
    await initializeData()
    const contacts = await contactsService.getContacts()
    const newTask: Task = {
      id: generateTaskId(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      type: taskData.type,
      dueDate: taskData.dueDate,
      startDate: taskData.startDate,
      estimatedDuration: taskData.estimatedDuration,
      assignedTo: taskData.assignedTo,
      category: taskData.category,
      tags: taskData.tags || [],
      project: taskData.project,
      parentTaskId: taskData.parentTaskId,
      meetingId: taskData.meetingId,
      contactId: taskData.contactId,
      location: taskData.location,
      isPrivate: taskData.isPrivate,
      checklistItems: (taskData.checklistItems || []).map(item => ({
        id: generateChecklistItemId(),
        title: item.title,
        completed: item.completed || false,
        dueDate: item.dueDate,
        assignedTo: item.assignedTo,
      })),
      createdBy: contacts.length > 0 ? getRandomItem(contacts).id : 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 0,
      timeSpent: 0,
      subtasks: [],
      dependencies: [],
      watchers: [],
      attachments: [],
      comments: [],
      reminders: [],
      isArchived: false,
      completedAt: undefined,
      actualDuration: undefined,
      delegatedBy: undefined,
      status: 'not_started',
    }

    mockTasks.push(newTask)
    return newTask
  },

  updateTask: (id: string, updates: UpdateTaskData): Task | null => {
    const taskIndex = mockTasks.findIndex(task => task.id === id)
    if (taskIndex === -1) return null

    const { checklistItems, ...otherUpdates } = updates
    const updatedTask: Task = {
      ...mockTasks[taskIndex],
      ...otherUpdates,
      updatedAt: new Date(),
      checklistItems: checklistItems
        ? checklistItems.map(item => ({
            ...item,
            id: generateChecklistItemId(),
            completed: item.completed ?? false,
          }))
        : mockTasks[taskIndex].checklistItems,
    }

    // Handle status changes
    if (
      updates.status === 'completed' &&
      mockTasks[taskIndex].status !== 'completed'
    ) {
      updatedTask.completedAt = new Date()
      updatedTask.progress = 100
    } else if (
      updates.status !== 'completed' &&
      mockTasks[taskIndex].status === 'completed'
    ) {
      updatedTask.completedAt = undefined
    }

    mockTasks[taskIndex] = updatedTask
    return updatedTask
  },

  deleteTask: (id: string): boolean => {
    const taskIndex = mockTasks.findIndex(task => task.id === id)
    if (taskIndex === -1) return false

    // Remove task and its subtasks
    mockTasks = mockTasks.filter(
      task => task.id !== id && task.parentTaskId !== id
    )
    return true
  },

  // Filtering and search
  getTasksWithFilter: (filter: TaskFilter): Task[] => {
    let filtered = mockTasks.filter(task => !task.isArchived)

    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(task => filter.status!.includes(task.status))
    }

    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter(task =>
        filter.priority!.includes(task.priority)
      )
    }

    if (filter.assignedTo && filter.assignedTo.length > 0) {
      filtered = filtered.filter(
        task => task.assignedTo && filter.assignedTo!.includes(task.assignedTo)
      )
    }

    if (filter.category && filter.category.length > 0) {
      filtered = filtered.filter(
        task => task.category && filter.category!.includes(task.category)
      )
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(task =>
        task.tags.some(tag => filter.tags!.includes(tag))
      )
    }

    if (filter.overdue) {
      const now = new Date()
      filtered = filtered.filter(
        task =>
          task.dueDate && task.dueDate < now && task.status !== 'completed'
      )
    }

    if (filter.dueDate) {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false
        const taskDue = new Date(task.dueDate)
        const startMatch =
          !filter.dueDate!.start || taskDue >= filter.dueDate!.start
        const endMatch = !filter.dueDate!.end || taskDue <= filter.dueDate!.end
        return startMatch && endMatch
      })
    }

    return filtered
  },

  // Task statistics
  getTaskStats: (): TaskStats => {
    const activeTasks = mockTasks.filter(task => !task.isArchived)
    const completedTasks = activeTasks.filter(
      task => task.status === 'completed'
    )
    const inProgressTasks = activeTasks.filter(
      task => task.status === 'in_progress'
    )
    const overdueTasks = activeTasks.filter(task => {
      const now = new Date()
      return task.dueDate && task.dueDate < now && task.status !== 'completed'
    })

    const completionRate =
      activeTasks.length > 0
        ? (completedTasks.length / activeTasks.length) * 100
        : 0

    // Calculate average time to complete
    const completedWithDuration = completedTasks.filter(
      task => task.createdAt && task.completedAt
    )
    const avgTimeToComplete =
      completedWithDuration.length > 0
        ? completedWithDuration.reduce((sum, task) => {
            const days =
              (task.completedAt!.getTime() - task.createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
            return sum + days
          }, 0) / completedWithDuration.length
        : 0

    return {
      total: activeTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      overdue: overdueTasks.length,
      completionRate,
      averageTimeToComplete: avgTimeToComplete,
      productivityScore: Math.min(
        100,
        Math.max(0, completionRate - overdueTasks.length * 5)
      ),
      weeklyProgress: [], // Simplified for demo
    }
  },

  // Bulk operations
  bulkUpdateTasks: (update: BulkTaskUpdate): Task[] => {
    const updatedTasks: Task[] = []

    update.taskIds.forEach(taskId => {
      const task = tasksService.updateTask(taskId, update.updates)
      if (task) updatedTasks.push(task)
    })

    return updatedTasks
  },

  // Templates
  getTaskTemplates: (): TaskTemplate[] => {
    return mockTemplates
  },

  createTaskFromTemplate: async (
    templateId: string,
    customData?: Partial<CreateTaskData>
  ): Promise<Task | null> => {
    const template = mockTemplates.find(t => t.id === templateId)
    if (!template) return null

    const taskData: CreateTaskData = {
      title: customData?.title || `Task from ${template.name}`,
      description: customData?.description || template.description,
      priority: customData?.priority || template.defaultPriority,
      type: customData?.type || 'task',
      estimatedDuration:
        customData?.estimatedDuration || template.defaultDuration,
      tags: customData?.tags || template.tags,
      category: customData?.category || template.category,
      checklistItems: (template.checklistTemplate || []).map(item => ({
        ...item,
        id: generateChecklistItemId(),
        completed: false,
      })),
      isPrivate: customData?.isPrivate || false,
      ...customData,
    }

    // Increment usage count
    template.usageCount++

    return await tasksService.createTask(taskData)
  },

  // Kanban board
  getKanbanBoard: (): KanbanBoard => {
    return mockKanbanBoard
  },

  updateKanbanBoard: (boardData: Partial<KanbanBoard>): KanbanBoard => {
    mockKanbanBoard = { ...mockKanbanBoard, ...boardData }
    return mockKanbanBoard
  },

  // Utility functions
  getTasksByStatus: (status: TaskStatus): Task[] => {
    return mockTasks.filter(task => task.status === status && !task.isArchived)
  },

  getTasksByAssignee: (assigneeId: string): Task[] => {
    return mockTasks.filter(
      task => task.assignedTo === assigneeId && !task.isArchived
    )
  },

  getOverdueTasks: (): Task[] => {
    const now = new Date()
    return mockTasks.filter(
      task =>
        task.dueDate &&
        task.dueDate < now &&
        task.status !== 'completed' &&
        !task.isArchived
    )
  },

  getTasksDueToday: (): Task[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return mockTasks.filter(
      task =>
        task.dueDate &&
        task.dueDate >= today &&
        task.dueDate < tomorrow &&
        !task.isArchived
    )
  },

  getTasksDueThisWeek: (): Task[] => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    return mockTasks.filter(
      task =>
        task.dueDate &&
        task.dueDate >= weekStart &&
        task.dueDate < weekEnd &&
        !task.isArchived
    )
  },

  // Search
  searchTasks: (query: string): TaskSearchResult => {
    const searchLower = query.toLowerCase()
    const matchingTasks = mockTasks.filter(
      task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        task.category?.toLowerCase().includes(searchLower)
    )

    // Generate suggestions based on existing data
    const allTags = [...new Set(mockTasks.flatMap(task => task.tags))]
    const allAssignees = [
      ...new Set(
        mockTasks.map(task => task.assignedTo).filter(Boolean) as string[]
      ),
    ]
    const allProjects = [
      ...new Set(
        mockTasks.map(task => task.project).filter(Boolean) as string[]
      ),
    ]
    const allCategories = [
      ...new Set(
        mockTasks.map(task => task.category).filter(Boolean) as string[]
      ),
    ]

    return {
      tasks: matchingTasks,
      suggestions: {
        tags: allTags.filter(tag => tag.toLowerCase().includes(searchLower)),
        assignees: allAssignees,
        projects: allProjects.filter(project =>
          project.toLowerCase().includes(searchLower)
        ),
        categories: allCategories.filter(category =>
          category.toLowerCase().includes(searchLower)
        ),
      },
      totalCount: matchingTasks.length,
    }
  },

  // Integration helpers
  createTaskFromMeeting: async (
    meetingId: string,
    actionItems: string[]
  ): Promise<Task[]> => {
    const meetings = await meetingsService.getMeetings()
    const meeting = meetings.find(m => m.id === meetingId)
    if (!meeting) return []

    const tasks = await Promise.all(
      actionItems.map(async actionItem => {
        const taskData: CreateTaskData = {
          title: actionItem,
          description: `Action item from meeting: ${meeting.title}`,
          priority: 'medium',
          type: 'meeting_followup',
          meetingId: meeting.id,
          tags: ['meeting-action', 'followup'],
          category: 'Operations',
          checklistItems: [],
          isPrivate: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 1 week
        }

        return await tasksService.createTask(taskData)
      })
    )

    return tasks
  },

  // Reset data (for demo purposes)
  resetData: async (): Promise<void> => {
    const baseTasks = await generateMockTasks()
    mockTasks = generateSubtasks(baseTasks)
    mockTemplates = generateTaskTemplates()
    mockKanbanBoard = generateDefaultKanbanBoard()
  },
}

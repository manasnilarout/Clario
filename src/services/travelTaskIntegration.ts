import type {
  Task,
  CreateTaskData,
  TaskPriority,
  TaskType,
} from '../types/task'
import type { Trip, TripPurpose, Destination } from '../types/travel'
import { tasksService } from './tasksService'
import { travelService } from './travelService'

export interface TravelTaskIntegration {
  generatePreTravelTasks(tripId: string): Promise<Task[]>
  createLocationBasedTasks(
    tripId: string,
    destinationId: string
  ): Promise<Task[]>
  adaptTasksForTravel(taskIds: string[], tripId: string): Promise<Task[]>
  generatePostTravelFollowUp(tripId: string): Promise<Task[]>
}

// Task templates based on trip purpose and destination
const PRE_TRAVEL_TASK_TEMPLATES = {
  business: [
    {
      title: 'Review meeting agenda and prepare materials',
      category: 'Preparation',
      priority: 'high' as TaskPriority,
      tags: ['business-travel', 'preparation', 'meetings'],
      estimatedDuration: 60,
      daysBeforeTrip: 7,
    },
    {
      title: 'Confirm all meeting appointments and locations',
      category: 'Coordination',
      priority: 'high' as TaskPriority,
      tags: ['business-travel', 'coordination', 'meetings'],
      estimatedDuration: 30,
      daysBeforeTrip: 3,
    },
    {
      title: 'Prepare business cards and marketing materials',
      category: 'Preparation',
      priority: 'medium' as TaskPriority,
      tags: ['business-travel', 'marketing', 'networking'],
      estimatedDuration: 20,
      daysBeforeTrip: 5,
    },
    {
      title: 'Set up out-of-office email and voicemail messages',
      category: 'Communication',
      priority: 'medium' as TaskPriority,
      tags: ['business-travel', 'communication', 'automation'],
      estimatedDuration: 15,
      daysBeforeTrip: 1,
    },
    {
      title: 'Brief team on responsibilities during absence',
      category: 'Delegation',
      priority: 'high' as TaskPriority,
      tags: ['business-travel', 'delegation', 'team'],
      estimatedDuration: 45,
      daysBeforeTrip: 2,
    },
  ],
  conference: [
    {
      title: 'Research conference agenda and speakers',
      category: 'Research',
      priority: 'medium' as TaskPriority,
      tags: ['conference', 'research', 'networking'],
      estimatedDuration: 90,
      daysBeforeTrip: 14,
    },
    {
      title: 'Identify key attendees for networking',
      category: 'Networking',
      priority: 'medium' as TaskPriority,
      tags: ['conference', 'networking', 'contacts'],
      estimatedDuration: 60,
      daysBeforeTrip: 7,
    },
    {
      title: 'Prepare elevator pitch and talking points',
      category: 'Preparation',
      priority: 'high' as TaskPriority,
      tags: ['conference', 'networking', 'presentation'],
      estimatedDuration: 120,
      daysBeforeTrip: 5,
    },
    {
      title: 'Register for conference sessions and workshops',
      category: 'Registration',
      priority: 'high' as TaskPriority,
      tags: ['conference', 'registration', 'sessions'],
      estimatedDuration: 30,
      daysBeforeTrip: 10,
    },
  ],
  training: [
    {
      title: 'Review training materials and pre-work',
      category: 'Preparation',
      priority: 'high' as TaskPriority,
      tags: ['training', 'preparation', 'learning'],
      estimatedDuration: 180,
      daysBeforeTrip: 7,
    },
    {
      title: 'Complete pre-training assessments',
      category: 'Assessment',
      priority: 'high' as TaskPriority,
      tags: ['training', 'assessment', 'learning'],
      estimatedDuration: 60,
      daysBeforeTrip: 5,
    },
    {
      title: 'Prepare questions and learning objectives',
      category: 'Planning',
      priority: 'medium' as TaskPriority,
      tags: ['training', 'planning', 'objectives'],
      estimatedDuration: 45,
      daysBeforeTrip: 3,
    },
  ],
  client_visit: [
    {
      title: 'Research client company and recent developments',
      category: 'Research',
      priority: 'high' as TaskPriority,
      tags: ['client-visit', 'research', 'preparation'],
      estimatedDuration: 90,
      daysBeforeTrip: 7,
    },
    {
      title: 'Prepare client presentation and proposals',
      category: 'Preparation',
      priority: 'high' as TaskPriority,
      tags: ['client-visit', 'presentation', 'proposals'],
      estimatedDuration: 240,
      daysBeforeTrip: 10,
    },
    {
      title: 'Coordinate with local team members',
      category: 'Coordination',
      priority: 'high' as TaskPriority,
      tags: ['client-visit', 'coordination', 'team'],
      estimatedDuration: 30,
      daysBeforeTrip: 3,
    },
    {
      title: 'Prepare contract documents and legal materials',
      category: 'Documentation',
      priority: 'medium' as TaskPriority,
      tags: ['client-visit', 'contracts', 'legal'],
      estimatedDuration: 60,
      daysBeforeTrip: 5,
    },
  ],
  personal: [
    {
      title: 'Research local attractions and activities',
      category: 'Planning',
      priority: 'low' as TaskPriority,
      tags: ['personal-travel', 'research', 'activities'],
      estimatedDuration: 60,
      daysBeforeTrip: 14,
    },
    {
      title: 'Make restaurant reservations',
      category: 'Booking',
      priority: 'medium' as TaskPriority,
      tags: ['personal-travel', 'dining', 'reservations'],
      estimatedDuration: 30,
      daysBeforeTrip: 7,
    },
  ],
  mixed: [
    {
      title: 'Plan itinerary balancing work and personal time',
      category: 'Planning',
      priority: 'high' as TaskPriority,
      tags: ['mixed-travel', 'planning', 'work-life-balance'],
      estimatedDuration: 90,
      daysBeforeTrip: 10,
    },
  ],
}

// Common tasks for all trip types
const COMMON_PRE_TRAVEL_TASKS = [
  {
    title: 'Check passport expiration and visa requirements',
    category: 'Documentation',
    priority: 'high' as TaskPriority,
    tags: ['travel-docs', 'passport', 'visa'],
    estimatedDuration: 20,
    daysBeforeTrip: 30,
  },
  {
    title: 'Book transportation (flights, trains, car rental)',
    category: 'Booking',
    priority: 'high' as TaskPriority,
    tags: ['transportation', 'booking', 'logistics'],
    estimatedDuration: 45,
    daysBeforeTrip: 21,
  },
  {
    title: 'Book accommodation',
    category: 'Booking',
    priority: 'high' as TaskPriority,
    tags: ['accommodation', 'booking', 'lodging'],
    estimatedDuration: 30,
    daysBeforeTrip: 14,
  },
  {
    title: 'Check weather forecast and pack accordingly',
    category: 'Preparation',
    priority: 'medium' as TaskPriority,
    tags: ['weather', 'packing', 'preparation'],
    estimatedDuration: 30,
    daysBeforeTrip: 3,
  },
  {
    title: 'Arrange travel insurance',
    category: 'Insurance',
    priority: 'medium' as TaskPriority,
    tags: ['insurance', 'protection', 'safety'],
    estimatedDuration: 20,
    daysBeforeTrip: 14,
  },
  {
    title: 'Notify bank and credit card companies of travel',
    category: 'Financial',
    priority: 'medium' as TaskPriority,
    tags: ['banking', 'financial', 'notifications'],
    estimatedDuration: 15,
    daysBeforeTrip: 7,
  },
  {
    title: 'Research local currency and exchange rates',
    category: 'Financial',
    priority: 'low' as TaskPriority,
    tags: ['currency', 'financial', 'research'],
    estimatedDuration: 15,
    daysBeforeTrip: 7,
  },
  {
    title: 'Download offline maps and translation apps',
    category: 'Technology',
    priority: 'medium' as TaskPriority,
    tags: ['technology', 'apps', 'preparation'],
    estimatedDuration: 20,
    daysBeforeTrip: 3,
  },
  {
    title: 'Arrange pet/plant care or house sitting',
    category: 'Home',
    priority: 'medium' as TaskPriority,
    tags: ['home-care', 'pets', 'house-sitting'],
    estimatedDuration: 30,
    daysBeforeTrip: 7,
  },
  {
    title: 'Pack luggage and check weight restrictions',
    category: 'Packing',
    priority: 'high' as TaskPriority,
    tags: ['packing', 'luggage', 'preparation'],
    estimatedDuration: 90,
    daysBeforeTrip: 1,
  },
]

// Location-specific task templates
const LOCATION_SPECIFIC_TASKS = {
  international: [
    {
      title: 'Research local customs and etiquette',
      category: 'Cultural',
      priority: 'medium' as TaskPriority,
      tags: ['culture', 'etiquette', 'international'],
      estimatedDuration: 45,
    },
    {
      title: 'Check vaccination requirements',
      category: 'Health',
      priority: 'high' as TaskPriority,
      tags: ['health', 'vaccinations', 'international'],
      estimatedDuration: 30,
    },
    {
      title: 'Research local laws and regulations',
      category: 'Legal',
      priority: 'medium' as TaskPriority,
      tags: ['legal', 'regulations', 'international'],
      estimatedDuration: 30,
    },
  ],
  domestic: [
    {
      title: 'Check state/regional regulations',
      category: 'Legal',
      priority: 'low' as TaskPriority,
      tags: ['regulations', 'domestic', 'local-laws'],
      estimatedDuration: 15,
    },
  ],
  remote: [
    {
      title: 'Download offline maps and emergency contacts',
      category: 'Safety',
      priority: 'high' as TaskPriority,
      tags: ['safety', 'emergency', 'remote-location'],
      estimatedDuration: 30,
    },
    {
      title: 'Arrange satellite communication device',
      category: 'Communication',
      priority: 'high' as TaskPriority,
      tags: ['communication', 'satellite', 'remote-location'],
      estimatedDuration: 45,
    },
  ],
}

// Post-travel follow-up tasks
const POST_TRAVEL_TASKS = [
  {
    title: 'Submit expense reports and receipts',
    category: 'Financial',
    priority: 'high' as TaskPriority,
    tags: ['expenses', 'reimbursement', 'financial'],
    estimatedDuration: 60,
    daysAfterTrip: 3,
  },
  {
    title: 'Follow up with new contacts and connections',
    category: 'Networking',
    priority: 'high' as TaskPriority,
    tags: ['networking', 'follow-up', 'contacts'],
    estimatedDuration: 45,
    daysAfterTrip: 1,
  },
  {
    title: 'Share trip insights and learnings with team',
    category: 'Knowledge Sharing',
    priority: 'medium' as TaskPriority,
    tags: ['knowledge-sharing', 'team', 'insights'],
    estimatedDuration: 30,
    daysAfterTrip: 5,
  },
  {
    title: 'Update CRM with client meeting notes',
    category: 'Documentation',
    priority: 'high' as TaskPriority,
    tags: ['crm', 'documentation', 'client-notes'],
    estimatedDuration: 45,
    daysAfterTrip: 2,
  },
  {
    title: 'Plan follow-up actions from meetings',
    category: 'Planning',
    priority: 'high' as TaskPriority,
    tags: ['follow-up', 'planning', 'action-items'],
    estimatedDuration: 60,
    daysAfterTrip: 1,
  },
]

class TravelTaskIntegrationService implements TravelTaskIntegration {
  /**
   * Generate comprehensive pre-travel tasks based on trip details
   */
  async generatePreTravelTasks(tripId: string): Promise<Task[]> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    const tasks: Task[] = []
    const currentDate = new Date()

    // Get purpose-specific tasks
    const purposeKey =
      trip.purpose.toLowerCase() as keyof typeof PRE_TRAVEL_TASK_TEMPLATES
    const purposeTasks = PRE_TRAVEL_TASK_TEMPLATES[purposeKey] || []

    // Generate purpose-specific tasks
    for (const template of purposeTasks) {
      const dueDate = new Date(trip.startDate)
      dueDate.setDate(dueDate.getDate() - template.daysBeforeTrip)

      // Only create task if due date is in the future
      if (dueDate > currentDate) {
        const taskData: CreateTaskData = {
          title: template.title,
          description: `Pre-travel task for trip: ${trip.title}`,
          priority: template.priority,
          type: 'task' as TaskType,
          category: template.category,
          tags: [...template.tags, `trip-${trip.id}`],
          dueDate,
          estimatedDuration: template.estimatedDuration,
          checklistItems: [],
          isPrivate: false,
        }

        const task = await tasksService.createTask(taskData)
        tasks.push(task)
      }
    }

    // Generate common pre-travel tasks
    for (const template of COMMON_PRE_TRAVEL_TASKS) {
      const dueDate = new Date(trip.startDate)
      dueDate.setDate(dueDate.getDate() - template.daysBeforeTrip)

      // Only create task if due date is in the future
      if (dueDate > currentDate) {
        const taskData: CreateTaskData = {
          title: template.title,
          description: `Essential pre-travel task for trip: ${trip.title}`,
          priority: template.priority,
          type: 'task' as TaskType,
          category: template.category,
          tags: [...template.tags, `trip-${trip.id}`, 'pre-travel'],
          dueDate,
          estimatedDuration: template.estimatedDuration,
          checklistItems: [],
          isPrivate: false,
        }

        const task = await tasksService.createTask(taskData)
        tasks.push(task)
      }
    }

    // Update trip with related task IDs
    const taskIds = tasks.map(task => task.id)
    await travelService.updateTrip(tripId, {
      relatedTasks: [...(trip.relatedTasks || []), ...taskIds],
    })

    return tasks
  }

  /**
   * Create location-specific tasks based on destination
   */
  async createLocationBasedTasks(
    tripId: string,
    destinationId: string
  ): Promise<Task[]> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    const destination = trip.destinations.find(d => d.id === destinationId)
    if (!destination) {
      throw new Error(`Destination with ID ${destinationId} not found`)
    }

    const tasks: Task[] = []
    const locationType = this.determineLocationType(destination)
    const locationTasks = LOCATION_SPECIFIC_TASKS[locationType] || []

    for (const template of locationTasks) {
      const taskData: CreateTaskData = {
        title: `${template.title} - ${destination.city}, ${destination.country}`,
        description: `Location-specific task for ${destination.city}, ${destination.country}`,
        priority: template.priority,
        type: 'task' as TaskType,
        category: template.category,
        tags: [
          ...template.tags,
          `trip-${trip.id}`,
          `destination-${destination.id}`,
        ],
        dueDate: new Date(
          destination.arrivalDate.getTime() - 7 * 24 * 60 * 60 * 1000
        ), // 7 days before arrival
        estimatedDuration: template.estimatedDuration,
        checklistItems: [],
        isPrivate: false,
      }

      const task = await tasksService.createTask(taskData)
      tasks.push(task)
    }

    return tasks
  }

  /**
   * Adapt existing tasks for travel context
   */
  async adaptTasksForTravel(
    taskIds: string[],
    tripId: string
  ): Promise<Task[]> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    const adaptedTasks: Task[] = []

    for (const taskId of taskIds) {
      const task = tasksService.getTaskById(taskId)
      if (!task) continue

      // Create travel-adapted version of the task
      const adaptedTask = tasksService.updateTask(taskId, {
        title: `${task.title} (Travel Adapted)`,
        description: `${task.description || ''}\n\nAdapted for travel: ${trip.title}`,
        tags: [...task.tags, `trip-${trip.id}`, 'travel-adapted'],
        location: trip.destinations[0]?.city,
        dueDate: task.dueDate
          ? new Date(
              Math.min(
                task.dueDate.getTime(),
                trip.startDate.getTime() - 24 * 60 * 60 * 1000 // Due at least 1 day before travel
              )
            )
          : undefined,
      })

      if (adaptedTask) {
        adaptedTasks.push(adaptedTask)
      }
    }

    return adaptedTasks
  }

  /**
   * Generate post-travel follow-up tasks
   */
  async generatePostTravelFollowUp(tripId: string): Promise<Task[]> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    const tasks: Task[] = []

    // Only generate post-travel tasks for business-related trips
    if (trip.purpose === 'personal' || trip.purpose === 'vacation') {
      return tasks
    }

    for (const template of POST_TRAVEL_TASKS) {
      const dueDate = new Date(trip.endDate)
      dueDate.setDate(dueDate.getDate() + template.daysAfterTrip)

      const taskData: CreateTaskData = {
        title: template.title,
        description: `Post-travel follow-up for trip: ${trip.title}`,
        priority: template.priority,
        type: 'task' as TaskType,
        category: template.category,
        tags: [...template.tags, `trip-${trip.id}`, 'post-travel'],
        dueDate,
        estimatedDuration: template.estimatedDuration,
        checklistItems: [],
        isPrivate: false,
      }

      const task = await tasksService.createTask(taskData)
      tasks.push(task)
    }

    // Update trip with related task IDs
    const taskIds = tasks.map(task => task.id)
    await travelService.updateTrip(tripId, {
      relatedTasks: [...(trip.relatedTasks || []), ...taskIds],
    })

    return tasks
  }

  /**
   * Get all travel-related tasks for a trip
   */
  async getTravelTasks(tripId: string): Promise<Task[]> {
    const allTasks = await tasksService.getAllTasks()
    return allTasks.filter(
      task =>
        task.tags.includes(`trip-${tripId}`) ||
        task.description?.includes(tripId)
    )
  }

  /**
   * Generate task suggestions based on trip analysis
   */
  async generateTaskSuggestions(
    tripId: string
  ): Promise<{ category: string; suggestions: string[] }[]> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) return []

    const suggestions: { category: string; suggestions: string[] }[] = []

    // Duration-based suggestions
    if (trip.duration > 7) {
      suggestions.push({
        category: 'Extended Travel',
        suggestions: [
          'Arrange mail hold and package delivery',
          'Set up remote work environment',
          'Plan laundry and clothing rotation',
          'Schedule regular check-ins with home office',
        ],
      })
    }

    // Multi-destination suggestions
    if (trip.destinations.length > 2) {
      suggestions.push({
        category: 'Multi-Destination',
        suggestions: [
          'Optimize travel routes and connections',
          'Research inter-city transportation options',
          'Plan luggage storage strategies',
          'Create destination-specific packing lists',
        ],
      })
    }

    // Budget-based suggestions
    if (trip.budget && trip.budget.total > 5000) {
      suggestions.push({
        category: 'High-Value Travel',
        suggestions: [
          'Arrange additional travel insurance coverage',
          'Set up expense tracking and approval workflows',
          'Plan for business entertainment expenses',
          'Research tax implications for business travel',
        ],
      })
    }

    return suggestions
  }

  /**
   * Determine location type for task generation
   */
  private determineLocationType(
    destination: Destination
  ): keyof typeof LOCATION_SPECIFIC_TASKS {
    // This is a simplified implementation - in reality, you'd have a more sophisticated
    // way to determine if a location is international, domestic, or remote
    const domesticCountries = ['United States', 'US', 'USA'] // This would be configurable

    if (!domesticCountries.includes(destination.country)) {
      return 'international'
    }

    // Check if it's a remote location (this would need more sophisticated logic)
    const remoteCities = ['Remote Location', 'Wilderness', 'Rural Area']
    if (
      remoteCities.some(remote =>
        destination.city.toLowerCase().includes(remote.toLowerCase())
      )
    ) {
      return 'remote'
    }

    return 'domestic'
  }
}

export const travelTaskIntegration = new TravelTaskIntegrationService()

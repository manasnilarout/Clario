import type { Trip, Destination, TravelOptimization } from '../types/travel'
import { TripPurpose, TripStatus } from '../types/travel'
import type { Meeting } from '../types/meeting'
import type { Task, CreateTaskData } from '../types/task'
import { meetingsService } from './meetingsService'
import { travelService } from './travelService'
import { tasksService } from './tasksService'
import { contactsService } from './contactsService'

export interface TravelMeetingIntegration {
  createTripFromMeetings(meetingIds: string[]): Promise<Trip>
  suggestMeetingsDuringTravel(tripId: string): Promise<Meeting[]>
  optimizeTravelItinerary(tripId: string): Promise<TravelOptimization>
  generateTravelTasks(tripId: string): Promise<Task[]>
}

interface LocationCluster {
  city: string
  country: string
  meetings: Meeting[]
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface TravelWindow {
  startDate: Date
  endDate: Date
  meetings: Meeting[]
  clusters: LocationCluster[]
  bufferDays: number
}

class TravelMeetingIntegrationService implements TravelMeetingIntegration {
  /**
   * Analyze meetings and create an optimized trip
   */
  async createTripFromMeetings(meetingIds: string[]): Promise<Trip> {
    const meetings = await meetingsService.getMeetings()
    const selectedMeetings = meetings.filter(meeting =>
      meetingIds.includes(meeting.id)
    )

    if (selectedMeetings.length === 0) {
      throw new Error('No valid meetings found for the provided IDs')
    }

    // Analyze meetings for location clustering
    const clusters = this.clusterMeetingsByLocation(selectedMeetings)

    // Determine travel window
    const travelWindow = this.calculateOptimalTravelWindow(
      selectedMeetings,
      clusters
    )

    // Generate destinations from clusters
    const destinations = await this.generateDestinationsFromClusters(
      clusters,
      travelWindow
    )

    // Determine trip purpose based on meeting types and content
    const purpose = this.determineTripPurpose(selectedMeetings)

    // Create the trip
    const tripData = {
      title: this.generateTripTitle(selectedMeetings, clusters),
      description: this.generateTripDescription(selectedMeetings, clusters),
      purpose,
      startDate: travelWindow.startDate,
      endDate: travelWindow.endDate,
      duration: Math.ceil(
        (travelWindow.endDate.getTime() - travelWindow.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      destinations,
      relatedMeetings: meetingIds,
      relatedContacts: this.extractContactIds(selectedMeetings),
      relatedTasks: [],
      status: TripStatus.PLANNING,
      checklist: [],
      travelers: [
        {
          id: 'user-1',
          name: 'Current User',
          role: 'primary' as const,
        },
      ],
      approvals: [],
      expenses: [],
      transportation: [],
      accommodation: [],
      budget: this.estimateTripBudget(clusters, travelWindow),
      visibility: 'private' as const,
      createdBy: 'user-1',
      isArchived: false,
    }

    const trip = await travelService.createTrip(tripData)

    // Generate initial travel tasks
    await this.generateTravelTasks(trip.id)

    return trip
  }

  /**
   * Suggest meetings that could be scheduled during an existing trip
   */
  async suggestMeetingsDuringTravel(tripId: string): Promise<Meeting[]> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    const allMeetings = await meetingsService.getMeetings()
    const contacts = await contactsService.getContacts()

    // Find meetings that could be relevant during the trip
    const suggestions: Meeting[] = []

    for (const meeting of allMeetings) {
      // Skip if meeting is already linked to this trip
      if (trip.relatedMeetings.includes(meeting.id)) continue

      // Check if meeting is during trip period
      const meetingDate = new Date(meeting.startTime)
      if (meetingDate >= trip.startDate && meetingDate <= trip.endDate) {
        // Check if meeting location matches any destination
        const locationString =
          meeting.location?.address || meeting.location?.room || ''
        const matchesDestination = trip.destinations.some(
          dest =>
            locationString.toLowerCase().includes(dest.city.toLowerCase()) ||
            locationString.toLowerCase().includes(dest.country.toLowerCase())
        )

        if (matchesDestination || !meeting.location) {
          suggestions.push(meeting)
        }
      }

      // Also suggest meetings with local contacts
      const hasLocalContacts = meeting.attendees.some(attendee => {
        const contact = contacts.find(c => c.id === attendee.id)
        return (
          contact &&
          trip.destinations.some(
            dest =>
              contact.company
                ?.toLowerCase()
                .includes(dest.city.toLowerCase()) ||
              contact.notes?.toLowerCase().includes(dest.city.toLowerCase())
          )
        )
      })

      if (
        hasLocalContacts &&
        meetingDate >= trip.startDate &&
        meetingDate <= trip.endDate
      ) {
        suggestions.push(meeting)
      }
    }

    return suggestions
  }

  /**
   * Optimize travel itinerary for efficiency
   */
  async optimizeTravelItinerary(tripId: string): Promise<TravelOptimization> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    const suggestions: TravelOptimization['suggestions'] = []
    const estimatedSavings = { time: 0, cost: 0, distance: 0 }
    let routeOptimization: any = null

    // Analyze destination order for route optimization
    if (trip.destinations.length > 2) {
      routeOptimization = this.optimizeDestinationOrder(trip.destinations)
      if (routeOptimization.improved) {
        suggestions.push({
          type: 'route',
          description: `Reorder destinations to reduce travel time by ${routeOptimization.timeSaved} hours`,
          impact: 'high',
          savings: {
            time: routeOptimization.timeSaved * 60, // Convert to minutes
            distance: routeOptimization.distanceSaved,
          },
        })
        estimatedSavings.time += routeOptimization.timeSaved * 60
        estimatedSavings.distance += routeOptimization.distanceSaved
      }
    }

    // Analyze meeting scheduling for buffer time
    const meetingOptimization = await this.optimizeMeetingScheduling(trip)
    suggestions.push(...meetingOptimization.suggestions)

    // Cost optimization suggestions
    const costOptimization = this.analyzeCostOptimization(trip)
    suggestions.push(...costOptimization.suggestions)
    estimatedSavings.cost += costOptimization.estimatedSavings

    // Timeline optimization
    const timelineOptimization = this.optimizeTimeline(trip)
    suggestions.push(...timelineOptimization.suggestions)

    return {
      suggestions,
      optimizedItinerary:
        routeOptimization?.optimizedDestinations || trip.destinations,
      estimatedSavings,
    }
  }

  /**
   * Generate travel-related tasks from trip and meeting analysis
   */
  async generateTravelTasks(tripId: string): Promise<Task[]> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    const meetings = await meetingsService.getMeetings()
    const relatedMeetings = meetings.filter(m =>
      trip.relatedMeetings.includes(m.id)
    )

    const tasks: Task[] = []

    // Generate meeting preparation tasks
    for (const meeting of relatedMeetings) {
      const meetingTasks = await this.generateMeetingPreparationTasks(
        meeting,
        trip
      )
      tasks.push(...meetingTasks)
    }

    // Generate travel coordination tasks
    const coordinationTasks = await this.generateTravelCoordinationTasks(
      trip,
      relatedMeetings
    )
    tasks.push(...coordinationTasks)

    // Generate follow-up tasks
    const followUpTasks = await this.generateMeetingFollowUpTasks(
      trip,
      relatedMeetings
    )
    tasks.push(...followUpTasks)

    return tasks
  }

  /**
   * Cluster meetings by geographic location
   */
  private clusterMeetingsByLocation(meetings: Meeting[]): LocationCluster[] {
    const clusters: Map<string, LocationCluster> = new Map()

    for (const meeting of meetings) {
      if (!meeting.location) continue

      // Simple location extraction - in a real implementation, you'd use geocoding
      const locationString =
        meeting.location.address || meeting.location.room || 'Unknown'
      const locationKey = this.extractLocationKey(locationString)

      if (!clusters.has(locationKey)) {
        const { city, country } = this.parseLocation(locationString)
        clusters.set(locationKey, {
          city,
          country,
          meetings: [],
          coordinates: this.getCoordinatesForLocation(city, country),
        })
      }

      clusters.get(locationKey)!.meetings.push(meeting)
    }

    return Array.from(clusters.values())
  }

  /**
   * Calculate optimal travel window considering meeting dates and buffer time
   */
  private calculateOptimalTravelWindow(
    meetings: Meeting[],
    clusters: LocationCluster[]
  ): TravelWindow {
    const meetingDates = meetings.map(m => new Date(m.startTime))
    const earliestMeeting = new Date(
      Math.min(...meetingDates.map(d => d.getTime()))
    )
    const latestMeeting = new Date(
      Math.max(...meetingDates.map(d => d.getTime()))
    )

    // Calculate buffer days based on number of destinations and travel complexity
    const bufferDays = Math.max(1, Math.ceil(clusters.length / 2))

    const startDate = new Date(earliestMeeting)
    startDate.setDate(startDate.getDate() - bufferDays)

    const endDate = new Date(latestMeeting)
    endDate.setDate(endDate.getDate() + bufferDays)

    return {
      startDate,
      endDate,
      meetings,
      clusters,
      bufferDays,
    }
  }

  /**
   * Generate destinations from location clusters
   */
  private async generateDestinationsFromClusters(
    clusters: LocationCluster[],
    travelWindow: TravelWindow
  ): Promise<Destination[]> {
    const destinations: Destination[] = []

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i]
      const meetings = cluster.meetings.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )

      const firstMeeting = meetings[0]
      const lastMeeting = meetings[meetings.length - 1]

      // Calculate arrival and departure dates with buffer
      const arrivalDate = new Date(firstMeeting.startTime)
      arrivalDate.setDate(arrivalDate.getDate() - 1)

      const departureDate = new Date(lastMeeting.endTime)
      departureDate.setDate(departureDate.getDate() + 1)

      destinations.push({
        id: `dest-${i + 1}`,
        city: cluster.city,
        country: cluster.country,
        coordinates: cluster.coordinates,
        arrivalDate,
        departureDate,
        purpose: this.determinePurposeForCluster(cluster),
        plannedMeetings: meetings.map(m => m.id),
        notes: `${meetings.length} meeting(s) scheduled in this location`,
        importantInfo: {
          timezone: this.getTimezoneForLocation(cluster.city, cluster.country),
          currency: this.getCurrencyForCountry(cluster.country),
          language: this.getLanguageForCountry(cluster.country),
        },
        activities: [],
      })
    }

    return destinations
  }

  /**
   * Determine trip purpose based on meeting analysis
   */
  private determineTripPurpose(meetings: Meeting[]): TripPurpose {
    // Analyze meeting titles and descriptions for keywords
    const businessKeywords = [
      'business',
      'client',
      'proposal',
      'contract',
      'negotiation',
      'sales',
    ]
    const conferenceKeywords = [
      'conference',
      'summit',
      'expo',
      'convention',
      'workshop',
    ]
    const trainingKeywords = [
      'training',
      'workshop',
      'seminar',
      'course',
      'certification',
    ]

    const allText = meetings
      .map(m => `${m.title} ${m.description || ''}`)
      .join(' ')
      .toLowerCase()

    if (trainingKeywords.some(keyword => allText.includes(keyword))) {
      return TripPurpose.TRAINING
    }

    if (conferenceKeywords.some(keyword => allText.includes(keyword))) {
      return TripPurpose.CONFERENCE
    }

    if (businessKeywords.some(keyword => allText.includes(keyword))) {
      return TripPurpose.CLIENT_VISIT
    }

    return TripPurpose.BUSINESS
  }

  /**
   * Generate trip title based on meetings and locations
   */
  private generateTripTitle(
    meetings: Meeting[],
    clusters: LocationCluster[]
  ): string {
    if (clusters.length === 1) {
      const cluster = clusters[0]
      return `Business Trip to ${cluster.city}, ${cluster.country}`
    } else {
      const cities = clusters.map(c => c.city).join(', ')
      return `Multi-City Business Trip: ${cities}`
    }
  }

  /**
   * Generate trip description
   */
  private generateTripDescription(
    meetings: Meeting[],
    clusters: LocationCluster[]
  ): string {
    const meetingCount = meetings.length
    const locationCount = clusters.length
    const purposes = clusters.map(c => this.determinePurposeForCluster(c))

    return (
      `Trip includes ${meetingCount} meeting(s) across ${locationCount} location(s). ` +
      `Key activities: ${purposes.join(', ')}. ` +
      `Generated automatically from meeting schedule.`
    )
  }

  /**
   * Extract contact IDs from meetings
   */
  private extractContactIds(meetings: Meeting[]): string[] {
    const contactIds = new Set<string>()
    meetings.forEach(meeting => {
      meeting.attendees.forEach(attendee => {
        contactIds.add(attendee.id)
      })
    })
    return Array.from(contactIds)
  }

  /**
   * Estimate trip budget based on location and duration
   */
  private estimateTripBudget(
    clusters: LocationCluster[],
    travelWindow: TravelWindow
  ) {
    const duration = Math.ceil(
      (travelWindow.endDate.getTime() - travelWindow.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const locations = clusters.length

    // Simple estimation - in reality, you'd use more sophisticated pricing data
    const dailyRate = 200 // Base daily rate
    const locationMultiplier = Math.max(1, locations * 0.5)
    const estimated = duration * dailyRate * locationMultiplier

    return {
      total: estimated,
      currency: 'USD',
      breakdown: {
        transportation: estimated * 0.4,
        accommodation: estimated * 0.35,
        meals: estimated * 0.15,
        entertainment: estimated * 0.05,
        business: estimated * 0.03,
        miscellaneous: estimated * 0.02,
      },
      spentAmount: 0,
      remainingAmount: estimated,
      expenseTracking: true,
    }
  }

  // Helper methods for location parsing and data enrichment
  private extractLocationKey(location: string): string {
    // Simple implementation - extract city/country key
    const cleaned = location.toLowerCase().trim()
    return cleaned.split(',')[0] || cleaned
  }

  private parseLocation(location: string): { city: string; country: string } {
    const parts = location.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      return { city: parts[0], country: parts[parts.length - 1] }
    }
    return { city: parts[0] || 'Unknown', country: 'Unknown' }
  }

  private getCoordinatesForLocation(city: string, country: string) {
    // Mock coordinates - in reality, you'd use a geocoding service
    const locationMap: Record<string, { latitude: number; longitude: number }> =
      {
        'new york,usa': { latitude: 40.7128, longitude: -74.006 },
        'london,uk': { latitude: 51.5074, longitude: -0.1278 },
        'tokyo,japan': { latitude: 35.6762, longitude: 139.6503 },
        'san francisco,usa': { latitude: 37.7749, longitude: -122.4194 },
      }

    const key = `${city.toLowerCase()},${country.toLowerCase()}`
    return locationMap[key]
  }

  private determinePurposeForCluster(cluster: LocationCluster): string {
    // Analyze meeting titles in cluster for purpose
    const allTitles = cluster.meetings.map(m => m.title.toLowerCase()).join(' ')

    if (allTitles.includes('conference') || allTitles.includes('summit')) {
      return 'Conference attendance'
    }
    if (allTitles.includes('training') || allTitles.includes('workshop')) {
      return 'Training session'
    }
    if (allTitles.includes('client') || allTitles.includes('customer')) {
      return 'Client meetings'
    }

    return 'Business meetings'
  }

  private getTimezoneForLocation(city: string, country: string): string {
    // Mock timezone data
    const timezones: Record<string, string> = {
      'new york': 'America/New_York',
      london: 'Europe/London',
      tokyo: 'Asia/Tokyo',
      'san francisco': 'America/Los_Angeles',
    }

    return timezones[city.toLowerCase()] || 'UTC'
  }

  private getCurrencyForCountry(country: string): string {
    const currencies: Record<string, string> = {
      usa: 'USD',
      'united states': 'USD',
      uk: 'GBP',
      'united kingdom': 'GBP',
      japan: 'JPY',
      germany: 'EUR',
      france: 'EUR',
    }

    return currencies[country.toLowerCase()] || 'USD'
  }

  private getLanguageForCountry(country: string): string {
    const languages: Record<string, string> = {
      usa: 'English',
      'united states': 'English',
      uk: 'English',
      'united kingdom': 'English',
      japan: 'Japanese',
      germany: 'German',
      france: 'French',
    }

    return languages[country.toLowerCase()] || 'English'
  }

  // Optimization helper methods
  private optimizeDestinationOrder(destinations: Destination[]) {
    // Simple optimization - in reality, you'd use traveling salesman algorithms
    return {
      improved: destinations.length > 2,
      timeSaved: destinations.length * 2, // Mock savings
      distanceSaved: destinations.length * 100, // Mock distance savings
      optimizedDestinations: destinations, // For now, return same order
    }
  }

  private async optimizeMeetingScheduling(trip: Trip) {
    const suggestions: TravelOptimization['suggestions'] = []

    // Analyze meeting gaps and suggest optimizations
    if (trip.relatedMeetings.length > 3) {
      suggestions.push({
        type: 'timing',
        description:
          'Consider grouping meetings closer together to reduce dead time',
        impact: 'medium',
        savings: { time: 120 }, // 2 hours saved
      })
    }

    return { suggestions }
  }

  private analyzeCostOptimization(trip: Trip) {
    const suggestions: TravelOptimization['suggestions'] = []
    let estimatedSavings = 0

    if (trip.duration > 7) {
      suggestions.push({
        type: 'cost',
        description: 'Consider weekly accommodation rates for extended stays',
        impact: 'medium',
        savings: { cost: 200 },
      })
      estimatedSavings += 200
    }

    return { suggestions, estimatedSavings }
  }

  private optimizeTimeline(trip: Trip) {
    const suggestions: TravelOptimization['suggestions'] = []

    if (trip.destinations.length > 1) {
      suggestions.push({
        type: 'timing',
        description:
          'Add buffer time between destinations for travel and jet lag recovery',
        impact: 'high',
      })
    }

    return { suggestions }
  }

  // Task generation methods
  private async generateMeetingPreparationTasks(
    meeting: Meeting,
    trip: Trip
  ): Promise<Task[]> {
    const tasks: Task[] = []

    const preparationTask: CreateTaskData = {
      title: `Prepare for meeting: ${meeting.title}`,
      description: `Preparation task for meeting during trip: ${trip.title}`,
      priority: 'high',
      type: 'meeting_followup',
      category: 'Meeting Preparation',
      tags: ['meeting-prep', `trip-${trip.id}`, `meeting-${meeting.id}`],
      dueDate: new Date(
        new Date(meeting.startTime).getTime() - 24 * 60 * 60 * 1000
      ), // 1 day before
      estimatedDuration: 60,
      checklistItems: [
        { title: 'Review meeting agenda', completed: false },
        { title: 'Prepare presentation materials', completed: false },
        { title: 'Research attendee backgrounds', completed: false },
        { title: 'Confirm meeting location and logistics', completed: false },
      ],
      isPrivate: false,
    }

    const task = await tasksService.createTask(preparationTask)
    tasks.push(task)

    return tasks
  }

  private async generateTravelCoordinationTasks(
    trip: Trip,
    meetings: Meeting[]
  ): Promise<Task[]> {
    const tasks: Task[] = []

    if (meetings.length > 1) {
      const coordinationTask: CreateTaskData = {
        title: 'Coordinate meeting logistics during travel',
        description: `Coordinate ${meetings.length} meetings during trip: ${trip.title}`,
        priority: 'high',
        type: 'task',
        category: 'Travel Coordination',
        tags: ['coordination', `trip-${trip.id}`, 'logistics'],
        dueDate: new Date(trip.startDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before
        estimatedDuration: 90,
        checklistItems: [
          {
            title: 'Confirm all meeting times and locations',
            completed: false,
          },
          { title: 'Plan transportation between meetings', completed: false },
          { title: 'Share itinerary with key stakeholders', completed: false },
          { title: 'Prepare backup communication plans', completed: false },
        ],
        isPrivate: false,
      }

      const task = await tasksService.createTask(coordinationTask)
      tasks.push(task)
    }

    return tasks
  }

  private async generateMeetingFollowUpTasks(
    trip: Trip,
    meetings: Meeting[]
  ): Promise<Task[]> {
    const tasks: Task[] = []

    const followUpTask: CreateTaskData = {
      title: 'Follow up on trip meetings and action items',
      description: `Post-trip follow-up for ${meetings.length} meetings during: ${trip.title}`,
      priority: 'high',
      type: 'meeting_followup',
      category: 'Follow-up',
      tags: ['follow-up', `trip-${trip.id}`, 'meetings'],
      dueDate: new Date(trip.endDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after trip
      estimatedDuration: 120,
      checklistItems: [
        {
          title: 'Send thank you notes to meeting attendees',
          completed: false,
        },
        { title: 'Update CRM with meeting outcomes', completed: false },
        { title: 'Create action items from meeting notes', completed: false },
        { title: 'Schedule follow-up meetings as needed', completed: false },
      ],
      isPrivate: false,
    }

    const task = await tasksService.createTask(followUpTask)
    tasks.push(task)

    return tasks
  }
}

export const travelMeetingIntegration = new TravelMeetingIntegrationService()

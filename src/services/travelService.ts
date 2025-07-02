import {
  Trip,
  TripStatus,
  TripPurpose,
  Destination,
  Transportation,
  Accommodation,
  TravelExpense,
  TravelChecklistItem,
  TravelTemplate,
  TravelInsights,
  TravelSearchQuery,
  TravelOptimization,
  TravelMeetingIntegration,
} from '../types/travel'

class TravelService {
  private trips: Trip[] = []
  private templates: TravelTemplate[] = []

  // Core CRUD Operations
  async getAllTrips(): Promise<Trip[]> {
    return this.trips.filter(trip => !trip.isArchived)
  }

  async getTripById(id: string): Promise<Trip | null> {
    return this.trips.find(trip => trip.id === id) || null
  }

  async createTrip(
    tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Trip> {
    const newTrip: Trip = {
      ...tripData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.trips.push(newTrip)
    return newTrip
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
    const tripIndex = this.trips.findIndex(trip => trip.id === id)
    if (tripIndex === -1) return null

    this.trips[tripIndex] = {
      ...this.trips[tripIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return this.trips[tripIndex]
  }

  async deleteTrip(id: string): Promise<boolean> {
    const tripIndex = this.trips.findIndex(trip => trip.id === id)
    if (tripIndex === -1) return false

    this.trips.splice(tripIndex, 1)
    return true
  }

  async archiveTrip(id: string): Promise<Trip | null> {
    return this.updateTrip(id, { isArchived: true })
  }

  // Search and Filter
  async searchTrips(query: TravelSearchQuery): Promise<Trip[]> {
    let results = this.trips.filter(trip => !trip.isArchived)

    // Apply text search
    if (query.query) {
      const searchTerm = query.query.toLowerCase()
      results = results.filter(
        trip =>
          trip.title.toLowerCase().includes(searchTerm) ||
          trip.description?.toLowerCase().includes(searchTerm) ||
          trip.destinations.some(
            dest =>
              dest.city.toLowerCase().includes(searchTerm) ||
              dest.country.toLowerCase().includes(searchTerm)
          )
      )
    }

    // Apply filters
    if (query.filters) {
      const {
        status,
        purpose,
        dateRange,
        destinations,
        budgetRange,
        travelers,
        tags,
      } = query.filters

      if (status && status.length > 0) {
        results = results.filter(trip => status.includes(trip.status))
      }

      if (purpose && purpose.length > 0) {
        results = results.filter(trip => purpose.includes(trip.purpose))
      }

      if (dateRange) {
        results = results.filter(
          trip =>
            trip.startDate >= dateRange.start && trip.endDate <= dateRange.end
        )
      }

      if (destinations && destinations.length > 0) {
        results = results.filter(trip =>
          trip.destinations.some(dest =>
            destinations.some(
              searchDest =>
                dest.city.toLowerCase().includes(searchDest.toLowerCase()) ||
                dest.country.toLowerCase().includes(searchDest.toLowerCase())
            )
          )
        )
      }

      if (
        budgetRange &&
        budgetRange.min !== undefined &&
        budgetRange.max !== undefined
      ) {
        results = results.filter(
          trip =>
            trip.budget &&
            trip.budget.total >= budgetRange.min &&
            trip.budget.total <= budgetRange.max
        )
      }

      if (travelers && travelers.length > 0) {
        results = results.filter(trip =>
          trip.travelers.some(
            traveler =>
              travelers.includes(traveler.id) ||
              travelers.includes(traveler.contactId || '')
          )
        )
      }

      if (tags && tags.length > 0) {
        results = results.filter(
          trip => trip.tags && trip.tags.some(tag => tags.includes(tag))
        )
      }
    }

    // Apply sorting
    if (query.sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any

        switch (query.sortBy) {
          case 'startDate':
            aValue = a.startDate
            bValue = b.startDate
            break
          case 'endDate':
            aValue = a.endDate
            bValue = b.endDate
            break
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          case 'purpose':
            aValue = a.purpose
            bValue = b.purpose
            break
          case 'budget':
            aValue = a.budget?.total || 0
            bValue = b.budget?.total || 0
            break
          case 'createdAt':
          default:
            aValue = a.createdAt
            bValue = b.createdAt
            break
        }

        if (aValue < bValue) return query.sortOrder === 'desc' ? 1 : -1
        if (aValue > bValue) return query.sortOrder === 'desc' ? -1 : 1
        return 0
      })
    }

    // Apply pagination
    if (query.limit !== undefined) {
      const start = query.offset || 0
      results = results.slice(start, start + query.limit)
    }

    return results
  }

  // Trip Status Management
  async updateTripStatus(id: string, status: TripStatus): Promise<Trip | null> {
    const trip = await this.getTripById(id)
    if (!trip) return null

    // Add status change logic here if needed
    if (
      status === TripStatus.COMPLETED &&
      trip.status !== TripStatus.COMPLETED
    ) {
      // Mark all checklist items as completed
      trip.checklist = trip.checklist.map(item => ({
        ...item,
        completed: true,
      }))
    }

    return this.updateTrip(id, { status })
  }

  // Destination Management
  async addDestination(
    tripId: string,
    destination: Omit<Destination, 'id'>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const newDestination: Destination = {
      ...destination,
      id: this.generateId(),
    }

    trip.destinations.push(newDestination)
    return this.updateTrip(tripId, { destinations: trip.destinations })
  }

  async updateDestination(
    tripId: string,
    destinationId: string,
    updates: Partial<Destination>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const destIndex = trip.destinations.findIndex(
      dest => dest.id === destinationId
    )
    if (destIndex === -1) return null

    trip.destinations[destIndex] = {
      ...trip.destinations[destIndex],
      ...updates,
    }
    return this.updateTrip(tripId, { destinations: trip.destinations })
  }

  async removeDestination(
    tripId: string,
    destinationId: string
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    trip.destinations = trip.destinations.filter(
      dest => dest.id !== destinationId
    )
    return this.updateTrip(tripId, { destinations: trip.destinations })
  }

  // Transportation Management
  async addTransportation(
    tripId: string,
    transportation: Omit<Transportation, 'id'>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const newTransportation: Transportation = {
      ...transportation,
      id: this.generateId(),
    }

    trip.transportation.push(newTransportation)
    return this.updateTrip(tripId, { transportation: trip.transportation })
  }

  async updateTransportation(
    tripId: string,
    transportationId: string,
    updates: Partial<Transportation>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const transIndex = trip.transportation.findIndex(
      trans => trans.id === transportationId
    )
    if (transIndex === -1) return null

    trip.transportation[transIndex] = {
      ...trip.transportation[transIndex],
      ...updates,
    }
    return this.updateTrip(tripId, { transportation: trip.transportation })
  }

  // Accommodation Management
  async addAccommodation(
    tripId: string,
    accommodation: Omit<Accommodation, 'id'>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const newAccommodation: Accommodation = {
      ...accommodation,
      id: this.generateId(),
    }

    trip.accommodation.push(newAccommodation)
    return this.updateTrip(tripId, { accommodation: trip.accommodation })
  }

  // Expense Management
  async addExpense(
    tripId: string,
    expense: Omit<TravelExpense, 'id' | 'tripId'>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const newExpense: TravelExpense = {
      ...expense,
      id: this.generateId(),
      tripId,
    }

    trip.expenses.push(newExpense)

    // Update budget spent amount
    if (trip.budget) {
      trip.budget.spentAmount += expense.amount
      trip.budget.remainingAmount = trip.budget.total - trip.budget.spentAmount
    }

    return this.updateTrip(tripId, {
      expenses: trip.expenses,
      budget: trip.budget,
    })
  }

  async updateExpense(
    tripId: string,
    expenseId: string,
    updates: Partial<TravelExpense>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const expenseIndex = trip.expenses.findIndex(exp => exp.id === expenseId)
    if (expenseIndex === -1) return null

    const oldAmount = trip.expenses[expenseIndex].amount
    trip.expenses[expenseIndex] = { ...trip.expenses[expenseIndex], ...updates }

    // Update budget if amount changed
    if (updates.amount !== undefined && trip.budget) {
      trip.budget.spentAmount =
        trip.budget.spentAmount - oldAmount + updates.amount
      trip.budget.remainingAmount = trip.budget.total - trip.budget.spentAmount
    }

    return this.updateTrip(tripId, {
      expenses: trip.expenses,
      budget: trip.budget,
    })
  }

  // Checklist Management
  async addChecklistItem(
    tripId: string,
    item: Omit<TravelChecklistItem, 'id'>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const newItem: TravelChecklistItem = {
      ...item,
      id: this.generateId(),
    }

    trip.checklist.push(newItem)
    return this.updateTrip(tripId, { checklist: trip.checklist })
  }

  async updateChecklistItem(
    tripId: string,
    itemId: string,
    updates: Partial<TravelChecklistItem>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    const itemIndex = trip.checklist.findIndex(item => item.id === itemId)
    if (itemIndex === -1) return null

    trip.checklist[itemIndex] = { ...trip.checklist[itemIndex], ...updates }
    return this.updateTrip(tripId, { checklist: trip.checklist })
  }

  async removeChecklistItem(
    tripId: string,
    itemId: string
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId)
    if (!trip) return null

    trip.checklist = trip.checklist.filter(item => item.id !== itemId)
    return this.updateTrip(tripId, { checklist: trip.checklist })
  }

  // Templates
  async createTemplate(
    template: Omit<TravelTemplate, 'id' | 'createdAt' | 'usageCount'>
  ): Promise<TravelTemplate> {
    const newTemplate: TravelTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      usageCount: 0,
    }

    this.templates.push(newTemplate)
    return newTemplate
  }

  async getTemplates(): Promise<TravelTemplate[]> {
    return this.templates
  }

  async createTripFromTemplate(
    templateId: string,
    tripData: { title: string; startDate: Date; endDate: Date }
  ): Promise<Trip | null> {
    const template = this.templates.find(t => t.id === templateId)
    if (!template) return null

    const duration = Math.ceil(
      (tripData.endDate.getTime() - tripData.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
      title: tripData.title,
      purpose: template.purpose,
      status: TripStatus.PLANNING,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      duration,
      timezone: 'UTC',
      destinations: template.destinations.map(dest => ({
        ...dest,
        id: this.generateId(),
        arrivalDate: tripData.startDate,
        departureDate: tripData.endDate,
      })),
      transportation: [],
      accommodation: [],
      budget: template.budgetTemplate
        ? {
            ...template.budgetTemplate,
            spentAmount: 0,
            remainingAmount: template.budgetTemplate.total,
          }
        : undefined,
      expenses: [],
      checklist: template.checklistTemplate.map(item => ({
        ...item,
        id: this.generateId(),
        completed: false,
      })),
      relatedMeetings: [],
      relatedContacts: [],
      relatedTasks: [],
      travelers: [],
      approvals: [],
      createdBy: 'current-user',
      isArchived: false,
      tags: template.tags,
      visibility: 'private',
    }

    // Increment template usage
    template.usageCount++

    return this.createTrip(trip)
  }

  // Analytics and Insights
  async getTravelInsights(userId?: string): Promise<TravelInsights> {
    const userTrips = userId
      ? this.trips.filter(trip => trip.createdBy === userId && !trip.isArchived)
      : this.trips.filter(trip => !trip.isArchived)

    const completedTrips = userTrips.filter(
      trip => trip.status === TripStatus.COMPLETED
    )
    const upcomingTrips = userTrips
      .filter(
        trip =>
          trip.startDate > new Date() && trip.status !== TripStatus.CANCELLED
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5)

    const recentTrips = completedTrips
      .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
      .slice(0, 5)

    const totalDays = completedTrips.reduce(
      (sum, trip) => sum + trip.duration,
      0
    )
    const totalSpent = completedTrips.reduce(
      (sum, trip) => sum + (trip.budget?.spentAmount || 0),
      0
    )

    // Calculate favorite destinations
    const destinationCounts = new Map<string, number>()
    completedTrips.forEach(trip => {
      trip.destinations.forEach(dest => {
        const key = `${dest.city}, ${dest.country}`
        destinationCounts.set(key, (destinationCounts.get(key) || 0) + 1)
      })
    })

    const favoriteDestinations = Array.from(destinationCounts.entries())
      .map(([location, count]) => {
        const [city, country] = location.split(', ')
        return { city, country, visitCount: count }
      })
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 10)

    // Calculate monthly distribution
    const monthlyDistribution = new Map<string, number>()
    completedTrips.forEach(trip => {
      const month = trip.startDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      monthlyDistribution.set(month, (monthlyDistribution.get(month) || 0) + 1)
    })

    // Calculate purpose distribution
    const purposeCounts = new Map<TripPurpose, number>()
    completedTrips.forEach(trip => {
      purposeCounts.set(
        trip.purpose,
        (purposeCounts.get(trip.purpose) || 0) + 1
      )
    })

    const purposeDistribution = Array.from(purposeCounts.entries()).map(
      ([purpose, count]) => ({
        purpose,
        percentage: (count / completedTrips.length) * 100,
      })
    )

    return {
      totalTrips: completedTrips.length,
      totalDays,
      totalDistance: 0, // Would calculate from destination coordinates
      totalSpent,
      currency: 'USD', // Default currency
      favoriteDestinations,
      travelPatterns: {
        monthlyDistribution: Array.from(monthlyDistribution.entries()).map(
          ([month, trips]) => ({ month, trips })
        ),
        purposeDistribution,
        averageTripDuration: totalDays / (completedTrips.length || 1),
      },
      upcomingTrips,
      recentTrips,
    }
  }

  // Integration Methods
  async suggestOptimizations(tripId: string): Promise<TravelOptimization> {
    const trip = await this.getTripById(tripId)
    if (!trip) {
      throw new Error('Trip not found')
    }

    const suggestions = []

    // Route optimization suggestions
    if (trip.destinations.length > 2) {
      suggestions.push({
        type: 'route' as const,
        description: 'Optimize destination order to minimize travel time',
        impact: 'high' as const,
        savings: { time: 120, cost: 200, distance: 50 },
      })
    }

    // Timing suggestions
    if (trip.transportation.length > 0) {
      suggestions.push({
        type: 'timing' as const,
        description: 'Adjust departure times to avoid peak travel hours',
        impact: 'medium' as const,
        savings: { time: 45, cost: 50 },
      })
    }

    // Cost optimization
    if (trip.budget && trip.budget.total > 1000) {
      suggestions.push({
        type: 'cost' as const,
        description:
          'Consider alternative accommodation options to reduce costs',
        impact: 'medium' as const,
        savings: { cost: 300 },
      })
    }

    return {
      suggestions,
      estimatedSavings: {
        time: suggestions.reduce((sum, s) => sum + (s.savings?.time || 0), 0),
        cost: suggestions.reduce((sum, s) => sum + (s.savings?.cost || 0), 0),
        distance: suggestions.reduce(
          (sum, s) => sum + (s.savings?.distance || 0),
          0
        ),
      },
    }
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  async getUpcomingTrips(limit: number = 5): Promise<Trip[]> {
    return this.trips
      .filter(
        trip =>
          trip.startDate > new Date() &&
          trip.status !== TripStatus.CANCELLED &&
          !trip.isArchived
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit)
  }

  async getActiveTrips(): Promise<Trip[]> {
    const now = new Date()
    return this.trips.filter(
      trip =>
        trip.startDate <= now &&
        trip.endDate >= now &&
        trip.status === TripStatus.IN_PROGRESS &&
        !trip.isArchived
    )
  }

  async getTripsByStatus(status: TripStatus): Promise<Trip[]> {
    return this.trips.filter(trip => trip.status === status && !trip.isArchived)
  }

  async getTripsByDateRange(startDate: Date, endDate: Date): Promise<Trip[]> {
    return this.trips.filter(
      trip =>
        (trip.startDate >= startDate && trip.startDate <= endDate) ||
        (trip.endDate >= startDate && trip.endDate <= endDate) ||
        (trip.startDate <= startDate && trip.endDate >= endDate)
    )
  }

  // Mock data initialization method
  setMockData(trips: Trip[], templates: TravelTemplate[] = []): void {
    this.trips = trips
    this.templates = templates
  }

  // Initialize with mock data
  initializeMockData(): void {
    import('./mock/travelMockData').then(
      ({ mockTrips, mockTravelTemplates }) => {
        this.setMockData(mockTrips, mockTravelTemplates)
      }
    )
  }
}

export const travelService = new TravelService()

// Initialize with mock data
travelService.initializeMockData()

export default travelService

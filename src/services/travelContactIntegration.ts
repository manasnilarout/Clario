import type { Contact } from '../types/contact'
import type { Trip, Destination } from '../types/travel'
import type { Meeting } from '../types/meeting'
import { contactsService } from './contactsService'
import { travelService } from './travelService'
import { meetingsService } from './meetingsService'

export interface ContactMeetingSuggestion {
  contact: Contact
  meetingType: 'business' | 'networking' | 'social' | 'follow-up'
  priority: 'high' | 'medium' | 'low'
  reason: string
  suggestedDuration: number // minutes
  proposedTimes: Date[]
}

export interface TravelHistory {
  tripId: string
  destination: string
  date: Date
  purpose: string
  meetingsHeld: number
  outcome: 'positive' | 'neutral' | 'negative'
  followUpRequired: boolean
}

export interface TravelPatterns {
  frequentDestinations: {
    city: string
    country: string
    visitCount: number
    lastVisit: Date
    averageStayDuration: number
  }[]
  seasonalTrends: {
    month: number
    travelFrequency: number
    preferredDestinations: string[]
  }[]
  businessRelationships: {
    contactId: string
    meetingHistory: {
      destination: string
      meetingCount: number
      lastMeeting: Date
    }[]
  }[]
}

export interface TravelContactIntegration {
  getContactsByLocation(city: string, country: string): Promise<Contact[]>
  suggestMeetingsWithLocalContacts(
    tripId: string
  ): Promise<ContactMeetingSuggestion[]>
  trackContactTravelHistory(contactId: string): Promise<TravelHistory[]>
  analyzeContactTravelPatterns(contactId: string): Promise<TravelPatterns>
}

class TravelContactIntegrationService implements TravelContactIntegration {
  /**
   * Find contacts associated with a specific location
   */
  async getContactsByLocation(
    city: string,
    country: string
  ): Promise<Contact[]> {
    const allContacts = await contactsService.getContacts()

    return allContacts.filter(contact => {
      // Check various location indicators
      const locationStrings = [
        contact.company?.toLowerCase() || '',
        contact.notes?.toLowerCase() || '',
        contact.socialProfiles?.map(p => p.url.toLowerCase()).join(' ') || '',
      ].join(' ')

      const cityMatch = locationStrings.includes(city.toLowerCase())
      const countryMatch = locationStrings.includes(country.toLowerCase())

      // Also check if contact has meetings in this location
      return cityMatch || countryMatch
    })
  }

  /**
   * Suggest meetings with local contacts during a trip
   */
  async suggestMeetingsWithLocalContacts(
    tripId: string
  ): Promise<ContactMeetingSuggestion[]> {
    const trip = await travelService.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    const suggestions: ContactMeetingSuggestion[] = []

    for (const destination of trip.destinations) {
      const localContacts = await this.getContactsByLocation(
        destination.city,
        destination.country
      )
      const destinationSuggestions =
        await this.generateMeetingSuggestionsForDestination(
          destination,
          localContacts,
          trip
        )
      suggestions.push(...destinationSuggestions)
    }

    // Sort by priority and relevance
    return suggestions.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    })
  }

  /**
   * Get travel history for a specific contact
   */
  async trackContactTravelHistory(contactId: string): Promise<TravelHistory[]> {
    const contact = await contactsService.getContact(contactId)
    if (!contact) {
      throw new Error(`Contact with ID ${contactId} not found`)
    }

    const allTrips = await travelService.getTrips()
    const allMeetings = await meetingsService.getMeetings()

    const travelHistory: TravelHistory[] = []

    for (const trip of allTrips) {
      // Check if contact was involved in this trip
      const wasInvolved =
        trip.relatedContacts?.includes(contactId) ||
        trip.relatedMeetings.some(meetingId => {
          const meeting = allMeetings.find(m => m.id === meetingId)
          return meeting?.attendees.some(attendee => attendee.id === contactId)
        })

      if (wasInvolved) {
        // Get meetings with this contact during the trip
        const tripMeetings = allMeetings.filter(
          meeting =>
            trip.relatedMeetings.includes(meeting.id) &&
            meeting.attendees.some(attendee => attendee.id === contactId)
        )

        const destination = trip.destinations[0] // Simplified - take first destination
        if (destination) {
          travelHistory.push({
            tripId: trip.id,
            destination: `${destination.city}, ${destination.country}`,
            date: trip.startDate,
            purpose: trip.purpose,
            meetingsHeld: tripMeetings.length,
            outcome: this.assessMeetingOutcome(tripMeetings),
            followUpRequired: this.assessFollowUpNeeds(tripMeetings, contact),
          })
        }
      }
    }

    return travelHistory.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  /**
   * Analyze travel patterns for a contact
   */
  async analyzeContactTravelPatterns(
    contactId: string
  ): Promise<TravelPatterns> {
    const travelHistory = await this.trackContactTravelHistory(contactId)
    const allTrips = await travelService.getTrips()
    const allMeetings = await meetingsService.getMeetings()

    // Analyze frequent destinations
    const destinationMap = new Map<
      string,
      { count: number; lastVisit: Date; totalDuration: number }
    >()

    travelHistory.forEach(history => {
      const trip = allTrips.find(t => t.id === history.tripId)
      if (trip) {
        const key = history.destination
        const existing = destinationMap.get(key) || {
          count: 0,
          lastVisit: new Date(0),
          totalDuration: 0,
        }
        destinationMap.set(key, {
          count: existing.count + 1,
          lastVisit:
            history.date > existing.lastVisit
              ? history.date
              : existing.lastVisit,
          totalDuration: existing.totalDuration + trip.duration,
        })
      }
    })

    const frequentDestinations = Array.from(destinationMap.entries())
      .map(([destination, data]) => {
        const [city, country] = destination.split(', ')
        return {
          city,
          country,
          visitCount: data.count,
          lastVisit: data.lastVisit,
          averageStayDuration: data.totalDuration / data.count,
        }
      })
      .sort((a, b) => b.visitCount - a.visitCount)

    // Analyze seasonal trends
    const monthlyData = new Map<
      number,
      { frequency: number; destinations: Set<string> }
    >()

    travelHistory.forEach(history => {
      const month = history.date.getMonth()
      const existing = monthlyData.get(month) || {
        frequency: 0,
        destinations: new Set(),
      }
      monthlyData.set(month, {
        frequency: existing.frequency + 1,
        destinations: existing.destinations.add(history.destination),
      })
    })

    const seasonalTrends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        travelFrequency: data.frequency,
        preferredDestinations: Array.from(data.destinations),
      }))
      .sort((a, b) => b.travelFrequency - a.travelFrequency)

    // Analyze business relationships through travel
    const businessRelationships = [
      {
        contactId,
        meetingHistory: travelHistory.map(history => ({
          destination: history.destination,
          meetingCount: history.meetingsHeld,
          lastMeeting: history.date,
        })),
      },
    ]

    return {
      frequentDestinations,
      seasonalTrends,
      businessRelationships,
    }
  }

  /**
   * Generate contextual meeting insights for a destination
   */
  async getDestinationInsights(destination: Destination): Promise<{
    localContacts: Contact[]
    businessOpportunities: string[]
    culturalNotes: string[]
    networkingEvents: string[]
  }> {
    const localContacts = await this.getContactsByLocation(
      destination.city,
      destination.country
    )

    // Generate insights based on contact analysis and location
    const businessOpportunities = this.generateBusinessOpportunities(
      localContacts,
      destination
    )
    const culturalNotes = this.generateCulturalNotes(destination)
    const networkingEvents = this.generateNetworkingEvents(destination)

    return {
      localContacts,
      businessOpportunities,
      culturalNotes,
      networkingEvents,
    }
  }

  /**
   * Generate relationship strength metrics
   */
  async analyzeRelationshipStrength(
    contactId: string,
    tripHistory: TravelHistory[]
  ): Promise<{
    overallStrength: number
    trendDirection: 'improving' | 'stable' | 'declining'
    lastInteraction: Date
    recommendedActions: string[]
  }> {
    const contact = await contactsService.getContactById(contactId)
    if (!contact) {
      throw new Error(`Contact with ID ${contactId} not found`)
    }

    // Calculate relationship strength based on travel meetings
    let strengthScore = 0
    let lastInteraction = new Date(0)

    tripHistory.forEach(history => {
      const daysSince =
        (Date.now() - history.date.getTime()) / (1000 * 60 * 60 * 24)
      const recencyWeight = Math.max(0, 1 - daysSince / 365) // Decay over a year

      strengthScore += history.meetingsHeld * recencyWeight
      if (history.outcome === 'positive') strengthScore += 1
      if (history.followUpRequired) strengthScore += 0.5

      if (history.date > lastInteraction) {
        lastInteraction = history.date
      }
    })

    // Determine trend
    const recentHistory = tripHistory.filter(
      h => (Date.now() - h.date.getTime()) / (1000 * 60 * 60 * 24) <= 180 // Last 6 months
    )
    const olderHistory = tripHistory.filter(
      h => (Date.now() - h.date.getTime()) / (1000 * 60 * 60 * 24) > 180
    )

    const recentScore =
      recentHistory.length > 0
        ? recentHistory.reduce((sum, h) => sum + h.meetingsHeld, 0) /
          recentHistory.length
        : 0
    const olderScore =
      olderHistory.length > 0
        ? olderHistory.reduce((sum, h) => sum + h.meetingsHeld, 0) /
          olderHistory.length
        : 0

    let trendDirection: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentScore > olderScore * 1.2) trendDirection = 'improving'
    else if (recentScore < olderScore * 0.8) trendDirection = 'declining'

    // Generate recommendations
    const recommendedActions = this.generateRelationshipRecommendations(
      contact,
      strengthScore,
      trendDirection,
      lastInteraction
    )

    return {
      overallStrength: Math.min(100, strengthScore * 10), // Scale to 0-100
      trendDirection,
      lastInteraction,
      recommendedActions,
    }
  }

  /**
   * Private helper methods
   */
  private async generateMeetingSuggestionsForDestination(
    destination: Destination,
    localContacts: Contact[],
    trip: Trip
  ): Promise<ContactMeetingSuggestion[]> {
    const suggestions: ContactMeetingSuggestion[] = []
    const allMeetings = await meetingsService.getMeetings()

    for (const contact of localContacts) {
      // Skip if contact is already included in trip meetings
      const alreadyMeeting = trip.relatedMeetings.some(meetingId => {
        const meeting = allMeetings.find(m => m.id === meetingId)
        return meeting?.attendees.some(attendee => attendee.id === contact.id)
      })

      if (alreadyMeeting) continue

      // Determine meeting type and priority based on contact history
      const meetingType = this.determineMeetingType(contact, trip)
      const priority = this.calculateMeetingPriority(contact, destination, trip)
      const reason = this.generateMeetingReason(
        contact,
        destination,
        meetingType
      )

      // Generate suggested meeting times during the destination stay
      const proposedTimes = this.generateMeetingTimes(destination, trip)

      suggestions.push({
        contact,
        meetingType,
        priority,
        reason,
        suggestedDuration: this.suggestMeetingDuration(meetingType, contact),
        proposedTimes,
      })
    }

    return suggestions
  }

  private determineMeetingType(
    contact: Contact,
    trip: Trip
  ): ContactMeetingSuggestion['meetingType'] {
    // Business trip with high-importance contact = business meeting
    if (trip.purpose === 'business' && contact.importance === 'high')
      return 'business'
    if (trip.purpose === 'client_visit') return 'business'
    if (trip.purpose === 'conference') return 'networking'

    // Check contact history for patterns
    if (
      contact.company &&
      contact.position?.includes('Director|Manager|VP|CEO')
    )
      return 'business'

    return 'networking'
  }

  private calculateMeetingPriority(
    contact: Contact,
    destination: Destination,
    trip: Trip
  ): ContactMeetingSuggestion['priority'] {
    let score = 0

    // Contact importance
    if (contact.importance === 'high') score += 3
    else if (contact.importance === 'medium') score += 2
    else score += 1

    // Trip purpose relevance
    if (trip.purpose === 'business' || trip.purpose === 'client_visit')
      score += 2
    if (trip.purpose === 'conference') score += 1

    // Location relevance (if contact company matches destination)
    if (contact.company?.toLowerCase().includes(destination.city.toLowerCase()))
      score += 2

    // Recent interaction history
    if (contact.lastContact) {
      const daysSince =
        (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince > 90) score += 1 // Haven't met recently
    } else {
      score += 2 // Never met
    }

    if (score >= 6) return 'high'
    if (score >= 4) return 'medium'
    return 'low'
  }

  private generateMeetingReason(
    contact: Contact,
    destination: Destination,
    meetingType: ContactMeetingSuggestion['meetingType']
  ): string {
    const reasons = {
      business: [
        `Opportunity to strengthen business relationship with ${contact.firstName} while in ${destination.city}`,
        `Local business meeting to discuss potential collaboration`,
        `Face-to-face meeting to advance ongoing business discussions`,
      ],
      networking: [
        `Networking opportunity with ${contact.firstName} in ${destination.city}`,
        `Chance to expand professional network locally`,
        `Connect with local industry professional`,
      ],
      social: [
        `Social meetup with ${contact.firstName} while visiting ${destination.city}`,
        `Casual catch-up meeting with local contact`,
      ],
      'follow-up': [
        `Follow-up meeting on previous discussions`,
        `Continue conversation from previous interactions`,
      ],
    }

    const categoryReasons = reasons[meetingType]
    return categoryReasons[Math.floor(Math.random() * categoryReasons.length)]
  }

  private generateMeetingTimes(destination: Destination, trip: Trip): Date[] {
    const times: Date[] = []
    const start = new Date(destination.arrivalDate)
    const end = new Date(destination.departureDate)

    // Generate 2-3 suggested times spread across the stay
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
    const timesToGenerate = Math.min(3, Math.max(1, daysDiff))

    for (let i = 0; i < timesToGenerate; i++) {
      const dayOffset = Math.floor((daysDiff / timesToGenerate) * i)
      const meetingDate = new Date(start)
      meetingDate.setDate(meetingDate.getDate() + dayOffset)

      // Set to business hours (9 AM - 5 PM)
      const hour = 9 + Math.floor(Math.random() * 8)
      meetingDate.setHours(hour, 0, 0, 0)

      times.push(meetingDate)
    }

    return times
  }

  private suggestMeetingDuration(
    meetingType: ContactMeetingSuggestion['meetingType'],
    contact: Contact
  ): number {
    const baseDurations = {
      business: 60, // 1 hour
      networking: 30, // 30 minutes
      social: 90, // 1.5 hours
      'follow-up': 45, // 45 minutes
    }

    let duration = baseDurations[meetingType]

    // Adjust based on contact importance
    if (contact.importance === 'high') duration += 15
    else if (contact.importance === 'low') duration -= 15

    return Math.max(15, duration) // Minimum 15 minutes
  }

  private assessMeetingOutcome(
    meetings: Meeting[]
  ): 'positive' | 'neutral' | 'negative' {
    // Simple heuristic based on follow-up actions and meeting completion
    if (
      meetings.some(
        m =>
          m.status === 'completed' && m.actionItems && m.actionItems.length > 0
      )
    ) {
      return 'positive'
    }
    if (meetings.some(m => m.status === 'cancelled')) {
      return 'negative'
    }
    return 'neutral'
  }

  private assessFollowUpNeeds(meetings: Meeting[], contact: Contact): boolean {
    // Check if there are pending action items or if this is a high-importance contact
    return (
      meetings.some(
        m =>
          m.actionItems &&
          m.actionItems.some(item => item.status !== 'completed')
      ) || contact.importance === 'high'
    )
  }

  private generateBusinessOpportunities(
    contacts: Contact[],
    destination: Destination
  ): string[] {
    const opportunities = [
      `${contacts.length} local business contacts available for meetings`,
      `Potential partnerships with local companies in ${destination.city}`,
      `Market expansion opportunities in ${destination.country}`,
      `Local industry networking events during your stay`,
    ]

    // Add contact-specific opportunities
    const highValueContacts = contacts.filter(c => c.importance === 'high')
    if (highValueContacts.length > 0) {
      opportunities.push(
        `${highValueContacts.length} high-value contacts available for strategic meetings`
      )
    }

    return opportunities
  }

  private generateCulturalNotes(destination: Destination): string[] {
    // Simple cultural insights - in a real app, this would be a comprehensive database
    const culturalData: Record<string, string[]> = {
      japan: [
        'Business cards are exchanged with both hands and a slight bow',
        'Punctuality is extremely important in Japanese business culture',
        'Gift-giving is common in business relationships',
      ],
      germany: [
        'Germans value punctuality and direct communication',
        'Formal business attire is expected for meetings',
        'Handshakes should be firm and brief',
      ],
      uk: [
        'British business culture values politeness and understatement',
        'Small talk about weather is common conversation starter',
        'Tea or coffee is often offered during meetings',
      ],
    }

    return (
      culturalData[destination.country.toLowerCase()] || [
        'Research local business customs before meetings',
        'Dress appropriately for local business standards',
        'Be mindful of cultural differences in communication styles',
      ]
    )
  }

  private generateNetworkingEvents(destination: Destination): string[] {
    // Mock networking events - in reality, this would integrate with event APIs
    return [
      `${destination.city} Business Networking Mixer`,
      `Local Chamber of Commerce monthly meeting`,
      `Industry meetup groups in ${destination.city}`,
      `Professional associations in ${destination.country}`,
    ]
  }

  private generateRelationshipRecommendations(
    contact: Contact,
    strengthScore: number,
    trendDirection: 'improving' | 'stable' | 'declining',
    lastInteraction: Date
  ): string[] {
    const recommendations: string[] = []
    const daysSinceContact =
      (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)

    if (trendDirection === 'declining') {
      recommendations.push('Schedule a catch-up call to re-engage')
      recommendations.push('Consider a face-to-face meeting on your next trip')
    }

    if (daysSinceContact > 90) {
      recommendations.push('Reach out with a personal message or update')
    }

    if (strengthScore < 30) {
      recommendations.push(
        'Increase meeting frequency to strengthen relationship'
      )
      recommendations.push('Look for collaboration opportunities')
    }

    if (contact.importance === 'high' && strengthScore < 50) {
      recommendations.push(
        'Priority: Invest more time in this key relationship'
      )
    }

    return recommendations
  }
}

export const travelContactIntegration = new TravelContactIntegrationService()

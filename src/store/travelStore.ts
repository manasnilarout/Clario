import { create } from 'zustand'
import { Trip, TripFormData, ChecklistItem } from '../types'

interface TravelState {
  trips: Trip[]
  selectedTrip: Trip | null
  upcomingTrips: Trip[]
  isLoading: boolean
  error: string | null
}

interface TravelActions {
  // CRUD operations
  createTrip: (tripData: TripFormData) => void
  updateTrip: (id: string, updates: Partial<Trip>) => void
  deleteTrip: (id: string) => void

  // Trip management
  selectTrip: (trip: Trip | null) => void
  addChecklistItem: (tripId: string, item: Omit<ChecklistItem, 'id'>) => void
  updateChecklistItem: (
    tripId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ) => void
  removeChecklistItem: (tripId: string, itemId: string) => void

  // Utility functions
  getUpcomingTrips: () => void
  getTripsByDateRange: (start: Date, end: Date) => Trip[]
  linkMeeting: (tripId: string, meetingId: string) => void
  linkContact: (tripId: string, contactId: string) => void

  // Data fetching
  fetchTrips: () => Promise<void>

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type TravelStore = TravelState & TravelActions

export const useTravelStore = create<TravelStore>((set, get) => ({
  // State
  trips: [],
  selectedTrip: null,
  upcomingTrips: [],
  isLoading: false,
  error: null,

  // Actions
  createTrip: (tripData: TripFormData) => {
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      ...tripData,
      destinations: tripData.destinations.map(dest => ({
        ...dest,
        id: crypto.randomUUID(),
      })),
      status: 'planned',
      checklist: [
        // Default checklist items
        {
          id: crypto.randomUUID(),
          title: 'Check passport validity',
          completed: false,
          category: 'documents',
        },
        {
          id: crypto.randomUUID(),
          title: 'Book flights',
          completed: false,
          category: 'bookings',
        },
        {
          id: crypto.randomUUID(),
          title: 'Book accommodation',
          completed: false,
          category: 'bookings',
        },
        {
          id: crypto.randomUUID(),
          title: 'Pack essentials',
          completed: false,
          category: 'packing',
        },
        {
          id: crypto.randomUUID(),
          title: 'Arrange travel insurance',
          completed: false,
          category: 'documents',
        },
      ],
      relatedMeetings: [],
      relatedContacts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => ({
      trips: [...state.trips, newTrip],
    }))

    // Update upcoming trips
    get().getUpcomingTrips()
  },

  updateTrip: (id: string, updates: Partial<Trip>) => {
    set(state => ({
      trips: state.trips.map(trip =>
        trip.id === id ? { ...trip, ...updates, updatedAt: new Date() } : trip
      ),
      selectedTrip:
        state.selectedTrip?.id === id
          ? { ...state.selectedTrip, ...updates, updatedAt: new Date() }
          : state.selectedTrip,
    }))

    // Update upcoming trips
    get().getUpcomingTrips()
  },

  deleteTrip: (id: string) => {
    set(state => ({
      trips: state.trips.filter(trip => trip.id !== id),
      selectedTrip: state.selectedTrip?.id === id ? null : state.selectedTrip,
    }))

    // Update upcoming trips
    get().getUpcomingTrips()
  },

  selectTrip: (trip: Trip | null) => {
    set({ selectedTrip: trip })
  },

  addChecklistItem: (tripId: string, itemData) => {
    const checklistItem: ChecklistItem = {
      id: crypto.randomUUID(),
      ...itemData,
    }

    set(state => ({
      trips: state.trips.map(trip =>
        trip.id === tripId
          ? {
              ...trip,
              checklist: [...trip.checklist, checklistItem],
              updatedAt: new Date(),
            }
          : trip
      ),
    }))
  },

  updateChecklistItem: (tripId: string, itemId: string, updates) => {
    set(state => ({
      trips: state.trips.map(trip =>
        trip.id === tripId
          ? {
              ...trip,
              checklist: trip.checklist.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
              updatedAt: new Date(),
            }
          : trip
      ),
    }))
  },

  removeChecklistItem: (tripId: string, itemId: string) => {
    set(state => ({
      trips: state.trips.map(trip =>
        trip.id === tripId
          ? {
              ...trip,
              checklist: trip.checklist.filter(item => item.id !== itemId),
              updatedAt: new Date(),
            }
          : trip
      ),
    }))
  },

  getUpcomingTrips: () => {
    const { trips } = get()
    const now = new Date()
    const upcoming = trips
      .filter(trip => trip.startDate > now && trip.status !== 'cancelled')
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5) // Get next 5 upcoming trips

    set({ upcomingTrips: upcoming })
  },

  getTripsByDateRange: (start: Date, end: Date) => {
    const { trips } = get()
    return trips.filter(
      trip =>
        (trip.startDate >= start && trip.startDate <= end) ||
        (trip.endDate >= start && trip.endDate <= end) ||
        (trip.startDate <= start && trip.endDate >= end)
    )
  },

  linkMeeting: (tripId: string, meetingId: string) => {
    set(state => ({
      trips: state.trips.map(trip =>
        trip.id === tripId
          ? {
              ...trip,
              relatedMeetings: [...(trip.relatedMeetings || []), meetingId],
              updatedAt: new Date(),
            }
          : trip
      ),
    }))
  },

  linkContact: (tripId: string, contactId: string) => {
    set(state => ({
      trips: state.trips.map(trip =>
        trip.id === tripId
          ? {
              ...trip,
              relatedContacts: [...(trip.relatedContacts || []), contactId],
              updatedAt: new Date(),
            }
          : trip
      ),
    }))
  },

  fetchTrips: async () => {
    set({ isLoading: true, error: null })
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update upcoming trips after fetch
      get().getUpcomingTrips()
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

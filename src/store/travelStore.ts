import { create } from 'zustand'
import {
  Trip,
  TravelChecklistItem,
  TripStatus,
  TravelInsights,
  TravelSearchQuery,
  TravelTemplate,
  TravelOptimization,
} from '../types/travel'
import travelService from '../services/travelService'

interface TravelState {
  trips: Trip[]
  selectedTrip: Trip | null
  upcomingTrips: Trip[]
  activeTrips: Trip[]
  templates: TravelTemplate[]
  insights: TravelInsights | null
  isLoading: boolean
  error: string | null
}

interface TravelActions {
  // CRUD operations
  createTrip: (
    tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>
  deleteTrip: (id: string) => Promise<void>
  archiveTrip: (id: string) => Promise<void>

  // Trip management
  selectTrip: (trip: Trip | null) => void
  updateTripStatus: (id: string, status: TripStatus) => Promise<void>

  // Checklist management
  addChecklistItem: (
    tripId: string,
    item: Omit<TravelChecklistItem, 'id'>
  ) => Promise<void>
  updateChecklistItem: (
    tripId: string,
    itemId: string,
    updates: Partial<TravelChecklistItem>
  ) => Promise<void>
  removeChecklistItem: (tripId: string, itemId: string) => Promise<void>

  // Search and filter
  searchTrips: (query: TravelSearchQuery) => Promise<void>

  // Templates
  fetchTemplates: () => Promise<void>
  createTripFromTemplate: (
    templateId: string,
    tripData: { title: string; startDate: Date; endDate: Date }
  ) => Promise<void>

  // Integration
  linkMeeting: (tripId: string, meetingId: string) => Promise<void>
  linkContact: (tripId: string, contactId: string) => Promise<void>
  suggestOptimizations: (tripId: string) => Promise<TravelOptimization | null>

  // Analytics
  fetchInsights: () => Promise<void>

  // Utility functions
  fetchUpcomingTrips: () => Promise<void>
  fetchActiveTrips: () => Promise<void>
  getTripsByDateRange: (start: Date, end: Date) => Promise<Trip[]>

  // Data fetching
  fetchTrips: () => Promise<void>
  fetchTripById: (id: string) => Promise<void>

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
  activeTrips: [],
  templates: [],
  insights: null,
  isLoading: false,
  error: null,

  // CRUD Operations
  createTrip: async tripData => {
    set({ isLoading: true, error: null })
    try {
      const newTrip = await travelService.createTrip(tripData)
      set(state => ({
        trips: [...state.trips, newTrip],
        isLoading: false,
      }))

      // Refresh upcoming trips
      await get().fetchUpcomingTrips()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create trip',
        isLoading: false,
      })
    }
  },

  updateTrip: async (id: string, updates: Partial<Trip>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTrip = await travelService.updateTrip(id, updates)
      if (updatedTrip) {
        set(state => ({
          trips: state.trips.map(trip => (trip.id === id ? updatedTrip : trip)),
          selectedTrip:
            state.selectedTrip?.id === id ? updatedTrip : state.selectedTrip,
          isLoading: false,
        }))

        // Refresh upcoming trips
        await get().fetchUpcomingTrips()
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update trip',
        isLoading: false,
      })
    }
  },

  deleteTrip: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const success = await travelService.deleteTrip(id)
      if (success) {
        set(state => ({
          trips: state.trips.filter(trip => trip.id !== id),
          selectedTrip:
            state.selectedTrip?.id === id ? null : state.selectedTrip,
          isLoading: false,
        }))

        // Refresh upcoming trips
        await get().fetchUpcomingTrips()
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete trip',
        isLoading: false,
      })
    }
  },

  archiveTrip: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const archivedTrip = await travelService.archiveTrip(id)
      if (archivedTrip) {
        set(state => ({
          trips: state.trips.filter(trip => trip.id !== id),
          selectedTrip:
            state.selectedTrip?.id === id ? null : state.selectedTrip,
          isLoading: false,
        }))

        // Refresh upcoming trips
        await get().fetchUpcomingTrips()
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to archive trip',
        isLoading: false,
      })
    }
  },

  // Trip Management
  selectTrip: (trip: Trip | null) => {
    set({ selectedTrip: trip })
  },

  updateTripStatus: async (id: string, status: TripStatus) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTrip = await travelService.updateTripStatus(id, status)
      if (updatedTrip) {
        set(state => ({
          trips: state.trips.map(trip => (trip.id === id ? updatedTrip : trip)),
          selectedTrip:
            state.selectedTrip?.id === id ? updatedTrip : state.selectedTrip,
          isLoading: false,
        }))

        // Refresh trips based on status change
        await get().fetchUpcomingTrips()
        await get().fetchActiveTrips()
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update trip status',
        isLoading: false,
      })
    }
  },

  // Checklist Management
  addChecklistItem: async (
    tripId: string,
    item: Omit<TravelChecklistItem, 'id'>
  ) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTrip = await travelService.addChecklistItem(tripId, item)
      if (updatedTrip) {
        set(state => ({
          trips: state.trips.map(trip =>
            trip.id === tripId ? updatedTrip : trip
          ),
          selectedTrip:
            state.selectedTrip?.id === tripId
              ? updatedTrip
              : state.selectedTrip,
          isLoading: false,
        }))
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to add checklist item',
        isLoading: false,
      })
    }
  },

  updateChecklistItem: async (
    tripId: string,
    itemId: string,
    updates: Partial<TravelChecklistItem>
  ) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTrip = await travelService.updateChecklistItem(
        tripId,
        itemId,
        updates
      )
      if (updatedTrip) {
        set(state => ({
          trips: state.trips.map(trip =>
            trip.id === tripId ? updatedTrip : trip
          ),
          selectedTrip:
            state.selectedTrip?.id === tripId
              ? updatedTrip
              : state.selectedTrip,
          isLoading: false,
        }))
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update checklist item',
        isLoading: false,
      })
    }
  },

  removeChecklistItem: async (tripId: string, itemId: string) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTrip = await travelService.removeChecklistItem(
        tripId,
        itemId
      )
      if (updatedTrip) {
        set(state => ({
          trips: state.trips.map(trip =>
            trip.id === tripId ? updatedTrip : trip
          ),
          selectedTrip:
            state.selectedTrip?.id === tripId
              ? updatedTrip
              : state.selectedTrip,
          isLoading: false,
        }))
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove checklist item',
        isLoading: false,
      })
    }
  },

  // Search and Filter
  searchTrips: async (query: TravelSearchQuery) => {
    set({ isLoading: true, error: null })
    try {
      const searchResults = await travelService.searchTrips(query)
      set({
        trips: searchResults,
        isLoading: false,
      })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to search trips',
        isLoading: false,
      })
    }
  },

  // Templates
  fetchTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const templates = await travelService.getTemplates()
      set({
        templates,
        isLoading: false,
      })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch templates',
        isLoading: false,
      })
    }
  },

  createTripFromTemplate: async (
    templateId: string,
    tripData: { title: string; startDate: Date; endDate: Date }
  ) => {
    set({ isLoading: true, error: null })
    try {
      const newTrip = await travelService.createTripFromTemplate(
        templateId,
        tripData
      )
      if (newTrip) {
        set(state => ({
          trips: [...state.trips, newTrip],
          isLoading: false,
        }))

        // Refresh upcoming trips
        await get().fetchUpcomingTrips()
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create trip from template',
        isLoading: false,
      })
    }
  },

  // Integration
  linkMeeting: async (tripId: string, meetingId: string) => {
    try {
      const currentTrip = await travelService.getTripById(tripId)
      if (currentTrip) {
        const updatedTrip = await travelService.updateTrip(tripId, {
          relatedMeetings: [...currentTrip.relatedMeetings, meetingId],
        })

        if (updatedTrip) {
          set(state => ({
            trips: state.trips.map(trip =>
              trip.id === tripId ? updatedTrip : trip
            ),
            selectedTrip:
              state.selectedTrip?.id === tripId
                ? updatedTrip
                : state.selectedTrip,
          }))
        }
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to link meeting',
      })
    }
  },

  linkContact: async (tripId: string, contactId: string) => {
    try {
      const currentTrip = await travelService.getTripById(tripId)
      if (currentTrip) {
        const updatedTrip = await travelService.updateTrip(tripId, {
          relatedContacts: [...currentTrip.relatedContacts, contactId],
        })

        if (updatedTrip) {
          set(state => ({
            trips: state.trips.map(trip =>
              trip.id === tripId ? updatedTrip : trip
            ),
            selectedTrip:
              state.selectedTrip?.id === tripId
                ? updatedTrip
                : state.selectedTrip,
          }))
        }
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to link contact',
      })
    }
  },

  suggestOptimizations: async (tripId: string) => {
    try {
      const optimization = await travelService.suggestOptimizations(tripId)
      return optimization
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get optimization suggestions',
      })
      return null
    }
  },

  // Analytics
  fetchInsights: async () => {
    set({ isLoading: true, error: null })
    try {
      const insights = await travelService.getTravelInsights()
      set({
        insights,
        isLoading: false,
      })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch insights',
        isLoading: false,
      })
    }
  },

  // Utility Functions
  fetchUpcomingTrips: async () => {
    try {
      const upcomingTrips = await travelService.getUpcomingTrips(5)
      set({ upcomingTrips })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch upcoming trips',
      })
    }
  },

  fetchActiveTrips: async () => {
    try {
      const activeTrips = await travelService.getActiveTrips()
      set({ activeTrips })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch active trips',
      })
    }
  },

  getTripsByDateRange: async (start: Date, end: Date) => {
    try {
      return await travelService.getTripsByDateRange(start, end)
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get trips by date range',
      })
      return []
    }
  },

  // Data Fetching
  fetchTrips: async () => {
    set({ isLoading: true, error: null })
    try {
      const trips = await travelService.getAllTrips()
      set({
        trips,
        isLoading: false,
      })

      // Also fetch upcoming and active trips
      await get().fetchUpcomingTrips()
      await get().fetchActiveTrips()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
        isLoading: false,
      })
    }
  },

  fetchTripById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const trip = await travelService.getTripById(id)
      if (trip) {
        set({
          selectedTrip: trip,
          isLoading: false,
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch trip',
        isLoading: false,
      })
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

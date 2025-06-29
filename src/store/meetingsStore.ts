import { create } from 'zustand'
import { Meeting, MeetingFilters, MeetingFormData, ActionItem } from '../types'

interface MeetingsState {
  meetings: Meeting[]
  selectedMeeting: Meeting | null
  filters: MeetingFilters
  isLoading: boolean
  error: string | null
  activeMeeting: Meeting | null
}

interface MeetingsActions {
  // CRUD operations
  createMeeting: (meetingData: MeetingFormData) => void
  updateMeeting: (id: string, updates: Partial<Meeting>) => void
  deleteMeeting: (id: string) => void

  // Meeting management
  selectMeeting: (meeting: Meeting | null) => void
  startMeeting: (id: string) => void
  endMeeting: (id: string) => void
  addActionItem: (
    meetingId: string,
    actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => void

  // Filtering and search
  setFilters: (filters: Partial<MeetingFilters>) => void
  clearFilters: () => void
  getMeetingsByDateRange: (start: Date, end: Date) => Meeting[]

  // Data fetching
  fetchMeetings: () => Promise<void>

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type MeetingsStore = MeetingsState & MeetingsActions

export const useMeetingsStore = create<MeetingsStore>((set, get) => ({
  // State
  meetings: [],
  selectedMeeting: null,
  filters: {},
  isLoading: false,
  error: null,
  activeMeeting: null,

  // Actions
  createMeeting: (meetingData: MeetingFormData) => {
    const newMeeting: Meeting = {
      id: crypto.randomUUID(),
      title: meetingData.title,
      description: meetingData.description,
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      location: meetingData.location,
      type: meetingData.type,
      attendees: [], // Will be populated by contact IDs
      status: 'scheduled',
      createdBy: 'current-user', // Should come from auth store
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => ({
      meetings: [...state.meetings, newMeeting],
    }))
  },

  updateMeeting: (id: string, updates: Partial<Meeting>) => {
    set(state => ({
      meetings: state.meetings.map(meeting =>
        meeting.id === id
          ? { ...meeting, ...updates, updatedAt: new Date() }
          : meeting
      ),
      selectedMeeting:
        state.selectedMeeting?.id === id
          ? { ...state.selectedMeeting, ...updates, updatedAt: new Date() }
          : state.selectedMeeting,
    }))
  },

  deleteMeeting: (id: string) => {
    set(state => ({
      meetings: state.meetings.filter(meeting => meeting.id !== id),
      selectedMeeting:
        state.selectedMeeting?.id === id ? null : state.selectedMeeting,
      activeMeeting:
        state.activeMeeting?.id === id ? null : state.activeMeeting,
    }))
  },

  selectMeeting: (meeting: Meeting | null) => {
    set({ selectedMeeting: meeting })
  },

  startMeeting: (id: string) => {
    const meeting = get().meetings.find(m => m.id === id)
    if (meeting) {
      const updatedMeeting = { ...meeting, status: 'in-progress' as const }
      get().updateMeeting(id, { status: 'in-progress' })
      set({ activeMeeting: updatedMeeting })
    }
  },

  endMeeting: (id: string) => {
    get().updateMeeting(id, { status: 'completed' })
    set({ activeMeeting: null })
  },

  addActionItem: (meetingId: string, actionItemData) => {
    const actionItem: ActionItem = {
      id: crypto.randomUUID(),
      ...actionItemData,
      meetingId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => ({
      meetings: state.meetings.map(meeting =>
        meeting.id === meetingId
          ? {
              ...meeting,
              actionItems: [...(meeting.actionItems || []), actionItem],
              updatedAt: new Date(),
            }
          : meeting
      ),
    }))
  },

  setFilters: (filters: Partial<MeetingFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  getMeetingsByDateRange: (start: Date, end: Date) => {
    const { meetings } = get()
    return meetings.filter(
      meeting => meeting.startTime >= start && meeting.startTime <= end
    )
  },

  fetchMeetings: async () => {
    set({ isLoading: true, error: null })
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      set({ isLoading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch meetings',
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

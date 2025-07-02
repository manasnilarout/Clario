import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  Meeting,
  MeetingFilter,
  MeetingSortOption,
  MeetingViewMode,
  CalendarView,
  MeetingFormData,
  MeetingStats,
  MeetingTemplate,
  ActionItem,
  MeetingAvailability,
  MeetingConflict,
} from '../types/meeting'
import { meetingsService } from '../services/meetingsService'

interface MeetingsState {
  // Core data
  meetings: Meeting[]
  filteredMeetings: Meeting[]
  selectedMeetings: string[]

  // UI state
  viewMode: MeetingViewMode
  calendarView: CalendarView
  sortBy: MeetingSortOption
  filter: MeetingFilter
  searchQuery: string
  isLoading: boolean
  error?: string
  currentDate: Date
  selectedDate: Date
  dateRange: {
    start: Date
    end: Date
  }

  // Modal states
  isCreating: boolean
  isEditing: boolean
  editingMeetingId: string | null
  activeMeetingId: string | null

  // Related data
  templates: MeetingTemplate[]
  stats: MeetingStats | null
  actionItems: ActionItem[]

  // Actions
  loadMeetings: () => Promise<void>
  createMeeting: (meetingData: MeetingFormData) => Promise<Meeting>
  updateMeeting: (
    id: string,
    meetingData: Partial<MeetingFormData>
  ) => Promise<Meeting>
  deleteMeeting: (id: string) => Promise<void>
  deleteMultipleMeetings: (ids: string[]) => Promise<void>

  setSearchQuery: (query: string) => void
  setFilter: (filter: Partial<MeetingFilter>) => void
  clearFilter: () => void
  searchMeetings: (query: string) => Meeting[]

  setSortBy: (sort: MeetingSortOption) => void
  setViewMode: (mode: MeetingViewMode) => void
  setCalendarView: (view: CalendarView) => void

  selectMeeting: (id: string) => void
  deselectMeeting: (id: string) => void
  clearSelection: () => void
  selectAll: () => void

  setCurrentDate: (date: Date) => void
  setSelectedDate: (date: Date) => void
  setDateRange: (range: { start: Date; end: Date }) => void

  startMeeting: (id: string) => Promise<void>
  endMeeting: (id: string) => Promise<void>
  cancelMeeting: (id: string, reason?: string) => Promise<void>
  rescheduleMeeting: (
    id: string,
    newStartTime: Date,
    newEndTime: Date
  ) => Promise<void>

  addActionItem: (
    meetingId: string,
    actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'meetingId'>
  ) => Promise<ActionItem>
  updateActionItem: (
    actionItemId: string,
    updates: Partial<ActionItem>
  ) => Promise<ActionItem>
  completeActionItem: (actionItemId: string) => Promise<void>

  loadTemplates: () => Promise<void>
  createTemplate: (
    template: Omit<MeetingTemplate, 'id' | 'createdAt' | 'usageCount'>
  ) => Promise<MeetingTemplate>

  loadStats: () => Promise<void>
  loadActionItems: () => Promise<void>

  setCreating: (isCreating: boolean) => void
  setEditing: (meetingId: string | null) => void

  getMeetingById: (id: string) => Meeting | undefined
  getMeetingsByDate: (date: Date) => Meeting[]
  getMeetingsByDateRange: (start: Date, end: Date) => Meeting[]
  getUpcomingMeetings: (limit?: number) => Meeting[]
  getTodaysMeetings: () => Meeting[]
  getFilteredMeetings: () => Meeting[]
  checkMeetingConflicts: (
    startTime: Date,
    endTime: Date,
    attendeeIds: string[],
    excludeMeetingId?: string
  ) => MeetingConflict[]
  getAttendeeAvailability: (
    attendeeIds: string[],
    startTime: Date,
    endTime: Date
  ) => Promise<MeetingAvailability[]>
  refreshMeetings: () => Promise<void>
}

const defaultFilter: MeetingFilter = {
  searchQuery: '',
  attendees: [],
  types: [],
  statuses: [],
  priorities: [],
  tags: [],
  locations: [],
  hasActionItems: undefined,
  isRecurring: undefined,
  isPrivate: undefined,
}

const defaultSort: MeetingSortOption = {
  field: 'startTime',
  direction: 'asc',
}

const getDateRange = (date: Date, view: CalendarView) => {
  const start = new Date(date)
  const end = new Date(date)

  switch (view) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week': {
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    }
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'agenda':
      start.setHours(0, 0, 0, 0)
      end.setDate(end.getDate() + 30)
      end.setHours(23, 59, 59, 999)
      break
  }

  return { start, end }
}

export const useMeetingsStore = create<MeetingsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      meetings: [],
      filteredMeetings: [],
      selectedMeetings: [],
      viewMode: 'calendar',
      calendarView: 'month',
      sortBy: defaultSort,
      filter: defaultFilter,
      searchQuery: '',
      isLoading: false,
      error: undefined,
      currentDate: new Date(),
      selectedDate: new Date(),
      dateRange: getDateRange(new Date(), 'month'),
      isCreating: false,
      isEditing: false,
      editingMeetingId: null,
      activeMeetingId: null,
      templates: [],
      stats: null,
      actionItems: [],

      // Actions
      loadMeetings: async () => {
        set({ isLoading: true, error: undefined })

        try {
          const meetings = await meetingsService.getMeetings()
          set({
            meetings,
            isLoading: false,
          })

          get().getFilteredMeetings()
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load meetings',
            isLoading: false,
          })
        }
      },

      createMeeting: async (meetingData: MeetingFormData) => {
        set({ isLoading: true, error: undefined })

        try {
          const newMeeting = await meetingsService.createMeeting(meetingData)
          const { meetings } = get()
          set({
            meetings: [newMeeting, ...meetings],
            isLoading: false,
            isCreating: false,
          })

          get().getFilteredMeetings()
          return newMeeting
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create meeting',
            isLoading: false,
          })
          throw error
        }
      },

      updateMeeting: async (
        id: string,
        meetingData: Partial<MeetingFormData>
      ) => {
        set({ isLoading: true, error: undefined })

        try {
          const updatedMeeting = await meetingsService.updateMeeting(
            id,
            meetingData
          )
          const { meetings } = get()
          const updatedMeetings = meetings.map(m =>
            m.id === id ? updatedMeeting : m
          )

          set({
            meetings: updatedMeetings,
            isLoading: false,
            editingMeetingId: null,
          })

          get().getFilteredMeetings()
          return updatedMeeting
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update meeting',
            isLoading: false,
          })
          throw error
        }
      },

      deleteMeeting: async (id: string) => {
        try {
          await meetingsService.deleteMeeting(id)
          const { meetings, selectedMeetings } = get()

          set({
            meetings: meetings.filter(m => m.id !== id),
            selectedMeetings: selectedMeetings.filter(mId => mId !== id),
            activeMeetingId:
              get().activeMeetingId === id ? null : get().activeMeetingId,
          })

          get().getFilteredMeetings()
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete meeting',
          })
          throw error
        }
      },

      deleteMultipleMeetings: async (ids: string[]) => {
        try {
          await Promise.all(ids.map(id => meetingsService.deleteMeeting(id)))
          const { meetings } = get()

          set({
            meetings: meetings.filter(m => !ids.includes(m.id)),
            selectedMeetings: [],
            activeMeetingId: ids.includes(get().activeMeetingId || '')
              ? null
              : get().activeMeetingId,
          })

          get().getFilteredMeetings()
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete meetings',
          })
          throw error
        }
      },

      setSearchQuery: (query: string) => {
        set({
          searchQuery: query,
          filter: { ...get().filter, searchQuery: query },
        })
        get().getFilteredMeetings()
      },

      setFilter: (newFilter: Partial<MeetingFilter>) => {
        const currentFilter = get().filter
        set({
          filter: { ...currentFilter, ...newFilter },
        })
        get().getFilteredMeetings()
      },

      clearFilter: () => {
        set({
          filter: { ...defaultFilter },
          searchQuery: '',
        })
        get().getFilteredMeetings()
      },

      searchMeetings: (query: string) => {
        const { meetings } = get()
        if (!query.trim()) return []

        const searchTerms = query.toLowerCase().split(' ')

        return meetings.filter(meeting => {
          const searchableText = [
            meeting.title,
            meeting.description,
            meeting.type,
            meeting.status,
            meeting.priority,
            meeting.location?.address,
            meeting.location?.room,
            ...meeting.tags,
            ...meeting.attendees.map(
              a => `${a.firstName} ${a.lastName} ${a.email} ${a.company}`
            ),
            ...meeting.notes.map(n => n.content),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchTerms.every(term => searchableText.includes(term))
        })
      },

      setSortBy: (sort: MeetingSortOption) => {
        set({ sortBy: sort })
        get().getFilteredMeetings()
      },

      setViewMode: (mode: MeetingViewMode) => {
        set({ viewMode: mode })
      },

      setCalendarView: (view: CalendarView) => {
        const { currentDate } = get()
        const newDateRange = getDateRange(currentDate, view)
        set({
          calendarView: view,
          dateRange: newDateRange,
        })
      },

      selectMeeting: (id: string) => {
        const { selectedMeetings } = get()
        if (!selectedMeetings.includes(id)) {
          set({ selectedMeetings: [...selectedMeetings, id] })
        }
      },

      deselectMeeting: (id: string) => {
        const { selectedMeetings } = get()
        set({ selectedMeetings: selectedMeetings.filter(mId => mId !== id) })
      },

      clearSelection: () => {
        set({ selectedMeetings: [] })
      },

      selectAll: () => {
        const { filteredMeetings } = get()
        set({ selectedMeetings: filteredMeetings.map(m => m.id) })
      },

      setCurrentDate: (date: Date) => {
        const { calendarView } = get()
        const newDateRange = getDateRange(date, calendarView)
        set({
          currentDate: date,
          dateRange: newDateRange,
        })
      },

      setSelectedDate: (date: Date) => {
        set({ selectedDate: date })
      },

      setDateRange: (range: { start: Date; end: Date }) => {
        set({ dateRange: range })
      },

      startMeeting: async (id: string) => {
        try {
          await get().updateMeeting(id, { status: 'in_progress' })
          set({ activeMeetingId: id })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to start meeting',
          })
          throw error
        }
      },

      endMeeting: async (id: string) => {
        try {
          await get().updateMeeting(id, { status: 'completed' })
          set({ activeMeetingId: null })
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to end meeting',
          })
          throw error
        }
      },

      cancelMeeting: async (id: string, _reason?: string) => {
        try {
          await get().updateMeeting(id, { status: 'cancelled' })
          set({
            activeMeetingId:
              get().activeMeetingId === id ? null : get().activeMeetingId,
          })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to cancel meeting',
          })
          throw error
        }
      },

      rescheduleMeeting: async (
        id: string,
        newStartTime: Date,
        newEndTime: Date
      ) => {
        try {
          await get().updateMeeting(id, {
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'scheduled',
          })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to reschedule meeting',
          })
          throw error
        }
      },

      addActionItem: async (
        meetingId: string,
        actionItemData: Omit<ActionItem, 'id' | 'createdAt' | 'meetingId'>
      ) => {
        try {
          const actionItem = await meetingsService.createActionItem(
            meetingId,
            actionItemData
          )
          const { actionItems } = get()
          set({ actionItems: [actionItem, ...actionItems] })
          return actionItem
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to add action item',
          })
          throw error
        }
      },

      updateActionItem: async (
        actionItemId: string,
        updates: Partial<ActionItem>
      ) => {
        try {
          const updatedActionItem = await meetingsService.updateActionItem(
            actionItemId,
            updates
          )
          const { actionItems } = get()
          set({
            actionItems: actionItems.map(item =>
              item.id === actionItemId ? updatedActionItem : item
            ),
          })
          return updatedActionItem
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update action item',
          })
          throw error
        }
      },

      completeActionItem: async (actionItemId: string) => {
        try {
          await get().updateActionItem(actionItemId, {
            status: 'completed',
            completedAt: new Date(),
          })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to complete action item',
          })
          throw error
        }
      },

      loadTemplates: async () => {
        try {
          const templates = await meetingsService.getTemplates()
          set({ templates })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load templates',
          })
        }
      },

      createTemplate: async (
        templateData: Omit<MeetingTemplate, 'id' | 'createdAt' | 'usageCount'>
      ) => {
        try {
          const template = await meetingsService.createTemplate(templateData)
          const { templates } = get()
          set({ templates: [template, ...templates] })
          return template
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create template',
          })
          throw error
        }
      },

      loadStats: async () => {
        try {
          const stats = await meetingsService.getMeetingStats()
          set({ stats })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load statistics',
          })
        }
      },

      loadActionItems: async () => {
        try {
          const actionItems = await meetingsService.getActionItems()
          set({ actionItems })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load action items',
          })
        }
      },

      setCreating: (isCreating: boolean) => {
        set({ isCreating })
      },

      setEditing: (meetingId: string | null) => {
        set({
          editingMeetingId: meetingId,
          isEditing: meetingId !== null,
        })
      },

      getMeetingById: (id: string) => {
        return get().meetings.find(m => m.id === id)
      },

      getMeetingsByDate: (date: Date) => {
        const { meetings } = get()
        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        return meetings.filter(
          meeting =>
            meeting.startTime >= targetDate && meeting.startTime < nextDay
        )
      },

      getMeetingsByDateRange: (start: Date, end: Date) => {
        const { meetings } = get()
        return meetings.filter(
          meeting => meeting.startTime >= start && meeting.startTime <= end
        )
      },

      getUpcomingMeetings: (limit = 10) => {
        const { meetings } = get()
        const now = new Date()
        return meetings
          .filter(
            meeting => meeting.startTime > now && meeting.status === 'scheduled'
          )
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
          .slice(0, limit)
      },

      getTodaysMeetings: () => {
        return get().getMeetingsByDate(new Date())
      },

      getFilteredMeetings: () => {
        const { meetings, filter, sortBy, dateRange } = get()

        let filtered = [...meetings]

        // Apply date range filter
        filtered = filtered.filter(
          meeting =>
            meeting.startTime >= dateRange.start &&
            meeting.startTime <= dateRange.end
        )

        // Apply search query
        if (filter.searchQuery) {
          const searchResults = get().searchMeetings(filter.searchQuery)
          filtered = filtered.filter(meeting =>
            searchResults.some(result => result.id === meeting.id)
          )
        }

        // Apply filters
        if (filter.attendees && filter.attendees.length > 0) {
          filtered = filtered.filter(meeting =>
            filter.attendees!.some(attendeeId =>
              meeting.attendees.some(attendee => attendee.id === attendeeId)
            )
          )
        }

        if (filter.types && filter.types.length > 0) {
          filtered = filtered.filter(meeting =>
            filter.types!.includes(meeting.type)
          )
        }

        if (filter.statuses && filter.statuses.length > 0) {
          filtered = filtered.filter(meeting =>
            filter.statuses!.includes(meeting.status)
          )
        }

        if (filter.priorities && filter.priorities.length > 0) {
          filtered = filtered.filter(meeting =>
            filter.priorities!.includes(meeting.priority)
          )
        }

        if (filter.tags && filter.tags.length > 0) {
          filtered = filtered.filter(meeting =>
            filter.tags!.some(tag => meeting.tags.includes(tag))
          )
        }

        if (filter.hasActionItems !== undefined) {
          filtered = filtered.filter(meeting =>
            filter.hasActionItems
              ? meeting.actionItems.length > 0
              : meeting.actionItems.length === 0
          )
        }

        if (filter.isRecurring !== undefined) {
          filtered = filtered.filter(meeting =>
            filter.isRecurring ? !!meeting.recurrence : !meeting.recurrence
          )
        }

        if (filter.isPrivate !== undefined) {
          filtered = filtered.filter(
            meeting => meeting.isPrivate === filter.isPrivate
          )
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any
          let bValue: any

          // Handle special computed fields
          if (sortBy.field === 'duration') {
            aValue = a.duration
            bValue = b.duration
          } else if (sortBy.field === 'attendeeCount') {
            aValue = a.attendees.length
            bValue = b.attendees.length
          } else {
            aValue = a[sortBy.field as keyof Meeting]
            bValue = b[sortBy.field as keyof Meeting]
          }

          if (aValue === bValue) return 0
          if (aValue === undefined || aValue === null) return 1
          if (bValue === undefined || bValue === null) return -1

          let comparison = 0
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue)
          } else if (aValue instanceof Date && bValue instanceof Date) {
            comparison = aValue.getTime() - bValue.getTime()
          } else {
            comparison = aValue < bValue ? -1 : 1
          }

          return sortBy.direction === 'desc' ? -comparison : comparison
        })

        set({ filteredMeetings: filtered })
        return filtered
      },

      checkMeetingConflicts: (
        startTime: Date,
        endTime: Date,
        attendeeIds: string[],
        excludeMeetingId?: string
      ) => {
        const { meetings } = get()
        const conflicts: MeetingConflict[] = []

        meetings.forEach(meeting => {
          if (meeting.id === excludeMeetingId || meeting.status === 'cancelled')
            return

          const meetingStart = meeting.startTime
          const meetingEnd = meeting.endTime

          // Check if meetings overlap
          const hasOverlap = startTime < meetingEnd && endTime > meetingStart

          if (hasOverlap) {
            meeting.attendees.forEach(attendee => {
              if (attendeeIds.includes(attendee.id)) {
                const conflictStart = new Date(
                  Math.max(startTime.getTime(), meetingStart.getTime())
                )
                const conflictEnd = new Date(
                  Math.min(endTime.getTime(), meetingEnd.getTime())
                )

                let severity: 'overlap' | 'adjacent' | 'back_to_back' =
                  'overlap'

                if (
                  startTime.getTime() === meetingEnd.getTime() ||
                  endTime.getTime() === meetingStart.getTime()
                ) {
                  severity = 'back_to_back'
                } else if (
                  Math.abs(startTime.getTime() - meetingEnd.getTime()) <=
                    15 * 60 * 1000 ||
                  Math.abs(endTime.getTime() - meetingStart.getTime()) <=
                    15 * 60 * 1000
                ) {
                  severity = 'adjacent'
                }

                conflicts.push({
                  meetingId: meeting.id,
                  attendeeId: attendee.id,
                  conflictStart,
                  conflictEnd,
                  severity,
                })
              }
            })
          }
        })

        return conflicts
      },

      getAttendeeAvailability: async (
        attendeeIds: string[],
        startTime: Date,
        endTime: Date
      ) => {
        try {
          return await meetingsService.checkAttendeeAvailability(
            attendeeIds,
            startTime,
            endTime
          )
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to check availability',
          })
          return []
        }
      },

      refreshMeetings: async () => {
        await get().loadMeetings()
        await get().loadStats()
        await get().loadActionItems()
      },
    }),
    {
      name: 'meetings-store',
    }
  )
)

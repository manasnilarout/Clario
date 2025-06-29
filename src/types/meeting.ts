import { Contact } from './contact'

export interface MeetingLocation {
  type: 'physical' | 'virtual' | 'hybrid'
  address?: string
  room?: string
  virtualUrl?: string
  platform?: 'zoom' | 'teams' | 'meet' | 'webex' | 'other'
  dialIn?: {
    phone: string
    accessCode: string
  }
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval: number // every N days/weeks/months/years
  daysOfWeek?: number[] // 0-6, Sunday is 0
  dayOfMonth?: number // 1-31
  weekOfMonth?: number // 1-4, or -1 for last week
  monthOfYear?: number // 1-12
  endDate?: Date
  occurrences?: number // number of occurrences before ending
}

export interface MeetingPreparation {
  agenda: MeetingAgendaItem[]
  documents: MeetingDocument[]
  notes?: string
  checklist: MeetingChecklistItem[]
  previousMeetingContext?: {
    meetingId: string
    actionItems: ActionItem[]
    keyDecisions: string[]
  }
}

export interface MeetingAgendaItem {
  id: string
  title: string
  description?: string
  duration: number // in minutes
  presenter?: string
  type: 'discussion' | 'presentation' | 'decision' | 'update' | 'break'
  order: number
}

export interface MeetingDocument {
  id: string
  title: string
  url: string
  type: 'pdf' | 'doc' | 'ppt' | 'sheet' | 'link' | 'other'
  uploadedBy: string
  uploadedAt: Date
  size?: number
}

export interface MeetingChecklistItem {
  id: string
  title: string
  completed: boolean
  assignedTo?: string
  dueDate?: Date
}

export interface ActionItem {
  id: string
  title: string
  description?: string
  assignedTo: string // Contact ID or user ID
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  createdAt: Date
  completedAt?: Date
  meetingId: string
}

export interface MeetingOutcome {
  id: string
  type: 'decision' | 'action_item' | 'follow_up' | 'next_meeting' | 'key_point'
  content: string
  assignedTo?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  status?: 'pending' | 'completed'
}

export interface MeetingNote {
  id: string
  content: string
  author: string
  timestamp: Date
  isPrivate: boolean
  tags?: string[]
}

export type MeetingStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
export type MeetingType =
  | 'one_on_one'
  | 'team_meeting'
  | 'client_meeting'
  | 'interview'
  | 'presentation'
  | 'standup'
  | 'review'
  | 'planning'
  | 'training'
  | 'other'
export type MeetingPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Meeting {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  attendees: Contact[]
  organizer: string // Contact ID or user ID
  location?: MeetingLocation
  type: MeetingType
  priority: MeetingPriority
  status: MeetingStatus
  recurrence?: RecurrencePattern
  preparation?: MeetingPreparation
  notes: MeetingNote[]
  outcomes: MeetingOutcome[]
  actionItems: ActionItem[]
  tags: string[]
  isPrivate: boolean
  allowGuestInvites: boolean
  requiresApproval: boolean
  maxAttendees?: number
  reminderMinutes: number[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
  duration: number // calculated from start/end time in minutes
  timezone: string
  conferenceData?: {
    entryPoints: Array<{
      entryPointType: 'video' | 'phone' | 'sip'
      uri: string
      label?: string
      pin?: string
    }>
    conferenceSolution: string
    conferenceId: string
  }
}

export interface MeetingTemplate {
  id: string
  name: string
  description?: string
  type: MeetingType
  defaultDuration: number // in minutes
  defaultLocation?: MeetingLocation
  defaultAgenda: Omit<MeetingAgendaItem, 'id'>[]
  defaultChecklist: Omit<MeetingChecklistItem, 'id' | 'completed'>[]
  defaultAttendees: string[] // Contact IDs
  tags: string[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  usageCount: number
}

export interface MeetingFilter {
  searchQuery?: string
  attendees?: string[]
  organizer?: string
  types?: MeetingType[]
  statuses?: MeetingStatus[]
  priorities?: MeetingPriority[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  locations?: string[]
  hasActionItems?: boolean
  isRecurring?: boolean
  isPrivate?: boolean
  minDuration?: number
  maxDuration?: number
}

export interface MeetingSortOption {
  field: keyof Meeting | 'duration' | 'attendeeCount'
  direction: 'asc' | 'desc'
}

export type MeetingViewMode = 'calendar' | 'list' | 'agenda' | 'timeline'
export type CalendarView = 'month' | 'week' | 'day' | 'agenda'

export interface MeetingListState {
  meetings: Meeting[]
  filteredMeetings: Meeting[]
  selectedMeetings: string[]
  viewMode: MeetingViewMode
  calendarView: CalendarView
  sortBy: MeetingSortOption
  filter: MeetingFilter
  searchQuery: string
  isLoading: boolean
  error?: string
  totalCount: number
  currentDate: Date
  selectedDate: Date
  dateRange: {
    start: Date
    end: Date
  }
}

export interface MeetingFormData {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  attendees: string[] // Contact IDs
  location?: MeetingLocation
  type: MeetingType
  priority: MeetingPriority
  recurrence?: RecurrencePattern
  tags: string[]
  isPrivate: boolean
  allowGuestInvites: boolean
  requiresApproval: boolean
  maxAttendees?: number
  reminderMinutes: number[]
  agenda: Omit<MeetingAgendaItem, 'id'>[]
  checklist: Omit<MeetingChecklistItem, 'id' | 'completed'>[]
  timezone: string
}

export interface MeetingValidationError {
  field: keyof MeetingFormData
  message: string
}

export interface MeetingConflict {
  meetingId: string
  attendeeId: string
  conflictStart: Date
  conflictEnd: Date
  severity: 'overlap' | 'adjacent' | 'back_to_back'
}

export interface MeetingAvailability {
  contactId: string
  isAvailable: boolean
  conflicts: MeetingConflict[]
  suggestedTimes: Date[]
}

export interface MeetingStats {
  totalMeetings: number
  scheduledMeetings: number
  completedMeetings: number
  cancelledMeetings: number
  averageDuration: number
  totalMeetingTime: number // in minutes
  meetingsByType: Array<{ type: MeetingType; count: number }>
  meetingsByStatus: Array<{ status: MeetingStatus; count: number }>
  meetingsByPriority: Array<{ priority: MeetingPriority; count: number }>
  topAttendees: Array<{ contactId: string; name: string; count: number }>
  upcomingMeetings: number
  overdueActionItems: number
  completedActionItems: number
  meetingsThisWeek: number
  meetingsThisMonth: number
  averageAttendeesPerMeeting: number
  mostCommonMeetingTimes: Array<{ hour: number; count: number }>
  longestMeeting: { id: string; duration: number }
  shortestMeeting: { id: string; duration: number }
  productivityScore: number // 0-100 based on completion rate, action items, etc.
}

export interface MeetingSearchResult {
  meeting: Meeting
  matchedFields: string[]
  score: number
}

export interface MeetingBulkOperation {
  type:
    | 'delete'
    | 'cancel'
    | 'reschedule'
    | 'addTag'
    | 'removeTag'
    | 'updateStatus'
    | 'export'
  meetingIds: string[]
  payload?: any
}

export interface MeetingQuickAction {
  id: string
  label: string
  icon: string
  action: (meeting: Meeting) => void
  isVisible: (meeting: Meeting) => boolean
  variant?: 'default' | 'primary' | 'secondary' | 'danger'
}

export interface CalendarTimeSlot {
  start: Date
  end: Date
  isAvailable: boolean
  isWorkingHours: boolean
  hasConflict: boolean
  conflictSeverity?: 'low' | 'medium' | 'high'
  meetingId?: string
}

export interface CalendarDay {
  date: Date
  isToday: boolean
  isWeekend: boolean
  isOtherMonth: boolean
  meetings: Meeting[]
  timeSlots: CalendarTimeSlot[]
  workingHours: {
    start: number // hour in 24h format
    end: number
  }
}

export interface CalendarWeek {
  weekNumber: number
  days: CalendarDay[]
  startDate: Date
  endDate: Date
}

export interface CalendarMonth {
  month: number
  year: number
  weeks: CalendarWeek[]
  totalMeetings: number
  workingDays: number
}

export interface MeetingReminder {
  id: string
  meetingId: string
  type: 'email' | 'push' | 'sms' | 'popup'
  triggerTime: Date
  message: string
  isRead: boolean
  isSent: boolean
  sentAt?: Date
  error?: string
}

export interface MeetingInvitation {
  id: string
  meetingId: string
  inviteeEmail: string
  inviteeName: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
  sentAt: Date
  respondedAt?: Date
  message?: string
  canModify: boolean
  canInviteOthers: boolean
}

export interface MeetingFeedback {
  id: string
  meetingId: string
  rating: number // 1-5
  comment?: string
  categories: Array<{
    category:
      | 'agenda'
      | 'duration'
      | 'participation'
      | 'outcome'
      | 'organization'
    rating: number
  }>
  anonymous: boolean
  submittedBy: string
  submittedAt: Date
}

export interface MeetingAnalytics {
  meetingId: string
  actualStartTime: Date
  actualEndTime: Date
  actualDuration: number
  attendeeParticipation: Array<{
    attendeeId: string
    joinTime?: Date
    leaveTime?: Date
    speakingTime?: number // in seconds
    engagementScore: number // 0-100
  }>
  agendaCompletion: number // percentage
  actionItemsCreated: number
  decisionsCount: number
  followUpMeetingsScheduled: number
  overallProductivity: number // 0-100
  feedback: MeetingFeedback[]
}

// Core application types and interfaces

export * from './contact'
export * from './meeting'
export * from './task'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  meetings: boolean
  tasks: boolean
  travel: boolean
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  position?: string
  avatar?: string
  tags: string[]
  importance: 'low' | 'medium' | 'high'
  lastContact?: Date
  notes?: string
  socialProfiles?: SocialProfile[]
  createdAt: Date
  updatedAt: Date
}

export interface SocialProfile {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram'
  url: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  type: 'in-person' | 'virtual' | 'phone'
  attendees: Contact[]
  agenda?: AgendaItem[]
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  meetingNotes?: string
  actionItems?: ActionItem[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface AgendaItem {
  id: string
  title: string
  duration: number // in minutes
  presenter?: string
  notes?: string
}

export interface ActionItem {
  id: string
  description: string
  assignee: string
  dueDate?: Date
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  meetingId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Trip {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  destinations: Destination[]
  purpose: 'business' | 'personal' | 'mixed'
  budget?: number
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  checklist: ChecklistItem[]
  relatedMeetings?: string[] // Meeting IDs
  relatedContacts?: string[] // Contact IDs
  createdAt: Date
  updatedAt: Date
}

export interface Destination {
  id: string
  city: string
  country: string
  arrivalDate: Date
  departureDate: Date
  accommodation?: string
  notes?: string
}

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  category: 'documents' | 'packing' | 'bookings' | 'other'
}

export interface RelatedItem {
  type: 'meeting' | 'contact' | 'trip' | 'goal'
  id: string
  title: string
}

export interface OGSMGoal {
  id: string
  type: 'objective' | 'goal' | 'strategy' | 'measure'
  title: string
  description?: string
  parentId?: string
  targetValue?: number
  currentValue?: number
  unit?: string
  dueDate?: Date
  status: 'not-started' | 'in-progress' | 'on-track' | 'at-risk' | 'completed'
  assignee?: string
  relatedTasks?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Insight {
  id: string
  type: 'contact' | 'meeting' | 'travel' | 'task' | 'goal'
  title: string
  description: string
  value: number | string
  trend?: 'up' | 'down' | 'stable'
  period: string
  category: string
  createdAt: Date
}

export interface Integration {
  id: string
  name: string
  type: 'email' | 'calendar' | 'social' | 'productivity'
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
  settings: Record<string, unknown>
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, unknown>
}

// UI State types
export interface UIState {
  sidebarOpen: boolean
  loading: boolean
  selectedTheme: 'light' | 'dark'
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: Date
}

// Form types
export interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  position?: string
  tags: string[]
  importance: 'low' | 'medium' | 'high'
  notes?: string
}

export interface MeetingFormData {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  type: 'in-person' | 'virtual' | 'phone'
  attendeeIds: string[]
}

export interface TripFormData {
  title: string
  description?: string
  startDate: Date
  endDate: Date
  destinations: Omit<Destination, 'id'>[]
  purpose: 'business' | 'personal' | 'mixed'
  budget?: number
}

// Filter and search types
export interface ContactFilters {
  search?: string
  tags?: string[]
  importance?: ('low' | 'medium' | 'high')[]
  company?: string[]
}

export interface MeetingFilters {
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
  type?: ('in-person' | 'virtual' | 'phone')[]
  status?: ('scheduled' | 'in-progress' | 'completed' | 'cancelled')[]
}

// Chart and analytics types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
  }[]
}

export interface MetricCard {
  title: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  format?: 'number' | 'currency' | 'percentage'
}

// Route types
export interface RouteConfig {
  path: string
  title: string
  icon?: string
  requiresAuth?: boolean
  children?: RouteConfig[]
}

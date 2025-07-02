export enum TripPurpose {
  BUSINESS = 'business',
  PERSONAL = 'personal',
  MIXED = 'mixed',
  CONFERENCE = 'conference',
  TRAINING = 'training',
  CLIENT_VISIT = 'client_visit',
  VACATION = 'vacation',
  FAMILY = 'family',
}

export enum TripStatus {
  PLANNING = 'planning',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

export enum TransportationType {
  FLIGHT = 'flight',
  TRAIN = 'train',
  CAR = 'car',
  BUS = 'bus',
  SHIP = 'ship',
  OTHER = 'other',
}

export enum AccommodationType {
  HOTEL = 'hotel',
  APARTMENT = 'apartment',
  HOUSE = 'house',
  HOSTEL = 'hostel',
  RESORT = 'resort',
  GUEST_HOUSE = 'guest_house',
  OTHER = 'other',
}

export enum TravelApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_REVISION = 'requires_revision',
}

export interface WeatherInfo {
  temperature: {
    min: number
    max: number
    unit: 'celsius' | 'fahrenheit'
  }
  condition: string
  precipitation: number
  humidity: number
  windSpeed: number
}

export interface Transportation {
  id: string
  type: TransportationType
  provider: string
  bookingReference?: string
  departureLocation: string
  arrivalLocation: string
  departureTime: Date
  arrivalTime: Date
  duration: number // minutes
  cost?: number
  currency?: string
  seatNumber?: string
  notes?: string
  confirmationStatus: 'pending' | 'confirmed' | 'cancelled'
  bookingUrl?: string
}

export interface Accommodation {
  id: string
  type: AccommodationType
  name: string
  address: string
  checkInDate: Date
  checkOutDate: Date
  nights: number
  cost?: number
  currency?: string
  bookingReference?: string
  contactInfo?: {
    phone?: string
    email?: string
  }
  amenities?: string[]
  notes?: string
  confirmationStatus: 'pending' | 'confirmed' | 'cancelled'
  bookingUrl?: string
}

export interface Destination {
  id: string
  city: string
  country: string
  region?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  arrivalDate: Date
  departureDate: Date
  purpose: string
  notes?: string
  weather?: WeatherInfo
  localContacts?: string[] // Contact IDs
  plannedMeetings?: string[] // Meeting IDs
  accommodation?: string // Accommodation ID
  transportation?: string[] // Transportation IDs
  activities?: TravelActivity[]
  importantInfo?: {
    timezone: string
    currency: string
    language: string
    emergencyNumbers?: string[]
  }
}

export interface TravelActivity {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime?: Date
  location?: string
  category:
    | 'meeting'
    | 'leisure'
    | 'dining'
    | 'transport'
    | 'accommodation'
    | 'other'
  relatedContacts?: string[]
  relatedMeetings?: string[]
  notes?: string
}

export interface TravelBudget {
  total: number
  currency: string
  breakdown: {
    transportation: number
    accommodation: number
    meals: number
    entertainment: number
    business: number
    miscellaneous: number
  }
  approvedAmount?: number
  spentAmount: number
  remainingAmount: number
  expenseTracking: boolean
}

export interface TravelExpense {
  id: string
  tripId: string
  category: keyof TravelBudget['breakdown']
  amount: number
  currency: string
  description: string
  date: Date
  location?: string
  receipt?: {
    url: string
    filename: string
  }
  reimbursable: boolean
  approvalStatus: 'pending' | 'approved' | 'rejected'
  notes?: string
}

export interface TravelChecklistItem {
  id: string
  title: string
  description?: string
  category: 'documents' | 'packing' | 'booking' | 'health' | 'work' | 'other'
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  dueDate?: Date
  assignedTo?: string
  notes?: string
  dependsOn?: string[] // Other checklist item IDs
}

export interface Traveler {
  id: string
  contactId?: string // Link to contact if exists
  name: string
  email?: string
  phone?: string
  role: 'primary' | 'companion' | 'colleague' | 'family'
  travelDocuments?: {
    passport?: {
      number: string
      expiryDate: Date
      issuingCountry: string
    }
    visa?: {
      number: string
      expiryDate: Date
      type: string
    }
  }
  preferences?: {
    seatPreference?: string
    mealPreference?: string
    accommodationPreference?: string
  }
}

export interface TravelApproval {
  id: string
  approverId: string
  approverName: string
  status: TravelApprovalStatus
  requestDate: Date
  responseDate?: Date
  comments?: string
  budgetApproved?: number
  conditions?: string[]
}

export interface Trip {
  id: string
  title: string
  description?: string
  purpose: TripPurpose
  status: TripStatus

  // Dates and Duration
  startDate: Date
  endDate: Date
  duration: number // days
  timezone: string

  // Destinations
  destinations: Destination[]
  currentLocation?: string

  // Travel Details
  transportation: Transportation[]
  accommodation: Accommodation[]

  // Organization
  budget?: TravelBudget
  expenses: TravelExpense[]
  checklist: TravelChecklistItem[]

  // Integration
  relatedMeetings: string[] // Meeting IDs
  relatedContacts: string[] // Contact IDs
  relatedTasks: string[] // Task IDs

  // Collaboration
  travelers: Traveler[]
  approvals: TravelApproval[]

  // Documents and Files
  documents?: {
    id: string
    name: string
    type: string
    url: string
    uploadDate: Date
  }[]

  // Notifications and Reminders
  reminders?: {
    id: string
    title: string
    message: string
    triggerDate: Date
    type: 'booking' | 'preparation' | 'departure' | 'custom'
    sent: boolean
  }[]

  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
  tags?: string[]
  visibility: 'private' | 'team' | 'public'
}

// Travel Template for reusable trip patterns
export interface TravelTemplate {
  id: string
  name: string
  description?: string
  purpose: TripPurpose
  destinations: Omit<Destination, 'id' | 'arrivalDate' | 'departureDate'>[]
  defaultDuration: number
  checklistTemplate: Omit<TravelChecklistItem, 'id' | 'completed'>[]
  budgetTemplate?: Omit<TravelBudget, 'spentAmount' | 'remainingAmount'> & {
    spentAmount?: number
    remainingAmount?: number
  }
  tags?: string[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  usageCount: number
}

// Travel Insights and Analytics Types
export interface TravelInsights {
  totalTrips: number
  totalDays: number
  totalDistance: number
  totalSpent: number
  currency: string
  favoriteDestinations: {
    city: string
    country: string
    visitCount: number
  }[]
  travelPatterns: {
    monthlyDistribution: { month: string; trips: number }[]
    purposeDistribution: { purpose: TripPurpose; percentage: number }[]
    averageTripDuration: number
  }
  upcomingTrips: Trip[]
  recentTrips: Trip[]
}

// Search and Filter Types
export interface TravelFilters {
  status?: TripStatus[]
  purpose?: TripPurpose[]
  dateRange?: {
    start: Date
    end: Date
  }
  destinations?: string[]
  budgetRange?: {
    min: number
    max: number
  }
  travelers?: string[]
  tags?: string[]
}

export interface TravelSearchQuery {
  query?: string
  filters?: TravelFilters
  sortBy?:
    | 'startDate'
    | 'endDate'
    | 'title'
    | 'purpose'
    | 'budget'
    | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Integration Types
export interface TravelMeetingIntegration {
  createTripFromMeetings(meetingIds: string[]): Promise<Trip>
  suggestMeetingsDuringTravel(tripId: string): Promise<any[]>
  optimizeTravelItinerary(tripId: string): Promise<TravelOptimization>
  generateTravelTasks(tripId: string): Promise<any[]>
}

export interface TravelOptimization {
  suggestions: {
    type: 'route' | 'timing' | 'cost' | 'meeting'
    description: string
    impact: 'high' | 'medium' | 'low'
    savings?: {
      time?: number // minutes
      cost?: number
      distance?: number // km
    }
  }[]
  optimizedItinerary?: Destination[]
  estimatedSavings: {
    time: number
    cost: number
    distance: number
  }
}

export default Trip

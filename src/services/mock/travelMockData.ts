import {
  Trip,
  TripPurpose,
  TripStatus,
  TransportationType,
  AccommodationType,
  TravelTemplate,
  TravelApprovalStatus,
} from '../../types/travel'

// Helper function to generate random dates
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Mock data for major cities worldwide
const destinations = [
  // North America
  {
    city: 'New York',
    country: 'USA',
    region: 'North America',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'English',
  },
  {
    city: 'San Francisco',
    country: 'USA',
    region: 'North America',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    language: 'English',
  },
  {
    city: 'Toronto',
    country: 'Canada',
    region: 'North America',
    timezone: 'America/Toronto',
    currency: 'CAD',
    language: 'English',
  },
  {
    city: 'Mexico City',
    country: 'Mexico',
    region: 'North America',
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    language: 'Spanish',
  },

  // Europe
  {
    city: 'London',
    country: 'UK',
    region: 'Europe',
    timezone: 'Europe/London',
    currency: 'GBP',
    language: 'English',
  },
  {
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    language: 'French',
  },
  {
    city: 'Berlin',
    country: 'Germany',
    region: 'Europe',
    timezone: 'Europe/Berlin',
    currency: 'EUR',
    language: 'German',
  },
  {
    city: 'Amsterdam',
    country: 'Netherlands',
    region: 'Europe',
    timezone: 'Europe/Amsterdam',
    currency: 'EUR',
    language: 'Dutch',
  },
  {
    city: 'Zurich',
    country: 'Switzerland',
    region: 'Europe',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    language: 'German',
  },
  {
    city: 'Stockholm',
    country: 'Sweden',
    region: 'Europe',
    timezone: 'Europe/Stockholm',
    currency: 'SEK',
    language: 'Swedish',
  },

  // Asia
  {
    city: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'Japanese',
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    language: 'English',
  },
  {
    city: 'Hong Kong',
    country: 'Hong Kong',
    region: 'Asia',
    timezone: 'Asia/Hong_Kong',
    currency: 'HKD',
    language: 'English',
  },
  {
    city: 'Seoul',
    country: 'South Korea',
    region: 'Asia',
    timezone: 'Asia/Seoul',
    currency: 'KRW',
    language: 'Korean',
  },
  {
    city: 'Mumbai',
    country: 'India',
    region: 'Asia',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'English',
  },
  {
    city: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    language: 'Thai',
  },

  // Australia & Oceania
  {
    city: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    language: 'English',
  },
  {
    city: 'Melbourne',
    country: 'Australia',
    region: 'Oceania',
    timezone: 'Australia/Melbourne',
    currency: 'AUD',
    language: 'English',
  },

  // South America
  {
    city: 'São Paulo',
    country: 'Brazil',
    region: 'South America',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'Portuguese',
  },
  {
    city: 'Buenos Aires',
    country: 'Argentina',
    region: 'South America',
    timezone: 'America/Argentina/Buenos_Aires',
    currency: 'ARS',
    language: 'Spanish',
  },

  // Africa
  {
    city: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    language: 'English',
  },
  {
    city: 'Lagos',
    country: 'Nigeria',
    region: 'Africa',
    timezone: 'Africa/Lagos',
    currency: 'NGN',
    language: 'English',
  },

  // Middle East
  {
    city: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    language: 'Arabic',
  },
  {
    city: 'Tel Aviv',
    country: 'Israel',
    region: 'Middle East',
    timezone: 'Asia/Jerusalem',
    currency: 'ILS',
    language: 'Hebrew',
  },
]

// Sample contact IDs (these would reference existing contacts in the system)
const sampleContactIds = [
  'contact-1',
  'contact-2',
  'contact-3',
  'contact-4',
  'contact-5',
  'contact-6',
  'contact-7',
  'contact-8',
  'contact-9',
  'contact-10',
  'contact-11',
  'contact-12',
  'contact-13',
  'contact-14',
  'contact-15',
]

// Sample meeting IDs (these would reference existing meetings in the system)
const sampleMeetingIds = [
  'meeting-1',
  'meeting-2',
  'meeting-3',
  'meeting-4',
  'meeting-5',
  'meeting-6',
  'meeting-7',
  'meeting-8',
  'meeting-9',
  'meeting-10',
]

// Sample task IDs (these would reference existing tasks in the system)
const sampleTaskIds = [
  'task-1',
  'task-2',
  'task-3',
  'task-4',
  'task-5',
  'task-6',
  'task-7',
  'task-8',
  'task-9',
  'task-10',
]

// Helper to generate a mock trip
const generateTrip = (
  id: string,
  title: string,
  purpose: TripPurpose,
  status: TripStatus,
  startOffset: number, // days from now
  duration: number, // days
  destinationCount: number = 1
): Trip => {
  const startDate = addDays(new Date(), startOffset)
  const endDate = addDays(startDate, duration)

  // Select random destinations
  const selectedDestinations = destinations
    .sort(() => 0.5 - Math.random())
    .slice(0, destinationCount)
    .map((dest, index) => {
      const destDuration = Math.floor(duration / destinationCount)
      const destStartDate = addDays(startDate, index * destDuration)
      const destEndDate = addDays(destStartDate, destDuration)

      return {
        id: `dest-${id}-${index}`,
        city: dest.city,
        country: dest.country,
        region: dest.region,
        coordinates: {
          latitude: Math.random() * 180 - 90,
          longitude: Math.random() * 360 - 180,
        },
        arrivalDate: destStartDate,
        departureDate: destEndDate,
        purpose: `${purpose} activities in ${dest.city}`,
        weather: {
          temperature: { min: 15, max: 25, unit: 'celsius' as const },
          condition: 'Partly cloudy',
          precipitation: 20,
          humidity: 60,
          windSpeed: 10,
        },
        localContacts: sampleContactIds.slice(
          0,
          Math.floor(Math.random() * 3) + 1
        ),
        plannedMeetings: sampleMeetingIds.slice(
          0,
          Math.floor(Math.random() * 2) + 1
        ),
        importantInfo: {
          timezone: dest.timezone,
          currency: dest.currency,
          language: dest.language,
          emergencyNumbers: ['911', '112'],
        },
        activities: [
          {
            id: `activity-${id}-${index}-1`,
            title: 'Airport Transfer',
            startTime: destStartDate,
            location: `${dest.city} Airport`,
            category: 'transport' as const,
          },
          {
            id: `activity-${id}-${index}-2`,
            title: 'Client Meeting',
            startTime: addDays(destStartDate, 1),
            endTime: addDays(destStartDate, 1),
            location: `${dest.city} Business District`,
            category: 'meeting' as const,
            relatedContacts: sampleContactIds.slice(0, 2),
            relatedMeetings: sampleMeetingIds.slice(0, 1),
          },
        ],
      }
    })

  // Generate transportation
  const transportation = selectedDestinations.flatMap((dest, index) => {
    const transports = []

    // Flight to destination
    if (index === 0) {
      transports.push({
        id: `transport-${id}-flight-${index}`,
        type: TransportationType.FLIGHT,
        provider: ['Delta', 'United', 'American', 'Lufthansa', 'Emirates'][
          Math.floor(Math.random() * 5)
        ],
        bookingReference: `${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        departureLocation:
          index === 0 ? 'Home Airport' : selectedDestinations[index - 1].city,
        arrivalLocation: dest.city,
        departureTime: new Date(
          dest.arrivalDate.getTime() - 2 * 60 * 60 * 1000
        ), // 2 hours before arrival
        arrivalTime: dest.arrivalDate,
        duration: Math.floor(Math.random() * 480) + 120, // 2-10 hours
        cost: Math.floor(Math.random() * 1000) + 300,
        currency: 'USD',
        confirmationStatus: 'confirmed' as const,
      })
    }

    // Return flight (for last destination)
    if (index === selectedDestinations.length - 1) {
      transports.push({
        id: `transport-${id}-return-flight`,
        type: TransportationType.FLIGHT,
        provider: ['Delta', 'United', 'American', 'Lufthansa', 'Emirates'][
          Math.floor(Math.random() * 5)
        ],
        bookingReference: `${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        departureLocation: dest.city,
        arrivalLocation: 'Home Airport',
        departureTime: dest.departureDate,
        arrivalTime: new Date(
          dest.departureDate.getTime() + 8 * 60 * 60 * 1000
        ),
        duration: Math.floor(Math.random() * 480) + 120,
        cost: Math.floor(Math.random() * 1000) + 300,
        currency: 'USD',
        confirmationStatus: 'confirmed' as const,
      })
    }

    return transports
  })

  // Generate accommodation
  const accommodation = selectedDestinations.map((dest, index) => ({
    id: `accommodation-${id}-${index}`,
    type: [AccommodationType.HOTEL, AccommodationType.APARTMENT][
      Math.floor(Math.random() * 2)
    ],
    name: `${dest.city} ${Math.random() > 0.5 ? 'Business Hotel' : 'Grand Resort'}`,
    address: `${Math.floor(Math.random() * 999) + 1} Business Street, ${dest.city}`,
    checkInDate: dest.arrivalDate,
    checkOutDate: dest.departureDate,
    nights: Math.ceil(
      (dest.departureDate.getTime() - dest.arrivalDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    cost: Math.floor(Math.random() * 300) + 100,
    currency: 'USD',
    bookingReference: `HTL${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    contactInfo: {
      phone: `+${Math.floor(Math.random() * 99) + 1}-${Math.floor(Math.random() * 999999999) + 100000000}`,
      email: `reservations@${dest.city.toLowerCase()}hotel.com`,
    },
    amenities: ['WiFi', 'Gym', 'Business Center', 'Restaurant', 'Room Service'],
    confirmationStatus: 'confirmed' as const,
  }))

  // Generate budget
  const totalTransportationCost = transportation.reduce(
    (sum, t) => sum + (t.cost || 0),
    0
  )
  const totalAccommodationCost = accommodation.reduce(
    (sum, a) => sum + (a.cost || 0),
    0
  )
  const budget = {
    total: totalTransportationCost + totalAccommodationCost + 500, // Add buffer for meals, etc.
    currency: 'USD',
    breakdown: {
      transportation: totalTransportationCost,
      accommodation: totalAccommodationCost,
      meals: Math.floor(duration * 75), // $75 per day for meals
      entertainment: Math.floor(duration * 50), // $50 per day for entertainment
      business: Math.floor(duration * 25), // $25 per day for business expenses
      miscellaneous: 100,
    },
    spentAmount:
      status === TripStatus.COMPLETED
        ? totalTransportationCost +
          totalAccommodationCost +
          Math.floor(Math.random() * 300)
        : 0,
    remainingAmount: 0,
    expenseTracking: true,
  }
  budget.remainingAmount = budget.total - budget.spentAmount

  // Generate checklist based on trip type and status
  const getChecklistItems = (purpose: TripPurpose, status: TripStatus) => {
    const baseItems = [
      {
        id: `checklist-${id}-1`,
        title: 'Check passport validity (6+ months)',
        category: 'documents' as const,
        priority: 'high' as const,
        completed: status !== TripStatus.PLANNING,
      },
      {
        id: `checklist-${id}-2`,
        title: 'Book flights',
        category: 'booking' as const,
        priority: 'high' as const,
        completed: status !== TripStatus.PLANNING,
      },
      {
        id: `checklist-${id}-3`,
        title: 'Book accommodation',
        category: 'booking' as const,
        priority: 'high' as const,
        completed: status !== TripStatus.PLANNING,
      },
      {
        id: `checklist-${id}-4`,
        title: 'Travel insurance',
        category: 'documents' as const,
        priority: 'medium' as const,
        completed: status === TripStatus.COMPLETED,
      },
      {
        id: `checklist-${id}-5`,
        title: 'Pack essentials',
        category: 'packing' as const,
        priority: 'medium' as const,
        completed:
          status === TripStatus.COMPLETED || status === TripStatus.IN_PROGRESS,
      },
    ]

    if (
      purpose === TripPurpose.BUSINESS ||
      purpose === TripPurpose.CLIENT_VISIT
    ) {
      baseItems.push(
        {
          id: `checklist-${id}-business-1`,
          title: 'Prepare presentation materials',
          category: 'documents' as const,
          priority: 'high' as const,
          completed: status !== TripStatus.PLANNING,
        },
        {
          id: `checklist-${id}-business-2`,
          title: 'Schedule client meetings',
          category: 'booking' as const,
          priority: 'high' as const,
          completed: status !== TripStatus.PLANNING,
        }
      )
    }

    return baseItems
  }

  return {
    id,
    title,
    description: `${purpose} trip to ${selectedDestinations.map(d => d.city).join(', ')}`,
    purpose,
    status,
    startDate,
    endDate,
    duration,
    timezone: selectedDestinations[0]?.importantInfo?.timezone || 'UTC',
    destinations: selectedDestinations,
    transportation,
    accommodation,
    budget,
    expenses: [], // Would be populated based on budget spent amount
    checklist: getChecklistItems(purpose, status),
    relatedMeetings: sampleMeetingIds.slice(
      0,
      Math.floor(Math.random() * 3) + 1
    ),
    relatedContacts: sampleContactIds.slice(
      0,
      Math.floor(Math.random() * 5) + 2
    ),
    relatedTasks: sampleTaskIds.slice(0, Math.floor(Math.random() * 4) + 1),
    travelers: [
      {
        id: `traveler-${id}-1`,
        contactId: 'current-user',
        name: 'Current User',
        email: 'user@company.com',
        role: 'primary' as const,
        travelDocuments: {
          passport: {
            number: `P${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            expiryDate: addDays(new Date(), 365 * 2), // 2 years from now
            issuingCountry: 'USA',
          },
        },
        preferences: {
          seatPreference: 'Aisle',
          mealPreference: 'Standard',
          accommodationPreference: 'Business Hotel',
        },
      },
    ],
    approvals:
      purpose === TripPurpose.BUSINESS
        ? [
            {
              id: `approval-${id}-1`,
              approverId: 'manager-1',
              approverName: 'John Manager',
              status: TravelApprovalStatus.APPROVED,
              requestDate: addDays(startDate, -14),
              responseDate: addDays(startDate, -10),
              comments: 'Approved for business development purposes',
              budgetApproved: budget.total,
            },
          ]
        : [],
    documents: [
      {
        id: `doc-${id}-1`,
        name: 'Flight Confirmation.pdf',
        type: 'pdf',
        url: `/documents/flight-${id}.pdf`,
        uploadDate: addDays(startDate, -7),
      },
      {
        id: `doc-${id}-2`,
        name: 'Hotel Reservation.pdf',
        type: 'pdf',
        url: `/documents/hotel-${id}.pdf`,
        uploadDate: addDays(startDate, -7),
      },
    ],
    reminders: [
      {
        id: `reminder-${id}-1`,
        title: 'Check-in reminder',
        message: 'Check-in for your flight opens now',
        triggerDate: addDays(startDate, -1),
        type: 'departure' as const,
        sent:
          status === TripStatus.COMPLETED || status === TripStatus.IN_PROGRESS,
      },
      {
        id: `reminder-${id}-2`,
        title: 'Pack essentials',
        message: "Don't forget to pack your essentials for the trip",
        triggerDate: addDays(startDate, -2),
        type: 'preparation' as const,
        sent:
          status === TripStatus.COMPLETED || status === TripStatus.IN_PROGRESS,
      },
    ],
    createdBy: 'current-user',
    createdAt: addDays(startDate, -21), // Created 3 weeks before trip
    updatedAt: addDays(new Date(), -1), // Updated yesterday
    isArchived: false,
    tags: [purpose, selectedDestinations[0]?.region || 'International'],
    visibility: 'private' as const,
  }
}

// Generate 30 diverse trips
export const mockTrips: Trip[] = [
  // Upcoming trips
  generateTrip(
    'trip-001',
    'Q1 Sales Review - New York',
    TripPurpose.BUSINESS,
    TripStatus.CONFIRMED,
    7,
    3
  ),
  generateTrip(
    'trip-002',
    'Client Presentation - London',
    TripPurpose.CLIENT_VISIT,
    TripStatus.CONFIRMED,
    14,
    2
  ),
  generateTrip(
    'trip-003',
    'Tech Conference - San Francisco',
    TripPurpose.CONFERENCE,
    TripStatus.PLANNING,
    21,
    4
  ),
  generateTrip(
    'trip-004',
    'Family Vacation - Tokyo',
    TripPurpose.FAMILY,
    TripStatus.CONFIRMED,
    35,
    7
  ),
  generateTrip(
    'trip-005',
    'Training Workshop - Berlin',
    TripPurpose.TRAINING,
    TripStatus.PLANNING,
    42,
    3
  ),

  // Currently in progress
  generateTrip(
    'trip-006',
    'Business Development - Singapore',
    TripPurpose.BUSINESS,
    TripStatus.IN_PROGRESS,
    -2,
    5
  ),

  // Recently completed
  generateTrip(
    'trip-007',
    'Client Meeting - Paris',
    TripPurpose.CLIENT_VISIT,
    TripStatus.COMPLETED,
    -15,
    2
  ),
  generateTrip(
    'trip-008',
    'Team Retreat - Amsterdam',
    TripPurpose.BUSINESS,
    TripStatus.COMPLETED,
    -30,
    3
  ),
  generateTrip(
    'trip-009',
    'Product Launch - Sydney',
    TripPurpose.BUSINESS,
    TripStatus.COMPLETED,
    -45,
    4
  ),
  generateTrip(
    'trip-010',
    'Vacation - Zurich',
    TripPurpose.PERSONAL,
    TripStatus.COMPLETED,
    -60,
    5
  ),

  // Multi-destination trips
  generateTrip(
    'trip-011',
    'European Sales Tour',
    TripPurpose.BUSINESS,
    TripStatus.CONFIRMED,
    49,
    10,
    3
  ),
  generateTrip(
    'trip-012',
    'Asia-Pacific Expansion',
    TripPurpose.BUSINESS,
    TripStatus.PLANNING,
    70,
    14,
    4
  ),
  generateTrip(
    'trip-013',
    'World Conference Circuit',
    TripPurpose.CONFERENCE,
    TripStatus.CONFIRMED,
    84,
    12,
    3
  ),

  // Various other trips for diversity
  generateTrip(
    'trip-014',
    'Quarterly Review - Toronto',
    TripPurpose.BUSINESS,
    TripStatus.COMPLETED,
    -90,
    2
  ),
  generateTrip(
    'trip-015',
    'Client Onboarding - Mexico City',
    TripPurpose.CLIENT_VISIT,
    TripStatus.COMPLETED,
    -105,
    3
  ),
  generateTrip(
    'trip-016',
    'Personal Trip - Stockholm',
    TripPurpose.PERSONAL,
    TripStatus.COMPLETED,
    -120,
    6
  ),
  generateTrip(
    'trip-017',
    'Training Seminar - Hong Kong',
    TripPurpose.TRAINING,
    TripStatus.COMPLETED,
    -135,
    4
  ),
  generateTrip(
    'trip-018',
    'Industry Conference - Seoul',
    TripPurpose.CONFERENCE,
    TripStatus.COMPLETED,
    -150,
    3
  ),
  generateTrip(
    'trip-019',
    'Client Visit - Mumbai',
    TripPurpose.CLIENT_VISIT,
    TripStatus.COMPLETED,
    -165,
    2
  ),
  generateTrip(
    'trip-020',
    'Team Building - Bangkok',
    TripPurpose.BUSINESS,
    TripStatus.COMPLETED,
    -180,
    3
  ),
  generateTrip(
    'trip-021',
    'Family Holiday - Melbourne',
    TripPurpose.FAMILY,
    TripStatus.COMPLETED,
    -195,
    8
  ),
  generateTrip(
    'trip-022',
    'Business Meeting - São Paulo',
    TripPurpose.BUSINESS,
    TripStatus.COMPLETED,
    -210,
    2
  ),
  generateTrip(
    'trip-023',
    'Conference - Buenos Aires',
    TripPurpose.CONFERENCE,
    TripStatus.COMPLETED,
    -225,
    4
  ),
  generateTrip(
    'trip-024',
    'Client Workshop - Cape Town',
    TripPurpose.CLIENT_VISIT,
    TripStatus.COMPLETED,
    -240,
    3
  ),
  generateTrip(
    'trip-025',
    'Personal Trip - Lagos',
    TripPurpose.PERSONAL,
    TripStatus.COMPLETED,
    -255,
    5
  ),

  // Cancelled/Postponed trips
  generateTrip(
    'trip-026',
    'Cancelled Conference - Dubai',
    TripPurpose.CONFERENCE,
    TripStatus.CANCELLED,
    56,
    3
  ),
  generateTrip(
    'trip-027',
    'Postponed Meeting - Tel Aviv',
    TripPurpose.BUSINESS,
    TripStatus.POSTPONED,
    63,
    2
  ),

  // Long-term planning
  generateTrip(
    'trip-028',
    'Annual Planning - New York',
    TripPurpose.BUSINESS,
    TripStatus.PLANNING,
    120,
    4
  ),
  generateTrip(
    'trip-029',
    'Summer Vacation - Paris',
    TripPurpose.VACATION,
    TripStatus.PLANNING,
    150,
    10
  ),
  generateTrip(
    'trip-030',
    'Year-end Review - London',
    TripPurpose.BUSINESS,
    TripStatus.PLANNING,
    300,
    3
  ),
]

// Generate travel templates
export const mockTravelTemplates: TravelTemplate[] = [
  {
    id: 'template-001',
    name: 'Standard Business Trip',
    description: 'Template for typical 2-3 day business trips',
    purpose: TripPurpose.BUSINESS,
    destinations: [
      {
        city: '',
        country: '',
        purpose: 'Business meetings and presentations',
        importantInfo: {
          timezone: '',
          currency: '',
          language: '',
        },
      },
    ],
    defaultDuration: 3,
    checklistTemplate: [
      {
        title: 'Book flights',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Reserve hotel',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Prepare presentation materials',
        category: 'work',
        priority: 'high',
      },
      {
        title: 'Check passport validity',
        category: 'documents',
        priority: 'medium',
      },
      {
        title: 'Pack business attire',
        category: 'packing',
        priority: 'medium',
      },
    ],
    budgetTemplate: {
      total: 2000,
      currency: 'USD',
      breakdown: {
        transportation: 800,
        accommodation: 600,
        meals: 300,
        business: 200,
        entertainment: 100,
        miscellaneous: 0,
      },
      spentAmount: 0,
      remainingAmount: 2000,
      expenseTracking: true,
    },
    tags: ['business', 'standard'],
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    usageCount: 25,
  },
  {
    id: 'template-002',
    name: 'Client Visit Template',
    description: 'Template for client visits and relationship building',
    purpose: TripPurpose.CLIENT_VISIT,
    destinations: [
      {
        city: '',
        country: '',
        purpose: 'Client meetings and relationship building',
        importantInfo: {
          timezone: '',
          currency: '',
          language: '',
        },
      },
    ],
    defaultDuration: 2,
    checklistTemplate: [
      {
        title: 'Confirm meeting agenda with client',
        category: 'work',
        priority: 'high',
      },
      {
        title: 'Prepare client presentation',
        category: 'work',
        priority: 'high',
      },
      {
        title: 'Book flights',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Reserve hotel near client office',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Research local customs',
        category: 'other',
        priority: 'medium',
      },
      {
        title: 'Prepare business cards',
        category: 'work',
        priority: 'medium',
      },
    ],
    budgetTemplate: {
      total: 1500,
      currency: 'USD',
      breakdown: {
        transportation: 600,
        accommodation: 400,
        meals: 300,
        business: 150,
        entertainment: 50,
        miscellaneous: 0,
      },
      spentAmount: 0,
      remainingAmount: 1500,
      expenseTracking: true,
    },
    tags: ['client', 'business'],
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    usageCount: 18,
  },
  {
    id: 'template-003',
    name: 'Conference Attendance',
    description: 'Template for attending conferences and industry events',
    purpose: TripPurpose.CONFERENCE,
    destinations: [
      {
        city: '',
        country: '',
        purpose: 'Conference attendance and networking',
        importantInfo: {
          timezone: '',
          currency: '',
          language: '',
        },
      },
    ],
    defaultDuration: 4,
    checklistTemplate: [
      {
        title: 'Register for conference',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Book flights',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Reserve hotel',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Plan networking activities',
        category: 'work',
        priority: 'medium',
      },
      {
        title: 'Prepare business cards',
        category: 'work',
        priority: 'medium',
      },
      {
        title: 'Download conference app',
        category: 'other',
        priority: 'low',
      },
    ],
    budgetTemplate: {
      total: 2500,
      currency: 'USD',
      breakdown: {
        transportation: 800,
        accommodation: 800,
        meals: 400,
        business: 300,
        entertainment: 200,
        miscellaneous: 0,
      },
      spentAmount: 0,
      remainingAmount: 2500,
      expenseTracking: true,
    },
    tags: ['conference', 'networking'],
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    usageCount: 12,
  },
  {
    id: 'template-004',
    name: 'Training Workshop',
    description: 'Template for attending training workshops and seminars',
    purpose: TripPurpose.TRAINING,
    destinations: [
      {
        city: '',
        country: '',
        purpose: 'Training and skill development',
        importantInfo: {
          timezone: '',
          currency: '',
          language: '',
        },
      },
    ],
    defaultDuration: 3,
    checklistTemplate: [
      {
        title: 'Complete pre-training materials',
        category: 'work',
        priority: 'high',
      },
      {
        title: 'Book flights',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Reserve accommodation',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Prepare notebook and materials',
        category: 'packing',
        priority: 'medium',
      },
      {
        title: 'Inform team of absence',
        category: 'work',
        priority: 'medium',
      },
    ],
    budgetTemplate: {
      total: 1800,
      currency: 'USD',
      breakdown: {
        transportation: 600,
        accommodation: 500,
        meals: 300,
        business: 300,
        entertainment: 100,
        miscellaneous: 0,
      },
      spentAmount: 0,
      remainingAmount: 1800,
      expenseTracking: true,
    },
    tags: ['training', 'development'],
    isPublic: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    usageCount: 8,
  },
  {
    id: 'template-005',
    name: 'Personal Vacation',
    description: 'Template for personal vacation trips',
    purpose: TripPurpose.PERSONAL,
    destinations: [
      {
        city: '',
        country: '',
        purpose: 'Leisure and relaxation',
        importantInfo: {
          timezone: '',
          currency: '',
          language: '',
        },
      },
    ],
    defaultDuration: 7,
    checklistTemplate: [
      {
        title: 'Check passport and visa requirements',
        category: 'documents',
        priority: 'high',
      },
      {
        title: 'Book flights',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Reserve accommodation',
        category: 'booking',
        priority: 'high',
      },
      {
        title: 'Get travel insurance',
        category: 'documents',
        priority: 'medium',
      },
      {
        title: 'Pack vacation clothes',
        category: 'packing',
        priority: 'medium',
      },
      {
        title: 'Research local attractions',
        category: 'other',
        priority: 'low',
      },
      {
        title: 'Set up out-of-office message',
        category: 'work',
        priority: 'medium',
      },
    ],
    budgetTemplate: {
      total: 3000,
      currency: 'USD',
      breakdown: {
        transportation: 1000,
        accommodation: 1200,
        meals: 500,
        entertainment: 300,
        business: 0,
        miscellaneous: 0,
      },
      spentAmount: 0,
      remainingAmount: 3000,
      expenseTracking: false,
    },
    tags: ['vacation', 'personal'],
    isPublic: false,
    createdBy: 'current-user',
    createdAt: new Date('2024-02-01'),
    usageCount: 3,
  },
]

export default {
  trips: mockTrips,
  templates: mockTravelTemplates,
}

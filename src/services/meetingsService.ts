import {
  Meeting,
  MeetingFormData,
  MeetingTemplate,
  MeetingStats,
  ActionItem,
  MeetingAvailability,
  MeetingType,
  MeetingStatus,
  MeetingPriority,
  MeetingLocation,
} from '../types/meeting'
import { Contact } from '../types/contact'
import { contactsService } from './contactsService'

// Mock data generation utilities
const generateMeetingId = () =>
  `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
const generateActionItemId = () =>
  `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
const generateTemplateId = () =>
  `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Helper function to get random items from array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Helper function to generate random date in range
const getRandomDateInRange = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

// Mock meeting locations
const mockLocations: MeetingLocation[] = [
  {
    type: 'physical',
    address: '123 Business St, Suite 400',
    room: 'Conference Room A',
  },
  { type: 'physical', address: '456 Corporate Ave', room: 'Boardroom' },
  {
    type: 'virtual',
    virtualUrl: 'https://zoom.us/j/123456789',
    platform: 'zoom',
  },
  {
    type: 'virtual',
    virtualUrl: 'https://teams.microsoft.com/l/meetup-join/123',
    platform: 'teams',
  },
  {
    type: 'virtual',
    virtualUrl: 'https://meet.google.com/abc-defg-hij',
    platform: 'meet',
  },
  {
    type: 'hybrid',
    address: '789 Innovation Blvd',
    room: 'Innovation Lab',
    virtualUrl: 'https://zoom.us/j/987654321',
    platform: 'zoom',
  },
]

// Mock meeting titles and types
const meetingTitles: Record<MeetingType, string[]> = {
  one_on_one: [
    'Weekly 1:1 with Manager',
    'Career Development Discussion',
    'Project Status Check-in',
    'Performance Review',
    'Mentoring Session',
  ],
  team_meeting: [
    'Weekly Team Standup',
    'Sprint Planning',
    'Team Retrospective',
    'All Hands Meeting',
    'Department Sync',
  ],
  client_meeting: [
    'Client Proposal Presentation',
    'Project Kickoff Meeting',
    'Client Check-in',
    'Contract Review',
    'Solution Demo',
  ],
  interview: [
    'Technical Interview',
    'Behavioral Interview',
    'Final Round Interview',
    'Panel Interview',
    'Initial Screening',
  ],
  presentation: [
    'Quarterly Business Review',
    'Product Roadmap Presentation',
    'Training Session',
    'Knowledge Sharing',
    'Demo Day',
  ],
  standup: [
    'Daily Standup',
    'Morning Sync',
    'Team Check-in',
    'Progress Update',
    'Blockers Discussion',
  ],
  review: [
    'Code Review Session',
    'Design Review',
    'Architecture Review',
    'Process Review',
    'Security Review',
  ],
  planning: [
    'Sprint Planning',
    'Quarterly Planning',
    'Project Planning',
    'Resource Planning',
    'Strategic Planning',
  ],
  training: [
    'Onboarding Session',
    'Skill Development Workshop',
    'Compliance Training',
    'Tool Training',
    'Best Practices Session',
  ],
  other: [
    'Coffee Chat',
    'Team Building',
    'Brainstorming Session',
    'Workshop',
    'Committee Meeting',
  ],
}

// Tags for meetings
const meetingTags = [
  'urgent',
  'important',
  'recurring',
  'client-facing',
  'internal',
  'planning',
  'review',
  'training',
  'decision-making',
  'update',
  'project-alpha',
  'project-beta',
  'q1-goals',
  'q2-goals',
  'engineering',
  'marketing',
  'sales',
  'finance',
  'hr',
]

class MeetingsService {
  private meetings: Meeting[] = []
  private templates: MeetingTemplate[] = []
  private actionItems: ActionItem[] = []
  private contacts: Contact[] = []

  constructor() {
    this.initializeMockData()
  }

  private async initializeMockData() {
    // Get contacts for relationships
    try {
      this.contacts = await contactsService.getContacts()
    } catch {
      this.contacts = []
    }

    this.generateMockMeetings()
    this.generateMockTemplates()
    this.generateMockActionItems()
  }

  private generateMockMeetings() {
    const types: MeetingType[] = [
      'one_on_one',
      'team_meeting',
      'client_meeting',
      'interview',
      'presentation',
      'standup',
      'review',
      'planning',
      'training',
      'other',
    ]
    const priorities: MeetingPriority[] = ['low', 'medium', 'high', 'urgent']

    // Generate meetings for the past 3 months and next 3 months
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 3)

    const now = new Date()

    for (let i = 0; i < 150; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      const startTime = getRandomDateInRange(startDate, endDate)
      const duration = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)]
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

      // Determine status based on date
      let status: MeetingStatus = 'scheduled'
      if (startTime < now) {
        if (endTime < now) {
          status = Math.random() < 0.9 ? 'completed' : 'cancelled'
        } else {
          status = 'in_progress'
        }
      }

      const attendees = getRandomItems(
        this.contacts,
        Math.floor(Math.random() * 5) + 1
      )
      const location =
        mockLocations[Math.floor(Math.random() * mockLocations.length)]
      const priority = priorities[Math.floor(Math.random() * priorities.length)]
      const tags = getRandomItems(
        meetingTags,
        Math.floor(Math.random() * 3) + 1
      )
      const titles = meetingTitles[type]
      const title = titles[Math.floor(Math.random() * titles.length)]

      const meeting: Meeting = {
        id: generateMeetingId(),
        title,
        description: `${title} - Discussion and planning session with key stakeholders.`,
        startTime,
        endTime,
        attendees,
        organizer: this.contacts[0]?.id || 'user-1',
        location,
        type,
        priority,
        status,
        recurrence:
          Math.random() < 0.3
            ? {
                type: 'weekly',
                interval: 1,
                daysOfWeek: [startTime.getDay()],
                endDate: new Date(
                  startTime.getTime() + 3 * 30 * 24 * 60 * 60 * 1000
                ),
              }
            : undefined,
        preparation: {
          agenda: [
            {
              id: `agenda_${i}_1`,
              title: 'Welcome & Introductions',
              description: 'Brief introductions and agenda overview',
              duration: 10,
              presenter: attendees[0]?.id || 'user-1',
              type: 'discussion',
              order: 1,
            },
            {
              id: `agenda_${i}_2`,
              title: 'Main Discussion',
              description: 'Core meeting content and decision making',
              duration: duration - 20,
              presenter: attendees[0]?.id || 'user-1',
              type: 'discussion',
              order: 2,
            },
            {
              id: `agenda_${i}_3`,
              title: 'Action Items & Next Steps',
              description: 'Assign action items and plan follow-ups',
              duration: 10,
              presenter: attendees[0]?.id || 'user-1',
              type: 'decision',
              order: 3,
            },
          ],
          documents: [],
          checklist: [
            {
              id: `check_${i}_1`,
              title: 'Prepare presentation materials',
              completed: status !== 'scheduled',
              assignedTo: attendees[0]?.id || 'user-1',
            },
            {
              id: `check_${i}_2`,
              title: 'Send calendar invites',
              completed: true,
              assignedTo: attendees[0]?.id || 'user-1',
            },
          ],
        },
        notes:
          status === 'completed'
            ? [
                {
                  id: `note_${i}_1`,
                  content:
                    'Great discussion about project progress. Team is aligned on next steps.',
                  author: attendees[0]?.id || 'user-1',
                  timestamp: new Date(startTime.getTime() + 15 * 60 * 1000),
                  isPrivate: false,
                  tags: ['summary'],
                },
              ]
            : [],
        outcomes:
          status === 'completed'
            ? [
                {
                  id: `outcome_${i}_1`,
                  type: 'decision',
                  content: 'Approved budget increase for Q2',
                  priority: 'high',
                },
                {
                  id: `outcome_${i}_2`,
                  type: 'action_item',
                  content: 'Schedule follow-up meeting with stakeholders',
                  assignedTo: attendees[1]?.id || 'user-1',
                  dueDate: new Date(
                    endTime.getTime() + 7 * 24 * 60 * 60 * 1000
                  ),
                  priority: 'medium',
                },
              ]
            : [],
        actionItems:
          status === 'completed'
            ? [
                {
                  id: generateActionItemId(),
                  title: 'Follow up on budget approval',
                  description: 'Get final sign-off from finance team',
                  assignedTo: attendees[0]?.id || 'user-1',
                  dueDate: new Date(
                    endTime.getTime() + 3 * 24 * 60 * 60 * 1000
                  ),
                  priority: 'high',
                  status: Math.random() < 0.7 ? 'completed' : 'pending',
                  createdAt: endTime,
                  meetingId: generateMeetingId(),
                },
              ]
            : [],
        tags,
        isPrivate: Math.random() < 0.2,
        allowGuestInvites: Math.random() < 0.8,
        requiresApproval: Math.random() < 0.3,
        maxAttendees: Math.random() < 0.5 ? undefined : 10,
        reminderMinutes: [15, 60],
        createdAt: new Date(startTime.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(startTime.getTime() - 24 * 60 * 60 * 1000),
        createdBy: this.contacts[0]?.id || 'user-1',
        lastModifiedBy: this.contacts[0]?.id || 'user-1',
        duration,
        timezone: 'America/New_York',
      }

      this.meetings.push(meeting)
    }

    // Sort meetings by start time
    this.meetings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  private generateMockTemplates() {
    const templateTypes: {
      type: MeetingType
      name: string
      description: string
    }[] = [
      {
        type: 'one_on_one',
        name: '1:1 Meeting Template',
        description: 'Standard template for one-on-one meetings',
      },
      {
        type: 'team_meeting',
        name: 'Team Standup Template',
        description: 'Daily/weekly team synchronization',
      },
      {
        type: 'client_meeting',
        name: 'Client Check-in Template',
        description: 'Regular client status meetings',
      },
      {
        type: 'interview',
        name: 'Technical Interview Template',
        description: 'Structured technical interview process',
      },
      {
        type: 'presentation',
        name: 'Project Demo Template',
        description: 'Product demonstration meetings',
      },
      {
        type: 'review',
        name: 'Code Review Template',
        description: 'Code review and feedback sessions',
      },
      {
        type: 'planning',
        name: 'Sprint Planning Template',
        description: 'Agile sprint planning meetings',
      },
    ]

    templateTypes.forEach(template => {
      this.templates.push({
        id: generateTemplateId(),
        name: template.name,
        description: template.description,
        type: template.type,
        defaultDuration:
          template.type === 'standup'
            ? 15
            : template.type === 'interview'
              ? 60
              : 30,
        defaultLocation: mockLocations[0],
        defaultAgenda: [
          {
            title: 'Opening & Welcome',
            description: 'Meeting introduction and agenda review',
            duration: 5,
            presenter: 'organizer',
            type: 'discussion',
            order: 1,
          },
          {
            title: 'Main Discussion',
            description: 'Core meeting content',
            duration:
              template.type === 'standup'
                ? 8
                : template.type === 'interview'
                  ? 45
                  : 20,
            presenter: 'organizer',
            type: 'discussion',
            order: 2,
          },
          {
            title: 'Action Items & Wrap-up',
            description: 'Summary and next steps',
            duration: template.type === 'standup' ? 2 : 5,
            presenter: 'organizer',
            type: 'decision',
            order: 3,
          },
        ],
        defaultChecklist: [
          {
            title: 'Prepare agenda',
            assignedTo: 'organizer',
          },
          {
            title: 'Send calendar invites',
            assignedTo: 'organizer',
          },
          {
            title: 'Book meeting room',
            assignedTo: 'organizer',
          },
        ],
        defaultAttendees: [],
        tags: [template.type, 'template'],
        isPublic: true,
        createdBy: 'admin',
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        usageCount: Math.floor(Math.random() * 50),
      })
    })
  }

  private generateMockActionItems() {
    // Generate action items from completed meetings
    const completedMeetings = this.meetings.filter(
      m => m.status === 'completed'
    )

    completedMeetings.forEach(meeting => {
      const numActionItems = Math.floor(Math.random() * 3) + 1

      for (let i = 0; i < numActionItems; i++) {
        const actionItem: ActionItem = {
          id: generateActionItemId(),
          title: `Follow up on ${meeting.title} - Item ${i + 1}`,
          description: `Action item generated from meeting: ${meeting.title}`,
          assignedTo:
            meeting.attendees[
              Math.floor(Math.random() * meeting.attendees.length)
            ]?.id || 'user-1',
          dueDate: new Date(
            meeting.endTime.getTime() +
              (Math.random() * 14 + 1) * 24 * 60 * 60 * 1000
          ),
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as
            | 'low'
            | 'medium'
            | 'high',
          status:
            Math.random() < 0.6
              ? 'completed'
              : Math.random() < 0.3
                ? 'in_progress'
                : 'pending',
          createdAt: meeting.endTime,
          completedAt:
            Math.random() < 0.6
              ? new Date(
                  meeting.endTime.getTime() +
                    Math.random() * 7 * 24 * 60 * 60 * 1000
                )
              : undefined,
          meetingId: meeting.id,
        }

        this.actionItems.push(actionItem)
      }
    })
  }

  // Service methods
  async getMeetings(): Promise<Meeting[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...this.meetings]
  }

  async getMeetingById(id: string): Promise<Meeting | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return this.meetings.find(m => m.id === id) || null
  }

  async createMeeting(meetingData: MeetingFormData): Promise<Meeting> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const attendees = this.contacts.filter(c =>
      meetingData.attendees.includes(c.id)
    )

    const newMeeting: Meeting = {
      id: generateMeetingId(),
      title: meetingData.title,
      description: meetingData.description,
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      attendees,
      organizer: this.contacts[0]?.id || 'user-1',
      location: meetingData.location,
      type: meetingData.type,
      priority: meetingData.priority,
      status: 'scheduled',
      recurrence: meetingData.recurrence,
      preparation: {
        agenda: meetingData.agenda.map((item, index) => ({
          ...item,
          id: `agenda_${Date.now()}_${index}`,
        })),
        documents: [],
        checklist: meetingData.checklist.map((item, index) => ({
          ...item,
          id: `check_${Date.now()}_${index}`,
          completed: false,
        })),
      },
      notes: [],
      outcomes: [],
      actionItems: [],
      tags: meetingData.tags,
      isPrivate: meetingData.isPrivate,
      allowGuestInvites: meetingData.allowGuestInvites,
      requiresApproval: meetingData.requiresApproval,
      maxAttendees: meetingData.maxAttendees,
      reminderMinutes: meetingData.reminderMinutes,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.contacts[0]?.id || 'user-1',
      lastModifiedBy: this.contacts[0]?.id || 'user-1',
      duration: Math.floor(
        (meetingData.endTime.getTime() - meetingData.startTime.getTime()) /
          (1000 * 60)
      ),
      timezone: meetingData.timezone,
    }

    this.meetings.push(newMeeting)
    this.meetings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

    return newMeeting
  }

  async updateMeeting(
    id: string,
    updates: Partial<MeetingFormData>
  ): Promise<Meeting> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const meetingIndex = this.meetings.findIndex(m => m.id === id)
    if (meetingIndex === -1) {
      throw new Error('Meeting not found')
    }

    const currentMeeting = this.meetings[meetingIndex]

    const updatedMeeting: Meeting = {
      ...currentMeeting,
      ...updates,
      updatedAt: new Date(),
      lastModifiedBy: this.contacts[0]?.id || 'user-1',
      attendees: updates.attendees
        ? updates.attendees
            .map(id => this.contacts.find(c => c.id === id)!)
            .filter(Boolean)
        : currentMeeting.attendees,
    }

    if (updates.startTime && updates.endTime) {
      updatedMeeting.duration = Math.floor(
        (updates.endTime.getTime() - updates.startTime.getTime()) / (1000 * 60)
      )
    }

    this.meetings[meetingIndex] = updatedMeeting
    return updatedMeeting
  }

  async deleteMeeting(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))

    this.meetings = this.meetings.filter(m => m.id !== id)
    this.actionItems = this.actionItems.filter(a => a.meetingId !== id)
  }

  async getTemplates(): Promise<MeetingTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...this.templates]
  }

  async createTemplate(
    templateData: Omit<MeetingTemplate, 'id' | 'createdAt' | 'usageCount'>
  ): Promise<MeetingTemplate> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const newTemplate: MeetingTemplate = {
      ...templateData,
      id: generateTemplateId(),
      createdAt: new Date(),
      usageCount: 0,
    }

    this.templates.push(newTemplate)
    return newTemplate
  }

  async getActionItems(): Promise<ActionItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...this.actionItems]
  }

  async createActionItem(
    meetingId: string,
    actionItemData: Omit<ActionItem, 'id' | 'createdAt' | 'meetingId'>
  ): Promise<ActionItem> {
    await new Promise(resolve => setTimeout(resolve, 150))

    const newActionItem: ActionItem = {
      ...actionItemData,
      id: generateActionItemId(),
      meetingId,
      createdAt: new Date(),
    }

    this.actionItems.push(newActionItem)

    // Also add to the meeting's action items
    const meeting = this.meetings.find(m => m.id === meetingId)
    if (meeting) {
      meeting.actionItems.push(newActionItem)
    }

    return newActionItem
  }

  async updateActionItem(
    id: string,
    updates: Partial<ActionItem>
  ): Promise<ActionItem> {
    await new Promise(resolve => setTimeout(resolve, 150))

    const itemIndex = this.actionItems.findIndex(a => a.id === id)
    if (itemIndex === -1) {
      throw new Error('Action item not found')
    }

    const updatedItem = {
      ...this.actionItems[itemIndex],
      ...updates,
    }

    this.actionItems[itemIndex] = updatedItem

    // Also update in the meeting's action items
    const meeting = this.meetings.find(m => m.id === updatedItem.meetingId)
    if (meeting) {
      const meetingItemIndex = meeting.actionItems.findIndex(a => a.id === id)
      if (meetingItemIndex !== -1) {
        meeting.actionItems[meetingItemIndex] = updatedItem
      }
    }

    return updatedItem
  }

  async getMeetingStats(): Promise<MeetingStats> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const now = new Date()
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay())
    thisWeekStart.setHours(0, 0, 0, 0)

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalMeetings = this.meetings.length
    const scheduledMeetings = this.meetings.filter(
      m => m.status === 'scheduled'
    ).length
    const completedMeetings = this.meetings.filter(
      m => m.status === 'completed'
    ).length
    const cancelledMeetings = this.meetings.filter(
      m => m.status === 'cancelled'
    ).length

    const totalDuration = this.meetings.reduce((sum, m) => sum + m.duration, 0)
    const averageDuration =
      totalMeetings > 0 ? totalDuration / totalMeetings : 0

    const upcomingMeetings = this.meetings.filter(
      m => m.startTime > now && m.status === 'scheduled'
    ).length
    const overdueActionItems = this.actionItems.filter(
      a => a.dueDate && a.dueDate < now && a.status !== 'completed'
    ).length
    const completedActionItems = this.actionItems.filter(
      a => a.status === 'completed'
    ).length

    const meetingsThisWeek = this.meetings.filter(
      m =>
        m.startTime >= thisWeekStart &&
        m.startTime <
          new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).length
    const meetingsThisMonth = this.meetings.filter(
      m => m.startTime >= thisMonthStart
    ).length

    const totalAttendees = this.meetings.reduce(
      (sum, m) => sum + m.attendees.length,
      0
    )
    const averageAttendeesPerMeeting =
      totalMeetings > 0 ? totalAttendees / totalMeetings : 0

    const sortedByDuration = [...this.meetings].sort(
      (a, b) => b.duration - a.duration
    )
    const longestMeeting = sortedByDuration[0]
      ? { id: sortedByDuration[0].id, duration: sortedByDuration[0].duration }
      : { id: '', duration: 0 }
    const shortestMeeting = sortedByDuration[sortedByDuration.length - 1]
      ? {
          id: sortedByDuration[sortedByDuration.length - 1].id,
          duration: sortedByDuration[sortedByDuration.length - 1].duration,
        }
      : { id: '', duration: 0 }

    return {
      totalMeetings,
      scheduledMeetings,
      completedMeetings,
      cancelledMeetings,
      averageDuration,
      totalMeetingTime: totalDuration,
      meetingsByType: Object.entries(
        this.meetings.reduce(
          (acc, m) => {
            acc[m.type] = (acc[m.type] || 0) + 1
            return acc
          },
          {} as Record<MeetingType, number>
        )
      ).map(([type, count]) => ({ type: type as MeetingType, count })),
      meetingsByStatus: Object.entries(
        this.meetings.reduce(
          (acc, m) => {
            acc[m.status] = (acc[m.status] || 0) + 1
            return acc
          },
          {} as Record<MeetingStatus, number>
        )
      ).map(([status, count]) => ({ status: status as MeetingStatus, count })),
      meetingsByPriority: Object.entries(
        this.meetings.reduce(
          (acc, m) => {
            acc[m.priority] = (acc[m.priority] || 0) + 1
            return acc
          },
          {} as Record<MeetingPriority, number>
        )
      ).map(([priority, count]) => ({
        priority: priority as MeetingPriority,
        count,
      })),
      topAttendees: Object.entries(
        this.meetings.reduce(
          (acc, m) => {
            m.attendees.forEach(attendee => {
              const key = attendee.id
              acc[key] = {
                contactId: attendee.id,
                name: `${attendee.firstName} ${attendee.lastName}`,
                count: (acc[key]?.count || 0) + 1,
              }
            })
            return acc
          },
          {} as Record<
            string,
            { contactId: string; name: string; count: number }
          >
        )
      )
        .map(([, value]) => value)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      upcomingMeetings,
      overdueActionItems,
      completedActionItems,
      meetingsThisWeek,
      meetingsThisMonth,
      averageAttendeesPerMeeting,
      mostCommonMeetingTimes: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: this.meetings.filter(m => m.startTime.getHours() === hour)
          .length,
      }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      longestMeeting,
      shortestMeeting,
      productivityScore: Math.min(
        100,
        Math.max(
          0,
          (completedActionItems / Math.max(1, this.actionItems.length)) * 100
        )
      ),
    }
  }

  async checkAttendeeAvailability(
    attendeeIds: string[],
    startTime: Date,
    endTime: Date
  ): Promise<MeetingAvailability[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return attendeeIds.map(attendeeId => {
      const conflicts = this.meetings
        .filter(
          m =>
            m.status !== 'cancelled' &&
            m.attendees.some(a => a.id === attendeeId) &&
            ((startTime >= m.startTime && startTime < m.endTime) ||
              (endTime > m.startTime && endTime <= m.endTime) ||
              (startTime <= m.startTime && endTime >= m.endTime))
        )
        .map(m => ({
          meetingId: m.id,
          attendeeId,
          conflictStart: new Date(
            Math.max(startTime.getTime(), m.startTime.getTime())
          ),
          conflictEnd: new Date(
            Math.min(endTime.getTime(), m.endTime.getTime())
          ),
          severity: 'overlap' as const,
        }))

      // Generate suggested alternative times
      const suggestedTimes: Date[] = []
      const baseDate = new Date(startTime)
      baseDate.setMinutes(0, 0, 0)

      for (let i = 0; i < 5; i++) {
        const suggestionStart = new Date(
          baseDate.getTime() + (i + 1) * 60 * 60 * 1000
        )
        const suggestionEnd = new Date(
          suggestionStart.getTime() + (endTime.getTime() - startTime.getTime())
        )

        const hasConflict = this.meetings.some(
          m =>
            m.status !== 'cancelled' &&
            m.attendees.some(a => a.id === attendeeId) &&
            ((suggestionStart >= m.startTime && suggestionStart < m.endTime) ||
              (suggestionEnd > m.startTime && suggestionEnd <= m.endTime))
        )

        if (!hasConflict) {
          suggestedTimes.push(suggestionStart)
        }
      }

      return {
        contactId: attendeeId,
        isAvailable: conflicts.length === 0,
        conflicts,
        suggestedTimes,
      }
    })
  }
}

export const meetingsService = new MeetingsService()

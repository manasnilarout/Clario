import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Button,
  AvatarGroup,
  Skeleton,
  styled,
  alpha,
} from '@mui/material'
import {
  Event,
  VideoCall,
  LocationOn,
  Add,
  ChevronRight,
  CalendarToday,
  Notifications,
} from '@mui/icons-material'
// Note: Using native Date methods instead of date-fns for now
// import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns'
import { useNavigate } from 'react-router-dom'

// Event interface
export interface UpcomingEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: 'meeting' | 'call' | 'event' | 'reminder' | 'travel'
  location?: string
  isVirtual?: boolean
  attendees?: Array<{
    id: string
    name: string
    avatar?: string
    status?: 'accepted' | 'declined' | 'pending'
  }>
  priority?: 'low' | 'medium' | 'high'
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  reminders?: boolean
  color?: string
  organizer?: {
    name: string
    avatar?: string
  }
}

// Styled Components
const EventItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  minHeight: 'auto',
  marginBottom: theme.spacing(1.5),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'currentColor',
  },
}))

const TimeSlot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 70,
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
  flexShrink: 0,
}))

const EventTypeIcon = styled(Box)<{ type: string }>(({ theme, type }) => {
  const getColor = () => {
    switch (type) {
      case 'meeting':
        return theme.palette.primary.main
      case 'call':
        return theme.palette.secondary.main
      case 'event':
        return theme.palette.success.main
      case 'reminder':
        return theme.palette.warning.main
      case 'travel':
        return theme.palette.error.main
      default:
        return theme.palette.grey[500]
    }
  }

  return {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(getColor(), 0.1),
    color: getColor(),
    fontSize: 16,
  }
})

// Mock data generator
const generateMockEvents = (): UpcomingEvent[] => {
  const now = new Date()

  return [
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily team sync and updates',
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
      type: 'meeting',
      isVirtual: true,
      attendees: [
        { id: '1', name: 'Sarah Johnson', status: 'accepted' },
        { id: '2', name: 'Mike Chen', status: 'accepted' },
        { id: '3', name: 'Emily Davis', status: 'pending' },
      ],
      priority: 'medium',
      status: 'scheduled',
      reminders: true,
      color: '#1976d2',
    },
    {
      id: '2',
      title: 'Client Presentation',
      description: 'Q4 results presentation to ABC Corp',
      startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
      endTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      type: 'meeting',
      location: 'Conference Room A',
      attendees: [
        { id: '4', name: 'John Smith', status: 'accepted' },
        { id: '5', name: 'Lisa Wong', status: 'accepted' },
      ],
      priority: 'high',
      status: 'scheduled',
      reminders: true,
      color: '#d32f2f',
      organizer: { name: 'John Doe' },
    },
    {
      id: '3',
      title: 'Doctor Appointment',
      description: 'Annual checkup with Dr. Martinez',
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
      type: 'reminder',
      location: 'City Medical Center, Suite 205',
      priority: 'high',
      status: 'scheduled',
      reminders: true,
      color: '#ed6c02',
    },
    {
      id: '4',
      title: 'Code Review Session',
      description:
        'Review new feature implementation and discuss technical debt',
      startTime: new Date(now.getTime() + 26 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 27 * 60 * 60 * 1000),
      type: 'meeting',
      isVirtual: true,
      attendees: [
        { id: '6', name: 'Alex Brown', status: 'accepted' },
        { id: '7', name: 'Maya Patel', status: 'accepted' },
        { id: '8', name: 'David Kim', status: 'pending' },
      ],
      priority: 'medium',
      status: 'scheduled',
      reminders: false,
      color: '#2e7d32',
    },
    {
      id: '5',
      title: 'Flight to San Francisco',
      description: 'Business trip departure - Gate B12',
      startTime: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(now.getTime() + 75 * 60 * 60 * 1000),
      type: 'travel',
      location: 'LAX Terminal 2',
      priority: 'high',
      status: 'scheduled',
      reminders: true,
      color: '#7b1fa2',
    },
    {
      id: '6',
      title: 'Product Demo',
      description: 'Demonstrate new features to stakeholders',
      startTime: new Date(now.getTime() + 76 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 77.5 * 60 * 60 * 1000),
      type: 'meeting',
      isVirtual: true,
      attendees: [
        { id: '9', name: 'Rachel Green', status: 'accepted' },
        { id: '10', name: 'Tom Wilson', status: 'accepted' },
      ],
      priority: 'high',
      status: 'scheduled',
      reminders: true,
      color: '#1976d2',
    },
    {
      id: '7',
      title: 'Team Lunch',
      description: 'Monthly team building lunch at Downtown Bistro',
      startTime: new Date(now.getTime() + 96 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 98 * 60 * 60 * 1000),
      type: 'event',
      location: 'Downtown Bistro, Main St',
      attendees: [
        { id: '11', name: 'Jennifer Lee', status: 'accepted' },
        { id: '12', name: 'Mark Johnson', status: 'accepted' },
        { id: '13', name: 'Anna Chen', status: 'pending' },
      ],
      priority: 'low',
      status: 'scheduled',
      reminders: false,
      color: '#f57c00',
    },
    {
      id: '8',
      title: 'Board Meeting',
      description: 'Quarterly board meeting - financial review',
      startTime: new Date(now.getTime() + 120 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 123 * 60 * 60 * 1000),
      type: 'meeting',
      location: 'Boardroom, 15th Floor',
      attendees: [
        { id: '14', name: 'Robert Smith', status: 'accepted' },
        { id: '15', name: 'Lisa Brown', status: 'accepted' },
      ],
      priority: 'high',
      status: 'scheduled',
      reminders: true,
      color: '#d32f2f',
    },
  ]
}

// Event type icons
const getEventIcon = (type: string, isVirtual?: boolean) => {
  switch (type) {
    case 'meeting':
      return isVirtual ? <VideoCall /> : <Event />
    case 'call':
      return <VideoCall />
    case 'event':
      return <CalendarToday />
    case 'reminder':
      return <Notifications />
    case 'travel':
      return <LocationOn />
    default:
      return <Event />
  }
}

// Time formatting helpers
const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isTomorrow = (date: Date) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

const isThisWeek = (date: Date) => {
  const today = new Date()
  const oneWeekFromToday = new Date()
  oneWeekFromToday.setDate(today.getDate() + 7)
  return date >= today && date <= oneWeekFromToday
}

const format = (date: Date, formatStr: string) => {
  switch (formatStr) {
    case 'HH:mm':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    case 'EEEE':
      return date.toLocaleDateString('en-US', { weekday: 'long' })
    case 'MMM d':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    default:
      return date.toLocaleDateString()
  }
}

const getTimeLabel = (date: Date) => {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isThisWeek(date)) return format(date, 'EEEE')
  return format(date, 'MMM d')
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
    default:
      return 'default'
  }
}

// Individual Event Component
interface EventItemProps {
  event: UpcomingEvent
  onClick?: (event: UpcomingEvent) => void
  compact?: boolean
}

const EventItemComponent: React.FC<EventItemProps> = ({
  event,
  onClick,
  compact = false,
}) => {
  const timeLabel = getTimeLabel(event.startTime)
  const startTime = format(event.startTime, 'HH:mm')
  const endTime = format(event.endTime, 'HH:mm')

  return (
    <EventItem
      onClick={() => onClick?.(event)}
      sx={{
        color: event.color || 'inherit',
        py: compact ? 1.5 : 2,
        minHeight: compact ? 'auto' : 80,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <TimeSlot>
          <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {startTime}
          </Typography>
          <Typography
            variant="caption"
            sx={{ opacity: 0.8, fontSize: '0.7rem' }}
          >
            {timeLabel}
          </Typography>
        </TimeSlot>

        <EventTypeIcon type={event.type}>
          {getEventIcon(event.type, event.isVirtual)}
        </EventTypeIcon>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                flex: 1,
                minWidth: 0,
                pr: 1,
              }}
              noWrap
            >
              {event.title}
            </Typography>
            {event.priority && (
              <Chip
                size="small"
                label={event.priority}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: getPriorityColor(event.priority),
                  color: 'white',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              />
            )}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.description}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: 1,
                minWidth: 0,
              }}
            >
              {(event.location || event.isVirtual) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {event.isVirtual ? (
                    <VideoCall fontSize="small" />
                  ) : (
                    <LocationOn fontSize="small" />
                  )}
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {event.isVirtual ? 'Virtual' : event.location}
                  </Typography>
                </Box>
              )}

              <Typography variant="caption" color="text.secondary">
                {startTime} - {endTime}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
              }}
            >
              {event.attendees && event.attendees.length > 0 && (
                <AvatarGroup
                  max={3}
                  sx={{
                    '& .MuiAvatar-root': {
                      width: 24,
                      height: 24,
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  {event.attendees.map(attendee => (
                    <Avatar
                      key={attendee.id}
                      src={attendee.avatar}
                      alt={attendee.name}
                      sx={{ width: 24, height: 24 }}
                    >
                      {attendee.name.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              )}

              {event.reminders && (
                <Tooltip title="Reminders enabled">
                  <Notifications fontSize="small" color="primary" />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </EventItem>
  )
}

// Main Upcoming Events Component
export interface UpcomingEventsProps {
  title?: string
  maxItems?: number
  showAddButton?: boolean
  compact?: boolean
  events?: UpcomingEvent[]
  onEventClick?: (event: UpcomingEvent) => void
  onAddEvent?: () => void
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  title = 'Upcoming Events',
  maxItems = 6,
  showAddButton = true,
  compact = false,
  events: propEvents,
  onEventClick,
  onAddEvent,
}) => {
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockEvents = propEvents || generateMockEvents()
        setEvents(mockEvents.slice(0, maxItems))
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [propEvents, maxItems])

  const handleEventClick = (event: UpcomingEvent) => {
    onEventClick?.(event)
  }

  const handleAddEvent = () => {
    onAddEvent?.()
  }

  const handleViewAll = () => {
    navigate('/meetings')
  }

  if (loading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, p: 2 }}>
              <Skeleton
                variant="rectangular"
                width={70}
                height={60}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {showAddButton && (
            <Tooltip title="Add new event">
              <IconButton size="small" onClick={handleAddEvent}>
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View all events">
            <IconButton size="small" onClick={handleViewAll}>
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Events List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a1a1a1',
          },
        }}
      >
        {events.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <CalendarToday sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No upcoming events
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
              Your calendar is clear for now
            </Typography>
            {showAddButton && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleAddEvent}
              >
                Schedule Event
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ pb: 1 }}>
            {events.map(event => (
              <EventItemComponent
                key={event.id}
                event={event}
                onClick={handleEventClick}
                compact={compact}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {events.length > 0 && (
        <Box sx={{ pt: 2, borderTop: `1px solid ${alpha('#000', 0.1)}` }}>
          <Button
            variant="text"
            size="small"
            endIcon={<ChevronRight />}
            onClick={handleViewAll}
            sx={{ width: '100%', justifyContent: 'center' }}
          >
            View all events
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default UpcomingEvents

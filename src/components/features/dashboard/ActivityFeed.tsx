import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Skeleton,
  styled,
  alpha,
} from '@mui/material'
import {
  PersonAdd,
  EventNote,
  Assignment,
  Flight,
  CheckCircle,
  Edit,
  Delete,
  MoreVert,
  FilterList,
  Refresh,
  Timeline,
  TrendingUp,
  VideoCall,
} from '@mui/icons-material'
// Note: Using native Date methods instead of date-fns for now
// import { formatDistanceToNow } from 'date-fns'

const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let result = ''

  if (diffMins < 1) {
    result = 'just now'
  } else if (diffMins < 60) {
    result = `${diffMins} minute${diffMins !== 1 ? 's' : ''}`
  } else if (diffHours < 24) {
    result = `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
  } else {
    result = `${diffDays} day${diffDays !== 1 ? 's' : ''}`
  }

  return options?.addSuffix ? `${result} ago` : result
}

// Activity types
export interface Activity {
  id: string
  type: 'contact' | 'meeting' | 'task' | 'travel' | 'goal' | 'system'
  action:
    | 'created'
    | 'updated'
    | 'completed'
    | 'cancelled'
    | 'deleted'
    | 'scheduled'
  title: string
  description?: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
  }
  metadata?: {
    entityId?: string
    entityType?: string
    oldValue?: string
    newValue?: string
    priority?: 'low' | 'medium' | 'high'
    status?: string
  }
  tags?: string[]
}

// Styled Components
const ActivityItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `1px solid transparent`,
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    borderColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateX(4px)',
  },
}))

const ActivityIcon = styled(Box)<{ type: string; action: string }>(({
  theme,
  type,
  action,
}) => {
  const getColors = () => {
    switch (type) {
      case 'contact':
        return {
          bg: theme.palette.primary.light,
          color: theme.palette.primary.main,
        }
      case 'meeting':
        return {
          bg: theme.palette.secondary.light,
          color: theme.palette.secondary.main,
        }
      case 'task':
        return {
          bg: theme.palette.success.light,
          color: theme.palette.success.main,
        }
      case 'travel':
        return { bg: theme.palette.info.light, color: theme.palette.info.main }
      case 'goal':
        return {
          bg: theme.palette.warning.light,
          color: theme.palette.warning.main,
        }
      default:
        return { bg: theme.palette.grey[200], color: theme.palette.grey[600] }
    }
  }

  const colors = getColors()

  return {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(colors.bg, 0.2),
    color: colors.color,
    fontSize: 20,
    flexShrink: 0,
    position: 'relative',
    '&::after':
      action === 'completed'
        ? {
            content: '""',
            position: 'absolute',
            top: -2,
            right: -2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: theme.palette.success.main,
            border: `2px solid ${theme.palette.background.paper}`,
          }
        : {},
  }
})

const TimelineConnector = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 19,
  top: 50,
  bottom: -10,
  width: 2,
  backgroundColor: theme.palette.divider,
  '&.last': {
    display: 'none',
  },
}))

// Activity type icons
const getActivityIcon = (type: string, action: string) => {
  switch (type) {
    case 'contact':
      return <PersonAdd />
    case 'meeting':
      return action === 'scheduled' ? (
        <EventNote />
      ) : action === 'completed' ? (
        <CheckCircle />
      ) : (
        <VideoCall />
      )
    case 'task':
      return action === 'completed' ? <CheckCircle /> : <Assignment />
    case 'travel':
      return <Flight />
    case 'goal':
      return <TrendingUp />
    default:
      return <Timeline />
  }
}

// Mock data generator
const generateMockActivities = (): Activity[] => {
  const now = new Date()

  return [
    {
      id: '1',
      type: 'meeting',
      action: 'completed',
      title: 'Quarterly Review with Sarah Johnson',
      description:
        'Discussed Q3 performance and Q4 goals, outlined action items',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      user: { name: 'John Doe', avatar: '' },
      metadata: { entityId: 'meeting-1', priority: 'high' },
      tags: ['quarterly', 'review'],
    },
    {
      id: '2',
      type: 'contact',
      action: 'created',
      title: 'Added new contact: Michael Chen',
      description:
        'Software Engineer at TechCorp, potential collaboration partner',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: { name: 'John Doe', avatar: '' },
      metadata: { entityId: 'contact-1', entityType: 'contact' },
      tags: ['new-contact', 'tech'],
    },
    {
      id: '3',
      type: 'task',
      action: 'completed',
      title: 'Completed project documentation',
      description:
        'Finished writing comprehensive project documentation for Q4 release',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      user: { name: 'John Doe', avatar: '' },
      metadata: { entityId: 'task-1', priority: 'medium' },
      tags: ['documentation', 'project'],
    },
    {
      id: '4',
      type: 'travel',
      action: 'scheduled',
      title: 'Booked flight to San Francisco',
      description:
        'Business trip for client meetings, departing Monday 8:00 AM',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      user: { name: 'John Doe', avatar: '' },
      metadata: { entityId: 'trip-1', priority: 'high' },
      tags: ['travel', 'business'],
    },
    {
      id: '5',
      type: 'meeting',
      action: 'scheduled',
      title: 'Client presentation scheduled',
      description: 'Q4 results presentation with ABC Corp stakeholders',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
      user: { name: 'Sarah Johnson', avatar: '' },
      metadata: { entityId: 'meeting-2', priority: 'high' },
      tags: ['client', 'presentation'],
    },
    {
      id: '6',
      type: 'goal',
      action: 'updated',
      title: 'Updated Q4 revenue targets',
      description:
        'Revised quarterly goals based on market conditions and team capacity',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
      user: { name: 'Mike Chen', avatar: '' },
      metadata: { entityId: 'goal-1', priority: 'high' },
      tags: ['goals', 'revenue'],
    },
    {
      id: '7',
      type: 'contact',
      action: 'updated',
      title: 'Updated contact information for Lisa Wong',
      description: 'Added new phone number and updated company details',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      user: { name: 'Emily Davis', avatar: '' },
      metadata: { entityId: 'contact-2', priority: 'low' },
      tags: ['contact-update'],
    },
    {
      id: '8',
      type: 'task',
      action: 'created',
      title: 'Created new feature development task',
      description: 'User authentication system enhancement for mobile app',
      timestamp: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
      user: { name: 'Alex Brown', avatar: '' },
      metadata: { entityId: 'task-2', priority: 'medium' },
      tags: ['development', 'mobile'],
    },
    {
      id: '9',
      type: 'meeting',
      action: 'cancelled',
      title: 'Weekly standup cancelled',
      description:
        'Cancelled due to team off-site event, rescheduled for next week',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      user: { name: 'Maya Patel', avatar: '' },
      metadata: { entityId: 'meeting-3', priority: 'low' },
      tags: ['standup', 'cancelled'],
    },
    {
      id: '10',
      type: 'system',
      action: 'updated',
      title: 'System backup completed',
      description: 'Automated weekly backup completed successfully',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      user: { name: 'System', avatar: '' },
      metadata: { entityId: 'backup-1', priority: 'low' },
      tags: ['system', 'backup'],
    },
  ]
}

// Individual Activity Item Component
interface ActivityItemProps {
  activity: Activity
  isLast?: boolean
  onClick?: (activity: Activity) => void
  onAction?: (activity: Activity, action: string) => void
}

const ActivityItemComponent: React.FC<ActivityItemProps> = ({
  activity,
  isLast = false,
  onClick,
  onAction,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleAction = (action: string) => {
    onAction?.(activity, action)
    handleMenuClose()
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <ActivityItem onClick={() => onClick?.(activity)}>
        <ActivityIcon type={activity.type} action={activity.action}>
          {getActivityIcon(activity.type, activity.action)}
        </ActivityIcon>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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
              sx={{ fontWeight: 600, lineHeight: 1.3 }}
            >
              {activity.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {activity.metadata?.priority && (
                <Chip
                  size="small"
                  label={activity.metadata.priority}
                  color={getPriorityColor(activity.metadata.priority) as any}
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}

              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {activity.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, lineHeight: 1.4 }}
            >
              {activity.description}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              {activity.user && activity.user.name !== 'System' && (
                <> • by {activity.user.name}</>
              )}
            </Typography>

            {activity.tags && activity.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {activity.tags.slice(0, 2).map(tag => (
                  <Chip
                    key={tag}
                    size="small"
                    label={tag}
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.7rem' }}
                  />
                ))}
                {activity.tags.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{activity.tags.length - 2}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={e => e.stopPropagation()}
        >
          <MenuItem onClick={() => handleAction('view')}>
            <Timeline fontSize="small" sx={{ mr: 1 }} />
            View details
          </MenuItem>
          <MenuItem onClick={() => handleAction('edit')}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => handleAction('delete')}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </ActivityItem>

      {!isLast && <TimelineConnector />}
    </Box>
  )
}

// Main Activity Feed Component
export interface ActivityFeedProps {
  title?: string
  maxItems?: number
  showFilters?: boolean
  refreshInterval?: number
  activities?: Activity[]
  onActivityClick?: (activity: Activity) => void
  onActivityAction?: (activity: Activity, action: string) => void
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title = 'Recent Activity',
  maxItems = 10,
  showFilters = true,
  // refreshInterval = 60,
  activities: propActivities,
  onActivityClick,
  onActivityAction,
}) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))

        const mockActivities = propActivities || generateMockActivities()
        setActivities(mockActivities.slice(0, maxItems))
      } catch (error) {
        console.error('Failed to load activities:', error)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [propActivities, maxItems])

  const filteredActivities = activities.filter(
    activity => selectedType === 'all' || activity.type === selectedType
  )

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchor(null)
  }

  const handleFilterSelect = (type: string) => {
    setSelectedType(type)
    handleFilterClose()
  }

  const handleRefresh = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setLoading(false)
  }

  const handleActivityClick = (activity: Activity) => {
    onActivityClick?.(activity)
  }

  const handleActivityAction = (activity: Activity, action: string) => {
    onActivityAction?.(activity, action)
  }

  if (loading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
        </Box>
        <Box
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, p: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="90%" height={16} />
                <Skeleton variant="text" width="40%" height={14} />
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
        {showFilters && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={loading}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter activities">
              <IconButton size="small" onClick={handleFilterClick}>
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Activities List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 1,
          position: 'relative',
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
        {filteredActivities.length === 0 ? (
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
            <Timeline sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No recent activity
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              Your activity feed will appear here
            </Typography>
          </Box>
        ) : (
          <Box sx={{ pb: 1 }}>
            {filteredActivities.map((activity, index) => (
              <ActivityItemComponent
                key={activity.id}
                activity={activity}
                isLast={index === filteredActivities.length - 1}
                onClick={handleActivityClick}
                onAction={handleActivityAction}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleFilterSelect('all')}>
          <Timeline sx={{ mr: 1 }} />
          All Activities
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('contact')}>
          <PersonAdd sx={{ mr: 1 }} />
          Contacts
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('meeting')}>
          <EventNote sx={{ mr: 1 }} />
          Meetings
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('task')}>
          <Assignment sx={{ mr: 1 }} />
          Tasks
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('travel')}>
          <Flight sx={{ mr: 1 }} />
          Travel
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ActivityFeed

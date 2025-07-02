import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
  Checkbox,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  AvatarGroup,
  Fade,
  alpha,
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material'
import { Meeting } from '../../../types/meeting'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { format } from 'date-fns'
import { useTheme } from '@mui/material/styles'
import { ActionItemsManager } from './ActionItemsManager'

interface MeetingCardProps {
  meeting: Meeting
  isSelected?: boolean
  onSelect?: (id: string) => void
  onDeselect?: (id: string) => void
  onClick?: (meeting: Meeting) => void
  showCheckbox?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  isSelected = false,
  onSelect,
  onDeselect,
  onClick,
  showCheckbox = false,
  variant = 'default',
}) => {
  const theme = useTheme()
  const {
    setEditing,
    deleteMeeting,
    startMeeting,
    endMeeting,
    cancelMeeting,
    activeMeetingId,
  } = useMeetingsStore()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [actionItemsOpen, setActionItemsOpen] = useState(false)
  const open = Boolean(anchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(meeting)
    }
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    if (event.target.checked) {
      onSelect?.(meeting.id)
    } else {
      onDeselect?.(meeting.id)
    }
  }

  const handleEdit = () => {
    setEditing(meeting.id)
    handleMenuClose()
  }

  const handleDelete = async () => {
    try {
      await deleteMeeting(meeting.id)
    } catch (error) {
      console.error('Failed to delete meeting:', error)
    }
    handleMenuClose()
  }

  const handleStartMeeting = async () => {
    try {
      await startMeeting(meeting.id)
    } catch (error) {
      console.error('Failed to start meeting:', error)
    }
    handleMenuClose()
  }

  const handleEndMeeting = async () => {
    try {
      await endMeeting(meeting.id)
    } catch (error) {
      console.error('Failed to end meeting:', error)
    }
    handleMenuClose()
  }

  const handleCancelMeeting = async () => {
    try {
      await cancelMeeting(meeting.id)
    } catch (error) {
      console.error('Failed to cancel meeting:', error)
    }
    handleMenuClose()
  }

  const handleActionItems = () => {
    setActionItemsOpen(true)
    handleMenuClose()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return theme.palette.error.main
      case 'high':
        return theme.palette.warning.main
      case 'medium':
        return theme.palette.info.main
      case 'low':
        return theme.palette.success.main
      default:
        return theme.palette.grey[500]
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.palette.primary.main
      case 'in_progress':
        return theme.palette.warning.main
      case 'completed':
        return theme.palette.success.main
      case 'cancelled':
        return theme.palette.error.main
      default:
        return theme.palette.grey[500]
    }
  }

  const getStatusIcon = () => {
    switch (meeting.status) {
      case 'scheduled':
        return <ScheduleIcon fontSize="small" />
      case 'in_progress':
        return <PlayArrowIcon fontSize="small" />
      case 'completed':
        return <EventNoteIcon fontSize="small" />
      case 'cancelled':
        return <CancelIcon fontSize="small" />
      default:
        return <ScheduleIcon fontSize="small" />
    }
  }

  const getLocationIcon = () => {
    if (!meeting.location) return null

    switch (meeting.location.type) {
      case 'virtual':
        return <VideoCallIcon fontSize="small" />
      case 'physical':
        return <LocationIcon fontSize="small" />
      case 'hybrid':
        return <VideoCallIcon fontSize="small" />
      default:
        return <LocationIcon fontSize="small" />
    }
  }

  const getLocationText = () => {
    if (!meeting.location) return 'No location'

    switch (meeting.location.type) {
      case 'virtual':
        return meeting.location.platform
          ? `${meeting.location.platform} Meeting`
          : 'Virtual Meeting'
      case 'physical':
        return (
          meeting.location.room ||
          meeting.location.address ||
          'Physical Location'
        )
      case 'hybrid':
        return 'Hybrid Meeting'
      default:
        return 'Location TBD'
    }
  }

  const isActive = activeMeetingId === meeting.id
  const canStart = meeting.status === 'scheduled'
  const canEnd = meeting.status === 'in_progress'
  const canCancel = meeting.status === 'scheduled'

  if (variant === 'compact') {
    return (
      <Card
        variant="outlined"
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          borderLeft: `4px solid ${getPriorityColor(meeting.priority)}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
            backgroundColor: alpha(theme.palette.action.hover, 0.02),
          },
          backgroundColor: isActive
            ? alpha(theme.palette.primary.main, 0.05)
            : isSelected
              ? alpha(theme.palette.action.selected, 0.08)
              : 'background.paper',
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}
            >
              {showCheckbox && (
                <Checkbox
                  checked={isSelected}
                  onChange={handleCheckboxChange}
                  size="small"
                  onClick={e => e.stopPropagation()}
                />
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {meeting.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(meeting.startTime, 'HH:mm')} -{' '}
                  {format(meeting.endTime, 'HH:mm')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                label={meeting.status}
                size="small"
                icon={getStatusIcon()}
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  backgroundColor: alpha(getStatusColor(meeting.status), 0.1),
                  color: getStatusColor(meeting.status),
                  '& .MuiChip-icon': {
                    fontSize: '0.75rem',
                  },
                }}
              />

              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{
                  opacity: 0.7,
                  '&:hover': { opacity: 1 },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Fade in timeout={300}>
        <Card
          variant="outlined"
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            borderLeft: `4px solid ${getPriorityColor(meeting.priority)}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4],
              backgroundColor: alpha(theme.palette.action.hover, 0.02),
            },
            backgroundColor: isActive
              ? alpha(theme.palette.primary.main, 0.05)
              : isSelected
                ? alpha(theme.palette.action.selected, 0.08)
                : 'background.paper',
          }}
          onClick={handleCardClick}
        >
          <CardContent>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  flex: 1,
                }}
              >
                {showCheckbox && (
                  <Checkbox
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    size="small"
                    onClick={e => e.stopPropagation()}
                    sx={{ mt: -0.5 }}
                  />
                )}

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 0.5, lineHeight: 1.2 }}>
                    {meeting.title}
                  </Typography>

                  {meeting.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {meeting.description}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={meeting.priority}
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      getPriorityColor(meeting.priority),
                      0.1
                    ),
                    color: getPriorityColor(meeting.priority),
                  }}
                />

                <Chip
                  label={meeting.status}
                  size="small"
                  icon={getStatusIcon()}
                  sx={{
                    backgroundColor: alpha(getStatusColor(meeting.status), 0.1),
                    color: getStatusColor(meeting.status),
                  }}
                />

                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  sx={{
                    opacity: 0.7,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Meeting Details */}
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}
            >
              {/* Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {format(meeting.startTime, 'MMM d, yyyy • HH:mm')} -{' '}
                  {format(meeting.endTime, 'HH:mm')}
                  <Chip
                    label={`${meeting.duration} min`}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                  />
                </Typography>
              </Box>

              {/* Location */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getLocationIcon()}
                <Typography variant="body2" color="text.secondary">
                  {getLocationText()}
                </Typography>
              </Box>

              {/* Attendees */}
              {meeting.attendees.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <AvatarGroup
                    max={4}
                    sx={{
                      '& .MuiAvatar-root': {
                        width: 24,
                        height: 24,
                        fontSize: '0.75rem',
                      },
                    }}
                  >
                    {meeting.attendees.map(attendee => (
                      <Tooltip
                        key={attendee.id}
                        title={`${attendee.firstName} ${attendee.lastName}`}
                      >
                        <Avatar
                          src={attendee.avatar}
                          alt={`${attendee.firstName} ${attendee.lastName}`}
                        >
                          {attendee.firstName[0]}
                          {attendee.lastName[0]}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    {meeting.attendees.length} attendee
                    {meeting.attendees.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Tags */}
            {meeting.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                {meeting.tags.slice(0, 3).map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                ))}
                {meeting.tags.length > 3 && (
                  <Chip
                    label={`+${meeting.tags.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                )}
              </Box>
            )}

            {/* Action Items Count */}
            {meeting.actionItems.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {meeting.actionItems.length} action item
                  {meeting.actionItems.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </CardContent>

          {/* Actions Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={e => e.stopPropagation()}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                },
              },
            }}
          >
            <MenuItem onClick={handleCardClick}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Meeting</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleActionItems}>
              <ListItemIcon>
                <TaskIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Action Items</ListItemText>
            </MenuItem>

            {canStart && (
              <MenuItem onClick={handleStartMeeting}>
                <ListItemIcon>
                  <PlayArrowIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Start Meeting</ListItemText>
              </MenuItem>
            )}

            {canEnd && (
              <MenuItem onClick={handleEndMeeting}>
                <ListItemIcon>
                  <StopIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>End Meeting</ListItemText>
              </MenuItem>
            )}

            {canCancel && (
              <MenuItem onClick={handleCancelMeeting}>
                <ListItemIcon>
                  <CancelIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cancel Meeting</ListItemText>
              </MenuItem>
            )}

            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Meeting</ListItemText>
            </MenuItem>
          </Menu>
        </Card>
      </Fade>

      {/* Action Items Manager */}
      <ActionItemsManager
        meeting={meeting}
        open={actionItemsOpen}
        onClose={() => setActionItemsOpen(false)}
        onActionItemsCreated={tasks => {
          console.log('Action items created as tasks:', tasks)
          // You can add additional logic here, such as showing a success message
        }}
      />
    </>
  )
}

export default MeetingCard

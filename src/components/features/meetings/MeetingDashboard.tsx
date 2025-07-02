import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Alert,
  Tooltip,
  Badge,
} from '@mui/material'
import { Grid } from '@mui/material'

import {
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Event as EventIcon,
  Today as TodayIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material'
import { format, isToday, isTomorrow, addDays } from 'date-fns'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { useContactsStore } from '../../../store/contactsStore'
import { Meeting } from '../../../types/meeting'

interface MeetingDashboardProps {
  onMeetingClick?: (meeting: Meeting) => void
  onCreateMeeting?: () => void
  compact?: boolean
  showActionItems?: boolean
  showTeamAvailability?: boolean
}

const MeetingDashboard: React.FC<MeetingDashboardProps> = ({
  onMeetingClick,
  onCreateMeeting,
  compact = false,
  showActionItems = true,
  showTeamAvailability = true,
}) => {
  const {
    meetings,
    stats,
    actionItems,
    loadMeetings,
    loadStats,
    loadActionItems,
    getTodaysMeetings,
    getUpcomingMeetings,
    startMeeting,
    endMeeting,
  } = useMeetingsStore()

  const { contacts } = useContactsStore()

  const [isLoading, setIsLoading] = useState(false)

  console.debug('compact', compact)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([loadMeetings(), loadStats(), loadActionItems()])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [loadMeetings, loadStats, loadActionItems])

  // Get today's meetings
  const todaysMeetings = useMemo(() => {
    return getTodaysMeetings().slice(0, 5) // Show first 5
  }, [getTodaysMeetings])

  // Get upcoming meetings
  const upcomingMeetings = useMemo(() => {
    return getUpcomingMeetings(5) // Show next 5
  }, [getUpcomingMeetings])

  // Get overdue action items
  const overdueActionItems = useMemo(() => {
    return actionItems
      .filter(
        item =>
          item.status !== 'completed' &&
          item.dueDate &&
          item.dueDate < new Date()
      )
      .slice(0, 5)
  }, [actionItems])

  // Get current meeting (if any)
  const currentMeeting = useMemo(() => {
    const now = new Date()
    return meetings.find(
      meeting =>
        meeting.status === 'in_progress' ||
        (meeting.startTime <= now &&
          meeting.endTime >= now &&
          meeting.status === 'scheduled')
    )
  }, [meetings])

  // Team availability data
  const teamAvailability = useMemo(() => {
    if (!showTeamAvailability) return []

    const topContacts = contacts
      .sort((a, b) => (b.interactionCount || 0) - (a.interactionCount || 0))
      .slice(0, 8)

    return topContacts.map(contact => {
      const upcomingMeetings = meetings.filter(
        meeting =>
          meeting.attendees.some(attendee => attendee.id === contact.id) &&
          meeting.startTime > new Date() &&
          meeting.startTime < addDays(new Date(), 1)
      )

      return {
        contact,
        upcomingCount: upcomingMeetings.length,
        isAvailable: upcomingMeetings.length < 3, // Arbitrary threshold
        nextMeeting: upcomingMeetings[0],
      }
    })
  }, [contacts, meetings, showTeamAvailability])

  const handleStartMeeting = async (meetingId: string) => {
    try {
      await startMeeting(meetingId)
    } catch (error) {
      console.error('Failed to start meeting:', error)
    }
  }

  const handleEndMeeting = async (meetingId: string) => {
    try {
      await endMeeting(meetingId)
    } catch (error) {
      console.error('Failed to end meeting:', error)
    }
  }

  const getMeetingStatusColor = (meeting: Meeting) => {
    switch (meeting.status) {
      case 'in_progress':
        return 'success'
      case 'scheduled':
        return 'primary'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatMeetingTime = (meeting: Meeting) => {
    if (isToday(meeting.startTime)) {
      return format(meeting.startTime, 'h:mm a')
    } else if (isTomorrow(meeting.startTime)) {
      return `Tomorrow at ${format(meeting.startTime, 'h:mm a')}`
    } else {
      return format(meeting.startTime, 'MMM d, h:mm a')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'default'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" component="h2">
          Meeting Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
          {onCreateMeeting && (
            <Button
              variant="contained"
              startIcon={<EventIcon />}
              onClick={onCreateMeeting}
            >
              New Meeting
            </Button>
          )}
        </Box>
      </Box>

      {/* Current Meeting Alert */}
      {currentMeeting && (
        <Alert
          severity="info"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentMeeting.status === 'scheduled' && (
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleStartMeeting(currentMeeting.id)}
                >
                  Start
                </Button>
              )}
              {currentMeeting.status === 'in_progress' && (
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleEndMeeting(currentMeeting.id)}
                >
                  End
                </Button>
              )}
            </Box>
          }
        >
          <Typography variant="subtitle2">
            {currentMeeting.status === 'in_progress'
              ? 'Meeting in progress: '
              : 'Meeting starting now: '}
            <strong>{currentMeeting.title}</strong>
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TodayIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="primary">
                    {todaysMeetings.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Meetings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {stats?.upcomingMeetings || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {overdueActionItems.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Actions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TimerIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {stats ? Math.round(stats.averageDuration) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Duration (min)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Meetings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title="Today's Meetings"
              action={
                <Chip
                  label={`${todaysMeetings.length} meetings`}
                  size="small"
                  color="primary"
                />
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {todaysMeetings.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2 }}
                >
                  No meetings scheduled for today
                </Typography>
              ) : (
                <List dense>
                  {todaysMeetings.map((meeting, index) => (
                    <ListItem
                      key={meeting.id}
                      component="button"
                      onClick={() => onMeetingClick?.(meeting)}
                      divider={index < todaysMeetings.length - 1}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <AccessTimeIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {meeting.title}
                            </Typography>
                            <Chip
                              label={meeting.status}
                              size="small"
                              color={getMeetingStatusColor(meeting)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatMeetingTime(meeting)} •{' '}
                              {meeting.attendees.length} attendees
                            </Typography>
                          </Box>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Chip
                          label={meeting.priority}
                          size="small"
                          color={getPriorityColor(meeting.priority)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Meetings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title="Upcoming Meetings"
              action={
                <Chip
                  label={`Next ${upcomingMeetings.length}`}
                  size="small"
                  color="success"
                />
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {upcomingMeetings.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2 }}
                >
                  No upcoming meetings
                </Typography>
              ) : (
                <List dense>
                  {upcomingMeetings.map((meeting, index) => (
                    <ListItem
                      key={meeting.id}
                      component="button"
                      onClick={() => onMeetingClick?.(meeting)}
                      divider={index < upcomingMeetings.length - 1}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <EventIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={meeting.title}
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {formatMeetingTime(meeting)} • {meeting.duration}{' '}
                            min
                          </Typography>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Tooltip
                          title={`${meeting.attendees.length} attendees`}
                        >
                          <Badge
                            badgeContent={meeting.attendees.length}
                            color="primary"
                          >
                            <GroupIcon />
                          </Badge>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Action Items */}
        {showActionItems && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader
                title="Overdue Action Items"
                action={
                  <Chip
                    label={`${overdueActionItems.length} overdue`}
                    size="small"
                    color="warning"
                  />
                }
              />
              <CardContent sx={{ pt: 0 }}>
                {overdueActionItems.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2 }}
                  >
                    No overdue action items
                  </Typography>
                ) : (
                  <List dense>
                    {overdueActionItems.map((item, index) => (
                      <ListItem
                        key={item.id}
                        divider={index < overdueActionItems.length - 1}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: 'warning.main',
                            }}
                          >
                            <WarningIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={item.title}
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Due:{' '}
                              {item.dueDate
                                ? format(item.dueDate, 'MMM d')
                                : 'No date'}
                            </Typography>
                          }
                        />

                        <ListItemSecondaryAction>
                          <Chip
                            label={item.priority}
                            size="small"
                            color={getPriorityColor(item.priority)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Team Availability */}
        {showTeamAvailability && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader
                title="Team Availability"
                action={<Chip label="Today" size="small" color="info" />}
              />
              <CardContent sx={{ pt: 0 }}>
                <List dense>
                  {teamAvailability.map((member, index) => (
                    <ListItem
                      key={member.contact.id}
                      divider={index < teamAvailability.length - 1}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {member.contact.firstName[0]}
                          {member.contact.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={`${member.contact.firstName} ${member.contact.lastName}`}
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {member.isAvailable
                              ? 'Available'
                              : `${member.upcomingCount} meetings today`}
                          </Typography>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Chip
                          label={member.isAvailable ? 'Free' : 'Busy'}
                          size="small"
                          color={member.isAvailable ? 'success' : 'warning'}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Meeting Trends */}
      {stats && (
        <Card>
          <CardHeader title="Meeting Insights" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {stats.productivityScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Productivity Score
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.productivityScore}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{stats.meetingsThisWeek}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Week
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">
                    {Math.round(stats.averageAttendeesPerMeeting)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Attendees
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">
                    {Math.round(stats.totalMeetingTime / 60)} hrs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default MeetingDashboard

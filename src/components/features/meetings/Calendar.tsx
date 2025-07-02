import React, { useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Add as AddIcon,
  CalendarMonth as CalendarMonthIcon,
  CalendarViewWeek as CalendarViewWeekIcon,
  CalendarViewDay as CalendarViewDayIcon,
  ViewAgenda as ViewAgendaIcon,
} from '@mui/icons-material'
import {
  Meeting,
  CalendarDay,
  CalendarWeek,
  CalendarMonth,
} from '../../../types/meeting'
import { useMeetingsStore } from '../../../store/meetingsStore'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addDays,
  getWeek,
} from 'date-fns'

interface CalendarProps {
  onMeetingClick?: (meeting: Meeting) => void
  onDateClick?: (date: Date) => void
  onCreateMeeting?: (date?: Date) => void
}

const Calendar: React.FC<CalendarProps> = ({
  onMeetingClick,
  onDateClick,
  onCreateMeeting,
}) => {
  const theme = useTheme()
  const {
    calendarView,
    currentDate,
    selectedDate,
    filteredMeetings,
    setCalendarView,
    setCurrentDate,
    setSelectedDate,
    getMeetingsByDate,
    getMeetingsByDateRange,
  } = useMeetingsStore()

  // Navigation handlers
  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    switch (calendarView) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case 'agenda':
        newDate.setDate(newDate.getDate() - 30)
        break
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    switch (calendarView) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case 'agenda':
        newDate.setDate(newDate.getDate() + 30)
        break
    }
    setCurrentDate(newDate)
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  // Get calendar data based on view
  const calendarData = useMemo(() => {
    switch (calendarView) {
      case 'month':
        return getMonthCalendarData()
      case 'week':
        return getWeekCalendarData()
      case 'day':
        return getDayCalendarData()
      case 'agenda':
        return getAgendaData()
      default:
        return getMonthCalendarData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarView])

  function getMonthCalendarData(): CalendarMonth {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const weeks = eachWeekOfInterval(
      { start: calendarStart, end: calendarEnd },
      { weekStartsOn: 0 }
    ).map((weekStart, _weekIndex) => {
      const days = eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6),
      }).map(date => {
        const dayMeetings = getMeetingsByDate(date)
        return {
          date,
          isToday: isToday(date),
          isWeekend: date.getDay() === 0 || date.getDay() === 6,
          isOtherMonth: !isSameMonth(date, currentDate),
          meetings: dayMeetings,
          timeSlots: [],
          workingHours: { start: 9, end: 17 },
        }
      })

      return {
        weekNumber: getWeek(weekStart),
        days,
        startDate: weekStart,
        endDate: addDays(weekStart, 6),
      }
    })

    return {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      weeks,
      totalMeetings: filteredMeetings.filter(m =>
        isSameMonth(m.startTime, currentDate)
      ).length,
      workingDays: weeks.reduce(
        (total, week) =>
          total +
          week.days.filter(day => !day.isWeekend && !day.isOtherMonth).length,
        0
      ),
    }
  }

  function getWeekCalendarData(): CalendarWeek {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

    const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(
      date => {
        const dayMeetings = getMeetingsByDate(date)
        return {
          date,
          isToday: isToday(date),
          isWeekend: date.getDay() === 0 || date.getDay() === 6,
          isOtherMonth: !isSameMonth(date, currentDate),
          meetings: dayMeetings,
          timeSlots: [],
          workingHours: { start: 9, end: 17 },
        }
      }
    )

    return {
      weekNumber: getWeek(weekStart),
      days,
      startDate: weekStart,
      endDate: weekEnd,
    }
  }

  function getDayCalendarData(): CalendarDay {
    const dayMeetings = getMeetingsByDate(currentDate)
    return {
      date: currentDate,
      isToday: isToday(currentDate),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      isOtherMonth: false,
      meetings: dayMeetings,
      timeSlots: [],
      workingHours: { start: 9, end: 17 },
    }
  }

  function getAgendaData() {
    const agendaStart = new Date(currentDate)
    const agendaEnd = addDays(currentDate, 30)
    return getMeetingsByDateRange(agendaStart, agendaEnd)
  }

  const getDisplayTitle = () => {
    switch (calendarView) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'agenda': {
        const agendaEnd = addDays(currentDate, 30)
        return `${format(currentDate, 'MMM d')} - ${format(agendaEnd, 'MMM d, yyyy')}`
      }
      default:
        return format(currentDate, 'MMMM yyyy')
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    if (onDateClick) {
      onDateClick(date)
    }
  }

  const handleMeetingClick = (meeting: Meeting) => {
    if (onMeetingClick) {
      onMeetingClick(meeting)
    }
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

  const renderMeetingChip = (meeting: Meeting, compact = false) => (
    <Box
      key={meeting.id}
      onClick={e => {
        e.stopPropagation()
        handleMeetingClick(meeting)
      }}
      sx={{
        mb: 0.5,
        p: 0.5,
        borderRadius: 1,
        fontSize: '0.7rem',
        backgroundColor: alpha(getPriorityColor(meeting.priority), 0.1),
        borderLeft: `3px solid ${getPriorityColor(meeting.priority)}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: alpha(getPriorityColor(meeting.priority), 0.2),
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          lineHeight: 1.2,
          display: 'block',
          color: theme.palette.text.primary,
        }}
        noWrap
      >
        {compact
          ? meeting.title.length > 18
            ? meeting.title.substring(0, 18) + '...'
            : meeting.title
          : meeting.title}
      </Typography>
      {!compact && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            color: theme.palette.text.secondary,
            mt: 0.2,
            display: 'block',
          }}
        >
          {format(meeting.startTime, 'HH:mm')}
        </Typography>
      )}
    </Box>
  )

  const renderMonthView = () => {
    const monthData = calendarData as CalendarMonth

    return (
      <Box>
        {/* Week day headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            mb: 2,
          }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Typography
              key={day}
              variant="subtitle2"
              sx={{
                textAlign: 'center',
                py: 1.5,
                fontWeight: 600,
                color: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.grey[100], 0.8),
                borderRadius: 1,
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Calendar grid */}
        {monthData.weeks.map((week, weekIndex) => (
          <Box
            key={weekIndex}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
              mb: 1,
            }}
          >
            {week.days.map((day, dayIndex) => (
              <Box key={dayIndex}>
                <Card
                  variant="outlined"
                  sx={{
                    height: 140,
                    cursor: 'pointer',
                    backgroundColor: day.isOtherMonth
                      ? alpha(theme.palette.grey[300], 0.3)
                      : day.isToday
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'background.paper',
                    borderColor: day.isToday
                      ? theme.palette.primary.main
                      : isSameDay(day.date, selectedDate)
                        ? theme.palette.secondary.main
                        : 'divider',
                    borderWidth:
                      day.isToday || isSameDay(day.date, selectedDate) ? 2 : 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.1),
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => handleDateClick(day.date)}
                >
                  <CardContent
                    sx={{
                      p: 1.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:last-child': { pb: 1.5 },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: day.isToday ? 600 : 400,
                          color: day.isOtherMonth
                            ? theme.palette.text.disabled
                            : day.isToday
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                        }}
                      >
                        {day.date.getDate()}
                      </Typography>
                      {day.meetings.length > 0 && (
                        <Chip
                          label={day.meetings.length}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.65rem',
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {day.meetings
                        .slice(0, 2)
                        .map(meeting => renderMeetingChip(meeting, true))}
                      {day.meetings.length > 2 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 'auto',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            textAlign: 'center',
                            py: 0.5,
                            backgroundColor: alpha(
                              theme.palette.grey[100],
                              0.8
                            ),
                            borderRadius: 0.5,
                          }}
                        >
                          +{day.meetings.length - 2} more
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    )
  }

  const renderWeekView = () => {
    const weekData = calendarData as CalendarWeek

    return (
      <Grid container spacing={1}>
        {weekData.days.map((day, index) => (
          <Grid item xs key={index}>
            <Card
              variant="outlined"
              sx={{
                minHeight: 400,
                cursor: 'pointer',
                backgroundColor: day.isToday
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'background.paper',
                borderColor: day.isToday
                  ? theme.palette.primary.main
                  : isSameDay(day.date, selectedDate)
                    ? theme.palette.secondary.main
                    : 'divider',
                borderWidth:
                  day.isToday || isSameDay(day.date, selectedDate) ? 2 : 1,
              }}
              onClick={() => handleDateClick(day.date)}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: day.isToday ? 600 : 400,
                    color: day.isToday
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  }}
                >
                  {format(day.date, 'EEE d')}
                </Typography>

                <Box>
                  {day.meetings.map(meeting => (
                    <Box
                      key={meeting.id}
                      sx={{
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: alpha(
                          getPriorityColor(meeting.priority),
                          0.1
                        ),
                        borderLeft: `3px solid ${getPriorityColor(meeting.priority)}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(
                            getPriorityColor(meeting.priority),
                            0.2
                          ),
                        },
                      }}
                      onClick={e => {
                        e.stopPropagation()
                        handleMeetingClick(meeting)
                      }}
                    >
                      <Typography variant="subtitle2" noWrap>
                        {meeting.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(meeting.startTime, 'HH:mm')} -{' '}
                        {format(meeting.endTime, 'HH:mm')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  const renderDayView = () => {
    const dayData = calendarData as CalendarDay

    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          {format(dayData.date, 'EEEE, MMMM d, yyyy')}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, minHeight: 500 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Meetings ({dayData.meetings.length})
              </Typography>

              {dayData.meetings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No meetings scheduled for this day
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => onCreateMeeting?.(dayData.date)}
                    sx={{ mt: 2 }}
                  >
                    Schedule Meeting
                  </Button>
                </Box>
              ) : (
                <Box>
                  {dayData.meetings
                    .sort(
                      (a, b) => a.startTime.getTime() - b.startTime.getTime()
                    )
                    .map(meeting => (
                      <Card
                        key={meeting.id}
                        variant="outlined"
                        sx={{
                          mb: 2,
                          cursor: 'pointer',
                          borderLeft: `4px solid ${getPriorityColor(meeting.priority)}`,
                          '&:hover': {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.05
                            ),
                          },
                        }}
                        onClick={() => handleMeetingClick(meeting)}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 1,
                            }}
                          >
                            <Typography variant="h6">
                              {meeting.title}
                            </Typography>
                            <Chip
                              label={meeting.status}
                              size="small"
                              sx={{
                                backgroundColor: alpha(
                                  getStatusColor(meeting.status),
                                  0.1
                                ),
                                color: getStatusColor(meeting.status),
                              }}
                            />
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {format(meeting.startTime, 'HH:mm')} -{' '}
                            {format(meeting.endTime, 'HH:mm')}(
                            {meeting.duration} min)
                          </Typography>

                          {meeting.description && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {meeting.description}
                            </Typography>
                          )}

                          <Box
                            sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}
                          >
                            {meeting.tags.map(tag => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => onCreateMeeting?.(dayData.date)}
                sx={{ mb: 1 }}
              >
                Schedule Meeting
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={navigateToday}
                sx={{ mb: 2 }}
              >
                Go to Today
              </Button>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Day Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dayData.meetings.length} meetings scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dayData.meetings.reduce((total, m) => total + m.duration, 0)}{' '}
                minutes total
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  const renderAgendaView = () => {
    const meetings = calendarData as Meeting[]
    const groupedMeetings = meetings.reduce(
      (groups, meeting) => {
        const dateKey = format(meeting.startTime, 'yyyy-MM-dd')
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(meeting)
        return groups
      },
      {} as Record<string, Meeting[]>
    )

    return (
      <Box>
        {Object.entries(groupedMeetings).map(([dateKey, dayMeetings]) => (
          <Box key={dateKey} sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}
            >
              {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
            </Typography>

            {dayMeetings.map(meeting => (
              <Card
                key={meeting.id}
                variant="outlined"
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  borderLeft: `4px solid ${getPriorityColor(meeting.priority)}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.05),
                  },
                }}
                onClick={() => handleMeetingClick(meeting)}
              >
                <CardContent sx={{ py: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {meeting.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(meeting.startTime, 'HH:mm')} -{' '}
                        {format(meeting.endTime, 'HH:mm')}
                        {meeting.location &&
                          ` • ${meeting.location.type === 'virtual' ? 'Virtual' : meeting.location.address}`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                        sx={{
                          backgroundColor: alpha(
                            getStatusColor(meeting.status),
                            0.1
                          ),
                          color: getStatusColor(meeting.status),
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ))}

        {meetings.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No meetings in the next 30 days
            </Typography>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box>
      {/* Calendar Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">{getDisplayTitle()}</Typography>

          <Box>
            <IconButton onClick={navigatePrevious} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={navigateNext} size="small">
              <ChevronRightIcon />
            </IconButton>
            <IconButton onClick={navigateToday} size="small">
              <TodayIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => setCalendarView('month')}
              variant={calendarView === 'month' ? 'contained' : 'outlined'}
              startIcon={<CalendarMonthIcon />}
            >
              Month
            </Button>
            <Button
              onClick={() => setCalendarView('week')}
              variant={calendarView === 'week' ? 'contained' : 'outlined'}
              startIcon={<CalendarViewWeekIcon />}
            >
              Week
            </Button>
            <Button
              onClick={() => setCalendarView('day')}
              variant={calendarView === 'day' ? 'contained' : 'outlined'}
              startIcon={<CalendarViewDayIcon />}
            >
              Day
            </Button>
            <Button
              onClick={() => setCalendarView('agenda')}
              variant={calendarView === 'agenda' ? 'contained' : 'outlined'}
              startIcon={<ViewAgendaIcon />}
            >
              Agenda
            </Button>
          </ButtonGroup>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreateMeeting?.(selectedDate)}
          >
            New Meeting
          </Button>
        </Box>
      </Box>

      {/* Calendar Content */}
      <Box>
        {calendarView === 'month' && renderMonthView()}
        {calendarView === 'week' && renderWeekView()}
        {calendarView === 'day' && renderDayView()}
        {calendarView === 'agenda' && renderAgendaView()}
      </Box>
    </Box>
  )
}

export default Calendar

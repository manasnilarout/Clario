import React, { useMemo, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  Chip,
  Card,
  CardContent,
  Avatar,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Assignment as TaskIcon,
  Event as MeetingIcon,
  Flag as PriorityIcon,
  Schedule as DueDateIcon,
  Person as AssigneeIcon,
  FilterList as FilterIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
} from '@mui/icons-material'
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
  startOfDay,
  endOfDay,
} from 'date-fns'
import { Task, TaskPriority, TaskStatus } from '../../../types/task'
import { Meeting } from '../../../types/meeting'
import { useTasksStore } from '../../../store/tasksStore'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { useContactsStore } from '../../../store/contactsStore'

interface TaskCalendarEvent {
  id: string
  taskId?: string
  meetingId?: string
  title: string
  start: Date
  end?: Date
  allDay: boolean
  color: string
  type: 'task' | 'meeting' | 'deadline' | 'reminder'
  priority?: TaskPriority
  status?: TaskStatus
  assignee?: string
}

interface TaskCalendarProps {
  onTaskClick?: (task: Task) => void
  onMeetingClick?: (meeting: Meeting) => void
  onDateClick?: (date: Date) => void
  onCreateTask?: (date?: Date) => void
  onCreateMeeting?: (date?: Date) => void
}

type CalendarView = 'month' | 'week' | 'day' | 'agenda'

interface CalendarFilters {
  showTasks: boolean
  showMeetings: boolean
  showDeadlines: boolean
  showReminders: boolean
  taskStatuses: TaskStatus[]
  taskPriorities: TaskPriority[]
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  onTaskClick,
  onMeetingClick,
  onDateClick,
  onCreateTask,
  onCreateMeeting,
}) => {
  const theme = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<CalendarView>('month')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<CalendarFilters>({
    showTasks: true,
    showMeetings: true,
    showDeadlines: true,
    showReminders: true,
    taskStatuses: ['not_started', 'in_progress', 'waiting', 'blocked'],
    taskPriorities: ['low', 'medium', 'high', 'urgent'],
  })

  const { tasks } = useTasksStore()
  const { meetings } = useMeetingsStore()
  const { contacts } = useContactsStore()

  // Priority colors
  const getPriorityColor = (priority: TaskPriority): string => {
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

  // Status colors
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main
      case 'in_progress':
        return theme.palette.primary.main
      case 'blocked':
        return theme.palette.error.main
      case 'waiting':
        return theme.palette.warning.main
      default:
        return theme.palette.grey[500]
    }
  }

  // Convert tasks and meetings to calendar events
  const calendarEvents = useMemo(() => {
    const events: TaskCalendarEvent[] = []

    // Add task events
    if (filters.showTasks) {
      tasks
        .filter(
          task =>
            filters.taskStatuses.includes(task.status) &&
            filters.taskPriorities.includes(task.priority) &&
            !task.isArchived
        )
        .forEach(task => {
          // Task start date event
          if (task.startDate) {
            events.push({
              id: `task-start-${task.id}`,
              taskId: task.id,
              title: `🎯 ${task.title}`,
              start: task.startDate,
              allDay: true,
              color: getStatusColor(task.status),
              type: 'task',
              priority: task.priority,
              status: task.status,
              assignee: task.assignedTo,
            })
          }

          // Task due date event
          if (task.dueDate && filters.showDeadlines) {
            const isOverdue =
              task.dueDate < new Date() && task.status !== 'completed'
            events.push({
              id: `task-due-${task.id}`,
              taskId: task.id,
              title: `⏰ ${task.title}${isOverdue ? ' (Overdue)' : ''}`,
              start: task.dueDate,
              allDay: true,
              color: isOverdue
                ? theme.palette.error.main
                : getPriorityColor(task.priority),
              type: 'deadline',
              priority: task.priority,
              status: task.status,
              assignee: task.assignedTo,
            })
          }
        })
    }

    // Add meeting events
    if (filters.showMeetings) {
      meetings.forEach(meeting => {
        events.push({
          id: `meeting-${meeting.id}`,
          meetingId: meeting.id,
          title: `📞 ${meeting.title}`,
          start: meeting.startTime,
          end: meeting.endTime,
          allDay: false,
          color: theme.palette.secondary.main,
          type: 'meeting',
        })
      })
    }

    return events
  }, [tasks, meetings, filters, theme, getPriorityColor, getStatusColor])

  // Get events for a specific date
  const getEventsForDate = (date: Date): TaskCalendarEvent[] => {
    return calendarEvents.filter(
      event =>
        isSameDay(event.start, date) ||
        (event.end &&
          date >= startOfDay(event.start) &&
          date <= endOfDay(event.end))
    )
  }

  // Navigation handlers
  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    switch (view) {
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
    switch (view) {
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

  // Month view render
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const weeks = eachWeekOfInterval(
      { start: calendarStart, end: calendarEnd },
      { weekStartsOn: 0 }
    )

    return (
      <Grid container spacing={0} sx={{ height: '100%' }}>
        {/* Week day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Grid
            item
            xs
            key={day}
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Box
              sx={{
                p: 1.5,
                textAlign: 'center',
                fontWeight: 'bold',
                bgcolor: 'background.default',
                borderBottom: 1,
                borderColor: 'divider',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {day}
              </Typography>
            </Box>
          </Grid>
        ))}

        {/* Calendar days */}
        {weeks.map((weekStart, weekIndex) =>
          eachDayOfInterval({
            start: weekStart,
            end: addDays(weekStart, 6),
          }).map((date, dayIndex) => {
            const dayEvents = getEventsForDate(date)
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isTodayDate = isToday(date)
            const isSelectedDate = selectedDate && isSameDay(date, selectedDate)

            return (
              <Grid
                item
                xs
                key={`${weekIndex}-${dayIndex}`}
                sx={{
                  height: '160px',
                  borderRight: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                  bgcolor: isSelectedDate
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
                onClick={() => {
                  setSelectedDate(date)
                  onDateClick?.(date)
                }}
              >
                <Box sx={{ p: 1, height: '100%', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isTodayDate ? 'bold' : 'normal',
                        color: !isCurrentMonth
                          ? 'text.disabled'
                          : isTodayDate
                            ? 'white'
                            : 'text.primary',
                        bgcolor: isTodayDate
                          ? theme.palette.primary.main
                          : 'transparent',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                      }}
                    >
                      {format(date, 'd')}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                  >
                    {dayEvents.slice(0, 4).map(event => (
                      <Chip
                        key={event.id}
                        label={
                          event.title.length > 25
                            ? `${event.title.substring(0, 22)}...`
                            : event.title
                        }
                        size="small"
                        sx={{
                          height: '24px',
                          fontSize: '11px',
                          backgroundColor: alpha(event.color, 0.15),
                          color: event.color,
                          borderLeft: `3px solid ${event.color}`,
                          borderRadius: '4px',
                          justifyContent: 'flex-start',
                          fontWeight: 500,
                          '& .MuiChip-label': {
                            px: 1,
                            py: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                          '&:hover': {
                            backgroundColor: alpha(event.color, 0.25),
                            transform: 'scale(1.02)',
                          },
                        }}
                        onClick={e => {
                          e.stopPropagation()
                          if (event.taskId && onTaskClick) {
                            const task = tasks.find(t => t.id === event.taskId)
                            if (task) onTaskClick(task)
                          } else if (event.meetingId && onMeetingClick) {
                            const meeting = meetings.find(
                              m => m.id === event.meetingId
                            )
                            if (meeting) onMeetingClick(meeting)
                          }
                        }}
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: '10px',
                          fontWeight: 500,
                          pl: 1,
                          py: 0.5,
                          backgroundColor: alpha(theme.palette.grey[500], 0.1),
                          borderRadius: '4px',
                        }}
                      >
                        +{dayEvents.length - 4} more
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            )
          })
        )}
      </Grid>
    )
  }

  // Filter controls
  const handleFilterChange = (key: keyof CalendarFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getViewTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'week':
        const weekStart = startOfWeek(currentDate)
        const weekEnd = endOfWeek(currentDate)
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
      case 'agenda':
        return 'Agenda View'
      default:
        return format(currentDate, 'MMMM yyyy')
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Calendar Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" component="h2">
            Task Calendar
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setFiltersOpen(true)}
              variant="outlined"
              size="small"
            >
              Filters
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={() => onCreateTask?.(selectedDate || currentDate)}
              variant="outlined"
              size="small"
            >
              Add Task
            </Button>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={navigatePrevious} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={navigateNext} size="small">
              <ChevronRightIcon />
            </IconButton>
            <Button
              startIcon={<TodayIcon />}
              onClick={navigateToday}
              variant="outlined"
              size="small"
            >
              Today
            </Button>
            <Typography variant="h6" sx={{ ml: 2 }}>
              {getViewTitle()}
            </Typography>
          </Box>

          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => setView('month')}
              variant={view === 'month' ? 'contained' : 'outlined'}
              startIcon={<CalendarMonthIcon />}
            >
              Month
            </Button>
            <Button
              onClick={() => setView('week')}
              variant={view === 'week' ? 'contained' : 'outlined'}
              startIcon={<CalendarViewWeekIcon />}
            >
              Week
            </Button>
            <Button
              onClick={() => setView('day')}
              variant={view === 'day' ? 'contained' : 'outlined'}
              startIcon={<CalendarViewDayIcon />}
            >
              Day
            </Button>
            <Button
              onClick={() => setView('agenda')}
              variant={view === 'agenda' ? 'contained' : 'outlined'}
              startIcon={<ViewAgendaIcon />}
            >
              Agenda
            </Button>
          </ButtonGroup>
        </Box>
      </Paper>

      {/* Calendar Content */}
      <Paper sx={{ flex: 1, overflow: 'hidden' }}>
        {view === 'month' && renderMonthView()}
        {view !== 'month' && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {view.charAt(0).toUpperCase() + view.slice(1)} View
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {view} view implementation coming soon...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Filter Dialog */}
      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Calendar Filters</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Typography variant="subtitle2">Event Types</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showTasks}
                    onChange={e =>
                      handleFilterChange('showTasks', e.target.checked)
                    }
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <TaskIcon fontSize="small" />
                    Show Tasks
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showMeetings}
                    onChange={e =>
                      handleFilterChange('showMeetings', e.target.checked)
                    }
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <MeetingIcon fontSize="small" />
                    Show Meetings
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showDeadlines}
                    onChange={e =>
                      handleFilterChange('showDeadlines', e.target.checked)
                    }
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <DueDateIcon fontSize="small" />
                    Show Deadlines
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showReminders}
                    onChange={e =>
                      handleFilterChange('showReminders', e.target.checked)
                    }
                  />
                }
                label="Show Reminders"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TaskCalendar

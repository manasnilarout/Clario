import React, { useState, useMemo, useRef } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Slider,
  useTheme,
  alpha,
  styled,
} from '@mui/material'
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Settings as SettingsIcon,
  Flag as MilestoneIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material'
import {
  format,
  addDays,
  addMonths,
  startOfDay,
  endOfDay,
  differenceInDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns'
import { Task, TaskStatus, TaskPriority } from '../../../types/task'
import { useTasksStore } from '../../../store/tasksStore'
import { useContactsStore } from '../../../store/contactsStore'

interface TimelineTask {
  id: string
  title: string
  start: Date
  end: Date
  progress: number
  dependencies: string[]
  assignee?: string
  priority: TaskPriority
  status: TaskStatus
  parent?: string
  children?: TimelineTask[]
  level: number
  isExpanded?: boolean
  isMilestone?: boolean
}

interface TaskTimelineProps {
  tasks?: Task[]
  onTaskClick?: (task: Task) => void
}

type TimelineScale = 'days' | 'weeks' | 'months'

interface TimelineSettings {
  showDependencies: boolean
  showProgress: boolean
  showAssignees: boolean
  showCriticalPath: boolean
  groupByProject: boolean
  scale: TimelineScale
  zoomLevel: number
}

const TimelineContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '600px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
}))

const TaskListContainer = styled(Box)(({ theme }) => ({
  width: '300px',
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  overflow: 'auto',
}))

const TimelineChartContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
}))

const TaskRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '40px',
  padding: theme.spacing(0, 1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const TimelineGrid = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px)`,
  backgroundSize: '100px 100%',
}))

const TaskBar = styled(Box)<{ priority: TaskPriority; status: TaskStatus }>(({
  theme,
  priority,
  status,
}) => {
  const getColor = () => {
    if (status === 'completed') return theme.palette.success.main
    if (status === 'blocked') return theme.palette.error.main
    if (status === 'in_progress') return theme.palette.primary.main

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

  return {
    position: 'absolute',
    height: '20px',
    backgroundColor: alpha(getColor(), 0.8),
    border: `2px solid ${getColor()}`,
    borderRadius: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 0.5),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: getColor(),
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[4],
    },
  }
})

const ProgressBar = styled(Box)<{ progress: number }>(
  ({ theme, progress }) => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: `${progress}%`,
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    borderRadius: theme.spacing(0.5),
    transition: 'width 0.3s ease',
  })
)

export const TaskTimeline: React.FC<TaskTimelineProps> = ({
  tasks: propTasks,
  onTaskClick,
}) => {
  const theme = useTheme()
  const { tasks: storeTasks } = useTasksStore()
  const { contacts } = useContactsStore()
  const timelineRef = useRef<HTMLDivElement>(null)

  const [currentDate] = useState(new Date())
  const [settings, setSettings] = useState<TimelineSettings>({
    showDependencies: true,
    showProgress: true,
    showAssignees: true,
    showCriticalPath: false,
    groupByProject: false,
    scale: 'weeks',
    zoomLevel: 1,
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const tasks = propTasks || storeTasks.filter(task => !task.isArchived)

  // Convert tasks to timeline format
  const timelineTasks = useMemo(() => {
    const convertedTasks: TimelineTask[] = []

    tasks.forEach(task => {
      if (!task.startDate && !task.dueDate) return

      const start = task.startDate || task.createdAt
      const end =
        task.dueDate ||
        addDays(
          start,
          task.estimatedDuration ? Math.ceil(task.estimatedDuration / 480) : 1
        )

      const timelineTask: TimelineTask = {
        id: task.id,
        title: task.title,
        start,
        end,
        progress: task.progress,
        dependencies: task.dependencies?.map(dep => dep.taskId) || [],
        assignee: task.assignedTo,
        priority: task.priority,
        status: task.status,
        parent: task.parentTaskId,
        level: 0,
        isExpanded: expandedTasks.has(task.id),
        isMilestone: task.type === 'project_milestone',
      }

      convertedTasks.push(timelineTask)
    })

    // Calculate hierarchy levels
    const taskMap = new Map(convertedTasks.map(task => [task.id, task]))

    convertedTasks.forEach(task => {
      let level = 0
      let currentParent = task.parent

      while (currentParent && taskMap.has(currentParent)) {
        level++
        currentParent = taskMap.get(currentParent)?.parent
      }

      task.level = level
    })

    // Sort by level and start date
    return convertedTasks.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      return a.start.getTime() - b.start.getTime()
    })
  }, [tasks, expandedTasks])

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    if (timelineTasks.length === 0) {
      return {
        start: startOfDay(currentDate),
        end: endOfDay(addMonths(currentDate, 3)),
      }
    }

    const starts = timelineTasks.map(task => task.start)
    const ends = timelineTasks.map(task => task.end)

    const earliestStart = new Date(Math.min(...starts.map(d => d.getTime())))
    const latestEnd = new Date(Math.max(...ends.map(d => d.getTime())))

    // Add some padding
    return {
      start: addDays(earliestStart, -7),
      end: addDays(latestEnd, 7),
    }
  }, [timelineTasks, currentDate])

  // Generate time scale
  const timeScale = useMemo(() => {
    const { start, end } = timelineRange
    const totalDays = differenceInDays(end, start)
    const dayWidth = Math.max(20, settings.zoomLevel * 20)

    let intervals: Date[] = []

    switch (settings.scale) {
      case 'days':
        intervals = eachDayOfInterval({ start, end })
        break
      case 'weeks':
        intervals = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
        break
      case 'months':
        intervals = eachMonthOfInterval({ start, end })
        break
    }

    return {
      intervals,
      dayWidth,
      totalWidth: totalDays * dayWidth,
    }
  }, [timelineRange, settings.scale, settings.zoomLevel])

  // Calculate task bar positions
  const getTaskBarStyle = (task: TimelineTask) => {
    const { start: rangeStart } = timelineRange
    const { dayWidth } = timeScale

    const startOffset = differenceInDays(task.start, rangeStart) * dayWidth
    const duration = differenceInDays(task.end, task.start) || 1
    const width = Math.max(duration * dayWidth, 20)

    return {
      left: `${startOffset}px`,
      width: `${width}px`,
      top: '10px',
    }
  }

  // Render time scale header
  const renderTimeScaleHeader = () => (
    <Box
      sx={{
        height: '60px',
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'background.default',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {timeScale.intervals.map((interval, index) => (
        <Box
          key={index}
          sx={{
            minWidth: '100px',
            textAlign: 'center',
            borderRight: 1,
            borderColor: 'divider',
            p: 1,
          }}
        >
          <Typography variant="caption" fontWeight="bold">
            {settings.scale === 'days' && format(interval, 'MMM d')}
            {settings.scale === 'weeks' && format(interval, 'MMM d')}
            {settings.scale === 'months' && format(interval, 'MMM yyyy')}
          </Typography>
          {settings.scale === 'days' && (
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              {format(interval, 'EEE')}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )

  // Render task list
  const renderTaskList = () => (
    <Box sx={{ position: 'sticky', left: 0, zIndex: 1 }}>
      <Box
        sx={{
          height: '60px',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Typography variant="h6">Tasks</Typography>
      </Box>

      {timelineTasks.map(task => {
        const contact = contacts.find(c => c.id === task.assignee)

        return (
          <TaskRow
            key={task.id}
            sx={{ pl: 1 + task.level * 2 }}
            onClick={() => {
              const originalTask = tasks.find(t => t.id === task.id)
              if (originalTask && onTaskClick) onTaskClick(originalTask)
            }}
          >
            <Box display="flex" alignItems="center" flex={1} gap={1}>
              {task.children && (
                <IconButton
                  size="small"
                  onClick={e => {
                    e.stopPropagation()
                    setExpandedTasks(prev => {
                      const newSet = new Set(prev)
                      if (newSet.has(task.id)) {
                        newSet.delete(task.id)
                      } else {
                        newSet.add(task.id)
                      }
                      return newSet
                    })
                  }}
                >
                  {task.isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                </IconButton>
              )}

              {task.isMilestone && (
                <MilestoneIcon fontSize="small" color="primary" />
              )}

              <Typography
                variant="body2"
                sx={{
                  fontWeight: task.isMilestone ? 'bold' : 'normal',
                  textDecoration:
                    task.status === 'completed' ? 'line-through' : 'none',
                  color:
                    task.status === 'completed'
                      ? 'text.disabled'
                      : 'text.primary',
                }}
                noWrap
              >
                {task.title}
              </Typography>
            </Box>

            {settings.showAssignees && contact && (
              <Tooltip title={`${contact.firstName} ${contact.lastName}`}>
                <Avatar
                  sx={{ width: 20, height: 20, fontSize: '10px' }}
                  src={contact.avatar}
                >
                  {contact.firstName[0]}
                  {contact.lastName[0]}
                </Avatar>
              </Tooltip>
            )}
          </TaskRow>
        )
      })}
    </Box>
  )

  // Render timeline chart
  const renderTimelineChart = () => (
    <Box
      sx={{ position: 'relative', minHeight: timelineTasks.length * 40 + 60 }}
    >
      {renderTimeScaleHeader()}
      <TimelineGrid />

      {timelineTasks.map((task, index) => (
        <Box
          key={task.id}
          sx={{
            position: 'absolute',
            top: 60 + index * 40,
            left: 0,
            right: 0,
            height: '40px',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <TaskBar
            priority={task.priority}
            status={task.status}
            sx={getTaskBarStyle(task)}
            onClick={() => {
              const originalTask = tasks.find(t => t.id === task.id)
              if (originalTask && onTaskClick) onTaskClick(originalTask)
            }}
          >
            {settings.showProgress && <ProgressBar progress={task.progress} />}

            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                zIndex: 1,
              }}
            >
              {task.title}
            </Typography>

            {task.isMilestone && (
              <MilestoneIcon sx={{ color: 'white', fontSize: '14px' }} />
            )}
          </TaskBar>
        </Box>
      ))}

      {/* Today line */}
      <Box
        sx={{
          position: 'absolute',
          top: 60,
          bottom: 0,
          left: `${differenceInDays(currentDate, timelineRange.start) * timeScale.dayWidth}px`,
          width: '2px',
          backgroundColor: theme.palette.error.main,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            left: -6,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `8px solid ${theme.palette.error.main}`,
          }}
        />
      </Box>
    </Box>
  )

  const handleSettingsChange = (key: keyof TimelineSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" component="h1">
          Task Timeline
        </Typography>
        <Box display="flex" gap={1}>
          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => handleSettingsChange('scale', 'days')}
              variant={settings.scale === 'days' ? 'contained' : 'outlined'}
            >
              Days
            </Button>
            <Button
              onClick={() => handleSettingsChange('scale', 'weeks')}
              variant={settings.scale === 'weeks' ? 'contained' : 'outlined'}
            >
              Weeks
            </Button>
            <Button
              onClick={() => handleSettingsChange('scale', 'months')}
              variant={settings.scale === 'months' ? 'contained' : 'outlined'}
            >
              Months
            </Button>
          </ButtonGroup>

          <IconButton
            onClick={() =>
              handleSettingsChange(
                'zoomLevel',
                Math.max(0.5, settings.zoomLevel - 0.25)
              )
            }
            size="small"
          >
            <ZoomOutIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              handleSettingsChange(
                'zoomLevel',
                Math.min(3, settings.zoomLevel + 0.25)
              )
            }
            size="small"
          >
            <ZoomInIcon />
          </IconButton>

          <Button
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
            variant="outlined"
            size="small"
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* Timeline */}
      <TimelineContainer>
        <TaskListContainer>{renderTaskList()}</TaskListContainer>

        <TimelineChartContainer ref={timelineRef}>
          {renderTimelineChart()}
        </TimelineChartContainer>
      </TimelineContainer>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Timeline Settings</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showDependencies}
                  onChange={e =>
                    handleSettingsChange('showDependencies', e.target.checked)
                  }
                />
              }
              label="Show Dependencies"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showProgress}
                  onChange={e =>
                    handleSettingsChange('showProgress', e.target.checked)
                  }
                />
              }
              label="Show Progress"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showAssignees}
                  onChange={e =>
                    handleSettingsChange('showAssignees', e.target.checked)
                  }
                />
              }
              label="Show Assignees"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showCriticalPath}
                  onChange={e =>
                    handleSettingsChange('showCriticalPath', e.target.checked)
                  }
                />
              }
              label="Show Critical Path"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.groupByProject}
                  onChange={e =>
                    handleSettingsChange('groupByProject', e.target.checked)
                  }
                />
              }
              label="Group by Project"
            />

            <Box>
              <Typography gutterBottom>Zoom Level</Typography>
              <Slider
                value={settings.zoomLevel}
                onChange={(_, value) =>
                  handleSettingsChange('zoomLevel', value as number)
                }
                min={0.5}
                max={3}
                step={0.25}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TaskTimeline

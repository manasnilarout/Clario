import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Avatar,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material'
import { Grid } from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Flag as PriorityIcon,
  Timeline as TimelineIcon,
  Speed as ProductivityIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  endOfDay,
  isWithinInterval,
  differenceInDays,
  parseISO,
} from 'date-fns'
import { Task, TaskStatus, TaskPriority } from '../../../types/task'
import { useTasksStore } from '../../../store/tasksStore'
import { useContactsStore } from '../../../store/contactsStore'

interface TaskAnalyticsProps {
  tasks?: Task[]
}

type TimePeriod = '7d' | '30d' | '90d' | '1y'

interface AnalyticsData {
  productivity: ProductivityMetrics
  trends: TaskTrends
  teamPerformance: TeamMetrics
  projectInsights: ProjectAnalytics
}

interface ProductivityMetrics {
  totalTasks: number
  completedTasks: number
  completionRate: number
  averageCompletionTime: number
  overdueTasks: number
  productivityScore: number
}

interface TaskTrends {
  daily: Array<{ date: string; completed: number; created: number }>
  weekly: Array<{ week: string; completed: number; created: number }>
  monthly: Array<{ month: string; completed: number; created: number }>
}

interface TeamMetrics {
  byAssignee: Array<{
    assignee: string
    name: string
    avatar?: string
    totalTasks: number
    completedTasks: number
    completionRate: number
    avgCompletionTime: number
  }>
  collaborationScore: number
}

interface ProjectAnalytics {
  byCategory: Array<{ category: string; count: number; completed: number }>
  byPriority: Array<{ priority: string; count: number; completed: number }>
  byStatus: Array<{ status: string; count: number }>
}

const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  grey: '#757575',
}

const STATUS_COLORS = {
  completed: COLORS.success,
  in_progress: COLORS.primary,
  not_started: COLORS.grey,
  waiting: COLORS.warning,
  blocked: COLORS.error,
  cancelled: COLORS.grey,
}

const PRIORITY_COLORS = {
  urgent: COLORS.error,
  high: COLORS.warning,
  medium: COLORS.info,
  low: COLORS.success,
}

export const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({
  tasks: propTasks,
}) => {
  const theme = useTheme()
  const { tasks: storeTasks, stats } = useTasksStore()
  const { contacts } = useContactsStore()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [selectedView, setSelectedView] = useState<
    'overview' | 'trends' | 'team' | 'projects'
  >('overview')

  const tasks = propTasks || storeTasks.filter(task => !task.isArchived)

  // Filter tasks by time period
  const filteredTasks = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (timePeriod) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case '1y':
        startDate = subDays(now, 365)
        break
      default:
        startDate = subDays(now, 30)
    }

    return tasks.filter(
      task =>
        task.createdAt >= startDate ||
        (task.completedAt && task.completedAt >= startDate)
    )
  }, [tasks, timePeriod])

  // Calculate analytics data
  const analyticsData = useMemo((): AnalyticsData => {
    const completedTasks = filteredTasks.filter(
      task => task.status === 'completed'
    )
    const overdueTasks = filteredTasks.filter(
      task =>
        task.dueDate && task.dueDate < new Date() && task.status !== 'completed'
    )

    // Productivity metrics
    const productivity: ProductivityMetrics = {
      totalTasks: filteredTasks.length,
      completedTasks: completedTasks.length,
      completionRate:
        filteredTasks.length > 0
          ? (completedTasks.length / filteredTasks.length) * 100
          : 0,
      averageCompletionTime:
        completedTasks.length > 0
          ? completedTasks.reduce((acc, task) => {
              if (task.completedAt && task.createdAt) {
                return acc + differenceInDays(task.completedAt, task.createdAt)
              }
              return acc
            }, 0) / completedTasks.length
          : 0,
      overdueTasks: overdueTasks.length,
      productivityScore: Math.min(
        100,
        Math.max(
          0,
          (completedTasks.length / Math.max(filteredTasks.length, 1)) * 100 -
            overdueTasks.length * 5
        )
      ),
    }

    // Trends data
    const dailyData: Record<string, { completed: number; created: number }> = {}
    const now = new Date()

    // Initialize with zeros for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(now, i), 'yyyy-MM-dd')
      dailyData[date] = { completed: 0, created: 0 }
    }

    filteredTasks.forEach(task => {
      const createdDate = format(task.createdAt, 'yyyy-MM-dd')
      if (dailyData[createdDate]) {
        dailyData[createdDate].created++
      }

      if (task.completedAt) {
        const completedDate = format(task.completedAt, 'yyyy-MM-dd')
        if (dailyData[completedDate]) {
          dailyData[completedDate].completed++
        }
      }
    })

    const trends: TaskTrends = {
      daily: Object.entries(dailyData).map(([date, data]) => ({
        date: format(parseISO(date), 'MMM d'),
        ...data,
      })),
      weekly: [], // Simplified for demo
      monthly: [], // Simplified for demo
    }

    // Team performance
    const assigneeData: Record<
      string,
      {
        totalTasks: number
        completedTasks: number
        totalCompletionTime: number
        completedCount: number
      }
    > = {}

    filteredTasks.forEach(task => {
      if (task.assignedTo) {
        if (!assigneeData[task.assignedTo]) {
          assigneeData[task.assignedTo] = {
            totalTasks: 0,
            completedTasks: 0,
            totalCompletionTime: 0,
            completedCount: 0,
          }
        }

        assigneeData[task.assignedTo].totalTasks++

        if (task.status === 'completed') {
          assigneeData[task.assignedTo].completedTasks++

          if (task.completedAt && task.createdAt) {
            assigneeData[task.assignedTo].totalCompletionTime +=
              differenceInDays(task.completedAt, task.createdAt)
            assigneeData[task.assignedTo].completedCount++
          }
        }
      }
    })

    const teamPerformance: TeamMetrics = {
      byAssignee: Object.entries(assigneeData)
        .map(([assigneeId, data]) => {
          const contact = contacts.find(c => c.id === assigneeId)
          return {
            assignee: assigneeId,
            name: contact
              ? `${contact.firstName} ${contact.lastName}`
              : 'Unknown',
            avatar: contact?.avatar,
            totalTasks: data.totalTasks,
            completedTasks: data.completedTasks,
            completionRate:
              data.totalTasks > 0
                ? (data.completedTasks / data.totalTasks) * 100
                : 0,
            avgCompletionTime:
              data.completedCount > 0
                ? data.totalCompletionTime / data.completedCount
                : 0,
          }
        })
        .sort((a, b) => b.completionRate - a.completionRate),
      collaborationScore: 85, // Simplified for demo
    }

    // Project insights
    const categoryData: Record<string, { count: number; completed: number }> =
      {}
    const priorityData: Record<string, { count: number; completed: number }> =
      {}
    const statusData: Record<string, number> = {}

    filteredTasks.forEach(task => {
      // Category analysis
      const category = task.category || 'Uncategorized'
      if (!categoryData[category]) {
        categoryData[category] = { count: 0, completed: 0 }
      }
      categoryData[category].count++
      if (task.status === 'completed') {
        categoryData[category].completed++
      }

      // Priority analysis
      if (!priorityData[task.priority]) {
        priorityData[task.priority] = { count: 0, completed: 0 }
      }
      priorityData[task.priority].count++
      if (task.status === 'completed') {
        priorityData[task.priority].completed++
      }

      // Status analysis
      statusData[task.status] = (statusData[task.status] || 0) + 1
    })

    const projectInsights: ProjectAnalytics = {
      byCategory: Object.entries(categoryData).map(([category, data]) => ({
        category,
        count: data.count,
        completed: data.completed,
      })),
      byPriority: Object.entries(priorityData).map(([priority, data]) => ({
        priority,
        count: data.count,
        completed: data.completed,
      })),
      byStatus: Object.entries(statusData).map(([status, count]) => ({
        status,
        count,
      })),
    }

    return {
      productivity,
      trends,
      teamPerformance,
      projectInsights,
    }
  }, [filteredTasks, contacts])

  // Overview metrics cards
  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    icon?: React.ReactNode,
    color?: string,
    trend?: 'up' | 'down' | 'neutral'
  ) => (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            {icon}
            {trend &&
              (trend === 'up' ? (
                <TrendingUpIcon color="success" />
              ) : trend === 'down' ? (
                <TrendingDownIcon color="error" />
              ) : null)}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  // Render overview section
  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        {renderMetricCard(
          'Total Tasks',
          analyticsData.productivity.totalTasks,
          `In ${timePeriod}`,
          <TaskIcon color="primary" />,
          'primary.main'
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        {renderMetricCard(
          'Completed',
          analyticsData.productivity.completedTasks,
          `${analyticsData.productivity.completionRate.toFixed(1)}% completion rate`,
          <CompletedIcon color="success" />,
          'success.main',
          'up'
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        {renderMetricCard(
          'Overdue',
          analyticsData.productivity.overdueTasks,
          'Need attention',
          <OverdueIcon color="error" />,
          'error.main',
          analyticsData.productivity.overdueTasks > 0 ? 'down' : 'neutral'
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        {renderMetricCard(
          'Productivity Score',
          `${analyticsData.productivity.productivityScore.toFixed(0)}%`,
          'Overall performance',
          <ProductivityIcon color="primary" />,
          'primary.main'
        )}
      </Grid>

      {/* Charts */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Tasks by Status" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.projectInsights.byStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={entry => `${entry.status}: ${entry.count}`}
                >
                  {analyticsData.projectInsights.byStatus.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.status as TaskStatus] ||
                          COLORS.grey
                        }
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Tasks by Priority" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.projectInsights.byPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={COLORS.primary} name="Total" />
                <Bar
                  dataKey="completed"
                  fill={COLORS.success}
                  name="Completed"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  // Render trends section
  const renderTrends = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Task Creation vs Completion Trends" />
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={analyticsData.trends.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke={COLORS.primary}
                  fill={alpha(COLORS.primary, 0.6)}
                  name="Created"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="2"
                  stroke={COLORS.success}
                  fill={alpha(COLORS.success, 0.6)}
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  // Render team performance section
  const renderTeamPerformance = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Team Performance" />
          <CardContent>
            <List>
              {analyticsData.teamPerformance.byAssignee.map((member, index) => (
                <ListItem
                  key={member.assignee}
                  divider={
                    index < analyticsData.teamPerformance.byAssignee.length - 1
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={member.avatar}>
                      {member.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {member.completedTasks}/{member.totalTasks} tasks
                          completed
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Box flex={1}>
                            <LinearProgress
                              variant="determinate"
                              value={member.completionRate}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="caption">
                            {member.completionRate.toFixed(1)}%
                          </Typography>
                        </Box>
                        {member.avgCompletionTime > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Avg completion:{' '}
                            {member.avgCompletionTime.toFixed(1)} days
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Task Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timePeriod}
              label="Time Period"
              onChange={e => setTimePeriod(e.target.value as TimePeriod)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Navigation */}
      <Box mb={3}>
        <ButtonGroup variant="outlined">
          <Button
            variant={selectedView === 'overview' ? 'contained' : 'outlined'}
            onClick={() => setSelectedView('overview')}
            startIcon={<AssessmentIcon />}
          >
            Overview
          </Button>
          <Button
            variant={selectedView === 'trends' ? 'contained' : 'outlined'}
            onClick={() => setSelectedView('trends')}
            startIcon={<TimelineIcon />}
          >
            Trends
          </Button>
          <Button
            variant={selectedView === 'team' ? 'contained' : 'outlined'}
            onClick={() => setSelectedView('team')}
            startIcon={<PersonIcon />}
          >
            Team
          </Button>
        </ButtonGroup>
      </Box>

      {/* Content */}
      {selectedView === 'overview' && renderOverview()}
      {selectedView === 'trends' && renderTrends()}
      {selectedView === 'team' && renderTeamPerformance()}
    </Box>
  )
}

export default TaskAnalytics

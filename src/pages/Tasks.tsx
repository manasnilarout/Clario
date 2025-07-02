import React, { useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Assignment as TaskIcon,
  ViewKanban as KanbanIcon,
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material'
import { useTasksStore } from '../store/tasksStore'
import {
  TasksList,
  TaskForm,
  KanbanBoard,
  TaskCalendar,
  TaskTimeline,
  TaskAnalytics,
} from '../components/features/tasks'
import { Spinner } from '../components/common'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const Tasks: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0)
  const {
    isLoading,
    error,
    tasks,
    fetchTasks,
    fetchTemplates,
    fetchKanbanBoard,
    fetchStats,
    clearError,
    moveTaskInKanban,
    startCreating,
  } = useTasksStore()

  // console.log('Tasks page render:', { isLoading, error, tasksCount: tasks.length, tabValue })

  useEffect(() => {
    // Initialize tasks data
    const initializeData = async () => {
      try {
        await fetchTasks()
        await fetchTemplates()
        await fetchKanbanBoard()
        await fetchStats()
      } catch (err) {
        console.error('Failed to initialize tasks data:', err)
      }
    }

    initializeData()
  }, [fetchTasks, fetchTemplates, fetchKanbanBoard, fetchStats])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleCloseError = () => {
    clearError()
  }

  if (isLoading && tabValue === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Spinner size={48} />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Task Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organize and track your tasks with multiple view modes, filtering, and
          collaboration features.
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="task management tabs"
          >
            <Tab
              icon={<TaskIcon />}
              label="All Tasks"
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              icon={<KanbanIcon />}
              label="Kanban Board"
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              icon={<CalendarIcon />}
              label="Calendar"
              iconPosition="start"
              {...a11yProps(2)}
            />
            <Tab
              icon={<TimelineIcon />}
              label="Timeline"
              iconPosition="start"
              {...a11yProps(3)}
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="Analytics"
              iconPosition="start"
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TasksList
            onTaskClick={task => console.log('Task clicked:', task)}
            showHeader={true}
            showPagination={true}
            showViewToggle={true}
            showBulkActions={true}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <KanbanBoard
            tasks={tasks}
            onTaskMove={moveTaskInKanban}
            onTaskClick={task => console.log('Task clicked:', task)}
            onTaskCreate={status => {
              startCreating()
              console.log('Create task for status:', status)
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TaskCalendar
            onTaskClick={task => console.log('Task clicked:', task)}
            onDateClick={date => console.log('Date clicked:', date)}
            onCreateTask={date => {
              startCreating()
              console.log('Create task for date:', date)
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TaskTimeline
            tasks={tasks}
            onTaskClick={task => console.log('Task clicked:', task)}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <TaskAnalytics tasks={tasks} />
        </TabPanel>
      </Paper>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Task Form Modal */}
      <TaskForm />
    </Container>
  )
}

export default Tasks

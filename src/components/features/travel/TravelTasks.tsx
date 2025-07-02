import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Task as TaskIcon,
  Flight as FlightIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material'
import { format, differenceInDays } from 'date-fns'
import type { Task } from '../../../types/task'
import type { Trip } from '../../../types/travel'
import { travelTaskIntegration } from '../../../services/travelTaskIntegration'
import { tasksService } from '../../../services/tasksService'

interface TravelTasksProps {
  trip: Trip
  onTaskUpdate?: () => void
}

interface TaskSuggestion {
  category: string
  suggestions: string[]
}

const TravelTasks: React.FC<TravelTasksProps> = ({ trip, onTaskUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [generatingTasks, setGeneratingTasks] = useState(false)

  // Load travel-related tasks
  useEffect(() => {
    loadTravelTasks()
    loadSuggestions()
  }, [trip.id])

  const loadTravelTasks = async () => {
    try {
      const travelTasks = await travelTaskIntegration.getTravelTasks(trip.id)
      setTasks(travelTasks)
    } catch (error) {
      console.error('Error loading travel tasks:', error)
    }
  }

  const loadSuggestions = async () => {
    try {
      const taskSuggestions =
        await travelTaskIntegration.generateTaskSuggestions(trip.id)
      setSuggestions(taskSuggestions)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    }
  }

  const handleGeneratePreTravelTasks = async () => {
    setGeneratingTasks(true)
    try {
      await travelTaskIntegration.generatePreTravelTasks(trip.id)
      await loadTravelTasks()
      onTaskUpdate?.()
      setGenerateDialogOpen(false)
    } catch (error) {
      console.error('Error generating pre-travel tasks:', error)
    } finally {
      setGeneratingTasks(false)
    }
  }

  const handleGeneratePostTravelTasks = async () => {
    setGeneratingTasks(true)
    try {
      await travelTaskIntegration.generatePostTravelFollowUp(trip.id)
      await loadTravelTasks()
      onTaskUpdate?.()
    } catch (error) {
      console.error('Error generating post-travel tasks:', error)
    } finally {
      setGeneratingTasks(false)
    }
  }

  const handleGenerateLocationTasks = async (destinationId: string) => {
    setGeneratingTasks(true)
    try {
      await travelTaskIntegration.createLocationBasedTasks(
        trip.id,
        destinationId
      )
      await loadTravelTasks()
      onTaskUpdate?.()
    } catch (error) {
      console.error('Error generating location tasks:', error)
    } finally {
      setGeneratingTasks(false)
    }
  }

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await tasksService.updateTask(taskId, {
        status: completed ? 'completed' : 'not_started',
        progress: completed ? 100 : 0,
        completedAt: completed ? new Date() : undefined,
      })
      await loadTravelTasks()
      onTaskUpdate?.()
    } catch (error) {
      console.error('Error updating task:', error)
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
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />
      case 'in_progress':
        return <ScheduleIcon color="warning" />
      case 'blocked':
        return <WarningIcon color="error" />
      default:
        return <TaskIcon color="action" />
    }
  }

  const getPurposeIcon = (purpose: string) => {
    switch (purpose.toLowerCase()) {
      case 'business':
        return <BusinessIcon />
      case 'conference':
        return <SchoolIcon />
      case 'training':
        return <AssignmentIcon />
      case 'personal':
        return <PersonIcon />
      default:
        return <FlightIcon />
    }
  }

  const categorizedTasks = tasks.reduce(
    (acc, task) => {
      const category = task.category || 'Other'
      if (!acc[category]) acc[category] = []
      acc[category].push(task)
      return acc
    },
    {} as Record<string, Task[]>
  )

  const completedTasks = tasks.filter(
    task => task.status === 'completed'
  ).length
  const totalTasks = tasks.length
  const completionPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const daysUntilTravel = differenceInDays(trip.startDate, new Date())
  const isUpcoming = daysUntilTravel > 0
  const isInProgress =
    new Date() >= trip.startDate && new Date() <= trip.endDate
  const isCompleted = new Date() > trip.endDate

  return (
    <Box>
      {/* Trip Status and Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {getPurposeIcon(trip.purpose)}
            <Typography variant="h6">Travel Tasks for {trip.title}</Typography>
            <Chip
              label={
                isUpcoming
                  ? `${daysUntilTravel} days until travel`
                  : isInProgress
                    ? 'Currently traveling'
                    : 'Trip completed'
              }
              color={
                isUpcoming ? 'primary' : isInProgress ? 'warning' : 'success'
              }
              size="small"
            />
          </Box>

          <Box mb={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="body2" color="text.secondary">
                Task Completion Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedTasks}/{totalTasks} tasks completed
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => setGenerateDialogOpen(true)}
                disabled={generatingTasks}
              >
                Generate Pre-Travel Tasks
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleGeneratePostTravelTasks}
                disabled={generatingTasks || isUpcoming}
              >
                Generate Follow-Up Tasks
              </Button>
            </Grid>
            {trip.destinations.map((destination, index) => (
              <Grid item xs={12} sm={6} md={3} key={destination.id}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleGenerateLocationTasks(destination.id)}
                  disabled={generatingTasks}
                >
                  {destination.city} Tasks
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Task Categories */}
      {Object.entries(categorizedTasks).map(([category, categoryTasks]) => (
        <Accordion key={category} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {category} ({categoryTasks.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {categoryTasks.map(task => (
                <ListItem
                  key={task.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor:
                      task.status === 'completed'
                        ? 'action.hover'
                        : 'background.paper',
                  }}
                >
                  <ListItemIcon>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={task.status === 'completed'}
                          onChange={e =>
                            handleTaskComplete(task.id, e.target.checked)
                          }
                        />
                      }
                      label=""
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="body1"
                          sx={{
                            textDecoration:
                              task.status === 'completed'
                                ? 'line-through'
                                : 'none',
                            opacity: task.status === 'completed' ? 0.7 : 1,
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {task.description}
                        </Typography>
                        {task.dueDate && (
                          <Typography variant="caption" color="text.secondary">
                            Due: {format(task.dueDate, 'MMM dd, yyyy')}
                          </Typography>
                        )}
                        <Box display="flex" gap={0.5} mt={0.5}>
                          {task.tags.slice(0, 3).map(tag => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {task.tags.length > 3 && (
                            <Chip
                              label={`+${task.tags.length - 3} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemIcon>{getStatusIcon(task.status)}</ListItemIcon>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      {tasks.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No travel tasks have been generated yet. Click "Generate Pre-Travel
          Tasks" to create a customized task list based on your trip details.
        </Alert>
      )}

      {/* Task Suggestions */}
      {suggestions.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Additional Task Suggestions
            </Typography>
            {suggestions.map((suggestion, index) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {suggestion.category}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {suggestion.suggestions.map((item, itemIndex) => (
                    <Chip
                      key={itemIndex}
                      label={item}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => {
                        // Handle suggestion click - could create a task from suggestion
                        console.log('Suggestion clicked:', item)
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Generate Tasks Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Generate Pre-Travel Tasks</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This will automatically generate a comprehensive task list based on
            your trip purpose, destinations, and timeline.
          </Typography>

          <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>
              Trip Details:
            </Typography>
            <Typography variant="body2">Purpose: {trip.purpose}</Typography>
            <Typography variant="body2">
              Duration: {trip.duration} days
            </Typography>
            <Typography variant="body2">
              Destinations:{' '}
              {trip.destinations.map(d => `${d.city}, ${d.country}`).join('; ')}
            </Typography>
            {daysUntilTravel > 0 && (
              <Typography variant="body2">
                Days until travel: {daysUntilTravel}
              </Typography>
            )}
          </Box>

          {daysUntilTravel <= 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Your trip has already started or passed. Some pre-travel tasks may
              not be relevant.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGeneratePreTravelTasks}
            variant="contained"
            disabled={generatingTasks}
            startIcon={generatingTasks ? null : <AutoAwesomeIcon />}
          >
            {generatingTasks ? 'Generating...' : 'Generate Tasks'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TravelTasks

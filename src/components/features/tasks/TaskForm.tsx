import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Tabs,
  Tab,
  Stack,
  Alert,
} from '@mui/material'
import { Grid } from '@mui/material'
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useTasksStore } from '../../../store/tasksStore'
import { useContactsStore } from '../../../store/contactsStore'
import { useMeetingsStore } from '../../../store/meetingsStore'
import {
  CreateTaskData,
  TaskPriority,
  TaskType,
  ChecklistItem,
} from '../../../types/task'

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
      id={`task-form-tabpanel-${index}`}
      aria-labelledby={`task-form-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

const TaskForm: React.FC = () => {
  const {
    isCreating,
    isEditing,
    editingTaskId,
    categories,
    projects,
    stopCreating,
    stopEditing,
    createTask,
    updateTask,
    tasks,
  } = useTasksStore()

  const { contacts: contactsData } = useContactsStore()
  const { meetings: meetingsData } = useMeetingsStore()

  const [tabValue, setTabValue] = useState(0)
  const [contacts, setContacts] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])

  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'medium',
    type: 'task',
    dueDate: undefined,
    startDate: undefined,
    estimatedDuration: undefined,
    assignedTo: undefined,
    category: '',
    tags: [],
    project: '',
    parentTaskId: undefined,
    meetingId: undefined,
    contactId: undefined,
    location: '',
    isPrivate: false,
    checklistItems: [],
  })

  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isOpen = isCreating || isEditing
  const isEditMode = isEditing && editingTaskId

  useEffect(() => {
    if (isOpen) {
      setContacts(contactsData)
      setMeetings(meetingsData)
    }
  }, [isOpen, contactsData, meetingsData])

  useEffect(() => {
    if (isEditMode) {
      const existingTask = tasks.find(task => task.id === editingTaskId)
      if (existingTask) {
        setFormData({
          title: existingTask.title,
          description: existingTask.description || '',
          priority: existingTask.priority,
          type: existingTask.type,
          dueDate: existingTask.dueDate,
          startDate: existingTask.startDate,
          estimatedDuration: existingTask.estimatedDuration,
          assignedTo: existingTask.assignedTo,
          category: existingTask.category || '',
          tags: existingTask.tags,
          project: existingTask.project || '',
          parentTaskId: existingTask.parentTaskId,
          meetingId: existingTask.meetingId,
          contactId: existingTask.contactId,
          location: existingTask.location || '',
          isPrivate: existingTask.isPrivate,
          checklistItems: existingTask.checklistItems.map(item => ({
            title: item.title,
            completed: item.completed,
            dueDate: item.dueDate,
            assignedTo: item.assignedTo,
          })),
        })
      }
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        type: 'task',
        dueDate: undefined,
        startDate: undefined,
        estimatedDuration: undefined,
        assignedTo: undefined,
        category: '',
        tags: [],
        project: '',
        parentTaskId: undefined,
        meetingId: undefined,
        contactId: undefined,
        location: '',
        isPrivate: false,
        checklistItems: [],
      })
    }
  }, [isEditMode, editingTaskId, tasks])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.estimatedDuration && formData.estimatedDuration < 0) {
      newErrors.estimatedDuration = 'Duration must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleClose = () => {
    if (isCreating) {
      stopCreating()
    } else if (isEditing) {
      stopEditing()
    }
    setTabValue(0)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode) {
        await updateTask(editingTaskId!, formData)
      } else {
        await createTask(formData)
      }
      handleClose()
    } catch (error) {
      console.error('Failed to save task:', error)
      setErrors({ general: 'Failed to save task. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateTaskData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem = {
        title: newChecklistItem.trim(),
        completed: false,
        dueDate: undefined,
        assignedTo: undefined,
      }
      setFormData(prev => ({
        ...prev,
        checklistItems: [...prev.checklistItems, newItem],
      }))
      setNewChecklistItem('')
    }
  }

  const handleRemoveChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index),
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'action_item':
        return <TaskIcon />
      case 'meeting_followup':
        return <EventIcon />
      case 'reminder':
        return <ScheduleIcon />
      default:
        return <TaskIcon />
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '90vh', maxHeight: 800 },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
            >
              <Tab label="Basic Info" />
              <Tab label="Details" />
              <Tab label="Checklist" />
              <Tab label="Advanced" />
            </Tabs>
          </Box>

          {errors.general && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{errors.general}</Alert>
            </Box>
          )}

          <Box sx={{ p: 2, height: 'calc(90vh - 200px)', overflow: 'auto' }}>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Task Title"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      label="Priority"
                      onChange={e =>
                        handleInputChange(
                          'priority',
                          e.target.value as TaskPriority
                        )
                      }
                    >
                      <MenuItem value="low">
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <FlagIcon color="inherit" />
                          Low
                        </Box>
                      </MenuItem>
                      <MenuItem value="medium">
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <FlagIcon color="info" />
                          Medium
                        </Box>
                      </MenuItem>
                      <MenuItem value="high">
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <FlagIcon color="warning" />
                          High
                        </Box>
                      </MenuItem>
                      <MenuItem value="urgent">
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <FlagIcon color="error" />
                          Urgent
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type"
                      onChange={e =>
                        handleInputChange('type', e.target.value as TaskType)
                      }
                    >
                      <MenuItem value="task">
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getTaskTypeIcon('task')}
                          General Task
                        </Box>
                      </MenuItem>
                      <MenuItem value="action_item">
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getTaskTypeIcon('action_item')}
                          Action Item
                        </Box>
                      </MenuItem>
                      <MenuItem value="reminder">
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getTaskTypeIcon('reminder')}
                          Reminder
                        </Box>
                      </MenuItem>
                      <MenuItem value="meeting_followup">
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getTaskTypeIcon('meeting_followup')}
                          Meeting Follow-up
                        </Box>
                      </MenuItem>
                      <MenuItem value="project_milestone">
                        Project Milestone
                      </MenuItem>
                      <MenuItem value="personal">Personal</MenuItem>
                      <MenuItem value="delegated">Delegated</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <DateTimePicker
                    label="Due Date"
                    value={formData.dueDate}
                    onChange={date => handleInputChange('dueDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <DateTimePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={date => handleInputChange('startDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Estimated Duration (minutes)"
                    type="number"
                    value={formData.estimatedDuration || ''}
                    onChange={e =>
                      handleInputChange(
                        'estimatedDuration',
                        parseInt(e.target.value) || undefined
                      )
                    }
                    error={!!errors.estimatedDuration}
                    helperText={errors.estimatedDuration}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={e =>
                      handleInputChange('location', e.target.value)
                    }
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Autocomplete
                    options={contacts}
                    getOptionLabel={option =>
                      `${option.firstName} ${option.lastName}`
                    }
                    value={
                      contacts.find(c => c.id === formData.assignedTo) || null
                    }
                    onChange={(_, value) =>
                      handleInputChange('assignedTo', value?.id)
                    }
                    renderInput={params => (
                      <TextField {...params} label="Assign To" />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Autocomplete
                    freeSolo
                    options={categories}
                    value={formData.category}
                    onChange={(_, value) =>
                      handleInputChange('category', value || '')
                    }
                    renderInput={params => (
                      <TextField {...params} label="Category" />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Autocomplete
                    freeSolo
                    options={projects}
                    value={formData.project}
                    onChange={(_, value) =>
                      handleInputChange('project', value || '')
                    }
                    renderInput={params => (
                      <TextField {...params} label="Project" />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Autocomplete
                    options={meetings}
                    getOptionLabel={option => option.title}
                    value={
                      meetings.find(m => m.id === formData.meetingId) || null
                    }
                    onChange={(_, value) =>
                      handleInputChange('meetingId', value?.id)
                    }
                    renderInput={params => (
                      <TextField {...params} label="Related Meeting" />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}
                    >
                      {formData.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          size="small"
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        label="Add Tag"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} startIcon={<AddIcon />}>
                        Add
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Checklist Items
                </Typography>

                <List>
                  {formData.checklistItems.map((item, index) => (
                    <ListItem key={index} divider>
                      <Checkbox
                        checked={item.completed}
                        onChange={e => {
                          const updatedItems = [...formData.checklistItems]
                          updatedItems[index].completed = e.target.checked
                          setFormData(prev => ({
                            ...prev,
                            checklistItems: updatedItems,
                          }))
                        }}
                      />
                      <ListItemText primary={item.title} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveChecklistItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Add Checklist Item"
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    onKeyPress={e =>
                      e.key === 'Enter' && handleAddChecklistItem()
                    }
                  />
                  <Button
                    onClick={handleAddChecklistItem}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPrivate}
                        onChange={e =>
                          handleInputChange('isPrivate', e.target.checked)
                        }
                      />
                    }
                    label="Private Task"
                  />
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    Private tasks are only visible to you
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    options={tasks.filter(t => t.id !== editingTaskId)}
                    getOptionLabel={option => option.title}
                    value={
                      tasks.find(t => t.id === formData.parentTaskId) || null
                    }
                    onChange={(_, value) =>
                      handleInputChange('parentTaskId', value?.id)
                    }
                    renderInput={params => (
                      <TextField {...params} label="Parent Task (Subtask of)" />
                    )}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Make this task a subtask of another task
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Update Task'
                : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default TaskForm

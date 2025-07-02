import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  Avatar,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Paper,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Meeting } from '../../../types/meeting'
import { Task, TaskPriority, CreateTaskData } from '../../../types/task'
import { useTasksStore } from '../../../store/tasksStore'
import { useContactsStore } from '../../../store/contactsStore'

interface ActionItem {
  id: string
  description: string
  assignee?: string
  dueDate?: Date
  priority: TaskPriority
  completed: boolean
}

interface ActionItemsManagerProps {
  meeting: Meeting
  open: boolean
  onClose: () => void
  onActionItemsCreated?: (tasks: Task[]) => void
}

export const ActionItemsManager: React.FC<ActionItemsManagerProps> = ({
  meeting,
  open,
  onClose,
  onActionItemsCreated,
}) => {
  const { createTask } = useTasksStore()
  const { contacts } = useContactsStore()
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [newItemDescription, setNewItemDescription] = useState('')
  const [isCreatingTasks, setIsCreatingTasks] = useState(false)

  const handleAddActionItem = () => {
    if (!newItemDescription.trim()) return

    const newItem: ActionItem = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: newItemDescription.trim(),
      priority: 'medium',
      completed: false,
    }

    setActionItems([...actionItems, newItem])
    setNewItemDescription('')
  }

  const handleUpdateActionItem = (id: string, updates: Partial<ActionItem>) => {
    setActionItems(items =>
      items.map(item => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  const handleDeleteActionItem = (id: string) => {
    setActionItems(items => items.filter(item => item.id !== id))
  }

  const handleCreateTasks = async () => {
    if (actionItems.length === 0) return

    setIsCreatingTasks(true)
    try {
      const taskPromises = actionItems.map(async item => {
        const taskData: CreateTaskData = {
          title: item.description,
          description: `Action item from meeting: ${meeting.title}`,
          priority: item.priority,
          type: 'meeting_followup',
          meetingId: meeting.id,
          assignedTo: item.assignee,
          dueDate: item.dueDate,
          tags: ['meeting-action', 'followup'],
          category: 'Operations',
          checklistItems: [],
          isPrivate: false,
        }

        return await createTask(taskData)
      })

      const createdTasks = await Promise.all(taskPromises)

      if (onActionItemsCreated) {
        onActionItemsCreated(createdTasks)
      }

      // Clear action items after creating tasks
      setActionItems([])
      onClose()
    } catch (error) {
      console.error('Failed to create tasks from action items:', error)
    } finally {
      setIsCreatingTasks(false)
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TaskIcon />
          <Typography variant="h6">Action Items - {meeting.title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Meeting Info */}
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Meeting Details
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {meeting.startTime.toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {meeting.startTime.toLocaleTimeString()}{' '}
                - {meeting.endTime.toLocaleTimeString()}
              </Typography>
              {meeting.location && (
                <Typography variant="body2">
                  <strong>Location:</strong>{' '}
                  {typeof meeting.location === 'string'
                    ? meeting.location
                    : meeting.location.type === 'virtual'
                      ? 'Virtual Meeting'
                      : meeting.location.address ||
                        meeting.location.room ||
                        'Meeting Location'}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Add New Action Item */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Add Action Item
            </Typography>
            <Box display="flex" gap={1} alignItems="flex-end">
              <TextField
                fullWidth
                label="Action Item Description"
                value={newItemDescription}
                onChange={e => setNewItemDescription(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    handleAddActionItem()
                  }
                }}
                size="small"
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddActionItem}
                disabled={!newItemDescription.trim()}
              >
                Add
              </Button>
            </Box>
          </Paper>

          {/* Action Items List */}
          {actionItems.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Action Items ({actionItems.length})
              </Typography>
              <List>
                {actionItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      sx={{
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {item.description}
                            </Typography>
                            <Chip
                              label={item.priority}
                              size="small"
                              color={getPriorityColor(item.priority)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box display="flex" gap={2} mt={1}>
                            {/* Assignee Selection */}
                            <Autocomplete
                              size="small"
                              sx={{ minWidth: 150 }}
                              options={contacts}
                              getOptionLabel={contact =>
                                `${contact.firstName} ${contact.lastName}`
                              }
                              value={
                                contacts.find(c => c.id === item.assignee) ||
                                null
                              }
                              onChange={(_, contact) =>
                                handleUpdateActionItem(item.id, {
                                  assignee: contact?.id,
                                })
                              }
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label="Assignee"
                                  variant="outlined"
                                />
                              )}
                              renderOption={(props, contact) => (
                                <Box
                                  component="li"
                                  {...props}
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                >
                                  <Avatar
                                    src={contact.avatar}
                                    sx={{ width: 24, height: 24 }}
                                  >
                                    {contact.firstName[0]}
                                    {contact.lastName[0]}
                                  </Avatar>
                                  {contact.firstName} {contact.lastName}
                                </Box>
                              )}
                            />

                            {/* Priority Selection */}
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <InputLabel>Priority</InputLabel>
                              <Select
                                value={item.priority}
                                label="Priority"
                                onChange={e =>
                                  handleUpdateActionItem(item.id, {
                                    priority: e.target.value as TaskPriority,
                                  })
                                }
                              >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="urgent">Urgent</MenuItem>
                              </Select>
                            </FormControl>

                            {/* Due Date */}
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                label="Due Date"
                                value={item.dueDate || null}
                                onChange={date =>
                                  handleUpdateActionItem(item.id, {
                                    dueDate: date || undefined,
                                  })
                                }
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    sx: { minWidth: 140 },
                                  },
                                }}
                              />
                            </LocalizationProvider>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteActionItem(item.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < actionItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

          {actionItems.length === 0 && (
            <Alert severity="info">
              No action items added yet. Use the form above to add action items
              from this meeting.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreateTasks}
          disabled={actionItems.length === 0 || isCreatingTasks}
          startIcon={<TaskIcon />}
        >
          {isCreatingTasks
            ? 'Creating Tasks...'
            : `Create ${actionItems.length} Task${actionItems.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActionItemsManager

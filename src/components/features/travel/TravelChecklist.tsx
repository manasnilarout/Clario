import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Fab,
  Menu,
  ListItemButton,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Description as DocumentIcon,
  Work as WorkIcon,
  LocalAirport as AirportIcon,
  Hotel as HotelIcon,
  LocalHospital as HealthIcon,
  Category as OtherIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useTravelStore } from '../../../store/travelStore'
import { TravelChecklistItem, Trip } from '../../../types/travel'

interface TravelChecklistProps {
  tripId: string
}

interface ChecklistItemFormData {
  title: string
  description: string
  category: TravelChecklistItem['category']
  priority: TravelChecklistItem['priority']
  dueDate?: Date | null
  notes: string
}

const categoryIcons = {
  documents: <DocumentIcon />,
  packing: <AirportIcon />,
  booking: <HotelIcon />,
  health: <HealthIcon />,
  work: <WorkIcon />,
  other: <OtherIcon />,
}

const categoryColors = {
  documents: 'error',
  packing: 'info',
  booking: 'warning',
  health: 'success',
  work: 'primary',
  other: 'default',
} as const

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'success',
} as const

export const TravelChecklist: React.FC<TravelChecklistProps> = ({ tripId }) => {
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TravelChecklistItem | null>(
    null
  )
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterCompleted, setFilterCompleted] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('priority')
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)

  const {
    selectedTrip,
    fetchTripById,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem,
  } = useTravelStore()

  useEffect(() => {
    if (tripId) {
      fetchTripById(tripId)
    }
  }, [tripId, fetchTripById])

  const trip = selectedTrip

  if (!trip) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading trip details...</Typography>
      </Box>
    )
  }

  const checklist = trip.checklist || []

  // Filter and sort checklist items
  const filteredChecklist = checklist
    .filter(item => {
      if (filterCategory !== 'all' && item.category !== filterCategory)
        return false
      if (filterCompleted === 'completed' && !item.completed) return false
      if (filterCompleted === 'pending' && item.completed) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'category':
          return a.category.localeCompare(b.category)
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'title':
        default:
          return a.title.localeCompare(b.title)
      }
    })

  // Group by category
  const groupedChecklist = filteredChecklist.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, TravelChecklistItem[]>
  )

  const calculateProgress = () => {
    if (checklist.length === 0) return 0
    const completed = checklist.filter(item => item.completed).length
    return (completed / checklist.length) * 100
  }

  const getOverdueTasks = () => {
    const now = new Date()
    return checklist.filter(
      item => !item.completed && item.dueDate && new Date(item.dueDate) < now
    )
  }

  const getUpcomingTasks = () => {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    return checklist.filter(
      item =>
        !item.completed &&
        item.dueDate &&
        new Date(item.dueDate) >= now &&
        new Date(item.dueDate) <= threeDaysFromNow
    )
  }

  const handleToggleComplete = async (item: TravelChecklistItem) => {
    await updateChecklistItem(tripId, item.id, {
      completed: !item.completed,
    })
  }

  const handleEditItem = (item: TravelChecklistItem) => {
    setEditingItem(item)
    setItemDialogOpen(true)
  }

  const handleDeleteItem = async (item: TravelChecklistItem) => {
    await removeChecklistItem(tripId, item.id)
  }

  const renderChecklistItem = (item: TravelChecklistItem) => (
    <ListItem key={item.id} dense sx={{ px: 0 }}>
      <ListItemIcon>
        <Checkbox
          checked={item.completed}
          onChange={() => handleToggleComplete(item)}
          icon={<UncheckedIcon />}
          checkedIcon={<CheckCircleIcon />}
          color="primary"
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                textDecoration: item.completed ? 'line-through' : 'none',
                color: item.completed ? 'text.secondary' : 'text.primary',
              }}
            >
              {item.title}
            </Typography>
            <Chip
              label={item.priority}
              size="small"
              color={priorityColors[item.priority] as any}
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <Box>
            {item.description && (
              <Typography variant="caption" display="block">
                {item.description}
              </Typography>
            )}
            {item.dueDate && (
              <Typography variant="caption" color="text.secondary">
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation()
            setMenuAnchorEl(e.currentTarget)
            setEditingItem(item)
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )

  const renderProgressCard = () => {
    const progress = calculateProgress()
    const completed = checklist.filter(item => item.completed).length
    const overdue = getOverdueTasks()
    const upcoming = getUpcomingTasks()

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Checklist Progress
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body2">
                {completed} of {checklist.length} completed
              </Typography>
              <Typography variant="body2">{Math.round(progress)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="error.main">
                  {overdue.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overdue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="warning.main">
                  {upcoming.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due Soon
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  const renderFiltersAndSort = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                startAdornment={
                  <FilterIcon sx={{ mr: 1, color: 'action.active' }} />
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="documents">Documents</MenuItem>
                <MenuItem value="packing">Packing</MenuItem>
                <MenuItem value="booking">Booking</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="work">Work</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterCompleted}
                onChange={e => setFilterCompleted(e.target.value)}
              >
                <MenuItem value="all">All Items</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                startAdornment={
                  <SortIcon sx={{ mr: 1, color: 'action.active' }} />
                }
              >
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="title">Title</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5">Travel Checklist</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingItem(null)
            setItemDialogOpen(true)
          }}
        >
          Add Item
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        {trip.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {trip.destinations.map(d => d.city).join(', ')} •
        {trip.startDate.toLocaleDateString()} -{' '}
        {trip.endDate.toLocaleDateString()}
      </Typography>

      {renderProgressCard()}
      {renderFiltersAndSort()}

      {Object.keys(groupedChecklist).length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              No checklist items found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add items to your travel checklist to stay organized
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingItem(null)
                setItemDialogOpen(true)
              }}
            >
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedChecklist).map(([category, items]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  width: '100%',
                }}
              >
                {categoryIcons[category as keyof typeof categoryIcons]}
                <Typography
                  variant="subtitle1"
                  sx={{ textTransform: 'capitalize' }}
                >
                  {category}
                </Typography>
                <Badge
                  badgeContent={items.length}
                  color={
                    categoryColors[
                      category as keyof typeof categoryColors
                    ] as any
                  }
                  sx={{ ml: 'auto', mr: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <List>{items.map(renderChecklistItem)}</List>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add checklist item"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => {
          setEditingItem(null)
          setItemDialogOpen(true)
        }}
      >
        <AddIcon />
      </Fab>

      {/* Item Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null)
          setEditingItem(null)
        }}
      >
        <ListItemButton
          onClick={() => {
            if (editingItem) {
              handleEditItem(editingItem)
            }
            setMenuAnchorEl(null)
          }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </ListItemButton>
        <ListItemButton
          onClick={() => {
            if (editingItem) {
              handleDeleteItem(editingItem)
            }
            setMenuAnchorEl(null)
            setEditingItem(null)
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </ListItemButton>
      </Menu>

      {/* Add/Edit Item Dialog */}
      <ChecklistItemDialog
        open={itemDialogOpen}
        onClose={() => {
          setItemDialogOpen(false)
          setEditingItem(null)
        }}
        onSave={async itemData => {
          if (editingItem) {
            await updateChecklistItem(tripId, editingItem.id, itemData)
          } else {
            await addChecklistItem(tripId, {
              ...itemData,
              completed: false,
            })
          }
          setItemDialogOpen(false)
          setEditingItem(null)
        }}
        initialItem={editingItem}
      />
    </Box>
  )
}

// Checklist Item Dialog Component
interface ChecklistItemDialogProps {
  open: boolean
  onClose: () => void
  onSave: (item: Omit<TravelChecklistItem, 'id' | 'completed'>) => void
  initialItem?: TravelChecklistItem | null
}

const ChecklistItemDialog: React.FC<ChecklistItemDialogProps> = ({
  open,
  onClose,
  onSave,
  initialItem,
}) => {
  const [formData, setFormData] = useState<ChecklistItemFormData>({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    dueDate: null,
    notes: '',
  })

  useEffect(() => {
    if (initialItem) {
      setFormData({
        title: initialItem.title,
        description: initialItem.description || '',
        category: initialItem.category,
        priority: initialItem.priority,
        dueDate: initialItem.dueDate ? new Date(initialItem.dueDate) : null,
        notes: initialItem.notes || '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        dueDate: null,
        notes: '',
      })
    }
  }, [initialItem, open])

  const handleSave = () => {
    if (formData.title.trim()) {
      onSave({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        dueDate: formData.dueDate,
        notes: formData.notes.trim(),
      })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialItem ? 'Edit Checklist Item' : 'Add Checklist Item'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Check passport validity"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Additional details about this task..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="documents">Documents</MenuItem>
                  <MenuItem value="packing">Packing</MenuItem>
                  <MenuItem value="booking">Booking</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="work">Work</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Due Date (Optional)"
                value={formData.dueDate}
                onChange={date => setFormData({ ...formData, dueDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes (Optional)"
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional notes..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!formData.title.trim()}
        >
          {initialItem ? 'Update' : 'Add'} Item
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TravelChecklist

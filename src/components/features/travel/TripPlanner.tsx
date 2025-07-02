import React, { useState, useCallback } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useTravelStore } from '../../../store/travelStore'
import { useContactsStore } from '../../../store/contactsStore'
import { useMeetingsStore } from '../../../store/meetingsStore'
import {
  Trip,
  TripPurpose,
  TripStatus,
  Destination,
  TravelBudget,
  Traveler,
} from '../../../types/travel'

interface TripPlannerProps {
  open: boolean
  onClose: () => void
  tripId?: string // For editing existing trips
}

interface StepData {
  basicInfo: {
    title: string
    description: string
    purpose: TripPurpose
    startDate: Date | null
    endDate: Date | null
    timezone: string
  }
  destinations: Destination[]
  travelers: Traveler[]
  budget: Partial<TravelBudget>
  integrations: {
    selectedContacts: string[]
    selectedMeetings: string[]
    generateTasks: boolean
  }
}

const initialStepData: StepData = {
  basicInfo: {
    title: '',
    description: '',
    purpose: TripPurpose.BUSINESS,
    startDate: null,
    endDate: null,
    timezone: 'UTC',
  },
  destinations: [],
  travelers: [],
  budget: {
    total: 0,
    currency: 'USD',
    breakdown: {
      transportation: 0,
      accommodation: 0,
      meals: 0,
      entertainment: 0,
      business: 0,
      miscellaneous: 0,
    },
    expenseTracking: true,
  },
  integrations: {
    selectedContacts: [],
    selectedMeetings: [],
    generateTasks: true,
  },
}

const tripPurposeOptions = [
  { value: TripPurpose.BUSINESS, label: 'Business' },
  { value: TripPurpose.PERSONAL, label: 'Personal' },
  { value: TripPurpose.MIXED, label: 'Mixed' },
  { value: TripPurpose.CONFERENCE, label: 'Conference' },
  { value: TripPurpose.TRAINING, label: 'Training' },
  { value: TripPurpose.CLIENT_VISIT, label: 'Client Visit' },
  { value: TripPurpose.VACATION, label: 'Vacation' },
  { value: TripPurpose.FAMILY, label: 'Family' },
]

const popularDestinations = [
  { city: 'New York', country: 'USA', timezone: 'America/New_York' },
  { city: 'London', country: 'UK', timezone: 'Europe/London' },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
  { city: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles' },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin' },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
  { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
  { city: 'Toronto', country: 'Canada', timezone: 'America/Toronto' },
]

export const TripPlanner: React.FC<TripPlannerProps> = ({
  open,
  onClose,
  tripId,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [stepData, setStepData] = useState<StepData>(initialStepData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [destinationDialogOpen, setDestinationDialogOpen] = useState(false)
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null)

  const { createTrip, updateTrip, selectedTrip, fetchTripById } =
    useTravelStore()
  const { contacts } = useContactsStore()
  const { meetings } = useMeetingsStore()

  // Load existing trip data for editing
  React.useEffect(() => {
    if (tripId && open) {
      fetchTripById(tripId)
    }
  }, [tripId, open, fetchTripById])

  React.useEffect(() => {
    if (selectedTrip && tripId) {
      setStepData({
        basicInfo: {
          title: selectedTrip.title,
          description: selectedTrip.description || '',
          purpose: selectedTrip.purpose,
          startDate: selectedTrip.startDate,
          endDate: selectedTrip.endDate,
          timezone: selectedTrip.timezone,
        },
        destinations: selectedTrip.destinations,
        travelers: selectedTrip.travelers,
        budget: selectedTrip.budget || initialStepData.budget,
        integrations: {
          selectedContacts: selectedTrip.relatedContacts,
          selectedMeetings: selectedTrip.relatedMeetings,
          generateTasks: true,
        },
      })
    }
  }, [selectedTrip, tripId])

  const steps = [
    {
      label: 'Basic Information',
      description: 'Trip details and dates',
    },
    {
      label: 'Destinations',
      description: 'Where are you going?',
    },
    {
      label: 'Travelers',
      description: 'Who is traveling?',
    },
    {
      label: 'Budget Planning',
      description: 'Estimate your expenses',
    },
    {
      label: 'Integrations',
      description: 'Link contacts and meetings',
    },
    {
      label: 'Review & Create',
      description: 'Confirm your trip details',
    },
  ]

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setStepData(initialStepData)
    setError(null)
  }

  const updateStepData = useCallback((step: keyof StepData, data: any) => {
    setStepData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }))
  }, [])

  const calculateTripDuration = () => {
    if (stepData.basicInfo.startDate && stepData.basicInfo.endDate) {
      return Math.ceil(
        (stepData.basicInfo.endDate.getTime() -
          stepData.basicInfo.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    }
    return 0
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(
          stepData.basicInfo.title &&
          stepData.basicInfo.startDate &&
          stepData.basicInfo.endDate &&
          stepData.basicInfo.startDate < stepData.basicInfo.endDate
        )
      case 1:
        return stepData.destinations.length > 0
      case 2:
        return stepData.travelers.length > 0
      case 3:
        return stepData.budget.total !== undefined && stepData.budget.total > 0
      default:
        return true
    }
  }

  const handleCreateTrip = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
        title: stepData.basicInfo.title,
        description: stepData.basicInfo.description,
        purpose: stepData.basicInfo.purpose,
        status: TripStatus.PLANNING,
        startDate: stepData.basicInfo.startDate!,
        endDate: stepData.basicInfo.endDate!,
        duration: calculateTripDuration(),
        timezone: stepData.basicInfo.timezone,
        destinations: stepData.destinations,
        transportation: [],
        accommodation: [],
        budget: stepData.budget as TravelBudget,
        expenses: [],
        checklist: [], // Will be auto-generated based on purpose
        relatedMeetings: stepData.integrations.selectedMeetings,
        relatedContacts: stepData.integrations.selectedContacts,
        relatedTasks: [],
        travelers: stepData.travelers,
        approvals: [],
        createdBy: 'current-user',
        isArchived: false,
        tags: [stepData.basicInfo.purpose],
        visibility: 'private',
      }

      if (tripId) {
        await updateTrip(tripId, tripData)
      } else {
        await createTrip(tripData)
      }

      onClose()
      handleReset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip')
    } finally {
      setIsLoading(false)
    }
  }

  const renderBasicInfoStep = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Trip Title"
            value={stepData.basicInfo.title}
            onChange={e =>
              updateStepData('basicInfo', { title: e.target.value })
            }
            placeholder="e.g., Q1 Business Review - London"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (Optional)"
            value={stepData.basicInfo.description}
            onChange={e =>
              updateStepData('basicInfo', { description: e.target.value })
            }
            placeholder="Brief description of the trip purpose and goals..."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Trip Purpose</InputLabel>
            <Select
              value={stepData.basicInfo.purpose}
              onChange={e =>
                updateStepData('basicInfo', {
                  purpose: e.target.value as TripPurpose,
                })
              }
            >
              {tripPurposeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Primary Timezone</InputLabel>
            <Select
              value={stepData.basicInfo.timezone}
              onChange={e =>
                updateStepData('basicInfo', { timezone: e.target.value })
              }
            >
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="America/New_York">Eastern Time</MenuItem>
              <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
              <MenuItem value="Europe/London">London</MenuItem>
              <MenuItem value="Europe/Paris">Paris</MenuItem>
              <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
              <MenuItem value="Asia/Singapore">Singapore</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <DatePicker
            label="Start Date"
            value={stepData.basicInfo.startDate}
            onChange={date => updateStepData('basicInfo', { startDate: date })}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DatePicker
            label="End Date"
            value={stepData.basicInfo.endDate}
            onChange={date => updateStepData('basicInfo', { endDate: date })}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        {calculateTripDuration() > 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              Trip duration: {calculateTripDuration()} day
              {calculateTripDuration() !== 1 ? 's' : ''}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  )

  const renderDestinationsStep = () => (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Destinations</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          onClick={() => setDestinationDialogOpen(true)}
        >
          Add Destination
        </Button>
      </Box>

      {stepData.destinations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No destinations added yet. Click "Add Destination" to get started.
          </Typography>
        </Paper>
      ) : (
        <List>
          {stepData.destinations.map((destination, index) => (
            <ListItem key={destination.id} divider>
              <ListItemText
                primary={`${destination.city}, ${destination.country}`}
                secondary={`${destination.arrivalDate.toLocaleDateString()} - ${destination.departureDate.toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    setEditingDestination(destination)
                    setDestinationDialogOpen(true)
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => {
                    setStepData(prev => ({
                      ...prev,
                      destinations: prev.destinations.filter(
                        d => d.id !== destination.id
                      ),
                    }))
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <DestinationDialog
        open={destinationDialogOpen}
        onClose={() => {
          setDestinationDialogOpen(false)
          setEditingDestination(null)
        }}
        onSave={destination => {
          if (editingDestination) {
            setStepData(prev => ({
              ...prev,
              destinations: prev.destinations.map(d =>
                d.id === editingDestination.id ? destination : d
              ),
            }))
          } else {
            setStepData(prev => ({
              ...prev,
              destinations: [...prev.destinations, destination],
            }))
          }
          setDestinationDialogOpen(false)
          setEditingDestination(null)
        }}
        initialDestination={editingDestination}
        tripDates={{
          start: stepData.basicInfo.startDate,
          end: stepData.basicInfo.endDate,
        }}
      />
    </Box>
  )

  const renderTravelersStep = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Travelers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add travelers for this trip. You will be automatically included as the
        primary traveler.
      </Typography>

      {/* Primary traveler (current user) */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon color="primary" />
            <Typography variant="subtitle1">You (Primary Traveler)</Typography>
            <Chip label="Primary" size="small" color="primary" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            user@company.com
          </Typography>
        </CardContent>
      </Card>

      {/* TODO: Add interface for additional travelers */}
      <Alert severity="info">
        Additional traveler management will be available in the next update.
      </Alert>
    </Box>
  )

  const renderBudgetStep = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Budget Planning
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Total Budget"
            type="number"
            value={stepData.budget.total || ''}
            onChange={e =>
              updateStepData('budget', {
                total: parseFloat(e.target.value) || 0,
              })
            }
            InputProps={{
              startAdornment: (
                <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={stepData.budget.currency || 'USD'}
              onChange={e =>
                updateStepData('budget', { currency: e.target.value })
              }
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              <MenuItem value="JPY">JPY</MenuItem>
              <MenuItem value="CAD">CAD</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Budget Breakdown
          </Typography>
        </Grid>

        {Object.entries(stepData.budget.breakdown || {}).map(
          ([category, amount]) => (
            <Grid item xs={12} md={6} key={category}>
              <TextField
                fullWidth
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                type="number"
                value={amount}
                onChange={e =>
                  updateStepData('budget', {
                    breakdown: {
                      ...stepData.budget.breakdown,
                      [category]: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </Grid>
          )
        )}
      </Grid>

      {stepData.budget.total && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Total breakdown:{' '}
          {Object.values(stepData.budget.breakdown || {}).reduce(
            (a, b) => a + b,
            0
          )}{' '}
          {stepData.budget.currency}
          {Object.values(stepData.budget.breakdown || {}).reduce(
            (a, b) => a + b,
            0
          ) !== stepData.budget.total && (
            <Typography variant="caption" display="block">
              Note: Breakdown doesn't match total budget
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  )

  const renderIntegrationsStep = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Link Contacts & Meetings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={contacts}
            getOptionLabel={option => `${option.firstName} ${option.lastName}`}
            value={contacts.filter(c =>
              stepData.integrations.selectedContacts.includes(c.id)
            )}
            onChange={(_, newValue) => {
              updateStepData('integrations', {
                selectedContacts: newValue.map(c => c.id),
              })
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Related Contacts"
                placeholder="Search contacts..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={`${option.firstName} ${option.lastName}`}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={meetings}
            getOptionLabel={option => option.title}
            value={meetings.filter(m =>
              stepData.integrations.selectedMeetings.includes(m.id)
            )}
            onChange={(_, newValue) => {
              updateStepData('integrations', {
                selectedMeetings: newValue.map(m => m.id),
              })
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Related Meetings"
                placeholder="Search meetings..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.title}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
          />
        </Grid>
      </Grid>
    </Box>
  )

  const renderReviewStep = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Review Trip Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              <Typography variant="body2">
                <strong>Title:</strong> {stepData.basicInfo.title}
              </Typography>
              <Typography variant="body2">
                <strong>Purpose:</strong> {stepData.basicInfo.purpose}
              </Typography>
              <Typography variant="body2">
                <strong>Dates:</strong>{' '}
                {stepData.basicInfo.startDate?.toLocaleDateString()} -{' '}
                {stepData.basicInfo.endDate?.toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {calculateTripDuration()} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Destinations ({stepData.destinations.length})
              </Typography>
              {stepData.destinations.map((dest, index) => (
                <Typography key={dest.id} variant="body2">
                  {index + 1}. {dest.city}, {dest.country}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Budget
              </Typography>
              <Typography variant="body2">
                <strong>Total:</strong> {stepData.budget.total}{' '}
                {stepData.budget.currency}
              </Typography>
              <Typography variant="body2">
                <strong>Transportation:</strong>{' '}
                {stepData.budget.breakdown?.transportation}{' '}
                {stepData.budget.currency}
              </Typography>
              <Typography variant="body2">
                <strong>Accommodation:</strong>{' '}
                {stepData.budget.breakdown?.accommodation}{' '}
                {stepData.budget.currency}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Integrations
              </Typography>
              <Typography variant="body2">
                <strong>Contacts:</strong>{' '}
                {stepData.integrations.selectedContacts.length} selected
              </Typography>
              <Typography variant="body2">
                <strong>Meetings:</strong>{' '}
                {stepData.integrations.selectedMeetings.length} selected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle>{tripId ? 'Edit Trip' : 'Plan New Trip'}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="subtitle1">{step.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {index === 0 && renderBasicInfoStep()}
                {index === 1 && renderDestinationsStep()}
                {index === 2 && renderTravelersStep()}
                {index === 3 && renderBudgetStep()}
                {index === 4 && renderIntegrationsStep()}
                {index === 5 && renderReviewStep()}

                <Box sx={{ mt: 2 }}>
                  <div>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                    {index === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleCreateTrip}
                        disabled={isLoading || !validateStep(index)}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {isLoading
                          ? 'Creating...'
                          : tripId
                            ? 'Update Trip'
                            : 'Create Trip'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!validateStep(index)}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

// Destination Dialog Component
interface DestinationDialogProps {
  open: boolean
  onClose: () => void
  onSave: (destination: Destination) => void
  initialDestination?: Destination | null
  tripDates: {
    start: Date | null
    end: Date | null
  }
}

const DestinationDialog: React.FC<DestinationDialogProps> = ({
  open,
  onClose,
  onSave,
  initialDestination,
  tripDates,
}) => {
  const [destination, setDestination] = useState<Partial<Destination>>({
    city: '',
    country: '',
    arrivalDate: tripDates.start || new Date(),
    departureDate: tripDates.end || new Date(),
    purpose: '',
    notes: '',
  })

  React.useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination)
    } else {
      setDestination({
        city: '',
        country: '',
        arrivalDate: tripDates.start || new Date(),
        departureDate: tripDates.end || new Date(),
        purpose: '',
        notes: '',
      })
    }
  }, [initialDestination, tripDates])

  const handleSave = () => {
    if (
      destination.city &&
      destination.country &&
      destination.arrivalDate &&
      destination.departureDate
    ) {
      const fullDestination: Destination = {
        id: initialDestination?.id || `dest-${Date.now()}`,
        city: destination.city,
        country: destination.country,
        arrivalDate: destination.arrivalDate,
        departureDate: destination.departureDate,
        purpose: destination.purpose || '',
        notes: destination.notes,
        activities: initialDestination?.activities || [],
        localContacts: initialDestination?.localContacts || [],
        plannedMeetings: initialDestination?.plannedMeetings || [],
        importantInfo: initialDestination?.importantInfo || {
          timezone: 'UTC',
          currency: 'USD',
          language: 'English',
        },
      }
      onSave(fullDestination)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialDestination ? 'Edit Destination' : 'Add Destination'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={popularDestinations}
                getOptionLabel={option => `${option.city}, ${option.country}`}
                value={
                  popularDestinations.find(
                    d =>
                      d.city === destination.city &&
                      d.country === destination.country
                  ) || null
                }
                onChange={(_, newValue) => {
                  if (newValue) {
                    setDestination(prev => ({
                      ...prev,
                      city: newValue.city,
                      country: newValue.country,
                    }))
                  }
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="City"
                    value={destination.city}
                    onChange={e =>
                      setDestination(prev => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={destination.country}
                onChange={e =>
                  setDestination(prev => ({ ...prev, country: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Arrival Date"
                value={destination.arrivalDate}
                onChange={date =>
                  setDestination(prev => ({
                    ...prev,
                    arrivalDate: date || new Date(),
                  }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Departure Date"
                value={destination.departureDate}
                onChange={date =>
                  setDestination(prev => ({
                    ...prev,
                    departureDate: date || new Date(),
                  }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose of Visit"
                value={destination.purpose}
                onChange={e =>
                  setDestination(prev => ({ ...prev, purpose: e.target.value }))
                }
                placeholder="e.g., Client meetings, Conference attendance..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={destination.notes}
                onChange={e =>
                  setDestination(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any additional notes about this destination..."
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
          disabled={
            !destination.city ||
            !destination.country ||
            !destination.arrivalDate ||
            !destination.departureDate
          }
        >
          {initialDestination ? 'Update' : 'Add'} Destination
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TripPlanner

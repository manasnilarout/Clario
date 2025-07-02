import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Group as GroupIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  WatchLater as WatchLaterIcon,
  TrendingUp as TrendingUpIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material'
import { format, addDays, addHours, startOfHour } from 'date-fns'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { useContactsStore } from '../../../store/contactsStore'
import { MeetingConflict } from '../../../types/meeting'

interface TimeSlotSuggestion {
  startTime: Date
  endTime: Date
  score: number
  conflictCount: number
  availableAttendees: number
  totalAttendees: number
  conflicts: MeetingConflict[]
  workingHours: boolean
  reason: string
  alternativeRooms?: string[]
}

interface SchedulingPreferences {
  preferredTimes: { start: number; end: number }[] // hours in 24h format
  bufferMinutes: number
  allowWeekends: boolean
  allowAfterHours: boolean
  maxConflicts: number
  minAvailableAttendees: number
}

interface SchedulingAssistantProps {
  attendeeIds: string[]
  duration: number // in minutes
  preferredStartTime?: Date
  onTimeSlotSelected: (startTime: Date, endTime: Date) => void
  excludeMeetingId?: string
  meetingRoomCapacity?: number
  isRecurring?: boolean
  recurringPattern?: any
}

const SchedulingAssistant: React.FC<SchedulingAssistantProps> = ({
  attendeeIds,
  duration,
  preferredStartTime,
  onTimeSlotSelected,
  excludeMeetingId,
  meetingRoomCapacity,
  isRecurring = false,
  recurringPattern,
}) => {
  const {
    getAttendeeAvailability,
    checkMeetingConflicts,
    getMeetingsByDateRange,
  } = useMeetingsStore()
  const { contacts } = useContactsStore()

  const [suggestions, setSuggestions] = useState<TimeSlotSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchRange, setSearchRange] = useState(7) // days
  const [preferences, setPreferences] = useState<SchedulingPreferences>({
    preferredTimes: [
      { start: 9, end: 12 }, // Morning
      { start: 14, end: 17 }, // Afternoon
    ],
    bufferMinutes: 15,
    allowWeekends: false,
    allowAfterHours: false,
    maxConflicts: 1,
    minAvailableAttendees: Math.ceil(attendeeIds.length * 0.8), // 80% availability
  })
  const [showPreferences, setShowPreferences] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<TimeSlotSuggestion | null>(null)

  const generateSuggestions = useCallback(async () => {
    setIsLoading(true)
    try {
      const startDate = preferredStartTime || new Date()
      const endDate = addDays(startDate, searchRange)

      // Generate potential time slots
      const timeSlots = generateTimeSlots(startDate, endDate)

      // Check availability for each time slot
      const evaluatedSlots = await evaluateTimeSlots(timeSlots)

      // Sort by score and take top suggestions
      const sortedSuggestions = evaluatedSlots
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

      setSuggestions(sortedSuggestions)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    preferredStartTime,
    searchRange,
    attendeeIds,
    duration,
    preferences,
    getAttendeeAvailability,
    checkMeetingConflicts,
    excludeMeetingId,
  ])

  // Generate time slot suggestions
  useEffect(() => {
    if (attendeeIds.length > 0 && duration > 0) {
      generateSuggestions()
    }
  }, [
    attendeeIds,
    duration,
    searchRange,
    preferences,
    preferredStartTime,
    generateSuggestions,
  ])

  const generateTimeSlots = (startDate: Date, endDate: Date): Date[] => {
    const slots: Date[] = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      // Skip weekends if not allowed
      if (
        !preferences.allowWeekends &&
        (currentDate.getDay() === 0 || currentDate.getDay() === 6)
      ) {
        currentDate = addDays(currentDate, 1)
        continue
      }

      // Generate slots for each preferred time range
      preferences.preferredTimes.forEach(timeRange => {
        let slotTime = new Date(currentDate)
        slotTime.setHours(timeRange.start, 0, 0, 0)

        while (slotTime.getHours() <= timeRange.end - duration / 60) {
          // Add buffer from last meeting
          const slotWithBuffer = new Date(
            slotTime.getTime() - preferences.bufferMinutes * 60 * 1000
          )
          slots.push(startOfHour(slotWithBuffer))

          slotTime = addHours(slotTime, 0.5) // 30-minute intervals
        }
      })

      // Add after-hours slots if allowed
      if (preferences.allowAfterHours) {
        let afterHoursSlot = new Date(currentDate)
        afterHoursSlot.setHours(18, 0, 0, 0)

        while (afterHoursSlot.getHours() <= 20) {
          slots.push(new Date(afterHoursSlot))
          afterHoursSlot = addHours(afterHoursSlot, 0.5)
        }
      }

      currentDate = addDays(currentDate, 1)
    }

    return slots
  }

  const evaluateTimeSlots = async (
    timeSlots: Date[]
  ): Promise<TimeSlotSuggestion[]> => {
    const suggestions: TimeSlotSuggestion[] = []

    for (const startTime of timeSlots) {
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

      try {
        // Check attendee availability
        const availability = await getAttendeeAvailability(
          attendeeIds,
          startTime,
          endTime
        )

        // Check for conflicts
        const conflicts = checkMeetingConflicts(
          startTime,
          endTime,
          attendeeIds,
          excludeMeetingId
        )

        // Calculate metrics
        const availableAttendees = availability.filter(
          a => a.isAvailable
        ).length
        const conflictCount = conflicts.length
        const workingHours = isWorkingHours(startTime)

        // Calculate score
        let score = 100

        // Penalize for conflicts
        score -= conflictCount * 20

        // Reward for availability
        score += (availableAttendees / attendeeIds.length) * 30

        // Reward for working hours
        if (workingHours) score += 20

        // Reward for preferred times
        if (isPreferredTime(startTime)) score += 15

        // Penalize for weekends
        if (
          !preferences.allowWeekends &&
          (startTime.getDay() === 0 || startTime.getDay() === 6)
        ) {
          score -= 30
        }

        // Apply constraints
        if (
          conflictCount <= preferences.maxConflicts &&
          availableAttendees >= preferences.minAvailableAttendees
        ) {
          suggestions.push({
            startTime,
            endTime,
            score: Math.max(0, score),
            conflictCount,
            availableAttendees,
            totalAttendees: attendeeIds.length,
            conflicts,
            workingHours,
            reason: generateReason(
              score,
              conflictCount,
              availableAttendees,
              attendeeIds.length,
              workingHours
            ),
            alternativeRooms: meetingRoomCapacity
              ? ['Conference Room B', 'Meeting Room 3']
              : undefined,
          })
        }
      } catch (error) {
        console.error(`Failed to evaluate time slot ${startTime}:`, error)
      }
    }

    return suggestions
  }

  const isWorkingHours = (date: Date): boolean => {
    const hour = date.getHours()
    const day = date.getDay()
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17
  }

  const isPreferredTime = (date: Date): boolean => {
    const hour = date.getHours()
    return preferences.preferredTimes.some(
      range => hour >= range.start && hour <= range.end
    )
  }

  const generateReason = (
    score: number,
    conflicts: number,
    available: number,
    total: number,
    workingHours: boolean
  ): string => {
    if (score >= 80) return 'Excellent time slot with high availability'
    if (score >= 60) return 'Good time slot with most attendees available'
    if (conflicts > 0) return `${conflicts} conflict(s) but manageable`
    if (available < total)
      return `${total - available} attendee(s) not available`
    if (!workingHours) return 'Outside standard working hours'
    return 'Alternative time slot'
  }

  const handleSuggestionSelect = (suggestion: TimeSlotSuggestion) => {
    setSelectedSuggestion(suggestion)
    onTimeSlotSelected(suggestion.startTime, suggestion.endTime)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6">Smart Scheduling Assistant</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowPreferences(true)}
            variant="outlined"
            size="small"
          >
            Preferences
          </Button>

          <Button
            startIcon={<RefreshIcon />}
            onClick={generateSuggestions}
            disabled={isLoading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Search Range */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Search Range</InputLabel>
          <Select
            value={searchRange}
            onChange={e => setSearchRange(e.target.value as number)}
            label="Search Range"
          >
            <MenuItem value={3}>Next 3 days</MenuItem>
            <MenuItem value={7}>Next week</MenuItem>
            <MenuItem value={14}>Next 2 weeks</MenuItem>
            <MenuItem value={30}>Next month</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary">
          Looking for {duration}-minute slots for {attendeeIds.length} attendees
        </Typography>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* No Suggestions */}
      {!isLoading && suggestions.length === 0 && (
        <Alert severity="info">
          No suitable time slots found. Try adjusting your preferences or
          extending the search range.
        </Alert>
      )}

      {/* Suggestions */}
      {!isLoading && suggestions.length > 0 && (
        <Grid container spacing={2}>
          {suggestions.map((suggestion, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: selectedSuggestion === suggestion ? 2 : 1,
                  borderColor:
                    selectedSuggestion === suggestion
                      ? 'primary.main'
                      : 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <CardContent>
                  {/* Score Badge */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={`${getScoreLabel(suggestion.score)} (${Math.round(suggestion.score)}%)`}
                      color={getScoreColor(suggestion.score)}
                      size="small"
                    />
                    {index === 0 && (
                      <Chip
                        label="Best Match"
                        color="primary"
                        size="small"
                        icon={<TrendingUpIcon />}
                      />
                    )}
                  </Box>

                  {/* Time */}
                  <Typography variant="h6" gutterBottom>
                    {format(suggestion.startTime, 'MMM d, yyyy')}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {format(suggestion.startTime, 'h:mm a')} -{' '}
                    {format(suggestion.endTime, 'h:mm a')}
                  </Typography>

                  {/* Availability */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {suggestion.availableAttendees} /{' '}
                      {suggestion.totalAttendees} available
                    </Typography>
                    {suggestion.availableAttendees ===
                      suggestion.totalAttendees && (
                      <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                    )}
                  </Box>

                  {/* Conflicts */}
                  {suggestion.conflictCount > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <WarningIcon sx={{ fontSize: 16 }} color="warning" />
                      <Typography variant="body2" color="warning.main">
                        {suggestion.conflictCount} conflict
                        {suggestion.conflictCount > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}

                  {/* Working Hours */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <WatchLaterIcon sx={{ fontSize: 16 }} />
                    <Typography
                      variant="body2"
                      color={
                        suggestion.workingHours
                          ? 'success.main'
                          : 'text.secondary'
                      }
                    >
                      {suggestion.workingHours
                        ? 'Working hours'
                        : 'After hours'}
                    </Typography>
                  </Box>

                  {/* Reason */}
                  <Typography variant="body2" color="text.secondary">
                    {suggestion.reason}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    variant={
                      selectedSuggestion === suggestion
                        ? 'contained'
                        : 'outlined'
                    }
                    fullWidth
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {selectedSuggestion === suggestion
                      ? 'Selected'
                      : 'Select This Time'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Preferences Dialog */}
      <Dialog
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scheduling Preferences</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Buffer Time */}
            <TextField
              fullWidth
              label="Buffer Time (minutes)"
              type="number"
              value={preferences.bufferMinutes}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  bufferMinutes: parseInt(e.target.value) || 0,
                }))
              }
              helperText="Time between meetings for preparation/travel"
            />

            {/* Min Available Attendees */}
            <TextField
              fullWidth
              label="Minimum Available Attendees"
              type="number"
              value={preferences.minAvailableAttendees}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  minAvailableAttendees: parseInt(e.target.value) || 0,
                }))
              }
              inputProps={{ max: attendeeIds.length }}
              helperText={`Out of ${attendeeIds.length} total attendees`}
            />

            {/* Max Conflicts */}
            <TextField
              fullWidth
              label="Maximum Acceptable Conflicts"
              type="number"
              value={preferences.maxConflicts}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  maxConflicts: parseInt(e.target.value) || 0,
                }))
              }
              helperText="Number of scheduling conflicts you can tolerate"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreferences(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowPreferences(false)
              generateSuggestions()
            }}
            variant="contained"
          >
            Apply & Refresh
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SchedulingAssistant

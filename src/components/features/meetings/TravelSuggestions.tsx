import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch,
  LinearProgress,
} from '@mui/material'
import {
  Flight as FlightIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  TrendingUp as OptimizeIcon,
  Close as CloseIcon,
  AutoAwesome as MagicIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material'
import { format, differenceInDays } from 'date-fns'
import type { Meeting } from '../../../types/meeting'
import type { Trip } from '../../../types/travel'
import { travelMeetingIntegration } from '../../../services/travelMeetingIntegration'
import { meetingsService } from '../../../services/meetingsService'

interface TravelSuggestionsProps {
  meetings: Meeting[]
  onTripCreated?: (trip: Trip) => void
}

interface MeetingCluster {
  location: string
  meetings: Meeting[]
  dateRange: {
    start: Date
    end: Date
  }
}

const TravelSuggestions: React.FC<TravelSuggestionsProps> = ({
  meetings,
  onTripCreated,
}) => {
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([])
  const [clusters, setClusters] = useState<MeetingCluster[]>([])
  const [createTripDialogOpen, setCreateTripDialogOpen] = useState(false)
  const [creatingTrip, setCreatingTrip] = useState(false)
  const [autoSelectClusters, setAutoSelectClusters] = useState(true)
  const [showOnlyOutOfTown, setShowOnlyOutOfTown] = useState(true)

  useEffect(() => {
    analyzeMeetingsForTravel()
  }, [meetings, showOnlyOutOfTown])

  const analyzeMeetingsForTravel = () => {
    // Filter meetings that have locations and are suitable for travel
    const travelCandidates = meetings.filter(meeting => {
      if (!meeting.location) return false

      // Filter out local meetings if showOnlyOutOfTown is true
      if (showOnlyOutOfTown) {
        const isLocal =
          meeting.location.toLowerCase().includes('office') ||
          meeting.location.toLowerCase().includes('local') ||
          meeting.location.toLowerCase().includes('headquarters')
        if (isLocal) return false
      }

      // Only include future meetings
      return new Date(meeting.startTime) > new Date()
    })

    // Group meetings by location
    const locationMap = new Map<string, Meeting[]>()

    travelCandidates.forEach(meeting => {
      const location = normalizeLocation(meeting.location!)
      if (!locationMap.has(location)) {
        locationMap.set(location, [])
      }
      locationMap.get(location)!.push(meeting)
    })

    // Create clusters for locations with multiple meetings or strategic importance
    const newClusters: MeetingCluster[] = []

    locationMap.forEach((meetingsInLocation, location) => {
      // Include if multiple meetings or if meetings span multiple days
      const sortedMeetings = meetingsInLocation.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )

      const dateRange = {
        start: new Date(sortedMeetings[0].startTime),
        end: new Date(sortedMeetings[sortedMeetings.length - 1].endTime),
      }

      const daySpan = differenceInDays(dateRange.end, dateRange.start)

      // Include if multiple meetings or spans more than 1 day, or high-value meetings
      const shouldInclude =
        meetingsInLocation.length > 1 ||
        daySpan > 0 ||
        meetingsInLocation.some(
          m =>
            m.title.toLowerCase().includes('client') ||
            m.title.toLowerCase().includes('conference') ||
            m.attendees.length > 5
        )

      if (shouldInclude) {
        newClusters.push({
          location,
          meetings: sortedMeetings,
          dateRange,
        })
      }
    })

    setClusters(newClusters)

    // Auto-select meetings if enabled
    if (autoSelectClusters && newClusters.length > 0) {
      const autoSelected = newClusters
        .flatMap(cluster => cluster.meetings)
        .map(meeting => meeting.id)
      setSelectedMeetings(autoSelected)
    }
  }

  const normalizeLocation = (location: string): string => {
    // Simple location normalization - extract city/country
    const normalized = location.split(',')[0].trim()
    return (
      normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
    )
  }

  const handleMeetingToggle = (meetingId: string) => {
    setSelectedMeetings(prev =>
      prev.includes(meetingId)
        ? prev.filter(id => id !== meetingId)
        : [...prev, meetingId]
    )
  }

  const handleClusterToggle = (cluster: MeetingCluster) => {
    const clusterMeetingIds = cluster.meetings.map(m => m.id)
    const allSelected = clusterMeetingIds.every(id =>
      selectedMeetings.includes(id)
    )

    if (allSelected) {
      // Deselect all meetings in cluster
      setSelectedMeetings(prev =>
        prev.filter(id => !clusterMeetingIds.includes(id))
      )
    } else {
      // Select all meetings in cluster
      setSelectedMeetings(prev => [...new Set([...prev, ...clusterMeetingIds])])
    }
  }

  const handleCreateTrip = async () => {
    if (selectedMeetings.length === 0) return

    setCreatingTrip(true)
    try {
      const trip =
        await travelMeetingIntegration.createTripFromMeetings(selectedMeetings)
      onTripCreated?.(trip)
      setCreateTripDialogOpen(false)
      setSelectedMeetings([])
    } catch (error) {
      console.error('Error creating trip:', error)
    } finally {
      setCreatingTrip(false)
    }
  }

  const getClusterStats = (cluster: MeetingCluster) => {
    const totalAttendees = cluster.meetings.reduce(
      (sum, meeting) => sum + meeting.attendees.length,
      0
    )
    const uniqueAttendees = new Set(
      cluster.meetings.flatMap(m => m.attendees.map(a => a.id))
    ).size
    const daySpan =
      differenceInDays(cluster.dateRange.end, cluster.dateRange.start) + 1

    return { totalAttendees, uniqueAttendees, daySpan }
  }

  const estimatedTripValue = clusters
    .filter(cluster =>
      cluster.meetings.some(m => selectedMeetings.includes(m.id))
    )
    .reduce((sum, cluster) => {
      const stats = getClusterStats(cluster)
      return sum + stats.uniqueAttendees * 100 + cluster.meetings.length * 50 // Simple value estimation
    }, 0)

  if (clusters.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No travel opportunities found in your upcoming meetings.
        {showOnlyOutOfTown &&
          ' Try including local meetings to see more options.'}
      </Alert>
    )
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <FlightIcon color="primary" />
              <Typography variant="h6">
                Travel Opportunities ({clusters.length} destinations)
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSelectClusters}
                    onChange={e => setAutoSelectClusters(e.target.checked)}
                    size="small"
                  />
                }
                label="Auto-select"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyOutOfTown}
                    onChange={e => setShowOnlyOutOfTown(e.target.checked)}
                    size="small"
                  />
                }
                label="Out-of-town only"
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            AI-detected opportunities to combine meetings into efficient travel
            plans.
          </Typography>

          {selectedMeetings.length > 0 && (
            <Box mt={2} p={2} bgcolor="primary.50" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>
                Selected: {selectedMeetings.length} meetings • Estimated value:
                ${estimatedTripValue}
              </Typography>
              <Button
                variant="contained"
                startIcon={<MagicIcon />}
                onClick={() => setCreateTripDialogOpen(true)}
                disabled={selectedMeetings.length === 0}
              >
                Create Optimized Trip
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {clusters.map((cluster, index) => {
          const stats = getClusterStats(cluster)
          const clusterMeetingIds = cluster.meetings.map(m => m.id)
          const allSelected = clusterMeetingIds.every(id =>
            selectedMeetings.includes(id)
          )
          const someSelected = clusterMeetingIds.some(id =>
            selectedMeetings.includes(id)
          )

          return (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: someSelected ? 2 : 1,
                  borderColor: someSelected ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationIcon color="action" />
                      <Typography variant="h6" noWrap>
                        {cluster.location}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected && !allSelected}
                          onChange={() => handleClusterToggle(cluster)}
                        />
                      }
                      label=""
                    />
                  </Box>

                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      label={`${cluster.meetings.length} meeting${cluster.meetings.length > 1 ? 's' : ''}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${stats.daySpan} day${stats.daySpan > 1 ? 's' : ''}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${stats.uniqueAttendees} people`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {format(cluster.dateRange.start, 'MMM dd')} -{' '}
                    {format(cluster.dateRange.end, 'MMM dd, yyyy')}
                  </Typography>

                  <List dense>
                    {cluster.meetings.slice(0, 3).map(meeting => (
                      <ListItem key={meeting.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedMeetings.includes(meeting.id)}
                            onChange={() => handleMeetingToggle(meeting.id)}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {meeting.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {format(
                                new Date(meeting.startTime),
                                'MMM dd, HH:mm'
                              )}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    {cluster.meetings.length > 3 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ pl: 2 }}
                      >
                        +{cluster.meetings.length - 3} more meetings
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Create Trip Dialog */}
      <Dialog
        open={createTripDialogOpen}
        onClose={() => setCreateTripDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <MagicIcon color="primary" />
              <Typography variant="h6">Create Optimized Trip</Typography>
            </Box>
            <IconButton onClick={() => setCreateTripDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            AI will analyze your selected meetings to create an optimized travel
            plan with:
          </Typography>

          <Box mt={2} mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <OptimizeIcon color="primary" sx={{ mb: 1 }} />
                  <Typography variant="subtitle2">
                    Route Optimization
                  </Typography>
                  <Typography variant="caption">
                    Minimize travel time
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <ScheduleIcon color="primary" sx={{ mb: 1 }} />
                  <Typography variant="subtitle2">Smart Scheduling</Typography>
                  <Typography variant="caption">
                    Buffer time & jet lag
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <InsightsIcon color="primary" sx={{ mb: 1 }} />
                  <Typography variant="subtitle2">Cost Analysis</Typography>
                  <Typography variant="caption">Budget estimates</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <EventIcon color="primary" sx={{ mb: 1 }} />
                  <Typography variant="subtitle2">Task Generation</Typography>
                  <Typography variant="caption">
                    Auto-created prep tasks
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Selected Meetings ({selectedMeetings.length}):
          </Typography>

          <List dense>
            {meetings
              .filter(m => selectedMeetings.includes(m.id))
              .map(meeting => (
                <ListItem key={meeting.id}>
                  <ListItemIcon>
                    <EventIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={meeting.title}
                    secondary={`${meeting.location} • ${format(new Date(meeting.startTime), 'MMM dd, yyyy HH:mm')}`}
                  />
                </ListItem>
              ))}
          </List>

          {creatingTrip && (
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                Creating optimized trip plan...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setCreateTripDialogOpen(false)}
            disabled={creatingTrip}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTrip}
            variant="contained"
            disabled={creatingTrip || selectedMeetings.length === 0}
            startIcon={creatingTrip ? null : <MagicIcon />}
          >
            {creatingTrip ? 'Creating...' : 'Create Trip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TravelSuggestions

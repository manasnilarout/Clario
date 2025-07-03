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
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Paper,
} from '@mui/material'
import {
  Link as LinkIcon,
  Event as EventIcon,
  Flight as FlightIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  AutoAwesome as MagicIcon,
  Insights as InsightsIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { format, isWithinInterval } from 'date-fns'
import type { Trip } from '../../../types/travel'
import type { Meeting } from '../../../types/meeting'
import { meetingsService } from '../../../services/meetingsService'
import { travelService } from '../../../services/travelService'
import { travelMeetingIntegration } from '../../../services/travelMeetingIntegration'

interface MeetingLinkerProps {
  trip: Trip
  onUpdate?: () => void
}

const MeetingLinker: React.FC<MeetingLinkerProps> = ({ trip, onUpdate }) => {
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([])
  const [linkedMeetings, setLinkedMeetings] = useState<Meeting[]>([])
  const [suggestedMeetings, setSuggestedMeetings] = useState<Meeting[]>([])
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMeetings()
    loadSuggestions()
  }, [trip.id])

  const loadMeetings = async () => {
    try {
      const meetings = await meetingsService.getMeetings()
      setAllMeetings(meetings)

      const linked = meetings.filter(meeting =>
        trip.relatedMeetings.includes(meeting.id)
      )
      setLinkedMeetings(linked)
    } catch (error) {
      console.error('Error loading meetings:', error)
    }
  }

  const loadSuggestions = async () => {
    try {
      const suggestions =
        await travelMeetingIntegration.suggestMeetingsDuringTravel(trip.id)
      setSuggestedMeetings(suggestions)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    }
  }

  const handleLinkMeetings = async () => {
    if (selectedMeetings.length === 0) return

    setLoading(true)
    try {
      const updatedRelatedMeetings = [
        ...trip.relatedMeetings,
        ...selectedMeetings,
      ]
      await travelService.updateTrip(trip.id, {
        relatedMeetings: updatedRelatedMeetings,
      })

      await loadMeetings()
      setSelectedMeetings([])
      setLinkDialogOpen(false)
      onUpdate?.()
    } catch (error) {
      console.error('Error linking meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlinkMeeting = async (meetingId: string) => {
    try {
      const updatedRelatedMeetings = trip.relatedMeetings.filter(
        id => id !== meetingId
      )
      await travelService.updateTrip(trip.id, {
        relatedMeetings: updatedRelatedMeetings,
      })

      await loadMeetings()
      onUpdate?.()
    } catch (error) {
      console.error('Error unlinking meeting:', error)
    }
  }

  const getAvailableMeetings = () => {
    return allMeetings.filter(meeting => {
      // Exclude already linked meetings
      if (trip.relatedMeetings.includes(meeting.id)) return false

      // Include meetings during trip period or close to it
      const meetingDate = new Date(meeting.startTime)
      const tripStart = new Date(trip.startDate)
      const tripEnd = new Date(trip.endDate)

      // Extend range by a few days on either side
      const extendedStart = new Date(tripStart)
      extendedStart.setDate(extendedStart.getDate() - 3)
      const extendedEnd = new Date(tripEnd)
      extendedEnd.setDate(extendedEnd.getDate() + 3)

      return isWithinInterval(meetingDate, {
        start: extendedStart,
        end: extendedEnd,
      })
    })
  }

  const getMeetingRelevanceScore = (meeting: Meeting): number => {
    let score = 0

    // Location match
    const locationText = meeting.location?.address || ''
    const hasLocationMatch = trip.destinations.some(
      dest =>
        locationText.toLowerCase().includes(dest.city.toLowerCase()) ||
        locationText.toLowerCase().includes(dest.country.toLowerCase())
    )
    if (hasLocationMatch) score += 3

    // Date proximity
    const meetingDate = new Date(meeting.startTime)
    const tripStart = new Date(trip.startDate)
    const tripEnd = new Date(trip.endDate)

    if (isWithinInterval(meetingDate, { start: tripStart, end: tripEnd })) {
      score += 5
    } else {
      const daysBefore = Math.abs(
        (tripStart.getTime() - meetingDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const daysAfter = Math.abs(
        (meetingDate.getTime() - tripEnd.getTime()) / (1000 * 60 * 60 * 24)
      )
      const minDays = Math.min(daysBefore, daysAfter)
      if (minDays <= 3) score += 3 - minDays
    }

    // Contact overlap
    const sharedContacts = meeting.attendees.filter(attendee =>
      trip.relatedContacts?.includes(attendee.id)
    ).length
    score += sharedContacts

    // Meeting type relevance
    if (
      trip.purpose === 'business' &&
      meeting.title.toLowerCase().includes('business')
    )
      score += 1
    if (
      trip.purpose === 'conference' &&
      meeting.title.toLowerCase().includes('conference')
    )
      score += 2
    if (
      trip.purpose === 'client_visit' &&
      meeting.title.toLowerCase().includes('client')
    )
      score += 2

    return score
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 5) return 'success'
    if (score >= 3) return 'warning'
    if (score >= 1) return 'info'
    return 'default'
  }

  const getRelevanceLabel = (score: number) => {
    if (score >= 5) return 'High'
    if (score >= 3) return 'Medium'
    if (score >= 1) return 'Low'
    return 'Minimal'
  }

  const availableMeetings = getAvailableMeetings()
    .map(meeting => ({ meeting, score: getMeetingRelevanceScore(meeting) }))
    .sort((a, b) => b.score - a.score)

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
              <LinkIcon color="primary" />
              <Typography variant="h6">Meeting Integration</Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setLinkDialogOpen(true)}
              disabled={availableMeetings.length === 0}
            >
              Link Meetings
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Connect meetings to this trip for better coordination and
            preparation.
          </Typography>
        </CardContent>
      </Card>

      {/* Linked Meetings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Linked Meetings ({linkedMeetings.length})
          </Typography>

          {linkedMeetings.length === 0 ? (
            <Alert severity="info">
              No meetings are currently linked to this trip. Use the "Link
              Meetings" button to connect relevant meetings.
            </Alert>
          ) : (
            <List>
              {linkedMeetings.map(meeting => (
                <ListItem
                  key={meeting.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={meeting.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {format(
                            new Date(meeting.startTime),
                            'MMM dd, yyyy HH:mm'
                          )}
                          {meeting.location && ` • ${meeting.location}`}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                          <Chip
                            label={meeting.type}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${meeting.attendees.length} attendees`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <IconButton
                    onClick={() => handleUnlinkMeeting(meeting.id)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Suggested Meetings */}
      {suggestedMeetings.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <MagicIcon color="primary" />
              <Typography variant="h6">AI Suggestions</Typography>
              <Chip
                label={`${suggestedMeetings.length} found`}
                size="small"
                color="primary"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Meetings that might benefit from being linked to this trip.
            </Typography>

            <List>
              {suggestedMeetings.slice(0, 3).map(meeting => {
                const score = getMeetingRelevanceScore(meeting)
                return (
                  <ListItem
                    key={meeting.id}
                    sx={{
                      border: 1,
                      borderColor: 'primary.light',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'primary.50',
                    }}
                  >
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">
                            {meeting.title}
                          </Typography>
                          <Chip
                            label={`${getRelevanceLabel(score)} relevance`}
                            size="small"
                            color={getRelevanceColor(score) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {format(
                              new Date(meeting.startTime),
                              'MMM dd, yyyy HH:mm'
                            )}
                            {meeting.location && ` • ${meeting.location}`}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedMeetings([meeting.id])
                        setLinkDialogOpen(true)
                      }}
                    >
                      Link
                    </Button>
                  </ListItem>
                )
              })}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Link Meetings Dialog */}
      <Dialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="between">
            <Typography variant="h6">Link Meetings to Trip</Typography>
            <IconButton onClick={() => setLinkDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select meetings to link with this trip. Relevance scores are
            calculated based on location, timing, and attendees.
          </Typography>

          <Box mt={2} mb={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Paper sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {trip.destinations.length}
                  </Typography>
                  <Typography variant="caption">Destinations</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Paper sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {trip.duration}
                  </Typography>
                  <Typography variant="caption">Days</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Paper sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {availableMeetings.length}
                  </Typography>
                  <Typography variant="caption">Available</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {availableMeetings.length === 0 ? (
            <Alert severity="info">
              No meetings found in the relevant time period for this trip.
            </Alert>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {availableMeetings.map(({ meeting, score }) => (
                <ListItem
                  key={meeting.id}
                  sx={{
                    border: 1,
                    borderColor: selectedMeetings.includes(meeting.id)
                      ? 'primary.main'
                      : 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={selectedMeetings.includes(meeting.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedMeetings(prev => [...prev, meeting.id])
                        } else {
                          setSelectedMeetings(prev =>
                            prev.filter(id => id !== meeting.id)
                          )
                        }
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1">{meeting.title}</Typography>
                        <Chip
                          label={`${getRelevanceLabel(score)} (${score})`}
                          size="small"
                          color={getRelevanceColor(score) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {format(
                            new Date(meeting.startTime),
                            'MMM dd, yyyy HH:mm'
                          )}
                          {meeting.location && ` • ${meeting.location}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {meeting.attendees.length} attendees • {meeting.type}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleLinkMeetings}
            variant="contained"
            disabled={selectedMeetings.length === 0 || loading}
            startIcon={loading ? null : <LinkIcon />}
          >
            {loading
              ? 'Linking...'
              : `Link ${selectedMeetings.length} Meeting${selectedMeetings.length > 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MeetingLinker

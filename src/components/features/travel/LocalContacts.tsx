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
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Insights as InsightsIcon,
  Star as StarIcon,
  AutoAwesome as MagicIcon,
} from '@mui/icons-material'
import { format, formatDistanceToNow } from 'date-fns'
import type { Trip, Destination } from '../../../types/travel'
import type { Contact } from '../../../types/contact'
import type { ContactMeetingSuggestion } from '../../../services/travelContactIntegration'
import { travelContactIntegration } from '../../../services/travelContactIntegration'

interface LocalContactsProps {
  trip: Trip
  onMeetingScheduled?: (suggestion: ContactMeetingSuggestion) => void
}

interface DestinationContacts {
  destination: Destination
  contacts: Contact[]
  suggestions: ContactMeetingSuggestion[]
  insights: {
    businessOpportunities: string[]
    culturalNotes: string[]
    networkingEvents: string[]
  }
}

const LocalContacts: React.FC<LocalContactsProps> = ({
  trip,
  onMeetingScheduled,
}) => {
  const [destinationContacts, setDestinationContacts] = useState<
    DestinationContacts[]
  >([])
  const [selectedDestination, setSelectedDestination] = useState<string>('')
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(false)
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ContactMeetingSuggestion | null>(null)

  useEffect(() => {
    loadDestinationContacts()
  }, [trip.id])

  const loadDestinationContacts = async () => {
    setLoading(true)
    try {
      const destinationData: DestinationContacts[] = []

      for (const destination of trip.destinations) {
        const contacts = await travelContactIntegration.getContactsByLocation(
          destination.city,
          destination.country
        )

        const suggestions =
          await travelContactIntegration.suggestMeetingsWithLocalContacts(
            trip.id
          )
        const destinationSuggestions = suggestions.filter(s =>
          contacts.some(c => c.id === s.contact.id)
        )

        // Mock insights - in a real app, this would be from the service
        const insights = {
          businessOpportunities: [
            `${contacts.length} local business contacts available`,
            `Potential partnerships in ${destination.city}`,
            `Market expansion opportunities`,
          ],
          culturalNotes: [
            'Research local business customs',
            'Dress code considerations',
            'Communication style preferences',
          ],
          networkingEvents: [
            `${destination.city} Business Networking Mixer`,
            'Local Chamber of Commerce meeting',
            'Industry meetup groups',
          ],
        }

        destinationData.push({
          destination,
          contacts,
          suggestions: destinationSuggestions,
          insights,
        })
      }

      setDestinationContacts(destinationData)
      if (destinationData.length > 0 && !selectedDestination) {
        setSelectedDestination(destinationData[0].destination.id)
      }
    } catch (error) {
      console.error('Error loading destination contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContactDetails = async (contact: Contact) => {
    setSelectedContact(contact)
    setDetailsDialogOpen(true)
  }

  const handleScheduleMeeting = (suggestion: ContactMeetingSuggestion) => {
    setSelectedSuggestion(suggestion)
    setSchedulingDialogOpen(true)
  }

  const confirmMeetingSchedule = () => {
    if (selectedSuggestion) {
      onMeetingScheduled?.(selectedSuggestion)
      setSchedulingDialogOpen(false)
      setSelectedSuggestion(null)
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <StarIcon color="error" />
      case 'medium':
        return <TrendingUpIcon color="warning" />
      case 'low':
        return <TrendingDownIcon color="success" />
      default:
        return <PersonIcon color="action" />
    }
  }

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'primary'
      case 'networking':
        return 'info'
      case 'social':
        return 'success'
      case 'follow-up':
        return 'warning'
      default:
        return 'default'
    }
  }

  const selectedDestinationData = destinationContacts.find(
    d => d.destination.id === selectedDestination
  )

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Loading local contacts...
        </Typography>
        <LinearProgress />
      </Box>
    )
  }

  if (destinationContacts.length === 0) {
    return (
      <Alert severity="info">
        No local contacts found for your trip destinations. Consider adding
        contacts with location information to see networking opportunities.
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
              <LocationIcon color="primary" />
              <Typography variant="h6">Local Contacts & Networking</Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Select Destination</InputLabel>
              <Select
                value={selectedDestination}
                label="Select Destination"
                onChange={e => setSelectedDestination(e.target.value)}
              >
                {destinationContacts.map(data => (
                  <MenuItem
                    key={data.destination.id}
                    value={data.destination.id}
                  >
                    {data.destination.city}, {data.destination.country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Discover networking opportunities and schedule meetings with local
            contacts during your trip.
          </Typography>
        </CardContent>
      </Card>

      {selectedDestinationData && (
        <Grid container spacing={3}>
          {/* Contact Suggestions */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <MagicIcon color="primary" />
                  <Typography variant="h6">
                    Meeting Suggestions (
                    {selectedDestinationData.suggestions.length})
                  </Typography>
                </Box>

                {selectedDestinationData.suggestions.length === 0 ? (
                  <Alert severity="info">
                    No meeting suggestions available for this destination.
                  </Alert>
                ) : (
                  <List>
                    {selectedDestinationData.suggestions.map(
                      (suggestion, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              {getPriorityIcon(suggestion.priority)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body1">
                                  {suggestion.contact.firstName}{' '}
                                  {suggestion.contact.lastName}
                                </Typography>
                                <Chip
                                  label={suggestion.priority}
                                  size="small"
                                  color={
                                    getImportanceColor(
                                      suggestion.priority
                                    ) as any
                                  }
                                  variant="outlined"
                                />
                                <Chip
                                  label={suggestion.meetingType}
                                  size="small"
                                  color={
                                    getMeetingTypeColor(
                                      suggestion.meetingType
                                    ) as any
                                  }
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {suggestion.contact.company} •{' '}
                                  {suggestion.contact.position}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {suggestion.reason}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Suggested duration:{' '}
                                  {suggestion.suggestedDuration} minutes
                                </Typography>
                              </Box>
                            }
                          />
                          <Box display="flex" flexDirection="column" gap={1}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleScheduleMeeting(suggestion)}
                              startIcon={<ScheduleIcon />}
                            >
                              Schedule
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                handleContactDetails(suggestion.contact)
                              }
                            >
                              Details
                            </Button>
                          </Box>
                        </ListItem>
                      )
                    )}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* All Local Contacts */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  All Local Contacts ({selectedDestinationData.contacts.length})
                </Typography>

                <List>
                  {selectedDestinationData.contacts.map(contact => (
                    <ListItem
                      key={contact.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {contact.firstName.charAt(0)}
                          {contact.lastName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                              {contact.firstName} {contact.lastName}
                            </Typography>
                            <Chip
                              label={contact.priority || 'medium'}
                              size="small"
                              color={
                                getImportanceColor(
                                  contact.priority || 'medium'
                                ) as any
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {contact.company} • {contact.position}
                            </Typography>
                            {contact.lastContactedAt && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Last contact:{' '}
                                {formatDistanceToNow(contact.lastContactedAt)}{' '}
                                ago
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box display="flex" gap={1}>
                        <IconButton size="small" href={`tel:${contact.phone}`}>
                          <PhoneIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          href={`mailto:${contact.email}`}
                        >
                          <EmailIcon />
                        </IconButton>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleContactDetails(contact)}
                        >
                          View
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Destination Insights */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <InsightsIcon color="primary" />
                  <Typography variant="h6">Destination Insights</Typography>
                </Box>

                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Business Opportunities
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {selectedDestinationData.insights.businessOpportunities.map(
                        (opportunity, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2">
                                  {opportunity}
                                </Typography>
                              }
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Cultural Notes</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {selectedDestinationData.insights.culturalNotes.map(
                        (note, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2">{note}</Typography>
                              }
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Networking Events
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {selectedDestinationData.insights.networkingEvents.map(
                        (event, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2">{event}</Typography>
                              }
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {selectedDestinationData.contacts.length}
                  </Typography>
                  <Typography variant="caption">Local Contacts</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {selectedDestinationData.suggestions.length}
                  </Typography>
                  <Typography variant="caption">Meeting Suggestions</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {
                      selectedDestinationData.contacts.filter(
                        c => c.priority === 'high'
                      ).length
                    }
                  </Typography>
                  <Typography variant="caption">High Priority</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {
                      selectedDestinationData.suggestions.filter(
                        s => s.meetingType === 'business'
                      ).length
                    }
                  </Typography>
                  <Typography variant="caption">Business Meetings</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Contact Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Contact Details</DialogTitle>
        <DialogContent>
          {selectedContact && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ width: 60, height: 60 }}>
                  {selectedContact.firstName.charAt(0)}
                  {selectedContact.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedContact.company} • {selectedContact.position}
                  </Typography>
                  <Chip
                    label={selectedContact.priority || 'medium'}
                    size="small"
                    color={
                      getImportanceColor(
                        selectedContact.priority || 'medium'
                      ) as any
                    }
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body2">
                    Email: {selectedContact.email}
                  </Typography>
                  <Typography variant="body2">
                    Phone: {selectedContact.phone || 'Not provided'}
                  </Typography>
                </Grid>

                {selectedContact.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {selectedContact.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {selectedContact.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {selectedContact.notes}
                    </Typography>
                  </Grid>
                )}

                {selectedContact.lastContactedAt && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Last Contact
                    </Typography>
                    <Typography variant="body2">
                      {format(selectedContact.lastContactedAt, 'MMM dd, yyyy')}(
                      {formatDistanceToNow(selectedContact.lastContactedAt)}{' '}
                      ago)
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Meeting Scheduling Dialog */}
      <Dialog
        open={schedulingDialogOpen}
        onClose={() => setSchedulingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Meeting</DialogTitle>
        <DialogContent>
          {selectedSuggestion && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Meeting with {selectedSuggestion.contact.firstName}{' '}
                {selectedSuggestion.contact.lastName}
              </Typography>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  {selectedSuggestion.reason}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Meeting Type</Typography>
                  <Chip
                    label={selectedSuggestion.meetingType}
                    color={
                      getMeetingTypeColor(selectedSuggestion.meetingType) as any
                    }
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Duration</Typography>
                  <Typography variant="body2">
                    {selectedSuggestion.suggestedDuration} minutes
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Suggested Times
              </Typography>
              <List dense>
                {selectedSuggestion.proposedTimes.map((time, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={format(time, 'MMM dd, yyyy')}
                      secondary={format(time, 'HH:mm')}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchedulingDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmMeetingSchedule}
            variant="contained"
            startIcon={<EventIcon />}
          >
            Create Meeting
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LocalContacts

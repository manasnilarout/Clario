import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material'
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { useContactsStore } from '../../../store/contactsStore'
import {
  MeetingFormData,
  MeetingType,
  MeetingPriority,
  MeetingLocation,
  MeetingAgendaItem,
  MeetingChecklistItem,
  MeetingTemplate,
} from '../../../types/meeting'
import { Contact } from '../../../types/contact'

const steps = ['Basic Info', 'Attendees', 'Schedule', 'Options']

const meetingTypes: { value: MeetingType; label: string }[] = [
  { value: 'one_on_one', label: 'One-on-One' },
  { value: 'team_meeting', label: 'Team Meeting' },
  { value: 'client_meeting', label: 'Client Meeting' },
  { value: 'interview', label: 'Interview' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'standup', label: 'Standup' },
  { value: 'review', label: 'Review' },
  { value: 'planning', label: 'Planning' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
]

const priorities: { value: MeetingPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const reminderOptions = [
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
]

const MeetingForm: React.FC = () => {
  const {
    isCreating,
    isEditing,
    editingMeetingId,
    templates,
    setCreating,
    setEditing,
    createMeeting,
    updateMeeting,
    getMeetingById,
    loadTemplates,
  } = useMeetingsStore()

  const { contacts, loadContacts } = useContactsStore()

  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    attendees: [],
    type: 'team_meeting',
    priority: 'medium',
    tags: [],
    isPrivate: false,
    allowGuestInvites: true,
    requiresApproval: false,
    reminderMinutes: [15],
    agenda: [],
    checklist: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<MeetingTemplate | null>(null)

  const isOpen = isCreating || isEditing
  const isEditMode = isEditing && editingMeetingId

  useEffect(() => {
    if (isOpen) {
      loadContacts()
      loadTemplates()
    }
  }, [isOpen, loadContacts, loadTemplates])

  useEffect(() => {
    if (isEditMode) {
      const meeting = getMeetingById(editingMeetingId)
      if (meeting) {
        setFormData({
          title: meeting.title,
          description: meeting.description || '',
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          attendees: meeting.attendees.map(a => a.id),
          location: meeting.location,
          type: meeting.type,
          priority: meeting.priority,
          tags: meeting.tags,
          isPrivate: meeting.isPrivate,
          allowGuestInvites: meeting.allowGuestInvites,
          requiresApproval: meeting.requiresApproval,
          reminderMinutes: meeting.reminderMinutes,
          agenda: meeting.preparation?.agenda || [],
          checklist: meeting.preparation?.checklist || [],
          timezone: meeting.timezone,
        })
      }
    } else {
      // Reset form for creation
      const now = new Date()
      const endTime = new Date(now.getTime() + 60 * 60 * 1000)
      setFormData({
        title: '',
        description: '',
        startTime: now,
        endTime,
        attendees: [],
        type: 'team_meeting',
        priority: 'medium',
        tags: [],
        isPrivate: false,
        allowGuestInvites: true,
        requiresApproval: false,
        reminderMinutes: [15],
        agenda: [],
        checklist: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    }
    setActiveStep(0)
    setErrors({})
    setSelectedTemplate(null)
  }, [isCreating, isEditing, editingMeetingId, getMeetingById, isEditMode])

  const handleClose = () => {
    if (isCreating) {
      setCreating(false)
    } else if (isEditing) {
      setEditing(null)
    }
    setActiveStep(0)
    setErrors({})
    setSelectedTemplate(null)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) {
          newErrors.title = 'Meeting title is required'
        }
        if (formData.endTime <= formData.startTime) {
          newErrors.endTime = 'End time must be after start time'
        }
        break
      case 1: // Attendees
        if (formData.attendees.length === 0) {
          newErrors.attendees = 'At least one attendee is required'
        }
        break
      case 2: // Schedule
        // Schedule validation handled in Basic Info
        break
      case 3: // Options
        // No required validations for options
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await updateMeeting(editingMeetingId, formData)
      } else {
        await createMeeting(formData)
      }
      handleClose()
    } catch (error) {
      console.error('Failed to save meeting:', error)
      setErrors({ submit: 'Failed to save meeting. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = <K extends keyof MeetingFormData>(
    field: K,
    value: MeetingFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const applyTemplate = (template: MeetingTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description || prev.description,
      type: template.type,
      endTime: new Date(
        prev.startTime.getTime() + template.defaultDuration * 60 * 1000
      ),
      location: template.defaultLocation || prev.location,
      attendees: [...prev.attendees, ...template.defaultAttendees],
      tags: [...prev.tags, ...template.tags],
      agenda: template.defaultAgenda.map((item, index) => ({
        id: `agenda_${index}`,
        ...item,
      })),
      checklist: template.defaultChecklist.map((item, index) => ({
        id: `checklist_${index}`,
        completed: false,
        ...item,
      })),
    }))
  }

  const addAgendaItem = () => {
    const newItem: MeetingAgendaItem = {
      id: `agenda_${Date.now()}`,
      title: '',
      description: '',
      duration: 15,
      type: 'discussion',
      order: formData.agenda.length,
    }
    handleInputChange('agenda', [...formData.agenda, newItem])
  }

  const updateAgendaItem = (
    index: number,
    field: keyof MeetingAgendaItem,
    value: any
  ) => {
    const updatedAgenda = [...formData.agenda]
    updatedAgenda[index] = { ...updatedAgenda[index], [field]: value }
    handleInputChange('agenda', updatedAgenda)
  }

  const removeAgendaItem = (index: number) => {
    const updatedAgenda = formData.agenda.filter((_, i) => i !== index)
    handleInputChange('agenda', updatedAgenda)
  }

  const addChecklistItem = () => {
    const newItem: MeetingChecklistItem = {
      id: `checklist_${Date.now()}`,
      title: '',
      completed: false,
    }
    handleInputChange('checklist', [...formData.checklist, newItem])
  }

  const updateChecklistItem = (
    index: number,
    field: keyof MeetingChecklistItem,
    value: any
  ) => {
    const updatedChecklist = [...formData.checklist]
    updatedChecklist[index] = { ...updatedChecklist[index], [field]: value }
    handleInputChange('checklist', updatedChecklist)
  }

  const removeChecklistItem = (index: number) => {
    const updatedChecklist = formData.checklist.filter((_, i) => i !== index)
    handleInputChange('checklist', updatedChecklist)
  }

  const renderBasicInfoStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Template Selection */}
      {!isEditMode && templates.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Start with a Template (Optional)
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {templates.slice(0, 4).map(template => (
              <Card
                key={template.id}
                sx={{
                  cursor: 'pointer',
                  border: selectedTemplate?.id === template.id ? 2 : 1,
                  borderColor:
                    selectedTemplate?.id === template.id
                      ? 'primary.main'
                      : 'divider',
                }}
                onClick={() => applyTemplate(template)}
              >
                <CardContent>
                  <Typography variant="subtitle2">{template.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Divider sx={{ my: 3 }} />
        </Box>
      )}

      {/* Basic Meeting Info */}
      <TextField
        fullWidth
        label="Meeting Title"
        value={formData.title}
        onChange={e => handleInputChange('title', e.target.value)}
        error={!!errors.title}
        helperText={errors.title}
        required
      />

      <TextField
        fullWidth
        label="Description"
        multiline
        rows={3}
        value={formData.description}
        onChange={e => handleInputChange('description', e.target.value)}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="meeting-type-label">Meeting Type</InputLabel>
          <Select
            labelId="meeting-type-label"
            value={formData.type}
            label="Meeting Type"
            onChange={e =>
              handleInputChange('type', e.target.value as MeetingType)
            }
          >
            {meetingTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            value={formData.priority}
            label="Priority"
            onChange={e =>
              handleInputChange('priority', e.target.value as MeetingPriority)
            }
          >
            {priorities.map(priority => (
              <MenuItem key={priority.value} value={priority.value}>
                {priority.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <DateTimePicker
            label="Start Time"
            value={formData.startTime}
            onChange={newValue => {
              if (newValue) {
                const duration =
                  formData.endTime.getTime() - formData.startTime.getTime()
                handleInputChange('startTime', newValue)
                handleInputChange(
                  'endTime',
                  new Date(newValue.getTime() + duration)
                )
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.startTime,
                helperText: errors.startTime,
              },
            }}
          />
          <DateTimePicker
            label="End Time"
            value={formData.endTime}
            onChange={newValue =>
              newValue && handleInputChange('endTime', newValue)
            }
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.endTime,
                helperText: errors.endTime,
              },
            }}
          />
        </Box>
      </LocalizationProvider>
    </Box>
  )

  const renderAttendeesStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6">Select Attendees</Typography>

      <Autocomplete
        multiple
        id="attendees-select"
        options={contacts}
        getOptionLabel={contact => `${contact.firstName} ${contact.lastName}`}
        value={contacts.filter(contact =>
          formData.attendees.includes(contact.id)
        )}
        onChange={(_, newValue) => {
          handleInputChange(
            'attendees',
            newValue.map(contact => contact.id)
          )
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={`${option.firstName} ${option.lastName}`}
              {...getTagProps({ index })}
              key={option.id}
            />
          ))
        }
        renderInput={params => (
          <TextField
            {...params}
            label="Attendees"
            placeholder="Search and select attendees..."
            error={!!errors.attendees}
            helperText={errors.attendees}
            required
          />
        )}
      />

      {formData.attendees.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Selected Attendees ({formData.attendees.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {contacts
              .filter(contact => formData.attendees.includes(contact.id))
              .map(contact => (
                <Chip
                  key={contact.id}
                  label={`${contact.firstName} ${contact.lastName}`}
                  onDelete={() => {
                    handleInputChange(
                      'attendees',
                      formData.attendees.filter(id => id !== contact.id)
                    )
                  }}
                />
              ))}
          </Box>
        </Box>
      )}
    </Box>
  )

  const renderScheduleStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6">Meeting Schedule & Location</Typography>

      {/* Location */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Location (Optional)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Address or Room"
              value={
                formData.location?.address || formData.location?.room || ''
              }
              onChange={e => {
                const location: MeetingLocation = {
                  type: 'physical',
                  ...(e.target.value.includes('http')
                    ? { virtualUrl: e.target.value, type: 'virtual' as const }
                    : { address: e.target.value }),
                }
                handleInputChange('location', location)
              }}
              placeholder="Conference Room A or Virtual URL"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Location Type</InputLabel>
              <Select
                value={formData.location?.type || 'physical'}
                label="Location Type"
                onChange={e => {
                  const location: MeetingLocation = {
                    ...formData.location,
                    type: e.target.value as 'physical' | 'virtual' | 'hybrid',
                  }
                  handleInputChange('location', location)
                }}
              >
                <MenuItem value="physical">Physical</MenuItem>
                <MenuItem value="virtual">Virtual</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Reminders */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Reminders
        </Typography>
        <Autocomplete
          multiple
          options={reminderOptions}
          getOptionLabel={option => option.label}
          value={reminderOptions.filter(option =>
            formData.reminderMinutes.includes(option.value)
          )}
          onChange={(_, newValue) => {
            handleInputChange(
              'reminderMinutes',
              newValue.map(option => option.value)
            )
          }}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                label={option.label}
                {...getTagProps({ index })}
                key={option.value}
              />
            ))
          }
          renderInput={params => (
            <TextField
              {...params}
              label="Reminder Times"
              placeholder="Select reminder times..."
            />
          )}
        />
      </Box>

      {/* Agenda */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="subtitle2">
            Agenda ({formData.agenda.length} items)
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addAgendaItem}
            variant="outlined"
            size="small"
          >
            Add Item
          </Button>
        </Box>

        {formData.agenda.map((item, index) => (
          <Card key={`agenda-${index}`} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Agenda Item"
                    value={item.title}
                    onChange={e =>
                      updateAgendaItem(index, 'title', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Duration (min)"
                    value={item.duration}
                    onChange={e =>
                      updateAgendaItem(
                        index,
                        'duration',
                        parseInt(e.target.value)
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={item.type}
                      label="Type"
                      onChange={e =>
                        updateAgendaItem(index, 'type', e.target.value)
                      }
                    >
                      <MenuItem value="discussion">Discussion</MenuItem>
                      <MenuItem value="presentation">Presentation</MenuItem>
                      <MenuItem value="decision">Decision</MenuItem>
                      <MenuItem value="update">Update</MenuItem>
                      <MenuItem value="break">Break</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    onClick={() => removeAgendaItem(index)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )

  const renderOptionsStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6">Meeting Options</Typography>

      {/* Privacy and Access */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Privacy & Access
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPrivate}
                onChange={e => handleInputChange('isPrivate', e.target.checked)}
              />
            }
            label="Private Meeting"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.allowGuestInvites}
                onChange={e =>
                  handleInputChange('allowGuestInvites', e.target.checked)
                }
              />
            }
            label="Allow attendees to invite guests"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.requiresApproval}
                onChange={e =>
                  handleInputChange('requiresApproval', e.target.checked)
                }
              />
            }
            label="Require approval for attendance"
          />
        </Box>
      </Box>

      {/* Tags */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Tags
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={formData.tags}
          onChange={(_, newValue) => handleInputChange('tags', newValue)}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip label={option} {...getTagProps({ index })} key={option} />
            ))
          }
          renderInput={params => (
            <TextField
              {...params}
              label="Add tags..."
              placeholder="Type and press Enter to add tags"
            />
          )}
        />
      </Box>

      {/* Pre-meeting Checklist */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="subtitle2">
            Pre-meeting Checklist ({formData.checklist.length} items)
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addChecklistItem}
            variant="outlined"
            size="small"
          >
            Add Item
          </Button>
        </Box>

        {formData.checklist.map((item, index) => (
          <Card key={`checklist-${index}`} sx={{ mb: 1 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Checklist Item"
                    value={item.title}
                    onChange={e =>
                      updateChecklistItem(index, 'title', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => removeChecklistItem(index)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
    </Box>
  )

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInfoStep()
      case 1:
        return renderAttendeesStep()
      case 2:
        return renderScheduleStep()
      case 3:
        return renderOptionsStep()
      default:
        return null
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 0:
        return <EventIcon />
      case 1:
        return <GroupIcon />
      case 2:
        return <LocationIcon />
      case 3:
        return <SettingsIcon />
      default:
        return null
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            {isEditMode ? 'Edit Meeting' : 'Create New Meeting'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel icon={getStepIcon(index)}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: '400px' }}>{getStepContent(activeStep)}</Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isSubmitting}>
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Update Meeting'
                : 'Create Meeting'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default MeetingForm

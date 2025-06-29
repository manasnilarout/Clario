import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
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
  Alert,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { useContactsStore } from '../../../store/contactsStore'
import {
  MeetingFormData,
  MeetingType,
  MeetingPriority,
} from '../../../types/meeting'

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

const MeetingFormSimple: React.FC = () => {
  const {
    isCreating,
    isEditing,
    editingMeetingId,
    setCreating,
    setEditing,
    createMeeting,
    updateMeeting,
    getMeetingById,
  } = useMeetingsStore()

  const { contacts, loadContacts } = useContactsStore()

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

  const isOpen = isCreating || isEditing
  const isEditMode = isEditing && editingMeetingId

  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen, loadContacts])

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
    setErrors({})
  }, [isCreating, isEditing, editingMeetingId, getMeetingById, isEditMode])

  const handleClose = () => {
    if (isCreating) {
      setCreating(false)
    } else if (isEditing) {
      setEditing(null)
    }
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required'
    }

    if (formData.attendees.length === 0) {
      newErrors.attendees = 'At least one attendee is required'
    }

    if (formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await updateMeeting(editingMeetingId, formData)
      } else {
        await createMeeting(formData)
      }
      handleClose()
    } catch (error) {
      setErrors({ submit: 'Failed to save meeting. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = <K extends keyof MeetingFormData>(
    field: K,
    value: MeetingFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h5">
          {isEditMode ? 'Edit Meeting' : 'Create New Meeting'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

          {/* Meeting Type and Priority */}
          <Box sx={{ display: 'flex', gap: 2 }}>
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
                  handleInputChange(
                    'priority',
                    e.target.value as MeetingPriority
                  )
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

          {/* Date and Time */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2 }}>
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

          {/* Attendees */}
          <Autocomplete
            multiple
            id="attendees-select"
            options={contacts}
            getOptionLabel={contact =>
              `${contact.firstName} ${contact.lastName}`
            }
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

          {/* Meeting Options */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Meeting Options
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPrivate}
                    onChange={e =>
                      handleInputChange('isPrivate', e.target.checked)
                    }
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
            </Box>
          </Box>

          {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving...'
            : isEditMode
              ? 'Update Meeting'
              : 'Create Meeting'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MeetingFormSimple

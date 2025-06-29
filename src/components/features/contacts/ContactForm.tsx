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
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useContactsStore } from '../../../store/contactsStore'
import {
  ContactFormData,
  ContactStatus,
  ContactPriority,
} from '../../../types/contact'

const ContactForm: React.FC = () => {
  const {
    isCreating,
    isEditing,
    editingContactId,
    contacts,
    tags,
    setCreating,
    setEditing,
    createContact,
    updateContact,
    getContactById,
  } = useContactsStore()

  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    tags: [],
    notes: '',
    socialLinks: {},
    address: {},
    customFields: {},
    isFavorite: false,
    status: 'active',
    priority: 'medium',
    birthday: undefined,
    timezone: '',
    language: '',
    department: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOpen = isCreating || isEditing
  const isEditMode = isEditing && editingContactId

  useEffect(() => {
    if (isEditMode) {
      const contact = getContactById(editingContactId)
      if (contact) {
        setFormData({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone || '',
          company: contact.company || '',
          position: contact.position || '',
          tags: contact.tags,
          notes: contact.notes || '',
          socialLinks: contact.socialLinks || {},
          address: contact.address || {},
          customFields: contact.customFields || {},
          isFavorite: contact.isFavorite,
          status: contact.status,
          priority: contact.priority || 'medium',
          birthday: contact.birthday,
          timezone: contact.timezone || '',
          language: contact.language || '',
          department: contact.department || '',
        })
      }
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        tags: [],
        notes: '',
        socialLinks: {},
        address: {},
        customFields: {},
        isFavorite: false,
        status: 'active',
        priority: 'medium',
        birthday: undefined,
        timezone: '',
        language: '',
        department: '',
      })
    }
    setErrors({})
  }, [isCreating, isEditing, editingContactId, getContactById, isEditMode])

  const handleClose = () => {
    if (isCreating) {
      setCreating(false)
    } else if (isEditing) {
      setEditing(null)
    }
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      tags: [],
      notes: '',
      socialLinks: {},
      address: {},
      customFields: {},
      isFavorite: false,
      status: 'active',
      priority: 'medium',
      birthday: undefined,
      timezone: '',
      language: '',
      department: '',
    })
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await updateContact(editingContactId, formData)
      } else {
        await createContact(formData)
      }
      handleClose()
    } catch (error) {
      console.error('Failed to save contact:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleSocialLinksChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }))
  }

  const getExistingCompanies = () => {
    return Array.from(new Set(contacts.map(c => c.company).filter(Boolean)))
  }

  const getExistingPositions = () => {
    return Array.from(new Set(contacts.map(c => c.position).filter(Boolean)))
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          {isEditMode ? 'Edit Contact' : 'Add New Contact'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Box>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
              />
            </Box>
          </Box>

          {/* Organization */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Organization
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Autocomplete
                freeSolo
                options={getExistingCompanies()}
                value={formData.company}
                onChange={(_, value) =>
                  handleInputChange('company', value || '')
                }
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Company"
                    onChange={e => handleInputChange('company', e.target.value)}
                  />
                )}
              />
              <Autocomplete
                freeSolo
                options={getExistingPositions()}
                value={formData.position}
                onChange={(_, value) =>
                  handleInputChange('position', value || '')
                }
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Position"
                    onChange={e =>
                      handleInputChange('position', e.target.value)
                    }
                  />
                )}
              />
              <Autocomplete
                multiple
                options={tags.map(tag => tag.name)}
                value={formData.tags}
                onChange={(_, value) => handleInputChange('tags', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags to categorize this contact"
                  />
                )}
              />
            </Box>
          </Box>

          {/* Additional Details */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={e =>
                      handleInputChange(
                        'status',
                        e.target.value as ContactStatus
                      )
                    }
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={e =>
                      handleInputChange(
                        'priority',
                        e.target.value as ContactPriority
                      )
                    }
                    label="Priority"
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={formData.socialLinks?.linkedin || ''}
                onChange={e =>
                  handleSocialLinksChange('linkedin', e.target.value)
                }
                placeholder="https://linkedin.com/in/username"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFavorite}
                    onChange={e =>
                      handleInputChange('isFavorite', e.target.checked)
                    }
                  />
                }
                label="Mark as Favorite"
              />

              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this contact..."
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
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
              ? 'Update Contact'
              : 'Create Contact'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContactForm

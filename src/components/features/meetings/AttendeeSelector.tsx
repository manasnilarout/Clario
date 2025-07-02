import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { useContactsStore } from '../../../store/contactsStore'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { Contact } from '../../../types/contact'
import { MeetingAvailability, MeetingConflict } from '../../../types/meeting'

interface AttendeeRole {
  contactId: string
  role: 'organizer' | 'required' | 'optional'
}

interface AttendeeWithRole extends Contact {
  role: 'organizer' | 'required' | 'optional'
  isAvailable?: boolean
  conflicts?: MeetingConflict[]
}

interface AttendeeSelectorProps {
  selectedAttendees: string[]
  onSelectionChange: (attendeeIds: string[]) => void
  onRoleChange?: (attendeeRoles: AttendeeRole[]) => void
  startTime?: Date
  endTime?: Date
  excludeMeetingId?: string
  maxAttendees?: number
  showAvailability?: boolean
  showRoles?: boolean
  showExternalInvite?: boolean
  compact?: boolean
}

const AttendeeSelector: React.FC<AttendeeSelectorProps> = ({
  selectedAttendees,
  onSelectionChange,
  onRoleChange: _onRoleChange,
  startTime,
  endTime,
  excludeMeetingId,
  maxAttendees,
  showAvailability = true,
  showRoles = true,
  showExternalInvite = true,
  compact = false,
}) => {
  const { contacts, loadContacts, searchContacts } = useContactsStore()
  const { getAttendeeAvailability, checkMeetingConflicts } = useMeetingsStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [attendeeRoles, setAttendeeRoles] = useState<AttendeeRole[]>([])
  const [availabilityData, setAvailabilityData] = useState<
    Record<string, MeetingAvailability>
  >({})
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [showExternalDialog, setShowExternalDialog] = useState(false)
  const [externalEmail, setExternalEmail] = useState('')
  const [externalName, setExternalName] = useState('')

  // Load contacts on component mount
  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Initialize roles for selected attendees
  useEffect(() => {
    setAttendeeRoles(prevRoles => {
      const newRoles = selectedAttendees.map(id => {
        const existing = prevRoles.find(r => r.contactId === id)
        return existing || { contactId: id, role: 'required' as const }
      })
      return newRoles
    })
  }, [selectedAttendees])

  const checkAvailability = useCallback(async () => {
    if (!startTime || !endTime || selectedAttendees.length === 0) return

    setIsLoadingAvailability(true)
    try {
      const availability = await getAttendeeAvailability(
        selectedAttendees,
        startTime,
        endTime
      )
      const availabilityMap = availability.reduce(
        (acc, item) => {
          acc[item.contactId] = item
          return acc
        },
        {} as Record<string, MeetingAvailability>
      )
      setAvailabilityData(availabilityMap)
    } catch (error) {
      console.error('Failed to check availability:', error)
    } finally {
      setIsLoadingAvailability(false)
    }
  }, [startTime, endTime, selectedAttendees, getAttendeeAvailability])

  // Check availability when time changes
  useEffect(() => {
    if (
      showAvailability &&
      startTime &&
      endTime &&
      selectedAttendees.length > 0
    ) {
      checkAvailability()
    }
  }, [
    startTime,
    endTime,
    selectedAttendees,
    showAvailability,
    checkAvailability,
  ])

  // Filter contacts based on search and filters
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    if (searchQuery) {
      filtered = searchContacts(searchQuery)
    }

    if (selectedCompanies.length > 0) {
      filtered = filtered.filter(
        contact =>
          contact.company && selectedCompanies.includes(contact.company)
      )
    }

    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(
        contact =>
          contact.department && selectedDepartments.includes(contact.department)
      )
    }

    return filtered
  }, [
    contacts,
    searchQuery,
    selectedCompanies,
    selectedDepartments,
    searchContacts,
  ])

  // Get unique companies and departments for filters
  const companies = useMemo(
    () => [...new Set(contacts.map(c => c.company).filter(Boolean))],
    [contacts]
  )

  const departments = useMemo(
    () => [...new Set(contacts.map(c => c.department).filter(Boolean))],
    [contacts]
  )

  // Get attendees with their roles and availability
  const attendeesWithRoles: AttendeeWithRole[] = useMemo(() => {
    return selectedAttendees
      .map(id => {
        const contact = contacts.find(c => c.id === id)
        const role = attendeeRoles.find(r => r.contactId === id)
        const availability = availabilityData[id]

        if (!contact) return null

        return {
          ...contact,
          role: role?.role || 'required',
          isAvailable: availability?.isAvailable,
          conflicts: availability?.conflicts,
        }
      })
      .filter(Boolean) as AttendeeWithRole[]
  }, [selectedAttendees, contacts, attendeeRoles, availabilityData])

  const getAvailabilityIcon = (attendee: AttendeeWithRole) => {
    if (isLoadingAvailability) {
      return <CircularProgress size={16} />
    }

    if (attendee.isAvailable === undefined) {
      return <ScheduleIcon color="disabled" />
    }

    if (attendee.isAvailable) {
      return <CheckCircleIcon color="success" />
    }

    if (attendee.conflicts && attendee.conflicts.length > 0) {
      const hasOverlap = attendee.conflicts.some(c => c.severity === 'overlap')
      return hasOverlap ? (
        <ErrorIcon color="error" />
      ) : (
        <WarningIcon color="warning" />
      )
    }

    return <ErrorIcon color="error" />
  }

  const getAvailabilityTooltip = (attendee: AttendeeWithRole) => {
    if (isLoadingAvailability) return 'Checking availability...'
    if (attendee.isAvailable === undefined) return 'Availability unknown'
    if (attendee.isAvailable) return 'Available'

    if (attendee.conflicts && attendee.conflicts.length > 0) {
      const conflictTypes = attendee.conflicts.map(c => c.severity).join(', ')
      return `Conflicts: ${conflictTypes}`
    }

    return 'Not available'
  }

  return (
    <Box>
      <Autocomplete
        multiple
        options={filteredContacts}
        getOptionLabel={contact => `${contact.firstName} ${contact.lastName}`}
        value={attendeesWithRoles}
        onChange={(_, newValue) => {
          onSelectionChange(newValue.map(contact => contact.id))
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={`${option.firstName} ${option.lastName}`}
              {...getTagProps({ index })}
              key={option.id}
              avatar={
                showAvailability ? (
                  <Tooltip
                    title={getAvailabilityTooltip(option as AttendeeWithRole)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getAvailabilityIcon(option as AttendeeWithRole)}
                    </Box>
                  </Tooltip>
                ) : undefined
              }
            />
          ))
        }
        renderInput={params => (
          <TextField
            {...params}
            label="Attendees"
            placeholder="Search and select attendees..."
          />
        )}
      />
    </Box>
  )
}

export default AttendeeSelector

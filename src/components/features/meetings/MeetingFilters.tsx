import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { useContactsStore } from '../../../store/contactsStore'
import {
  MeetingFilter,
  MeetingType,
  MeetingStatus,
  MeetingPriority,
} from '../../../types/meeting'

interface FilterPreset {
  id: string
  name: string
  description: string
  filter: MeetingFilter
  isPublic: boolean
  createdBy: string
  createdAt: Date
  usageCount: number
}

interface MeetingFiltersProps {
  onFilterChange: (filter: MeetingFilter) => void
  onSearch: (query: string) => void
  currentFilter: MeetingFilter
  compact?: boolean
  showPresets?: boolean
  showSearch?: boolean
}

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

const meetingStatuses: { value: MeetingStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
]

const meetingPriorities: { value: MeetingPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const MeetingFilters: React.FC<MeetingFiltersProps> = ({
  onFilterChange,
  onSearch,
  currentFilter,
  compact = false,
  showPresets = true,
  showSearch = true,
}) => {
  const { contacts } = useContactsStore()
  const { meetings } = useMeetingsStore()

  const [searchQuery, setSearchQuery] = useState(
    currentFilter.searchQuery || ''
  )
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')
  const [presetMenuAnchor, setPresetMenuAnchor] = useState<null | HTMLElement>(
    null
  )
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset | null>(
    null
  )

  // Get unique values for filter options
  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>()
    meetings.forEach(meeting => {
      meeting.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [meetings])

  const uniqueLocations = React.useMemo(() => {
    const locations = new Set<string>()
    meetings.forEach(meeting => {
      if (meeting.location?.address) locations.add(meeting.location.address)
      if (meeting.location?.room) locations.add(meeting.location.room)
    })
    return Array.from(locations).sort()
  }, [meetings])

  const uniqueOrganizers = React.useMemo(() => {
    const organizers = new Set<string>()
    meetings.forEach(meeting => {
      if (meeting.organizer) organizers.add(meeting.organizer)
    })
    return Array.from(organizers).sort()
  }, [meetings])

  // Load filter presets
  useEffect(() => {
    loadFilterPresets()
  }, [])

  const loadFilterPresets = () => {
    // Mock data - in real app, this would come from API
    const mockPresets: FilterPreset[] = [
      {
        id: 'preset_1',
        name: "This Week's Meetings",
        description: 'All meetings scheduled for this week',
        filter: {
          dateRange: {
            start: new Date(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          statuses: ['scheduled', 'in_progress'],
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 25,
      },
      {
        id: 'preset_2',
        name: 'High Priority Meetings',
        description: 'Urgent and high priority meetings',
        filter: {
          priorities: ['urgent', 'high'],
          statuses: ['scheduled'],
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 15,
      },
      {
        id: 'preset_3',
        name: 'Client Meetings',
        description: 'All client-facing meetings',
        filter: {
          types: ['client_meeting'],
          tags: ['client-facing'],
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 20,
      },
    ]
    setFilterPresets(mockPresets)
  }

  const handleFilterChange = (key: keyof MeetingFilter, value: any) => {
    const newFilter = { ...currentFilter, [key]: value }
    onFilterChange(newFilter)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
    handleFilterChange('searchQuery', query)
  }

  const handleClearFilters = () => {
    const emptyFilter: MeetingFilter = {}
    onFilterChange(emptyFilter)
    setSearchQuery('')
    onSearch('')
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) return

    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name: presetName,
      description: presetDescription,
      filter: currentFilter,
      isPublic: false,
      createdBy: 'current_user',
      createdAt: new Date(),
      usageCount: 0,
    }

    setFilterPresets(prev => [...prev, newPreset])
    setShowSaveDialog(false)
    setPresetName('')
    setPresetDescription('')
  }

  const handleApplyPreset = (preset: FilterPreset) => {
    onFilterChange(preset.filter)
    setSearchQuery(preset.filter.searchQuery || '')
    setSelectedPreset(preset)

    // Update usage count
    setFilterPresets(prev =>
      prev.map(p =>
        p.id === preset.id ? { ...p, usageCount: p.usageCount + 1 } : p
      )
    )
  }

  const handleDeletePreset = (presetId: string) => {
    setFilterPresets(prev => prev.filter(p => p.id !== presetId))
    setPresetMenuAnchor(null)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (currentFilter.searchQuery) count++
    if (currentFilter.attendees?.length) count++
    if (currentFilter.types?.length) count++
    if (currentFilter.statuses?.length) count++
    if (currentFilter.priorities?.length) count++
    if (currentFilter.tags?.length) count++
    if (currentFilter.dateRange) count++
    if (currentFilter.organizer) count++
    if (currentFilter.locations?.length) count++
    if (currentFilter.hasActionItems !== undefined) count++
    if (currentFilter.isRecurring !== undefined) count++
    if (currentFilter.isPrivate !== undefined) count++
    if (currentFilter.minDuration || currentFilter.maxDuration) count++
    return count
  }

  const renderCompactFilters = () => (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}
      >
        {showSearch && (
          <TextField
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
            size="small"
            sx={{ minWidth: 250 }}
          />
        )}

        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outlined"
          size="small"
        >
          <Badge badgeContent={getActiveFilterCount()} color="primary">
            Filters
          </Badge>
        </Button>

        {getActiveFilterCount() > 0 && (
          <Button
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            size="small"
            color="secondary"
          >
            Clear
          </Button>
        )}

        {showPresets && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Presets</InputLabel>
            <Select
              value={selectedPreset?.id || ''}
              onChange={e => {
                const preset = filterPresets.find(p => p.id === e.target.value)
                if (preset) handleApplyPreset(preset)
              }}
              label="Presets"
            >
              {filterPresets.map(preset => (
                <MenuItem key={preset.id} value={preset.id}>
                  {preset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2 }}>{renderDetailedFilters()}</Box>
      </Collapse>
    </Paper>
  )

  const renderDetailedFilters = () => (
    <Grid container spacing={2}>
      {/* Attendees */}
      <Grid item xs={12} sm={6} md={4}>
        <Autocomplete
          multiple
          options={contacts}
          getOptionLabel={contact => `${contact.firstName} ${contact.lastName}`}
          value={
            contacts.filter(c => currentFilter.attendees?.includes(c.id)) || []
          }
          onChange={(_, newValue) => {
            handleFilterChange(
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
                size="small"
              />
            ))
          }
          renderInput={params => (
            <TextField {...params} label="Attendees" size="small" />
          )}
        />
      </Grid>

      {/* Meeting Types */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Meeting Types</InputLabel>
          <Select
            multiple
            value={currentFilter.types || []}
            onChange={e => handleFilterChange('types', e.target.value)}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as MeetingType[]).map(value => (
                  <Chip
                    key={value}
                    label={meetingTypes.find(t => t.value === value)?.label}
                    size="small"
                  />
                ))}
              </Box>
            )}
          >
            {meetingTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Status */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={currentFilter.statuses || []}
            onChange={e => handleFilterChange('statuses', e.target.value)}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as MeetingStatus[]).map(value => (
                  <Chip
                    key={value}
                    label={meetingStatuses.find(s => s.value === value)?.label}
                    size="small"
                  />
                ))}
              </Box>
            )}
          >
            {meetingStatuses.map(status => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Priority */}
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Priority</InputLabel>
          <Select
            multiple
            value={currentFilter.priorities || []}
            onChange={e => handleFilterChange('priorities', e.target.value)}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as MeetingPriority[]).map(value => (
                  <Chip
                    key={value}
                    label={
                      meetingPriorities.find(p => p.value === value)?.label
                    }
                    size="small"
                  />
                ))}
              </Box>
            )}
          >
            {meetingPriorities.map(priority => (
              <MenuItem key={priority.value} value={priority.value}>
                {priority.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Tags */}
      <Grid item xs={12} sm={6} md={4}>
        <Autocomplete
          multiple
          options={uniqueTags}
          value={currentFilter.tags || []}
          onChange={(_, newValue) => handleFilterChange('tags', newValue)}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                key={option}
                size="small"
              />
            ))
          }
          renderInput={params => (
            <TextField {...params} label="Tags" size="small" />
          )}
        />
      </Grid>

      {/* Date Range */}
      <Grid item xs={12} sm={6} md={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={currentFilter.dateRange?.start || null}
            onChange={newValue => {
              handleFilterChange('dateRange', {
                ...currentFilter.dateRange,
                start: newValue || new Date(),
              })
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="End Date"
            value={currentFilter.dateRange?.end || null}
            onChange={newValue => {
              handleFilterChange('dateRange', {
                ...currentFilter.dateRange,
                end: newValue || new Date(),
              })
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </LocalizationProvider>
      </Grid>

      {/* Boolean Filters */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Switch
                checked={currentFilter.hasActionItems || false}
                onChange={e =>
                  handleFilterChange('hasActionItems', e.target.checked)
                }
              />
            }
            label="Has Action Items"
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentFilter.isRecurring || false}
                onChange={e =>
                  handleFilterChange('isRecurring', e.target.checked)
                }
              />
            }
            label="Recurring"
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentFilter.isPrivate || false}
                onChange={e =>
                  handleFilterChange('isPrivate', e.target.checked)
                }
              />
            }
            label="Private"
          />
        </Box>
      </Grid>

      {/* Action Buttons */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            startIcon={<SaveIcon />}
            onClick={() => setShowSaveDialog(true)}
            disabled={getActiveFilterCount() === 0}
            size="small"
          >
            Save Preset
          </Button>
          <Button
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={getActiveFilterCount() === 0}
            size="small"
            color="secondary"
          >
            Clear All
          </Button>
        </Box>
      </Grid>
    </Grid>
  )

  if (compact) {
    return renderCompactFilters()
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6">Meeting Filters</Typography>
        <Typography variant="body2" color="text.secondary">
          {getActiveFilterCount()} active filter
          {getActiveFilterCount() !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {showSearch && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search meetings by title, description, or attendees..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
          />
        </Box>
      )}

      {renderDetailedFilters()}

      {/* Save Preset Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Filter Preset</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Preset Name"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={presetDescription}
              onChange={e => setPresetDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSavePreset}
            variant="contained"
            disabled={!presetName.trim()}
          >
            Save Preset
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default MeetingFilters

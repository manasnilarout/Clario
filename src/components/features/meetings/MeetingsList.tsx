import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  ButtonGroup,
  Button,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AvatarGroup,
  alpha,
} from '@mui/material'
import {
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  ViewAgenda as ViewAgendaIcon,
  TableRows as TableRowsIcon,
} from '@mui/icons-material'
import { Meeting, MeetingViewMode } from '../../../types/meeting'
import { useMeetingsStore } from '../../../store/meetingsStore'
import { EmptyState } from '../../common'
import MeetingCard from './MeetingCard'
import { format } from 'date-fns'
import { useTheme } from '@mui/material/styles'

interface MeetingsListProps {
  onMeetingClick?: (meeting: Meeting) => void
  onCreateMeeting?: () => void
  showFilters?: boolean
  showSearch?: boolean
  showPagination?: boolean
  itemsPerPage?: number
}

const MeetingsList: React.FC<MeetingsListProps> = ({
  onMeetingClick,
  onCreateMeeting,
  _showFilters = true,
  _showSearch = true,
  showPagination = true,
  itemsPerPage = 12,
}) => {
  const theme = useTheme()
  const {
    filteredMeetings,
    selectedMeetings,
    viewMode,
    sortBy,
    isLoading,
    selectMeeting,
    deselectMeeting,
    clearSelection,
    setViewMode,
    setSortBy,
  } = useMeetingsStore()

  const [currentPage, setCurrentPage] = useState(1)

  // Pagination
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMeetings = showPagination
    ? filteredMeetings.slice(startIndex, endIndex)
    : filteredMeetings

  const handleMeetingClick = (meeting: Meeting) => {
    if (onMeetingClick) {
      onMeetingClick(meeting)
    }
  }

  const handleSelectMeeting = (id: string) => {
    selectMeeting(id)
  }

  const handleDeselectMeeting = (id: string) => {
    deselectMeeting(id)
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  const handleViewModeChange = (mode: MeetingViewMode) => {
    setViewMode(mode)
  }

  const handleSortChange = (
    field: keyof Meeting,
    direction: 'asc' | 'desc'
  ) => {
    setSortBy({ field, direction })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return theme.palette.error.main
      case 'high':
        return theme.palette.warning.main
      case 'medium':
        return theme.palette.info.main
      case 'low':
        return theme.palette.success.main
      default:
        return theme.palette.grey[500]
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.palette.primary.main
      case 'in_progress':
        return theme.palette.warning.main
      case 'completed':
        return theme.palette.success.main
      case 'cancelled':
        return theme.palette.error.main
      default:
        return theme.palette.grey[500]
    }
  }

  const renderViewModeSelector = () => (
    <ButtonGroup variant="outlined" size="small">
      <Tooltip title="Grid View">
        <Button
          onClick={() => handleViewModeChange('calendar')}
          variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
        >
          <ViewModuleIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Tooltip title="List View">
        <Button
          onClick={() => handleViewModeChange('list')}
          variant={viewMode === 'list' ? 'contained' : 'outlined'}
        >
          <ViewListIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Tooltip title="Agenda View">
        <Button
          onClick={() => handleViewModeChange('agenda')}
          variant={viewMode === 'agenda' ? 'contained' : 'outlined'}
        >
          <ViewAgendaIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Tooltip title="Table View">
        <Button
          onClick={() => handleViewModeChange('timeline')}
          variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
        >
          <TableRowsIcon fontSize="small" />
        </Button>
      </Tooltip>
    </ButtonGroup>
  )

  const renderSortSelector = () => (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>Sort by</InputLabel>
      <Select
        value={`${sortBy.field}_${sortBy.direction}`}
        label="Sort by"
        onChange={e => {
          const [field, direction] = e.target.value.split('_')
          handleSortChange(field as keyof Meeting, direction as 'asc' | 'desc')
        }}
      >
        <MenuItem value="startTime_asc">Date (Earliest)</MenuItem>
        <MenuItem value="startTime_desc">Date (Latest)</MenuItem>
        <MenuItem value="title_asc">Title (A-Z)</MenuItem>
        <MenuItem value="title_desc">Title (Z-A)</MenuItem>
        <MenuItem value="priority_desc">Priority (High-Low)</MenuItem>
        <MenuItem value="priority_asc">Priority (Low-High)</MenuItem>
        <MenuItem value="status_asc">Status</MenuItem>
        <MenuItem value="duration_desc">Duration (Long-Short)</MenuItem>
        <MenuItem value="duration_asc">Duration (Short-Long)</MenuItem>
      </Select>
    </FormControl>
  )

  const renderGridView = () => (
    <Grid container spacing={2}>
      {currentMeetings.map(meeting => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={meeting.id}>
          <MeetingCard
            meeting={meeting}
            isSelected={selectedMeetings.includes(meeting.id)}
            onSelect={handleSelectMeeting}
            onDeselect={handleDeselectMeeting}
            onClick={handleMeetingClick}
            showCheckbox={selectedMeetings.length > 0}
          />
        </Grid>
      ))}
    </Grid>
  )

  const renderListView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {currentMeetings.map(meeting => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          isSelected={selectedMeetings.includes(meeting.id)}
          onSelect={handleSelectMeeting}
          onDeselect={handleDeselectMeeting}
          onClick={handleMeetingClick}
          showCheckbox={selectedMeetings.length > 0}
          variant="compact"
        />
      ))}
    </Box>
  )

  const renderAgendaView = () => {
    const groupedMeetings = currentMeetings.reduce(
      (groups, meeting) => {
        const dateKey = format(meeting.startTime, 'yyyy-MM-dd')
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(meeting)
        return groups
      },
      {} as Record<string, Meeting[]>
    )

    return (
      <Box>
        {Object.entries(groupedMeetings).map(([dateKey, dayMeetings]) => (
          <Box key={dateKey} sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider',
                color: theme.palette.primary.main,
              }}
            >
              {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
              <Chip
                label={`${dayMeetings.length} meeting${dayMeetings.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ ml: 2 }}
              />
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dayMeetings
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                .map(meeting => (
                  <Card
                    key={meeting.id}
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      borderLeft: `4px solid ${getPriorityColor(meeting.priority)}`,
                      '&:hover': {
                        backgroundColor: alpha(
                          theme.palette.action.hover,
                          0.05
                        ),
                      },
                    }}
                    onClick={() => handleMeetingClick(meeting)}
                  >
                    <CardContent sx={{ py: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1">
                            {meeting.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {format(meeting.startTime, 'HH:mm')} -{' '}
                            {format(meeting.endTime, 'HH:mm')}
                            {meeting.location && (
                              <span>
                                {' '}
                                •{' '}
                                {meeting.location.type === 'virtual'
                                  ? 'Virtual'
                                  : meeting.location.address}
                              </span>
                            )}
                          </Typography>
                          {meeting.attendees.length > 0 && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 0.5,
                              }}
                            >
                              <AvatarGroup
                                max={3}
                                sx={{
                                  '& .MuiAvatar-root': {
                                    width: 20,
                                    height: 20,
                                    fontSize: '0.7rem',
                                  },
                                }}
                              >
                                {meeting.attendees.map(attendee => (
                                  <Avatar
                                    key={attendee.id}
                                    src={attendee.avatar}
                                    alt={`${attendee.firstName} ${attendee.lastName}`}
                                  >
                                    {attendee.firstName[0]}
                                    {attendee.lastName[0]}
                                  </Avatar>
                                ))}
                              </AvatarGroup>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {meeting.attendees.length} attendee
                                {meeting.attendees.length !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Box
                          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                        >
                          <Chip
                            label={meeting.priority}
                            size="small"
                            sx={{
                              backgroundColor: alpha(
                                getPriorityColor(meeting.priority),
                                0.1
                              ),
                              color: getPriorityColor(meeting.priority),
                            }}
                          />
                          <Chip
                            label={meeting.status}
                            size="small"
                            sx={{
                              backgroundColor: alpha(
                                getStatusColor(meeting.status),
                                0.1
                              ),
                              color: getStatusColor(meeting.status),
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  const renderTableView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Meeting</TableCell>
            <TableCell>Date & Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Attendees</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentMeetings.map(meeting => (
            <TableRow
              key={meeting.id}
              hover
              sx={{
                cursor: 'pointer',
                borderLeft: `4px solid ${getPriorityColor(meeting.priority)}`,
              }}
              onClick={() => handleMeetingClick(meeting)}
            >
              <TableCell>
                <Box>
                  <Typography variant="subtitle2">{meeting.title}</Typography>
                  {meeting.description && (
                    <Typography variant="caption" color="text.secondary">
                      {meeting.description.substring(0, 50)}...
                    </Typography>
                  )}
                </Box>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {format(meeting.startTime, 'MMM d, yyyy')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(meeting.startTime, 'HH:mm')} -{' '}
                  {format(meeting.endTime, 'HH:mm')}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={`${meeting.duration} min`}
                  size="small"
                  variant="outlined"
                />
              </TableCell>

              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AvatarGroup
                    max={3}
                    sx={{
                      '& .MuiAvatar-root': {
                        width: 24,
                        height: 24,
                        fontSize: '0.7rem',
                      },
                    }}
                  >
                    {meeting.attendees.map(attendee => (
                      <Avatar
                        key={attendee.id}
                        src={attendee.avatar}
                        alt={`${attendee.firstName} ${attendee.lastName}`}
                      >
                        {attendee.firstName[0]}
                        {attendee.lastName[0]}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography variant="caption" color="text.secondary">
                    {meeting.attendees.length}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {meeting.location?.type === 'virtual'
                    ? 'Virtual'
                    : meeting.location?.type === 'physical'
                      ? meeting.location.room || 'Physical'
                      : 'TBD'}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={meeting.priority}
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      getPriorityColor(meeting.priority),
                      0.1
                    ),
                    color: getPriorityColor(meeting.priority),
                  }}
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={meeting.status}
                  size="small"
                  sx={{
                    backgroundColor: alpha(getStatusColor(meeting.status), 0.1),
                    color: getStatusColor(meeting.status),
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading meetings...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Toolbar */}
      <Toolbar
        sx={{
          px: { xs: 1, sm: 2 },
          py: 1,
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">
            Meetings ({filteredMeetings.length})
          </Typography>

          {selectedMeetings.length > 0 && (
            <Chip
              label={`${selectedMeetings.length} selected`}
              color="primary"
              onDelete={clearSelection}
              size="small"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {renderViewModeSelector()}
          {renderSortSelector()}
        </Box>
      </Toolbar>

      {/* Content */}
      {filteredMeetings.length === 0 ? (
        <EmptyState
          title="No meetings found"
          description="Start by creating your first meeting or adjust your filters."
          actionLabel="Create Meeting"
          onAction={onCreateMeeting}
        />
      ) : (
        <Box>
          {viewMode === 'calendar' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'agenda' && renderAgendaView()}
          {viewMode === 'timeline' && renderTableView()}
        </Box>
      )}

      {/* Pagination */}
      {showPagination && filteredMeetings.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  )
}

export default MeetingsList

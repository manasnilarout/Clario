import React from 'react'
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  TableSortLabel,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Button,
  Toolbar,
  alpha,
} from '@mui/material'
import { Grid } from '@mui/material'
import {
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { Task, TaskViewMode, TaskSortOption } from '../../../types/task'
import { useTasksStore } from '../../../store/tasksStore'
import { useContactsStore } from '../../../store/contactsStore'
import TaskCard from './TaskCard'
import { EmptyState } from '../../common/EmptyState'

interface TasksListProps {
  onTaskClick?: (task: Task) => void
  variant?: 'default' | 'compact'
  showHeader?: boolean
  showPagination?: boolean
  showViewToggle?: boolean
  showBulkActions?: boolean
}

const TasksList: React.FC<TasksListProps> = ({
  onTaskClick,
  variant = 'default',
  showHeader = true,
  showPagination = true,
  showViewToggle = true,
  showBulkActions = true,
}) => {
  const {
    filteredTasks,
    selectedTasks,
    viewMode,
    sortBy,
    searchQuery,
    isLoading,
    showCompletedTasks,
    setViewMode,
    setSortBy,
    selectTask,
    deselectTask,
    selectAllTasks,
    deselectAllTasks,
    bulkUpdateTasks,
    bulkDeleteTasks,
    startCreating,
    setShowCompletedTasks,
  } = useTasksStore()

  const { getContactById } = useContactsStore()

  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(20)

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: TaskViewMode | null
  ) => {
    if (newViewMode) {
      setViewMode(newViewMode)
    }
  }

  const handleSortChange = (property: TaskSortOption) => {
    setSortBy(property)
  }

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      deselectAllTasks()
    } else {
      selectAllTasks()
    }
  }

  const handleBulkComplete = async () => {
    if (selectedTasks.length > 0) {
      await bulkUpdateTasks(selectedTasks, {
        status: 'completed',
        progress: 100,
      })
      deselectAllTasks()
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.length > 0) {
      await bulkDeleteTasks(selectedTasks)
      deselectAllTasks()
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in_progress':
        return 'info'
      case 'blocked':
        return 'error'
      case 'waiting':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      default:
        return 'default'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    }).format(date)
  }

  const isOverdue = (task: Task) => {
    return (
      task.dueDate && task.dueDate < new Date() && task.status !== 'completed'
    )
  }

  // Empty states
  if (!isLoading && filteredTasks.length === 0) {
    if (searchQuery) {
      return (
        <EmptyState
          icon={<TaskIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
          title="No tasks found"
          description={`No tasks match your search for "${searchQuery}"`}
          action={{
            label: 'Clear Search',
            onClick: () => window.location.reload(),
            variant: 'secondary',
          }}
        />
      )
    }

    return (
      <EmptyState
        icon={<TaskIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
        title="No tasks yet"
        description="Get started by creating your first task"
        action={{
          label: 'Create Task',
          onClick: () => startCreating(),
          variant: 'primary',
        }}
      />
    )
  }

  return (
    <Box>
      {/* Header with controls */}
      {showHeader && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              Tasks ({filteredTasks.length})
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* View Mode Toggle */}
              {showViewToggle && (
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  size="small"
                >
                  <ToggleButton value="list">
                    <Tooltip title="List View">
                      <ViewListIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="kanban">
                    <Tooltip title="Kanban Board">
                      <GridViewIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="calendar">
                    <Tooltip title="Calendar View">
                      <CalendarIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="timeline">
                    <Tooltip title="Timeline View">
                      <ScheduleIcon />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              )}

              {/* Sort Selector */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={sortBy}
                  onChange={e =>
                    handleSortChange(e.target.value as TaskSortOption)
                  }
                  displayEmpty
                >
                  <MenuItem value="created_date">Created Date</MenuItem>
                  <MenuItem value="due_date">Due Date</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="assignee">Assignee</MenuItem>
                  <MenuItem value="progress">Progress</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => startCreating()}
              >
                Add Task
              </Button>
            </Box>
          </Box>

          {/* Bulk Actions Toolbar */}
          {showBulkActions && selectedTasks.length > 0 && (
            <Toolbar
              sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                bgcolor: theme => alpha(theme.palette.primary.main, 0.08),
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography
                sx={{ flex: '1 1 100%' }}
                color="primary"
                variant="subtitle1"
              >
                {selectedTasks.length} selected
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleBulkComplete}>
                  Mark Complete
                </Button>
                <Button size="small" color="error" onClick={handleBulkDelete}>
                  Delete
                </Button>
                <Button size="small" onClick={deselectAllTasks}>
                  Clear Selection
                </Button>
              </Box>
            </Toolbar>
          )}

          {/* Show/Hide Completed Toggle */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowCompletedTasks(!showCompletedTasks)}
            >
              {showCompletedTasks ? 'Hide' : 'Show'} Completed Tasks
            </Button>
          </Box>
        </Box>
      )}

      {/* Loading State */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Task List Views */}
      {viewMode === 'list' && (
        <>
          {/* Card Grid View */}
          <Grid container spacing={2}>
            {paginatedTasks.map(task => (
              <Grid size={{ xs: 12 }} key={task.id}>
                <TaskCard
                  task={task}
                  variant={variant === 'compact' ? 'compact' : 'default'}
                  isSelected={selectedTasks.includes(task.id)}
                  onSelect={selectTask}
                  onDeselect={deselectTask}
                  onClick={onTaskClick}
                  showCheckbox={showBulkActions}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {viewMode === 'list' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {showBulkActions && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selectedTasks.length > 0 &&
                        selectedTasks.length < filteredTasks.length
                      }
                      checked={
                        filteredTasks.length > 0 &&
                        selectedTasks.length === filteredTasks.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'title'}
                    onClick={() => handleSortChange('title')}
                  >
                    Task
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'status'}
                    onClick={() => handleSortChange('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'priority'}
                    onClick={() => handleSortChange('priority')}
                  >
                    Priority
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'assignee'}
                    onClick={() => handleSortChange('assignee')}
                  >
                    Assignee
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'due_date'}
                    onClick={() => handleSortChange('due_date')}
                  >
                    Due Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'progress'}
                    onClick={() => handleSortChange('progress')}
                  >
                    Progress
                  </TableSortLabel>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTasks.map(task => {
                const assignedContact = task.assignedTo
                  ? getContactById(task.assignedTo)
                  : null
                const isTaskOverdue = isOverdue(task)

                return (
                  <TableRow
                    key={task.id}
                    hover
                    selected={selectedTasks.includes(task.id)}
                    sx={{ cursor: onTaskClick ? 'pointer' : 'default' }}
                    onClick={() => onTaskClick?.(task)}
                  >
                    {showBulkActions && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={selectedTasks.includes(task.id)}
                          onChange={e => {
                            e.stopPropagation()
                            if (e.target.checked) {
                              selectTask(task.id)
                            } else {
                              deselectTask(task.id)
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {task.title}
                        </Typography>
                        {task.category && (
                          <Typography variant="caption" color="text.secondary">
                            {task.category}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={task.status.replace('_', ' ')}
                        color={getStatusColor(task.status) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={task.priority}
                        color={getPriorityColor(task.priority) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {assignedContact ? (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                          >
                            {assignedContact.firstName[0]}
                            {assignedContact.lastName[0]}
                          </Avatar>
                          <Typography variant="body2">
                            {assignedContact.firstName}{' '}
                            {assignedContact.lastName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <Typography
                          variant="body2"
                          color={isTaskOverdue ? 'error.main' : 'text.primary'}
                        >
                          {formatDate(task.dueDate)}
                          {isTaskOverdue && ' (Overdue)'}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No due date
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          minWidth: 100,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{ flex: 1, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {task.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Items per page selector */}
      {showPagination && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Typography variant="body2" sx={{ mr: 1 }}>
            Items per page:
          </Typography>
          <FormControl size="small">
            <Select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  )
}

export default TasksList

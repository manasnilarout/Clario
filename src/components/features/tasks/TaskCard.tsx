import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider,
  AvatarGroup,
  Button,
  styled,
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Check as CheckIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
  Attachment as AttachmentIcon,
  CheckBox as CheckBoxIcon,
  Assignment as TaskIcon,
  Group as GroupIcon,
  Event as MeetingIcon,
  ContactPhone as ContactIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { Task, TaskStatus, TaskPriority } from '../../../types/task'
import { useTasksStore } from '../../../store/tasksStore'
import { useContactsStore } from '../../../store/contactsStore'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
}))

const PriorityIndicator = styled(Box)<{ priority: TaskPriority }>(
  ({ theme, priority }) => ({
    width: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: '8px 0 0 8px',
    backgroundColor:
      priority === 'urgent'
        ? theme.palette.error.main
        : priority === 'high'
          ? theme.palette.warning.main
          : priority === 'medium'
            ? theme.palette.info.main
            : theme.palette.grey[400],
  })
)

const StatusChip = styled(Chip)<{ taskstatus: TaskStatus }>(
  ({ theme, taskstatus }) => ({
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 24,
    backgroundColor:
      taskstatus === 'completed'
        ? theme.palette.success.light
        : taskstatus === 'in_progress'
          ? theme.palette.info.light
          : taskstatus === 'blocked'
            ? theme.palette.error.light
            : taskstatus === 'waiting'
              ? theme.palette.warning.light
              : theme.palette.grey[200],
    color:
      taskstatus === 'completed'
        ? theme.palette.success.dark
        : taskstatus === 'in_progress'
          ? theme.palette.info.dark
          : taskstatus === 'blocked'
            ? theme.palette.error.dark
            : taskstatus === 'waiting'
              ? theme.palette.warning.dark
              : theme.palette.grey[700],
  })
)

export interface TaskCardProps {
  task: Task
  variant?: 'default' | 'compact' | 'kanban' | 'detailed'
  isSelected?: boolean
  onSelect?: (id: string) => void
  onDeselect?: (id: string) => void
  onClick?: (task: Task) => void
  showCheckbox?: boolean
  draggable?: boolean
  showProgress?: boolean
  showDueDate?: boolean
  showAssignee?: boolean
  showSubtasks?: boolean
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant = 'default',
  isSelected = false,
  onSelect,
  onDeselect,
  onClick,
  showCheckbox = false,
  draggable = false,
  showProgress = true,
  showDueDate = true,
  showAssignee = true,
  showSubtasks = true,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { updateTask, deleteTask, startEditing } = useTasksStore()
  const { getContactById } = useContactsStore()

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (
    event?: React.MouseEvent | object,
    reason?: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (event && 'stopPropagation' in event) event.stopPropagation()
    setAnchorEl(null)
  }

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation()
    startEditing(task.id)
    handleMenuClose()
  }

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation()
    await deleteTask(task.id)
    handleMenuClose()
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateTask(task.id, { status: newStatus })
  }

  const handleComplete = async (event: React.MouseEvent) => {
    event.stopPropagation()
    await handleStatusChange('completed')
  }

  const handleToggleProgress = async (event: React.MouseEvent) => {
    event.stopPropagation()
    const newStatus = task.status === 'in_progress' ? 'waiting' : 'in_progress'
    await handleStatusChange(newStatus)
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(task)
    }
  }

  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation()
    if (event.target.checked) {
      onSelect?.(task.id)
    } else {
      onDeselect?.(task.id)
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckIcon fontSize="small" />
      case 'in_progress':
        return <PlayIcon fontSize="small" />
      case 'blocked':
        return <FlagIcon fontSize="small" />
      default:
        return <TaskIcon fontSize="small" />
    }
  }

  const getTypeIcon = () => {
    switch (task.type) {
      case 'meeting_followup':
        return <MeetingIcon fontSize="small" />
      case 'action_item':
        return <CheckBoxIcon fontSize="small" />
      case 'reminder':
        return <ScheduleIcon fontSize="small" />
      default:
        return <TaskIcon fontSize="small" />
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`
    if (diffDays < 7) return `${diffDays} days`

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const isOverdue =
    task.dueDate && task.dueDate < new Date() && task.status !== 'completed'

  const assignedContact = task.assignedTo
    ? getContactById(task.assignedTo)
    : null

  // Compact variant for dense lists
  if (variant === 'compact') {
    return (
      <StyledCard
        onClick={handleCardClick}
        sx={{ cursor: onClick ? 'pointer' : 'default', mb: 1 }}
      >
        <PriorityIndicator priority={task.priority} />
        <CardContent sx={{ py: 1.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showCheckbox && (
              <Checkbox
                size="small"
                checked={isSelected}
                onChange={handleSelectionChange}
                onClick={e => e.stopPropagation()}
              />
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Tooltip title={task.type}>{getTypeIcon()}</Tooltip>

              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                sx={{ flex: 1 }}
              >
                {task.title}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusChip
                size="small"
                label={task.status.replace('_', ' ')}
                taskstatus={task.status}
              />

              {showAssignee && assignedContact && (
                <Tooltip
                  title={`${assignedContact.firstName} ${assignedContact.lastName}`}
                >
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {assignedContact.firstName[0]}
                    {assignedContact.lastName[0]}
                  </Avatar>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    )
  }

  // Kanban variant for board view
  if (variant === 'kanban') {
    return (
      <StyledCard
        onClick={handleCardClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          mb: 2,
          opacity: draggable ? 0.9 : 1,
        }}
        draggable={draggable}
      >
        <PriorityIndicator priority={task.priority} />
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ flex: 1, mr: 1 }}
            >
              {task.title}
            </Typography>

            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {task.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {task.tags.slice(0, 2).map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
            {task.tags.length > 2 && (
              <Chip
                label={`+${task.tags.length - 2}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showDueDate && task.dueDate && (
                <Tooltip title={`Due: ${formatDate(task.dueDate)}`}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: isOverdue ? 'error.main' : 'text.secondary',
                    }}
                  >
                    <CalendarIcon fontSize="small" />
                    <Typography variant="caption">
                      {formatDate(task.dueDate)}
                    </Typography>
                  </Box>
                </Tooltip>
              )}

              {task.checklistItems.length > 0 && (
                <Tooltip
                  title={`${task.checklistItems.filter(item => item.completed).length}/${task.checklistItems.length} completed`}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'text.secondary',
                    }}
                  >
                    <CheckBoxIcon fontSize="small" />
                    <Typography variant="caption">
                      {
                        task.checklistItems.filter(item => item.completed)
                          .length
                      }
                      /{task.checklistItems.length}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>

            {showAssignee && assignedContact && (
              <Tooltip
                title={`Assigned to ${assignedContact.firstName} ${assignedContact.lastName}`}
              >
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                  {assignedContact.firstName[0]}
                  {assignedContact.lastName[0]}
                </Avatar>
              </Tooltip>
            )}
          </Box>

          {showProgress && task.progress > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={task.progress}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}
        </CardContent>
      </StyledCard>
    )
  }

  // Default and detailed variants
  return (
    <StyledCard
      onClick={handleCardClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        mb: 2,
      }}
    >
      <PriorityIndicator priority={task.priority} />

      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          {showCheckbox && (
            <Checkbox
              checked={isSelected}
              onChange={handleSelectionChange}
              onClick={e => e.stopPropagation()}
            />
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flex: 1,
                  mr: 2,
                }}
              >
                <Tooltip title={task.type}>{getTypeIcon()}</Tooltip>

                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                  {task.title}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StatusChip
                  label={task.status.replace('_', ' ')}
                  taskstatus={task.status}
                />

                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>

            {task.description && variant === 'detailed' && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {task.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                icon={<FlagIcon fontSize="small" />}
                label={task.priority}
                size="small"
                color={
                  task.priority === 'urgent'
                    ? 'error'
                    : task.priority === 'high'
                      ? 'warning'
                      : task.priority === 'medium'
                        ? 'info'
                        : 'default'
                }
                variant="outlined"
              />

              {task.category && (
                <Chip label={task.category} size="small" variant="outlined" />
              )}

              {task.tags.slice(0, 3).map(tag => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}

              {task.tags.length > 3 && (
                <Chip
                  label={`+${task.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
              }}
            >
              {showDueDate && task.dueDate && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: isOverdue ? 'error.main' : 'text.secondary',
                  }}
                >
                  <CalendarIcon fontSize="small" />
                  <Typography variant="body2">
                    Due {formatDate(task.dueDate)}
                  </Typography>
                </Box>
              )}

              {task.estimatedDuration && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                  }}
                >
                  <TimeIcon fontSize="small" />
                  <Typography variant="body2">
                    {Math.floor(task.estimatedDuration / 60)}h{' '}
                    {task.estimatedDuration % 60}m
                  </Typography>
                </Box>
              )}

              {showAssignee && assignedContact && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                  }}
                >
                  <PersonIcon fontSize="small" />
                  <Typography variant="body2">
                    {assignedContact.firstName} {assignedContact.lastName}
                  </Typography>
                </Box>
              )}

              {task.watchers.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                  }}
                >
                  <GroupIcon fontSize="small" />
                  <Typography variant="body2">
                    {task.watchers.length} watching
                  </Typography>
                </Box>
              )}
            </Box>

            {showProgress && task.progress > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}

            {variant === 'detailed' && (
              <>
                {task.checklistItems.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Checklist (
                      {
                        task.checklistItems.filter(item => item.completed)
                          .length
                      }
                      /{task.checklistItems.length})
                    </Typography>
                    {task.checklistItems.slice(0, 3).map(item => (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={item.completed}
                          disabled
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: item.completed
                              ? 'line-through'
                              : 'none',
                            color: item.completed
                              ? 'text.secondary'
                              : 'text.primary',
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                    ))}
                    {task.checklistItems.length > 3 && (
                      <Typography variant="body2" color="text.secondary">
                        +{task.checklistItems.length - 3} more items
                      </Typography>
                    )}
                  </Box>
                )}

                {showSubtasks && task.subtasks.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Subtasks (
                      {
                        task.subtasks.filter(t => t.status === 'completed')
                          .length
                      }
                      /{task.subtasks.length})
                    </Typography>
                    {task.subtasks.slice(0, 2).map(subtask => (
                      <Box
                        key={subtask.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <StatusChip
                          size="small"
                          label={subtask.status.replace('_', ' ')}
                          taskstatus={subtask.status}
                        />
                        <Typography variant="body2" noWrap>
                          {subtask.title}
                        </Typography>
                      </Box>
                    ))}
                    {task.subtasks.length > 2 && (
                      <Typography variant="body2" color="text.secondary">
                        +{task.subtasks.length - 2} more subtasks
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </CardContent>

      {variant === 'detailed' && (
        <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {task.status !== 'completed' && (
              <>
                <Button
                  size="small"
                  startIcon={
                    task.status === 'in_progress' ? <PauseIcon /> : <PlayIcon />
                  }
                  onClick={handleToggleProgress}
                >
                  {task.status === 'in_progress' ? 'Pause' : 'Start'}
                </Button>

                <Button
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={handleComplete}
                  color="success"
                >
                  Complete
                </Button>
              </>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.secondary',
            }}
          >
            {task.comments.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CommentIcon fontSize="small" />
                <Typography variant="caption">
                  {task.comments.length}
                </Typography>
              </Box>
            )}

            {task.attachments.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachmentIcon fontSize="small" />
                <Typography variant="caption">
                  {task.attachments.length}
                </Typography>
              </Box>
            )}

            {task.dependencies.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LinkIcon fontSize="small" />
                <Typography variant="caption">
                  {task.dependencies.length}
                </Typography>
              </Box>
            )}
          </Box>
        </CardActions>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={e => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Task</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
        </MenuItem>
      </Menu>
    </StyledCard>
  )
}

export default TaskCard

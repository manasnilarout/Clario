import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Collapse,
  Alert,
  styled,
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  Active,
  Over,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Task,
  TaskStatus,
  KanbanBoard as KanbanBoardType,
  KanbanColumn,
} from '../../../types/task'
import TaskCard from './TaskCard'
import { useTasksStore } from '../../../store/tasksStore'

const BoardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  overflowX: 'auto',
  height: 'calc(100vh - 200px)',
  minHeight: '600px',
}))

const ColumnContainer = styled(Paper)(({ theme }) => ({
  minWidth: '300px',
  maxWidth: '350px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}))

const ColumnHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}))

const ColumnContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: 'auto',
  minHeight: '200px',
}))

const TaskList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  minHeight: '50px',
}))

const AddTaskButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  marginTop: 0,
  borderStyle: 'dashed',
  borderColor: theme.palette.divider,
  color: theme.palette.text.secondary,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}))

const WipLimitWarning = styled(Alert)(({ theme }) => ({
  margin: theme.spacing(1),
  marginTop: 0,
}))

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void
  onTaskClick?: (task: Task) => void
  onTaskCreate?: (columnStatus: TaskStatus) => void
  columns?: KanbanColumn[]
  settings?: {
    showSubtasks?: boolean
    showProgress?: boolean
    showDueDate?: boolean
    showAssignee?: boolean
    compactMode?: boolean
  }
}

interface KanbanColumnComponentProps {
  column: KanbanColumn
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void
  onTaskClick?: (task: Task) => void
  onTaskCreate?: () => void
  settings?: KanbanBoardProps['settings']
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface SortableTaskProps {
  task: Task
  onTaskClick?: (task: Task) => void
  settings?: KanbanBoardProps['settings']
}

const SortableTask: React.FC<SortableTaskProps> = ({
  task,
  onTaskClick,
  settings,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        variant={settings?.compactMode ? 'compact' : 'kanban'}
        onClick={onTaskClick}
        draggable
        showProgress={settings?.showProgress}
        showDueDate={settings?.showDueDate}
        showAssignee={settings?.showAssignee}
      />
    </Box>
  )
}

const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({
  column,
  tasks,
  onTaskMove,
  onTaskClick,
  onTaskCreate,
  settings,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const isMenuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const columnTasks = tasks.filter(task => task.status === column.status)
  const isOverLimit = column.limit && columnTasks.length > column.limit
  const taskIds = columnTasks.map(task => task.id)

  return (
    <ColumnContainer>
      <ColumnHeader
        sx={{ backgroundColor: column.color || 'background.paper' }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" component="h2">
            {column.title}
          </Typography>
          <Badge
            badgeContent={columnTasks.length}
            color={isOverLimit ? 'error' : 'primary'}
            sx={{
              '& .MuiBadge-badge': { position: 'static', transform: 'none' },
            }}
          />
          {column.limit && (
            <Typography variant="caption" color="text.secondary">
              / {column.limit}
            </Typography>
          )}
        </Box>
        <Box>
          <IconButton size="small" onClick={onToggleCollapse}>
            {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </ColumnHeader>

      <Collapse in={!isCollapsed}>
        {isOverLimit && (
          <WipLimitWarning severity="warning" icon={<WarningIcon />}>
            WIP limit exceeded ({columnTasks.length}/{column.limit})
          </WipLimitWarning>
        )}

        <ColumnContent>
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <TaskList>
              {columnTasks.map(task => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  settings={settings}
                />
              ))}
            </TaskList>
          </SortableContext>
        </ColumnContent>

        <AddTaskButton
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onTaskCreate}
          fullWidth
        >
          Add Task
        </AddTaskButton>
      </Collapse>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>Column Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <FilterIcon />
          </ListItemIcon>
          <ListItemText>Filter Tasks</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            {isCollapsed ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </ListItemIcon>
          <ListItemText>{isCollapsed ? 'Expand' : 'Collapse'}</ListItemText>
        </MenuItem>
      </Menu>
    </ColumnContainer>
  )
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskMove,
  onTaskClick,
  onTaskCreate,
  columns: customColumns,
  settings = {
    showSubtasks: true,
    showProgress: true,
    showDueDate: true,
    showAssignee: true,
    compactMode: false,
  },
}) => {
  const { kanbanBoard } = useTasksStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(
    new Set()
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [boardSettings, setBoardSettings] = useState(settings)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Default columns if no kanban board is available
  const defaultColumns: KanbanColumn[] = [
    {
      id: 'not_started',
      title: 'To Do',
      status: 'not_started',
      order: 0,
      color: '#e3f2fd',
      isCollapsed: false,
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      status: 'in_progress',
      order: 1,
      color: '#fff3e0',
      isCollapsed: false,
      limit: 5,
    },
    {
      id: 'waiting',
      title: 'Waiting',
      status: 'waiting',
      order: 2,
      color: '#fce4ec',
      isCollapsed: false,
    },
    {
      id: 'blocked',
      title: 'Blocked',
      status: 'blocked',
      order: 3,
      color: '#ffebee',
      isCollapsed: false,
    },
    {
      id: 'completed',
      title: 'Completed',
      status: 'completed',
      order: 4,
      color: '#e8f5e8',
      isCollapsed: false,
    },
  ]

  const columns = customColumns || kanbanBoard?.columns || defaultColumns

  const activeTask = useMemo(() => {
    if (!activeId) return null
    return tasks.find(task => task.id === activeId)
  }, [activeId, tasks])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTaskId = active.id as string
    const activeTask = tasks.find(task => task.id === activeTaskId)

    if (!activeTask) return

    // Check if dropping on a column
    const overColumn = columns.find(column => column.id === over.id)
    if (overColumn && activeTask.status !== overColumn.status) {
      onTaskMove(activeTaskId, overColumn.status)
      return
    }

    // Check if reordering within the same column
    const overTaskId = over.id as string
    const overTask = tasks.find(task => task.id === overTaskId)

    if (overTask && activeTask.status === overTask.status) {
      // Handle reordering logic here if needed
      // For now, we'll just let the drag complete without reordering
      return
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find(task => task.id === activeId)
    const overTask = tasks.find(task => task.id === overId)
    const overColumn = columns.find(column => column.id === overId)

    if (!activeTask) return

    // Moving to different column
    if (overColumn && activeTask.status !== overColumn.status) {
      onTaskMove(activeId, overColumn.status)
    }
  }

  const handleToggleCollapse = (columnId: string) => {
    setCollapsedColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(columnId)) {
        newSet.delete(columnId)
      } else {
        newSet.add(columnId)
      }
      return newSet
    })
  }

  const handleTaskCreate = (columnStatus: TaskStatus) => {
    if (onTaskCreate) {
      onTaskCreate(columnStatus)
    }
  }

  const handleSettingsChange = (
    key: keyof typeof boardSettings,
    value: boolean
  ) => {
    setBoardSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" component="h1">
          Kanban Board
        </Typography>
        <Button
          startIcon={<SettingsIcon />}
          onClick={() => setSettingsOpen(true)}
          variant="outlined"
        >
          Board Settings
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <BoardContainer>
          {columns.map(column => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              tasks={tasks}
              onTaskMove={onTaskMove}
              onTaskClick={onTaskClick}
              onTaskCreate={() => handleTaskCreate(column.status)}
              settings={boardSettings}
              isCollapsed={collapsedColumns.has(column.id)}
              onToggleCollapse={() => handleToggleCollapse(column.id)}
            />
          ))}
        </BoardContainer>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              variant={boardSettings.compactMode ? 'compact' : 'kanban'}
              draggable
              showProgress={boardSettings.showProgress}
              showDueDate={boardSettings.showDueDate}
              showAssignee={boardSettings.showAssignee}
            />
          )}
        </DragOverlay>
      </DndContext>

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Board Settings</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={boardSettings.showSubtasks}
                  onChange={e =>
                    handleSettingsChange('showSubtasks', e.target.checked)
                  }
                />
              }
              label="Show Subtasks"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={boardSettings.showProgress}
                  onChange={e =>
                    handleSettingsChange('showProgress', e.target.checked)
                  }
                />
              }
              label="Show Progress"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={boardSettings.showDueDate}
                  onChange={e =>
                    handleSettingsChange('showDueDate', e.target.checked)
                  }
                />
              }
              label="Show Due Date"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={boardSettings.showAssignee}
                  onChange={e =>
                    handleSettingsChange('showAssignee', e.target.checked)
                  }
                />
              }
              label="Show Assignee"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={boardSettings.compactMode}
                  onChange={e =>
                    handleSettingsChange('compactMode', e.target.checked)
                  }
                />
              }
              label="Compact Mode"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default KanbanBoard

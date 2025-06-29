import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  styled,
  alpha,
} from '@mui/material'
import {
  Add,
  PersonAdd,
  EventNote,
  Assignment,
  Settings,
  Email,
  Phone,
  VideoCall,
  Download,
  Sync,
  Analytics,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../../store'

// Styled Components
const ActionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  overflow: 'hidden',
  minHeight: 85,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
    borderColor: theme.palette.primary.main,
    '&::before': {
      opacity: 1,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
  },
}))

const ActionIcon = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 6px',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontSize: 18,
  transition: 'all 0.2s ease-in-out',
  '.MuiPaper-root:hover &': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'scale(1.1)',
  },
}))

const CategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
  paddingBottom: theme.spacing(0.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

// Quick Action Interface
interface QuickAction {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  color?: string
  category: 'create' | 'communicate' | 'manage' | 'analyze'
  onClick: () => void
  badge?: number
  disabled?: boolean
  shortcut?: string
}

// Quick Actions data
const useQuickActions = () => {
  const navigate = useNavigate()
  const { addNotification } = useUIStore()

  const showSuccess = (message: string) => {
    addNotification({
      type: 'success',
      title: 'Action completed',
      message,
      read: false,
    })
  }

  const actions: QuickAction[] = [
    // Create category
    {
      id: 'add-contact',
      title: 'Add Contact',
      description: 'Create a new contact',
      icon: <PersonAdd />,
      category: 'create',
      onClick: () => {
        navigate('/contacts')
        showSuccess('Navigated to contacts page')
      },
      shortcut: 'Ctrl+Shift+C',
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Plan a new meeting',
      icon: <EventNote />,
      category: 'create',
      onClick: () => {
        navigate('/meetings')
        showSuccess('Navigated to meetings page')
      },
      shortcut: 'Ctrl+Shift+M',
    },
    {
      id: 'create-task',
      title: 'Create Task',
      description: 'Add a new task',
      icon: <Assignment />,
      category: 'create',
      onClick: () => {
        navigate('/tasks')
        showSuccess('Navigated to tasks page')
      },
      shortcut: 'Ctrl+Shift+T',
    },

    // Communicate category
    {
      id: 'send-email',
      title: 'Send Email',
      description: 'Compose email',
      icon: <Email />,
      category: 'communicate',
      onClick: () => showSuccess('Email composer would open'),
    },
    {
      id: 'make-call',
      title: 'Make Call',
      description: 'Start phone call',
      icon: <Phone />,
      category: 'communicate',
      onClick: () => showSuccess('Phone dialer would open'),
    },
    {
      id: 'video-call',
      title: 'Video Call',
      description: 'Start video meeting',
      icon: <VideoCall />,
      category: 'communicate',
      onClick: () => showSuccess('Video call would start'),
    },

    // Manage category
    {
      id: 'sync-data',
      title: 'Sync Data',
      description: 'Synchronize with external services',
      icon: <Sync />,
      category: 'manage',
      onClick: () => showSuccess('Data sync initiated'),
    },
    {
      id: 'download-reports',
      title: 'Download Reports',
      description: 'Export data reports',
      icon: <Download />,
      category: 'manage',
      onClick: () => showSuccess('Report download started'),
    },
  ]

  return actions
}

// Individual Action Component
interface ActionItemProps {
  action: QuickAction
  size?: 'small' | 'medium' | 'large'
}

const ActionItem: React.FC<ActionItemProps> = ({ action }) => {
  const handleClick = () => {
    action.onClick()
  }

  return (
    <ActionCard onClick={handleClick} elevation={1}>
      <ActionIcon>{action.icon}</ActionIcon>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          lineHeight: 1.2,
          textAlign: 'center',
          color: 'text.primary',
        }}
      >
        {action.title}
      </Typography>
      {action.badge && action.badge > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            minWidth: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: 'error.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            fontWeight: 'bold',
          }}
        >
          {action.badge}
        </Box>
      )}
    </ActionCard>
  )
}

// Main Quick Actions Component
export interface QuickActionsProps {
  title?: string
  layout?: 'grid' | 'categories' | 'compact'
  maxItems?: number
  showCategories?: boolean
  columns?: number
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  title = 'Quick Actions',
  layout = 'categories',
  maxItems = 6,
  showCategories = true,
}) => {
  const actions = useQuickActions()
  const [speedDialOpen, setSpeedDialOpen] = useState(false)

  const filteredActions = maxItems ? actions.slice(0, maxItems) : actions

  const groupedActions = filteredActions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = []
      }
      acc[action.category].push(action)
      return acc
    },
    {} as Record<string, QuickAction[]>
  )

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'create':
        return <Add />
      case 'communicate':
        return <Email />
      case 'analyze':
        return <Analytics />
      default:
        return <Settings />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'create':
        return 'Create'
      case 'communicate':
        return 'Communicate'
      case 'manage':
        return 'Manage'
      case 'analyze':
        return 'Analyze'
      default:
        return category
    }
  }

  if (layout === 'compact') {
    return (
      <Box sx={{ position: 'relative', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        <SpeedDial
          ariaLabel="Quick actions"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
        >
          {filteredActions.map(action => (
            <SpeedDialAction
              key={action.id}
              icon={action.icon}
              tooltipTitle={action.title}
              onClick={() => {
                action.onClick()
                setSpeedDialOpen(false)
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    )
  }

  if (layout === 'categories' && showCategories) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minWidth: 280,
          maxWidth: 320,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: 4,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: 2,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a1a1a1',
            },
          }}
        >
          {Object.entries(groupedActions).map(
            ([category, categoryActions], categoryIndex) => (
              <Box
                key={category}
                sx={{
                  mb:
                    categoryIndex < Object.keys(groupedActions).length - 1
                      ? 2.5
                      : 0,
                }}
              >
                <CategoryHeader>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                      }}
                    >
                      {getCategoryIcon(category)}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.85rem',
                      }}
                    >
                      {getCategoryLabel(category)}
                    </Typography>
                  </Box>
                </CategoryHeader>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1,
                  }}
                >
                  {categoryActions.map(action => (
                    <ActionItem key={action.id} action={action} size="small" />
                  ))}
                </Box>
              </Box>
            )
          )}
        </Box>
      </Box>
    )
  }

  // Grid layout
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 280,
        maxWidth: 320,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a1a1a1',
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            pb: 1,
          }}
        >
          {filteredActions.map(action => (
            <ActionItem key={action.id} action={action} size="small" />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default QuickActions

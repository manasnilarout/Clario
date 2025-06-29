import React from 'react'
import { Box, Typography, Button, Paper, styled } from '@mui/material'
import {
  SearchOff,
  FolderOpen,
  PersonAdd,
  EventNote,
  Add,
  CloudOff,
  ErrorOutline,
  InfoOutlined,
} from '@mui/icons-material'

const StyledContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 4),
  textAlign: 'center',
  backgroundColor: 'transparent',
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  minHeight: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(3),
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.text.disabled,
  marginBottom: theme.spacing(1),
  '& svg': {
    fontSize: 'inherit',
  },
}))

export interface EmptyStateProps {
  type?: 'search' | 'data' | 'error' | 'offline' | 'info' | 'custom'
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  illustration?: React.ReactNode
}

const getDefaultIcon = (type: string) => {
  switch (type) {
    case 'search':
      return <SearchOff />
    case 'data':
      return <FolderOpen />
    case 'error':
      return <ErrorOutline />
    case 'offline':
      return <CloudOff />
    case 'info':
      return <InfoOutlined />
    default:
      return <FolderOpen />
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'data',
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
}) => {
  const displayIcon = icon || getDefaultIcon(type)

  return (
    <StyledContainer elevation={0}>
      {illustration ? (
        <Box sx={{ mb: 2 }}>{illustration}</Box>
      ) : (
        <IconWrapper>{displayIcon}</IconWrapper>
      )}

      <Box>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 400, mx: 'auto' }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {(action || secondaryAction) && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {action && (
            <Button
              variant={
                action.variant === 'secondary' ? 'outlined' : 'contained'
              }
              onClick={action.onClick}
              startIcon={type === 'data' ? <Add /> : undefined}
              size="large"
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outlined"
              onClick={secondaryAction.onClick}
              size="large"
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </StyledContainer>
  )
}

// Predefined Empty State Components
export const NoSearchResults: React.FC<{
  searchTerm?: string
  onClearSearch?: () => void
}> = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    type="search"
    title="No results found"
    description={
      searchTerm
        ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search terms.`
        : "We couldn't find any results. Try adjusting your search terms."
    }
    action={
      onClearSearch
        ? {
            label: 'Clear search',
            onClick: onClearSearch,
            variant: 'secondary',
          }
        : undefined
    }
  />
)

export const NoContacts: React.FC<{
  onAddContact?: () => void
  onImportContacts?: () => void
}> = ({ onAddContact, onImportContacts }) => (
  <EmptyState
    type="data"
    icon={<PersonAdd />}
    title="No contacts yet"
    description="Start building your network by adding your first contact or importing from your existing contacts."
    action={
      onAddContact
        ? {
            label: 'Add contact',
            onClick: onAddContact,
          }
        : undefined
    }
    secondaryAction={
      onImportContacts
        ? {
            label: 'Import contacts',
            onClick: onImportContacts,
          }
        : undefined
    }
  />
)

export const NoMeetings: React.FC<{
  onScheduleMeeting?: () => void
}> = ({ onScheduleMeeting }) => (
  <EmptyState
    type="data"
    icon={<EventNote />}
    title="No meetings scheduled"
    description="Your calendar is clear. Schedule your first meeting to get started with planning and productivity tracking."
    action={
      onScheduleMeeting
        ? {
            label: 'Schedule meeting',
            onClick: onScheduleMeeting,
          }
        : undefined
    }
  />
)

export const ErrorState: React.FC<{
  title?: string
  description?: string
  onRetry?: () => void
}> = ({
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content. Please try again.',
  onRetry,
}) => (
  <EmptyState
    type="error"
    title={title}
    description={description}
    action={
      onRetry
        ? {
            label: 'Try again',
            onClick: onRetry,
            variant: 'secondary',
          }
        : undefined
    }
  />
)

export const OfflineState: React.FC<{
  onRetry?: () => void
}> = ({ onRetry }) => (
  <EmptyState
    type="offline"
    title="You're offline"
    description="Check your internet connection and try again. Some features may not be available while offline."
    action={
      onRetry
        ? {
            label: 'Retry',
            onClick: onRetry,
            variant: 'secondary',
          }
        : undefined
    }
  />
)

export const ComingSoon: React.FC<{
  feature?: string
  description?: string
}> = ({
  feature = 'This feature',
  description = "We're working hard to bring you this feature. Stay tuned for updates!",
}) => (
  <EmptyState
    type="info"
    title={`${feature} coming soon`}
    description={description}
  />
)

export default {
  EmptyState,
  NoSearchResults,
  NoContacts,
  NoMeetings,
  ErrorState,
  OfflineState,
  ComingSoon,
}

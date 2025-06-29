import React from 'react'
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  styled,
} from '@mui/material'
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Person,
  Event,
  LocationOn,
  Phone,
  Email,
  Business,
} from '@mui/icons-material'
import { MetricCard as MetricCardType, Contact, Meeting } from '../../types'

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}))

// Base Card Component
export interface BaseCardProps extends MuiCardProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  headerAction?: React.ReactNode
  loading?: boolean
  children: React.ReactNode
}

export const BaseCard: React.FC<BaseCardProps> = ({
  title,
  subtitle,
  actions,
  headerAction,
  loading = false,
  children,
  ...props
}) => {
  return (
    <StyledCard {...props}>
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            borderRadius: '8px 8px 0 0',
          }}
        />
      )}

      {(title || subtitle || headerAction) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={
            headerAction || (
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            )
          }
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
          subheaderTypographyProps={{
            variant: 'body2',
            color: 'text.secondary',
          }}
        />
      )}

      <CardContent sx={{ pt: title ? 0 : 2 }}>{children}</CardContent>

      {actions && (
        <>
          <Divider />
          <CardActions>{actions}</CardActions>
        </>
      )}
    </StyledCard>
  )
}

// Metric Card Component
export interface MetricCardProps {
  data: MetricCardType
  onClick?: () => void
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, onClick }) => {
  const { title, value, change, trend, format = 'number' } = data

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val)
      case 'percentage':
        return `${val}%`
      default:
        return new Intl.NumberFormat('en-US').format(val)
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" />
      case 'down':
        return <TrendingDown color="error" />
      default:
        return <TrendingFlat color="info" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main'
      case 'down':
        return 'error.main'
      default:
        return 'text.secondary'
    }
  }

  return (
    <StyledCard
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={500}
          >
            {title}
          </Typography>
          {trend && getTrendIcon()}
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          {formatValue(value)}
        </Typography>

        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ color: getTrendColor(), fontWeight: 600 }}
            >
              {change > 0 ? '+' : ''}
              {change}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  )
}

// Contact Card Component
export interface ContactCardProps {
  contact: Contact
  onClick?: () => void
  compact?: boolean
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onClick,
  compact = false,
}) => {
  const fullName = `${contact.firstName} ${contact.lastName}`

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (compact) {
    return (
      <StyledCard
        sx={{ cursor: onClick ? 'pointer' : 'default' }}
        onClick={onClick}
      >
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {contact.avatar ? (
                <img src={contact.avatar} alt={fullName} />
              ) : (
                <Person />
              )}
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {contact.company && contact.position
                  ? `${contact.position} at ${contact.company}`
                  : contact.company || contact.position || contact.email}
              </Typography>
            </Box>

            <Chip
              size="small"
              label={contact.importance}
              color={getImportanceColor(contact.importance) as any}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </StyledCard>
    )
  }

  return (
    <StyledCard
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            {contact.avatar ? (
              <img src={contact.avatar} alt={fullName} />
            ) : (
              <Person />
            )}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {fullName}
            </Typography>
            {contact.company && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <Business fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {contact.position
                    ? `${contact.position} at ${contact.company}`
                    : contact.company}
                </Typography>
              </Box>
            )}
          </Box>

          <Chip
            label={contact.importance}
            color={getImportanceColor(contact.importance) as any}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2">{contact.email}</Typography>
          </Box>

          {contact.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2">{contact.phone}</Typography>
            </Box>
          )}
        </Box>

        {contact.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {contact.tags.slice(0, 3).map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
            {contact.tags.length > 3 && (
              <Chip
                label={`+${contact.tags.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </CardContent>
    </StyledCard>
  )
}

// Meeting Card Component
export interface MeetingCardProps {
  meeting: Meeting
  onClick?: () => void
  compact?: boolean
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onClick,
  compact = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in-progress':
        return 'info'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date))
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  return (
    <StyledCard
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <CardContent sx={{ py: compact ? 2 : 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {meeting.title}
            </Typography>
            {meeting.description && !compact && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {meeting.description}
              </Typography>
            )}
          </Box>

          <Chip
            size="small"
            label={meeting.status}
            color={getStatusColor(meeting.status) as any}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Event fontSize="small" color="action" />
            <Typography variant="body2">
              {formatDate(meeting.startTime)} • {formatTime(meeting.startTime)}{' '}
              - {formatTime(meeting.endTime)}
            </Typography>
          </Box>

          {meeting.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2">{meeting.location}</Typography>
            </Box>
          )}

          {meeting.attendees.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2">
                {meeting.attendees.length} attendee
                {meeting.attendees.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default {
  BaseCard,
  MetricCard,
  ContactCard,
  MeetingCard,
}

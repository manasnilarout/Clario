import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  styled,
  alpha,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  FilterList,
  Timeline,
  BarChart,
} from '@mui/icons-material'
import { MetricCard as MetricCardType } from '../../../types'
import { useInsightsStore } from '../../../store'

// Styled Components
const MetricContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
    borderColor: theme.palette.primary.main,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
  },
  '&:hover::before': {
    opacity: 1,
  },
}))

const MetricValue = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2.5rem',
  lineHeight: 1.2,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(1),
}))

const TrendIndicator = styled(Box)<{ trend: 'up' | 'down' | 'stable' }>(
  ({ theme, trend }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    fontSize: '0.875rem',
    fontWeight: 600,
    ...(trend === 'up' && {
      color: theme.palette.success.main,
      backgroundColor: alpha(theme.palette.success.main, 0.1),
    }),
    ...(trend === 'down' && {
      color: theme.palette.error.main,
      backgroundColor: alpha(theme.palette.error.main, 0.1),
    }),
    ...(trend === 'stable' && {
      color: theme.palette.info.main,
      backgroundColor: alpha(theme.palette.info.main, 0.1),
    }),
  })
)

// Individual Metric Card Component
interface MetricCardProps {
  metric: MetricCardType
  onClick?: () => void
  showTrend?: boolean
  showComparison?: boolean
  animated?: boolean
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  onClick,
  showTrend = true,
  showComparison = true,
  animated = true,
}) => {
  const [displayValue, setDisplayValue] = useState<string | number>(0)

  useEffect(() => {
    if (animated && typeof metric.value === 'number') {
      let startValue = 0
      const endValue = metric.value
      const duration = 1500
      const increment = endValue / (duration / 16)

      const timer = setInterval(() => {
        startValue += increment
        if (startValue >= endValue) {
          setDisplayValue(endValue)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(startValue))
        }
      }, 16)

      return () => clearInterval(timer)
    } else {
      setDisplayValue(metric.value)
    }
  }, [metric.value, animated])

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val

    switch (metric.format) {
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
    switch (metric.trend) {
      case 'up':
        return <TrendingUp fontSize="small" />
      case 'down':
        return <TrendingDown fontSize="small" />
      default:
        return <TrendingFlat fontSize="small" />
    }
  }

  return (
    <MetricContainer onClick={onClick}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {metric.title}
        </Typography>
        <Tooltip title="View details">
          <IconButton size="small" sx={{ opacity: 0.7 }}>
            <Timeline fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <MetricValue>{formatValue(displayValue)}</MetricValue>

      {showTrend && metric.change !== undefined && (
        <TrendIndicator trend={metric.trend || 'stable'}>
          {getTrendIcon()}
          {metric.change > 0 ? '+' : ''}
          {metric.change}%
          {showComparison && (
            <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>
              vs last period
            </Typography>
          )}
        </TrendIndicator>
      )}
    </MetricContainer>
  )
}

// Metrics Widget Component
export interface MetricsWidgetProps {
  title?: string
  metrics?: MetricCardType[]
  layout?: 'grid' | 'list'
  columns?: number
  showFilters?: boolean
  refreshInterval?: number
  onMetricClick?: (metric: MetricCardType) => void
}

export const MetricsWidget: React.FC<MetricsWidgetProps> = ({
  title = 'Key Metrics',
  metrics: propMetrics,
  layout = 'grid',
  columns = 2,
  showFilters = true,
  // refreshInterval = 30,
  onMetricClick,
}) => {
  const { metrics: storeMetrics } = useInsightsStore()
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'positive' | 'negative'
  >('all')

  // Use provided metrics or fallback to store metrics
  const rawMetrics = propMetrics || storeMetrics

  // Apply filters
  const filteredMetrics = rawMetrics.filter(metric => {
    switch (selectedFilter) {
      case 'positive':
        return (metric.change || 0) >= 0
      case 'negative':
        return (metric.change || 0) < 0
      default:
        return true
    }
  })

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchor(null)
  }

  const handleFilterSelect = (filter: 'all' | 'positive' | 'negative') => {
    setSelectedFilter(filter)
    handleFilterClose()
  }

  const handleMetricClick = (metric: MetricCardType) => {
    onMetricClick?.(metric)
  }

  if (layout === 'list') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
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
          {showFilters && (
            <Tooltip title="Filter metrics">
              <IconButton size="small" onClick={handleFilterClick}>
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Metrics List */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredMetrics.map((metric, index) => (
            <MetricCard
              key={`${metric.title}-${index}`}
              metric={metric}
              onClick={() => handleMetricClick(metric)}
              showTrend={true}
              showComparison={true}
              animated={true}
            />
          ))}
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleFilterSelect('all')}>
            All Metrics
          </MenuItem>
          <MenuItem onClick={() => handleFilterSelect('positive')}>
            Positive Trends
          </MenuItem>
          <MenuItem onClick={() => handleFilterSelect('negative')}>
            Negative Trends
          </MenuItem>
        </Menu>
      </Box>
    )
  }

  // Grid layout
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
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
        {showFilters && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Chart view">
              <IconButton size="small">
                <BarChart fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter metrics">
              <IconButton size="small" onClick={handleFilterClick}>
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Metrics Grid */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a1a1a1',
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr',
              md: `repeat(${Math.min(columns, 2)}, 1fr)`,
              lg: `repeat(${columns}, 1fr)`,
            },
            gap: 2,
            pb: 1,
          }}
        >
          {filteredMetrics.map((metric, index) => (
            <MetricCard
              key={`${metric.title}-${index}`}
              metric={metric}
              onClick={() => handleMetricClick(metric)}
              showTrend={true}
              showComparison={true}
              animated={true}
            />
          ))}
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleFilterSelect('all')}>
          <Timeline sx={{ mr: 1 }} />
          All Metrics
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('positive')}>
          <TrendingUp sx={{ mr: 1 }} />
          Positive Trends
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('negative')}>
          <TrendingDown sx={{ mr: 1 }} />
          Negative Trends
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default MetricsWidget

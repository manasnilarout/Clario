import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Fade,
  styled,
} from '@mui/material'
import {
  MoreVert,
  DragIndicator,
  Settings,
  Refresh,
  Fullscreen,
  Close,
} from '@mui/icons-material'

// Widget configuration interface
export interface DashboardWidget {
  id: string
  type:
    | 'metric'
    | 'chart'
    | 'activity'
    | 'upcoming'
    | 'quick-actions'
    | 'custom'
  title: string
  size: {
    xs: number // 1-12
    sm: number
    md: number
    lg: number
  }
  position: {
    x: number
    y: number
  }
  config?: Record<string, any>
  refreshInterval?: number
  allowResize?: boolean
  allowMove?: boolean
  allowRemove?: boolean
}

// Styled Components
const WidgetContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  minHeight: 200,
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    '& .widget-controls': {
      opacity: 1,
    },
  },
}))

const WidgetHeader = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 1,
}))

const WidgetControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
}))

const WidgetContent = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(7), // Space for header
  padding: theme.spacing(7, 2, 2, 2),
  height: '100%',
  overflow: 'auto',
}))

const DragHandle = styled(Box)(({ theme }) => ({
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.disabled,
  '&:active': {
    cursor: 'grabbing',
  },
}))

// Widget wrapper component
interface WidgetWrapperProps {
  widget: DashboardWidget
  children: React.ReactNode
  onRefresh?: () => void
  onConfigure?: () => void
  onRemove?: () => void
  // onResize?: (newSize: DashboardWidget['size']) => void
  isLoading?: boolean
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  widget,
  children,
  onRefresh,
  onConfigure,
  onRemove,
  // onResize,
  isLoading = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleRefresh = () => {
    onRefresh?.()
    handleMenuClose()
  }

  const handleConfigure = () => {
    onConfigure?.()
    handleMenuClose()
  }

  const handleRemove = () => {
    onRemove?.()
    handleMenuClose()
  }

  return (
    <WidgetContainer elevation={2}>
      <WidgetHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {widget.allowMove && (
            <DragHandle>
              <DragIndicator fontSize="small" />
            </DragHandle>
          )}
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {widget.title}
          </Typography>
        </Box>

        <WidgetControls className="widget-controls">
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="More options">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {onRefresh && (
              <MenuItem onClick={handleRefresh} disabled={isLoading}>
                <Refresh fontSize="small" sx={{ mr: 1 }} />
                Refresh
              </MenuItem>
            )}

            {onConfigure && (
              <MenuItem onClick={handleConfigure}>
                <Settings fontSize="small" sx={{ mr: 1 }} />
                Configure
              </MenuItem>
            )}

            <MenuItem onClick={() => {}}>
              <Fullscreen fontSize="small" sx={{ mr: 1 }} />
              Expand
            </MenuItem>

            {widget.allowRemove && onRemove && (
              <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
                <Close fontSize="small" sx={{ mr: 1 }} />
                Remove
              </MenuItem>
            )}
          </Menu>
        </WidgetControls>
      </WidgetHeader>

      <WidgetContent>
        <Fade in={!isLoading} timeout={300}>
          <Box sx={{ height: '100%' }}>{children}</Box>
        </Fade>
      </WidgetContent>
    </WidgetContainer>
  )
}

// Main Dashboard Grid component
export interface DashboardGridProps {
  widgets: DashboardWidget[]
  onWidgetUpdate?: (widgetId: string, updates: Partial<DashboardWidget>) => void
  onWidgetRemove?: (widgetId: string) => void
  onWidgetAdd?: (widget: DashboardWidget) => void
  spacing?: number
  maxColumns?: number
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  onWidgetRemove,
  spacing = 3,
  // maxColumns = 12,
}) => {
  const [refreshingWidgets, setRefreshingWidgets] = useState<Set<string>>(
    new Set()
  )

  // Auto-refresh widgets with refresh intervals
  useEffect(() => {
    const intervals: number[] = []

    widgets.forEach(widget => {
      if (widget.refreshInterval) {
        const interval = window.setInterval(() => {
          handleWidgetRefresh(widget.id)
        }, widget.refreshInterval * 1000)
        intervals.push(interval)
      }
    })

    return () => {
      intervals.forEach(interval => window.clearInterval(interval))
    }
  }, [widgets])

  const handleWidgetRefresh = async (widgetId: string) => {
    setRefreshingWidgets(prev => new Set(prev).add(widgetId))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setRefreshingWidgets(prev => {
      const newSet = new Set(prev)
      newSet.delete(widgetId)
      return newSet
    })
  }

  const handleWidgetConfigure = (widgetId: string) => {
    // Open configuration modal/drawer
    console.log('Configure widget:', widgetId)
  }

  const handleWidgetRemove = (widgetId: string) => {
    onWidgetRemove?.(widgetId)
  }

  const renderWidgetContent = (widget: DashboardWidget) => {
    // Widget content will be passed as children to WidgetWrapper
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary',
        }}
      >
        <Typography>
          {widget.type} widget - content will be provided by parent
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing }}>
        {widgets.map(widget => (
          <Box
            key={widget.id}
            sx={{
              flex: `1 1 ${(widget.size.md / 12) * 100}%`,
              minWidth: `${(widget.size.xs / 12) * 100}%`,
              maxWidth: `${(widget.size.lg / 12) * 100}%`,
            }}
          >
            <WidgetWrapper
              widget={widget}
              onRefresh={() => handleWidgetRefresh(widget.id)}
              onConfigure={() => handleWidgetConfigure(widget.id)}
              onRemove={() => handleWidgetRemove(widget.id)}
              isLoading={refreshingWidgets.has(widget.id)}
            >
              {renderWidgetContent(widget)}
            </WidgetWrapper>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default DashboardGrid

import React, { useEffect, useState } from 'react'
import {
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Fab,
  Slide,
} from '@mui/material'
import {
  Settings,
  Refresh,
  Fullscreen,
  Add,
  ViewModule,
  ViewList,
  FilterList,
} from '@mui/icons-material'
import { useInsightsStore } from '../store'
import {
  DashboardWidget,
  MetricsWidget,
  QuickActions,
  ActivityFeed,
  UpcomingEvents,
} from '../components/features/dashboard'
import { LoadingOverlay } from '../components/common'

const Dashboard: React.FC = () => {
  const { metrics, isLoading, fetchInsights } = useInsightsStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [refreshing, setRefreshing] = useState(false)

  // Default dashboard layout - Fixed proportions for better alignment
  const [widgets] = useState<DashboardWidget[]>([
    {
      id: 'metrics',
      type: 'metric',
      title: 'Key Metrics',
      size: { xs: 12, sm: 12, md: 7, lg: 7 },
      position: { x: 0, y: 0 },
      refreshInterval: 300, // 5 minutes
      allowResize: true,
      allowMove: true,
      allowRemove: false,
    },
    {
      id: 'quick-actions',
      type: 'quick-actions',
      title: 'Quick Actions',
      size: { xs: 12, sm: 12, md: 5, lg: 5 },
      position: { x: 7, y: 0 },
      allowResize: true,
      allowMove: true,
      allowRemove: false,
    },
    {
      id: 'upcoming-events',
      type: 'upcoming',
      title: 'Upcoming Events',
      size: { xs: 12, sm: 12, md: 6, lg: 6 },
      position: { x: 0, y: 1 },
      refreshInterval: 60, // 1 minute
      allowResize: true,
      allowMove: true,
      allowRemove: false,
    },
    {
      id: 'activity-feed',
      type: 'activity',
      title: 'Recent Activity',
      size: { xs: 12, sm: 12, md: 6, lg: 6 },
      position: { x: 6, y: 1 },
      refreshInterval: 30, // 30 seconds
      allowResize: true,
      allowMove: true,
      allowRemove: false,
    },
  ])

  useEffect(() => {
    // Load initial data
    fetchInsights()
  }, [fetchInsights])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchInsights()
    setRefreshing(false)
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    handleMenuClose()
  }

  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      key: widget.id,
    }

    switch (widget.type) {
      case 'metric':
        return (
          <MetricsWidget
            {...commonProps}
            title={widget.title}
            metrics={metrics}
            layout="grid"
            columns={2}
            showFilters={true}
          />
        )

      case 'quick-actions':
        return (
          <QuickActions
            {...commonProps}
            title={widget.title}
            layout="categories"
            maxItems={6}
            showCategories={true}
            columns={2}
          />
        )

      case 'upcoming':
        return (
          <UpcomingEvents
            {...commonProps}
            title={widget.title}
            maxItems={6}
            showAddButton={true}
            compact={false}
          />
        )

      case 'activity':
        return (
          <ActivityFeed
            {...commonProps}
            title={widget.title}
            maxItems={8}
            showFilters={true}
            refreshInterval={30}
          />
        )

      default:
        return (
          <Box {...commonProps}>
            <Typography>Unknown widget type: {widget.type}</Typography>
          </Box>
        )
    }
  }

  if (isLoading && metrics.length === 0) {
    return <LoadingOverlay open={true} message="Loading dashboard..." />
  }

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          marginLeft: 16,
          marginRight: 16,
          marginTop: 8,
        }}
      >
        <div>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to your productivity overview
          </Typography>
        </div>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh dashboard">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title="Dashboard options">
            <IconButton onClick={handleMenuOpen}>
              <Settings />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleViewModeChange('grid')}>
              <ViewModule sx={{ mr: 1 }} />
              Grid View
            </MenuItem>
            <MenuItem onClick={() => handleViewModeChange('list')}>
              <ViewList sx={{ mr: 1 }} />
              List View
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <FilterList sx={{ mr: 1 }} />
              Filter Widgets
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Fullscreen sx={{ mr: 1 }} />
              Fullscreen
            </MenuItem>
          </Menu>
        </Box>
      </header>

      {/* Dashboard Content */}
      <div
        style={{
          flex: 1,
          marginLeft: 16,
          marginRight: 16,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {viewMode === 'grid' ? (
          <>
            {/* Top Row */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginBottom: 16,
                alignItems: 'stretch',
                minHeight: 0,
              }}
            >
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {renderWidget(widgets[0])}
              </Paper>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  width: 320,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {renderWidget(widgets[1])}
              </Paper>
            </div>

            {/* Bottom Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                flex: 1,
                minHeight: 0,
              }}
            >
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                {renderWidget(widgets[2])}
              </Paper>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                {renderWidget(widgets[3])}
              </Paper>
            </div>
          </>
        ) : (
          // List view - stack widgets vertically
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {widgets.map(widget => (
              <Paper key={widget.id} sx={{ p: 2.5, borderRadius: 2 }}>
                {renderWidget(widget)}
              </Paper>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for Quick Add */}
      <Slide direction="up" in={!isLoading} mountOnEnter unmountOnExit>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          onClick={() => {
            // This could open a quick add menu
            console.log('Quick add clicked')
          }}
        >
          <Add />
        </Fab>
      </Slide>

      {/* Refresh Loading Overlay */}
      <LoadingOverlay
        open={refreshing}
        message="Refreshing dashboard..."
        backdrop={false}
      />
    </main>
  )
}

export default Dashboard

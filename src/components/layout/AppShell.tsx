import React, { useState } from 'react'
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
  Collapse,
  Chip,
  Tooltip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Flight,
  Contacts,
  Event,
  Task,
  Analytics,
  Flag,
  Settings,
  Brightness4,
  Brightness7,
  ChevronLeft,
  ChevronRight,
  Person,
  Notifications,
  Search,
  Add,
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store'
import { useTheme as useCustomTheme } from './ThemeProvider'
import { navigationItems } from '../../config/routes'

const drawerWidth = 280
const collapsedDrawerWidth = 64

const iconMap: Record<string, React.ComponentType> = {
  Dashboard,
  Flight,
  Contacts,
  Event,
  Task,
  Analytics,
  Flag,
  Settings,
}

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const navigate = useNavigate()

  const { sidebarOpen, setSidebarOpen, notifications } = useUIStore()
  const { mode, toggleTheme } = useCustomTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const currentDrawerWidth = sidebarCollapsed
    ? collapsedDrawerWidth
    : drawerWidth
  const unreadNotifications = notifications.filter(n => !n.read).length

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleKeyboardNavigation = (
    event: React.KeyboardEvent,
    path: string
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleNavigation(path)
    }
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Logo and Collapse Button */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Collapse in={!sidebarCollapsed} orientation="horizontal">
          <Typography
            variant="h5"
            component="div"
            sx={{ fontWeight: 600, color: 'primary.main' }}
          >
            Clario
          </Typography>
        </Collapse>
        {!isMobile && (
          <IconButton
            onClick={handleSidebarCollapse}
            size="small"
            sx={{
              border: 1,
              borderColor: 'divider',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      {/* User Profile Section */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'translateY(-1px)',
              boxShadow: 2,
            },
          }}
          onClick={() => navigate('/settings')}
          role="button"
          tabIndex={0}
          onKeyDown={e => handleKeyboardNavigation(e, '/settings')}
        >
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <Person />
          </Avatar>
          <Collapse in={!sidebarCollapsed} orientation="horizontal">
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                John Doe
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Product Manager
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {navigationItems.map(item => {
          const IconComponent = iconMap[item.icon || 'Dashboard']
          const isActive = location.pathname === item.path

          return (
            <Tooltip
              key={item.path}
              title={sidebarCollapsed ? item.title : ''}
              placement="right"
              arrow
            >
              <ListItem disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => handleNavigation(item.path)}
                  onKeyDown={e => handleKeyboardNavigation(e, item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    minHeight: 48,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      transform: 'translateX(8px)',
                      boxShadow: theme.shadows[3],
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        transform: 'translateX(8px)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: sidebarCollapsed ? 'auto' : 40 }}
                  >
                    <IconComponent />
                  </ListItemIcon>
                  <Collapse in={!sidebarCollapsed} orientation="horizontal">
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  </Collapse>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          )
        })}
      </List>

      <Divider />

      {/* Sidebar Footer */}
      <Box sx={{ p: 2 }}>
        <Collapse in={!sidebarCollapsed} orientation="horizontal">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Clario v1.0.0
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              © 2024 Productivity Suite
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Enhanced Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            md: sidebarOpen ? `calc(100% - ${currentDrawerWidth}px)` : '100%',
          },
          ml: {
            md: sidebarOpen ? `${currentDrawerWidth}px` : 0,
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { md: sidebarOpen ? 'none' : 'flex' },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            {navigationItems.find(item => item.path === location.pathname)
              ?.title || 'Dashboard'}
          </Typography>

          {/* Quick Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Quick Add">
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>

            <Tooltip title="Search">
              <IconButton color="inherit">
                <Search />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton color="inherit" sx={{ position: 'relative' }}>
                <Notifications />
                {unreadNotifications > 0 && (
                  <Chip
                    size="small"
                    label={unreadNotifications}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      minWidth: 20,
                      height: 20,
                      fontSize: '0.75rem',
                      bgcolor: 'error.main',
                      color: 'white',
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip
              title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            >
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Enhanced Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: sidebarOpen ? currentDrawerWidth : 0 },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
              border: 'none',
              backgroundColor: 'background.default',
              backgroundImage: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <main
        style={{
          flexGrow: 1,
          width: sidebarOpen ? `calc(100% - ${currentDrawerWidth}px)` : '100%',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        {children}
      </main>
    </Box>
  )
}

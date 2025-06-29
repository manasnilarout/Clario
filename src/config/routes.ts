import { RouteConfig } from '../types'

const routes: RouteConfig[] = [
  {
    path: '/',
    title: 'Dashboard',
    icon: 'Dashboard',
    requiresAuth: true,
  },
  {
    path: '/travel',
    title: 'Travel',
    icon: 'Flight',
    requiresAuth: true,
  },
  {
    path: '/contacts',
    title: 'Contacts',
    icon: 'Contacts',
    requiresAuth: true,
  },
  {
    path: '/meetings',
    title: 'Meetings',
    icon: 'Event',
    requiresAuth: true,
  },
  {
    path: '/tasks',
    title: 'Tasks',
    icon: 'Task',
    requiresAuth: true,
  },
  {
    path: '/insights',
    title: 'Insights',
    icon: 'Analytics',
    requiresAuth: true,
  },
  {
    path: '/ogsm',
    title: 'OGSM',
    icon: 'Flag',
    requiresAuth: true,
  },
  {
    path: '/settings',
    title: 'Settings',
    icon: 'Settings',
    requiresAuth: true,
  },
]

export default routes

// Navigation items for sidebar
export const navigationItems = routes.map(route => ({
  path: route.path,
  title: route.title,
  icon: route.icon,
}))

// Public routes (no authentication required)
export const publicRoutes = ['/login', '/register', '/forgot-password']

// Helper functions
export const getRouteTitle = (pathname: string): string => {
  const route = routes.find(r => r.path === pathname)
  return route?.title || 'Clario'
}

export const getRouteIcon = (pathname: string): string | undefined => {
  const route = routes.find(r => r.path === pathname)
  return route?.icon
}

export const isProtectedRoute = (pathname: string): boolean => {
  const route = routes.find(r => r.path === pathname)
  return route?.requiresAuth ?? false
}

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
    children: [
      {
        path: '/tasks',
        title: 'All Tasks',
        icon: 'Assignment',
        requiresAuth: true,
      },
      {
        path: '/tasks/kanban',
        title: 'Kanban Board',
        icon: 'ViewKanban',
        requiresAuth: true,
      },
      {
        path: '/tasks/calendar',
        title: 'Calendar',
        icon: 'CalendarMonth',
        requiresAuth: true,
      },
      {
        path: '/tasks/timeline',
        title: 'Timeline',
        icon: 'Timeline',
        requiresAuth: true,
      },
      {
        path: '/tasks/analytics',
        title: 'Analytics',
        icon: 'Analytics',
        requiresAuth: true,
      },
    ],
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

// Get all routes including sub-routes (flattened)
export const getAllRoutes = (): RouteConfig[] => {
  const allRoutes: RouteConfig[] = []

  routes.forEach(route => {
    allRoutes.push(route)
    if (route.children) {
      allRoutes.push(...route.children)
    }
  })

  return allRoutes
}

// Helper functions
export const getRouteTitle = (pathname: string): string => {
  const allRoutes = getAllRoutes()
  const route = allRoutes.find(r => r.path === pathname)
  return route?.title || 'Clario'
}

export const getRouteIcon = (pathname: string): string | undefined => {
  const allRoutes = getAllRoutes()
  const route = allRoutes.find(r => r.path === pathname)
  return route?.icon
}

export const isProtectedRoute = (pathname: string): boolean => {
  const allRoutes = getAllRoutes()
  const route = allRoutes.find(r => r.path === pathname)
  return route?.requiresAuth ?? false
}

// Get task-specific routes
export const getTaskRoutes = (): RouteConfig[] => {
  const taskRoute = routes.find(r => r.path === '/tasks')
  return taskRoute?.children || []
}

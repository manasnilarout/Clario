import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UIState, Notification } from '../types'

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt'>
  ) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // State
      sidebarOpen: true,
      loading: false,
      selectedTheme: 'light',
      notifications: [],

      // Actions
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      },

      toggleTheme: () => {
        set(state => ({
          selectedTheme: state.selectedTheme === 'light' ? 'dark' : 'light',
        }))
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ selectedTheme: theme })
      },

      addNotification: notificationData => {
        const notification: Notification = {
          id: crypto.randomUUID(),
          ...notificationData,
          read: false,
          createdAt: new Date(),
        }

        set(state => ({
          notifications: [notification, ...state.notifications],
        }))

        // Auto-remove notification after 5 seconds for non-error types
        if (notificationData.type !== 'error') {
          setTimeout(() => {
            get().removeNotification(notification.id)
          }, 5000)
        }
      },

      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }))
      },

      markNotificationAsRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: 'ui-storage',
      partialize: state => ({
        sidebarOpen: state.sidebarOpen,
        selectedTheme: state.selectedTheme,
      }),
    }
  )
)

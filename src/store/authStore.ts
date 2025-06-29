import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock login - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000))

          const mockUser: User = {
            id: '1',
            name: 'John Doe',
            email,
            role: 'user',
            preferences: {
              theme: 'light',
              language: 'en',
              timezone: 'UTC',
              notifications: {
                email: true,
                push: true,
                meetings: true,
                tasks: true,
                travel: true,
              },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          })
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      },

      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updates,
              updatedAt: new Date(),
            },
          })
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

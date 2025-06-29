import { create } from 'zustand'
import { OGSMGoal } from '../types'

interface OGSMState {
  goals: OGSMGoal[]
  selectedGoal: OGSMGoal | null
  objectives: OGSMGoal[]
  strategies: OGSMGoal[]
  measures: OGSMGoal[]
  currentQuarter: number
  currentYear: number
  isLoading: boolean
  error: string | null
}

interface OGSMActions {
  // CRUD operations
  createGoal: (
    goalData: Omit<OGSMGoal, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  updateGoal: (id: string, updates: Partial<OGSMGoal>) => void
  deleteGoal: (id: string) => void

  // Goal management
  selectGoal: (goal: OGSMGoal | null) => void
  updateProgress: (id: string, currentValue: number) => void
  setGoalStatus: (id: string, status: OGSMGoal['status']) => void

  // Hierarchy management
  addChildGoal: (
    parentId: string,
    childGoal: Omit<OGSMGoal, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>
  ) => void
  getChildGoals: (parentId: string) => OGSMGoal[]
  getParentGoal: (childId: string) => OGSMGoal | null

  // Period management
  setQuarter: (quarter: number, year?: number) => void
  getGoalsForPeriod: (quarter: number, year: number) => OGSMGoal[]

  // Analytics
  calculateCompletionRate: (type?: OGSMGoal['type']) => number
  getGoalsByStatus: (status: OGSMGoal['status']) => OGSMGoal[]
  getOverdueGoals: () => OGSMGoal[]

  // Data organization
  organizeByType: () => void

  // Data fetching
  fetchGoals: () => Promise<void>

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type OGSMStore = OGSMState & OGSMActions

export const useOGSMStore = create<OGSMStore>((set, get) => ({
  // State
  goals: [],
  selectedGoal: null,
  objectives: [],
  strategies: [],
  measures: [],
  currentQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
  currentYear: new Date().getFullYear(),
  isLoading: false,
  error: null,

  // Actions
  createGoal: goalData => {
    const newGoal: OGSMGoal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => ({
      goals: [...state.goals, newGoal],
    }))

    // Re-organize goals by type
    get().organizeByType()
  },

  updateGoal: (id: string, updates: Partial<OGSMGoal>) => {
    set(state => ({
      goals: state.goals.map(goal =>
        goal.id === id ? { ...goal, ...updates, updatedAt: new Date() } : goal
      ),
      selectedGoal:
        state.selectedGoal?.id === id
          ? { ...state.selectedGoal, ...updates, updatedAt: new Date() }
          : state.selectedGoal,
    }))

    // Re-organize goals by type if type changed
    if (updates.type) {
      get().organizeByType()
    }
  },

  deleteGoal: (id: string) => {
    set(state => ({
      goals: state.goals.filter(goal => goal.id !== id),
      selectedGoal: state.selectedGoal?.id === id ? null : state.selectedGoal,
    }))

    // Re-organize goals by type
    get().organizeByType()
  },

  selectGoal: (goal: OGSMGoal | null) => {
    set({ selectedGoal: goal })
  },

  updateProgress: (id: string, currentValue: number) => {
    const goal = get().goals.find(g => g.id === id)
    if (goal && goal.targetValue) {
      const progress = (currentValue / goal.targetValue) * 100
      let status: OGSMGoal['status'] = 'in-progress'

      if (progress >= 100) {
        status = 'completed'
      } else if (progress >= 80) {
        status = 'on-track'
      } else if (goal.dueDate && goal.dueDate < new Date()) {
        status = 'at-risk'
      }

      get().updateGoal(id, { currentValue, status })
    }
  },

  setGoalStatus: (id: string, status: OGSMGoal['status']) => {
    get().updateGoal(id, { status })
  },

  addChildGoal: (parentId: string, childGoalData) => {
    const childGoal: OGSMGoal = {
      ...childGoalData,
      id: crypto.randomUUID(),
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set(state => ({
      goals: [...state.goals, childGoal],
    }))

    get().organizeByType()
  },

  getChildGoals: (parentId: string) => {
    const { goals } = get()
    return goals.filter(goal => goal.parentId === parentId)
  },

  getParentGoal: (childId: string) => {
    const { goals } = get()
    const child = goals.find(goal => goal.id === childId)
    if (child?.parentId) {
      return goals.find(goal => goal.id === child.parentId) || null
    }
    return null
  },

  setQuarter: (quarter: number, year = get().currentYear) => {
    set({ currentQuarter: quarter, currentYear: year })
  },

  getGoalsForPeriod: (quarter: number, year: number) => {
    const { goals } = get()
    const startMonth = (quarter - 1) * 3
    const endMonth = startMonth + 2

    return goals.filter(goal => {
      if (!goal.dueDate) return false
      const dueDate = new Date(goal.dueDate)
      return (
        dueDate.getFullYear() === year &&
        dueDate.getMonth() >= startMonth &&
        dueDate.getMonth() <= endMonth
      )
    })
  },

  calculateCompletionRate: (type?: OGSMGoal['type']) => {
    const { goals } = get()
    const filteredGoals = type
      ? goals.filter(goal => goal.type === type)
      : goals

    if (filteredGoals.length === 0) return 0

    const completedGoals = filteredGoals.filter(
      goal => goal.status === 'completed'
    )
    return Math.round((completedGoals.length / filteredGoals.length) * 100)
  },

  getGoalsByStatus: (status: OGSMGoal['status']) => {
    const { goals } = get()
    return goals.filter(goal => goal.status === status)
  },

  getOverdueGoals: () => {
    const { goals } = get()
    const now = new Date()
    return goals.filter(
      goal => goal.dueDate && goal.dueDate < now && goal.status !== 'completed'
    )
  },

  organizeByType: () => {
    const { goals } = get()

    set({
      objectives: goals.filter(goal => goal.type === 'objective'),
      strategies: goals.filter(goal => goal.type === 'strategy'),
      measures: goals.filter(goal => goal.type === 'measure'),
    })
  },

  fetchGoals: async () => {
    set({ isLoading: true, error: null })
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      // Organize goals by type after fetch
      get().organizeByType()
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch goals',
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

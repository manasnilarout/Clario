import { create } from 'zustand'
import { Insight, MetricCard, ChartData } from '../types'

interface InsightsState {
  insights: Insight[]
  metrics: MetricCard[]
  chartData: Record<string, ChartData>
  selectedPeriod: '7d' | '30d' | '90d' | '1y'
  isLoading: boolean
  error: string | null
}

interface InsightsActions {
  // Data fetching
  fetchInsights: (period?: '7d' | '30d' | '90d' | '1y') => Promise<void>
  refreshMetrics: () => Promise<void>

  // Period management
  setPeriod: (period: '7d' | '30d' | '90d' | '1y') => void

  // Specific insight calculations
  calculateContactEngagement: () => void
  calculateMeetingEfficiency: () => void
  calculateTravelStats: () => void
  calculateProductivityMetrics: () => void

  // Chart data generation
  generateContactsChart: () => ChartData
  generateMeetingsChart: () => ChartData
  generateTasksChart: () => ChartData
  generateTravelChart: () => ChartData

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type InsightsStore = InsightsState & InsightsActions

export const useInsightsStore = create<InsightsStore>((set, get) => ({
  // State
  insights: [],
  metrics: [],
  chartData: {},
  selectedPeriod: '30d',
  isLoading: false,
  error: null,

  // Actions
  fetchInsights: async (period = '30d') => {
    set({ isLoading: true, error: null, selectedPeriod: period })
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      // Generate mock insights
      const mockInsights: Insight[] = [
        {
          id: '1',
          type: 'contact',
          title: 'Contact Engagement',
          description: 'Average engagement score increased by 15%',
          value: 85,
          trend: 'up',
          period: period,
          category: 'engagement',
          createdAt: new Date(),
        },
        {
          id: '2',
          type: 'meeting',
          title: 'Meeting Efficiency',
          description: 'Average meeting duration reduced by 12 minutes',
          value: 45,
          trend: 'down',
          period: period,
          category: 'productivity',
          createdAt: new Date(),
        },
        {
          id: '3',
          type: 'task',
          title: 'Task Completion Rate',
          description: 'Tasks completed on time improved by 8%',
          value: 92,
          trend: 'up',
          period: period,
          category: 'productivity',
          createdAt: new Date(),
        },
      ]

      const mockMetrics: MetricCard[] = [
        {
          title: 'Total Contacts',
          value: 247,
          change: 12,
          trend: 'up',
          format: 'number',
        },
        {
          title: 'Meetings This Month',
          value: 28,
          change: -3,
          trend: 'down',
          format: 'number',
        },
        {
          title: 'Tasks Completed',
          value: '89%',
          change: 5,
          trend: 'up',
          format: 'percentage',
        },
        {
          title: 'Travel Budget Used',
          value: '$4,250',
          change: 15,
          trend: 'up',
          format: 'currency',
        },
      ]

      set({
        insights: mockInsights,
        metrics: mockMetrics,
        isLoading: false,
      })

      // Generate chart data
      get().calculateContactEngagement()
      get().calculateMeetingEfficiency()
      get().calculateProductivityMetrics()
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch insights',
        isLoading: false,
      })
    }
  },

  refreshMetrics: async () => {
    // Refresh all metrics
    await get().fetchInsights(get().selectedPeriod)
  },

  setPeriod: (period: '7d' | '30d' | '90d' | '1y') => {
    set({ selectedPeriod: period })
    get().fetchInsights(period)
  },

  calculateContactEngagement: () => {
    // Mock calculation - replace with actual logic
    const chartData: ChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Engagement Score',
          data: [65, 72, 68, 85, 89, 92],
          backgroundColor: ['#1976d2'],
          borderColor: ['#1976d2'],
        },
      ],
    }

    set(state => ({
      chartData: { ...state.chartData, contactEngagement: chartData },
    }))
  },

  calculateMeetingEfficiency: () => {
    // Mock calculation - replace with actual logic
    const chartData: ChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [
        {
          label: 'Average Duration (min)',
          data: [45, 52, 38, 41, 48],
          backgroundColor: ['#ff9800'],
          borderColor: ['#ff9800'],
        },
      ],
    }

    set(state => ({
      chartData: { ...state.chartData, meetingEfficiency: chartData },
    }))
  },

  calculateTravelStats: () => {
    // Mock calculation - replace with actual logic
    const chartData: ChartData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Trips',
          data: [3, 5, 4, 6],
          backgroundColor: ['#4caf50'],
          borderColor: ['#4caf50'],
        },
      ],
    }

    set(state => ({
      chartData: { ...state.chartData, travelStats: chartData },
    }))
  },

  calculateProductivityMetrics: () => {
    // Mock calculation - replace with actual logic
    const chartData: ChartData = {
      labels: ['Tasks', 'Meetings', 'Travel', 'Goals'],
      datasets: [
        {
          label: 'Completion Rate %',
          data: [89, 94, 76, 82],
          backgroundColor: ['#1976d2', '#ff9800', '#4caf50', '#9c27b0'],
          borderColor: ['#1976d2', '#ff9800', '#4caf50', '#9c27b0'],
        },
      ],
    }

    set(state => ({
      chartData: { ...state.chartData, productivity: chartData },
    }))
  },

  generateContactsChart: () => {
    return {
      labels: ['New', 'Active', 'Inactive'],
      datasets: [
        {
          label: 'Contacts',
          data: [45, 180, 22],
          backgroundColor: ['#1976d2', '#4caf50', '#ff9800'],
        },
      ],
    }
  },

  generateMeetingsChart: () => {
    return {
      labels: ['Scheduled', 'Completed', 'Cancelled'],
      datasets: [
        {
          label: 'Meetings',
          data: [12, 28, 3],
          backgroundColor: ['#ff9800', '#4caf50', '#f44336'],
        },
      ],
    }
  },

  generateTasksChart: () => {
    return {
      labels: ['To Do', 'In Progress', 'Review', 'Done'],
      datasets: [
        {
          label: 'Tasks',
          data: [15, 8, 5, 42],
          backgroundColor: ['#9e9e9e', '#ff9800', '#2196f3', '#4caf50'],
        },
      ],
    }
  },

  generateTravelChart: () => {
    return {
      labels: ['Planned', 'Confirmed', 'Completed'],
      datasets: [
        {
          label: 'Trips',
          data: [3, 5, 8],
          backgroundColor: ['#ff9800', '#2196f3', '#4caf50'],
        },
      ],
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

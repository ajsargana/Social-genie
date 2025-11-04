import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from './api'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  timezone: string
  preferences: any
  social_accounts?: any[]
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token'),
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authAPI.login({ email, password })
          const { user, token } = data

          localStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Login failed',
            isLoading: false
          })
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authAPI.register({ name, email, password })
          const { user, token } = data

          localStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Registration failed',
            isLoading: false
          })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false, error: null })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isAuthenticated: false })
          return
        }

        set({ isLoading: true })
        try {
          const data = await authAPI.getMe()
          const { user } = data
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          localStorage.removeItem('token')
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },

      updateUser: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...data } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: Date
  }>
  addNotification: (notification: {
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
  }) => void
  removeNotification: (id: string) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  theme: 'light',
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now().toString()
    const timestamp = new Date()
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id, timestamp }]
    }))

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      get().removeNotification(id)
    }, 5000)
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setTheme: (theme) => {
    set({ theme })
  },
}))

interface ContentState {
  content: any[]
  loading: boolean
  error: string | null
  stats: any
  setContent: (content: any[]) => void
  addContent: (content: any) => void
  updateContent: (id: string, content: any) => void
  deleteContent: (id: string) => void
  fetchContent: (params?: any) => Promise<void>
  fetchStats: () => Promise<void>
  generateContent: (data: any) => Promise<any>
}

export const useContentStore = create<ContentState>((set, get) => ({
  content: [],
  loading: false,
  error: null,
  stats: null,

  setContent: (content) => set({ content }),

  addContent: (content) => set((state) => ({ content: [content, ...state.content] })),

  updateContent: (id, updatedContent) =>
    set((state) => ({
      content: state.content.map((item) =>
        item.id === id ? { ...item, ...updatedContent } : item
      ),
    })),

  deleteContent: (id) =>
    set((state) => ({
      content: state.content.filter((item) => item.id !== id),
    })),

  fetchContent: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await contentAPI.getContent(params)
      set({ content: data.content_posts, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const data = await contentAPI.getContentStats()
      set({ stats: data.stats })
    } catch (error: any) {
      console.error('Failed to fetch content stats:', error)
    }
  },

  generateContent: async (data) => {
    set({ loading: true, error: null })
    try {
      const result = await contentAPI.generateContent(data)
      set({ loading: false })
      return result
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },
}))

interface ScheduleState {
  scheduledPosts: any[]
  loading: boolean
  error: string | null
  calendarData: any
  stats: any
  setScheduledPosts: (posts: any[]) => void
  fetchScheduledPosts: (params?: any) => Promise<void>
  fetchCalendar: async (params?: any) => Promise<void>
  fetchStats: async () => Promise<void>
  schedulePost: (data: any) => Promise<void>
  cancelPost: (id: string) => Promise<void>
  retryPost: (id: string) => Promise<void>
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  scheduledPosts: [],
  loading: false,
  error: null,
  calendarData: null,
  stats: null,

  setScheduledPosts: (scheduledPosts) => set({ scheduledPosts }),

  fetchScheduledPosts: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await scheduleAPI.getScheduledPosts(params)
      set({ scheduledPosts: data.scheduled_posts, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchCalendar: async (params) => {
    try {
      const data = await scheduleAPI.getCalendarPosts(params)
      set({ calendarData: data.posts_by_date })
    } catch (error: any) {
      console.error('Failed to fetch calendar data:', error)
    }
  },

  fetchStats: async () => {
    try {
      const data = await scheduleAPI.getScheduleStats()
      set({ stats: data.stats })
    } catch (error: any) {
      console.error('Failed to fetch schedule stats:', error)
    }
  },

  schedulePost: async (data) => {
    set({ loading: true, error: null })
    try {
      const result = await scheduleAPI.schedulePost(data)
      set((state) => ({
        scheduledPosts: [...state.scheduledPosts, ...result.scheduled_posts],
        loading: false
      }))
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  cancelPost: async (id) => {
    try {
      await scheduleAPI.cancelScheduledPost(id)
      set((state) => ({
        scheduledPosts: state.scheduledPosts.filter((post) => post.id !== id)
      }))
    } catch (error: any) {
      throw error
    }
  },

  retryPost: async (id) => {
    try {
      const result = await scheduleAPI.retryScheduledPost(id)
      set((state) => ({
        scheduledPosts: state.scheduledPosts.map((post) =>
          post.id === id ? result.scheduled_post : post
        )
      }))
    } catch (error: any) {
      throw error
    }
  },
}))

interface AnalyticsState {
  overview: any
  posts: any[]
  aiUsage: any
  engagement: any
  dashboardStats: any
  loading: boolean
  error: string | null
  fetchOverview: async (params?: any) => Promise<void>
  fetchPosts: async (params?: any) => Promise<void>
  fetchAIUsage: async (period?: string) => Promise<void>
  fetchEngagement: async (period?: string) => Promise<void>
  fetchDashboardStats: async () => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overview: null,
  posts: [],
  aiUsage: null,
  engagement: null,
  dashboardStats: null,
  loading: false,
  error: null,

  fetchOverview: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await analyticsAPI.getOverview(params)
      set({ overview: data.analytics, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchPosts: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await analyticsAPI.getPostAnalytics(params)
      set({ posts: data.posts, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchAIUsage: async (period) => {
    try {
      const data = await analyticsAPI.getAIUsage(period)
      set({ aiUsage: data.ai_usage })
    } catch (error: any) {
      console.error('Failed to fetch AI usage:', error)
    }
  },

  fetchEngagement: async (period) => {
    try {
      const data = await analyticsAPI.getEngagementAnalytics(period)
      set({ engagement: data.engagement })
    } catch (error: any) {
      console.error('Failed to fetch engagement data:', error)
    }
  },

  fetchDashboardStats: async () => {
    try {
      const data = await analyticsAPI.getDashboardStats()
      set({ dashboardStats: data.dashboard })
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error)
    }
  },
}))

interface AccountsState {
  accounts: any[]
  loading: boolean
  error: string | null
  capabilities: any
  fetchAccounts: async () => Promise<void>
  fetchCapabilities: async () => Promise<void>
  connectAccount: async (platform: string) => Promise<void>
  updateAccount: async (id: string, data: any) => Promise<void>
  deleteAccount: async (id: string) => Promise<void>
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  capabilities: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null })
    try {
      const data = await accountsAPI.getAccounts()
      set({ accounts: data.accounts, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchCapabilities: async () => {
    try {
      const data = await accountsAPI.getCapabilities()
      set({ capabilities: data.capabilities })
    } catch (error: any) {
      console.error('Failed to fetch capabilities:', error)
    }
  },

  connectAccount: async (platform) => {
    try {
      const data = await accountsAPI.getOAuthUrl(platform)
      // In a real app, this would redirect to OAuth flow
      console.log('OAuth URL:', data.connection.url)
      alert(`Please connect your ${platform} account at: ${data.connection.url}`)
    } catch (error: any) {
      throw error
    }
  },

  updateAccount: async (id, data) => {
    try {
      const result = await accountsAPI.updateAccount(id, data)
      set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === id ? result.account : account
        )
      }))
    } catch (error: any) {
      throw error
    }
  },

  deleteAccount: async (id) => {
    try {
      await accountsAPI.deleteAccount(id)
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id)
      }))
    } catch (error: any) {
      throw error
    }
  },
}))
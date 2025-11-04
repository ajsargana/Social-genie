import axios from 'axios'

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-domain.com'
  : 'http://localhost:3001'

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials)
    return response.data
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/api/auth/profile', data)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout')
    return response.data
  }
}

export const contentAPI = {
  generateContent: async (data: {
    category: string
    platforms: string[]
    preferences: any
    context?: any
  }) => {
    const response = await api.post('/api/content/generate', data)
    return response.data
  },

  createContent: async (data: {
    title?: string
    content_text: string
    hashtags: string[]
    media_urls?: string[]
    media_type?: string
    content_category: string
  }) => {
    const response = await api.post('/api/content', data)
    return response.data
  },

  getContent: async (params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }) => {
    const response = await api.get('/api/content', { params })
    return response.data
  },

  getContentById: async (id: string) => {
    const response = await api.get(`/api/content/${id}`)
    return response.data
  },

  updateContent: async (id: string, data: any) => {
    const response = await api.put(`/api/content/${id}`, data)
    return response.data
  },

  deleteContent: async (id: string) => {
    const response = await api.delete(`/api/content/${id}`)
    return response.data
  },

  getContentStats: async () => {
    const response = await api.get('/api/content/stats')
    return response.data
  }
}

export const accountsAPI = {
  getAccounts: async () => {
    const response = await api.get('/api/accounts')
    return response.data
  },

  getOAuthUrl: async (platform: string) => {
    const response = await api.get(`/api/accounts/connect/${platform}`)
    return response.data
  },

  updateAccount: async (id: string, data: any) => {
    const response = await api.put(`/api/accounts/${id}`, data)
    return response.data
  },

  deleteAccount: async (id: string) => {
    const response = await api.delete(`/api/accounts/${id}`)
    return response.data
  },

  getAccountStatus: async (id: string) => {
    const response = await api.get(`/api/accounts/${id}/status`)
    return response.data
  },

  getCapabilities: async () => {
    const response = await api.get('/api/accounts/capabilities')
    return response.data
  }
}

export const scheduleAPI = {
  getScheduledPosts: async (params?: {
    page?: number
    limit?: number
    status?: string
    platform?: string
  }) => {
    const response = await api.get('/api/schedule', { params })
    return response.data
  },

  schedulePost: async (data: {
    content_post_id: string
    social_account_ids: string[]
    scheduled_at: string
  }) => {
    const response = await api.post('/api/schedule', data)
    return response.data
  },

  getScheduledPostById: async (id: string) => {
    const response = await api.get(`/api/schedule/${id}`)
    return response.data
  },

  updateScheduledPost: async (id: string, data: any) => {
    const response = await api.put(`/api/schedule/${id}`, data)
    return response.data
  },

  cancelScheduledPost: async (id: string) => {
    const response = await api.delete(`/api/schedule/${id}`)
    return response.data
  },

  retryScheduledPost: async (id: string) => {
    const response = await api.post(`/api/schedule/${id}/retry`)
    return response.data
  },

  getCalendarPosts: async (params?: {
    start_date?: string
    end_date?: string
  }) => {
    const response = await api.get('/api/schedule/calendar', { params })
    return response.data
  },

  getScheduleStats: async () => {
    const response = await api.get('/api/schedule/stats')
    return response.data
  }
}

export const analyticsAPI = {
  getOverview: async (params?: {
    platform?: string
    date_from?: string
    date_to?: string
    content_category?: string
  }) => {
    const response = await api.get('/api/analytics', { params })
    return response.data
  },

  getPostAnalytics: async (params?: {
    page?: number
    limit?: number
    platform?: string
    date_from?: string
    date_to?: string
  }) => {
    const response = await api.get('/api/analytics/posts', { params })
    return response.data
  },

  getAIUsage: async (period?: string) => {
    const response = await api.get('/api/analytics/ai-usage', {
      params: { period }
    })
    return response.data
  },

  getEngagementAnalytics: async (period?: string) => {
    const response = await api.get('/api/analytics/engagement', {
      params: { period }
    })
    return response.data
  },

  getDashboardStats: async () => {
    const response = await api.get('/api/analytics/dashboard')
    return response.data
  }
}

export const healthAPI = {
  check: async () => {
    const response = await api.get('/api/health')
    return response.data
  },

  checkDetailed: async () => {
    const response = await api.get('/api/health/detailed')
    return response.data
  }
}

export default api
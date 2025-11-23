// Simple API client - no complex abstractions
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class SimpleAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async register(name: string, email: string, password: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  // Content
  async getContent(params = {}) {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/content?${query}`)
  }

  async createContent(content: any) {
    return this.request('/content', {
      method: 'POST',
      body: JSON.stringify(content),
    })
  }

  async generateContent(params: any) {
    return this.request('/content/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async deleteContent(id: string) {
    return this.request(`/content/${id}`, {
      method: 'DELETE',
    })
  }

  // Scheduling
  async getScheduledPosts(params = {}) {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/schedule?${query}`)
  }

  async schedulePost(data: any) {
    return this.request('/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async cancelScheduledPost(id: string) {
    return this.request(`/schedule/${id}`, {
      method: 'DELETE',
    })
  }

  // Social Accounts
  async getAccounts() {
    return this.request('/accounts')
  }

  async getOAuthUrl(platform: string) {
    return this.request(`/accounts/oauth-url/${platform}`)
  }

  // Analytics
  async getDashboardStats() {
    return this.request('/analytics/dashboard')
  }
}

export const api = new SimpleAPI()
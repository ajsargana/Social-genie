'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          localStorage.removeItem('token')
          router.push('/auth/login')
        }
      } catch (error) {
        localStorage.removeItem('token')
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      localStorage.removeItem('token')
      router.push('/')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const navigation = [
    { name: 'Overview', href: '/dashboard', id: 'overview' },
    { name: 'Content', href: '/dashboard/content', id: 'content' },
    { name: 'Schedule', href: '/dashboard/schedule', id: 'schedule' },
    { name: 'Analytics', href: '/dashboard/analytics', id: 'analytics' },
    { name: 'Accounts', href: '/dashboard/accounts', id: 'accounts' },
    { name: 'Settings', href: '/dashboard/settings', id: 'settings' },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50 flex">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 h-0 flex-col overflow-y-auto bg-primary-800 pt-5 pb-4">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="text-2xl font-bold text-white">🧞‍♂️</div>
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      activeTab === item.id
                        ? 'bg-primary-900 text-white'
                        : 'text-primary-300 hover:bg-primary-700 hover:text-white'
                    }`}
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsMenuOpen(false)
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="w-14 flex-shrink-0"></div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-primary-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="text-2xl font-bold text-white">🧞‍♂️</div>
          </div>
          <nav className="mt-5 flex-1 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  activeTab === item.id
                    ? 'bg-primary-900 text-white'
                    : 'text-primary-300 hover:bg-primary-700 hover:text-white'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User profile */}
          <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
            <div className="flex items-center">
              <div>
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-primary-400">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto text-primary-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Social Genie</h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
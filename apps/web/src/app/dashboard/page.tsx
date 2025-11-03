'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    total_accounts: 0,
    active_accounts: 0,
    scheduled_posts: 0,
    posts_today: 0,
    engagement_this_week: 0,
    ai_generations_this_month: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.dashboard)
      } else {
        toast.error('Failed to fetch dashboard stats')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Connected Accounts',
      value: stats.total_accounts,
      subtitle: `${stats.active_accounts} active`,
      icon: UsersIcon,
      color: 'bg-blue-500',
      trend: null
    },
    {
      title: 'Scheduled Posts',
      value: stats.scheduled_posts,
      subtitle: 'Ready to publish',
      icon: CalendarIcon,
      color: 'bg-green-500',
      trend: null
    },
    {
      title: 'Posts Today',
      value: stats.posts_today,
      subtitle: 'Published successfully',
      icon: CheckCircleIcon,
      color: 'bg-purple-500',
      trend: null
    },
    {
      title: 'AI Generations',
      value: stats.ai_generations_this_month,
      subtitle: 'This month',
      icon: SparklesIcon,
      color: 'bg-orange-500',
      trend: null
    }
  ]

  const quickActions = [
    {
      title: 'Generate Content',
      description: 'Create AI-powered content for your social media',
      icon: SparklesIcon,
      href: '/dashboard/content',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      title: 'Schedule Posts',
      description: 'Set up your posting schedule',
      icon: CalendarIcon,
      href: '/dashboard/schedule',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'View Analytics',
      description: 'Track your social media performance',
      icon: ChartBarIcon,
      href: '/dashboard/analytics',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your social media automation.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      {stat.trend && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span>{stat.trend > 0 ? '↑' : '↓'}</span>
                          <span>{Math.abs(stat.trend)}%</span>
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className={`${action.color} block rounded-lg p-6 text-white shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <action.icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">{action.title}</h3>
                  <p className="mt-1 text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Daily movie post published to Instagram</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">New content generated for Twitter</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Quote post scheduled for LinkedIn</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Pro Tip</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your posts are performing best between 2-4 PM. Consider scheduling important content during these peak engagement hours for maximum reach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
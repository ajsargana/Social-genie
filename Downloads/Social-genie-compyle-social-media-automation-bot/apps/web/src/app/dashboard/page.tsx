'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  RocketLaunchIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    total_accounts: 5,
    active_accounts: 4,
    scheduled_posts: 12,
    posts_today: 3,
    engagement_this_week: 1250,
    ai_generations_this_month: 48
  })
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data.dashboard)
      }
    } catch (error) {}
    finally { setIsLoading(false) }
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-purple-600 animate-pulse" />
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Connected Accounts',
      value: stats.total_accounts,
      subtitle: `${stats.active_accounts} active now`,
      icon: UsersIcon,
      gradient: 'from-indigo-600 to-purple-600',
      bgGradient: 'from-indigo-500/10 to-purple-500/10',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Scheduled Posts',
      value: stats.scheduled_posts,
      subtitle: 'Ready to publish',
      icon: CalendarIcon,
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Posts Today',
      value: stats.posts_today,
      subtitle: 'Published successfully',
      icon: CheckCircleIcon,
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'AI Generations',
      value: stats.ai_generations_this_month,
      subtitle: 'This month',
      icon: SparklesIcon,
      gradient: 'from-pink-600 to-rose-600',
      bgGradient: 'from-pink-500/10 to-rose-500/10',
      trend: '+25%',
      trendUp: true
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
      {/* Modern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-3xl opacity-10 animate-float-slow"></div>
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-pink-400 to-rose-600 rounded-full blur-3xl opacity-10 animate-float-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 p-6 lg:p-10 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                  Dashboard
                </h1>
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-green-700">Live</span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 flex items-center">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <button className="btn btn-primary btn-sm sm:btn-lg group">
              <RocketLaunchIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
              Generate Content
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className="card-premium p-6 animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.trendUp && '↑'} {stat.trend}
                  </div>
                </div>

                {/* Value */}
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900">{stat.title}</div>
                  <div className="text-xs text-gray-600">{stat.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 flex items-center">
            <BoltIcon className="h-6 w-6 mr-2 text-purple-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Generate Content',
                description: 'Create AI-powered posts in seconds',
                icon: SparklesIcon,
                href: '/dashboard/content',
                gradient: 'from-indigo-600 to-purple-600',
                iconBg: 'bg-indigo-100',
                iconColor: 'text-indigo-600'
              },
              {
                title: 'Schedule Posts',
                description: 'Plan your content calendar',
                icon: CalendarIcon,
                href: '/dashboard/schedule',
                gradient: 'from-purple-600 to-pink-600',
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600'
              },
              {
                title: 'View Analytics',
                description: 'Track performance & insights',
                icon: ChartBarIcon,
                href: '/dashboard/analytics',
                gradient: 'from-pink-600 to-rose-600',
                iconBg: 'bg-pink-100',
                iconColor: 'text-pink-600'
              }
            ].map((action, i) => (
              <a
                key={i}
                href={action.href}
                className="card-feature group"
                style={{ animationDelay: `${0.3 + i * 0.05}s` }}
              >
                <div className="relative">
                  <div className={`inline-flex p-3 ${action.iconBg} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">{action.description}</p>
                  <div className="inline-flex items-center text-sm font-bold text-purple-600 group-hover:translate-x-2 transition-transform">
                    Get started
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity & Performance */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Recent Activity */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Recent Activity</h2>
            <div className="card-premium overflow-hidden">
              <div className="divide-y divide-gray-100">
                {[
                  {
                    icon: CheckCircleIcon,
                    iconBg: 'from-green-500 to-emerald-500',
                    title: 'Posted to Instagram',
                    description: 'Daily motivation quote',
                    time: '2 hours ago',
                    badge: 'Success',
                    badgeColor: 'bg-green-100 text-green-700'
                  },
                  {
                    icon: SparklesIcon,
                    iconBg: 'from-indigo-500 to-purple-500',
                    title: 'AI Content Generated',
                    description: 'Twitter thread created',
                    time: '5 hours ago',
                    badge: 'AI',
                    badgeColor: 'bg-purple-100 text-purple-700'
                  },
                  {
                    icon: CalendarIcon,
                    iconBg: 'from-purple-500 to-pink-500',
                    title: 'Post Scheduled',
                    description: 'LinkedIn article tomorrow',
                    time: 'Yesterday',
                    badge: 'Scheduled',
                    badgeColor: 'bg-pink-100 text-pink-700'
                  },
                  {
                    icon: ArrowTrendingUpIcon,
                    iconBg: 'from-blue-500 to-cyan-500',
                    title: 'Engagement Boost',
                    description: '+45% this week',
                    time: '2 days ago',
                    badge: 'Trending',
                    badgeColor: 'bg-blue-100 text-blue-700'
                  }
                ].map((activity, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 p-2.5 bg-gradient-to-r ${activity.iconBg} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <activity.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${activity.badgeColor}`}>
                          {activity.badge}
                        </span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Performance</h2>
            <div className="card-premium p-6">
              <div className="space-y-6">
                {[
                  {
                    label: 'Engagement Rate',
                    value: 94,
                    color: 'bg-indigo-600',
                    icon: FireIcon,
                    iconColor: 'text-indigo-600',
                    trend: '+12%'
                  },
                  {
                    label: 'Content Quality',
                    value: 88,
                    color: 'bg-purple-600',
                    icon: TrophyIcon,
                    iconColor: 'text-purple-600',
                    trend: '+8%'
                  },
                  {
                    label: 'Audience Growth',
                    value: 76,
                    color: 'bg-pink-600',
                    icon: ArrowTrendingUpIcon,
                    iconColor: 'text-pink-600',
                    trend: '+25%'
                  }
                ].map((metric, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                        <span className="text-sm font-bold text-gray-900">{metric.label}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-green-600">{metric.trend}</span>
                        <span className="text-lg font-black text-gray-900">{metric.value}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${metric.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${metric.value}%`, animationDelay: `${i * 0.1}s` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Card */}
              <div className="mt-8 p-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white/80 mb-1">Total Reach</div>
                    <div className="text-3xl font-black">127K</div>
                    <div className="text-sm text-white/80 mt-1">+18% from last month</div>
                  </div>
                  <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 p-5 bg-white/20 backdrop-blur-xl rounded-2xl">
                <BoltIcon className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl lg:text-3xl font-black text-white mb-3">Pro Tip: Optimal Posting Times</h3>
                <p className="text-white/90 text-lg leading-relaxed">
                  Your audience is most active between <span className="font-bold">2-4 PM</span>.
                  Schedule your top content during these hours for maximum engagement and reach.
                </p>
              </div>
              <button className="flex-shrink-0 bg-white text-purple-600 hover:bg-gray-50 font-bold px-8 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all">
                View Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

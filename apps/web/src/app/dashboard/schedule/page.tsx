'use client'

import { useState, useEffect } from 'react'
import { format, addDays, isToday, isPast, startOfDay, endOfDay } from 'date-fns'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { Calendar, dateFns } from 'react-datepicker'
import { useScheduleStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CalendarIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

export default function SchedulePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  const {
    scheduledPosts,
    fetchScheduledPosts,
    schedulePost,
    cancelPost,
    retryPost,
    calendarData,
    fetchCalendar,
    stats
  } = useScheduleStore()

  const {
    fetchAccounts
  } = useAccountsStore()

  useEffect(() => {
    fetchScheduledPosts()
    fetchCalendar({
      start_date: format(startOfMonth(selectedDate),
      end_date: format(endOfMonth(selectedDate))
    })
    fetchStats()
  }, [selectedDate, viewMode])

  useEffect(() => {
    fetchAccounts()
  }, [])

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy')
  }

  const formatStartOfMonth = (date: Date) => {
    return format(startOfMonth(date), 'yyyy-MM-dd')
  }

  const formatEndOfMonth = (date: Date) => {
    return format(endOfMonth(date), 'yyyy-MM-dd')
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setViewMode('day')
  }

  const handleViewModeChange = (mode: 'month' | 'week' | 'day') => {
    setViewMode(mode)
    if (mode === 'month') {
      setSelectedDate(new Date())
    }
  }

  const handleSchedulePost = async (contentPostId: string, socialAccountIds: string[], scheduledAt: Date) => {
    try {
      const result = await schedulePost({
        content_post_id: contentPostId,
        social_account_ids: socialAccountIds,
        scheduled_at: scheduledAt.toISOString()
      })

      if (result.success) {
        toast.success('Post scheduled successfully')
        fetchScheduledPosts()
        fetchCalendar()
      } else {
          toast.error('Failed to schedule post')
        }
    } catch (error) {
      toast.error('Failed to schedule post')
    }
  }

  const handleCancelPost = async (id: string) => {
    try {
      await cancelPost(id)
      toast.success('Post cancelled')
      fetchScheduledPosts()
    } catch (error) {
      toast.error('Failed to cancel post')
    }
  }

  const handleRetryPost = async (id: string) => {
    try {
      await retryPost(id)
      toast.success('Post retry scheduled')
      fetchScheduledPosts()
    } catch (error) {
      toast.error('Failed to retry post')
    }
  }

  const getDayEvents = () => {
    const events = []
    const today = new Date()
    const startOfWeek = startOfWeek(today)
    const endOfWeek = endOfWeek(today)

    for (let i = 0; i < 7; i++) {
      const date = addDays(startOfWeek, i)
      const dayEvents = calendarData?.[formatDate(date)] || []

      events.push({
        date: date,
        posts: dayEvents.length,
        hasScheduled: dayEvents.some(post => post.status === 'scheduled'),
        hasPosted: dayEvents.some(post => post.status === 'posted'),
        hasFailed: dayEvents.some(post => post.status === 'failed')
      })
    }

    return events
  }

  const getEventsForDate = (date: Date) => {
    return calendarData?.[formatDate(date)] || []
  }

  const getEventStatus = (date: Date) => {
    const events = getEventsForDate(date)
    if (events.length === 0) return 'empty'

    if (events.some(post => post.status === 'failed')) return 'failed'
    if (events.some(post => post.status === 'posted')) return 'posted'
    if (events.some(post => post.status === 'scheduled')) return 'scheduled'
    return 'upcoming'
  }

  const getEventColor = (status: string) => {
    const colors = {
      posted: 'text-green-600',
      scheduled: 'text-blue-600',
      failed: 'text-red-600',
      upcoming: 'text-gray-600'
    }
    return colors[status] || 'text-gray-600'
  }

  const CustomDayCell = ({ date, events }: { date: Date; events: any[] }) => {
    const eventsForDate = getEventsForDate(date)
    const status = getEventStatus(date)
    const color = getEventColor(status)

    return (
      <div
        className={`h-8 w-8 rounded-full ${color} text-white flex items-center justify-center text-xs font-medium`}
      >
        {eventsForDate.length > 0 ? (
          <div className="relative">
            {eventsForDate.length > 3 ? (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs">
                +{eventsForDate.length - 3}
              </div>
            ) : null}
            <span className="relative">
              {eventsForDate.length}
            </span>
          </div>
        ) : (
            <span className="text-xs">No posts</span>
          )}
      </div>
    )
  }

  return (
    <div className="h-6 text-sm font-medium text-gray-700">
      {formatDate(date)}
    </div>
  )
}

const renderCalendar = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <Calendar
        selected={selectedDate}
        onDateChange={handleDateSelect}
        view={viewMode}
        tileClassName={({ date }) => {
          const events = getEventsForDate(date)
          const status = getEventStatus(date)
          const color = getEventColor(status)
          return `h-10 w-10 ${color} rounded-lg flex items-center justify-center text-white text-sm font-medium`
        }}
        components={{
          DayContent: CustomDayCell,
          MonthContent: ({ date, events }: { date: Date; events: any[] }) => {
            return (
              <div className="p-2 h-20 overflow-y-auto">
                {events.map((event, index) => (
                  <div key={index} className="mb-2 p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">{event.platform_username || 'Unknown'}</h4>
                        <span className="text-xs text-gray-500">
                          {format(new Date(event.scheduled_at || event.posted_at, 'p')} • {event.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {event.status === 'scheduled' && (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        )}
                        {event.status === 'posted' && (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        )}
                        {event.status === 'failed' && (
                          <ExclamationCircleIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {event.content_text}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        }}
        monthYearClassName="text-sm font-medium"
        weekdayClassName="text-xs"
        navigation
        onNavigate={(date, direction) => {
          setSelectedDate(date)
        }}
      />
    </Calendar>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Posts</h1>
        <p className="mt-2 text-gray-600">
          Schedule your content for optimal posting times
        </p>
      </div>

      {/* Calendar View */}
      <div className="mb-8">
        {renderCalendar()}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Schedule for</p>
                  <select
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    onChange={(e) => {
                      const date = e.target.value
                      setSelectedDate(new Date(date))
                      setViewMode('day')
                    }}
                  >
                    <option value={formatStartOfMonth(new Date())}>This Month</option>
                    <option value={formatStartOfMonth(addDays(new Date(), 1))}>Next Month</option>
                    <option value={formatStartOfMonth(addDays(new Date(), 2))}>Next 2 Months</option>
                  </select>
                </div>
                <Button
                  onClick={() => {
                    const date = selectedDate
                  const accountIds = Array.from({ length: Math.min(3, accounts?.length || 0) }).map((_, index) => accounts[index]?.id)
                  if (accountIds.length > 0) {
                    handleSchedulePost('', accountIds, date)
                  }
                }}
                  disabled={isGenerating || !user || accountIds.length === 0}
                >
                  Schedule for {formatDate(selectedDate)}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  fetchScheduledPosts()
                }}
                className="flex-1"
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  fetchCalendar()
                }}
                className="flex-1"
              >
                Refresh Calendar
              </Button>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Scheduled Posts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Scheduled Posts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : (
                  scheduledPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                            {getPlatformIcon(post.platform)}
                          </div>
                          <span className="ml-2 text-sm text-gray-900">{post.platform_username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {post.title || 'Untitled Post'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {post.content_text?.substring(0, 50)}{post.content_text.length > 50 ? '...' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          getEventStatus(post.scheduled_at) === 'posted'
                            ? 'text-green-600 bg-green-100'
                            : getEventStatus(post.scheduled_at) === 'failed'
                            ? 'text-red-600 bg-red-100'
                            : 'text-blue-600 bg-blue-100'
                        }`}>
                          {formatDate(new Date(post.scheduled_at))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-medium ${
                          post.status === 'posted'
                            ? 'text-green-600'
                            : post.status === 'failed'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => window.open(`/dashboard/schedule/${post.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(post.content_text)}
                            className="text-gray-600 hover:text-gray-800 text-xs"
                          >
                            📋
                          </button>
                        </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
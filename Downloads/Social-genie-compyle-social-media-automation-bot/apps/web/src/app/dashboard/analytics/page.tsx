'use client'

import { useState, useEffect } from 'react'
import { format, subDays, isPast, startOfDay, endOfDay } from 'date-fns'
import { toast } from 'react-hot-toast'
import { LineChart, LineChartConfig, BarChart } from 'recharts'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { useAnalyticsStore, useAccountsStore, useContentStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { useAnalyticsState } from '@/lib/store'

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { stats, overview, posts, aiUsage, engagement, fetchOverview, fetchPosts, fetchAIUsage, fetchEngagement, fetchDashboardStats } = useAnalyticsStore()
  const { accounts } = useAccountsStore()

  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('7')
  const [selectedCategory, setSelectedCategory] = useState<'all'>('all')

  useEffect(() => {
    fetchDashboardStats()
    fetchOverview({ date_from: getStartDate(selectedPeriod) })
  }, [selectedPeriod])

  useEffect(() => {
    fetchOverview({ date_from: getStartDate(selectedPeriod) })
    fetchPosts({ platform: selectedPlatform, limit: 20 })
  }, [selectedPlatform, selectedPeriod])

  useEffect(() => {
    fetchAIUsage(selectedPeriod)
    fetchEngagement(selectedPeriod)
  }, [selectedPeriod])

  useEffect(() => {
    fetchContentStats()
  }, [selectedCategory])

  useEffect(() => {
    fetchAccounts()
  }, [])

  const getStartDate = (period: string) => {
    let days = 7
    if (period === '30') days = 30
    if (period === '90') days = 90
    return subDays(new Date(), days)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: { currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    `${(100 * value).toFixed(1)}%`
  }

  const getEngagementMetrics = () => {
    if (!engagement) return { total_engagement: 0, avg_sentiment: 0, auto_reply_rate: 0 }

    return engagement
  }

  const getAIUsageSummary = () => {
    if (!aiUsage || !aiUsage.summary) return { total_cost: 0, total_generations: 0, avg_quality_score: 0 }

    return aiUsage.summary
  }

  const getTopPerformingCategories = () => {
    if (!overview || !overview.by_category) return []

    return overview?.by_category?.slice(0, 5).map((cat) => ({
      category: cat.category,
      total_posts: cat.total_posts,
      total_engagement: cat.total_engagement || 0,
      avg_engagement_rate: cat.avg_engagement_rate || 0
    })).sort((a, b) => b.total_engagement - a.total_engagement)
  }

  const getPostPerformanceChart = () => {
    if (!posts || !overview?.by_platform) return { data: [], options: { x: 'auto', y: 'auto' } }

    return posts.slice(0, 10).map(post => ({
      date: new Date(post.posted_at),
      platform: post.platform,
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      views: post.views || 0,
      engagement_rate: post.engagement_rate || 0
    }))
  }

  const getEngagementTrend = () => {
    if (!engagement?.daily_usage || engagement.daily_usage?.length === 0) return { trend: 'stable' }

    const daily = engagement.daily_usage || []
    const last30Days = daily.slice(-30).map((entry) => ({
      date: new Date(entry.date),
      total_engagement: entry.total_engagement,
      auto_replied: entry.auto_replied,
      auto_reply_rate: entry.auto_reply_rate || 0,
      sentiment_score: entry.avg_sentiment_score || 0
    })).sort((a, b) => new Date(b.date) - new Date(a.date))

    const recentTrend = last30Days.length > 0
      ? (last30Days[0].total_engagement - last30Days[30].total_engagement) / last30Days[30].total_engagement
      : 0

    return recentTrend > 0 ? 'trending up' : 'stable'
  }

  const getPlatformPerformance = () => {
    if (!overview?.by_platform) return []

    return overview?.by_platform?.map((platform) => ({
      platform: platform.platform,
      total_posts: platform.total_posts || 0,
      total_engagement: platform.total_engagement || 0,
      avg_engagement_rate: platform.avg_engagement_rate || 0,
      top_performing_category: platform.top_performing_category || 'No content posted yet'
    })).sort((a, b) => b.total_engagement - a.total_engagement)
  }

  const contentPerformance = {
    total_posts: stats?.total_posts || 0,
    successful_posts: stats?.successful_posts || 0,
    failed_posts: stats?.failed_posts || 0,
    total_engagement: stats?.total_engagement || 0,
    avg_engagement_rate: stats?.avg_engagement_rate || 0,
    best_performing_category: stats?.best_performing_category || 'No content posted yet'
  }

  const aiPerformance = {
    total_generations: getAIUsageSummary().total_generations || 0,
    total_cost: getAIUsageSummary().total_cost || 0,
    avg_quality_score: getAIUsageSummary().average_quality_score || 0,
    avg_generation_time: getAIUsageSummary().average_generation_time || 0
  }

  const socialAccounts = accounts || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <Card>
        <CardHeader>
          <h3 className="content-header">Performance Overview</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {contentPerformance.total_posts} posts created
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(contentPerformance.total_engagement || 0)} total engagement
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {contentPerformance.successful_posts || 0} successful posts
              </div>
              <div className="text-sm text-gray-500">
                {formatPercentage(contentPerformance.avg_engagement_rate || 0)} avg engagement
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="content-header">AI Performance</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {aiPerformance.total_generations || 0} generations
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(aiPerformance.total_cost || 0)} total spent
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {aiPerformance.avg_quality_score || 0}/10 avg quality
              </div>
              <div className="text-sm text-gray-500">
                {aiPerformance.avg_generation_time || 0}ms avg time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="content-header">Social Performance</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {socialAccounts.length} connected accounts
              </div>
              <div className="text-sm text-gray-500">
                {socialAccounts.filter(acc => acc.is_active).length} active accounts
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {getPlatformPerformance().length} platforms
              </div>
              <div className="text-sm text-gray-500">
                {socialAccounts.filter(acc => acc.auto_post_enabled).length} platforms enabled
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="content-header">Content Statistics</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{contentPerformance.total_posts || 0}</div>
              <div className="text-sm text-gray-500">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {contentPerformance.successful_posts || 0} successful posts
              </div>
              <div className="text-sm text-gray-500">
                {contentPerformance.failed_posts || 0} failed posts
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {contentPerformance.ai_generated || 0} AI Generated
              </div>
              <div className="text-sm text-gray-500">
                AI Generated
              </div>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  {/* Platform Performance Comparison */}
  {getPlatformPerformance().length > 0 && (
    <Card>
      <CardHeader>
        <h3 className="content-header">Platform Performance Comparison</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {getPlatformPerformance().map((platform, index) => (
            <div key={platform.platform} className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">{platform.platform}</div>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {platform.total_posts || 0} posts
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {formatPercentage(
                    platform.total_engagement_rate || 0
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Recent Activity */}
  <div className="mt-8">
    <Card>
      <CardHeader>
        <h3 className="content-header">Recent Activity</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent_posts.slice(0, 5).map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <div className="text-sm text-gray-600">
                  {post.platform?.charAt(0)?.toUpperCase() || 'NA'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(post.posted_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium ${
                  post.status === 'posted' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {post.status === 'posted' ? 'Posted' : 'Scheduled'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">
                  {post.likes || 0} likes
                </span>
                <span className="text-xs text-gray-500">
                  {post.comments || 0} comments
                </span>
              </div>
            </div>
          ))}
          {recent_posts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-center">
                <div className="text-6xl text-gray-400">
                  📄 No recent activity
                </div>
                <p className="mt-2 text-gray-500">
                  No posts have been published yet
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

  </div>
}
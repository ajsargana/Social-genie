'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useContentStore } from '@/lib/store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { PlusIcon, SparklesIcon, EyeIcon, EditIcon, TrashIcon } from '@heroicons/react/24/outline'

interface ContentFormData {
  category: string
  platforms: string[]
  preferences: {
    tone: string
    length: string
    include_media: boolean
    media_type: string
    auto_hashtags: boolean
    hashtag_count: number
  }
}

const contentCategories = [
  { value: 'daily_movie', label: 'Daily Movie', icon: '🎬' },
  { value: 'product_showcase', label: 'Product Showcase', icon: '📦' },
  { value: 'daily_quote', label: 'Daily Quote', icon: '💭' },
  { value: 'news', label: 'News', icon: '📰' },
  { 'value: 'educational', label: 'Educational', icon: '📚' },
  { value: 'entertainment', label: ' Entertainment', icon: '🎮' },
  { 'value: 'promotional', label: 'Promotional', icon: '📈' },
  { 'value: 'behind_scenes', label: 'Behind Scenes', icon: '🎭' },
  { 'user_generated', label: 'User Generated', icon: '👤' },
  { 'custom', label: 'Custom', icon: '⚙️' }
]

const platforms = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌' }
]

export default function ContentPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<ContentFormData>({
    category: 'daily_movie',
    platforms: [],
    preferences: {
      tone: 'friendly',
      length: 'medium',
      include_media: true,
      media_type: 'image',
      auto_hashtags: true,
      hashtag_count: 10
    }
  })

  const { content, setContent, addContent, updateContent, deleteContent, fetchContent, stats, generateContent } = useContentStore()
  const { fetchAccounts } = useAccountsStore()

  useEffect(() => {
    fetchContent()
    fetchStats()
    fetchAccounts()
  }, [])

  const handleGenerateContent = async () => {
    if (formData.platforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateContent(formData)

      // Add generated content to store
      if (result.success && result.content_posts?.length > 0) {
        for (const post of result.content_posts) {
          addContent(post)
        }
        toast.success(`Generated content for ${result.content_posts.length} platforms`)
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleDeleteContent = async (id: string) => {
    try {
      await deleteContent(id)
      toast.success('Content deleted successfully')
    } catch (error: any) {
      toast.error('Failed to delete content')
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
        <p className="mt-2 text-gray-600">
          Create and manage your AI-generated content library
        </p>
      </div>

      {/* Action Bar */}
      <div className="mb-8">
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                >
                  {contentCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform(s)
                </label>
                <div className="space-y-2">
                  {platforms.map((platform) => (
                    <label key={platform.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform.value)}
                        onChange={() => handlePlatformToggle(platform.value)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{platform.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Tone
                </label>
                <select
                  value={formData.preferences.tone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, tone: e.target.value }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="humorous">Humorous</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Length
                </label>
                <select
                  value={formData.preferences.length}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, length: e.target.value }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <Button
                loading={isGenerating}
                onClick={handleGenerateContent}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl text-gray-300 mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-500">
                  Generate your first AI-powered content
                </p>
              </CardContent>
            </Card>
        ) : (
          content.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      {getCategoryIcon(item.content_category)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title || 'Untitled'}</h3>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {item.ai_generated && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        AI Generated
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getPlatformColor(item.platform) + ' text-white'
                    }`}>
                      {item.platform?.charAt(0)?.toUpperCase() || 'NA'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 line-clamp">
                      {item.content_text}
                    </p>
                  </div>
                  {item.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.media_urls?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.media_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-500">
                      {item.media_type} • {getCategoryName(item.content_category)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-xs text-primary-600 hover:text-primary-800"
                        onClick={() => window.open(url)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="text-xs text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          navigator.clipboard.writeText(item.content_text)
                          toast.success('Content copied to clipboard')
                        }}
                      >
                        📋
                      </button>
                      <button
                        className="text-xs text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-primary-600">
              {stats?.total_posts || 0}
            </div>
            <p className="text-sm text-gray-600">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-green-600">
              {stats?.successful_posts || 0}
            </div>
            <p className="text-sm text-gray-600">Successful Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-purple-600">
              {stats?.ai_generations_this_month || 0}
            </div>
            <p className="text-sm text-gray-600">AI Generations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-orange-600">
              {stats?.engagement_this_week || 0}
            </div>
            <p className="text-sm text-gray-600">Engagement This Week</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    daily_movie: '🎬',
    product_showcase: '📦',
    daily_quote: '💭',
    news: '📰',
    educational: '📚',
    entertainment: '🎮',
    promotional: '📈',
    behind_scenes: '🎭',
    user_generated: '👤',
    custom: '⚙️'
  }
  return icons[category] || '📄'
}

function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    instagram: 'bg-purple-600',
    facebook: 'bg-blue-600',
    twitter: 'bg-blue-400',
    linkedin: 'bg-blue-700',
    tiktok: 'bg-black',
    youtube: 'bg-red-600',
    pinterest: 'bg-red-700'
  }
  return colors[platform] || 'bg-gray-600'
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    daily_movie: 'Daily Movie',
    product_showcase: 'Product Showcase',
    daily_quote: 'Daily Quote',
    news: 'News',
    educational: 'Educational',
    entertainment: 'Entertainment',
    promotional: 'Promotional',
    behind_scenes: 'Behind Scenes',
    user_generated: 'User Generated',
    custom: 'Custom'
  }
  return names[category] || 'Unknown'
}
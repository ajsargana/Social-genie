'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          router.push('/dashboard')
        }
      } catch (error) {
        // User is not logged in, continue showing landing page
      }
    }
    checkAuth()
  }, [router])

  const handleGetStarted = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                🧞‍♂️ Social Genie
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-gray-900">How it Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900">Pricing</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <button
                onClick={handleGetStarted}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div>
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  AI-Powered Social Media
                  <span className="text-primary-600"> Automation</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                  Automatically generate, schedule, and publish engaging content across all major social platforms.
                  Save hours of work while maintaining a consistent online presence.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <button
                    onClick={handleGetStarted}
                    className="bg-primary-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Start Free Trial
                  </button>
                  <a
                    href="#how-it-works"
                    className="text-lg font-medium text-gray-900 hover:text-gray-700"
                  >
                    Watch Demo →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything You Need to Automate Your Social Media
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Powerful features that save you time and boost your social media presence.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="text-primary-600 text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold text-gray-900">AI Content Generation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Generate engaging captions, images, and hashtags with advanced AI
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-primary-600 text-4xl mb-4">🌐</div>
                <h3 className="text-lg font-semibold text-gray-900">Multi-Platform Support</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Post to Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube & Pinterest
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-primary-600 text-4xl mb-4">⏰</div>
                <h3 className="text-lg font-semibold text-gray-900">Smart Scheduling</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Optimal posting times with intelligent content adaptation
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-primary-600 text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics & Insights</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track performance and optimize your social media strategy
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-primary-600 text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900">Auto-Engagement</h3>
                <p className="mt-2 text-sm text-gray-600">
                  AI-powered replies to comments and mentions
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-primary-600 text-4xl mb-4">🎛️</div>
                <h3 className="text-lg font-semibold text-gray-900">Full Control</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Review and approve content before posting
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How Social Genie Works
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Get started in minutes and automate your social media presence.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Connect Accounts</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Link your social media accounts securely with OAuth
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Configure Preferences</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Set your tone, content types, and posting schedule
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Generate Content</h3>
                <p className="mt-2 text-sm text-gray-600">
                  AI creates engaging content tailored to your brand
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Post Automatically</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Content is posted at optimal times for maximum engagement
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-600">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Automate Your Social Media?
              </h2>
              <p className="mx-auto mt-6 text-lg leading-8 text-primary-100">
                Join thousands of users who are saving hours every week with AI-powered social media automation.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={handleGetStarted}
                  className="bg-white text-primary-600 px-6 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                </button>
                <a
                  href="/auth/login"
                  className="text-white text-lg font-medium hover:text-primary-200"
                >
                  Sign In →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-300">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-gray-300">Terms</a>
            <a href="#" className="text-gray-400 hover:text-gray-300">Support</a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2025 Social Genie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
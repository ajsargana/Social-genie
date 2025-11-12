'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  SparklesIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  BoltIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) router.push('/dashboard')
      } catch (error) {}
    }
    checkAuth()
  }, [router])

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
      {/* Ultra Modern Background with Animated Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-3xl opacity-20 animate-float-slow"></div>
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-400 to-rose-600 rounded-full blur-3xl opacity-20 animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 right-1/3 w-[550px] h-[550px] bg-gradient-to-br from-purple-400 to-fuchsia-600 rounded-full blur-3xl opacity-20 animate-float-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Glass Navigation */}
      <nav className="relative z-50 sticky top-0">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Social Genie
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">How it Works</a>
              <a href="#pricing" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">Pricing</a>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-sm font-bold text-gray-700 hover:text-purple-600 transition-colors">
                Sign In
              </Link>
              <button
                onClick={() => router.push('/auth/login')}
                className="btn btn-primary btn-sm"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg mb-8 animate-fade-in">
              <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Trusted by 10,000+ creators worldwide
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              <span className="block animate-slide-up">Automate Your</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Social Media Magic
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              AI-powered content creation, intelligent scheduling, and multi-platform publishing.
              <span className="font-bold text-purple-600"> Transform your workflow </span>
              and grow your audience 10x faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => router.push('/auth/login')}
                className="btn btn-primary btn-sm sm:btn-lg group"
              >
                <RocketLaunchIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Creating for Free
              </button>
              <button className="btn btn-glass btn-sm sm:btn-lg group">
                <BoltIcon className="h-5 w-5 mr-2 text-purple-600" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[
                { value: '10M+', label: 'Posts Generated' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '15+', label: 'Platforms' },
                { value: '24/7', label: 'AI Support' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Everything You Need,
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                All in One Place
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you dominate social media
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: SparklesIcon,
                title: 'AI Content Generation',
                description: 'Generate engaging posts, captions, and hashtags with advanced AI in seconds',
                gradient: 'from-indigo-600 to-purple-600'
              },
              {
                icon: CalendarIcon,
                title: 'Smart Scheduling',
                description: 'Optimal posting times based on audience engagement patterns and analytics',
                gradient: 'from-purple-600 to-pink-600'
              },
              {
                icon: ChartBarIcon,
                title: 'Advanced Analytics',
                description: 'Track performance, engagement, and growth with comprehensive insights',
                gradient: 'from-pink-600 to-rose-600'
              },
              {
                icon: BoltIcon,
                title: 'Multi-Platform',
                description: 'Publish to Instagram, Twitter, LinkedIn, Facebook, and 10+ more platforms',
                gradient: 'from-blue-600 to-cyan-600'
              },
              {
                icon: RocketLaunchIcon,
                title: 'Automation Engine',
                description: 'Set it and forget it with intelligent automation workflows',
                gradient: 'from-violet-600 to-purple-600'
              },
              {
                icon: CheckCircleIcon,
                title: 'Brand Safety',
                description: 'AI-powered content review ensures brand consistency and safety',
                gradient: 'from-fuchsia-600 to-pink-600'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="card-feature group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="relative">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>

                  {/* Arrow */}
                  <div className="mt-4 inline-flex items-center text-sm font-bold text-purple-600 group-hover:translate-x-2 transition-transform">
                    Learn more
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent to-purple-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Get Started in
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Connect Your Accounts',
                description: 'Securely link all your social media platforms in minutes with our simple OAuth integration',
                gradient: 'from-indigo-600 to-purple-600'
              },
              {
                step: '02',
                title: 'Create with AI',
                description: 'Let our advanced AI generate stunning content tailored to your brand voice and audience',
                gradient: 'from-purple-600 to-pink-600'
              },
              {
                step: '03',
                title: 'Automate & Scale',
                description: 'Schedule, publish, and watch your engagement soar while you focus on growing your business',
                gradient: 'from-pink-600 to-rose-600'
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Step Number */}
                  <div className="relative flex-shrink-0">
                    <div className={`text-6xl sm:text-7xl font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-20`}>
                      {step.step}
                    </div>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center shadow-2xl`}>
                      <span className="text-xl sm:text-2xl font-black text-white">{step.step}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">{step.description}</p>
                  </div>
                </div>

                {/* Connector Line */}
                {i < 2 && (
                  <div className="hidden md:block absolute left-10 top-24 w-0.5 h-12 bg-gradient-to-b from-purple-300 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-12 lg:p-16">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

            {/* Content */}
            <div className="relative text-center text-white">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6">
                Ready to Transform Your Social Media?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                Join thousands of creators who are already growing their audience with AI-powered automation
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="bg-white text-purple-600 hover:bg-gray-50 font-bold px-6 sm:px-10 py-3 sm:py-5 rounded-2xl text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
                >
                  Start Free Trial - No Credit Card Required
                </button>
              </div>
              <p className="mt-6 text-sm text-white/70">
                ✓ Free 14-day trial  ✓ Cancel anytime  ✓ No setup fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Social Genie
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              © 2024 Social Genie. All rights reserved.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

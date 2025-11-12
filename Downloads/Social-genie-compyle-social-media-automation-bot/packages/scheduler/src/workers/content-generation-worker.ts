import { Job, Job } from 'bullmq';
import {
  JobData,
  JobResult,
  ContentCategory,
  ContentGenerationPreferences,
  User
} from '@social-genie/shared-types';
import { ContentGenerationService } from '@social-genie/ai-content';
import { db } from '@social-genie/database';
import { QueueManager } from '../queues/queue-manager';

interface ContentGenerationJobData extends JobData {
  userId: string;
  category: ContentCategory;
  platforms: string[];
  scheduledFor: Date;
  preferences: ContentGenerationPreferences;
  context?: Record<string, any>;
}

export class ContentGenerationWorker {
  private contentService: ContentGenerationService;
  private queueManager: QueueManager;

  constructor(queueManager: QueueManager) {
    this.contentService = new ContentGenerationService();
    this.queueManager = queueManager;
  }

  async process(job: Job<ContentGenerationJobData>): Promise<JobResult> {
    const { userId, category, platforms, scheduledFor, preferences, context } = job.data;

    try {
      console.log(`Generating content for user ${userId}, category ${category}`);

      // Get user information
      const user = await db('users').where('id', userId).first();
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Get social accounts for the user
      const socialAccounts = await db('social_accounts')
        .where('user_id', userId)
        .where('is_active', true)
        .whereIn('platform', platforms)
        .where('auto_post_enabled', true);

      if (socialAccounts.length === 0) {
        throw new Error('No active social accounts found for posting');
      }

      // Generate content for each platform
      const generatedContent = new Map();
      const errors: string[] = [];

      for (const socialAccount of socialAccounts) {
        try {
          const content = await this.contentService.generatePost(
            userId,
            category,
            socialAccount.platform,
            preferences,
            {
              ...context,
              platform: socialAccount.platform,
              username: socialAccount.platform_username
            }
          );

          generatedContent.set(socialAccount.platform, content);

          // Create content post in database
          const [contentPost] = await db('content_posts').insert({
            user_id: userId,
            title: context?.title || `${category} post`,
            content_text: content.content,
            hashtags: content.hashtags,
            media_urls: content.media_urls || [],
            media_type: content.media_urls?.length > 0 ? 'image' : 'text',
            ai_generated: true,
            content_category: category,
            engagement_data: {
              confidence_score: content.confidence_score,
              quality_score: content.quality_score
            },
            created_at: new Date(),
            updated_at: new Date()
          }).returning('*');

          // Create scheduled posts for each social account
          for (const account of socialAccounts.filter(acc => acc.platform === socialAccount.platform)) {
            await db('scheduled_posts').insert({
              content_post_id: contentPost.id,
              social_account_id: account.id,
              scheduled_at: scheduledFor,
              status: 'scheduled',
              retry_count: 0,
              max_retries: 3,
              created_at: new Date(),
              updated_at: new Date()
            });

            // Queue the social posting job
            await this.queueManager.addJob(
              'social-posting',
              'post-to-social',
              {
                type: 'social-posting',
                user_id: userId,
                data: {
                  scheduledPostId: contentPost.id,
                  socialAccountId: account.id,
                  platform: account.platform
                },
                priority: 10,
                max_attempts: 3
              },
              {
                delay: new Date(scheduledFor).getTime() - Date.now(),
                priority: 10
              }
            );
          }

        } catch (error) {
          const errorMsg = `Content generation failed for ${socialAccount.platform}: ${error.message}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      if (generatedContent.size === 0) {
        throw new Error(`Content generation failed for all platforms: ${errors.join(', ')}`);
      }

      // Queue analytics collection for the content
      const analyticsDelay = 5 * 60 * 1000; // 5 minutes after posting
      await this.queueManager.addJob(
        'analytics-collection',
        'collect-content-analytics',
        {
          type: 'analytics-collection',
          user_id: userId,
          data: {
            userId,
            category,
            generatedAt: new Date(),
            platforms: Array.from(generatedContent.keys())
          },
          priority: 1,
          max_attempts: 2
        },
        {
          delay: analyticsDelay,
          priority: 1
        }
      );

      return {
        success: true,
        data: {
          userId,
          category,
          platformsGenerated: Array.from(generatedContent.keys()),
          scheduledFor,
          totalPosts: generatedContent.size,
          errors: errors.length > 0 ? errors : undefined
        }
      };

    } catch (error) {
      console.error('Content generation job failed:', error);

      return {
        success: false,
        error: error.message,
        retry_count: job.attemptsMade + 1,
        next_retry_at: new Date(Date.now() + (Math.pow(2, job.attemptsMade) * 5000))
      };
    }
  }

  async generateFallbackContent(
    userId: string,
    category: ContentCategory,
    platform: string,
    preferences: ContentGenerationPreferences
  ): Promise<{
    content: string;
    hashtags: string[];
    confidence_score: number;
    quality_score: number;
  }> {
    // Emergency fallback content when AI generation fails
    const fallbacks = {
      daily_movie: {
        content: "Today's movie recommendation is a timeless classic that continues to captivate audiences. What films have left a lasting impression on you? #MovieRecommendation #ClassicFilms #Cinema",
        hashtags: ['movierecommendation', 'classicfilms', 'cinema', 'filmlover', 'movietime']
      },
      product_showcase: {
        content: "Discover something amazing today! Quality meets innovation in this exceptional offering. Perfect for those who appreciate the finer things. #ProductSpotlight #Quality #Innovation",
        hashtags: ['productspotlight', 'quality', 'innovation', 'amazing', 'discovery']
      },
      daily_quote: {
        content: "Every day brings new opportunities for growth and success. Embrace the journey, learn from experiences, and never stop believing in your potential. #Motivation #Success #GrowthMindset",
        hashtags: ['motivation', 'success', 'growthmindset', 'inspiration', 'believe']
      },
      educational: {
        content: "Learning is a lifelong adventure. Today, let's explore something new and expand our horizons. What are you curious about? #Learning #Education #Knowledge",
        hashtags: ['learning', 'education', 'knowledge', 'curiosity', 'growth']
      },
      entertainment: {
        content: "Time for some entertainment! Whether it's music, movies, or games, taking time to enjoy what we love is essential. What's your favorite way to unwind? #Entertainment #Fun #Relax",
        hashtags: ['entertainment', 'fun', 'relax', 'leisure', 'enjoy']
      }
    };

    const fallback = fallbacks[category] || fallbacks.educational;

    return {
      content: fallback.content,
      hashtags: fallback.hashtags.slice(0, preferences.hashtag_count || 10),
      confidence_score: 5,
      quality_score: 6
    };
  }

  async validateContentQuality(content: {
    content: string;
    hashtags: string[];
    confidence_score: number;
    quality_score: number;
  }): Promise<boolean> {
    // Basic quality validation
    if (content.content.length < 10) {
      return false;
    }

    if (content.hashtags.length === 0) {
      return false;
    }

    if (content.confidence_score < 3 || content.quality_score < 4) {
      return false;
    }

    // Check for appropriate content length
    if (content.content.length > 5000) {
      return false;
    }

    return true;
  }
}

export function createContentGenerationWorker(queueManager: QueueManager): ContentGenerationWorker {
  return new ContentGenerationWorker(queueManager);
}
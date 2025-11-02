import * as cron from 'cron';
import { QueueManager } from '../queues/queue-manager';
import { ContentGenerationWorker } from '../workers/content-generation-worker';
import {
  ContentCategory,
  ContentGenerationPreferences,
  User
} from '@social-genie/shared-types';
import { db } from '@social-genie/database';

export class ContentScheduler {
  private queueManager: QueueManager;
  private contentWorker: ContentGenerationWorker;
  private jobs: cron.CronJob[] = [];

  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
    this.contentWorker = new ContentGenerationWorker(queueManager);
  }

  start(): void {
    this.setupDailyContentGeneration();
    this.setupTokenRefresh();
    this.setupAnalyticsCleanup();
    this.setupPerformanceOptimization();
    this.setupEngagementMonitoring();

    console.log('Content scheduler started');
  }

  stop(): void {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('Content scheduler stopped');
  }

  private setupDailyContentGeneration(): void {
    // Generate content for each user at their optimal time
    const job = new cron.CronJob('0 * * * *', async () => { // Every hour
      try {
        console.log('Running daily content generation check...');

        const users = await db('users')
          .whereRaw("jsonb_extract_path_text(preferences, 'automation', 'enabled') = 'true'")
          .where('preferences', 'not like', '%automation%') // Include users without automation settings
          .orWhereRaw("jsonb_extract_path_text(preferences, 'automation', 'enabled') IS NULL");

        for (const user of users) {
          await this.processUserContentGeneration(user);
        }

        console.log(`Processed content generation for ${users.length} users`);

      } catch (error) {
        console.error('Daily content generation failed:', error);
      }
    });

    job.start();
    this.jobs.push(job);
  }

  private async processUserContentGeneration(user: User): Promise<void> {
    try {
      const preferences = user.preferences;
      const currentTime = new Date().getHours();
      const optimalTime = this.calculateOptimalPostingTime(user.timezone, preferences);

      if (currentTime !== optimalTime) {
        return; // Not the optimal time for this user
      }

      // Get user's active social accounts
      const socialAccounts = await db('social_accounts')
        .where('user_id', user.id)
        .where('is_active', true)
        .where('auto_post_enabled', true);

      if (socialAccounts.length === 0) {
        return; // No active accounts
      }

      // Get user's content categories
      const contentCategories = preferences.content_categories || ['daily_movie', 'daily_quote'];
      const contentPreferences = preferences.content_generation || {
        tone: 'friendly',
        length: 'medium',
        include_media: true,
        media_type: 'image',
        auto_hashtags: true,
        hashtag_count: 10
      };

      // Generate content for each category
      for (const category of contentCategories as ContentCategory[]) {
        await this.queueContentGeneration(user.id, category, socialAccounts, contentPreferences);
      }

    } catch (error) {
      console.error(`Content generation failed for user ${user.id}:`, error);
    }
  }

  private async queueContentGeneration(
    userId: string,
    category: ContentCategory,
    socialAccounts: any[],
    preferences: ContentGenerationPreferences
  ): Promise<void> {
    const platforms = socialAccounts.map(account => account.platform);
    const scheduledTime = this.calculateNextOptimalTime(preferences, socialAccounts);

    // Add random delay to prevent all users from posting at the same time
    const randomDelay = Math.floor(Math.random() * 1800000); // 0-30 minutes

    await this.queueManager.addJob(
      'content-generation',
      'generate-daily-content',
      {
        type: 'content-generation',
        userId,
        data: {
          userId,
          category,
          platforms,
          scheduledFor: new Date(scheduledTime.getTime() + randomDelay),
          preferences
        },
        priority: 5,
        max_attempts: 3
      },
      {
        delay: randomDelay,
        priority: 5
      }
    );
  }

  private setupTokenRefresh(): void {
    // Check and refresh tokens daily at 2 AM
    const job = new cron.CronJob('0 2 * * *', async () => {
      try {
        console.log('Running token refresh check...');

        const expiringTokens = await db('social_accounts')
          .where('token_expires_at', '<=', db.raw('NOW() + INTERVAL \'7 days\''))
          .where('refresh_token_encrypted', 'NOT NULL')
          .where('is_active', true);

        for (const account of expiringTokens) {
          await this.queueManager.addJob(
            'token-refresh',
            'refresh-social-token',
            {
              type: 'token-refresh',
              user_id: account.user_id,
              data: {
                socialAccountId: account.id,
                platform: account.platform
              },
              priority: 8,
              max_attempts: 2
            },
            {
              delay: Math.floor(Math.random() * 3600000), // Spread over 1 hour
              priority: 8
            }
          );
        }

        console.log(`Queued token refresh for ${expiringTokens.length} accounts`);

      } catch (error) {
        console.error('Token refresh scheduling failed:', error);
      }
    });

    job.start();
    this.jobs.push(job);
  }

  private setupAnalyticsCleanup(): void {
    // Clean up old analytics data weekly
    const job = new cron.CronJob('0 3 * * 0', async () => { // Sunday 3 AM
      try {
        console.log('Running analytics cleanup...');

        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 6); // Keep 6 months

        const [deletedAnalytics, deletedLogs] = await Promise.all([
          db('post_analytics')
            .where('recorded_at', '<', cutoffDate)
            .del(),
          db('ai_generation_logs')
            .where('created_at', '<', cutoffDate)
            .del()
        ]);

        console.log(`Cleaned up ${deletedAnalytics} analytics records and ${deletedLogs} AI generation logs`);

      } catch (error) {
        console.error('Analytics cleanup failed:', error);
      }
    });

    job.start();
    this.jobs.push(job);
  }

  private setupPerformanceOptimization(): void {
    // Optimize content strategies based on performance data
    const job = new cron.CronJob('0 4 * * *', async () => { // Daily 4 AM
      try {
        console.log('Running performance optimization...');

        // This would analyze performance data and adjust strategies
        // For now, it's a placeholder for future implementation

        console.log('Performance optimization completed');

      } catch (error) {
        console.error('Performance optimization failed:', error);
      }
    });

    job.start();
    this.jobs.push(job);
  }

  private setupEngagementMonitoring(): void {
    // Monitor engagement for recent posts
    const job = new cron.CronJob('*/15 * * * *', async () => { // Every 15 minutes
      try {
        // Find posts that need engagement monitoring
        const recentPosts = await db('scheduled_posts')
          .join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
          .where('scheduled_posts.status', 'posted')
          .where('scheduled_posts.posted_at', '>=', db.raw('NOW() - INTERVAL \'24 hours\''))
          .where('social_accounts.auto_reply_enabled', true)
          .whereNotExists(
            db('comments')
              .where('social_account_id', db.raw('social_accounts.id'))
              .where('auto_reply_sent', true)
              .where('created_at', '>=', db.raw('scheduled_posts.posted_at'))
          );

        for (const post of recentPosts) {
          await this.queueManager.addJob(
            'engagement-monitoring',
            'monitor-post-engagement',
            {
              type: 'engagement-monitoring',
              user_id: post.user_id,
              data: {
                scheduledPostId: post.id,
                platform: post.platform,
                platformPostId: post.platform_post_id,
                lastCheck: post.posted_at
              },
              priority: 3,
              max_attempts: 3
            },
            {
              priority: 3
            }
          );
        }

      } catch (error) {
        console.error('Engagement monitoring failed:', error);
      }
    });

    job.start();
    this.jobs.push(job);
  }

  private calculateOptimalPostingTime(timezone: string, preferences: any): number {
    // Algorithm to determine optimal posting time based on user's timezone and preferences
    const userHour = this.getUserLocalHour(timezone);

    // Default optimal times based on general social media research
    const optimalTimes = {
      business: [9, 12, 15], // 9 AM, 12 PM, 3 PM
      consumer: [8, 13, 19], // 8 AM, 1 PM, 7 PM
      global: [6, 12, 18]    // 6 AM, 12 PM, 6 PM
    };

    const userCategory = preferences?.account_type || 'consumer';
    const times = optimalTimes[userCategory] || optimalTimes.consumer;

    // Select a random optimal time for variety
    return times[Math.floor(Math.random() * times.length)];
  }

  private getUserLocalHour(timezone: string): number {
    // Simple timezone handling - in production, use a proper timezone library
    const utcHour = new Date().getUTCHours();

    // Basic timezone offset mapping
    const timezoneOffsets: Record<string, number> = {
      'UTC': 0,
      'EST': -5,
      'EDT': -4,
      'CST': -6,
      'CDT': -5,
      'MST': -7,
      'MDT': -6,
      'PST': -8,
      'PDT': -7,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Europe/Berlin': 1,
      'Asia/Tokyo': 9,
      'Asia/Shanghai': 8,
      'Australia/Sydney': 11
    };

    const offset = timezoneOffsets[timezone] || 0;
    let localHour = utcHour + offset;

    // Wrap around 24-hour clock
    if (localHour < 0) localHour += 24;
    if (localHour >= 24) localHour -= 24;

    return localHour;
  }

  private calculateNextOptimalTime(
    preferences: ContentGenerationPreferences,
    socialAccounts: any[]
  ): Date {
    const now = new Date();
    const optimalHour = this.calculateOptimalPostingTime(
      socialAccounts[0]?.timezone || 'UTC',
      { account_type: preferences.account_type || 'consumer' }
    );

    // Calculate the next optimal time
    let nextOptimal = new Date();
    nextOptimal.setHours(optimalHour, 0, 0, 0);

    // If the optimal time has passed today, schedule for tomorrow
    if (nextOptimal <= now) {
      nextOptimal.setDate(nextOptimal.getDate() + 1);
    }

    // Add random minutes to avoid exact hour posting
    nextOptimal.setMinutes(Math.floor(Math.random() * 60));

    return nextOptimal;
  }
}
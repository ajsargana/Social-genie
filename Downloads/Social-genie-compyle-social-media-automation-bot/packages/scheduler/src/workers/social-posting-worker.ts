import { Job, Job } from 'bullmq';
import {
  JobData,
  JobResult,
  ScheduledPost,
  SocialAccount,
  SocialMediaError
} from '@social-genie/shared-types';
import { PlatformIntegrationFactory } from '@social-genie/social-integrations';
import { db } from '@social-genie/database';
import { QueueManager } from '../queues/queue-manager';

interface SocialPostingJobData extends JobData {
  scheduledPostId: string;
  socialAccountId: string;
  platform: string;
}

export class SocialPostingWorker {
  private queueManager: QueueManager;

  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
  }

  async process(job: Job<SocialPostingJobData>): Promise<JobResult> {
    const { scheduledPostId, socialAccountId, platform } = job.data;

    try {
      console.log(`Posting to ${platform} for scheduled post ${scheduledPostId}`);

      // Get scheduled post with related data
      const scheduledPost = await db('scheduled_posts')
        .select(
          'scheduled_posts.*',
          'content_posts.*',
          'social_accounts.platform',
          'social_accounts.access_token_encrypted',
          'social_accounts.refresh_token_encrypted',
          'social_accounts.platform_username',
          'social_accounts.daily_post_limit'
        )
        .join('content_posts', 'scheduled_posts.content_post_id', 'content_posts.id')
        .join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
        .where('scheduled_posts.id', scheduledPostId)
        .first();

      if (!scheduledPost) {
        throw new Error(`Scheduled post not found: ${scheduledPostId}`);
      }

      if (scheduledPost.status !== 'scheduled') {
        throw new Error(`Post is not in scheduled status: ${scheduledPost.status}`);
      }

      // Check daily post limits
      const today = new Date().toISOString().split('T')[0];
      const postsToday = await db('scheduled_posts')
        .where('social_account_id', socialAccountId)
        .where('status', 'posted')
        .where('posted_at', '>=', today)
        .count('* as count');

      if (parseInt(postsToday[0].count) >= scheduledPost.daily_post_limit) {
        throw new Error(`Daily post limit exceeded for ${platform}`);
      }

      // Create platform integration
      const integration = PlatformIntegrationFactory.create({
        platform: platform as any
      });

      // Post to social platform
      const result = await integration.postContent(scheduledPost);

      if (result.error) {
        throw new Error(`Platform posting failed: ${result.error.message}`);
      }

      // Update scheduled post with success
      await db('scheduled_posts')
        .where('id', scheduledPostId)
        .update({
          status: 'posted',
          posted_at: new Date(),
          platform_post_id: result.platform_post_id,
          platform_response: result.response,
          updated_at: new Date()
        });

      // Queue analytics collection
      await this.queueManager.addJob(
        'analytics-collection',
        'collect-post-analytics',
        {
          type: 'analytics-collection',
          user_id: scheduledPost.user_id,
          data: {
            scheduledPostId,
            platform,
            platformPostId: result.platform_post_id,
            collectionType: 'initial'
          },
          priority: 1,
          max_attempts: 2
        },
        {
          delay: 5 * 60 * 1000, // 5 minutes after posting
          priority: 1
        }
      );

      // Queue engagement monitoring
      await this.queueManager.addJob(
        'engagement-monitoring',
        'monitor-engagement',
        {
          type: 'engagement-monitoring',
          user_id: scheduledPost.user_id,
          data: {
            scheduledPostId,
            platform,
            platformPostId: result.platform_post_id,
            interval: 60000, // Check every minute for first hour
            monitoringDuration: 3600000 // Monitor for 1 hour
          },
          priority: 3,
          max_attempts: 3
        },
        {
          delay: 60000, // Start monitoring 1 minute after posting
          priority: 3
        }
      );

      return {
        success: true,
        data: {
          scheduledPostId,
          platform,
          platformPostId: result.platform_post_id,
          postedAt: new Date(),
          response: result.response
        }
      };

    } catch (error) {
      console.error(`Social posting failed for post ${scheduledPostId}:`, error);

      // Update scheduled post with error
      await db('scheduled_posts')
        .where('id', scheduledPostId)
        .update({
          status: 'failed',
          error_message: error.message,
          retry_count: job.attemptsMade + 1,
          next_retry_at: this.calculateNextRetry(job.attemptsMade),
          updated_at: new Date()
        });

      return {
        success: false,
        error: error.message,
        retry_count: job.attemptsMade + 1,
        next_retry_at: this.calculateNextRetry(job.attemptsMade)
      };
    }
  }

  private calculateNextRetry(attemptsMade: number): Date {
    // Exponential backoff with jitter
    const baseDelay = 5 * 60 * 1000; // 5 minutes
    const maxDelay = 60 * 60 * 1000; // 1 hour
    const jitter = Math.random() * 0.5; // 0-50% jitter

    const delay = Math.min(
      baseDelay * Math.pow(2, attemptsMade) * (1 + jitter),
      maxDelay
    );

    return new Date(Date.now() + delay);
  }

  async handleRetry(scheduledPostId: string, error: SocialMediaError): Promise<{
    shouldRetry: boolean;
    nextRetryTime?: Date;
    fallbackStrategy?: string;
  }> {
    const scheduledPost = await db('scheduled_posts')
      .where('id', scheduledPostId)
      .first();

    if (!scheduledPost) {
      return { shouldRetry: false };
    }

    // Check retry limit
    if (scheduledPost.retry_count >= scheduledPost.max_retries) {
      return { shouldRetry: false };
    }

    // Determine retry strategy based on error
    switch (error.suggested_action) {
      case 'retry':
        return {
          shouldRetry: true,
          nextRetryTime: this.calculateNextRetry(scheduledPost.retry_count)
        };

      case 'manual_review':
        // Don't retry automatically, flag for manual review
        await db('scheduled_posts')
          .where('id', scheduledPostId)
          .update({
            status: 'failed',
            error_message: `Manual review required: ${error.message}`,
            updated_at: new Date()
          });
        return { shouldRetry: false };

      case 'skip':
        // Skip this platform but try others
        return { shouldRetry: false, fallbackStrategy: 'skip_platform' };

      case 'change_platform':
        // Try posting to a different platform
        return { shouldRetry: false, fallbackStrategy: 'alternate_platform' };

      default:
        // Default to retry with exponential backoff
        return {
          shouldRetry: true,
          nextRetryTime: this.calculateNextRetry(scheduledPost.retry_count)
        };
    }
  }

  async handleFallbackStrategy(
    scheduledPostId: string,
    strategy: string
  ): Promise<void> {
    const scheduledPost = await db('scheduled_posts')
      .select('scheduled_posts.*', 'content_posts.*')
      .join('content_posts', 'scheduled_posts.content_post_id', 'content_posts.id')
      .where('scheduled_posts.id', scheduledPostId)
      .first();

    if (!scheduledPost) {
      return;
    }

    switch (strategy) {
      case 'skip_platform':
        // Mark as skipped for this platform
        await db('scheduled_posts')
          .where('id', scheduledPostId)
          .update({
            status: 'cancelled',
            error_message: 'Skipped due to platform issues',
            updated_at: new Date()
          });
        break;

      case 'alternate_platform':
        // Try posting to an alternative platform
        const alternativePlatforms = await db('social_accounts')
          .where('user_id', scheduledPost.user_id)
          .where('is_active', true)
          .where('auto_post_enabled', true)
          .whereNot('platform', scheduledPost.platform);

        if (alternativePlatforms.length > 0) {
          const altPlatform = alternativePlatforms[0];

          // Create new scheduled post for alternative platform
          await db('scheduled_posts').insert({
            content_post_id: scheduledPost.content_post_id,
            social_account_id: altPlatform.id,
            scheduled_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
            status: 'scheduled',
            retry_count: 0,
            max_retries: 3,
            created_at: new Date(),
            updated_at: new Date()
          });

          // Mark original as cancelled
          await db('scheduled_posts')
            .where('id', scheduledPostId)
            .update({
              status: 'cancelled',
              error_message: `Reposted to ${altPlatform.platform} due to ${scheduledPost.platform} issues`,
              updated_at: new Date()
            });
        }
        break;

      case 'text_only':
        // Retry with text only (no media)
        if (scheduledPost.media_urls && scheduledPost.media_urls.length > 0) {
          await db('content_posts')
            .where('id', scheduledPost.content_post_id)
            .update({
              media_urls: [],
              media_type: 'text',
              updated_at: new Date()
            });

          // Reset scheduled post for retry
          await db('scheduled_posts')
            .where('id', scheduledPostId)
            .update({
              status: 'scheduled',
              error_message: null,
              retry_count: 0,
              next_retry_at: new Date(Date.now() + 5 * 60 * 1000),
              updated_at: new Date()
            });
        }
        break;
    }
  }
}

export function createSocialPostingWorker(queueManager: QueueManager): SocialPostingWorker {
  return new SocialPostingWorker(queueManager);
}
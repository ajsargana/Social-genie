import dotenv from 'dotenv';
import { QueueManager, defaultQueueConfigs } from './queues/queue-manager';
import { ContentGenerationWorker, createContentGenerationWorker } from './workers/content-generation-worker';
import { SocialPostingWorker, createSocialPostingWorker } from './workers/social-posting-worker';
import { ContentScheduler } from './cron/content-scheduler';

// Load environment variables
dotenv.config();

class SchedulerWorker {
  private queueManager: QueueManager;
  private contentWorker: ContentGenerationWorker;
  private socialPostingWorker: SocialPostingWorker;
  private contentScheduler: ContentScheduler;

  constructor() {
    this.queueManager = new QueueManager();
    this.contentWorker = createContentGenerationWorker(this.queueManager);
    this.socialPostingWorker = createSocialPostingWorker(this.queueManager);
    this.contentScheduler = new ContentScheduler(this.queueManager);
  }

  async start(): Promise<void> {
    try {
      console.log('Starting Social Genie Scheduler Worker...');

      // Initialize Redis connection
      await this.queueManager.createQueue(defaultQueueConfigs['content-generation']);
      await this.queueManager.createQueue(defaultQueueConfigs['social-posting']);
      await this.queueManager.createQueue(defaultQueueConfigs['analytics-collection']);
      await this.queueManager.createQueue(defaultQueueConfigs['engagement-monitoring']);
      await this.queueManager.createQueue(defaultQueueConfigs['token-refresh']);

      // Create workers
      await this.queueManager.createWorker(
        'content-generation',
        (job) => this.contentWorker.process(job),
        {
          concurrency: defaultQueueConfigs['content-generation'].concurrency!,
          limiter: defaultQueueConfigs['content-generation'].limiter
        }
      );

      await this.queueManager.createWorker(
        'social-posting',
        (job) => this.socialPostingWorker.process(job),
        {
          concurrency: defaultQueueConfigs['social-posting'].concurrency!,
          limiter: defaultQueueConfigs['social-posting'].limiter
        }
      );

      await this.queueManager.createWorker(
        'analytics-collection',
        async (job) => {
          console.log('Processing analytics collection job:', job.id);
          // Placeholder for analytics collection worker
          return { success: true, data: { message: 'Analytics collection completed' } };
        },
        {
          concurrency: defaultQueueConfigs['analytics-collection'].concurrency!,
          limiter: defaultQueueConfigs['analytics-collection'].limiter
        }
      );

      await this.queueManager.createWorker(
        'engagement-monitoring',
        async (job) => {
          console.log('Processing engagement monitoring job:', job.id);
          // Placeholder for engagement monitoring worker
          return { success: true, data: { message: 'Engagement monitoring completed' } };
        },
        {
          concurrency: defaultQueueConfigs['engagement-monitoring'].concurrency!,
          limiter: defaultQueueConfigs['engagement-monitoring'].limiter
        }
      );

      await this.queueManager.createWorker(
        'token-refresh',
        async (job) => {
          console.log('Processing token refresh job:', job.id);
          // Placeholder for token refresh worker
          return { success: true, data: { message: 'Token refresh completed' } };
        },
        {
          concurrency: defaultQueueConfigs['token-refresh'].concurrency!,
          limiter: defaultQueueConfigs['token-refresh'].limiter
        }
      );

      // Start cron jobs
      this.contentScheduler.start();

      console.log('Scheduler worker started successfully');

      // Set up health check
      this.setupHealthCheck();

    } catch (error) {
      console.error('Failed to start scheduler worker:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      console.log('Stopping scheduler worker...');

      this.contentScheduler.stop();
      await this.queueManager.close();

      console.log('Scheduler worker stopped successfully');
    } catch (error) {
      console.error('Error stopping scheduler worker:', error);
    }
  }

  private setupHealthCheck(): void {
    setInterval(async () => {
      try {
        const health = await this.queueManager.getQueueHealth();

        if (health.overallHealth < 70) {
          console.warn('Queue health degraded:', health);
        }

        // Log health status
        console.log(`Queue health: ${health.overallHealth.toFixed(1)}% - ${health.queues.length} queues active`);

      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 60000); // Check every minute
  }

  async getHealthStatus(): Promise<any> {
    return {
      timestamp: new Date(),
      status: 'running',
      queues: await this.queueManager.getQueueHealth(),
      cronJobs: {
        contentScheduler: this.contentScheduler ? 'running' : 'stopped'
      }
    };
  }
}

// Create and start the worker
const worker = new SchedulerWorker();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await worker.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await worker.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  worker.stop().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the worker
worker.start().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});

export default SchedulerWorker;
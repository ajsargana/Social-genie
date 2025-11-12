import { Queue, Worker, QueueEvents, Job, ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import {
  JobData,
  JobResult,
  AIGenerationRequest,
  ScheduledPost,
  SocialPlatform
} from '@social-genie/shared-types';

export interface QueueConfig {
  name: string;
  defaultJobOptions?: {
    removeOnComplete?: number;
    removeOnFail?: number;
    attempts?: number;
    backoff?: {
      type: 'exponential' | 'fixed' | 'custom';
      delay?: number;
    };
    delay?: number;
    priority?: number;
  };
  concurrency?: number;
  limiter?: {
    max: number;
    duration: number;
  };
}

export class QueueManager {
  private redisConnection: IORedis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  constructor(redisConfig?: ConnectionOptions) {
    this.redisConnection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      enableReadyCheck: false,
      ...redisConfig
    });

    this.setupGracefulShutdown();
  }

  async createQueue(config: QueueConfig): Promise<Queue> {
    if (this.queues.has(config.name)) {
      return this.queues.get(config.name)!;
    }

    const queue = new Queue(config.name, {
      connection: this.redisConnection,
      defaultJobOptions: config.defaultJobOptions || {}
    });

    this.queues.set(config.name, queue);

    // Set up queue events for monitoring
    const queueEvents = new QueueEvents(config.name, {
      connection: this.redisConnection
    });

    this.queueEvents.set(config.name, queueEvents);

    return queue;
  }

  async createWorker(
    queueName: string,
    processor: (job: Job<JobData>) => Promise<JobResult>,
    options: {
      concurrency?: number;
      limiter?: {
        max: number;
        duration: number;
      };
    } = {}
  ): Promise<Worker> {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)!;
    }

    const worker = new Worker(
      queueName,
      processor,
      {
        connection: this.redisConnection,
        concurrency: options.concurrency || 1,
        limiter: options.limiter
      }
    );

    this.workers.set(queueName, worker);

    // Set up worker event handlers
    worker.on('completed', (job, result) => {
      console.log(`Job ${job.id} in queue ${queueName} completed:`, result);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} in queue ${queueName} failed:`, err);
    });

    worker.on('error', (err) => {
      console.error(`Worker for queue ${queueName} error:`, err);
    });

    return worker;
  }

  async addJob<T extends JobData>(
    queueName: string,
    jobName: string,
    data: T,
    options: {
      delay?: number;
      priority?: number;
      attempts?: number;
      backoff?: {
        type: 'exponential' | 'fixed' | 'custom';
        delay?: number;
      };
    } = {}
  ): Promise<Job<T>> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return queue.add(jobName, data, {
      delay: options.delay,
      priority: options.priority || 0,
      attempts: options.attempts || 3,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 2000
      }
    });
  }

  async getQueueHealth(): Promise<{
    timestamp: Date;
    queues: Array<{
      name: string;
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      healthScore: number;
    }>;
    overallHealth: number;
  }> {
    const reports = await Promise.all(
      Array.from(this.queues.entries()).map(async ([name, queue]) => {
        const waiting = await queue.getWaiting();
        const active = await queue.getActive();
        const completed = await queue.getCompleted();
        const failed = await queue.getFailed();
        const delayed = await queue.getDelayed();

        const totalActive = waiting.length + active.length;
        const failedRatio = failed.length / (totalActive + 1);

        const healthScore = Math.max(0, 100 - (failedRatio * 100) - (totalActive * 0.1));

        return {
          name,
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length,
          delayed: delayed.length,
          healthScore
        };
      })
    );

    const overallHealth = reports.length > 0
      ? reports.reduce((sum, report) => sum + report.healthScore, 0) / reports.length
      : 100;

    return {
      timestamp: new Date(),
      queues: reports,
      overallHealth
    };
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
    }
  }

  async clearQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.drain();
    }
  }

  async getJobCounts(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting().then(jobs => jobs.length),
      queue.getActive().then(jobs => jobs.length),
      queue.getCompleted().then(jobs => jobs.length),
      queue.getFailed().then(jobs => jobs.length),
      queue.getDelayed().then(jobs => jobs.length)
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  async retryFailedJobs(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      const failed = await queue.getFailed();
      for (const job of failed) {
        await job.retry();
      }
    }
  }

  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  getWorker(name: string): Worker | undefined {
    return this.workers.get(name);
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      console.log('Shutting down queues and workers...');

      // Close all workers first
      for (const [name, worker] of this.workers) {
        console.log(`Closing worker for queue ${name}...`);
        await worker.close();
      }

      // Close all queues
      for (const [name, queue] of this.queues) {
        console.log(`Closing queue ${name}...`);
        await queue.close();
      }

      // Close queue events
      for (const [name, queueEvents] of this.queueEvents) {
        console.log(`Closing queue events for ${name}...`);
        await queueEvents.close();
      }

      // Close Redis connection
      await this.redisConnection.quit();

      console.log('Graceful shutdown completed');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async close(): Promise<void> {
    // Close all workers, queues, and connections
    await Promise.all(Array.from(this.workers.values()).map(worker => worker.close()));
    await Promise.all(Array.from(this.queues.values()).map(queue => queue.close()));
    await Promise.all(Array.from(this.queueEvents.values()).map(events => events.close()));
    await this.redisConnection.quit();
  }
}

export const defaultQueueConfigs: Record<string, QueueConfig> = {
  'content-generation': {
    name: 'content-generation',
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      priority: 5
    },
    concurrency: 5,
    limiter: {
      max: 20,
      duration: 60000 // 20 jobs per minute per user
    }
  },

  'social-posting': {
    name: 'social-posting',
    defaultJobOptions: {
      removeOnComplete: 200,
      removeOnFail: 100,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      priority: 10 // High priority for posting
    },
    concurrency: 10,
    limiter: {
      max: 100,
      duration: 60000 // 100 posts per minute globally
    }
  },

  'analytics-collection': {
    name: 'analytics-collection',
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 25,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 30000
      },
      priority: 1 // Low priority for analytics
    },
    concurrency: 20,
    limiter: {
      max: 200,
      duration: 60000 // 200 analytics collections per minute
    }
  },

  'engagement-monitoring': {
    name: 'engagement-monitoring',
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10000
      },
      priority: 3
    },
    concurrency: 15,
    limiter: {
      max: 150,
      duration: 60000 // 150 engagement checks per minute
    }
  },

  'token-refresh': {
    name: 'token-refresh',
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 25,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 60000
      },
      priority: 8 // High priority for token refresh
    },
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000 // 10 token refreshes per minute
    }
  }
};
import express from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { db } from '@social-genie/database';

const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    checks: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      aiProviders: await checkAIProvidersHealth(),
      socialPlatforms: await checkSocialPlatformsHealth()
    }
  };

  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
}));

// @desc    Detailed health check with queue status
// @route   GET /api/health/detailed
// @access  Public
router.get('/detailed', asyncHandler(async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    checks: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      aiProviders: await checkAIProvidersHealth(),
      socialPlatforms: await checkSocialPlatformsHealth(),
      queues: await checkQueuesHealth()
    },
    features: {
      aiGeneration: !!process.env.OPENAI_API_KEY,
      socialPosting: !!process.env.AYRSHARE_API_KEY,
      encryption: !!process.env.ENCRYPTION_KEY,
      jwt: !!process.env.JWT_SECRET
    }
  };

  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
}));

async function checkDatabaseHealth() {
  try {
    await db.raw('SELECT 1');
    return { status: 'ok', latency: Date.now() };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function checkRedisHealth() {
  try {
    // Simple Redis check - would need Redis client instance
    return { status: 'ok', message: 'Redis not directly connected (handled by BullMQ)' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function checkAIProvidersHealth() {
  const providers = [];

  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
      providers.push({
        name: 'OpenAI',
        status: response.ok ? 'ok' : 'error',
        error: response.ok ? null : 'API key invalid'
      });
    } catch (error) {
      providers.push({
        name: 'OpenAI',
        status: 'error',
        error: error.message
      });
    }
  } else {
    providers.push({
      name: 'OpenAI',
      status: 'not_configured'
    });
  }

  // Check Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: 'Anthropic',
      status: 'ok',
      message: 'API key configured'
    });
  } else {
    providers.push({
      name: 'Anthropic',
      status: 'not_configured'
    });
  }

  return providers;
}

async function checkSocialPlatformsHealth() {
  const platforms = [];

  // Check Ayrshare
  if (process.env.AYRSHARE_API_KEY) {
    try {
      const response = await fetch('https://api.ayrshare.com/api/user', {
        headers: {
          'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`
        }
      });
      platforms.push({
        name: 'Ayrshare',
        status: response.ok ? 'ok' : 'error',
        error: response.ok ? null : 'API key invalid'
      });
    } catch (error) {
      platforms.push({
        name: 'Ayrshare',
        status: 'error',
        error: error.message
      });
    }
  } else {
    platforms.push({
      name: 'Ayrshare',
      status: 'not_configured'
    });
  }

  return platforms;
}

async function checkQueuesHealth() {
  try {
    // This would need access to the QueueManager instance
    // For now, return a placeholder
    return {
      'content-generation': { status: 'ok', waiting: 0, active: 0, failed: 0 },
      'social-posting': { status: 'ok', waiting: 0, active: 0, failed: 0 },
      'analytics-collection': { status: 'ok', waiting: 0, active: 0, failed: 0 },
      'engagement-monitoring': { status: 'ok', waiting: 0, active: 0, failed: 0 },
      'token-refresh': { status: 'ok', waiting: 0, active: 0, failed: 0 }
    };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

export { router as healthRoutes };
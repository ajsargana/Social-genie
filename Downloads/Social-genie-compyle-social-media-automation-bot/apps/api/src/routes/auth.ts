import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { CustomError, asyncHandler } from '../middleware/errorHandler';
import { validate, schemas } from '../middleware/validation';
import { generateToken, sendTokenResponse, AuthenticatedRequest } from '../middleware/auth';
import { db } from '@social-genie/database';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validate(schemas.register), asyncHandler(async (req, res, next) => {
  const { email, password, name } = req.body;

  // Check if user exists
  const existingUser = await db('users').where('email', email).first();
  if (existingUser) {
    return next(new CustomError('User already exists', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const [user] = await db('users').insert({
    id: uuidv4(),
    email,
    password_hash: passwordHash,
    name,
    timezone: 'UTC',
    preferences: {
      content_categories: ['daily_movie', 'daily_quote'],
      content_generation: {
        tone: 'friendly',
        length: 'medium',
        include_media: true,
        media_type: 'image',
        auto_hashtags: true,
        hashtag_count: 10
      },
      account_type: 'consumer',
      notification_settings: {
        email_notifications: true,
        post_success: true,
        post_failure: true,
        weekly_analytics: true,
        ai_insights: false
      },
      ai_preferences: {
        preferred_provider: 'openai',
        creativity_level: 7,
        brand_voice: undefined,
        forbidden_topics: []
      },
      automation: {
        enabled: false,
        daily_post_limit: 1,
        posting_schedule: {
          timezone: 'UTC',
          optimal_times: [9, 12, 15],
          days_of_week: [1, 2, 3, 4, 5],
          min_interval_hours: 2,
          max_interval_hours: 6
        },
        content_mix: {
          daily_movie: 40,
          product_showcase: 10,
          daily_quote: 30,
          educational: 10,
          promotional: 5,
          custom: 5
        },
        auto_reply_settings: {
          enabled: false,
          reply_delay_minutes: 5,
          sentiment_threshold: 0.3,
          reply_tone: 'friendly',
          max_replies_per_post: 3,
          keyword_triggers: []
        },
        performance_optimization: false
      }
    },
    created_at: new Date(),
    updated_at: new Date()
  }).returning('*');

  sendTokenResponse(user, 201, res);
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validate(schemas.login), asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await db('users').where('email', email).first();
  if (!user) {
    return next(new CustomError('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return next(new CustomError('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
}));

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const user = req.user;

  // Get user's social accounts
  const socialAccounts = await db('social_accounts')
    .where('user_id', user.id)
    .where('is_active', true)
    .select('id', 'platform', 'platform_username', 'is_active', 'auto_post_enabled', 'auto_reply_enabled');

  res.json({
    success: true,
    user: {
      ...user,
      social_accounts: socialAccounts
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { name, avatar_url, timezone, preferences } = req.body;
  const userId = req.user.id;

  // Update user
  const [user] = await db('users')
    .where('id', userId)
    .update({
      ...(name && { name }),
      ...(avatar_url && { avatar_url }),
      ...(timezone && { timezone }),
      ...(preferences && { preferences }),
      updated_at: new Date()
    })
    .returning('*');

  res.json({
    success: true,
    user
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

export { router as authRoutes };
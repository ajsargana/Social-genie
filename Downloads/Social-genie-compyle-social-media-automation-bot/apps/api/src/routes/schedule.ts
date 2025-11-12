import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CustomError, asyncHandler, AuthenticatedRequest } from '../middleware/errorHandler';
import { validate, schemas } from '../middleware/validation';
import { db } from '@social-genie/database';

const router = express.Router();

// @desc    Get scheduled posts
// @route   GET /api/schedule
// @access  Private
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, status, platform } = req.query;

  let query = db('scheduled_posts')
    .join('content_posts', 'scheduled_posts.content_post_id', 'content_posts.id')
    .join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
    .where('scheduled_posts.user_id', userId)
    .select(
      'scheduled_posts.*',
      'content_posts.title',
      'content_posts.content_text',
      'content_posts.hashtags',
      'content_posts.media_urls',
      'content_posts.content_category',
      'social_accounts.platform',
      'social_accounts.platform_username'
    )
    .orderBy('scheduled_posts.scheduled_at', 'desc');

  // Filter by status
  if (status) {
    query = query.where('scheduled_posts.status', status);
  }

  // Filter by platform
  if (platform) {
    query = query.where('social_accounts.platform', platform);
  }

  // Get total count
  const totalCount = await query.clone().count('* as count').first();

  // Apply pagination
  const offset = (Number(page) - 1) * Number(limit);
  const scheduledPosts = await query.limit(Number(limit)).offset(offset);

  res.json({
    success: true,
    scheduled_posts: scheduledPosts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: parseInt(totalCount.count),
      pages: Math.ceil(parseInt(totalCount.count) / Number(limit))
    }
  });
}));

// @desc    Schedule a post
// @route   POST /api/schedule
// @access  Private
router.post('/', validate(schemas.schedulePost), asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { content_post_id, social_account_ids, scheduled_at } = req.body;
  const userId = req.user.id;

  // Validate content post belongs to user
  const contentPost = await db('content_posts')
    .where('id', content_post_id)
    .where('user_id', userId)
    .first();

  if (!contentPost) {
    return next(new CustomError('Content post not found', 404));
  }

  // Validate social accounts belong to user and are active
  const socialAccounts = await db('social_accounts')
    .where('user_id', userId)
    .where('is_active', true)
    .where('auto_post_enabled', true)
    .whereIn('id', social_account_ids);

  if (socialAccounts.length === 0) {
    return next(new CustomError('No active social accounts found for posting', 400));
  }

  if (socialAccounts.length !== social_account_ids.length) {
    return next(new CustomError('Some social accounts are not active or don\'t exist', 400));
  }

  const scheduledPosts = [];

  // Create scheduled posts for each social account
  for (const socialAccountId of social_account_ids) {
    const [scheduledPost] = await db('scheduled_posts').insert({
      id: uuidv4(),
      content_post_id,
      social_account_id,
      scheduled_at: new Date(scheduled_at),
      status: 'scheduled',
      retry_count: 0,
      max_retries: 3,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    scheduledPosts.push(scheduledPost);
  }

  res.status(201).json({
    success: true,
    scheduled_posts: scheduledPosts,
    message: `Post scheduled for ${scheduledPosts.length} platforms`
  });
}));

// @desc    Get specific scheduled post
// @route   GET /api/schedule/:id
// @access  Private
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const scheduledPost = await db('scheduled_posts')
    .join('content_posts', 'scheduled_posts.content_post_id', 'content_posts.id')
    .join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
    .where('scheduled_posts.id', id)
    .where('scheduled_posts.user_id', userId)
    .select(
      'scheduled_posts.*',
      'content_posts.title',
      'content_posts.content_text',
      'content_posts.hashtags',
      'content_posts.media_urls',
      'content_posts.content_category',
      'social_accounts.platform',
      'social_accounts.platform_username'
    )
    .first();

  if (!scheduledPost) {
    return next(new CustomError('Scheduled post not found', 404));
  }

  res.json({
    success: true,
    scheduled_post: scheduledPost
  });
}));

// @desc    Update scheduled post
// @route   PUT /api/schedule/:id
// @access  Private
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { scheduled_at, status } = req.body;

  // Check if scheduled post exists and belongs to user
  const existingPost = await db('scheduled_posts')
    .where('id', id)
    .where('user_id', userId)
    .first();

  if (!existingPost) {
    return next(new CustomError('Scheduled post not found', 404));
  }

  // Cannot update posts that are already posted
  if (existingPost.status === 'posted') {
    return next(new CustomError('Cannot update a post that has already been posted', 400));
  }

  const [updatedPost] = await db('scheduled_posts')
    .where('id', id)
    .update({
      ...(scheduled_at && { scheduled_at: new Date(scheduled_at) }),
      ...(status && { status }),
      updated_at: new Date()
    })
    .returning('*');

  res.json({
    success: true,
    scheduled_post: updatedPost
  });
}));

// @desc    Cancel scheduled post
// @route   DELETE /api/schedule/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if scheduled post exists and belongs to user
  const existingPost = await db('scheduled_posts')
    .where('id', id)
    .where('user_id', userId)
    .first();

  if (!existingPost) {
    return next(new CustomError('Scheduled post not found', 404));
  }

  // Cannot cancel posts that are already posted
  if (existingPost.status === 'posted') {
    return next(new CustomError('Cannot cancel a post that has already been posted', 400));
  }

  await db('scheduled_posts')
    .where('id', id)
    .update({
      status: 'cancelled',
      updated_at: new Date()
    });

  res.json({
    success: true,
    message: 'Scheduled post cancelled successfully'
  });
}));

// @desc    Get scheduled posts for a specific date range
// @route   GET /api/schedule/calendar
// @access  Private
router.get('/calendar', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const { start_date, end_date } = req.query;

  let query = db('scheduled_posts')
    .join('content_posts', 'scheduled_posts.content_post_id', 'content_posts.id')
    .join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
    .where('scheduled_posts.user_id', userId)
    .whereBetween('scheduled_posts.scheduled_at', [
      start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    ])
    .select(
      'scheduled_posts.id',
      'scheduled_posts.scheduled_at',
      'scheduled_posts.status',
      'scheduled_posts.platform_post_id',
      'content_posts.title',
      'content_posts.content_category',
      'social_accounts.platform',
      'social_accounts.platform_username'
    )
    .orderBy('scheduled_posts.scheduled_at', 'asc');

  const scheduledPosts = await query;

  // Group posts by date
  const postsByDate = scheduledPosts.reduce((acc, post) => {
    const date = post.scheduled_at.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(post);
    return acc;
  }, {});

  res.json({
    success: true,
    posts_by_date: postsByDate,
    total_posts: scheduledPosts.length
  });
}));

// @desc    Retry failed scheduled post
// @route   POST /api/schedule/:id/retry
// @access  Private
router.post('/:id/retry', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if scheduled post exists and belongs to user
  const existingPost = await db('scheduled_posts')
    .where('id', id)
    .where('user_id', userId)
    .first();

  if (!existingPost) {
    return next(new CustomError('Scheduled post not found', 404));
  }

  // Can only retry failed posts
  if (existingPost.status !== 'failed') {
    return next(new CustomError('Can only retry posts that have failed', 400));
  }

  // Check if retry limit has been reached
  if (existingPost.retry_count >= existingPost.max_retries) {
    return next(new CustomError('Maximum retry limit has been reached', 400));
  }

  // Reset post for retry
  const [updatedPost] = await db('scheduled_posts')
    .where('id', id)
    .update({
      status: 'scheduled',
      retry_count: existingPost.retry_count + 1,
      next_retry_at: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
      error_message: null,
      updated_at: new Date()
    })
    .returning('*');

  res.json({
    success: true,
    scheduled_post: updatedPost,
    message: 'Post scheduled for retry'
  });
}));

// @desc    Get scheduling stats
// @route   GET /api/schedule/stats
// @access  Private
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;

  // Get posts by status
  const statusStats = await db('scheduled_posts')
    .join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
    .where('scheduled_posts.user_id', userId)
    .where('scheduled_posts.scheduled_at', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .select('scheduled_posts.status', 'social_accounts.platform')
    .select(
      db.raw('COUNT(*) as count'),
      'scheduled_posts.status',
      'social_accounts.platform'
    )
    .groupBy('scheduled_posts.status', 'social_accounts.platform');

  // Get today's scheduled posts
  const today = new Date().toISOString().split('T')[0];
  const todayStats = await db('scheduled_posts')
    .join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
    .where('scheduled_posts.user_id', userId)
    .where('scheduled_posts.scheduled_at', '>=', today)
    .where('scheduled_posts.scheduled_at', '<', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    .select(
      db.raw('COUNT(*) as count'),
      'scheduled_posts.status'
    )
    .groupBy('scheduled_posts.status');

  // Get upcoming posts for next 7 days
  const upcomingPosts = await db('scheduled_posts')
    .where('user_id', userId)
    .where('status', 'scheduled')
    .where('scheduled_at', '>=', new Date().toISOString())
    .where('scheduled_at', '<=', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .count('* as count')
    .first();

  res.json({
    success: true,
    stats: {
      by_status: statusStats,
      today: todayStats,
      upcoming: parseInt(upcomingPosts.count)
    }
  });
}));

export { router as scheduleRoutes };
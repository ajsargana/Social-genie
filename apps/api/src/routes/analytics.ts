import express from 'express';
import { CustomError, asyncHandler, AuthenticatedRequest } from '../middleware/errorHandler';
import { db } from '@social-genie/database';

const router = express.Router();

// @desc    Get analytics overview
// @route   GET /api/analytics
// @access  Private
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const { platform, date_from, date_to, content_category } = req.query;

  // Build date range filter
  const defaultDateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const defaultDateTo = new Date();

  let query = db('scheduled_posts')
    .leftJoin('post_analytics', 'scheduled_posts.id', 'post_analytics.scheduled_post_id')
    .leftJoin('content_posts', 'scheduled_posts.content_post_id', 'content_posts.id')
    .where('scheduled_posts.user_id', userId)
    .where('scheduled_posts.status', 'posted')
    .whereBetween('scheduled_posts.posted_at', [
      date_from || defaultDateFrom.toISOString(),
      date_to || defaultDateTo.toISOString()
    ])
    .select(
      db.raw('COUNT(DISTINCT scheduled_posts.id) as total_posts'),
      db.raw('COUNT(DISTINCT scheduled_posts.id) FILTER (WHERE scheduled_posts.status = \'posted\') as successful_posts'),
      db.raw('COUNT(DISTINCT scheduled_posts.id) FILTER (WHERE scheduled_posts.status = \'failed\') as failed_posts'),
      db.raw('COALESCE(SUM(post_analytics.likes), 0) as total_likes'),
      db.raw('COALESCE(SUM(post_analytics.comments), 0) as total_comments'),
      db.raw('COALESCE(SUM(post_analytics.shares), 0) as total_shares'),
      db.raw('COALESCE(SUM(post_analytics.views), 0) as total_views'),
      db.raw('COALESCE(AVG(post_analytics.engagement_rate), 0) as avg_engagement_rate')
    );

  // Filter by platform
  if (platform) {
    query = query.join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
                  .where('social_accounts.platform', platform);
  }

  // Filter by content category
  if (content_category) {
    query = query.where('content_posts.content_category', content_category);
  }

  const overview = await query.first();

  // Get platform breakdown
  const platformBreakdown = await db('scheduled_posts')
    .leftJoin('post_analytics', 'scheduled_posts.id', 'post_analytics.scheduled_post_id')
    .join('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
    .where('scheduled_posts.user_id', userId)
    .where('scheduled_posts.status', 'posted')
    .whereBetween('scheduled_posts.posted_at', [
      date_from || defaultDateFrom.toISOString(),
      date_to || defaultDateTo.toISOString()
    ])
    .select(
      'social_accounts.platform',
      db.raw('COUNT(DISTINCT scheduled_posts.id) as posts'),
      db.raw('COALESCE(SUM(post_analytics.likes), 0) as likes'),
      db.raw('COALESCE(SUM(post_analytics.comments), 0) as comments'),
      db.raw('COALESCE(SUM(post_analytics.shares), 0) as shares'),
      db.raw('COALESCE(SUM(post_analytics.views), 0) as views'),
      db.raw('COALESCE(AVG(post_analytics.engagement_rate), 0) as engagement_rate')
    )
    .groupBy('social_accounts.platform');

  // Get content category breakdown
  const categoryBreakdown = await db('scheduled_posts')
    .leftJoin('post_analytics', 'scheduled_posts.id', 'post_analytics.scheduled_post_id')
    .leftJoin('content_posts', 'scheduled_posts.content_post_id', 'content_posts.id')
    .where('scheduled_posts.user_id', userId)
    .where('scheduled_posts.status', 'posted')
    .whereBetween('scheduled_posts.posted_at', [
      date_from || defaultDateFrom.toISOString(),
      date_to || defaultDateTo.toISOString()
    ])
    .select(
      'content_posts.content_category',
      db.raw('COUNT(DISTINCT scheduled_posts.id) as posts'),
      db.raw('COALESCE(SUM(post_analytics.likes), 0) as total_likes'),
      db.raw('COALESCE(AVG(post_analytics.engagement_rate), 0) as avg_engagement_rate')
    )
    .groupBy('content_posts.content_category');

  res.json({
    success: true,
    analytics: {
      overview: {
        total_posts: parseInt(overview.total_posts) || 0,
        successful_posts: parseInt(overview.successful_posts) || 0,
        failed_posts: parseInt(overview.failed_posts) || 0,
        total_engagement: {
          likes: parseInt(overview.total_likes) || 0,
          comments: parseInt(overview.total_comments) || 0,
          shares: parseInt(overview.total_shares) || 0,
          views: parseInt(overview.total_views) || 0
        },
        avg_engagement_rate: parseFloat(overview.avg_engagement_rate) || 0
      },
      by_platform: platformBreakdown,
      by_category: categoryBreakdown
    }
  });
}));

// @desc    Get post performance analytics
// @route   GET /api/analytics/posts
// @access  Private
router.get('/posts', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, platform, date_from, date_to } = req.query;

  // Build date range filter
  const defaultDateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const defaultDateTo = new Date();

  let query = db('scheduled_posts')
    .leftJoin('post_analytics', 'scheduled_posts.id', 'post_analytics.scheduled_post_id')
    .leftJoin('content_posts', 'scheduled_posts.content_post_id', 'content_posts.id')
    .leftJoin('social_accounts', 'scheduled_posts.social_account_id', 'social_accounts.id')
    .where('scheduled_posts.user_id', userId)
    .where('scheduled_posts.status', 'posted')
    .whereBetween('scheduled_posts.posted_at', [
      date_from || defaultDateFrom.toISOString(),
      date_to || defaultDateTo.toISOString()
    ])
    .select(
      'scheduled_posts.id',
      'scheduled_posts.posted_at',
      'scheduled_posts.platform_post_id',
      'content_posts.title',
      'content_posts.content_text',
      'content_posts.content_category',
      'social_accounts.platform',
      'social_accounts.platform_username',
      'post_analytics.likes',
      'post_analytics.comments',
      'post_analytics.shares',
      'post_analytics.views',
      'post_analytics.engagement_rate'
    )
    .orderBy('scheduled_posts.posted_at', 'desc');

  // Filter by platform
  if (platform) {
    query = query.where('social_accounts.platform', platform);
  }

  // Get total count
  const totalCount = await query.clone().count('* as count').first();

  // Apply pagination
  const offset = (Number(page) - 1) * Number(limit);
  const posts = await query.limit(Number(limit)).offset(offset);

  res.json({
    success: true,
    posts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: parseInt(totalCount.count),
      pages: Math.ceil(parseInt(totalCount.count) / Number(limit))
    }
  });
}));

// @desc    Get AI generation analytics
// @route   GET /api/analytics/ai-usage
// @access  Private
router.get('/ai-usage', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const { period = 'month' } = req.query;

  const periodMap = {
    day: '24 hours',
    week: '7 days',
    month: '30 days'
  };

  const stats = await db('ai_generation_logs')
    .where('user_id', userId)
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${periodMap[period as string]}'`))
    .select(
      db.raw('COUNT(*) as total_generations'),
      db.raw('SUM(cost_usd) as total_cost'),
      db.raw('AVG(quality_score) as average_quality_score'),
      db.raw('AVG(generation_time_ms) as average_generation_time'),
      db.raw('mode() WITHIN GROUP (ORDER BY model_used) as most_used_model')
    )
    .first();

  const generationsByType = await db('ai_generation_logs')
    .where('user_id', userId)
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${periodMap[period as string]}'`))
    .select('request_type')
    .count('* as count')
    .groupBy('request_type')
    .orderBy('count', 'desc');

  const dailyUsage = await db('ai_generation_logs')
    .where('user_id', userId)
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '30 days'`))
    .select(
      db.raw('DATE(created_at) as date'),
      db.raw('COUNT(*) as generations'),
      db.raw('SUM(cost_usd) as cost')
    )
    .groupBy(db.raw('DATE(created_at)'))
    .orderBy('date', 'desc')
    .limit(30);

  res.json({
    success: true,
    ai_usage: {
      summary: {
        total_generations: parseInt(stats.total_generations) || 0,
        total_cost: parseFloat(stats.total_cost) || 0,
        average_quality_score: parseFloat(stats.average_quality_score) || 0,
        average_generation_time: parseFloat(stats.average_generation_time) || 0,
        most_used_model: stats.most_used_model || 'none'
      },
      by_type: generationsByType,
      daily_usage: dailyUsage
    }
  });
}));

// @desc    Get engagement analytics
// @route   GET /api/analytics/engagement
// @access  Private
router.get('/engagement', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const { period = '30' } = req.query; // days

  // Get recent comments
  const recentComments = await db('comments')
    .join('social_accounts', 'comments.social_account_id', 'social_accounts.id')
    .where('social_accounts.user_id', userId)
    .where('social_accounts.auto_reply_enabled', true)
    .where('comments.created_at', '>=', db.raw(`NOW() - INTERVAL '${period} days'`))
    .select(
      'comments.*',
      'social_accounts.platform'
    )
    .orderBy('comments.created_at', 'desc')
    .limit(50);

  // Get engagement metrics
  const engagementStats = await db('comments')
    .join('social_accounts', 'comments.social_account_id', 'social_accounts.id')
    .where('social_accounts.user_id', userId)
    .where('comments.created_at', '>=', db.raw(`NOW() - INTERVAL '${period} days'`))
    .select(
      db.raw('COUNT(*) as total_comments'),
      db.raw('COUNT(*) FILTER (WHERE auto_reply_sent = true) as auto_replied'),
      db.raw('AVG(sentiment_score) as avg_sentiment'),
      db.raw('COUNT(DISTINCT comments.platform_post_id) as posts_with_comments')
    )
    .first();

  // Get platform breakdown
  const platformEngagement = await db('comments')
    .join('social_accounts', 'comments.social_account_id', 'social_accounts.id')
    .where('social_accounts.user_id', userId)
    .where('comments.created_at', '>=', db.raw(`NOW() - INTERVAL '${period} days'`))
    .select(
      'social_accounts.platform',
      db.raw('COUNT(*) as comments'),
      db.raw('COUNT(*) FILTER (WHERE auto_reply_sent = true) as auto_replied')
    )
    .groupBy('social_accounts.platform');

  res.json({
    success: true,
    engagement: {
      summary: {
        total_comments: parseInt(engagementStats.total_comments) || 0,
        auto_replied: parseInt(engagementStats.auto_replied) || 0,
        auto_reply_rate: engagementStats.total_comments > 0
          ? ((parseInt(engagementStats.auto_replied) / parseInt(engagementStats.total_comments)) * 100).toFixed(1)
          : '0',
        avg_sentiment: parseFloat(engagementStats.avg_sentiment) || 0,
        posts_with_comments: parseInt(engagementStats.posts_with_comments) || 0
      },
      by_platform: platformEngagement,
      recent_comments
    }
  });
}));

// @desc    Get dashboard summary stats
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;

  // Get total accounts
  const totalAccounts = await db('social_accounts')
    .where('user_id', userId)
    .where('is_active', true)
    .count('* as count')
    .first();

  // Get active accounts
  const activeAccounts = await db('social_accounts')
    .where('user_id', userId)
    .where('is_active', true)
    .where('auto_post_enabled', true)
    .count('* as count')
    .first();

  // Get scheduled posts count
  const scheduledPosts = await db('scheduled_posts')
    .where('user_id', userId)
    .where('status', 'scheduled')
    .where('scheduled_at', '>=', new Date().toISOString())
    .count('* as count')
    .first();

  // Get posts today
  const today = new Date().toISOString().split('T')[0];
  const postsToday = await db('scheduled_posts')
    .where('user_id', userId)
    .where('status', 'posted')
    .where('posted_at', '>=', today)
    .count('* as count')
    .first();

  // Get engagement this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const engagementWeek = await db('post_analytics')
    .join('scheduled_posts', 'post_analytics.scheduled_post_id', 'scheduled_posts.id')
    .where('scheduled_posts.user_id', userId)
    .where('scheduled_posts.posted_at', '>=', weekAgo)
    .select(
      db.raw('SUM(likes + comments + shares) as total_engagement')
    )
    .first();

  // Get AI generations this month
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const aiGenerationsMonth = await db('ai_generation_logs')
    .where('user_id', userId)
    .where('created_at', '>=', monthAgo)
    .count('* as count')
    .first();

  const dashboardStats = {
    total_accounts: parseInt(totalAccounts.count) || 0,
    active_accounts: parseInt(activeAccounts.count) || 0,
    scheduled_posts: parseInt(scheduledPosts.count) || 0,
    posts_today: parseInt(postsToday.count) || 0,
    engagement_this_week: parseInt(engagementWeek.total_engagement) || 0,
    ai_generations_this_month: parseInt(aiGenerationsMonth.count) || 0
  };

  res.json({
    success: true,
    dashboard: dashboardStats
  });
}));

export { router as analyticsRoutes };
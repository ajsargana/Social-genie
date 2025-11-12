import express from 'express';
import { CustomError, asyncHandler, AuthenticatedRequest } from '../middleware/errorHandler';
import { db } from '@social-genie/database';

const router = express.Router();

// @desc    Get user's social accounts
// @route   GET /api/accounts
// @access  Private
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;

  const socialAccounts = await db('social_accounts')
    .where('user_id', userId)
    .orderBy('created_at', 'desc');

  res.json({
    success: true,
    accounts: socialAccounts
  });
}));

// @desc    Get OAuth URL for platform connection
// @route   GET /api/accounts/connect/:platform
// @access  Private
router.get('/connect/:platform', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { platform } = req.params;
  const userId = req.user.id;

  const supportedPlatforms = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'];

  if (!supportedPlatforms.includes(platform)) {
    return next(new CustomError(`Platform ${platform} is not supported`, 400));
  }

  // For now, return Ayrshare connection info
  // In production, this would return platform-specific OAuth URLs
  const connectionInfo = {
    platform,
    method: 'ayrshare',
    url: `https://app.ayrshare.com/connect/${platform}`,
    instructions: `Connect your ${platform} account through Ayrshare dashboard`,
    scopes: getPlatformScopes(platform)
  };

  res.json({
    success: true,
    connection: connectionInfo
  });
}));

// @desc    Update social account settings
// @route   PUT /api/accounts/:id
// @access  Private
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { auto_reply_enabled, auto_post_enabled, daily_post_limit } = req.body;

  // Check if account exists and belongs to user
  const existingAccount = await db('social_accounts')
    .where('id', id)
    .where('user_id', userId)
    .first();

  if (!existingAccount) {
    return next(new CustomError('Social account not found', 404));
  }

  const [updatedAccount] = await db('social_accounts')
    .where('id', id)
    .update({
      ...(auto_reply_enabled !== undefined && { auto_reply_enabled }),
      ...(auto_post_enabled !== undefined && { auto_post_enabled }),
      ...(daily_post_limit !== undefined && { daily_post_limit }),
      updated_at: new Date()
    })
    .returning('*');

  res.json({
    success: true,
    account: updatedAccount
  });
}));

// @desc    Disconnect social account
// @route   DELETE /api/accounts/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if account exists and belongs to user
  const existingAccount = await db('social_accounts')
    .where('id', id)
    .where('user_id', userId)
    .first();

  if (!existingAccount) {
    return next(new CustomError('Social account not found', 404));
  }

  // Check for active scheduled posts
  const activeScheduledPosts = await db('scheduled_posts')
    .where('social_account_id', id)
    .whereIn('status', ['scheduled', 'posted'])
    .count('* as count')
    .first();

  if (parseInt(activeScheduledPosts.count) > 0) {
    return next(new CustomError('Cannot disconnect account with active scheduled posts', 400));
  }

  await db('social_accounts').where('id', id).del();

  res.json({
    success: true,
    message: 'Social account disconnected successfully'
  });
}));

// @desc    Get account status and health
// @route   GET /api/accounts/:id/status
// @access  Private
router.get('/:id/status', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const account = await db('social_accounts')
    .where('id', id)
    .where('user_id', userId)
    .first();

  if (!account) {
    return next(new CustomError('Social account not found', 404));
  }

  // Get recent posts for this account
  const recentPosts = await db('scheduled_posts')
    .where('social_account_id', id)
    .whereIn('status', ['scheduled', 'posted'])
    .orderBy('created_at', 'desc')
    .limit(5);

  // Get today's posts count
  const today = new Date().toISOString().split('T')[0];
  const postsToday = await db('scheduled_posts')
    .where('social_account_id', id)
    .where('status', 'posted')
    .where('posted_at', '>=', today)
    .count('* as count')
    .first();

  const status = {
    account: {
      id: account.id,
      platform: account.platform,
      platform_username: account.platform_username,
      is_active: account.is_active,
      auto_post_enabled: account.auto_post_enabled,
      auto_reply_enabled: account.auto_reply_enabled,
      daily_post_limit: account.daily_post_limit,
      token_expires_at: account.token_expires_at
    },
    activity: {
      posts_today: parseInt(postsToday.count),
      recent_posts: recentPosts.length,
      status: account.is_active ? 'active' : 'inactive'
    },
    health: {
      token_status: account.token_expires_at && new Date(account.token_expires_at) > new Date() ? 'valid' : 'expiring',
      last_post: recentPosts.find(p => p.status === 'posted')?.posted_at || null,
      next_scheduled: recentPosts.find(p => p.status === 'scheduled')?.scheduled_at || null
    }
  };

  res.json({
    success: true,
    status
  });
}));

// @desc    Get platform capabilities
// @route   GET /api/accounts/capabilities
// @access  Private
router.get('/capabilities', asyncHandler(async (req, res) => {
  const capabilities = {
    instagram: {
      can_post_text: true,
      can_post_images: true,
      can_post_videos: true,
      can_post_carousel: true,
      can_post_stories: true,
      max_characters: 2200,
      max_hashtags: 30,
      max_images: 10,
      max_video_length_seconds: 60
    },
    facebook: {
      can_post_text: true,
      can_post_images: true,
      can_post_videos: true,
      can_post_carousel: true,
      can_post_stories: true,
      max_characters: 63206,
      max_hashtags: 50,
      max_images: 10,
      max_video_length_seconds: 14400
    },
    twitter: {
      can_post_text: true,
      can_post_images: true,
      can_post_videos: true,
      can_post_carousel: false,
      can_post_stories: false,
      max_characters: 280,
      max_hashtags: 10,
      max_images: 4,
      max_video_length_seconds: 140
    },
    linkedin: {
      can_post_text: true,
      can_post_images: true,
      can_post_videos: true,
      can_post_carousel: true,
      can_post_stories: false,
      max_characters: 3000,
      max_hashtags: 20,
      max_images: 9,
      max_video_length_seconds: 600
    },
    tiktok: {
      can_post_text: true,
      can_post_images: false,
      can_post_videos: true,
      can_post_carousel: false,
      can_post_stories: false,
      max_characters: 150,
      max_hashtags: 5,
      max_images: 0,
      max_video_length_seconds: 600
    },
    youtube: {
      can_post_text: true,
      can_post_images: false,
      can_post_videos: true,
      can_post_carousel: false,
      can_post_stories: false,
      max_characters: 5000,
      max_hashtags: 15,
      max_images: 0,
      max_video_length_seconds: 43200
    },
    pinterest: {
      can_post_text: true,
      can_post_images: true,
      can_post_videos: true,
      can_post_carousel: false,
      can_post_stories: false,
      max_characters: 500,
      max_hashtags: 20,
      max_images: 1,
      max_video_length_seconds: 900
    }
  };

  res.json({
    success: true,
    capabilities
  });
}));

function getPlatformScopes(platform: string): string[] {
  const scopes = {
    instagram: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
    facebook: ['pages_read_engagement', 'pages_manage_posts'],
    twitter: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    linkedin: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    tiktok: ['user.info.basic', 'video.list', 'video.publish'],
    youtube: ['https://www.googleapis.com/auth/youtube.upload'],
    pinterest: ['boards:read', 'pins:read', 'pins:write']
  };

  return scopes[platform] || [];
}

export { router as accountsRoutes };
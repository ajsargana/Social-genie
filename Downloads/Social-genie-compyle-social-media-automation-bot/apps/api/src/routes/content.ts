import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CustomError, asyncHandler, AuthenticatedRequest } from '../middleware/errorHandler';
import { validate, schemas } from '../middleware/validation';
import { db } from '@social-genie/database';

const router = express.Router();

// @desc    Generate AI content
// @route   POST /api/content/generate
// @access  Private
router.post('/generate', validate(schemas.generateContent), asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { category, platforms, preferences, context } = req.body;
  const userId = req.user.id;

  try {
    // Import ContentGenerationService dynamically
    const { ContentGenerationService } = await import('@social-genie/ai-content');
    const contentService = new ContentGenerationService();

    const results = [];

    // Generate content for each platform
    for (const platform of platforms) {
      try {
        const generatedContent = await contentService.generatePost(
          userId,
          category,
          platform,
          preferences,
          context
        );

        results.push({
          platform,
          success: true,
          content: generatedContent.content,
          hashtags: generatedContent.hashtags,
          media_urls: generatedContent.media_urls,
          confidence_score: generatedContent.confidence_score,
          quality_score: generatedContent.quality_score
        });
      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error.message
        });
      }
    }

    // Create content posts in database for successful generations
    const contentPosts = [];
    for (const result of results) {
      if (result.success) {
        try {
          const [contentPost] = await db('content_posts').insert({
            id: uuidv4(),
            user_id: userId,
            title: context?.title || `${category} post for ${result.platform}`,
            content_text: result.content,
            hashtags: result.hashtags,
            media_urls: result.media_urls || [],
            media_type: result.media_urls?.length > 0 ? 'image' : 'text',
            ai_generated: true,
            content_category: category,
            engagement_data: {
              confidence_score: result.confidence_score,
              quality_score: result.quality_score
            },
            created_at: new Date(),
            updated_at: new Date()
          }).returning('*');

          contentPosts.push(contentPost);
        } catch (error) {
          console.error(`Failed to save content for ${result.platform}:`, error);
        }
      }
    }

    res.json({
      success: true,
      results,
      content_posts: contentPosts
    });
  } catch (error) {
    return next(new CustomError(`Content generation failed: ${error.message}`, 500));
  }
}));

// @desc    Create content post
// @route   POST /api/content
// @access  Private
router.post('/', validate(schemas.createContent), asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { title, content_text, hashtags, media_urls, media_type, content_category } = req.body;
  const userId = req.user.id;

  const [contentPost] = await db('content_posts').insert({
    id: uuidv4(),
    user_id: userId,
    title,
    content_text,
    hashtags,
    media_urls,
    media_type,
    ai_generated: false,
    content_category,
    engagement_data: {},
    created_at: new Date(),
    updated_at: new Date()
  }).returning('*');

  res.status(201).json({
    success: true,
    content_post: contentPost
  });
}));

// @desc    Get user's content library
// @route   GET /api/content
// @access  Private
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, category, search } = req.query;

  let query = db('content_posts')
    .where('user_id', userId)
    .orderBy('created_at', 'desc');

  // Filter by category
  if (category) {
    query = query.where('content_category', category);
  }

  // Search functionality
  if (search) {
    query = query.where(function() {
      this.where('content_text', 'ilike', `%${search}%`)
          .orWhere('title', 'ilike', `%${search}%`);
    });
  }

  // Get total count
  const totalCount = await query.clone().count('* as count').first();

  // Apply pagination
  const offset = (Number(page) - 1) * Number(limit);
  const contentPosts = await query.limit(Number(limit)).offset(offset);

  res.json({
    success: true,
    content_posts: contentPosts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: parseInt(totalCount.count),
      pages: Math.ceil(parseInt(totalCount.count) / Number(limit))
    }
  });
}));

// @desc    Get specific content post
// @route   GET /api/content/:id
// @access  Private
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const contentPost = await db('content_posts')
    .where('id', id)
    .where('user_id', userId)
    .first();

  if (!contentPost) {
    return next(new CustomError('Content post not found', 404));
  }

  res.json({
    success: true,
    content_post: contentPost
  });
}));

// @desc    Update content post
// @route   PUT /api/content/:id
// @access  Private
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, content_text, hashtags, media_urls, content_category } = req.body;

  const [contentPost] = await db('content_posts')
    .where('id', id)
    .where('user_id', userId)
    .update({
      ...(title && { title }),
      ...(content_text && { content_text }),
      ...(hashtags && { hashtags }),
      ...(media_urls && { media_urls }),
      ...(content_category && { content_category }),
      updated_at: new Date()
    })
    .returning('*');

  if (!contentPost) {
    return next(new CustomError('Content post not found', 404));
  }

  res.json({
    success: true,
    content_post: contentPost
  });
}));

// @desc    Delete content post
// @route   DELETE /api/content/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if post exists and belongs to user
  const contentPost = await db('content_posts')
    .where('id', id)
    .where('user_id', userId)
    .first();

  if (!contentPost) {
    return next(new CustomError('Content post not found', 404));
  }

  // Check if post has scheduled posts
  const scheduledPosts = await db('scheduled_posts')
    .where('content_post_id', id)
    .whereIn('status', ['scheduled', 'posted'])
    .count('* as count')
    .first();

  if (parseInt(scheduledPosts.count) > 0) {
    return next(new CustomError('Cannot delete content post with scheduled or posted instances', 400));
  }

  await db('content_posts').where('id', id).del();

  res.json({
    success: true,
    message: 'Content post deleted successfully'
  });
}));

// @desc    Get content categories and stats
// @route   GET /api/content/stats
// @access  Private
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;

  // Get content by category
  const categoryStats = await db('content_posts')
    .where('user_id', userId)
    .select('content_category')
    .count('* as count')
    .groupBy('content_category');

  // Get total content count
  const totalContent = await db('content_posts')
    .where('user_id', userId)
    .count('* as count')
    .first();

  // Get AI vs manual content stats
  const generationStats = await db('content_posts')
    .where('user_id', userId)
    .select('ai_generated')
    .count('* as count')
    .groupBy('ai_generated');

  res.json({
    success: true,
    stats: {
      total_content: parseInt(totalContent.count),
      by_category: categoryStats,
      by_generation_type: generationStats
    }
  });
}));

export { router as contentRoutes };
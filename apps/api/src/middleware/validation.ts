import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError, asyncHandler } from './errorHandler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new CustomError(message, 400));
    }

    next();
  };
};

// Validation schemas
export const schemas = {
  // User schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Content schemas
  generateContent: Joi.object({
    category: Joi.string().valid(
      'daily_movie', 'product_showcase', 'daily_quote', 'news',
      'educational', 'entertainment', 'promotional', 'behind_scenes',
      'user_generated', 'custom'
    ).required(),
    platforms: Joi.array().items(
      Joi.string().valid('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest')
    ).min(1).required(),
    preferences: Joi.object({
      tone: Joi.string().valid('professional', 'casual', 'friendly', 'humorous', 'inspirational').default('friendly'),
      length: Joi.string().valid('short', 'medium', 'long').default('medium'),
      include_media: Joi.boolean().default(true),
      media_type: Joi.string().valid('image', 'video', 'carousel').default('image'),
      auto_hashtags: Joi.boolean().default(true),
      hashtag_count: Joi.number().integer().min(1).max(30).default(10)
    }).default(),
    context: Joi.object().default({})
  }),

  createContent: Joi.object({
    title: Joi.string().max(500).optional(),
    content_text: Joi.string().min(1).max(5000).required(),
    hashtags: Joi.array().items(Joi.string().max(100)).max(30).default([]),
    media_urls: Joi.array().items(Joi.string().uri()).max(10).default([]),
    media_type: Joi.string().valid('text', 'image', 'video', 'carousel').default('text'),
    content_category: Joi.string().valid(
      'daily_movie', 'product_showcase', 'daily_quote', 'news',
      'educational', 'entertainment', 'promotional', 'behind_scenes',
      'user_generated', 'custom'
    ).required()
  }),

  // Schedule schemas
  schedulePost: Joi.object({
    content_post_id: Joi.string().uuid().required(),
    social_account_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
    scheduled_at: Joi.date().iso().min('now').required()
  }),

  // Account schemas
  updateAccount: Joi.object({
    auto_reply_enabled: Joi.boolean().optional(),
    auto_post_enabled: Joi.boolean().optional(),
    daily_post_limit: Joi.number().integer().min(1).max(50).optional()
  }),

  // Analytics schemas
  getAnalytics: Joi.object({
    platform: Joi.string().valid('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest').optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().min(Joi.ref('date_from')).optional(),
    content_category: Joi.string().valid(
      'daily_movie', 'product_showcase', 'daily_quote', 'news',
      'educational', 'entertainment', 'promotional', 'behind_scenes',
      'user_generated', 'custom'
    ).optional()
  })
};
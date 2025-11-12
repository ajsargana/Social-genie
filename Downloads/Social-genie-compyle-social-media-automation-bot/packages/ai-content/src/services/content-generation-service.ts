import {
  AIGenerationRequest,
  AIGenerationResult,
  ContentCategory,
  SocialPlatform,
  ContentGenerationPreferences,
  AIGenerationLog,
  User
} from '@social-genie/shared-types';
import { AIProvider, OpenAIProvider, ClaudeProvider } from '../providers';
import { getContentTemplate, generatePrompt } from '../templates/content-templates';
import { db } from '@social-genie/database';

export interface AIProviderConfig {
  name: string;
  apiKey: string;
  enabled: boolean;
  priority: number;
}

export class ContentGenerationService {
  private providers: Map<string, AIProvider> = new Map();
  private providerConfigs: AIProviderConfig[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize OpenAI provider
    if (process.env.OPENAI_API_KEY) {
      const openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);
      this.providers.set('openai', openaiProvider);
      this.providerConfigs.push({
        name: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        enabled: true,
        priority: 1
      });
    }

    // Initialize Claude provider
    if (process.env.ANTHROPIC_API_KEY) {
      const claudeProvider = new ClaudeProvider(process.env.ANTHROPIC_API_KEY);
      this.providers.set('claude', claudeProvider);
      this.providerConfigs.push({
        name: 'claude',
        apiKey: process.env.ANTHROPIC_API_KEY,
        enabled: true,
        priority: 2
      });
    }
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      // Select best provider for the request
      const provider = await this.selectBestProvider(request);

      if (!provider) {
        throw new Error('No AI providers available');
      }

      // Generate content
      const result = await provider.generateContent(request);

      // Log the generation
      await this.logGeneration(request, result);

      return result;
    } catch (error) {
      const generationTime = Date.now() - startTime;

      const errorResult: AIGenerationResult = {
        content: '',
        confidence_score: 0,
        quality_score: 0,
        tokens_used: 0,
        cost_usd: 0,
        generation_time_ms: generationTime,
        model_used: '',
        provider: 'none',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      await this.logGeneration(request, errorResult);
      return errorResult;
    }
  }

  async generatePost(
    userId: string,
    category: ContentCategory,
    platform: SocialPlatform,
    preferences: ContentGenerationPreferences,
    context: Record<string, any> = {}
  ): Promise<{
    content: string;
    hashtags: string[];
    media_urls?: string[];
    confidence_score: number;
    quality_score: number;
  }> {
    const request: AIGenerationRequest = {
      user_id: userId,
      request_type: 'complete_post',
      prompt: generatePrompt(category, platform, preferences, context),
      context,
      platform,
      category,
      preferences
    };

    const result = await this.generateContent(request);

    if (result.error) {
      throw new Error(`Content generation failed: ${result.error}`);
    }

    // Parse the result to extract content, hashtags, and media
    const parsed = this.parseGeneratedContent(result.content, platform);

    return {
      content: parsed.content,
      hashtags: parsed.hashtags,
      media_urls: result.media_urls,
      confidence_score: result.confidence_score,
      quality_score: result.quality_score
    };
  }

  async generateCaption(
    userId: string,
    category: ContentCategory,
    platform: SocialPlatform,
    preferences: ContentGenerationPreferences,
    context: Record<string, any> = {}
  ): Promise<string> {
    const request: AIGenerationRequest = {
      user_id: userId,
      request_type: 'caption',
      prompt: generatePrompt(category, platform, preferences, context),
      context,
      platform,
      category,
      preferences
    };

    const result = await this.generateContent(request);

    if (result.error) {
      throw new Error(`Caption generation failed: ${result.error}`);
    }

    return result.content;
  }

  async generateImage(
    userId: string,
    category: ContentCategory,
    platform: SocialPlatform,
    preferences: ContentGenerationPreferences,
    context: Record<string, any> = {}
  ): Promise<string[]> {
    const request: AIGenerationRequest = {
      user_id: userId,
      request_type: 'image',
      prompt: generatePrompt(category, platform, preferences, context),
      context,
      platform,
      category,
      preferences
    };

    const result = await this.generateContent(request);

    if (result.error) {
      throw new Error(`Image generation failed: ${result.error}`);
    }

    return result.media_urls || [];
  }

  async generateReply(
    userId: string,
    originalComment: string,
    originalPost: string,
    tone: string = 'friendly'
  ): Promise<string> {
    const prompt = `Write a ${tone} reply to this social media comment: "${originalComment}"

The original post was: "${originalPost}"

Requirements:
- Keep it conversational and authentic
- Address the comment directly
- Match the requested tone: ${tone}
- Keep it under 100 words
- Include relevant emojis if appropriate for the tone`;

    const request: AIGenerationRequest = {
      user_id: userId,
      request_type: 'reply',
      prompt,
      context: {
        original_comment: originalComment,
        original_post: originalPost,
        tone
      }
    };

    const result = await this.generateContent(request);

    if (result.error) {
      throw new Error(`Reply generation failed: ${result.error}`);
    }

    return result.content;
  }

  async generateHashtags(
    userId: string,
    content: string,
    platform: SocialPlatform,
    count: number = 10
  ): Promise<string[]> {
    const prompt = `Generate ${count} relevant hashtags for this social media content: "${content}"

Platform: ${platform}

Requirements:
- Hashtags should be relevant to the content
- Mix of popular and niche hashtags
- Platform-appropriate format (no # for LinkedIn, with # for others)
- Current and trending where possible
- Avoid overly generic hashtags unless relevant`;

    const request: AIGenerationRequest = {
      user_id: userId,
      request_type: 'hashtag',
      prompt,
      context: { content, platform, count }
    };

    const result = await this.generateContent(request);

    if (result.error) {
      throw new Error(`Hashtag generation failed: ${result.error}`);
    }

    // Parse hashtags from the result
    const hashtags = this.extractHashtags(result.content, platform);
    return hashtags.slice(0, count);
  }

  private async selectBestProvider(request: AIGenerationRequest): Promise<AIProvider | null> {
    const availableProviders = this.providerConfigs
      .filter(config => config.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const config of availableProviders) {
      const provider = this.providers.get(config.name);
      if (provider) {
        try {
          // Simple health check - we could add more sophisticated provider selection
          return provider;
        } catch (error) {
          console.warn(`Provider ${config.name} is not available:`, error);
          continue;
        }
      }
    }

    return null;
  }

  private parseGeneratedContent(content: string, platform: SocialPlatform): {
    content: string;
    hashtags: string[];
  } {
    // Extract hashtags from content if present
    const hashtagRegex = /#[\w]+/g;
    const hashtags = content.match(hashtagRegex) || [];

    // Remove hashtags from main content for platforms that separate them
    let cleanContent = content;
    if (platform === 'instagram' || platform === 'tiktok') {
      cleanContent = content.replace(hashtagRegex, '').trim();
    }

    return {
      content: cleanContent,
      hashtags: hashtags.map(tag => tag.replace('#', ''))
    };
  }

  private extractHashtags(content: string, platform: SocialPlatform): string[] {
    if (platform === 'linkedin') {
      // LinkedIn doesn't use # hashtags, extract keywords instead
      return content
        .split(',')
        .map(tag => tag.trim().replace(/^#\s*/, ''))
        .filter(tag => tag.length > 0);
    }

    const hashtagRegex = /#[\w]+/g;
    const matches = content.match(hashtagRegex) || [];
    return matches.map(tag => tag.replace('#', ''));
  }

  private async logGeneration(request: AIGenerationRequest, result: AIGenerationResult): Promise<void> {
    try {
      await db('ai_generation_logs').insert({
        user_id: request.user_id,
        request_type: request.request_type,
        prompt: request.prompt,
        generated_content: result.content,
        model_used: result.model_used,
        tokens_used: result.tokens_used,
        cost_usd: result.cost_usd,
        generation_time_ms: result.generation_time_ms,
        quality_score: result.quality_score,
        created_at: new Date()
      });
    } catch (error) {
      console.error('Failed to log AI generation:', error);
      // Don't throw error - logging failure shouldn't break the main flow
    }
  }

  async getGenerationStats(userId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    total_generations: number;
    total_cost: number;
    average_quality_score: number;
    most_used_model: string;
    generations_by_type: Record<string, number>;
  }> {
    const periodMap = {
      day: '24 hours',
      week: '7 days',
      month: '30 days'
    };

    const stats = await db('ai_generation_logs')
      .where('user_id', userId)
      .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${periodMap[period]}'`))
      .select(
        db.raw('COUNT(*) as total_generations'),
        db.raw('SUM(cost_usd) as total_cost'),
        db.raw('AVG(quality_score) as average_quality_score'),
        db.raw('mode() WITHIN GROUP (ORDER BY model_used) as most_used_model')
      )
      .first();

    const generationsByType = await db('ai_generation_logs')
      .where('user_id', userId)
      .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${periodMap[period]}'`))
      .select('request_type')
      .count('* as count')
      .groupBy('request_type');

    const typeStats = generationsByType.reduce((acc, row: any) => {
      acc[row.request_type] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      total_generations: parseInt(stats.total_generations) || 0,
      total_cost: parseFloat(stats.total_cost) || 0,
      average_quality_score: parseFloat(stats.average_quality_score) || 0,
      most_used_model: stats.most_used_model || 'none',
      generations_by_type: typeStats
    };
  }
}
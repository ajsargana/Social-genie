"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentGenerationService = void 0;
const providers_1 = require("../providers");
const content_templates_1 = require("../templates/content-templates");
const database_1 = require("@social-genie/database");
class ContentGenerationService {
    providers = new Map();
    providerConfigs = [];
    constructor() {
        this.initializeProviders();
    }
    initializeProviders() {
        // Initialize OpenAI provider
        if (process.env.OPENAI_API_KEY) {
            const openaiProvider = new providers_1.OpenAIProvider(process.env.OPENAI_API_KEY);
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
            const claudeProvider = new providers_1.ClaudeProvider(process.env.ANTHROPIC_API_KEY);
            this.providers.set('claude', claudeProvider);
            this.providerConfigs.push({
                name: 'claude',
                apiKey: process.env.ANTHROPIC_API_KEY,
                enabled: true,
                priority: 2
            });
        }
    }
    async generateContent(request) {
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
        }
        catch (error) {
            const generationTime = Date.now() - startTime;
            const errorResult = {
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
    async generatePost(userId, category, platform, preferences, context = {}) {
        const request = {
            user_id: userId,
            request_type: 'complete_post',
            prompt: (0, content_templates_1.generatePrompt)(category, platform, preferences, context),
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
    async generateCaption(userId, category, platform, preferences, context = {}) {
        const request = {
            user_id: userId,
            request_type: 'caption',
            prompt: (0, content_templates_1.generatePrompt)(category, platform, preferences, context),
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
    async generateImage(userId, category, platform, preferences, context = {}) {
        const request = {
            user_id: userId,
            request_type: 'image',
            prompt: (0, content_templates_1.generatePrompt)(category, platform, preferences, context),
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
    async generateReply(userId, originalComment, originalPost, tone = 'friendly') {
        const prompt = `Write a ${tone} reply to this social media comment: "${originalComment}"

The original post was: "${originalPost}"

Requirements:
- Keep it conversational and authentic
- Address the comment directly
- Match the requested tone: ${tone}
- Keep it under 100 words
- Include relevant emojis if appropriate for the tone`;
        const request = {
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
    async generateHashtags(userId, content, platform, count = 10) {
        const prompt = `Generate ${count} relevant hashtags for this social media content: "${content}"

Platform: ${platform}

Requirements:
- Hashtags should be relevant to the content
- Mix of popular and niche hashtags
- Platform-appropriate format (no # for LinkedIn, with # for others)
- Current and trending where possible
- Avoid overly generic hashtags unless relevant`;
        const request = {
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
    async selectBestProvider(request) {
        const availableProviders = this.providerConfigs
            .filter(config => config.enabled)
            .sort((a, b) => a.priority - b.priority);
        for (const config of availableProviders) {
            const provider = this.providers.get(config.name);
            if (provider) {
                try {
                    // Simple health check - we could add more sophisticated provider selection
                    return provider;
                }
                catch (error) {
                    console.warn(`Provider ${config.name} is not available:`, error);
                    continue;
                }
            }
        }
        return null;
    }
    parseGeneratedContent(content, platform) {
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
    extractHashtags(content, platform) {
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
    async logGeneration(request, result) {
        try {
            await (0, database_1.db)('ai_generation_logs').insert({
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
        }
        catch (error) {
            console.error('Failed to log AI generation:', error);
            // Don't throw error - logging failure shouldn't break the main flow
        }
    }
    async getGenerationStats(userId, period = 'month') {
        const periodMap = {
            day: '24 hours',
            week: '7 days',
            month: '30 days'
        };
        const stats = await (0, database_1.db)('ai_generation_logs')
            .where('user_id', userId)
            .where('created_at', '>=', database_1.db.raw(`NOW() - INTERVAL '${periodMap[period]}'`))
            .select(database_1.db.raw('COUNT(*) as total_generations'), database_1.db.raw('SUM(cost_usd) as total_cost'), database_1.db.raw('AVG(quality_score) as average_quality_score'), database_1.db.raw('mode() WITHIN GROUP (ORDER BY model_used) as most_used_model'))
            .first();
        const generationsByType = await (0, database_1.db)('ai_generation_logs')
            .where('user_id', userId)
            .where('created_at', '>=', database_1.db.raw(`NOW() - INTERVAL '${periodMap[period]}'`))
            .select('request_type')
            .count('* as count')
            .groupBy('request_type');
        const typeStats = generationsByType.reduce((acc, row) => {
            acc[row.request_type] = parseInt(row.count);
            return acc;
        }, {});
        return {
            total_generations: parseInt(stats.total_generations) || 0,
            total_cost: parseFloat(stats.total_cost) || 0,
            average_quality_score: parseFloat(stats.average_quality_score) || 0,
            most_used_model: stats.most_used_model || 'none',
            generations_by_type: typeStats
        };
    }
}
exports.ContentGenerationService = ContentGenerationService;
//# sourceMappingURL=content-generation-service.js.map
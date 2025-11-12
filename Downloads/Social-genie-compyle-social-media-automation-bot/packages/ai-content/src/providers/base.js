"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProvider = void 0;
class AIProvider {
    name;
    apiKey;
    maxTokens;
    costPerToken;
    constructor(name, apiKey, maxTokens, costPerToken) {
        this.name = name;
        this.apiKey = apiKey;
        this.maxTokens = maxTokens;
        this.costPerToken = costPerToken;
    }
    async generateContent(request) {
        const startTime = Date.now();
        try {
            switch (request.request_type) {
                case 'caption':
                case 'reply':
                case 'hashtag':
                case 'complete_post':
                    return await this.generateText(request.prompt, {
                        maxTokens: request.preferences?.length === 'long' ? 1000 : 500,
                        temperature: request.preferences?.creativity_level ? request.preferences.creativity_level / 10 : 0.7
                    });
                case 'image':
                    return await this.generateImage(request.prompt, {
                        size: '1024x1024',
                        quality: 'standard',
                        style: request.preferences?.tone === 'professional' ? 'natural' : 'vivid'
                    });
                default:
                    throw new Error(`Unsupported request type: ${request.request_type}`);
            }
        }
        catch (error) {
            const generationTime = Date.now() - startTime;
            return {
                content: '',
                confidence_score: 0,
                quality_score: 0,
                tokens_used: 0,
                cost_usd: 0,
                generation_time_ms: generationTime,
                model_used: '',
                provider: this.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    calculateCost(tokensUsed) {
        return tokensUsed * this.costPerToken;
    }
    calculateQualityScore(content) {
        // Simple quality scoring based on content characteristics
        let score = 5; // Base score
        // Length appropriateness
        if (content.length >= 50 && content.length <= 1000) {
            score += 1;
        }
        // Presence of relevant elements
        if (content.includes('#'))
            score += 0.5; // Hashtags
        if (content.match(/\?/))
            score += 0.5; // Questions
        if (content.match(/!/))
            score += 0.5; // Exclamations
        // Grammar and structure (simple checks)
        if (content.match(/^[A-Z]/))
            score += 0.5; // Starts with capital
        if (content.match(/[.!?]$/))
            score += 0.5; // Ends with punctuation
        return Math.min(10, score);
    }
    calculateConfidenceScore(qualityScore, generationTime) {
        // Confidence based on quality and generation speed
        const timeScore = Math.max(0, 10 - (generationTime / 1000)); // Penalize slow generation
        return (qualityScore * 0.7) + (timeScore * 0.3);
    }
}
exports.AIProvider = AIProvider;
//# sourceMappingURL=base.js.map
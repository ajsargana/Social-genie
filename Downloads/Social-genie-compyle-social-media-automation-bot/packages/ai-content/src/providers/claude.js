"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const base_1 = require("./base");
class ClaudeProvider extends base_1.AIProvider {
    client;
    constructor(apiKey) {
        super('claude', apiKey, 200000, 0.000015); // Claude 3.5 Sonnet pricing
        this.client = new sdk_1.default({ apiKey });
    }
    async generateText(prompt, options = {}) {
        const startTime = Date.now();
        try {
            const message = await this.client.messages.create({
                model: options.model || 'claude-3-5-sonnet-20241022',
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7,
                messages: [{ role: 'user', content: prompt }]
            });
            const content = message.content[0]?.type === 'text' ? message.content[0].text : '';
            const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;
            const generationTime = Date.now() - startTime;
            const cost = this.calculateCost(tokensUsed);
            const qualityScore = this.calculateQualityScore(content);
            const confidenceScore = this.calculateConfidenceScore(qualityScore, generationTime);
            return {
                content,
                confidence_score: confidenceScore,
                quality_score: qualityScore,
                tokens_used: tokensUsed,
                cost_usd: cost,
                generation_time_ms: generationTime,
                model_used: options.model || 'claude-3-5-sonnet-20241022',
                provider: this.name
            };
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
                model_used: options.model || 'claude-3-5-sonnet-20241022',
                provider: this.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async generateImage(prompt, options = {}) {
        // Claude does not support image generation directly
        // This would need to be implemented through a different service
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
            error: 'Claude does not support image generation'
        };
    }
}
exports.ClaudeProvider = ClaudeProvider;
//# sourceMappingURL=claude.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const base_1 = require("./base");
class OpenAIProvider extends base_1.AIProvider {
    client;
    constructor(apiKey) {
        super('openai', apiKey, 128000, 0.00001); // GPT-5 pricing
        this.client = new openai_1.default({ apiKey });
    }
    async generateText(prompt, options = {}) {
        const startTime = Date.now();
        try {
            const completion = await this.client.chat.completions.create({
                model: options.model || 'gpt-5',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7
            });
            const content = completion.choices[0]?.message?.content || '';
            const tokensUsed = completion.usage?.total_tokens || 0;
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
                model_used: options.model || 'gpt-5',
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
                model_used: options.model || 'gpt-5',
                provider: this.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async generateImage(prompt, options = {}) {
        const startTime = Date.now();
        try {
            const response = await this.client.images.generate({
                model: 'dall-e-3',
                prompt,
                n: 1,
                size: options.size || '1024x1024',
                quality: options.quality || 'standard',
                style: options.style || 'vivid'
            });
            const imageUrl = response.data[0]?.url || '';
            const generationTime = Date.now() - startTime;
            const cost = 0.04; // DALL-E 3 pricing
            return {
                content: imageUrl,
                media_urls: imageUrl ? [imageUrl] : [],
                confidence_score: imageUrl ? 8 : 0,
                quality_score: imageUrl ? 7 : 0,
                tokens_used: 0,
                cost_usd: cost,
                generation_time_ms: generationTime,
                model_used: 'dall-e-3',
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
                model_used: 'dall-e-3',
                provider: this.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.js.map
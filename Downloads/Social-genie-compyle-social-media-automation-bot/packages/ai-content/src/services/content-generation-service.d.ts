import { AIGenerationRequest, AIGenerationResult, ContentCategory, SocialPlatform, ContentGenerationPreferences } from '@social-genie/shared-types';
export interface AIProviderConfig {
    name: string;
    apiKey: string;
    enabled: boolean;
    priority: number;
}
export declare class ContentGenerationService {
    private providers;
    private providerConfigs;
    constructor();
    private initializeProviders;
    generateContent(request: AIGenerationRequest): Promise<AIGenerationResult>;
    generatePost(userId: string, category: ContentCategory, platform: SocialPlatform, preferences: ContentGenerationPreferences, context?: Record<string, any>): Promise<{
        content: string;
        hashtags: string[];
        media_urls?: string[];
        confidence_score: number;
        quality_score: number;
    }>;
    generateCaption(userId: string, category: ContentCategory, platform: SocialPlatform, preferences: ContentGenerationPreferences, context?: Record<string, any>): Promise<string>;
    generateImage(userId: string, category: ContentCategory, platform: SocialPlatform, preferences: ContentGenerationPreferences, context?: Record<string, any>): Promise<string[]>;
    generateReply(userId: string, originalComment: string, originalPost: string, tone?: string): Promise<string>;
    generateHashtags(userId: string, content: string, platform: SocialPlatform, count?: number): Promise<string[]>;
    private selectBestProvider;
    private parseGeneratedContent;
    private extractHashtags;
    private logGeneration;
    getGenerationStats(userId: string, period?: 'day' | 'week' | 'month'): Promise<{
        total_generations: number;
        total_cost: number;
        average_quality_score: number;
        most_used_model: string;
        generations_by_type: Record<string, number>;
    }>;
}
//# sourceMappingURL=content-generation-service.d.ts.map
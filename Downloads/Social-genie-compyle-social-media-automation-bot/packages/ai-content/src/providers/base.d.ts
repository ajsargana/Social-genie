import { AIGenerationRequest, AIGenerationResult } from '@social-genie/shared-types';
export declare abstract class AIProvider {
    protected name: string;
    protected apiKey: string;
    protected maxTokens: number;
    protected costPerToken: number;
    constructor(name: string, apiKey: string, maxTokens: number, costPerToken: number);
    abstract generateText(prompt: string, options?: {
        maxTokens?: number;
        temperature?: number;
        model?: string;
    }): Promise<AIGenerationResult>;
    abstract generateImage(prompt: string, options?: {
        size?: string;
        quality?: string;
        style?: string;
    }): Promise<AIGenerationResult>;
    generateContent(request: AIGenerationRequest): Promise<AIGenerationResult>;
    protected calculateCost(tokensUsed: number): number;
    protected calculateQualityScore(content: string): number;
    protected calculateConfidenceScore(qualityScore: number, generationTime: number): number;
}
//# sourceMappingURL=base.d.ts.map
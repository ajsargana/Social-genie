import { AIProvider } from './base';
import { AIGenerationResult } from '@social-genie/shared-types';
export declare class ClaudeProvider extends AIProvider {
    private client;
    constructor(apiKey: string);
    generateText(prompt: string, options?: {
        maxTokens?: number;
        temperature?: number;
        model?: string;
    }): Promise<AIGenerationResult>;
    generateImage(prompt: string, options?: {
        size?: string;
        quality?: string;
        style?: string;
    }): Promise<AIGenerationResult>;
}
//# sourceMappingURL=claude.d.ts.map
import { ContentCategory, SocialPlatform, ContentGenerationPreferences } from '@social-genie/shared-types';
export interface ContentTemplate {
    category: ContentCategory;
    prompts: {
        caption: string[];
        image: string[];
        hashtags: string[];
    };
    fallbackTopics: string[];
}
export declare const CONTENT_TEMPLATES: Record<ContentCategory, ContentTemplate>;
export declare function getContentTemplate(category: ContentCategory): ContentTemplate;
export declare function generatePrompt(category: ContentCategory, platform: SocialPlatform, preferences: ContentGenerationPreferences, context?: Record<string, any>): string;
//# sourceMappingURL=content-templates.d.ts.map
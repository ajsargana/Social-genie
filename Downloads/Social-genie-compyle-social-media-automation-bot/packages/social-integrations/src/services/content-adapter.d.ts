import { SocialPlatform, ContentPost, ContentGenerationPreferences } from '@social-genie/shared-types';
export interface PlatformSpecificContent {
    text: string;
    hashtags?: string[];
    media?: string[];
    mentions?: string[];
    additionalData?: Record<string, any>;
}
export declare class ContentAdapter {
    static adaptContent(originalPost: ContentPost, platform: SocialPlatform, preferences?: ContentGenerationPreferences): PlatformSpecificContent;
    private static adaptForTwitter;
    private static adaptForInstagram;
    private static adaptForFacebook;
    private static adaptForLinkedIn;
    private static adaptForTikTok;
    private static adaptForYouTube;
    private static adaptForPinterest;
    private static adaptGeneric;
    private static extractMentions;
    private static generateAltText;
    static optimizeForTiming(platform: SocialPlatform, content: string): {
        optimalTimes: number[];
        bestDays: number[];
    };
    static generateCrossPlatformStrategy(content: ContentPost, platforms: SocialPlatform[]): Array<{
        platform: SocialPlatform;
        delay: number;
        adaptedContent: PlatformSpecificContent;
    }>;
    private static calculateOptimalDelay;
}
//# sourceMappingURL=content-adapter.d.ts.map
import { SocialPlatformIntegration } from '../providers/base';
import { SocialPlatform } from '@social-genie/shared-types';
export interface IntegrationConfig {
    platform: SocialPlatform;
    apiKey?: string;
    apiSecret?: string;
    [key: string]: any;
}
export declare class PlatformIntegrationFactory {
    private static instances;
    static create(config: IntegrationConfig): SocialPlatformIntegration;
    static createForUnifiedAPI(): SocialPlatformIntegration;
    static clearCache(): void;
    static getSupportedPlatforms(): SocialPlatform[];
    static getPlatformCapabilities(platform: SocialPlatform): any;
    private static getMaxCharacters;
    private static getMaxHashtags;
}
//# sourceMappingURL=platform-factory.d.ts.map
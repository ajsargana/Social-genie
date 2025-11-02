import { SocialPlatformIntegration } from '../providers/base';
import { AyrshareIntegration } from '../providers/ayrshare';
import { TwitterIntegration } from '../providers/twitter';
import { SocialPlatform } from '@social-genie/shared-types';

export interface IntegrationConfig {
  platform: SocialPlatform;
  apiKey?: string;
  apiSecret?: string;
  [key: string]: any;
}

export class PlatformIntegrationFactory {
  private static instances: Map<string, SocialPlatformIntegration> = new Map();

  static create(config: IntegrationConfig): SocialPlatformIntegration {
    const cacheKey = `${config.platform}-${JSON.stringify(config)}`;

    // Return cached instance if available
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    let integration: SocialPlatformIntegration;

    switch (config.platform) {
      case 'ayrshare':
        if (!config.apiKey) {
          throw new Error('Ayrshare integration requires API key');
        }
        integration = new AyrshareIntegration(config.apiKey);
        break;

      case 'twitter':
        if (!config.apiKey || !config.apiSecret) {
          throw new Error('Twitter integration requires API key and secret');
        }
        integration = new TwitterIntegration(config.apiKey, config.apiSecret);
        break;

      default:
        // For platforms not directly implemented, use Ayrshare as fallback
        if (process.env.AYRSHARE_API_KEY) {
          integration = new AyrshareIntegration(process.env.AYRSHARE_API_KEY);
        } else {
          throw new Error(`Unsupported platform: ${config.platform}`);
        }
    }

    // Cache the instance
    this.instances.set(cacheKey, integration);
    return integration;
  }

  static createForUnifiedAPI(): SocialPlatformIntegration {
    // Create integration that handles multiple platforms via Ayrshare
    if (!process.env.AYRSHARE_API_KEY) {
      throw new Error('AYRSHARE_API_KEY is required for unified API');
    }

    return new AyrshareIntegration(process.env.AYRSHARE_API_KEY);
  }

  static clearCache(): void {
    this.instances.clear();
  }

  static getSupportedPlatforms(): SocialPlatform[] {
    return [
      'twitter',
      'facebook',
      'instagram',
      'linkedin',
      'tiktok',
      'youtube',
      'pinterest'
    ];
  }

  static getPlatformCapabilities(platform: SocialPlatform): any {
    // This would return platform-specific capabilities
    // For now, return basic info
    return {
      supportsText: true,
      supportsImages: ['instagram', 'facebook', 'twitter', 'linkedin', 'pinterest'].includes(platform),
      supportsVideos: ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'].includes(platform),
      supportsStories: ['instagram', 'facebook'].includes(platform),
      maxCharacters: this.getMaxCharacters(platform),
      maxHashtags: this.getMaxHashtags(platform)
    };
  }

  private static getMaxCharacters(platform: SocialPlatform): number {
    const limits = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206,
      linkedin: 3000,
      tiktok: 150,
      youtube: 5000,
      pinterest: 500
    };

    return limits[platform] || 280;
  }

  private static getMaxHashtags(platform: SocialPlatform): number {
    const limits = {
      twitter: 10,
      instagram: 30,
      facebook: 50,
      linkedin: 20,
      tiktok: 5,
      youtube: 15,
      pinterest: 20
    };

    return limits[platform] || 10;
  }
}
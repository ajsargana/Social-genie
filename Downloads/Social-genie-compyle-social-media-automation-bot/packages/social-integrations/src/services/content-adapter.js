"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentAdapter = void 0;
const shared_types_1 = require("@social-genie/shared-types");
class ContentAdapter {
    static adaptContent(originalPost, platform, preferences) {
        const capabilities = shared_types_1.PLATFORM_CAPABILITIES[platform];
        switch (platform) {
            case 'twitter':
                return this.adaptForTwitter(originalPost, capabilities);
            case 'instagram':
                return this.adaptForInstagram(originalPost, capabilities);
            case 'facebook':
                return this.adaptForFacebook(originalPost, capabilities);
            case 'linkedin':
                return this.adaptForLinkedIn(originalPost, capabilities);
            case 'tiktok':
                return this.adaptForTikTok(originalPost, capabilities);
            case 'youtube':
                return this.adaptForYouTube(originalPost, capabilities);
            case 'pinterest':
                return this.adaptForPinterest(originalPost, capabilities);
            default:
                return this.adaptGeneric(originalPost, capabilities);
        }
    }
    static adaptForTwitter(post, capabilities) {
        let text = post.content_text;
        // Truncate to Twitter's character limit
        if (text.length > capabilities.max_characters) {
            text = text.substring(0, capabilities.max_characters - 3) + '...';
        }
        // Extract and limit hashtags
        const hashtags = post.hashtags.slice(0, 3); // Twitter best practice
        const mentions = this.extractMentions(text);
        // Limit media to Twitter's maximum
        const media = post.media_urls.slice(0, capabilities.max_images);
        return {
            text,
            hashtags,
            media,
            mentions
        };
    }
    static adaptForInstagram(post, capabilities) {
        // Instagram puts hashtags at the end of captions
        let text = post.content_text;
        const hashtags = post.hashtags.slice(0, capabilities.max_hashtags);
        // Add hashtags at the end if they're not already there
        if (hashtags.length > 0 && !text.includes('#')) {
            text += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
        }
        // Limit media to Instagram's maximum
        const media = post.media_urls.slice(0, capabilities.max_images);
        return {
            text,
            hashtags,
            media,
            additionalData: {
                mediaType: post.media_type === 'video' ? 'reel' : 'post'
            }
        };
    }
    static adaptForFacebook(post, capabilities) {
        // Facebook allows longer content and more media
        const text = post.content_text;
        const hashtags = post.hashtags.slice(0, capabilities.max_hashtags);
        const media = post.media_urls.slice(0, capabilities.max_images);
        return {
            text,
            hashtags,
            media,
            additionalData: {
                postType: post.media_type === 'video' ? 'video_post' : 'feed_post'
            }
        };
    }
    static adaptForLinkedIn(post, capabilities) {
        // LinkedIn prefers professional tone and structure
        let text = post.content_text;
        // Add professional formatting if needed
        if (!text.includes('\n') && text.length > 200) {
            // Add paragraph breaks for readability
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            text = sentences.join('\n\n');
        }
        const hashtags = post.hashtags.slice(0, capabilities.max_hashtags);
        const media = post.media_urls.slice(0, capabilities.max_images);
        return {
            text,
            hashtags,
            media,
            additionalData: {
                tone: 'professional',
                postType: 'activity'
            }
        };
    }
    static adaptForTikTok(post, capabilities) {
        // TikTok is primarily video-focused with short captions
        let text = post.content_text;
        // Keep it short and catchy
        if (text.length > capabilities.max_characters) {
            text = text.substring(0, capabilities.max_characters - 3) + '...';
        }
        // Add trending hashtags if available
        const hashtags = post.hashtags.slice(0, capabilities.max_hashtags);
        // TikTok doesn't use traditional image posts
        const media = post.media_type === 'video' ? post.media_urls.slice(0, 1) : [];
        return {
            text,
            hashtags,
            media,
            additionalData: {
                postType: 'video',
                duration: 'short' // TikTok prefers shorter videos
            }
        };
    }
    static adaptForYouTube(post, capabilities) {
        // YouTube focuses on video descriptions
        let text = post.content_text;
        // Add structured description format
        if (!text.includes('\n')) {
            text = `${text}\n\n---\n#SocialMedia #Automation`;
        }
        const hashtags = post.hashtags.slice(0, capabilities.max_hashtags);
        const media = post.media_type === 'video' ? post.media_urls.slice(0, 1) : [];
        return {
            text,
            hashtags,
            media,
            additionalData: {
                contentType: 'video',
                description: text,
                tags: hashtags
            }
        };
    }
    static adaptForPinterest(post, capabilities) {
        // Pinterest is visual-first with descriptive text
        let text = post.content_text;
        // Add descriptive elements for Pinterest
        if (text.length < 100) {
            text = `${text}\n\nDiscover more amazing content like this!`;
        }
        const hashtags = post.hashtags.slice(0, capabilities.max_hashtags);
        const media = post.media_urls.slice(0, capabilities.max_images); // Pinterest typically uses single images
        return {
            text,
            hashtags,
            media,
            additionalData: {
                pinType: 'pin',
                description: text,
                altText: this.generateAltText(text)
            }
        };
    }
    static adaptGeneric(post, capabilities) {
        // Generic adaptation for unknown platforms
        const text = post.content_text.length > capabilities.max_characters
            ? post.content_text.substring(0, capabilities.max_characters - 3) + '...'
            : post.content_text;
        const hashtags = post.hashtags.slice(0, capabilities.max_hashtags);
        const media = post.media_urls.slice(0, capabilities.max_images || 1);
        return {
            text,
            hashtags,
            media
        };
    }
    static extractMentions(text) {
        const mentionRegex = /@[\w]+/g;
        return text.match(mentionRegex) || [];
    }
    static generateAltText(text) {
        // Generate alt text from the first sentence of content
        const firstSentence = text.split('.')[0];
        return firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
    }
    static optimizeForTiming(platform, content) {
        const platformOptimization = {
            twitter: {
                optimalTimes: [9, 12, 15, 18], // 9 AM, 12 PM, 3 PM, 6 PM
                bestDays: [1, 2, 3, 4] // Tuesday-Friday
            },
            instagram: {
                optimalTimes: [8, 11, 14, 17, 19], // 8 AM, 11 AM, 2 PM, 5 PM, 7 PM
                bestDays: [1, 2, 3, 4, 5] // Monday-Friday
            },
            facebook: {
                optimalTimes: [9, 12, 15], // 9 AM, 12 PM, 3 PM
                bestDays: [1, 2, 3, 4] // Tuesday-Friday
            },
            linkedin: {
                optimalTimes: [8, 12, 17], // 8 AM, 12 PM, 5 PM
                bestDays: [1, 2, 3, 4] // Tuesday-Friday
            },
            tiktok: {
                optimalTimes: [12, 15, 19, 21], // 12 PM, 3 PM, 7 PM, 9 PM
                bestDays: [0, 1, 2, 3, 4, 5, 6] // All days
            },
            youtube: {
                optimalTimes: [14, 16, 18], // 2 PM, 4 PM, 6 PM
                bestDays: [1, 2, 3, 4, 5] // Monday-Friday
            },
            pinterest: {
                optimalTimes: [20, 21, 22], // 8 PM, 9 PM, 10 PM
                bestDays: [5, 6, 0] // Friday, Saturday, Sunday
            }
        };
        return platformOptimization[platform] || platformOptimization.twitter;
    }
    static generateCrossPlatformStrategy(content, platforms) {
        const strategy = platforms.map(platform => ({
            platform,
            delay: this.calculateOptimalDelay(platform),
            adaptedContent: this.adaptContent(content, platform)
        }));
        // Sort by delay to create a posting sequence
        return strategy.sort((a, b) => a.delay - b.delay);
    }
    static calculateOptimalDelay(platform) {
        // Calculate optimal posting delay for each platform
        const delays = {
            twitter: 0, // Post immediately
            instagram: 120, // 2 hours later
            facebook: 240, // 4 hours later
            linkedin: 480, // 8 hours later
            tiktok: 60, // 1 hour later
            youtube: 1440, // Next day
            pinterest: 180 // 3 hours later
        };
        return delays[platform] || 0;
    }
}
exports.ContentAdapter = ContentAdapter;
//# sourceMappingURL=content-adapter.js.map
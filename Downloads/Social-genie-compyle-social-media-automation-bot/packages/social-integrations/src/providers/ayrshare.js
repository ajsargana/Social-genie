"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AyrshareIntegration = void 0;
const axios_1 = __importDefault(require("axios"));
const base_1 = require("./base");
class AyrshareIntegration extends base_1.SocialPlatformIntegration {
    apiKey;
    baseUrl = 'https://api.ayrshare.com';
    constructor(apiKey) {
        super('ayrshare');
        this.apiKey = apiKey;
    }
    async postContent(post) {
        try {
            // Ayrshare uses a unified API for multiple platforms
            const platforms = [this.mapPlatformToAyrshare(post.social_account.platform)];
            const payload = {
                post: post.content_post.content_text,
                platforms,
                mediaUrls: post.content_post.media_urls
            };
            // Add hashtags for platforms that support them
            if (post.content_post.hashtags.length > 0) {
                const hashtags = post.content_post.hashtags.map(tag => `#${tag}`).join(' ');
                payload.post += `\n\n${hashtags}`;
            }
            const response = await axios_1.default.post(`${this.baseUrl}/post`, payload, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const platformPost = response.data.platformPosts.find(p => p.platform === this.mapPlatformToAyrshare(post.social_account.platform));
            if (!platformPost) {
                throw new Error('No platform post returned from Ayrshare');
            }
            return {
                platform_post_id: platformPost.id,
                status: platformPost.status === 'success' ? 'posted' : 'failed',
                response: response.data
            };
        }
        catch (error) {
            return {
                platform_post_id: '',
                status: 'failed',
                error: this.handleError(error, 'postContent')
            };
        }
    }
    async getAnalytics(postId) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/analytics`, { id: postId }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const analytics = response.data;
            const platformData = analytics.platforms[0] || analytics.total;
            return {
                id: '',
                scheduled_post_id: postId,
                platform: this.platform,
                likes: platformData.likes || 0,
                comments: platformData.comments || 0,
                shares: platformData.shares || 0,
                views: platformData.views || 0,
                clicks: platformData.clicks || 0,
                engagement_rate: this.calculateEngagementRate(platformData),
                analytics_data: analytics,
                recorded_at: new Date()
            };
        }
        catch (error) {
            throw this.handleError(error, 'getAnalytics');
        }
    }
    async getComments(postId) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/comments`, { id: postId }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.comments.map(comment => ({
                id: comment.id,
                social_account_id: '', // Would need to be passed in
                platform_comment_id: comment.id,
                platform_post_id: postId,
                author_platform_id: comment.user,
                author_name: comment.user,
                author_username: comment.user,
                comment_text: comment.comment,
                comment_type: 'comment',
                auto_reply_sent: false,
                created_at: new Date(comment.date),
                updated_at: new Date(comment.date)
            }));
        }
        catch (error) {
            throw this.handleError(error, 'getComments');
        }
    }
    async postComment(postId, comment) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/comment`, {
                id: postId,
                comment: comment
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                platform_comment_id: response.data.id || '',
                status: 'posted',
                response: response.data
            };
        }
        catch (error) {
            return {
                platform_comment_id: '',
                status: 'failed',
                error: this.handleError(error, 'postComment')
            };
        }
    }
    async refreshToken(refreshToken) {
        // Ayrshare uses API keys, not OAuth tokens
        throw new Error('Ayrshare uses API keys, not OAuth tokens');
    }
    async validateToken(token) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.status === 200;
        }
        catch {
            return false;
        }
    }
    async getOAuthUrl(redirectUri, scopes) {
        // Ayrshare doesn't use OAuth
        throw new Error('Ayrshare uses API keys, not OAuth');
    }
    async exchangeCodeForToken(code, redirectUri) {
        // Ayrshare doesn't use OAuth
        throw new Error('Ayrshare uses API keys, not OAuth');
    }
    mapPlatformToAyrshare(platform) {
        const mapping = {
            twitter: 'twitter',
            facebook: 'facebook',
            instagram: 'instagram',
            linkedin: 'linkedin',
            pinterest: 'pinterest',
            tiktok: 'tiktok',
            youtube: 'youtube'
        };
        return mapping[platform] || platform;
    }
    calculateEngagementRate(data) {
        const total = (data.likes || 0) + (data.comments || 0) + (data.shares || 0);
        const views = data.views || 1;
        return Number(((total / views) * 100).toFixed(2));
    }
}
exports.AyrshareIntegration = AyrshareIntegration;
//# sourceMappingURL=ayrshare.js.map
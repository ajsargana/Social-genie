"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterIntegration = void 0;
const axios_1 = __importDefault(require("axios"));
const base_1 = require("./base");
const shared_types_1 = require("@social-genie/shared-types");
class TwitterIntegration extends base_1.SocialPlatformIntegration {
    apiKey;
    apiSecret;
    baseUrl = 'https://api.twitter.com/2';
    constructor(apiKey, apiSecret) {
        super('twitter');
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    async postContent(post) {
        try {
            const token = await this.tokenManager.refreshIfNeeded(post.social_account);
            const capabilities = shared_types_1.PLATFORM_CAPABILITIES.twitter;
            // Adapt content for Twitter
            let tweetText = this.adaptContentForTwitter(post.content_post.content_text, capabilities);
            // Upload media if present
            let mediaIds = [];
            if (post.content_post.media_urls.length > 0) {
                for (const mediaUrl of post.content_post.media_urls.slice(0, capabilities.max_images)) {
                    const mediaId = await this.uploadMedia(mediaUrl, token.access_token);
                    mediaIds.push(mediaId);
                }
            }
            const payload = {
                text: tweetText
            };
            if (mediaIds.length > 0) {
                payload.media = { media_ids: mediaIds };
            }
            const response = await axios_1.default.post(`${this.baseUrl}/tweets`, payload, {
                headers: {
                    'Authorization': `Bearer ${token.access_token}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                platform_post_id: response.data.data.id,
                status: 'posted',
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
            // Get social account token (this would need to be passed in or cached)
            const token = ''; // Would need to be retrieved
            const response = await axios_1.default.get(`${this.baseUrl}/tweets/${postId}`, {
                params: {
                    'tweet.fields': 'public_metrics'
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const metrics = response.data.data.public_metrics;
            return {
                id: '',
                scheduled_post_id: postId,
                platform: this.platform,
                likes: metrics.like_count,
                comments: metrics.reply_count,
                shares: metrics.retweet_count + metrics.quote_count,
                views: metrics.impression_count,
                clicks: 0, // Twitter doesn't provide click counts in v2 API
                engagement_rate: this.calculateEngagementRate(metrics),
                analytics_data: metrics,
                recorded_at: new Date()
            };
        }
        catch (error) {
            throw this.handleError(error, 'getAnalytics');
        }
    }
    async getComments(postId) {
        try {
            const token = ''; // Would need to be retrieved
            const response = await axios_1.default.get(`${this.baseUrl}/tweets/search/recent`, {
                params: {
                    'query': `conversation_id:${postId}`,
                    'tweet.fields': 'author_id,created_at,public_metrics',
                    'expansions': 'author_id'
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Process comments (this would need more complex logic to handle user lookups)
            return response.data.data?.map((tweet) => ({
                id: tweet.id,
                social_account_id: '',
                platform_comment_id: tweet.id,
                platform_post_id: postId,
                author_platform_id: tweet.author_id,
                author_name: '', // Would need user lookup
                author_username: '', // Would need user lookup
                comment_text: tweet.text,
                comment_type: tweet.in_reply_to_user_id ? 'reply' : 'comment',
                auto_reply_sent: false,
                created_at: new Date(tweet.created_at),
                updated_at: new Date(tweet.created_at)
            })) || [];
        }
        catch (error) {
            throw this.handleError(error, 'getComments');
        }
    }
    async postComment(postId, comment) {
        try {
            const token = ''; // Would need to be retrieved
            const response = await axios_1.default.post(`${this.baseUrl}/tweets`, {
                text: comment,
                reply: {
                    in_reply_to_tweet_id: postId
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                platform_comment_id: response.data.data.id,
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
        try {
            const response = await axios_1.default.post('https://api.twitter.com/2/oauth2/token', new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    username: this.apiKey,
                    password: this.apiSecret
                }
            });
            const data = response.data;
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: new Date(Date.now() + (data.expires_in * 1000)),
                scope: data.scope?.split(' ') || [],
                token_type: data.token_type
            };
        }
        catch (error) {
            throw this.handleError(error, 'refreshToken');
        }
    }
    async validateToken(token) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/users/me`, {
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
        const state = Math.random().toString(36).substring(2, 15);
        const params = new URLSearchParams({
            'response_type': 'code',
            'client_id': this.apiKey,
            'redirect_uri': redirectUri,
            'scope': scopes.join(' '),
            'state': state,
            'code_challenge': this.generateCodeChallenge(state),
            'code_challenge_method': 'S256'
        });
        return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    }
    async exchangeCodeForToken(code, redirectUri) {
        try {
            const response = await axios_1.default.post('https://api.twitter.com/2/oauth2/token', new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirectUri
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    username: this.apiKey,
                    password: this.apiSecret
                }
            });
            const data = response.data;
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: new Date(Date.now() + (data.expires_in * 1000)),
                scope: data.scope?.split(' ') || [],
                token_type: data.token_type
            };
        }
        catch (error) {
            throw this.handleError(error, 'exchangeCodeForToken');
        }
    }
    adaptContentForTwitter(content, capabilities) {
        // Truncate to Twitter's character limit
        if (content.length > capabilities.max_characters) {
            return content.substring(0, capabilities.max_characters - 3) + '...';
        }
        // Remove hashtags for Twitter (they should be integrated naturally)
        const hashtagRegex = /#[\w]+/g;
        let adaptedContent = content.replace(hashtagRegex, '').trim();
        return adaptedContent;
    }
    async uploadMedia(mediaUrl, token) {
        try {
            // First, initiate the upload
            const initResponse = await axios_1.default.post('https://upload.twitter.com/1.1/media/upload.json', {
                command: 'INIT',
                total_bytes: 0, // Would need to get file size
                media_type: 'image/jpeg', // Would need to detect media type
                media_category: 'tweet_image'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // For simplicity, this is a basic implementation
            // In production, you'd need to handle chunked uploads for larger files
            return initResponse.data.media_id_string;
        }
        catch (error) {
            throw new Error(`Media upload failed: ${error.message}`);
        }
    }
    generateCodeChallenge(verifier) {
        // Simple implementation - in production, use proper SHA256 hashing
        return verifier;
    }
    calculateEngagementRate(metrics) {
        const total = metrics.like_count + metrics.reply_count + metrics.retweet_count + metrics.quote_count;
        const impressions = metrics.impression_count || 1;
        return Number(((total / impressions) * 100).toFixed(2));
    }
}
exports.TwitterIntegration = TwitterIntegration;
//# sourceMappingURL=twitter.js.map
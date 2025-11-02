import axios from 'axios';
import { SocialPlatformIntegration, PostResult, CommentResult } from './base';
import {
  SocialPlatform,
  ScheduledPost,
  PostAnalytics,
  Comment,
  AuthToken,
  SocialAccount,
  PLATFORM_CAPABILITIES
} from '@social-genie/shared-types';

interface AyrsharePostRequest {
  post: string;
  platforms?: string[];
  mediaUrls?: string[];
  schedule?: string;
  orgs?: string;
}

interface AyrsharePostResponse {
  id: string;
  status: string;
  post: string;
  platformPosts: Array<{
    id: string;
    platform: string;
    status: string;
    postUrl: string;
  }>;
}

interface AyrshareAnalyticsResponse {
  post: string;
  total: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    clicks: number;
  };
  platforms: Array<{
    platform: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    clicks: number;
  }>;
}

interface AyrshareCommentsResponse {
  comments: Array<{
    id: string;
    user: string;
    comment: string;
    date: string;
    platform: string;
  }>;
}

export class AyrshareIntegration extends SocialPlatformIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.ayrshare.com';

  constructor(apiKey: string) {
    super('ayrshare' as SocialPlatform);
    this.apiKey = apiKey;
  }

  async postContent(post: ScheduledPost): Promise<PostResult> {
    try {
      // Ayrshare uses a unified API for multiple platforms
      const platforms = [this.mapPlatformToAyrshare(post.social_account.platform)];

      const payload: AyrsharePostRequest = {
        post: post.content_post.content_text,
        platforms,
        mediaUrls: post.content_post.media_urls
      };

      // Add hashtags for platforms that support them
      if (post.content_post.hashtags.length > 0) {
        const hashtags = post.content_post.hashtags.map(tag => `#${tag}`).join(' ');
        payload.post += `\n\n${hashtags}`;
      }

      const response = await axios.post<AyrsharePostResponse>(
        `${this.baseUrl}/post`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const platformPost = response.data.platformPosts.find(p =>
        p.platform === this.mapPlatformToAyrshare(post.social_account.platform)
      );

      if (!platformPost) {
        throw new Error('No platform post returned from Ayrshare');
      }

      return {
        platform_post_id: platformPost.id,
        status: platformPost.status === 'success' ? 'posted' : 'failed',
        response: response.data
      };

    } catch (error) {
      return {
        platform_post_id: '',
        status: 'failed',
        error: this.handleError(error, 'postContent')
      };
    }
  }

  async getAnalytics(postId: string): Promise<PostAnalytics> {
    try {
      const response = await axios.post<AyrshareAnalyticsResponse>(
        `${this.baseUrl}/analytics`,
        { id: postId },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

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

    } catch (error) {
      throw this.handleError(error, 'getAnalytics');
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    try {
      const response = await axios.post<AyrshareCommentsResponse>(
        `${this.baseUrl}/comments`,
        { id: postId },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

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

    } catch (error) {
      throw this.handleError(error, 'getComments');
    }
  }

  async postComment(postId: string, comment: string): Promise<CommentResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/comment`,
        {
          id: postId,
          comment: comment
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        platform_comment_id: response.data.id || '',
        status: 'posted',
        response: response.data
      };

    } catch (error) {
      return {
        platform_comment_id: '',
        status: 'failed',
        error: this.handleError(error, 'postComment')
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    // Ayrshare uses API keys, not OAuth tokens
    throw new Error('Ayrshare uses API keys, not OAuth tokens');
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/user`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getOAuthUrl(redirectUri: string, scopes: string[]): Promise<string> {
    // Ayrshare doesn't use OAuth
    throw new Error('Ayrshare uses API keys, not OAuth');
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<AuthToken> {
    // Ayrshare doesn't use OAuth
    throw new Error('Ayrshare uses API keys, not OAuth');
  }

  private mapPlatformToAyrshare(platform: SocialPlatform): string {
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

  private calculateEngagementRate(data: any): number {
    const total = (data.likes || 0) + (data.comments || 0) + (data.shares || 0);
    const views = data.views || 1;
    return Number(((total / views) * 100).toFixed(2));
  }
}
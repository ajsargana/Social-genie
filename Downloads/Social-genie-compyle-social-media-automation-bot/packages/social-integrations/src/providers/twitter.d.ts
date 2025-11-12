import { SocialPlatformIntegration, PostResult, CommentResult } from './base';
import { ScheduledPost, PostAnalytics, Comment, AuthToken } from '@social-genie/shared-types';
export declare class TwitterIntegration extends SocialPlatformIntegration {
    private apiKey;
    private apiSecret;
    private baseUrl;
    constructor(apiKey: string, apiSecret: string);
    postContent(post: ScheduledPost): Promise<PostResult>;
    getAnalytics(postId: string): Promise<PostAnalytics>;
    getComments(postId: string): Promise<Comment[]>;
    postComment(postId: string, comment: string): Promise<CommentResult>;
    refreshToken(refreshToken: string): Promise<AuthToken>;
    validateToken(token: string): Promise<boolean>;
    getOAuthUrl(redirectUri: string, scopes: string[]): Promise<string>;
    exchangeCodeForToken(code: string, redirectUri: string): Promise<AuthToken>;
    private adaptContentForTwitter;
    private uploadMedia;
    private generateCodeChallenge;
    private calculateEngagementRate;
}
//# sourceMappingURL=twitter.d.ts.map
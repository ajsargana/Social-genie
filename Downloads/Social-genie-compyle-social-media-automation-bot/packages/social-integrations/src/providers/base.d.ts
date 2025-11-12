import { SocialPlatform, ScheduledPost, PostAnalytics, Comment, SocialAccount, AuthToken, SocialMediaError } from '@social-genie/shared-types';
export declare abstract class SocialPlatformIntegration {
    protected platform: SocialPlatform;
    protected tokenManager: TokenManager;
    constructor(platform: SocialPlatform);
    abstract postContent(post: ScheduledPost): Promise<PostResult>;
    abstract getAnalytics(postId: string): Promise<PostAnalytics>;
    abstract getComments(postId: string): Promise<Comment[]>;
    abstract postComment(postId: string, comment: string): Promise<CommentResult>;
    abstract refreshToken(refreshToken: string): Promise<AuthToken>;
    abstract validateToken(token: string): Promise<boolean>;
    abstract getOAuthUrl(redirectUri: string, scopes: string[]): Promise<string>;
    abstract exchangeCodeForToken(code: string, redirectUri: string): Promise<AuthToken>;
    protected handleError(error: any, context: string): SocialMediaError;
    private isRetryableError;
    private getSuggestedAction;
}
export interface PostResult {
    platform_post_id: string;
    status: 'posted' | 'failed' | 'pending';
    response?: Record<string, any>;
    error?: SocialMediaError;
}
export interface CommentResult {
    platform_comment_id: string;
    status: 'posted' | 'failed';
    response?: Record<string, any>;
    error?: SocialMediaError;
}
export declare class TokenManager {
    encryptToken(token: string): Promise<string>;
    decryptToken(encryptedToken: string): Promise<string>;
    isTokenExpired(token: AuthToken): boolean;
    refreshIfNeeded(socialAccount: SocialAccount): Promise<AuthToken>;
}
//# sourceMappingURL=base.d.ts.map
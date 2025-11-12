import {
  SocialPlatform,
  ScheduledPost,
  PostAnalytics,
  Comment,
  SocialAccount,
  AuthToken,
  SocialMediaError
} from '@social-genie/shared-types';

export abstract class SocialPlatformIntegration {
  protected platform: SocialPlatform;
  protected tokenManager: TokenManager;

  constructor(platform: SocialPlatform) {
    this.platform = platform;
    this.tokenManager = new TokenManager();
  }

  abstract postContent(post: ScheduledPost): Promise<PostResult>;
  abstract getAnalytics(postId: string): Promise<PostAnalytics>;
  abstract getComments(postId: string): Promise<Comment[]>;
  abstract postComment(postId: string, comment: string): Promise<CommentResult>;
  abstract refreshToken(refreshToken: string): Promise<AuthToken>;
  abstract validateToken(token: string): Promise<boolean>;

  abstract getOAuthUrl(redirectUri: string, scopes: string[]): Promise<string>;
  abstract exchangeCodeForToken(code: string, redirectUri: string): Promise<AuthToken>;

  protected handleError(error: any, context: string): SocialMediaError {
    const statusCode = error.response?.status;
    const errorCode = error.response?.data?.error?.code || error.code;
    const errorMessage = error.response?.data?.error?.message || error.message;

    return {
      code: errorCode || 'UNKNOWN_ERROR',
      message: errorMessage || 'An unknown error occurred',
      platform: this.platform,
      status_code: statusCode,
      retry_possible: this.isRetryableError(statusCode, errorCode),
      suggested_action: this.getSuggestedAction(statusCode, errorCode)
    };
  }

  private isRetryableError(statusCode?: number, errorCode?: string): boolean {
    if (!statusCode) return true;

    // Retryable status codes
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    if (retryableStatusCodes.includes(statusCode)) return true;

    // Retryable error codes
    const retryableErrorCodes = [
      'rate_limit_exceeded',
      'temporarily_unavailable',
      'internal_error'
    ];
    if (errorCode && retryableErrorCodes.includes(errorCode)) return true;

    return false;
  }

  private getSuggestedAction(statusCode?: number, errorCode?: string): 'retry' | 'manual_review' | 'skip' | 'change_platform' {
    if (statusCode === 401 || errorCode === 'unauthorized') {
      return 'manual_review'; // Token refresh needed
    }

    if (statusCode === 403 || errorCode === 'forbidden') {
      return 'manual_review'; // Permission issue
    }

    if (statusCode === 429 || errorCode === 'rate_limit_exceeded') {
      return 'retry'; // Rate limiting
    }

    if (statusCode && statusCode >= 500) {
      return 'retry'; // Server errors
    }

    if (errorCode === 'content_violation' || errorCode === 'policy_violation') {
      return 'manual_review'; // Content policy issues
    }

    return 'skip'; // Default action
  }
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

export class TokenManager {
  async encryptToken(token: string): Promise<string> {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-characters-long!!', 'utf8');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  async decryptToken(encryptedToken: string): Promise<string> {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-characters-long!!', 'utf8');

    const parts = encryptedToken.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  isTokenExpired(token: AuthToken): boolean {
    if (!token.expires_at) return false;

    const expiryBuffer = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const now = Date.now();

    return token.expires_at.getTime() <= (now + expiryBuffer);
  }

  async refreshIfNeeded(socialAccount: SocialAccount): Promise<AuthToken> {
    try {
      const currentToken = await this.decryptToken(socialAccount.access_token_encrypted);
      const token: AuthToken = JSON.parse(currentToken);

      if (!this.isTokenExpired(token)) {
        return token;
      }

      // Token needs refresh
      if (!socialAccount.refresh_token_encrypted) {
        throw new Error('No refresh token available');
      }

      const refreshToken = await this.decryptToken(socialAccount.refresh_token_encrypted);

      // This would need to be implemented by each platform
      throw new Error('Token refresh not implemented for this platform');

    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
}
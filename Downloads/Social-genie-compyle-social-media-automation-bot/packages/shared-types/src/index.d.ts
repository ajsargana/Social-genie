export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    timezone: string;
    preferences: UserPreferences;
    created_at: Date;
    updated_at: Date;
}
export interface UserPreferences {
    content_categories: ContentCategory[];
    content_generation: ContentGenerationPreferences;
    account_type: 'business' | 'consumer' | 'global';
    notification_settings: NotificationSettings;
    ai_preferences: AIPreferences;
}
export interface ContentGenerationPreferences {
    tone: 'professional' | 'casual' | 'friendly' | 'humorous' | 'inspirational';
    length: 'short' | 'medium' | 'long';
    include_media: boolean;
    media_type: 'image' | 'video' | 'carousel';
    auto_hashtags: boolean;
    hashtag_count: number;
}
export interface NotificationSettings {
    email_notifications: boolean;
    post_success: boolean;
    post_failure: boolean;
    weekly_analytics: boolean;
    ai_insights: boolean;
}
export interface AIPreferences {
    preferred_provider: 'openai' | 'claude' | 'gemini';
    creativity_level: number;
    brand_voice?: string;
    forbidden_topics?: string[];
}
export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest';
export interface SocialAccount {
    id: string;
    user_id: string;
    platform: SocialPlatform;
    platform_user_id: string;
    platform_username?: string;
    access_token_encrypted: string;
    refresh_token_encrypted?: string;
    token_expires_at?: Date;
    scopes: string[];
    is_active: boolean;
    auto_reply_enabled: boolean;
    auto_post_enabled: boolean;
    daily_post_limit: number;
    created_at: Date;
    updated_at: Date;
}
export interface PlatformCapabilities {
    can_post_text: boolean;
    can_post_images: boolean;
    can_post_videos: boolean;
    can_post_carousel: boolean;
    can_post_stories: boolean;
    max_characters: number;
    max_hashtags: number;
    max_images: number;
    max_video_length_seconds: number;
}
export declare const PLATFORM_CAPABILITIES: Record<SocialPlatform, PlatformCapabilities>;
export type ContentCategory = 'daily_movie' | 'product_showcase' | 'daily_quote' | 'news' | 'educational' | 'entertainment' | 'promotional' | 'behind_scenes' | 'user_generated' | 'custom';
export type MediaType = 'text' | 'image' | 'video' | 'carousel';
export interface ContentPost {
    id: string;
    user_id: string;
    title?: string;
    content_text: string;
    hashtags: string[];
    media_urls: string[];
    media_type: MediaType;
    ai_generated: boolean;
    content_category: ContentCategory;
    engagement_data: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
export interface ScheduledPost {
    id: string;
    content_post_id: string;
    social_account_id: string;
    scheduled_at: Date;
    posted_at?: Date;
    status: 'scheduled' | 'posted' | 'failed' | 'cancelled';
    platform_post_id?: string;
    platform_response?: Record<string, any>;
    retry_count: number;
    max_retries: number;
    next_retry_at?: Date;
    error_message?: string;
    created_at: Date;
    updated_at: Date;
}
export interface PostAnalytics {
    id: string;
    scheduled_post_id: string;
    platform: SocialPlatform;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    clicks: number;
    engagement_rate: number;
    analytics_data: Record<string, any>;
    recorded_at: Date;
}
export interface AnalyticsSummary {
    total_posts: number;
    successful_posts: number;
    failed_posts: number;
    total_engagement: number;
    average_engagement_rate: number;
    best_performing_platform: SocialPlatform;
    best_performing_content: ContentCategory;
    period: {
        start: Date;
        end: Date;
    };
}
export interface Comment {
    id: string;
    social_account_id: string;
    platform_comment_id: string;
    platform_post_id: string;
    author_platform_id?: string;
    author_name?: string;
    author_username?: string;
    comment_text: string;
    comment_type: 'comment' | 'reply' | 'mention';
    sentiment_score?: number;
    auto_reply_sent: boolean;
    auto_reply_text?: string;
    created_at: Date;
    updated_at: Date;
}
export interface AIGenerationRequest {
    user_id: string;
    request_type: 'caption' | 'image' | 'reply' | 'hashtag' | 'complete_post';
    prompt: string;
    context?: Record<string, any>;
    platform?: SocialPlatform;
    category?: ContentCategory;
    preferences?: ContentGenerationPreferences;
}
export interface AIGenerationResult {
    content: string;
    media_urls?: string[];
    hashtags?: string[];
    confidence_score: number;
    quality_score: number;
    tokens_used: number;
    cost_usd: number;
    generation_time_ms: number;
    model_used: string;
    provider: string;
}
export interface AIGenerationLog {
    id: string;
    user_id: string;
    request_type: string;
    prompt: string;
    generated_content?: string;
    model_used: string;
    tokens_used: number;
    cost_usd: number;
    generation_time_ms: number;
    quality_score?: number;
    created_at: Date;
}
export interface JobData {
    type: 'content-generation' | 'social-posting' | 'analytics-collection' | 'engagement-monitoring' | 'token-refresh';
    user_id?: string;
    data: Record<string, any>;
    priority: number;
    delay?: number;
    max_attempts: number;
}
export interface JobResult {
    success: boolean;
    data?: Record<string, any>;
    error?: string;
    retry_count?: number;
    next_retry_at?: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
}
export interface AuthToken {
    access_token: string;
    refresh_token?: string;
    expires_at: Date;
    scope: string[];
    token_type: string;
}
export interface OAuthState {
    state: string;
    platform: SocialPlatform;
    user_id: string;
    redirect_uri: string;
    scopes: string[];
    created_at: Date;
}
export interface DashboardStats {
    total_accounts: number;
    active_accounts: number;
    scheduled_posts: number;
    posts_today: number;
    engagement_this_week: number;
    ai_generations_this_month: number;
}
export interface ContentCalendar {
    date: Date;
    posts: ScheduledPost[];
    status: 'empty' | 'scheduled' | 'posted' | 'mixed';
}
export interface PlatformStatus {
    platform: SocialPlatform;
    connected: boolean;
    healthy: boolean;
    last_post_at?: Date;
    posts_today: number;
    rate_limit_status: 'ok' | 'warning' | 'limited';
}
export interface AutomationSettings {
    enabled: boolean;
    daily_post_limit: number;
    posting_schedule: PostingSchedule;
    content_mix: ContentMix;
    auto_reply_settings: AutoReplySettings;
    performance_optimization: boolean;
}
export interface PostingSchedule {
    timezone: string;
    optimal_times: number[];
    days_of_week: number[];
    min_interval_hours: number;
    max_interval_hours: number;
}
export interface ContentMix {
    daily_movie: number;
    product_showcase: number;
    daily_quote: number;
    educational: number;
    promotional: number;
    custom: number;
}
export interface AutoReplySettings {
    enabled: boolean;
    reply_delay_minutes: number;
    sentiment_threshold: number;
    reply_tone: 'professional' | 'casual' | 'friendly';
    max_replies_per_post: number;
    keyword_triggers: string[];
}
export interface SocialMediaError {
    code: string;
    message: string;
    platform?: SocialPlatform;
    status_code?: number;
    retry_possible: boolean;
    suggested_action: 'retry' | 'manual_review' | 'skip' | 'change_platform';
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
export interface WebhookEvent {
    id: string;
    type: 'post.published' | 'post.failed' | 'comment.received' | 'account.connected' | 'account.disconnected';
    user_id: string;
    data: Record<string, any>;
    timestamp: Date;
}
export type { User, UserPreferences, ContentGenerationPreferences, NotificationSettings, AIPreferences, SocialAccount, PlatformCapabilities, ContentPost, ScheduledPost, PostAnalytics, AnalyticsSummary, Comment, AIGenerationRequest, AIGenerationResult, AIGenerationLog, JobData, JobResult, ApiResponse, PaginatedResponse, AuthToken, OAuthState, DashboardStats, ContentCalendar, PlatformStatus, AutomationSettings, PostingSchedule, ContentMix, AutoReplySettings, SocialMediaError, ValidationError, WebhookEvent };
//# sourceMappingURL=index.d.ts.map
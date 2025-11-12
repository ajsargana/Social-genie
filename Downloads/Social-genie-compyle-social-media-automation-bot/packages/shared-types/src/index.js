"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_CAPABILITIES = void 0;
exports.PLATFORM_CAPABILITIES = {
    instagram: {
        can_post_text: true,
        can_post_images: true,
        can_post_videos: true,
        can_post_carousel: true,
        can_post_stories: true,
        max_characters: 2200,
        max_hashtags: 30,
        max_images: 10,
        max_video_length_seconds: 60
    },
    facebook: {
        can_post_text: true,
        can_post_images: true,
        can_post_videos: true,
        can_post_carousel: true,
        can_post_stories: true,
        max_characters: 63206,
        max_hashtags: 50,
        max_images: 10,
        max_video_length_seconds: 14400
    },
    twitter: {
        can_post_text: true,
        can_post_images: true,
        can_post_videos: true,
        can_post_carousel: false,
        can_post_stories: false,
        max_characters: 280,
        max_hashtags: 10,
        max_images: 4,
        max_video_length_seconds: 140
    },
    linkedin: {
        can_post_text: true,
        can_post_images: true,
        can_post_videos: true,
        can_post_carousel: true,
        can_post_stories: false,
        max_characters: 3000,
        max_hashtags: 20,
        max_images: 9,
        max_video_length_seconds: 600
    },
    tiktok: {
        can_post_text: true,
        can_post_images: false,
        can_post_videos: true,
        can_post_carousel: false,
        can_post_stories: false,
        max_characters: 150,
        max_hashtags: 5,
        max_images: 0,
        max_video_length_seconds: 600
    },
    youtube: {
        can_post_text: true,
        can_post_images: false,
        can_post_videos: true,
        can_post_carousel: false,
        can_post_stories: false,
        max_characters: 5000,
        max_hashtags: 15,
        max_images: 0,
        max_video_length_seconds: 43200
    },
    pinterest: {
        can_post_text: true,
        can_post_images: true,
        can_post_videos: true,
        can_post_carousel: false,
        can_post_stories: false,
        max_characters: 500,
        max_hashtags: 20,
        max_images: 1,
        max_video_length_seconds: 900
    }
};
//# sourceMappingURL=index.js.map
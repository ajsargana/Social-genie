"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTENT_TEMPLATES = void 0;
exports.getContentTemplate = getContentTemplate;
exports.generatePrompt = generatePrompt;
exports.CONTENT_TEMPLATES = {
    daily_movie: {
        category: 'daily_movie',
        prompts: {
            caption: [
                "Write an engaging Instagram caption about {movie_title} ({year}) starring {stars}. Include the plot summary, why it's worth watching, and relevant hashtags.",
                "Create a Twitter thread about {movie_title} with interesting facts, behind-the-scenes details, and why audiences love it.",
                "Write a professional LinkedIn post about {movie_title} focusing on its industry impact, box office performance, and cultural significance.",
                "Generate a Facebook post announcing {movie_title} with a personal review and recommendation for friends.",
                "Create a TikTok-style caption for {movie_title} that's short, catchy, and perfect for a video clip."
            ],
            image: [
                "Generate a cinematic movie poster style image for {movie_title} with {genre} aesthetic, dramatic lighting, and title text.",
                "Create a collage of key scenes from {movie_title} in an artistic style suitable for social media.",
                "Generate an artistic movie scene representation from {movie_title} with {genre} influences and mood lighting.",
                "Create a minimalist movie poster for {movie_title} focusing on the central theme or iconic imagery."
            ],
            hashtags: [
                "Generate 10 relevant hashtags for {movie_title} including movie title, genre, stars, year, and thematic elements.",
                "Create trending hashtags for a {genre} film like {movie_title} that would maximize engagement.",
                "Generate a mix of broad and niche hashtags for {movie_title} to reach both movie buffs and casual viewers."
            ]
        },
        fallbackTopics: ['classic_movies', 'underrated_gems', 'box_office_hits', 'cult_favorites', 'award_winners']
    },
    product_showcase: {
        category: 'product_showcase',
        prompts: {
            caption: [
                "Write a compelling product description for {product_name} highlighting {key_features} and {benefits}. Include a call-to-action.",
                "Create a Facebook post announcing {product_name} with customer testimonials and special offers.",
                "Generate a LinkedIn post about {product_name} focusing on business value and ROI for {target_audience}.",
                "Write an Instagram caption for {product_name} that showcases its lifestyle benefits and aesthetic appeal.",
                "Create a Twitter thread about {product_name} explaining its innovation and market disruption."
            ],
            image: [
                "Generate a professional product photography image of {product_name} with {background_style} lighting.",
                "Create a lifestyle image showing {product_name} in use by {target_audience}.",
                "Generate a minimalist product shot of {product_name} on a clean background with emphasis on design.",
                "Create an animated-style image showing {product_name} in action or demonstrating its key benefits."
            ],
            hashtags: [
                "Generate 10 relevant hashtags for {product_name} including brand, product category, benefits, and target audience.",
                "Create trending hashtags for a {product_category} product like {product_name} to maximize reach.",
                "Generate a mix of product-specific and industry hashtags for {product_name}."
            ]
        },
        fallbackTopics: ['new_arrivals', 'best_sellers', 'featured_products', 'seasonal_items', 'customer_favorites']
    },
    daily_quote: {
        category: 'daily_quote',
        prompts: {
            caption: [
                "Generate an inspiring quote about {topic} in the style of {author_type}. Include relevant hashtags.",
                "Write a motivational Monday message about {topic} with actionable advice.",
                "Create a professional leadership quote about {topic} suitable for LinkedIn.",
                "Generate an uplifting Instagram caption about {topic} that would resonate with followers.",
                "Create a thought-provoking Twitter post about {topic} that encourages engagement."
            ],
            image: [
                "Generate a minimalist typography design with the quote text on {background_color} background.",
                "Create an inspiring background image related to {topic} with space for quote overlay.",
                "Generate a nature-themed background with {mood} atmosphere suitable for an inspirational quote.",
                "Create an abstract geometric design that complements a quote about {topic}."
            ],
            hashtags: [
                "Generate 8 relevant hashtags for a quote about {topic} including motivation, inspiration, and {topic}-specific tags.",
                "Create trending hashtags for inspirational content about {topic} to maximize engagement.",
                "Generate a mix of broad and niche hashtags for motivational content about {topic}."
            ]
        },
        fallbackTopics: ['motivation', 'leadership', 'success', 'wisdom', 'innovation']
    },
    news: {
        category: 'news',
        prompts: {
            caption: [
                "Write a balanced social media post about {news_topic} that informs without being overly partisan. Include relevant context.",
                "Create a breaking news style post about {news_topic} that's engaging and shareable.",
                "Generate a professional LinkedIn analysis of {news_topic} and its business implications.",
                "Write an Instagram caption about {news_topic} that's accessible to a general audience.",
                "Create a Twitter thread explaining {news_topic} in simple terms with key takeaways."
            ],
            image: [
                "Generate a news-style infographic about {news_topic} with key statistics and visual elements.",
                "Create a professional news graphic about {news_topic} suitable for social media sharing.",
                "Generate an abstract representation of {news_topic} using appropriate visual metaphors.",
                "Create a clean, informative graphic explaining {news_topic} for social media."
            ],
            hashtags: [
                "Generate 10 relevant hashtags for {news_topic} including the topic, related industries, and current events.",
                "Create trending hashtags for news content about {news_topic} to maximize visibility.",
                "Generate a mix of news-specific and topic-related hashtags for {news_topic}."
            ]
        },
        fallbackTopics: ['technology', 'business', 'science', 'health', 'environment']
    },
    educational: {
        category: 'educational',
        prompts: {
            caption: [
                "Write an educational post about {subject} that's informative and engaging for social media audiences.",
                "Create a 'did you know' style post about {subject} with surprising facts and statistics.",
                "Generate a LinkedIn article preview about {subject} that positions the author as an expert.",
                "Write an Instagram educational carousel caption about {subject} with multiple learning points.",
                "Create a Twitter thread teaching {subject} in easy-to-understand segments."
            ],
            image: [
                "Generate an educational infographic about {subject} with clear visual hierarchy and key facts.",
                "Create a diagram or chart explaining {subject} in a visually appealing way.",
                "Generate an illustration that represents key concepts of {subject} for social media.",
                "Create a educational visual aid about {subject} that's shareable and informative."
            ],
            hashtags: [
                "Generate 10 educational hashtags for {subject} including #learn, #education, and subject-specific tags.",
                "Create trending hashtags for educational content about {subject} to reach learners.",
                "Generate a mix of general education and {subject}-specific hashtags."
            ]
        },
        fallbackTopics: ['science', 'history', 'technology', 'health', 'arts']
    },
    entertainment: {
        category: 'entertainment',
        prompts: {
            caption: [
                "Write an entertaining social media post about {topic} that's fun and engaging for followers.",
                "Create a viral-style post about {topic} that's designed for maximum sharing.",
                "Generate a lighthearted LinkedIn post about {topic} that still maintains professionalism.",
                "Write an Instagram entertainment caption about {topic} with emoji usage and engaging questions.",
                "Create a Twitter entertainment post about {topic} that's witty and shareable."
            ],
            image: [
                "Generate a fun, colorful image about {topic} that's perfect for entertainment social media.",
                "Create a meme-style image about {topic} that's appropriate for brand social media.",
                "Generate an entertaining illustration about {topic} with vibrant colors and engaging visuals.",
                "Create a shareable graphic about {topic} that combines humor with information."
            ],
            hashtags: [
                "Generate 10 entertainment hashtags for {topic} including fun, trending, and topic-specific tags.",
                "Create viral-worthy hashtags for entertainment content about {topic}.",
                "Generate a mix of entertainment and {topic}-specific hashtags for maximum reach."
            ]
        },
        fallbackTopics: ['pop_culture', 'trends', 'fun_facts', 'trivia', 'celebrity_news']
    },
    promotional: {
        category: 'promotional',
        prompts: {
            caption: [
                "Write a promotional social media post for {offer} that creates urgency and drives conversions.",
                "Create a sales-focused post about {offer} with clear benefits and call-to-action.",
                "Generate a LinkedIn promotional post about {offer} that highlights business value.",
                "Write an Instagram promotional caption for {offer} with emoji usage and swipe-up cues.",
                "Create a Twitter promotional post about {offer} that's concise and action-oriented."
            ],
            image: [
                "Generate a promotional banner for {offer} with clear messaging and brand consistency.",
                "Create a sales-focused graphic about {offer} with pricing and benefits highlighted.",
                "Generate a professional promotional image for {offer} suitable for all social platforms.",
                "Create an eye-catching promotional design for {offer} that stands out in feeds."
            ],
            hashtags: [
                "Generate 10 promotional hashtags for {offer} including #sale, #discount, and offer-specific tags.",
                "Create conversion-focused hashtags for promotional content about {offer}.",
                "Generate a mix of promotional and {offer}-specific hashtags for sales campaigns."
            ]
        },
        fallbackTopics: ['special_offers', 'new_products', 'seasonal_sales', 'limited_time', 'exclusive_deals']
    },
    behind_scenes: {
        category: 'behind_scenes',
        prompts: {
            caption: [
                "Write a behind-the-scenes social media post about {process} that shows authenticity and builds connection.",
                "Create an insider look post about {process} that makes followers feel special.",
                "Generate a LinkedIn behind-the-scenes post about {process} that shows company culture.",
                "Write an Instagram behind-the-scenes caption about {process} with storytelling elements.",
                "Create a Twitter behind-the-scenes thread about {process} with interesting details."
            ],
            image: [
                "Generate a behind-the-scenes style image about {process} with authentic, candid feel.",
                "Create a workplace/culture image representing {process} that builds trust.",
                "Generate an authentic-looking behind-the-scenes photo of {process}.",
                "Create a candid-style image about {process} that shows the human side of work."
            ],
            hashtags: [
                "Generate 10 behind-the-scenes hashtags for {process} including #BTS, #behindthescenes, and process-specific tags.",
                "Create authentic hashtags for behind-the-scenes content about {process}.",
                "Generate a mix of BTS and {process}-specific hashtags for genuine connection."
            ]
        },
        fallbackTopics: ['team_culture', 'making_of', 'work_process', 'company_life', 'development_journey']
    },
    user_generated: {
        category: 'user_generated',
        prompts: {
            caption: [
                "Write a social media post featuring user content about {topic} that celebrates community.",
                "Create a user appreciation post about {topic} that encourages more user participation.",
                "Generate a LinkedIn post highlighting user success with {topic}.",
                "Write an Instagram user-generated content caption about {topic} with proper credit.",
                "Create a Twitter post amplifying user content about {topic}."
            ],
            image: [
                "Generate a user showcase template for content about {topic} with proper attribution space.",
                "Create a community highlight graphic for user content about {topic}.",
                "Generate a user-generated content feature image for {topic}.",
                "Create a testimonial-style image for user content about {topic}."
            ],
            hashtags: [
                "Generate 10 community-focused hashtags for user content about {topic} including #UGC, #community, and topic tags.",
                "Create engagement hashtags for user-generated content about {topic}.",
                "Generate a mix of community and {topic}-specific hashtags for user features."
            ]
        },
        fallbackTopics: ['customer_stories', 'testimonials', 'community_highlights', 'user_success', 'fan_content']
    },
    custom: {
        category: 'custom',
        prompts: {
            caption: [
                "Write a custom social media post about {topic} following the provided guidelines and brand voice.",
                "Create a tailored post about {topic} that meets the specific requirements.",
                "Generate a custom LinkedIn post about {topic} with the requested tone and format.",
                "Write a custom Instagram caption about {topic} that follows the brand guidelines.",
                "Create a custom Twitter post about {topic} that meets the specifications."
            ],
            image: [
                "Generate a custom image about {topic} following the brand guidelines and requirements.",
                "Create a tailored visual for content about {topic} that matches the specifications.",
                "Generate a custom graphic for {topic} with the requested style and elements.",
                "Create a bespoke image for {topic} that aligns with the brand identity."
            ],
            hashtags: [
                "Generate custom hashtags for {topic} based on the specific requirements and goals.",
                "Create tailored hashtags for content about {topic} that match the campaign objectives.",
                "Generate custom hashtag sets for {topic} based on the provided guidelines."
            ]
        },
        fallbackTopics: ['brand_content', 'campaign_specific', 'custom_initiatives', 'special_projects', 'unique_content']
    }
};
function getContentTemplate(category) {
    return exports.CONTENT_TEMPLATES[category] || exports.CONTENT_TEMPLATES.custom;
}
function generatePrompt(category, platform, preferences, context = {}) {
    const template = getContentTemplate(category);
    const promptType = preferences.include_media ? 'image' : 'caption';
    const prompts = template.prompts[promptType];
    if (!prompts || prompts.length === 0) {
        return `Create ${preferences.tone} content about ${category}`;
    }
    // Select a random prompt from the available options
    const basePrompt = prompts[Math.floor(Math.random() * prompts.length)];
    // Replace placeholders with context values
    let finalPrompt = basePrompt;
    Object.entries(context).forEach(([key, value]) => {
        finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    // Add platform-specific instructions
    const platformInstructions = getPlatformInstructions(platform, preferences);
    finalPrompt += `\n\nPlatform: ${platform}\n${platformInstructions}`;
    return finalPrompt;
}
function getPlatformInstructions(platform, preferences) {
    const instructions = [];
    switch (platform) {
        case 'twitter':
            instructions.push('Keep it concise and under 280 characters');
            instructions.push('Use 1-3 relevant hashtags');
            instructions.push('Make it engaging and shareable');
            break;
        case 'instagram':
            instructions.push('Write an engaging caption');
            instructions.push('Use up to 30 hashtags');
            instructions.push('Include a call-to-action');
            break;
        case 'linkedin':
            instructions.push('Maintain professional tone');
            instructions.push('Focus on business value and insights');
            instructions.push('Use appropriate industry hashtags');
            break;
        case 'facebook':
            instructions.push('Write conversationally');
            instructions.push('Encourage engagement and comments');
            instructions.push('Can be longer and more detailed');
            break;
        case 'tiktok':
            instructions.push('Keep it short and catchy');
            instructions.push('Use trending sounds or topics if relevant');
            instructions.push('Make it entertaining or educational');
            break;
        case 'youtube':
            instructions.push('Write an engaging description');
            instructions.push('Include relevant keywords for SEO');
            instructions.push('Add timestamps if applicable');
            break;
        case 'pinterest':
            instructions.push('Focus on visual description');
            instructions.push('Use relevant keywords');
            instructions.push('Include helpful information');
            break;
    }
    if (preferences.tone) {
        instructions.push(`Tone: ${preferences.tone}`);
    }
    if (preferences.length) {
        instructions.push(`Length: ${preferences.length}`);
    }
    return instructions.join('\n');
}
//# sourceMappingURL=content-templates.js.map
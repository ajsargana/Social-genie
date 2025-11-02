# Social Genie 🧞‍♂️

An autonomous social media content creation and posting platform that leverages AI to automatically generate, schedule, and publish engaging content across all major social platforms.

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Autonomous Content Engine**: Automatically selects topics and generates engaging content
- **Multi-Provider AI Support**: OpenAI GPT-5, Anthropic Claude, Google Gemini
- **Content Categories**: Daily movies, product showcases, quotes, educational content, and more
- **Intelligent Media**: Generates or retrieves relevant images when media is missing
- **Quality Assurance**: Built-in content validation and quality scoring

### 🌐 Multi-Platform Integration
- **Supported Platforms**: Instagram, Facebook, Twitter/X, LinkedIn, TikTok, YouTube, Pinterest
- **Hybrid Strategy**: Start with unified API (Ayrshare), migrate to direct integrations
- **Smart Content Adaptation**: Automatically adapts content for each platform's requirements
- **Cross-Platform Coordination**: Optimal timing and content variation across platforms

### ⏰ Intelligent Scheduling
- **Autonomous Posting**: Fully automated content scheduling and posting
- **Optimal Timing**: AI-driven posting time optimization based on audience behavior
- **Fallback Content**: Graceful handling when planned media is unavailable
- **Retry Logic**: Smart retry strategies for failed posts with exponential backoff

### 📊 Analytics & Optimization
- **Performance Tracking**: Comprehensive analytics across all platforms
- **Content Optimization**: AI learns from performance to improve future content
- **Engagement Monitoring**: Automatic comment monitoring and AI-powered replies
- **Trend Integration**: Real-time hashtag and topic optimization

### 🎛️ Control & Customization
- **Dashboard**: Clean, modern web interface for management and oversight
- **Automation Modes**: Fully automated or semi-automated (approve-before-post)
- **Content Preferences**: Customizable tone, length, media preferences
- **Brand Voice**: Consistent brand personality across all generated content

## 🏗️ Architecture

### Monorepo Structure
```
Social-genie/
├── apps/
│   ├── web/                 # Next.js dashboard application
│   └── api/                 # Express.js backend API
├── packages/
│   ├── database/            # Shared database schemas and migrations
│   ├── ai-content/          # AI content generation service
│   ├── social-integrations/ # Platform-specific integrations
│   ├── scheduler/           # Background job processors
│   └── shared-types/        # TypeScript type definitions
├── docker-compose.yml       # Local development environment
├── .env.example            # Environment configuration template
└── README.md               # This file
```

### Technology Stack
- **Frontend**: Next.js 14+ with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL for relational data
- **Cache/Queue**: Redis for session storage and job queues
- **Job Processing**: BullMQ for reliable background tasks
- **AI Integration**: OpenAI, Anthropic Claude, Google Gemini
- **Authentication**: NextAuth.js with OAuth2
- **Deployment**: Docker containers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL and Redis (or use Docker containers)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Social-genie

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.development
```

### 2. Configure Environment
Edit `.env.development` and add your API keys:
```bash
# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Social Media (Ayrshare for quick start)
AYRSHARE_API_KEY=your-ayrshare-api-key

# Security
NEXTAUTH_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key-32-characters-long!!
```

### 3. Start Development Environment
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start services individually
npm run dev              # Start web, api, and worker
npm run dev:web          # Web dashboard only
npm run dev:api          # Backend API only
npm run dev:worker       # Background worker only
```

### 4. Database Setup
```bash
# Run database migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Access Applications
- **Web Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api/docs
- **Database Admin**: http://localhost:5050 (pgAdmin)
- **Redis Admin**: http://localhost:8081 (Redis Commander)

## 📖 Detailed Documentation

### Configuration

#### Environment Variables
Key environment variables and their purposes:

```bash
# Application
NODE_ENV=development
PORT=3000
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/socialgenie
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Social Media
AYRSHARE_API_KEY=your-key
TWITTER_API_KEY=your-key
# ... other platform keys
```

#### Platform-Specific Setup

**Ayrshare (Recommended for Quick Start)**
1. Sign up at [ayrshare.com](https://ayrshare.com)
2. Get your API key from dashboard
3. Add `AYRSHARE_API_KEY` to environment
4. Connect social accounts through Ayrshare dashboard

**Direct Platform Integration**
1. Create developer accounts on each platform
2. Register applications and get API keys
3. Configure OAuth callbacks
4. Add credentials to environment

### Usage

#### Connecting Social Accounts
1. Navigate to Dashboard → Accounts
2. Click "Connect Account" for desired platform
3. Complete OAuth flow
4. Configure posting preferences

#### Content Generation
1. Go to Dashboard → Content
2. Select content category (daily movie, quote, etc.)
3. Choose platforms and timing
4. Generate content or enable automation

#### Scheduling Posts
1. Create content in Dashboard → Content
2. Set posting schedule
3. Enable automated posting
4. Monitor in Dashboard → Schedule

#### Analytics
1. View performance in Dashboard → Analytics
2. Filter by platform, date range, content type
3. Export reports for analysis
4. Use insights to optimize strategy

### API Documentation

#### Authentication
```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Get user info
GET /api/auth/me
Authorization: Bearer <token>
```

#### Content Management
```bash
# Generate content
POST /api/content/generate
{
  "category": "daily_movie",
  "platforms": ["twitter", "instagram"],
  "preferences": {
    "tone": "friendly",
    "length": "medium",
    "include_media": true
  }
}

# Create post
POST /api/content
{
  "content_text": "Your content here",
  "hashtags": ["hashtag1", "hashtag2"],
  "media_urls": ["https://example.com/image.jpg"],
  "content_category": "daily_movie"
}
```

#### Scheduling
```bash
# Schedule post
POST /api/schedule
{
  "content_post_id": "uuid",
  "social_account_ids": ["uuid"],
  "scheduled_at": "2025-01-01T10:00:00Z"
}

# Get scheduled posts
GET /api/schedule?status=scheduled&platform=twitter
```

## 🛠️ Development

### Project Structure
- **`apps/web`**: Next.js frontend with React components
- **`apps/api`**: Express.js REST API with middleware
- **`packages/database`**: PostgreSQL schemas, migrations, and models
- **`packages/ai-content`**: AI providers and content generation logic
- **`packages/social-integrations`**: Platform API integrations
- **`packages/scheduler`**: Background job processing with BullMQ
- **`packages/shared-types`**: TypeScript type definitions

### Common Commands
```bash
# Development
npm run dev              # Start all services
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Lint all packages

# Database
npm run db:migrate       # Run migrations
npm run db:rollback      # Rollback last migration
npm run db:seed          # Seed sample data

# Individual packages
npm run dev --workspace=apps/web
npm run build --workspace=packages/ai-content
npm run test --workspace=packages/social-integrations
```

### Testing
```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --workspace=packages/ai-content

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Adding New Features

#### New Social Platform
1. Add platform type to `shared-types`
2. Create integration in `social-integrations`
3. Add platform capabilities
4. Update content adapter
5. Add OAuth flow if needed

#### New AI Provider
1. Create provider class in `ai-content/providers`
2. Implement base methods
3. Add to provider factory
4. Update configuration

#### New Content Category
1. Add to `ContentCategory` type
2. Create templates in `ai-content/templates`
3. Update content generation logic
4. Add UI components if needed

## 🐳 Docker Deployment

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build
```

### Production
```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale worker=3

# Backup database
docker-compose exec db pg_dump -U postgres socialgenie > backup.sql
```

## 📈 Monitoring & Analytics

### Health Checks
```bash
# API health
curl http://localhost:3001/api/health

# Queue health
curl http://localhost:3001/api/queues/health

# System metrics
curl http://localhost:3001/api/metrics
```

### Logs
```bash
# Application logs
docker-compose logs -f web api worker

# Database logs
docker-compose logs -f db

# Queue logs
curl http://localhost:3001/api/queues/logs
```

### Analytics
- **Content Performance**: Track engagement rates across platforms
- **AI Usage**: Monitor token usage and costs
- **System Health**: Queue health, database performance
- **User Activity**: Daily active users, posts per user

## 🔧 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
docker-compose exec db pg_isready

# Reset database
docker-compose down -v
docker-compose up -d db
npm run db:migrate
```

#### Redis Connection
```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Clear Redis cache
docker-compose exec redis redis-cli flushall
```

#### Worker Issues
```bash
# Check queue status
curl http://localhost:3001/api/queues/status

# Restart worker
docker-compose restart worker

# Clear failed jobs
curl -X DELETE http://localhost:3001/api/queues/failed
```

#### API Keys
```bash
# Verify API key format
echo $OPENAI_API_KEY | grep -E "^sk-"

# Test API connectivity
curl -H "Authorization: Bearer $AYRSHARE_API_KEY" https://api.ayrshare.com/profile
```

### Performance Issues

#### Slow Queries
```bash
# Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

# Analyze slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC;
```

#### Memory Usage
```bash
# Monitor memory usage
docker stats

# Optimize Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new features
- Update documentation
- Use conventional commit messages
- Ensure all tests pass before PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Full documentation](https://docs.socialgenie.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/social-genie/issues)
- **Discord**: [Community Discord](https://discord.gg/socialgenie)
- **Email**: support@socialgenie.com

## 🎯 Roadmap

### Phase 1: Foundation (Current)
- ✅ Core AI content generation
- ✅ Multi-platform posting
- ✅ Basic scheduling
- ✅ Web dashboard

### Phase 2: Advanced Features
- 🔄 Advanced analytics and A/B testing
- 🔄 AI-powered engagement and auto-replies
- 🔄 Content optimization algorithms
- 🔄 Mobile app

### Phase 3: Enterprise
- 🔄 Team collaboration
- 🔄 Advanced workflow automation
- 🔄 Custom integrations
- 🔄 White-label solutions

---

**Built with ❤️ by the Social Genie team**
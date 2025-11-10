# Social Genie - Local Development Setup

This guide will help you set up Social Genie for local development without Docker.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` (should be >= 18.0.0)

2. **npm** (v9 or higher)
   - Comes with Node.js
   - Verify: `npm --version` (should be >= 9.0.0)

3. **PostgreSQL** (v14 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Or install via Homebrew (Mac): `brew install postgresql`
   - Or via apt (Ubuntu): `sudo apt-get install postgresql postgresql-contrib`

4. **Redis** (v6 or higher)
   - Download from [redis.io](https://redis.io/download)
   - Or install via Homebrew (Mac): `brew install redis`
   - Or via apt (Ubuntu): `sudo apt-get install redis-server`

## Local Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Social-genie

# Install all dependencies for all workspaces
npm install
```

### 2. Database Setup

#### Start PostgreSQL
```bash
# Start PostgreSQL service
# On Mac with Homebrew:
brew services start postgresql

# On Ubuntu:
sudo systemctl start postgresql

# On Windows:
# Start PostgreSQL service from Services panel
```

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE social_genie;
CREATE USER social_genie_user WITH PASSWORD 'social_genie_password';
GRANT ALL PRIVILEGES ON DATABASE social_genie TO social_genie_user;
\q
```

#### Run Database Migrations
```bash
# This will create all tables and setup the database schema
npm run db:migrate
```

### 3. Redis Setup

#### Start Redis
```bash
# On Mac with Homebrew:
brew services start redis

# On Ubuntu:
sudo systemctl start redis-server

# On Windows:
# Start Redis service or run redis-server directly
redis-server
```

#### Verify Redis is Running
```bash
redis-cli ping
# Should return: PONG
```

### 4. Environment Setup

Create environment configuration files:

#### Backend Environment (.env)
```bash
# Create the backend environment file
cat > apps/api/.env << 'EOF'
# Database
DATABASE_URL=postgresql://social_genie_user:social_genie_password@localhost:5432/social_genie
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=social_genie
DATABASE_USER=social_genie_user
DATABASE_PASSWORD=social_genie_password

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# AI Services
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Social Media APIs
AYRSHARE_API_KEY=your-ayrshare-api-key-here
TWITTER_API_KEY=your-twitter-api-key-here
TWITTER_API_SECRET=your-twitter-api-secret-here
TWITTER_ACCESS_TOKEN=your-twitter-access-token-here
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret-here

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Optional)
EMAIL_FROM=noreply@socialgenie.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
LOG_LEVEL=debug
ENABLE_METRICS=true
EOF
```

#### Frontend Environment (.env.local)
```bash
# Create the frontend environment file
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Social Media OAuth (Optional - for client-side OAuth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-here

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AI_CONTENT=true
NEXT_PUBLIC_ENABLE_SCHEDULING=true
EOF
```

### 5. Start the Application

#### Option 1: Start All Services Together
```bash
# This starts the web app, API, and background worker
npm run dev
```

#### Option 2: Start Services Individually
Open separate terminal windows for each service:

```bash
# Terminal 1: Frontend (Next.js)
npm run dev:web

# Terminal 2: Backend API (Express)
npm run dev:api

# Terminal 3: Background Worker
npm run dev:worker
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## Development Workflow

### Making Changes
- Frontend changes in `apps/web/` will hot reload automatically
- Backend changes in `apps/api/` will hot reload automatically
- Worker changes in `packages/scheduler/` will restart automatically

### Database Changes
```bash
# Create a new migration
npm run db:migrate:create -- --name your_migration_name

# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:rollback
```

### Common Commands
```bash
# Install new dependency for a specific workspace
npm install --workspace=apps/web react-chartjs-2

# Install new dependency for all workspaces
npm install --workspaces lodash

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run typecheck

# Clean all node_modules and reinstall
npm run clean
npm install
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different ports
PORT=3002 npm run dev:api
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection
psql -U social_genie_user -d social_genie -h localhost

# Reset database user password
psql -U postgres -c "ALTER USER social_genie_user PASSWORD 'social_genie_password';"
```

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Check Redis logs
tail -f /usr/local/var/log/redis.log  # Mac
# or
tail -f /var/log/redis/redis-server.log  # Linux
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $(whoami) ./apps/api/uploads
chmod -R 755 ./apps/api/uploads
```

### Node Modules Issues
```bash
# Clean and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

## API Keys Setup

You'll need to sign up for the following services:

1. **OpenAI** (for AI content generation)
   - Go to [platform.openai.com](https://platform.openai.com/)
   - Create account and get API key
   - Add to `OPENAI_API_KEY` in backend .env

2. **Ayrshare** (for social media posting)
   - Go to [ayrshare.com](https://www.ayrshare.com/)
   - Create account and get API key
   - Add to `AYRSHARE_API_KEY` in backend .env

3. **Twitter Developer Account** (optional)
   - Go to [developer.twitter.com](https://developer.twitter.com/)
   - Apply for developer account
   - Create app and get credentials
   - Add to environment variables

## Production Considerations

This setup is for development only. For production:

1. Use strong, unique secrets
2. Enable SSL/HTTPS
3. Use production database instances
4. Set up proper logging and monitoring
5. Configure CORS properly
6. Use environment-specific configurations

## Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Look at the logs in each terminal window
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly set

Happy coding! 🚀
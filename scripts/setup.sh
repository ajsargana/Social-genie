#!/bin/bash

# Social Genie - Local Setup Script
# This script helps set up the local development environment

set -e

echo "🚀 Setting up Social Genie for local development..."

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
        echo "Visit: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_NODE_VERSION="18.0.0"

    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_NODE_VERSION') ? 0 : 1)" 2>/dev/null; then
        echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js >= $REQUIRED_NODE_VERSION"
        exit 1
    fi

    echo "✅ Node.js $NODE_VERSION found"

    # Check npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi

    echo "✅ npm $(npm -v) found"

    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL is not installed"
        echo "Please install PostgreSQL: https://www.postgresql.org/download/"
        exit 1
    fi

    echo "✅ PostgreSQL found"

    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        echo "❌ Redis is not installed"
        echo "Please install Redis: https://redis.io/download"
        exit 1
    fi

    echo "✅ Redis found"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

# Setup database
setup_database() {
    echo "🗄️ Setting up database..."

    # Start PostgreSQL if not running
    if ! pg_isready -q; then
        echo "Starting PostgreSQL..."
        if command -v brew &> /dev/null; then
            brew services start postgresql
        elif command -v systemctl &> /dev/null; then
            sudo systemctl start postgresql
        else
            echo "Please start PostgreSQL manually"
        fi

        # Wait for PostgreSQL to start
        sleep 3
    fi

    # Create database and user
    echo "Creating database and user..."
    psql -U postgres -c "CREATE DATABASE social_genie;" 2>/dev/null || echo "Database already exists"
    psql -U postgres -c "CREATE USER social_genie_user WITH PASSWORD 'social_genie_password';" 2>/dev/null || echo "User already exists"
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE social_genie TO social_genie_user;" 2>/dev/null

    # Run migrations
    echo "Running database migrations..."
    npm run db:migrate

    echo "✅ Database setup complete"
}

# Setup Redis
setup_redis() {
    echo "🔴 Setting up Redis..."

    # Check if Redis is running
    if ! redis-cli ping > /dev/null 2>&1; then
        echo "Starting Redis..."
        if command -v brew &> /dev/null; then
            brew services start redis
        elif command -v systemctl &> /dev/null; then
            sudo systemctl start redis-server
        else
            echo "Please start Redis manually: redis-server"
        fi

        # Wait for Redis to start
        sleep 2
    fi

    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis is running"
    else
        echo "❌ Failed to start Redis"
        exit 1
    fi
}

# Create environment files
create_env_files() {
    echo "🔧 Creating environment files..."

    # Backend environment
    if [ ! -f "apps/api/.env" ]; then
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
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)
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
        echo "✅ Created apps/api/.env"
    else
        echo "⚠️ apps/api/.env already exists"
    fi

    # Frontend environment
    if [ ! -f "apps/web/.env.local" ]; then
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
        echo "✅ Created apps/web/.env.local"
    else
        echo "⚠️ apps/web/.env.local already exists"
    fi
}

# Create uploads directory
create_directories() {
    echo "📁 Creating necessary directories..."
    mkdir -p apps/api/uploads
    chmod 755 apps/api/uploads
    echo "✅ Directories created"
}

# Final instructions
final_instructions() {
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Add your API keys to apps/api/.env:"
    echo "   - OPENAI_API_KEY (required for AI content generation)"
    echo "   - AYRSHARE_API_KEY (required for social media posting)"
    echo "   - TWITTER_* (optional for Twitter integration)"
    echo ""
    echo "2. Start the application:"
    echo "   npm run dev"
    echo ""
    echo "3. Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo ""
    echo "4. For more details, see LOCAL_SETUP.md"
    echo ""
    echo "Happy coding! 🚀"
}

# Main execution
main() {
    check_prerequisites
    install_dependencies
    setup_database
    setup_redis
    create_env_files
    create_directories
    final_instructions
}

# Run main function
main "$@"
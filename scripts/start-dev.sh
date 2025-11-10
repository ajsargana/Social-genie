#!/bin/bash

# Social Genie - Development Start Script
# This script starts all services for local development

set -e

echo "🚀 Starting Social Genie development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local check_command=$2
    local port=$3

    echo -n "Checking $service_name... "

    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Function to start service in background
start_service() {
    local service_name=$1
    local command=$2
    local log_file=$3

    echo -e "${BLUE}Starting $service_name...${NC}"

    if [ -n "$log_file" ]; then
        eval "$command" > "$log_file" 2>&1 &
        local pid=$!
        echo "Started $service_name with PID: $pid (logs: $log_file)"
        echo $pid > "tmp/$service_name.pid"
    else
        eval "$command" &
        local pid=$!
        echo "Started $service_name with PID: $pid"
        echo $pid > "tmp/$service_name.pid"
    fi

    sleep 2
}

# Create tmp directory for PIDs
mkdir -p tmp

# Check prerequisites
echo "📋 Checking services..."

all_services_running=true

# Check PostgreSQL
if ! check_service "PostgreSQL" "pg_isready"; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
        brew services start postgresql
    elif command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    else
        echo -e "${RED}Please start PostgreSQL manually${NC}"
        all_services_running=false
    fi
    sleep 3
fi

# Check Redis
if ! check_service "Redis" "redis-cli ping"; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    if command -v brew &> /dev/null; then
        brew services start redis
    elif command -v systemctl &> /dev/null; then
        sudo systemctl start redis-server
    else
        echo -e "${RED}Please start Redis manually${NC}"
        all_services_running=false
    fi
    sleep 2
fi

# Check if environment files exist
if [ ! -f "apps/api/.env" ]; then
    echo -e "${RED}❌ apps/api/.env not found. Please run 'npm run setup' first.${NC}"
    exit 1
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo -e "${RED}❌ apps/web/.env.local not found. Please run 'npm run setup' first.${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Start services
echo ""
echo "🔧 Starting application services..."

# Start API
start_service "api" "npm run dev:api" "logs/api.log"

# Start Worker
start_service "worker" "npm run dev:worker" "logs/worker.log"

# Start Web (start last so user sees feedback immediately)
start_service "web" "npm run dev:web" "logs/web.log"

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start up..."
sleep 5

# Check if services are running
echo ""
echo "🔍 Checking service status..."

# Check API
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${YELLOW}⚠ API still starting...${NC}"
fi

# Check Web
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Web is responding${NC}"
else
    echo -e "${YELLOW}⚠ Web still starting...${NC}"
fi

# Final instructions
echo ""
echo "🎉 Development environment started!"
echo ""
echo -e "${BLUE}📱 Application URLs:${NC}"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Health:  http://localhost:3001/api/health"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "   API:    logs/api.log"
echo "   Web:    logs/web.log"
echo "   Worker: logs/worker.log"
echo ""
echo -e "${BLUE}🛑 To stop services:${NC}"
echo "   ./scripts/stop-dev.sh"
echo "   Or press Ctrl+C to stop this script and all services"
echo ""
echo -e "${BLUE}🔄 To restart services:${NC}"
echo "   ./scripts/stop-dev.sh && ./scripts/start-dev.sh"
echo ""
echo "Happy coding! 🚀"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"

    if [ -f "tmp/api.pid" ]; then
        kill $(cat tmp/api.pid) 2>/dev/null || true
        rm tmp/api.pid
    fi

    if [ -f "tmp/worker.pid" ]; then
        kill $(cat tmp/worker.pid) 2>/dev/null || true
        rm tmp/worker.pid
    fi

    if [ -f "tmp/web.pid" ]; then
        kill $(cat tmp/web.pid) 2>/dev/null || true
        rm tmp/web.pid
    fi

    echo -e "${GREEN}All services stopped${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Keep script running
while true; do
    sleep 1
done
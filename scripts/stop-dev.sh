#!/bin/bash

# Social Genie - Development Stop Script
# This script stops all development services

set -e

echo "🛑 Stopping Social Genie development services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop service
stop_service() {
    local service_name=$1
    local pid_file="tmp/$service_name.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        echo -n "Stopping $service_name (PID: $pid)... "

        if kill "$pid" 2>/dev/null; then
            echo -e "${GREEN}✓ Stopped${NC}"
        else
            echo -e "${YELLOW}Process not found${NC}"
        fi

        rm -f "$pid_file"
    else
        echo -e "${YELLOW}$service_name not running (no PID file)${NC}"
    fi
}

# Stop application services
echo "🔧 Stopping application services..."
stop_service "api"
stop_service "worker"
stop_service "web"

# Clean up any remaining processes on our ports
echo ""
echo "🧹 Cleaning up any remaining processes..."

# Check and kill processes on port 3000 (Web)
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Stopping remaining web processes..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Check and kill processes on port 3001 (API)
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Stopping remaining API processes..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✅ All development services stopped${NC}"
echo ""
echo "You can now run './scripts/start-dev.sh' to start again"
echo "Happy coding! 👋"
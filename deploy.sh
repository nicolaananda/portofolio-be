#!/bin/bash

# Portfolio Backend Deployment Script
echo "🚀 Starting Portfolio Backend Deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Please copy env.template to .env and fill in your values:"
    echo "   cp env.template .env"
    echo "   nano .env"
    exit 1
fi

# Check if application is built
if [ ! -d "dist" ]; then
    echo "❌ dist folder not found!"
    echo "📦 Please build the application first:"
    echo "   npm run build"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p logs/nginx
mkdir -p nginx/ssl

# Check if SSL certificates exist
if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
    echo "⚠️  SSL certificates not found in nginx/ssl/"
    echo "📝 For HTTPS, you need to:"
    echo "   1. Obtain SSL certificates (Let's Encrypt recommended)"
    echo "   2. Place fullchain.pem and privkey.pem in nginx/ssl/"
    echo "   3. Or comment out the nginx service in docker-compose.yml for HTTP only"
    
    read -p "Continue without HTTPS? (y/n): " choice
    if [ "$choice" != "y" ]; then
        exit 1
    fi
    
    # Comment out nginx service
    echo "🔧 Disabling HTTPS proxy..."
    sed -i '/# Nginx Reverse Proxy/,/portfolio-network/s/^/#/' docker-compose.yml
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo ""
echo "✅ Deployment completed!"
echo "🌐 Backend should be available at:"
echo "   - HTTP: http://your-domain.com:5000"
echo "   - HTTPS: https://your-domain.com (if SSL configured)"
echo ""
echo "📊 Useful commands:"
echo "   docker-compose logs -f          # Follow logs"
echo "   docker-compose down             # Stop services"
echo "   docker-compose restart         # Restart services"
echo "   docker-compose exec backend sh # Access backend container"
echo "   docker-compose exec mongodb mongosh # Access MongoDB" 
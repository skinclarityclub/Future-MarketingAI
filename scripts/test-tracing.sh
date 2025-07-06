#!/bin/bash

# Test Distributed Tracing Setup
echo "🔍 Testing Distributed Tracing Implementation"
echo "=============================================="

# Check if services are running
echo "📡 Checking service availability..."

# Check OTLP Collector
echo -n "OTLP Collector (4317): "
if curl -s --connect-timeout 5 http://localhost:4317 > /dev/null 2>&1; then
    echo "✅ Available"
else
    echo "❌ Not available (start with: docker compose -f docker-compose.monitoring.yml up -d)"
fi

# Check Jaeger UI
echo -n "Jaeger UI (16686): "
if curl -s --connect-timeout 5 http://localhost:16686 > /dev/null 2>&1; then
    echo "✅ Available"
else
    echo "❌ Not available (start with: docker compose -f docker-compose.monitoring.yml up -d)"
fi

# Check if Next.js app is running
echo -n "Next.js App (3000): "
if curl -s --connect-timeout 5 http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Available"
    
    # Test tracing endpoint
    echo ""
    echo "🧪 Testing tracing endpoint..."
    echo "Making request to /api/dashboard/tracing-test"
    
    response=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/dashboard/tracing-test)
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ API response: HTTP $http_code"
        echo "📊 Response preview:"
        echo "$response_body" | jq '.tracing' 2>/dev/null || echo "$response_body" | head -c 200
        echo ""
        echo "🔗 Check traces in Jaeger: http://localhost:16686"
        echo "   - Service: skc-bi-dashboard"
        echo "   - Operation: dashboard.tracing_test"
    else
        echo "❌ API response: HTTP $http_code"
        echo "$response_body"
    fi
else
    echo "❌ Not available (start with: npm run dev)"
fi

echo ""
echo "📚 Documentation: monitoring/TRACING.md"
echo "🐳 Start monitoring: docker compose -f docker-compose.monitoring.yml up -d"
echo "🚀 Start application: npm run dev" 
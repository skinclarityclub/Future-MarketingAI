#!/bin/bash

# ====================================================================
# SKC BI Dashboard - ELK Stack Setup Script
# Task 41.3: Automated setup and configuration of centralized logging
# ====================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ELASTICSEARCH_HOST="http://localhost:9200"
KIBANA_HOST="http://localhost:5601"
LOGSTASH_HOST="http://localhost:9600"
MAX_RETRIES=30
RETRY_INTERVAL=10

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local service_url=$2
    local max_retries=$3
    local retry_count=0

    print_status "Checking if $service_name is running..."
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -s -o /dev/null -w "%{http_code}" $service_url | grep -q "200\|300"; then
            print_success "$service_name is running and accessible"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        print_status "Waiting for $service_name... (attempt $retry_count/$max_retries)"
        sleep $RETRY_INTERVAL
    done
    
    print_error "$service_name is not accessible after $max_retries attempts"
    return 1
}

# Function to wait for Elasticsearch cluster to be ready
wait_for_elasticsearch() {
    print_status "Waiting for Elasticsearch cluster to be ready..."
    
    local retry_count=0
    while [ $retry_count -lt $MAX_RETRIES ]; do
        local cluster_health=$(curl -s "$ELASTICSEARCH_HOST/_cluster/health" | jq -r '.status' 2>/dev/null || echo "unreachable")
        
        if [ "$cluster_health" = "green" ] || [ "$cluster_health" = "yellow" ]; then
            print_success "Elasticsearch cluster is ready (status: $cluster_health)"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        print_status "Waiting for cluster health... (attempt $retry_count/$MAX_RETRIES, current status: $cluster_health)"
        sleep $RETRY_INTERVAL
    done
    
    print_error "Elasticsearch cluster health check failed"
    return 1
}

# Function to create index templates
create_index_templates() {
    print_status "Creating Elasticsearch index templates..."
    
    # Create the main logs template
    if [ -f "monitoring/elasticsearch/templates/skc-logs-template.json" ]; then
        print_status "Creating SKC logs index template..."
        
        local response=$(curl -s -w "%{http_code}" -X PUT \
            "$ELASTICSEARCH_HOST/_index_template/skc-bi-dashboard-logs" \
            -H "Content-Type: application/json" \
            -d @monitoring/elasticsearch/templates/skc-logs-template.json)
        
        local http_code=$(echo $response | tail -c 4)
        if [ "$http_code" = "200" ]; then
            print_success "SKC logs index template created successfully"
        else
            print_error "Failed to create SKC logs index template (HTTP: $http_code)"
            return 1
        fi
    else
        print_warning "SKC logs template file not found, skipping..."
    fi
    
    # Create ILM policy for log retention
    print_status "Creating Index Lifecycle Management policy..."
    
    local ilm_policy='{
        "policy": {
            "phases": {
                "hot": {
                    "actions": {
                        "rollover": {
                            "max_size": "5GB",
                            "max_age": "7d"
                        },
                        "set_priority": {
                            "priority": 100
                        }
                    }
                },
                "warm": {
                    "min_age": "7d",
                    "actions": {
                        "set_priority": {
                            "priority": 50
                        },
                        "allocate": {
                            "number_of_replicas": 0
                        }
                    }
                },
                "cold": {
                    "min_age": "30d",
                    "actions": {
                        "set_priority": {
                            "priority": 0
                        },
                        "allocate": {
                            "number_of_replicas": 0
                        }
                    }
                },
                "delete": {
                    "min_age": "90d",
                    "actions": {
                        "delete": {}
                    }
                }
            }
        }
    }'
    
    local response=$(curl -s -w "%{http_code}" -X PUT \
        "$ELASTICSEARCH_HOST/_ilm/policy/skc-logs-policy" \
        -H "Content-Type: application/json" \
        -d "$ilm_policy")
    
    local http_code=$(echo $response | tail -c 4)
    if [ "$http_code" = "200" ]; then
        print_success "ILM policy created successfully"
    else
        print_error "Failed to create ILM policy (HTTP: $http_code)"
    fi
}

# Function to create initial indices
create_initial_indices() {
    print_status "Creating initial log indices..."
    
    local today=$(date +%Y.%m.%d)
    local indices=(
        "skc-bi-dashboard-application-$today"
        "skc-bi-dashboard-container-$today"
        "skc-bi-dashboard-system-$today"
        "skc-bi-dashboard-security-$today"
    )
    
    for index in "${indices[@]}"; do
        print_status "Creating index: $index"
        
        local response=$(curl -s -w "%{http_code}" -X PUT \
            "$ELASTICSEARCH_HOST/$index" \
            -H "Content-Type: application/json" \
            -d '{
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                }
            }')
        
        local http_code=$(echo $response | tail -c 4)
        if [ "$http_code" = "200" ]; then
            print_success "Index $index created successfully"
        else
            print_warning "Index $index might already exist or failed to create (HTTP: $http_code)"
        fi
    done
}

# Function to setup Kibana index patterns and dashboards
setup_kibana() {
    print_status "Setting up Kibana index patterns and dashboards..."
    
    # Wait for Kibana to be ready
    if ! check_service "Kibana" "$KIBANA_HOST/api/status" 10; then
        print_error "Kibana is not accessible, skipping Kibana setup"
        return 1
    fi
    
    print_status "Creating Kibana index patterns..."
    
    # Create index pattern for application logs
    local index_pattern='{
        "attributes": {
            "title": "skc-bi-dashboard-*",
            "timeFieldName": "@timestamp",
            "fields": "[]"
        }
    }'
    
    local response=$(curl -s -w "%{http_code}" -X POST \
        "$KIBANA_HOST/api/saved_objects/index-pattern/skc-bi-dashboard-logs" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d "$index_pattern")
    
    local http_code=$(echo $response | tail -c 4)
    if [ "$http_code" = "200" ]; then
        print_success "Kibana index pattern created successfully"
    else
        print_warning "Kibana index pattern might already exist (HTTP: $http_code)"
    fi
    
    # Set default index pattern
    local default_pattern='{
        "attributes": {
            "defaultIndex": "skc-bi-dashboard-logs"
        }
    }'
    
    curl -s -X POST \
        "$KIBANA_HOST/api/kibana/settings/defaultIndex" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d "$default_pattern" > /dev/null
    
    print_success "Default index pattern set"
}

# Function to test log ingestion
test_log_ingestion() {
    print_status "Testing log ingestion..."
    
    # Send a test log entry
    local test_log='{
        "@timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "message": "ELK Stack setup test log entry",
        "level": "info",
        "service_name": "elk-setup-script",
        "service_type": "setup",
        "environment": "production",
        "application": "skc-bi-dashboard",
        "technology": "bash",
        "test": true
    }'
    
    local response=$(curl -s -w "%{http_code}" -X POST \
        "$ELASTICSEARCH_HOST/skc-bi-dashboard-test-$(date +%Y.%m.%d)/_doc" \
        -H "Content-Type: application/json" \
        -d "$test_log")
    
    local http_code=$(echo $response | tail -c 4)
    if [ "$http_code" = "201" ]; then
        print_success "Test log entry created successfully"
        
        # Wait a moment for indexing
        sleep 2
        
        # Search for the test log
        local search_response=$(curl -s "$ELASTICSEARCH_HOST/skc-bi-dashboard-test-*/_search?q=test:true&size=1")
        local hit_count=$(echo $search_response | jq -r '.hits.total.value' 2>/dev/null || echo "0")
        
        if [ "$hit_count" -gt 0 ]; then
            print_success "Test log entry found in search results"
        else
            print_warning "Test log entry not found in search (indexing may take time)"
        fi
    else
        print_error "Failed to create test log entry (HTTP: $http_code)"
        return 1
    fi
}

# Function to validate Logstash configuration
validate_logstash() {
    print_status "Validating Logstash configuration..."
    
    if [ -f "monitoring/logstash/pipeline/logstash.conf" ]; then
        # Check if logstash config syntax is valid
        if command -v logstash >/dev/null 2>&1; then
            print_status "Running Logstash configuration syntax check..."
            if logstash --config.test_and_exit -f monitoring/logstash/pipeline/logstash.conf; then
                print_success "Logstash configuration syntax is valid"
            else
                print_error "Logstash configuration has syntax errors"
                return 1
            fi
        else
            print_warning "Logstash command not available, skipping syntax check"
        fi
    else
        print_warning "Logstash configuration file not found"
    fi
    
    # Check if Logstash API is accessible
    if check_service "Logstash" "$LOGSTASH_HOST" 5; then
        local pipeline_stats=$(curl -s "$LOGSTASH_HOST/_node/stats/pipelines" | jq -r '.pipelines | keys | length' 2>/dev/null || echo "0")
        if [ "$pipeline_stats" -gt 0 ]; then
            print_success "Logstash pipelines are running"
        else
            print_warning "No Logstash pipelines detected"
        fi
    else
        print_warning "Logstash API not accessible"
    fi
}

# Function to generate summary report
generate_summary() {
    print_status "Generating ELK stack setup summary..."
    
    echo ""
    echo "======================================================================"
    echo "                    ELK STACK SETUP SUMMARY"
    echo "======================================================================"
    echo ""
    
    # Elasticsearch status
    echo "📊 ELASTICSEARCH STATUS:"
    local es_health=$(curl -s "$ELASTICSEARCH_HOST/_cluster/health" | jq -r '.status' 2>/dev/null || echo "unreachable")
    local es_nodes=$(curl -s "$ELASTICSEARCH_HOST/_cluster/health" | jq -r '.number_of_nodes' 2>/dev/null || echo "0")
    echo "   • Cluster Health: $es_health"
    echo "   • Active Nodes: $es_nodes"
    echo "   • Endpoint: $ELASTICSEARCH_HOST"
    echo ""
    
    # Kibana status
    echo "📈 KIBANA STATUS:"
    if curl -s "$KIBANA_HOST/api/status" >/dev/null 2>&1; then
        echo "   • Status: Running ✅"
        echo "   • Endpoint: $KIBANA_HOST"
    else
        echo "   • Status: Not accessible ❌"
    fi
    echo ""
    
    # Logstash status
    echo "🔄 LOGSTASH STATUS:"
    if curl -s "$LOGSTASH_HOST" >/dev/null 2>&1; then
        echo "   • Status: Running ✅"
        echo "   • Endpoint: $LOGSTASH_HOST"
    else
        echo "   • Status: Not accessible ❌"
    fi
    echo ""
    
    # Index information
    echo "📚 INDICES:"
    local indices=$(curl -s "$ELASTICSEARCH_HOST/_cat/indices/skc-bi-dashboard-*?h=index,docs.count,store.size" 2>/dev/null || echo "Unable to fetch indices")
    if [ "$indices" != "Unable to fetch indices" ]; then
        echo "$indices" | while IFS= read -r line; do
            echo "   • $line"
        done
    else
        echo "   • Unable to fetch index information"
    fi
    echo ""
    
    # Next steps
    echo "🚀 NEXT STEPS:"
    echo "   1. Access Kibana at: $KIBANA_HOST"
    echo "   2. Configure log sources to send logs to Logstash port 5044"
    echo "   3. Start Filebeat to collect logs from your applications"
    echo "   4. Create custom Kibana dashboards for your specific use cases"
    echo "   5. Set up alerts based on log patterns"
    echo ""
    
    echo "📖 DOCUMENTATION:"
    echo "   • Kibana User Guide: $KIBANA_HOST/app/home"
    echo "   • Elasticsearch API: $ELASTICSEARCH_HOST"
    echo "   • Log patterns: See monitoring/logstash/pipeline/logstash.conf"
    echo ""
    
    echo "======================================================================"
}

# Main execution
main() {
    echo ""
    echo "======================================================================"
    echo "           SKC BI Dashboard - ELK Stack Setup"
    echo "======================================================================"
    echo ""
    
    print_status "Starting ELK stack setup and configuration..."
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    if ! command -v curl >/dev/null 2>&1; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq >/dev/null 2>&1; then
        print_warning "jq is not installed, some features may not work properly"
    fi
    
    # Wait for services to be ready
    print_status "Waiting for ELK services to be ready..."
    
    if ! wait_for_elasticsearch; then
        print_error "Elasticsearch is not ready, aborting setup"
        exit 1
    fi
    
    # Create index templates and policies
    if create_index_templates; then
        print_success "Index templates created successfully"
    else
        print_error "Failed to create index templates"
        exit 1
    fi
    
    # Create initial indices
    create_initial_indices
    
    # Setup Kibana
    setup_kibana
    
    # Validate Logstash
    validate_logstash
    
    # Test log ingestion
    test_log_ingestion
    
    # Generate summary
    generate_summary
    
    print_success "ELK stack setup completed successfully!"
    print_status "You can now access Kibana at: $KIBANA_HOST"
}

# Run main function
main "$@" 
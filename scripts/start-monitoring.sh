#!/bin/bash

# ====================================================================
# SKC BI Dashboard - Monitoring Stack Startup Script
# Task 41.1: Advanced Observability Stack Setup
# ====================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.monitoring.yml"
MONITORING_DIR="monitoring"
ENV_FILE=".env.monitoring"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1

    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    print_error "$service_name failed to start within expected time"
    return 1
}

# Function to create monitoring directories
create_directories() {
    print_status "Creating monitoring directories..."
    
    mkdir -p "$MONITORING_DIR"/{prometheus,grafana,alertmanager,blackbox,logstash,kibana,filebeat,otel,traefik,postgres,uptime-kuma}
    mkdir -p "$MONITORING_DIR"/prometheus/{rules,data}
    mkdir -p "$MONITORING_DIR"/grafana/{provisioning,dashboards,data}
    mkdir -p "$MONITORING_DIR"/grafana/provisioning/{datasources,dashboards}
    mkdir -p "$MONITORING_DIR"/logstash/{pipeline,config}
    mkdir -p "$MONITORING_DIR"/traefik/dynamic
    
    print_success "Monitoring directories created"
}

# Function to create configuration files
create_configs() {
    print_status "Creating configuration files..."
    
    # Alertmanager configuration
    cat > "$MONITORING_DIR/alertmanager/alertmanager.yml" << 'EOF'
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@yourcompany.com'
  smtp_auth_username: 'alerts@yourcompany.com'
  smtp_auth_password: 'your-app-password'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://localhost:5001/'

  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@yourcompany.com'
        subject: 'CRITICAL: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Instance: {{ .Labels.instance }}
          {{ end }}
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts-critical'
        title: 'Critical Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: 'warning-alerts'
    email_configs:
      - to: 'team@yourcompany.com'
        subject: 'WARNING: {{ .GroupLabels.alertname }}'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts-warning'
        title: 'Warning Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']
EOF

    # Blackbox exporter configuration
    cat > "$MONITORING_DIR/blackbox/blackbox.yml" << 'EOF'
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: []
      method: GET
      follow_redirects: true
      preferred_ip_protocol: "ip4"

  http_post_2xx:
    prober: http
    timeout: 5s
    http:
      method: POST
      headers:
        Content-Type: application/json
      body: '{}'

  tcp_connect:
    prober: tcp
    timeout: 5s

  icmp:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: "ip4"

  dns:
    prober: dns
    timeout: 5s
    dns:
      query_name: "google.com"
      query_type: "A"
EOF

    # Grafana datasource provisioning
    cat > "$MONITORING_DIR/grafana/provisioning/datasources/prometheus.yml" << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    jsonData:
      httpMethod: POST
      prometheusType: Prometheus
      prometheusVersion: 2.45.0

  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
    editable: true

  - name: Elasticsearch
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: "logstash-*"
    editable: true
    jsonData:
      interval: Daily
      timeField: "@timestamp"
      esVersion: "8.9.0"
EOF

    # Grafana dashboard provisioning
    cat > "$MONITORING_DIR/grafana/provisioning/dashboards/dashboards.yml" << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

    # Logstash pipeline configuration
    cat > "$MONITORING_DIR/logstash/pipeline/logstash.conf" << 'EOF'
input {
  beats {
    port => 5044
  }
  
  tcp {
    port => 5000
    codec => json
  }
  
  udp {
    port => 5000
    codec => json
  }
}

filter {
  if [fields][logtype] == "nginx" {
    grok {
      match => { "message" => "%{NGINXACCESS}" }
    }
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
  }
  
  if [fields][logtype] == "application" {
    json {
      source => "message"
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
  
  # Add hostname and environment
  mutate {
    add_field => { "environment" => "production" }
    add_field => { "cluster" => "skc-bi-dashboard" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logstash-%{+YYYY.MM.dd}"
  }
  
  stdout {
    codec => rubydebug
  }
}
EOF

    # Logstash main config
    cat > "$MONITORING_DIR/logstash/config/logstash.yml" << 'EOF'
http.host: "0.0.0.0"
xpack.monitoring.enabled: false
xpack.monitoring.elasticsearch.hosts: ["http://elasticsearch:9200"]
path.config: /usr/share/logstash/pipeline
EOF

    # Filebeat configuration
    cat > "$MONITORING_DIR/filebeat/filebeat.yml" << 'EOF'
filebeat.inputs:
- type: docker
  containers.ids:
  - "*"
  processors:
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"

- type: log
  enabled: true
  paths:
    - /var/log/*.log
    - /var/log/*/*.log
  fields:
    logtype: system
  fields_under_root: true

output.logstash:
  hosts: ["logstash:5044"]

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
EOF

    # OpenTelemetry Collector configuration
    cat > "$MONITORING_DIR/otel/otel-collector-config.yaml" << 'EOF'
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  
  prometheus:
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          scrape_interval: 10s
          static_configs:
            - targets: ['0.0.0.0:8889']

processors:
  batch:

exporters:
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
  
  prometheus:
    endpoint: "0.0.0.0:8889"
  
  logging:
    loglevel: debug

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger, logging]
    
    metrics:
      receivers: [otlp, prometheus]
      processors: [batch]
      exporters: [prometheus, logging]
    
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
EOF

    # Traefik configuration
    cat > "$MONITORING_DIR/traefik/traefik.yml" << 'EOF'
api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
  file:
    directory: /etc/traefik/dynamic
    watch: true

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true

log:
  level: INFO

accessLog: {}
EOF

    # PostgreSQL queries for exporter
    cat > "$MONITORING_DIR/postgres/queries.yaml" << 'EOF'
pg_replication:
  query: "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as lag"
  master: true
  metrics:
    - lag:
        usage: "GAUGE"
        description: "Replication lag behind master in seconds"

pg_postmaster:
  query: "SELECT pg_postmaster_start_time as start_time_seconds from pg_postmaster_start_time()"
  master: true
  metrics:
    - start_time_seconds:
        usage: "GAUGE"
        description: "Time at which postmaster started"

pg_stat_user_tables:
  query: |
    SELECT
      current_database() datname,
      schemaname,
      relname,
      seq_scan,
      seq_tup_read,
      idx_scan,
      idx_tup_fetch,
      n_tup_ins,
      n_tup_upd,
      n_tup_del,
      n_tup_hot_upd,
      n_live_tup,
      n_dead_tup,
      n_mod_since_analyze,
      COALESCE(last_vacuum, '1970-01-01Z') as last_vacuum,
      COALESCE(last_autovacuum, '1970-01-01Z') as last_autovacuum,
      COALESCE(last_analyze, '1970-01-01Z') as last_analyze,
      COALESCE(last_autoanalyze, '1970-01-01Z') as last_autoanalyze,
      vacuum_count,
      autovacuum_count,
      analyze_count,
      autoanalyze_count
    FROM pg_stat_user_tables
  metrics:
    - datname:
        usage: "LABEL"
        description: "Name of current database"
    - schemaname:
        usage: "LABEL"
        description: "Name of the schema that this table is in"
    - relname:
        usage: "LABEL"
        description: "Name of this table"
    - seq_scan:
        usage: "COUNTER"
        description: "Number of sequential scans initiated on this table"
    - seq_tup_read:
        usage: "COUNTER"
        description: "Number of live rows fetched by sequential scans"
    - idx_scan:
        usage: "COUNTER"
        description: "Number of index scans initiated on this table"
    - idx_tup_fetch:
        usage: "COUNTER"
        description: "Number of live rows fetched by index scans"
    - n_tup_ins:
        usage: "COUNTER"
        description: "Number of rows inserted"
    - n_tup_upd:
        usage: "COUNTER"
        description: "Number of rows updated"
    - n_tup_del:
        usage: "COUNTER"
        description: "Number of rows deleted"
    - n_tup_hot_upd:
        usage: "COUNTER"
        description: "Number of rows HOT updated"
    - n_live_tup:
        usage: "GAUGE"
        description: "Estimated number of live rows"
    - n_dead_tup:
        usage: "GAUGE"
        description: "Estimated number of dead rows"
    - n_mod_since_analyze:
        usage: "GAUGE"
        description: "Estimated number of rows changed since last analyze"
    - last_vacuum:
        usage: "GAUGE"
        description: "Last time at which this table was manually vacuumed"
    - last_autovacuum:
        usage: "GAUGE"
        description: "Last time at which this table was vacuumed by the autovacuum daemon"
    - last_analyze:
        usage: "GAUGE"
        description: "Last time at which this table was manually analyzed"
    - last_autoanalyze:
        usage: "GAUGE"
        description: "Last time at which this table was analyzed by the autovacuum daemon"
    - vacuum_count:
        usage: "COUNTER"
        description: "Number of times this table has been manually vacuumed"
    - autovacuum_count:
        usage: "COUNTER"
        description: "Number of times this table has been vacuumed by the autovacuum daemon"
    - analyze_count:
        usage: "COUNTER"
        description: "Number of times this table has been manually analyzed"
    - autoanalyze_count:
        usage: "COUNTER"
        description: "Number of times this table has been analyzed by the autovacuum daemon"
EOF

    print_success "Configuration files created"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command_exists curl; then
        print_warning "curl is not installed. Some health checks may fail."
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to create environment file
create_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_status "Creating monitoring environment file..."
        
        cat > "$ENV_FILE" << 'EOF'
# Monitoring Stack Configuration
GRAFANA_ADMIN_PASSWORD=admin123!
GRAFANA_SECRET_KEY=your-secret-key-here

# SMTP Configuration for Alertmanager
SMTP_HOST=smtp.gmail.com:587
SMTP_FROM=alerts@yourcompany.com
SMTP_USER=alerts@yourcompany.com
SMTP_PASSWORD=your-app-password

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/your/webhook/url

# Database Configuration
POSTGRES_HOST=your-postgres-host
POSTGRES_PASSWORD=your-postgres-password
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
EOF
        
        print_warning "Environment file created at $ENV_FILE"
        print_warning "Please update the configuration values before starting the stack."
    fi
}

# Function to start monitoring stack
start_monitoring_stack() {
    print_status "Starting monitoring stack..."
    
    # Load environment variables
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
    fi
    
    # Start the monitoring stack
    docker-compose -f "$COMPOSE_FILE" up -d
    
    print_success "Monitoring stack containers started"
}

# Function to verify services
verify_services() {
    print_status "Verifying monitoring services..."
    
    # Wait for services to be ready
    services=(
        "Prometheus:http://localhost:9090/-/healthy"
        "Grafana:http://localhost:3000/api/health"
        "Alertmanager:http://localhost:9093/-/healthy"
        "Jaeger:http://localhost:16686/"
        "Elasticsearch:http://localhost:9200/_cluster/health"
        "Kibana:http://localhost:5601/api/status"
    )
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name service_url <<< "$service_info"
        if wait_for_service "$service_name" "$service_url" 15; then
            print_success "$service_name is healthy"
        else
            print_warning "$service_name may not be ready yet"
        fi
    done
}

# Function to show access information
show_access_info() {
    print_success "Monitoring stack is running!"
    echo
    echo "Access URLs:"
    echo "  Prometheus:     http://localhost:9090"
    echo "  Grafana:        http://localhost:3000 (admin/admin123!)"
    echo "  Alertmanager:   http://localhost:9093"
    echo "  Jaeger:         http://localhost:16686"
    echo "  Kibana:         http://localhost:5601"
    echo "  Elasticsearch:  http://localhost:9200"
    echo "  Traefik:        http://localhost:8081"
    echo "  Uptime Kuma:    http://localhost:3001"
    echo
    echo "Metrics endpoint:  http://localhost:3000/api/metrics"
    echo
    echo "To stop the stack: docker-compose -f $COMPOSE_FILE down"
    echo "To view logs: docker-compose -f $COMPOSE_FILE logs -f [service]"
}

# Main execution
main() {
    echo "======================================================================"
    echo "           SKC BI Dashboard - Monitoring Stack Setup"
    echo "======================================================================"
    echo
    
    check_prerequisites
    create_directories
    create_configs
    create_env_file
    start_monitoring_stack
    
    print_status "Waiting for services to initialize..."
    sleep 10
    
    verify_services
    show_access_info
    
    echo
    print_success "Monitoring stack setup completed!"
    print_status "Check the logs if any service fails to start properly."
}

# Run main function
main "$@" 
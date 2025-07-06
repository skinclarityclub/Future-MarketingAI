# SKC BI Dashboard - Advanced Observability Stack

## Overview

This monitoring stack provides comprehensive observability for the SKC BI Dashboard application with enterprise-grade monitoring, logging, and alerting capabilities to ensure 99.99% SLA compliance.

## Architecture

The observability stack consists of:

### Metrics Collection & Monitoring

- **Prometheus**: Time-series database for metrics collection
- **Grafana**: Visualization and dashboarding platform
- **Node Exporter**: System-level metrics
- **cAdvisor**: Container metrics
- **Blackbox Exporter**: External service monitoring
- **Custom Metrics**: Application-specific business metrics

### Logging & Analysis

- **ELK Stack**:
  - **Elasticsearch**: Log storage and search
  - **Logstash**: Log processing and enrichment
  - **Kibana**: Log visualization and analysis
- **Filebeat**: Log shipping from various sources

### Distributed Tracing

- **Jaeger**: End-to-end request tracing
- **OpenTelemetry Collector**: Trace collection and processing

### Alerting & Notifications

- **Alertmanager**: Alert routing and management
- **PagerDuty Integration**: Critical incident management
- **Slack Integration**: Team notifications
- **Email Notifications**: Alert delivery

### Additional Services

- **Traefik**: Load balancer with metrics export
- **Uptime Kuma**: Simple uptime monitoring
- **Redis & PostgreSQL Exporters**: Database metrics

## Quick Start

### Prerequisites

1. **Docker & Docker Compose**: Ensure Docker Desktop is running
2. **System Resources**:
   - Minimum 8GB RAM
   - 20GB free disk space
   - Available ports: 3000, 5601, 9090, 9093, 16686

### Installation

1. **Clone and navigate to the project directory**

   ```bash
   cd skc-bi-dashboard
   ```

2. **Run the setup script** (Linux/macOS)

   ```bash
   ./scripts/start-monitoring.sh
   ```

3. **Manual setup** (Windows or if script fails)

   ```bash
   # Create directories
   mkdir -p monitoring/{prometheus,grafana,alertmanager,logstash,kibana}

   # Start the stack
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

### Configuration

1. **Update environment variables** in `.env.monitoring`:

   ```env
   # Grafana Configuration
   GRAFANA_ADMIN_PASSWORD=your-secure-password

   # SMTP for Alertmanager
   SMTP_HOST=smtp.gmail.com:587
   SMTP_FROM=alerts@yourcompany.com
   SMTP_USER=alerts@yourcompany.com
   SMTP_PASSWORD=your-app-password

   # Slack Integration
   SLACK_WEBHOOK_URL=https://hooks.slack.com/your/webhook/url

   # Database Connections
   POSTGRES_HOST=your-postgres-host
   POSTGRES_PASSWORD=your-postgres-password
   ```

2. **Update Alertmanager configuration** in `monitoring/alertmanager/alertmanager.yml`:
   - Configure email recipients
   - Set up Slack webhooks
   - Configure PagerDuty integration

## Access URLs

Once the stack is running, access the services at:

- **Grafana**: http://localhost:3000 (admin/admin123!)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Jaeger**: http://localhost:16686
- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200
- **Traefik Dashboard**: http://localhost:8081
- **Uptime Kuma**: http://localhost:3001

## Monitoring Capabilities

### Application Metrics

The `/api/metrics` endpoint exposes:

```
# HTTP Request Metrics
http_requests_total
http_requests_by_method_total{method="GET|POST|PUT|DELETE"}
http_requests_by_status_total{status="200|404|500"}
http_request_duration_seconds_bucket

# Business Metrics
active_users_count
total_tenants_count
api_calls_today_total
successful_logins_total
failed_logins_total
last_data_refresh_timestamp

# System Metrics
nodejs_memory_usage_bytes
nodejs_cpu_usage_percent
cache_hits_total
cache_misses_total
```

### Critical Alerts

The system monitors and alerts on:

#### SLA-Critical Alerts

- **Application Down**: Main app unreachable > 1 minute
- **High Error Rate**: >5% error rate for 5 minutes
- **SLA Breach**: 99.99% availability threshold exceeded
- **Database Issues**: Connection problems, slow queries

#### Performance Alerts

- **High Response Time**: >2s 95th percentile for 5 minutes
- **Resource Exhaustion**: CPU >80%, Memory >85%, Disk >85%
- **External Service Issues**: Third-party service failures

#### Security Alerts

- **Unauthorized Access**: High rate of 401 responses
- **Suspicious Activity**: Unusual access patterns
- **Rate Limiting**: Excessive requests being blocked

### Custom Dashboards

Pre-configured Grafana dashboards include:

1. **Executive Overview**

   - SLA compliance metrics
   - User activity trends
   - Revenue impact indicators

2. **Application Performance**

   - Response times and throughput
   - Error rates and success metrics
   - Database performance

3. **Infrastructure Health**

   - System resource utilization
   - Container metrics
   - Network performance

4. **Business Intelligence**
   - User engagement metrics
   - Feature usage analytics
   - Data pipeline health

## Alert Configuration

### Severity Levels

- **Critical**: Immediate response required (SLA impact)
- **Warning**: Investigation needed (potential impact)
- **Info**: Informational only

### Notification Channels

1. **Email**: All team members for warnings, on-call for critical
2. **Slack**: Real-time team notifications
3. **PagerDuty**: Critical alerts with escalation policies

### Alert Routing

```yaml
# Critical alerts → PagerDuty + Slack + Email
# Warning alerts → Slack + Email
# Info alerts → Slack only
```

## Log Management

### Log Sources

- **Application Logs**: Next.js server logs
- **System Logs**: OS and container logs
- **Access Logs**: HTTP request logs
- **Database Logs**: PostgreSQL query logs
- **Security Logs**: Authentication and authorization events

### Log Processing Pipeline

1. **Filebeat** collects logs from various sources
2. **Logstash** processes, enriches, and transforms logs
3. **Elasticsearch** stores and indexes log data
4. **Kibana** provides search and visualization

### Log Retention

- **Hot Storage**: Last 7 days (fast access)
- **Warm Storage**: 8-30 days (slower access)
- **Cold Storage**: 31-90 days (archive)
- **Deletion**: After 90 days

## Distributed Tracing

### Trace Collection

- **OpenTelemetry SDK**: Automatic instrumentation
- **Custom Spans**: Business logic tracing
- **Database Queries**: SQL execution tracking
- **External Calls**: API and service interactions

### Trace Analysis

Use Jaeger UI to:

- Track request flows across services
- Identify performance bottlenecks
- Debug errors and failures
- Analyze service dependencies

## Performance Tuning

### Prometheus Configuration

```yaml
# Storage optimization
storage.tsdb.retention.time: 30d
storage.tsdb.retention.size: 10GB

# Query optimization
query.max-concurrency: 20
query.timeout: 2m
```

### Elasticsearch Tuning

```yaml
# Memory allocation
ES_JAVA_OPTS: "-Xms2g -Xmx2g"

# Index optimization
number_of_shards: 3
number_of_replicas: 1
```

## Backup and Recovery

### Automated Backups

- **Prometheus Data**: Daily snapshots
- **Grafana Dashboards**: Configuration export
- **Elasticsearch Indices**: Snapshot to S3/Azure
- **Configuration Files**: Git repository backup

### Disaster Recovery

1. **Data Recovery**: Restore from latest snapshots
2. **Configuration Recovery**: Deploy from Git
3. **Service Recovery**: Automated container restart
4. **Validation**: Health checks and smoke tests

## Security

### Authentication

- **Grafana**: Admin authentication with LDAP/OAuth integration
- **Prometheus**: Query authentication via reverse proxy
- **Elasticsearch**: X-Pack security or reverse proxy

### Network Security

- **Internal Networks**: Isolated Docker networks
- **TLS Encryption**: HTTPS for external access
- **Firewall Rules**: Restricted port access
- **VPN Access**: Secure remote monitoring

### Data Protection

- **Sensitive Data**: Masked in logs and metrics
- **API Keys**: Environment variable storage
- **Access Logs**: Audit trail for all changes

## Troubleshooting

### Common Issues

1. **Service Won't Start**

   ```bash
   # Check logs
   docker-compose -f docker-compose.monitoring.yml logs [service]

   # Restart service
   docker-compose -f docker-compose.monitoring.yml restart [service]
   ```

2. **High Memory Usage**

   ```bash
   # Check container resources
   docker stats

   # Adjust memory limits in compose file
   mem_limit: 2g
   ```

3. **Missing Metrics**

   ```bash
   # Verify scrape targets
   curl http://localhost:9090/api/v1/targets

   # Check application metrics endpoint
   curl http://localhost:3000/api/metrics
   ```

### Performance Issues

1. **Slow Queries**: Optimize Prometheus queries
2. **High Cardinality**: Reduce metric labels
3. **Storage Issues**: Implement data retention policies

### Log Troubleshooting

1. **Missing Logs**: Check Filebeat configuration
2. **Parse Errors**: Verify Logstash grok patterns
3. **Index Issues**: Check Elasticsearch cluster health

## Maintenance

### Regular Tasks

- **Weekly**: Review alert configurations
- **Monthly**: Update dashboards and queries
- **Quarterly**: Capacity planning and scaling

### Updates

- **Security Patches**: Apply container updates
- **Version Upgrades**: Test in staging first
- **Configuration Changes**: Version control all changes

### Monitoring the Monitoring

- **Self-Monitoring**: Prometheus monitors itself
- **Health Checks**: Automated service validation
- **Capacity Alerts**: Storage and performance limits

## Support and Documentation

### Internal Documentation

- **Runbooks**: Step-by-step incident response
- **Playbooks**: Common operational procedures
- **Architecture Diagrams**: System component relationships

### External Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Elasticsearch Guide](https://www.elastic.co/guide/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)

### Training Materials

- **Monitoring Best Practices**: Internal training sessions
- **Alert Response**: Incident management procedures
- **Dashboard Usage**: End-user training guides

## Contributing

### Adding New Metrics

1. Update application metrics endpoint
2. Add Prometheus scrape configuration
3. Create Grafana dashboard panels
4. Configure relevant alerts

### Dashboard Development

1. Use Grafana dashboard JSON export
2. Version control dashboard definitions
3. Test with sample data
4. Document dashboard purpose and usage

---

**Note**: This monitoring stack is designed for production use and should be properly secured and maintained according to your organization's security policies and operational procedures.

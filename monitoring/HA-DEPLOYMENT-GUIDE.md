# High Availability Monitoring Stack Deployment Guide

## Task 41.6: 99.99% SLA Compliance Implementation

This guide covers the deployment of the enterprise-grade high availability observability stack for the SKC BI Dashboard.

## Overview

The HA monitoring stack provides:

- **99.99% uptime target** (52.56 minutes downtime per year)
- **Redundant Prometheus instances** with load balancing
- **Clustered Alertmanager** with gossip protocol
- **HA Elasticsearch cluster** for log storage
- **Load balanced access** through HAProxy
- **Comprehensive SLA monitoring** with immediate alerting

## Architecture Components

### Core Components

- **2x Prometheus instances** (prometheus-1, prometheus-2)
- **2x Alertmanager instances** (alertmanager-1, alertmanager-2)
- **HAProxy load balancer** for traffic distribution
- **Elasticsearch cluster** (master + data node)
- **Grafana with Redis session store**
- **SLA monitoring** with Blackbox Exporter

### High Availability Features

- **Active-Active Prometheus** with identical configurations
- **Clustered Alertmanager** with peer communication
- **Load balancing** for all critical services
- **Health checks** and automatic failover
- **Persistent data storage** with volume mounts

## Deployment Steps

### 1. Prerequisites

Ensure you have:

- Docker and Docker Compose installed
- Sufficient system resources (minimum 8GB RAM, 4 CPU cores)
- Network ports available (see Port Mapping section)
- SSL certificates (if using HTTPS)

### 2. Environment Configuration

Create environment files for sensitive configuration:

```bash
# Create .env file for API keys and credentials
cat > .env << EOF
# PagerDuty Integration
PAGERDUTY_SLA_CRITICAL_KEY=your-pagerduty-sla-key
PAGERDUTY_MONITORING_KEY=your-pagerduty-monitoring-key
PAGERDUTY_CRITICAL_KEY=your-pagerduty-critical-key
PAGERDUTY_PROMETHEUS_KEY=your-pagerduty-prometheus-key

# Slack Webhooks
SLACK_SLA_WEBHOOK=https://hooks.slack.com/services/YOUR/SLA/WEBHOOK
SLACK_MONITORING_WEBHOOK=https://hooks.slack.com/services/YOUR/MONITORING/WEBHOOK
SLACK_CRITICAL_WEBHOOK=https://hooks.slack.com/services/YOUR/CRITICAL/WEBHOOK
SLACK_PROMETHEUS_WEBHOOK=https://hooks.slack.com/services/YOUR/PROMETHEUS/WEBHOOK
SLACK_ALERTMANAGER_WEBHOOK=https://hooks.slack.com/services/YOUR/ALERTMANAGER/WEBHOOK
SLACK_GRAFANA_WEBHOOK=https://hooks.slack.com/services/YOUR/GRAFANA/WEBHOOK

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USERNAME=alerts@skc-company.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=alerts@skc-company.com
EOF
```

### 3. Deploy the HA Stack

```bash
# Start the complete HA monitoring stack
docker-compose -f docker-compose.monitoring-ha.yml up -d

# Verify all services are running
docker-compose -f docker-compose.monitoring-ha.yml ps

# Check service health
docker-compose -f docker-compose.monitoring-ha.yml logs -f
```

### 4. Verify HA Configuration

#### Prometheus Cluster Verification

```bash
# Check Prometheus instances
curl http://localhost:9091/-/healthy  # prometheus-1
curl http://localhost:9092/-/healthy  # prometheus-2

# Check load balanced access
curl http://localhost:9090/-/healthy  # HAProxy load balanced
```

#### Alertmanager Cluster Verification

```bash
# Check Alertmanager instances
curl http://localhost:9094/-/healthy  # alertmanager-1
curl http://localhost:9096/-/healthy  # alertmanager-2

# Check cluster status
curl http://localhost:9094/api/v1/status
curl http://localhost:9096/api/v1/status
```

#### Elasticsearch Cluster Verification

```bash
# Check cluster health
curl http://localhost:9200/_cluster/health

# Check node status
curl http://localhost:9200/_cat/nodes?v
```

### 5. Access Points

| Service       | Load Balanced               | Direct Access                                |
| ------------- | --------------------------- | -------------------------------------------- |
| Prometheus    | http://localhost:9090       | 9091 (prometheus-1), 9092 (prometheus-2)     |
| Alertmanager  | http://localhost:9093       | 9094 (alertmanager-1), 9096 (alertmanager-2) |
| Grafana       | http://localhost:3000       | -                                            |
| Elasticsearch | http://localhost:9200       | 9201 (data1)                                 |
| HAProxy Stats | http://localhost:8404/stats | -                                            |
| SLA Monitor   | http://localhost:9115       | -                                            |

## SLA Monitoring Configuration

### Target SLA Metrics

- **Availability**: 99.99% (maximum 52.56 minutes downtime per year)
- **Response Time**: < 1 second for critical endpoints
- **MTTR**: < 5 minutes for critical issues
- **RTO**: < 1 minute for monitoring stack components

### Monitored Endpoints

- Main application (http://localhost:3000)
- Health endpoints (/api/health, /api/status)
- Monitoring stack components
- Database connectivity
- External dependencies

### Alert Escalation Matrix

| Severity   | Initial Alert | Escalation Time | Escalation Target            |
| ---------- | ------------- | --------------- | ---------------------------- |
| SLA Breach | Immediate     | 0 seconds       | PagerDuty + Slack (SLA team) |
| Critical   | Immediate     | 2 minutes       | PagerDuty + Slack (On-call)  |
| High       | 5 seconds     | 15 minutes      | Slack (Team leads)           |
| Warning    | 30 seconds    | 30 minutes      | Slack (Development team)     |
| Info       | 1 minute      | 2 hours         | Slack (General alerts)       |

## High Availability Testing

### Failover Testing

#### Test Prometheus HA

```bash
# Stop prometheus-1 and verify prometheus-2 handles load
docker stop skc-prometheus-1

# Verify HAProxy redirects traffic
curl http://localhost:9090/-/healthy  # Should still work

# Restart prometheus-1
docker start skc-prometheus-1
```

#### Test Alertmanager Clustering

```bash
# Stop alertmanager-1 and verify clustering
docker stop skc-alertmanager-1

# Check cluster status on alertmanager-2
curl http://localhost:9096/api/v1/status

# Restart alertmanager-1
docker start skc-alertmanager-1
```

#### Test Load Balancer

```bash
# Check HAProxy stats
curl http://localhost:8404/stats

# Verify backend health in HAProxy
# Green = healthy, Red = unhealthy
```

### SLA Breach Simulation

```bash
# Simulate application downtime
docker stop main-application

# Verify SLA alerts are triggered
# Check Slack channels and PagerDuty for immediate alerts

# Restore application
docker start main-application
```

## Maintenance Procedures

### Rolling Updates

#### Update Prometheus Configuration

```bash
# Update prometheus-1
docker exec skc-prometheus-1 curl -X POST http://localhost:9090/-/reload

# Update prometheus-2
docker exec skc-prometheus-2 curl -X POST http://localhost:9090/-/reload
```

#### Update Alertmanager Configuration

```bash
# Reload alertmanager-1
docker exec skc-alertmanager-1 curl -X POST http://localhost:9093/-/reload

# Reload alertmanager-2
docker exec skc-alertmanager-2 curl -X POST http://localhost:9093/-/reload
```

### Backup Procedures

#### Prometheus Data Backup

```bash
# Create snapshots of Prometheus data
docker exec skc-prometheus-1 curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot
docker exec skc-prometheus-2 curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot

# Backup volumes
docker run --rm -v prometheus_data_1:/data -v $(pwd)/backups:/backup alpine tar czf /backup/prometheus-1-backup.tar.gz -C /data .
docker run --rm -v prometheus_data_2:/data -v $(pwd)/backups:/backup alpine tar czf /backup/prometheus-2-backup.tar.gz -C /data .
```

#### Grafana Configuration Backup

```bash
# Backup Grafana data
docker run --rm -v grafana_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/grafana-backup.tar.gz -C /data .
```

## Monitoring the Monitoring Stack

### Key Metrics to Watch

#### Prometheus Metrics

- `prometheus_tsdb_head_samples_appended_total` - Data ingestion rate
- `prometheus_config_last_reload_successful` - Configuration reload status
- `prometheus_rule_evaluation_failures_total` - Rule evaluation failures

#### Alertmanager Metrics

- `alertmanager_alerts` - Active alerts count
- `alertmanager_cluster_members` - Cluster size
- `alertmanager_notifications_total` - Notification delivery rate

#### HAProxy Metrics

- `haproxy_backend_up` - Backend health status
- `haproxy_backend_response_time_average_seconds` - Response times
- `haproxy_backend_sessions_total` - Session counts

#### SLA Metrics

- `probe_success` - Endpoint availability
- `probe_duration_seconds` - Response time
- `probe_http_status_code` - HTTP status codes

### Dashboard Recommendations

Create Grafana dashboards for:

1. **SLA Overview Dashboard** - 99.99% compliance tracking
2. **Monitoring Stack Health** - Component status and performance
3. **Alerting Overview** - Alert volumes and escalation patterns
4. **HA Status Dashboard** - Cluster health and failover status

## Troubleshooting

### Common Issues

#### Split-brain in Alertmanager Cluster

```bash
# Check cluster connectivity
docker exec skc-alertmanager-1 wget -qO- http://alertmanager-2:9094/api/v1/status
docker exec skc-alertmanager-2 wget -qO- http://alertmanager-1:9094/api/v1/status

# Restart both instances if needed
docker restart skc-alertmanager-1 skc-alertmanager-2
```

#### Prometheus Data Inconsistency

```bash
# Check data consistency between instances
curl http://localhost:9091/api/v1/query?query=up | jq '.data.result | length'
curl http://localhost:9092/api/v1/query?query=up | jq '.data.result | length'

# If inconsistent, check configuration and scrape targets
```

#### HAProxy Backend Failures

```bash
# Check HAProxy logs
docker logs skc-haproxy

# Verify backend health
curl http://localhost:8404/stats

# Manual backend testing
curl http://prometheus-1:9090/-/healthy
curl http://prometheus-2:9090/-/healthy
```

### Emergency Procedures

#### Complete Stack Failure

1. Check infrastructure (Docker, networking)
2. Verify external dependencies (databases, APIs)
3. Review recent changes and configurations
4. Restore from backups if necessary
5. Escalate to infrastructure team

#### SLA Breach Response

1. Immediate investigation of affected services
2. Implement temporary workarounds if possible
3. Document downtime cause and duration
4. Calculate SLA impact and report to stakeholders
5. Post-incident review and improvement planning

## Performance Optimization

### Resource Allocation

- **Prometheus**: 2GB RAM, 2 CPU cores each
- **Alertmanager**: 512MB RAM, 1 CPU core each
- **Elasticsearch**: 2GB RAM, 2 CPU cores each
- **Grafana**: 1GB RAM, 1 CPU core
- **HAProxy**: 256MB RAM, 1 CPU core

### Retention Policies

- **Prometheus**: 30 days (configurable)
- **Elasticsearch**: 14 days for logs
- **Alertmanager**: 120 hours for alert history

### Scaling Considerations

- Add more Prometheus instances for higher metric volume
- Scale Elasticsearch cluster for log retention requirements
- Implement external storage for long-term metrics retention
- Consider federation for multi-region deployments

## Security Considerations

### Network Security

- Use internal networks for component communication
- Implement TLS for external access
- Restrict access to administrative endpoints
- Enable authentication for Grafana and sensitive endpoints

### Credential Management

- Store sensitive information in environment variables
- Use Docker secrets for production deployments
- Rotate API keys and passwords regularly
- Implement least-privilege access principles

## Success Criteria

The HA deployment is considered successful when:

✅ **All components are running and healthy**

- All Docker containers are in 'running' state
- Health checks are passing for all services
- Load balancer shows all backends as healthy

✅ **High availability is functional**

- Services remain available when one instance is stopped
- Alertmanager cluster is properly formed and synchronized
- Prometheus instances are collecting identical metrics

✅ **SLA monitoring is operational**

- SLA endpoints are being monitored every 15-30 seconds
- Alerts are being generated and routed correctly
- PagerDuty and Slack integrations are functional

✅ **Performance meets requirements**

- Response times are under 1 second for critical endpoints
- System resources are within allocated limits
- 99.99% availability target is achievable

## Next Steps

After successful deployment:

1. Complete subtask 41.7 - Documentation and Training
2. Implement additional monitoring for application-specific metrics
3. Set up long-term metrics storage and retention
4. Conduct disaster recovery testing
5. Optimize alert rules based on operational experience

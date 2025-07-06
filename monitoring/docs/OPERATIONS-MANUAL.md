# SKC BI Dashboard - Observability Stack Operations Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Daily Operations](#daily-operations)
4. [Monitoring & Alerting](#monitoring--alerting)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Maintenance Procedures](#maintenance-procedures)
7. [Incident Response](#incident-response)
8. [Performance Tuning](#performance-tuning)
9. [Security Operations](#security-operations)
10. [Backup & Recovery](#backup--recovery)

---

## Introduction

This manual provides comprehensive guidance for operating and maintaining the SKC BI Dashboard observability stack. The stack is designed to achieve 99.99% uptime and provides real-time monitoring, alerting, and observability for the entire platform.

### Key Personnel Responsibilities

**Operations Team:**

- Daily health checks and monitoring
- Incident response and escalation
- Routine maintenance and updates
- Performance monitoring and optimization

**DevOps Engineers:**

- Configuration management
- Infrastructure scaling
- Automation and tooling
- Security compliance

**Site Reliability Engineers:**

- SLA compliance monitoring
- Capacity planning
- Disaster recovery testing
- Advanced troubleshooting

---

## Architecture Overview

### Core Components

#### Prometheus Cluster (HA)

- **prometheus-1**: Primary metrics collection instance
- **prometheus-2**: Secondary metrics collection instance
- **HAProxy**: Load balancer for Prometheus instances
- **Purpose**: Metrics collection, storage, and querying
- **SLA Target**: 99.99% availability

#### Alertmanager Cluster (HA)

- **alertmanager-1**: Primary alert processing instance
- **alertmanager-2**: Secondary alert processing instance
- **Clustering**: Gossip protocol for synchronization
- **Purpose**: Alert routing, grouping, and notification
- **SLA Target**: 99.99% availability

#### Grafana (HA-Ready)

- **grafana**: Visualization and dashboard service
- **redis-grafana**: Session storage for HA
- **Purpose**: Metrics visualization and reporting
- **SLA Target**: 99.9% availability

#### Elasticsearch Cluster

- **elasticsearch-master**: Cluster coordination
- **elasticsearch-data1**: Primary data storage
- **Purpose**: Log storage and search
- **SLA Target**: 99.9% availability

#### SLA Monitoring

- **sla-monitor**: Blackbox exporter for endpoint monitoring
- **Purpose**: 99.99% SLA compliance verification
- **Critical**: Must never go down

### Network Architecture

```
[Internet] → [HAProxy] → [Prometheus-1/Prometheus-2]
                     → [Alertmanager-1/Alertmanager-2]
                     → [Grafana]
```

---

## Daily Operations

### Morning Health Check (9:00 AM Daily)

#### 1. Service Status Check

```bash
# Check all containers status
docker-compose -f docker-compose.monitoring-ha.yml ps

# Expected output: All services should show "Up" status
# Alert if any service shows "Exit" or "Restarting"
```

#### 2. HAProxy Health Dashboard

- Access: http://localhost:8404/stats
- **Green indicators**: All backends healthy
- **Yellow indicators**: Investigate immediately
- **Red indicators**: Critical - escalate immediately

#### 3. SLA Compliance Check

- Access Grafana SLA Dashboard: http://localhost:3000
- Verify current availability percentage
- Check for any SLA breaches in last 24 hours
- Document any incidents affecting SLA

#### 4. Alert Queue Review

- Access Alertmanager: http://localhost:9093
- Review active alerts
- Verify alert routing is working correctly
- Clear resolved alerts if needed

### Continuous Monitoring

#### Key Metrics to Monitor

**System Health:**

- Container restart count (should be 0)
- Memory usage per service (<80%)
- CPU usage per service (<70%)
- Disk space usage (<85%)

**SLA Metrics:**

- Endpoint availability (target: >99.99%)
- Response time (target: <1s)
- Alert response time (target: <30s)

**Application Metrics:**

- Active user sessions
- API response times
- Database connection status
- Cache hit rates

---

## Monitoring & Alerting

### Alert Severity Levels

#### SLA Breach (Severity: sla-breach)

- **Response Time**: Immediate (0 seconds)
- **Escalation**: PagerDuty + Slack
- **Action**: Drop everything, investigate immediately
- **Example**: Main application down for >30 seconds

#### Critical (Severity: critical)

- **Response Time**: Immediate (0 seconds)
- **Escalation**: PagerDuty + Slack
- **Action**: Immediate investigation required
- **Example**: Prometheus cluster down, database outage

#### High (Severity: high)

- **Response Time**: 5 seconds
- **Escalation**: Slack notification
- **Action**: Investigate within 15 minutes
- **Example**: High memory usage, elevated error rates

#### Warning (Severity: warning)

- **Response Time**: 30 seconds
- **Escalation**: Slack notification
- **Action**: Investigate within 30 minutes
- **Example**: Disk space reaching threshold

#### Info (Severity: info)

- **Response Time**: 1 minute
- **Escalation**: Slack notification
- **Action**: Review within 2 hours
- **Example**: Configuration updates, maintenance notices

### Alert Channels

#### Slack Channels

- `#sla-alerts`: SLA breach notifications
- `#critical-alerts`: Critical system alerts
- `#infrastructure-alerts`: Infrastructure issues
- `#prometheus-alerts`: Prometheus-specific alerts
- `#grafana-alerts`: Grafana-specific alerts

#### PagerDuty Services

- **SLA Critical**: 24/7 escalation for SLA breaches
- **Monitoring Critical**: Infrastructure monitoring issues
- **Application Critical**: Application-level critical issues

### Custom Alert Rules

#### SLA Monitoring Rules

```yaml
# Response time SLA
- alert: ResponseTimeSLABreach
  expr: probe_duration_seconds > 1
  for: 30s
  labels:
    severity: sla-breach
  annotations:
    summary: "Response time SLA breach detected"
    description: "{{ $labels.instance }} response time {{ $value }}s exceeds 1s SLA"

# Availability SLA
- alert: AvailabilitySLABreach
  expr: probe_success == 0
  for: 30s
  labels:
    severity: sla-breach
  annotations:
    summary: "Availability SLA breach detected"
    description: "{{ $labels.instance }} is not responding"
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Prometheus Instance Down

**Symptoms:**

- HAProxy shows backend as red
- Metrics collection stops
- Dashboards show "No data"

**Investigation Steps:**

```bash
# Check container status
docker ps -a | grep prometheus

# Check logs
docker logs skc-prometheus-1
docker logs skc-prometheus-2

# Check configuration
docker exec skc-prometheus-1 promtool check config /etc/prometheus/prometheus.yml
```

**Resolution:**

```bash
# Restart failed instance
docker restart skc-prometheus-1

# Verify HAProxy picks up the instance
curl http://localhost:8404/stats

# Reload configuration if needed
docker exec skc-prometheus-1 curl -X POST http://localhost:9090/-/reload
```

#### 2. Alertmanager Cluster Split-Brain

**Symptoms:**

- Duplicate alerts received
- Inconsistent alert states
- Cluster status shows fewer peers

**Investigation Steps:**

```bash
# Check cluster status
curl http://localhost:9094/api/v1/status | jq '.data.clusterStatus'
curl http://localhost:9096/api/v1/status | jq '.data.clusterStatus'

# Check network connectivity
docker exec skc-alertmanager-1 nc -zv alertmanager-2 9094
docker exec skc-alertmanager-2 nc -zv alertmanager-1 9094
```

**Resolution:**

```bash
# Restart both instances to reform cluster
docker restart skc-alertmanager-1 skc-alertmanager-2

# Wait 30 seconds and verify cluster formation
sleep 30
curl http://localhost:9094/api/v1/status | jq '.data.clusterStatus'
```

#### 3. SLA Monitoring False Positives

**Symptoms:**

- SLA alerts triggered but services appear healthy
- Intermittent connectivity issues
- Network timeouts

**Investigation Steps:**

```bash
# Test connectivity manually
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000

# Check SLA monitor logs
docker logs skc-sla-monitor

# Verify network connectivity
docker exec skc-sla-monitor ping -c 3 localhost
```

**Resolution:**

```bash
# Adjust timeout thresholds if needed
# Edit monitoring/sla/blackbox-sla.yml

# Restart SLA monitor
docker restart skc-sla-monitor

# Update alert thresholds if necessary
# Edit monitoring/prometheus/rules/sla-alerts.yml
```

#### 4. High Memory Usage

**Symptoms:**

- Containers being OOM killed
- Slow query responses
- System performance degradation

**Investigation Steps:**

```bash
# Check memory usage per container
docker stats --no-stream

# Check Prometheus memory usage
curl http://localhost:9090/api/v1/query?query=prometheus_tsdb_head_series

# Check Elasticsearch cluster health
curl http://localhost:9200/_cluster/health
```

**Resolution:**

```bash
# Increase memory limits in docker-compose
# Edit docker-compose.monitoring-ha.yml

# Reduce retention periods
# Prometheus: reduce --storage.tsdb.retention.time
# Elasticsearch: implement index lifecycle management

# Restart services with new limits
docker-compose -f docker-compose.monitoring-ha.yml up -d
```

### Emergency Contacts

#### Escalation Matrix

1. **Operations Team** (Primary): operations@skc-company.com
2. **DevOps Engineer** (Secondary): devops@skc-company.com
3. **Site Reliability Engineer** (Tertiary): sre@skc-company.com
4. **Engineering Manager** (Final): engineering-manager@skc-company.com

---

## Maintenance Procedures

### Weekly Maintenance (Sundays 2:00 AM - 4:00 AM)

#### 1. Configuration Updates

```bash
# Backup current configurations
cp monitoring/prometheus/prometheus-ha.yml monitoring/prometheus/prometheus-ha.yml.backup
cp monitoring/alertmanager/alertmanager-ha.yml monitoring/alertmanager/alertmanager-ha.yml.backup

# Update configurations
# Make changes to configuration files

# Validate configurations
docker exec skc-prometheus-1 promtool check config /etc/prometheus/prometheus.yml
docker exec skc-alertmanager-1 amtool check-config /etc/alertmanager/alertmanager.yml

# Apply rolling updates
docker exec skc-prometheus-1 curl -X POST http://localhost:9090/-/reload
docker exec skc-prometheus-2 curl -X POST http://localhost:9090/-/reload
docker exec skc-alertmanager-1 curl -X POST http://localhost:9093/-/reload
docker exec skc-alertmanager-2 curl -X POST http://localhost:9093/-/reload
```

#### 2. Data Cleanup

```bash
# Clean up old Prometheus data (if needed)
# This is handled automatically by retention policies

# Clean up old logs
docker system prune -f

# Vacuum Elasticsearch indices
curl -X POST "localhost:9200/_all/_forcemerge?max_num_segments=1"
```

#### 3. Performance Review

```bash
# Generate performance report
docker exec skc-prometheus-1 curl http://localhost:9090/api/v1/query?query=rate(prometheus_tsdb_head_samples_appended_total[1h])

# Check resource utilization
docker stats --no-stream > /tmp/weekly-stats-$(date +%Y%m%d).txt

# Review SLA compliance
# Access Grafana SLA dashboard and export weekly report
```

### Monthly Maintenance (First Sunday of Month)

#### 1. Security Updates

```bash
# Update Docker images
docker-compose -f docker-compose.monitoring-ha.yml pull

# Restart services with updated images
docker-compose -f docker-compose.monitoring-ha.yml up -d

# Verify all services are healthy
docker-compose -f docker-compose.monitoring-ha.yml ps
```

#### 2. Backup Verification

```bash
# Test backup restoration process
# See Backup & Recovery section

# Verify backup integrity
# Test restore on staging environment
```

#### 3. Disaster Recovery Testing

```bash
# Simulate node failure
docker stop skc-prometheus-1

# Verify failover works correctly
curl http://localhost:9090/-/healthy

# Simulate complete failure
docker-compose -f docker-compose.monitoring-ha.yml down

# Verify backup restoration works
# Follow disaster recovery procedures
```

---

## Incident Response

### Incident Classification

#### Severity 1 (Critical)

- **Definition**: Complete service outage or SLA breach
- **Response Time**: Immediate (within 5 minutes)
- **Escalation**: Automatic PagerDuty escalation
- **Communication**: Status page updates every 15 minutes

#### Severity 2 (High)

- **Definition**: Partial service degradation
- **Response Time**: Within 15 minutes
- **Escalation**: Team lead notification
- **Communication**: Internal Slack updates

#### Severity 3 (Medium)

- **Definition**: Minor issues or warnings
- **Response Time**: Within 1 hour
- **Escalation**: Standard team notification
- **Communication**: Daily standup discussion

### Incident Response Playbook

#### 1. Initial Response (0-5 minutes)

1. **Acknowledge the alert** in PagerDuty/Slack
2. **Assess the impact** - check SLA dashboard
3. **Create incident ticket** in issue tracking system
4. **Notify stakeholders** if Severity 1 or 2

#### 2. Investigation (5-15 minutes)

1. **Check service status** across all components
2. **Review recent changes** in deployment logs
3. **Analyze metrics** in Grafana dashboards
4. **Check error logs** in Elasticsearch/Kibana

#### 3. Mitigation (15-30 minutes)

1. **Apply immediate fixes** if known issue
2. **Implement workarounds** if available
3. **Scale resources** if capacity issue
4. **Rollback changes** if deployment related

#### 4. Resolution (30+ minutes)

1. **Implement permanent fix**
2. **Verify service restoration**
3. **Monitor for stability** (30 minutes)
4. **Update stakeholders** on resolution

#### 5. Post-Incident (24 hours)

1. **Document root cause**
2. **Create improvement action items**
3. **Update runbooks** if needed
4. **Schedule post-mortem** if Severity 1

### Communication Templates

#### Severity 1 Alert Template

```
🚨 INCIDENT: [SERVICE] - Complete Outage
Detected: [TIME]
Impact: [DESCRIPTION]
Status: Investigating
ETA: [ESTIMATE]
Updates: Every 15 minutes
Ticket: [LINK]
```

#### Resolution Template

```
✅ RESOLVED: [SERVICE] - Issue Fixed
Duration: [TIME]
Root Cause: [SUMMARY]
Next Steps: [ACTIONS]
Post-Mortem: [DATE/LINK]
```

---

## Performance Tuning

### Prometheus Optimization

#### Query Performance

```bash
# Monitor slow queries
curl http://localhost:9090/api/v1/query?query=prometheus_engine_query_duration_seconds

# Optimize recording rules
# Create pre-computed metrics for expensive queries

# Example recording rule:
# - record: job:prometheus_tsdb_head_samples_appended_total:rate5m
#   expr: rate(prometheus_tsdb_head_samples_appended_total[5m])
```

#### Storage Optimization

```bash
# Monitor storage usage
curl http://localhost:9090/api/v1/query?query=prometheus_tsdb_symbol_table_size_bytes

# Adjust retention policies
# Edit retention time in docker-compose file

# Implement remote storage for long-term retention
# Configure remote_write in prometheus.yml
```

### Alertmanager Optimization

#### Alert Processing

```bash
# Monitor alert processing latency
curl http://localhost:9093/api/v1/query?query=alertmanager_notifications_latency_seconds

# Optimize grouping and routing
# Review alert routing rules in alertmanager.yml

# Reduce notification noise
# Implement proper inhibition rules
```

### Grafana Optimization

#### Dashboard Performance

```bash
# Monitor dashboard load times
# Use Grafana's built-in performance monitoring

# Optimize queries
# Use recording rules for complex calculations
# Implement proper time range limits
# Use template variables effectively
```

#### Session Management

```bash
# Monitor Redis session store
docker exec skc-redis-grafana redis-cli info memory

# Optimize session configuration
# Adjust session timeout and cleanup intervals
```

---

## Security Operations

### Access Control

#### Role-Based Access

- **Admin**: Full access to all monitoring components
- **Operator**: Read/write access to dashboards and alerts
- **Viewer**: Read-only access to dashboards
- **Guest**: Limited access to public dashboards

#### Network Security

```bash
# Monitor network access
# Review firewall rules and access logs

# Implement TLS encryption
# Configure SSL certificates for external access

# Secure internal communications
# Use internal Docker networks for component communication
```

### Credential Management

#### API Key Rotation (Monthly)

```bash
# Rotate PagerDuty integration keys
# Update PAGERDUTY_*_KEY values in environment

# Rotate Slack webhook URLs
# Update SLACK_*_WEBHOOK values in environment

# Restart services with new credentials
docker-compose -f docker-compose.monitoring-ha.yml up -d
```

#### Certificate Management

```bash
# Monitor certificate expiration
# Set up alerts for certificates expiring in 30 days

# Renew certificates
# Follow internal certificate renewal procedures

# Update service configurations
# Deploy updated certificates to services
```

---

## Backup & Recovery

### Backup Procedures

#### Daily Automated Backups (3:00 AM)

```bash
#!/bin/bash
# Daily backup script

BACKUP_DIR="/backup/monitoring/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup Prometheus data
docker run --rm -v prometheus_data_1:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/prometheus-1.tar.gz -C /data .
docker run --rm -v prometheus_data_2:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/prometheus-2.tar.gz -C /data .

# Backup Grafana data
docker run --rm -v grafana_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/grafana.tar.gz -C /data .

# Backup configurations
cp -r monitoring/ $BACKUP_DIR/configs/

# Backup Elasticsearch data
docker run --rm -v elasticsearch_data_1:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/elasticsearch.tar.gz -C /data .

# Clean up backups older than 30 days
find /backup/monitoring -type d -mtime +30 -exec rm -rf {} \;
```

#### Weekly Configuration Backup

```bash
# Export Grafana dashboards
curl -H "Authorization: Bearer $GRAFANA_API_KEY" http://localhost:3000/api/search | jq -r '.[].uid' | while read uid; do
  curl -H "Authorization: Bearer $GRAFANA_API_KEY" http://localhost:3000/api/dashboards/uid/$uid | jq '.dashboard' > "/backup/grafana-dashboards/$uid.json"
done

# Backup Prometheus rules
cp -r monitoring/prometheus/rules/ /backup/prometheus-rules/

# Backup Alertmanager configuration
cp monitoring/alertmanager/alertmanager-ha.yml /backup/alertmanager/
```

### Recovery Procedures

#### Disaster Recovery (Complete Stack Loss)

```bash
# 1. Restore infrastructure
# Deploy fresh monitoring stack
docker-compose -f docker-compose.monitoring-ha.yml up -d

# 2. Stop services for data restoration
docker-compose -f docker-compose.monitoring-ha.yml down

# 3. Restore data volumes
RESTORE_DATE="20231219"  # Use appropriate backup date
docker run --rm -v prometheus_data_1:/data -v /backup/monitoring/$RESTORE_DATE:/backup alpine tar xzf /backup/prometheus-1.tar.gz -C /data
docker run --rm -v prometheus_data_2:/data -v /backup/monitoring/$RESTORE_DATE:/backup alpine tar xzf /backup/prometheus-2.tar.gz -C /data
docker run --rm -v grafana_data:/data -v /backup/monitoring/$RESTORE_DATE:/backup alpine tar xzf /backup/grafana.tar.gz -C /data

# 4. Restore configurations
cp -r /backup/monitoring/$RESTORE_DATE/configs/monitoring/* monitoring/

# 5. Start services
docker-compose -f docker-compose.monitoring-ha.yml up -d

# 6. Verify recovery
curl http://localhost:9090/-/healthy
curl http://localhost:9093/-/healthy
curl http://localhost:3000/api/health
```

#### Point-in-Time Recovery

```bash
# For Prometheus data corruption
# Stop affected instance
docker stop skc-prometheus-1

# Restore from backup
RESTORE_DATE="20231219"
docker run --rm -v prometheus_data_1:/data -v /backup/monitoring/$RESTORE_DATE:/backup alpine tar xzf /backup/prometheus-1.tar.gz -C /data

# Restart instance
docker start skc-prometheus-1

# Verify data integrity
curl http://localhost:9091/api/v1/query?query=up
```

### Recovery Testing

#### Monthly DR Test

```bash
# 1. Create test environment
# Deploy monitoring stack in staging

# 2. Test backup restoration
# Follow disaster recovery procedures in staging

# 3. Verify functionality
# Test all monitoring and alerting functions

# 4. Document results
# Record RTO (Recovery Time Objective) and RPO (Recovery Point Objective)

# 5. Update procedures
# Improve recovery procedures based on test results
```

---

## Appendix

### Quick Reference Commands

#### Health Check Commands

```

```

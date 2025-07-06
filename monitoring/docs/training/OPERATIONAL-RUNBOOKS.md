# SKC BI Dashboard - Operational Runbooks

## Purpose

This document provides step-by-step procedures for common operational tasks. Each runbook is designed to be followed by operations team members to ensure consistent and reliable execution of routine and emergency procedures.

---

## Table of Contents

1. [Daily Health Check Runbook](#daily-health-check-runbook)
2. [Weekly Maintenance Runbook](#weekly-maintenance-runbook)
3. [Alert Response Runbooks](#alert-response-runbooks)
4. [Incident Response Runbooks](#incident-response-runbooks)
5. [Emergency Procedures](#emergency-procedures)
6. [Backup and Recovery Runbooks](#backup-and-recovery-runbooks)

---

## Daily Health Check Runbook

### Execution Time: 15-20 minutes

### Frequency: Every weekday at 9:00 AM

### Owner: Operations Team Member on Duty

### Prerequisites

- [ ] Access to monitoring systems
- [ ] Operations log spreadsheet open
- [ ] Emergency contact list available

### Procedure

#### Step 1: Container Health Check (5 minutes)

```bash
# Navigate to monitoring directory
cd /path/to/skc-bi-dashboard

# Check all container status
docker-compose -f docker-compose.monitoring-ha.yml ps

# Expected output: All services should show "Up" status
# ✅ If all services are "Up" → Continue to Step 2
# ❌ If any service is not "Up" → Follow Container Recovery Procedure
```

**Action Required if Failed:**

- Note down which containers are failing
- Check container logs: `docker logs [container-name]`
- Follow the Container Recovery Procedure (see Emergency Procedures)

#### Step 2: HAProxy Load Balancer Check (3 minutes)

```bash
# Access HAProxy stats page
curl -s http://localhost:8404/stats | grep -E "(prometheus|alertmanager)" | grep -v "UP"

# Or open in browser: http://localhost:8404/stats
```

**What to Look For:**

- ✅ All backends should be GREEN (UP)
- ❌ Any RED (DOWN) or YELLOW (DRAIN) backends require immediate attention

#### Step 3: SLA Compliance Check (4 minutes)

```bash
# Check current availability percentage
curl -s 'http://localhost:9090/api/v1/query?query=avg_over_time(probe_success[24h])*100'

# Target: >99.99% (should be >99.99)
```

**Grafana Dashboard Check:**

- Open: http://localhost:3000/d/sla-dashboard
- Verify current 24-hour availability
- Check for any active SLA breach alerts

#### Step 4: Active Alerts Review (3 minutes)

```bash
# Check for active alerts
curl -s http://localhost:9093/api/v1/alerts | jq '.data[] | select(.status.state=="active") | {alertname: .labels.alertname, severity: .labels.severity}'
```

**Alertmanager Interface Check:**

- Open: http://localhost:9093
- Review all active alerts
- Verify proper alert routing to Slack/PagerDuty

#### Step 5: System Resource Check (3 minutes)

```bash
# Check container resource usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Thresholds:
# CPU: <70% (normal), 70-85% (warning), >85% (critical)
# Memory: <80% (normal), 80-90% (warning), >90% (critical)
```

#### Step 6: Documentation (2 minutes)

```bash
# Create daily health check entry
echo "$(date): Daily health check completed - [STATUS]" >> /var/log/operations/daily-health-checks.log
```

### Escalation Criteria

- Any container down for >5 minutes
- SLA below 99.99% for current day
- Critical alerts active for >15 minutes
- Resource usage >90% on any component

---

## Weekly Maintenance Runbook

### Execution Time: 2-3 hours

### Frequency: Every Sunday 2:00 AM - 4:00 AM

### Owner: Senior Operations Engineer

### Prerequisites

- [ ] Maintenance window approved and communicated
- [ ] Backup completion verified
- [ ] Change management ticket created
- [ ] Rollback procedures reviewed

### Procedure

#### Step 1: Pre-Maintenance Verification (15 minutes)

```bash
# Verify system is healthy before maintenance
docker-compose -f docker-compose.monitoring-ha.yml ps
curl http://localhost:8404/stats
curl http://localhost:9090/-/healthy
curl http://localhost:9093/-/healthy
```

#### Step 2: Configuration Backup (10 minutes)

```bash
# Create timestamped backup
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /backup/maintenance/$BACKUP_DATE

# Backup all configurations
cp -r monitoring/ /backup/maintenance/$BACKUP_DATE/
cp docker-compose.monitoring-ha.yml /backup/maintenance/$BACKUP_DATE/
```

#### Step 3: Rolling Configuration Reload (20 minutes)

```bash
# Reload Prometheus instances
docker exec skc-prometheus-1 curl -X POST http://localhost:9090/-/reload
sleep 30
docker exec skc-prometheus-2 curl -X POST http://localhost:9090/-/reload
sleep 30

# Reload Alertmanager instances
docker exec skc-alertmanager-1 curl -X POST http://localhost:9093/-/reload
sleep 30
docker exec skc-alertmanager-2 curl -X POST http://localhost:9093/-/reload
sleep 30
```

#### Step 4: Data Cleanup (20 minutes)

```bash
# Clean up old Docker images and containers
docker system prune -f

# Clean up old backup files (older than 30 days)
find /backup/monitoring -type d -mtime +30 -exec rm -rf {} \;

# Optimize Elasticsearch indices
curl -X POST "localhost:9200/_all/_forcemerge?max_num_segments=1"
```

---

## Alert Response Runbooks

### SLA Breach Alert Response

#### Execution Time: 0-10 minutes (immediate response required)

#### Trigger: SLA breach alert fired

#### Owner: Operations Team Member on Duty

#### Immediate Response (0-2 minutes)

```bash
# Step 1: Acknowledge alert in PagerDuty/Slack
# Step 2: Check current system status
curl http://localhost:9090/-/healthy
curl http://localhost:3000/api/health

# Step 3: Identify affected service
curl -s 'http://localhost:9090/api/v1/query?query=probe_success==0'
```

#### Investigation (2-5 minutes)

```bash
# Check specific endpoint that's failing
FAILING_ENDPOINT="[from Step 3]"
curl -v $FAILING_ENDPOINT

# Check recent deployment logs
docker-compose -f docker-compose.monitoring-ha.yml logs --tail=50

# Check system resources
docker stats --no-stream
```

---

## Emergency Procedures

### Container Recovery Procedure

#### When to Use: Container shows as "Exited" or "Restarting"

```bash
# Step 1: Identify the failing container
docker ps -a | grep -v "Up"

# Step 2: Check container logs
CONTAINER_NAME="[failing container]"
docker logs $CONTAINER_NAME --tail=50

# Step 3: Attempt restart
docker restart $CONTAINER_NAME

# Step 4: If restart fails, recreate container
docker-compose -f docker-compose.monitoring-ha.yml up -d $CONTAINER_NAME

# Step 5: Verify recovery
docker ps | grep $CONTAINER_NAME
```

### HAProxy Backend Recovery Procedure

#### When to Use: HAProxy shows backend as DOWN or DRAIN

```bash
# Step 1: Identify failing backend
curl -s http://localhost:8404/stats | grep -E "(prometheus|alertmanager)" | grep -v "UP"

# Step 2: Check backend service directly
BACKEND_URL="[failing backend URL]"
curl -v $BACKEND_URL

# Step 3: Restart backend service
docker restart [backend-container-name]

# Step 4: Wait for health check and verify recovery
sleep 30
curl -s http://localhost:8404/stats | grep $BACKEND_URL
```

---

## Backup and Recovery Runbooks

### Manual Backup Procedure

#### Execution Time: 15-20 minutes

#### When to Use: Before major changes or weekly scheduled backup

```bash
#!/bin/bash
# Manual backup script

# Step 1: Create backup directory
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/manual/$BACKUP_DATE"
mkdir -p $BACKUP_DIR

# Step 2: Backup Prometheus data
echo "Backing up Prometheus data..."
docker run --rm -v prometheus_data_1:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/prometheus-1-$BACKUP_DATE.tar.gz -C /data .
docker run --rm -v prometheus_data_2:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/prometheus-2-$BACKUP_DATE.tar.gz -C /data .

# Step 3: Backup Grafana data
echo "Backing up Grafana data..."
docker run --rm -v grafana_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/grafana-$BACKUP_DATE.tar.gz -C /data .

# Step 4: Backup configurations
echo "Backing up configurations..."
cp -r monitoring/ $BACKUP_DIR/configs/
cp docker-compose.monitoring-ha.yml $BACKUP_DIR/

# Step 5: Verify backup integrity
echo "Verifying backup integrity..."
ls -la $BACKUP_DIR/
tar -tzf $BACKUP_DIR/prometheus-1-$BACKUP_DATE.tar.gz | head -5

echo "✅ Backup completed successfully: $BACKUP_DIR"
```

### Disaster Recovery Procedure

#### Execution Time: 30-60 minutes

#### When to Use: Complete data loss or corruption

```bash
#!/bin/bash
# Disaster recovery script

# Step 1: Stop all services
echo "Stopping all monitoring services..."
docker-compose -f docker-compose.monitoring-ha.yml down

# Step 2: Identify backup to restore
echo "Available backups:"
ls -la /backup/monitoring/ | tail -10
read -p "Enter backup date (YYYYMMDD): " RESTORE_DATE

BACKUP_DIR="/backup/monitoring/$RESTORE_DATE"

# Step 3: Restore data
echo "Restoring Prometheus data..."
docker run --rm -v prometheus_data_1:/data -v $BACKUP_DIR:/backup alpine tar xzf /backup/prometheus-1.tar.gz -C /data
docker run --rm -v prometheus_data_2:/data -v $BACKUP_DIR:/backup alpine tar xzf /backup/prometheus-2.tar.gz -C /data

echo "Restoring Grafana data..."
docker run --rm -v grafana_data:/data -v $BACKUP_DIR:/backup alpine tar xzf /backup/grafana.tar.gz -C /data

# Step 4: Restore configurations
echo "Restoring configurations..."
cp -r $BACKUP_DIR/configs/monitoring/* monitoring/

# Step 5: Start services and verify
echo "Starting monitoring services..."
docker-compose -f docker-compose.monitoring-ha.yml up -d
sleep 60

echo "Verifying recovery..."
curl http://localhost:9090/-/healthy || echo "❌ Prometheus health check failed"
curl http://localhost:9093/-/healthy || echo "❌ Alertmanager health check failed"
curl http://localhost:3000/api/health || echo "❌ Grafana health check failed"

echo "✅ Disaster recovery completed"
```

---

## Quick Reference

### Emergency Contacts

- **Operations Team**: operations@skc-company.com
- **DevOps Engineer**: devops@skc-company.com
- **Engineering Manager**: engineering-manager@skc-company.com

### Key URLs

- **HAProxy Stats**: http://localhost:8404/stats
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Grafana**: http://localhost:3000

### Critical Commands

```bash
# Health check all services
docker-compose -f docker-compose.monitoring-ha.yml ps

# View all logs
docker-compose -f docker-compose.monitoring-ha.yml logs -f

# Restart all services
docker-compose -f docker-compose.monitoring-ha.yml restart

# Emergency stop
docker-compose -f docker-compose.monitoring-ha.yml down
```

---

_These runbooks should be printed and kept accessible during operations. Update after any significant infrastructure changes._

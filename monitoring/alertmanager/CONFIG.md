# Alertmanager Configuration Guide

This document provides setup instructions for configuring Alertmanager with PagerDuty and Slack integrations for the SKC BI Dashboard monitoring system.

## Overview

The Alertmanager configuration includes:

- **PagerDuty** integration for critical alerts
- **Slack** integration for team notifications
- **Email** notifications for comprehensive coverage
- **Smart routing** based on alert severity and service
- **Alert templates** for formatted notifications

## Required Integrations

### 1. PagerDuty Setup

#### Create PagerDuty Services:

1. Go to your PagerDuty account
2. Navigate to **Services** → **Service Directory**
3. Create these services:
   - **SKC BI Dashboard Critical** - for critical application alerts
   - **SKC BI Dashboard SLA** - for SLA breach alerts

#### Get Integration Keys:

1. For each service, go to **Integrations** tab
2. Add a new integration with type **"Events API v2"**
3. Copy the **Integration Key** for each service
4. Replace these values in `alertmanager.yml`:
   - `YOUR_PAGERDUTY_INTEGRATION_KEY` → Critical alerts key
   - `YOUR_PAGERDUTY_SLA_KEY` → SLA alerts key

### 2. Slack Setup

#### Create Slack App:

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. Name it **"SKC BI Dashboard Alerts"**

#### Enable Incoming Webhooks:

1. In your app settings, go to **"Incoming Webhooks"**
2. Turn on **"Activate Incoming Webhooks"**
3. Click **"Add New Webhook to Workspace"**

#### Create Webhooks for Each Channel:

Create webhooks for these channels (create channels if they don't exist):

- `#sla-alerts` - Critical SLA breach notifications
- `#monitoring-warnings` - Warning level alerts
- `#infrastructure-alerts` - System and infrastructure issues
- `#database-alerts` - Database performance issues
- `#application-alerts` - Application-specific alerts

#### Update Configuration:

Replace these webhook URLs in `alertmanager.yml`:

- `https://hooks.slack.com/services/YOUR/SLA/WEBHOOK`
- `https://hooks.slack.com/services/YOUR/WARNING/WEBHOOK`
- `https://hooks.slack.com/services/YOUR/INFRA/WEBHOOK`
- `https://hooks.slack.com/services/YOUR/DB/WEBHOOK`
- `https://hooks.slack.com/services/YOUR/APP/WEBHOOK`

### 3. Email Configuration

#### SMTP Setup:

Update these values in `alertmanager.yml` under the `global` section:

```yaml
global:
  smtp_smarthost: "your-smtp-server:587"
  smtp_from: "alerts@your-company.com"
  smtp_auth_username: "your-smtp-username"
  smtp_auth_password: "your-smtp-password"
```

#### For Gmail:

- Use `smtp.gmail.com:587`
- Enable 2FA and create an App Password
- Use the App Password instead of your regular password

#### For Outlook/Office 365:

- Use `smtp-mail.outlook.com:587`
- Use your email and password

## Environment Variables

Create a `.env` file in the `monitoring/alertmanager/` directory with these variables:

```bash
# PagerDuty
PAGERDUTY_INTEGRATION_KEY=your-actual-key-here
PAGERDUTY_SLA_KEY=your-sla-key-here

# Slack Webhooks
SLACK_SLA_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_WARNING_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/YYYYYYYYYYYYYYYYYYYYYYYY
SLACK_INFRA_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/ZZZZZZZZZZZZZZZZZZZZZZZZ
SLACK_DB_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/AAAAAAAAAAAAAAAAAAAAAAA
SLACK_APP_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/BBBBBBBBBBBBBBBBBBBBBBB

# Email
SMTP_PASSWORD=your-smtp-password
```

## Alert Routing Logic

The configuration includes intelligent routing:

### Critical Alerts → PagerDuty + Slack

- Application down
- SLA breaches
- Critical system failures
- **Response Time:** Immediate (0s wait)
- **Repeat:** Every 5 minutes until resolved

### Warning Alerts → Slack

- High resource usage
- Performance degradation
- Non-critical issues
- **Response Time:** 30s wait for grouping
- **Repeat:** Every 30 minutes

### Team-Specific Routing

- **Infrastructure Team:** System, CPU, memory, disk alerts
- **Database Team:** PostgreSQL performance, connection issues
- **Application Team:** SKC BI Dashboard specific alerts

## Testing the Configuration

### 1. Validate Configuration

```bash
# Check if alertmanager config is valid
docker exec skc-alertmanager amtool config show

# Test routing rules
docker exec skc-alertmanager amtool config routes test
```

### 2. Send Test Alerts

```bash
# Send a test critical alert
docker exec skc-alertmanager amtool alert add \
  alertname="TestCriticalAlert" \
  severity="critical" \
  service="skc-bi-dashboard" \
  summary="Test critical alert for validation"

# Send a test warning alert
docker exec skc-alertmanager amtool alert add \
  alertname="TestWarningAlert" \
  severity="warning" \
  service="system" \
  summary="Test warning alert for validation"
```

### 3. Verify Notifications

After sending test alerts, verify:

- ✅ PagerDuty receives critical alerts
- ✅ Slack channels receive appropriate alerts
- ✅ Email notifications are sent
- ✅ Alert formatting looks correct

## Deployment Steps

1. **Update Configuration:**

   ```bash
   # Replace placeholder values in alertmanager.yml
   vim monitoring/alertmanager/alertmanager.yml
   ```

2. **Create Environment File:**

   ```bash
   # Create .env with your actual keys
   cp monitoring/alertmanager/CONFIG.md monitoring/alertmanager/.env
   # Edit .env with your values
   ```

3. **Start Alertmanager:**

   ```bash
   docker-compose up -d alertmanager
   ```

4. **Verify Service:**

   ```bash
   # Check if alertmanager is running
   docker ps | grep alertmanager

   # Check logs
   docker logs skc-alertmanager
   ```

5. **Access Web UI:**
   - Open http://alertmanager.localhost:9093
   - Verify no configuration errors
   - Check silence and alert management features

## Monitoring and Maintenance

### Regular Checks:

- Monitor alert delivery success rates
- Review and update alert thresholds
- Test PagerDuty and Slack integrations monthly
- Update contact information as team changes

### Alert Tuning:

- Adjust thresholds based on false positive rates
- Add new alert rules for emerging issues
- Update routing rules as team structure changes
- Review and optimize notification timing

## Troubleshooting

### Common Issues:

1. **Alerts not reaching PagerDuty:**

   - Verify integration key is correct
   - Check PagerDuty service status
   - Review alertmanager logs

2. **Slack notifications failing:**

   - Verify webhook URLs are correct
   - Check if Slack app has proper permissions
   - Test webhook manually with curl

3. **Email delivery issues:**
   - Verify SMTP settings
   - Check firewall and network connectivity
   - Test SMTP credentials separately

### Debug Commands:

```bash
# View current configuration
docker exec skc-alertmanager amtool config show

# Check alert status
docker exec skc-alertmanager amtool alert query

# View silences
docker exec skc-alertmanager amtool silence query

# Test notification delivery
docker exec skc-alertmanager amtool alert add [test-alert-params]
```

## Security Considerations

- Store sensitive keys in environment variables, not configuration files
- Use app passwords for email authentication
- Regularly rotate API keys and webhooks
- Restrict access to alertmanager web interface
- Monitor for unauthorized alert modifications

## Support

For issues with this configuration:

- Check the alertmanager logs: `docker logs skc-alertmanager`
- Review Prometheus alert rules in `monitoring/prometheus/rules/`
- Verify metrics are being collected in Prometheus
- Contact: alerts@skc-company.com

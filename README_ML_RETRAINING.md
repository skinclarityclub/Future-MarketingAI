# 🤖 ML Auto-Retraining System - Quick Start

**Task 71.5 COMPLETED**: Automatiseer retraining en deployment van ML-modellen

## 🚀 Quick Start Guide

### 1. ✅ Components Installed

Het ML Auto-Retraining systeem bestaat uit de volgende geïmplementeerde componenten:

- ✅ **API Endpoint**: `/api/workflows/ml/auto-retraining`
- ✅ **n8n Workflow**: `workflows/ML_Auto_Retraining_Workflow.json`
- ✅ **Database Schema**: `migrations/050_ml_auto_retraining_system.sql`
- ✅ **Dashboard**: `src/components/analytics/ml-retraining-dashboard.tsx`
- ✅ **Page Route**: `/ml-training`
- ✅ **Documentation**: `docs/ML_AUTO_RETRAINING_SETUP.md`

### 2. 🗄️ Database Setup

```sql
-- Run this migration in your Supabase/PostgreSQL database
-- File: migrations/050_ml_auto_retraining_system.sql
```

### 3. 🔧 Environment Configuration

Add to your `.env.local`:

```env
# ML Auto-Retraining Configuration
ML_RETRAINING_THRESHOLD=0.03
ML_AUTO_DEPLOYMENT_THRESHOLD=0.02
ML_MIN_TRAINING_SAMPLES=100

# Notification URLs (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ml-retraining
```

### 4. 🔄 n8n Workflow Setup

1. Open n8n interface: `http://localhost:5678`
2. Import workflow: `workflows/ML_Auto_Retraining_Workflow.json`
3. Configure environment variables in workflow nodes
4. Activate the workflow (will run every 4 hours)

### 5. 📊 Access Dashboard

Navigate to: **http://localhost:3000/ml-training**

## 🎯 System Capabilities

### Automatic Features

- **Performance Monitoring**: Checks model accuracy every 4 hours
- **Smart Retraining**: Triggers when accuracy drops > 3%
- **Auto-Deployment**: Deploys models with > 2% improvement
- **Audit Logging**: Complete audit trail of all operations

### Manual Controls

- **Manual Retraining**: Trigger via dashboard button
- **Performance Check**: On-demand performance analysis
- **Model Validation**: Validate model versions before deployment
- **Status Monitoring**: Real-time system status

### Integrations

- **Slack Notifications**: Training completion/failure alerts
- **Email Alerts**: Critical system notifications
- **Webhook Support**: External system integration
- **API Access**: Full REST API for external tools

## 📈 Dashboard Features

### Key Metrics

- Total Models count
- Active Training Jobs
- Success Rate percentage
- Average Improvement metrics

### Visualizations

- Performance improvement trends
- Model status distribution
- Training job history
- Retraining schedules

### Management Tools

- Manual retraining trigger
- Real-time status refresh
- Model performance tracking
- Training job monitoring

## 🔧 API Endpoints

### Available Actions

```bash
# Get system status
GET /api/workflows/ml/auto-retraining?action=status

# Get model metrics
GET /api/workflows/ml/auto-retraining?action=metrics

# List all models
GET /api/workflows/ml/auto-retraining?action=models

# Get training history
GET /api/workflows/ml/auto-retraining?action=history

# Trigger manual retraining
POST /api/workflows/ml/auto-retraining?action=trigger_retraining

# Check performance
POST /api/workflows/ml/auto-retraining?action=check_performance

# Validate models
POST /api/workflows/ml/auto-retraining?action=validate_models

# Deploy model
POST /api/workflows/ml/auto-retraining?action=deploy_model
```

## 🧪 Testing the System

### 1. Test API Availability

```bash
curl http://localhost:3000/api/workflows/ml/auto-retraining?action=status
```

### 2. Test Manual Retraining

```bash
curl -X POST http://localhost:3000/api/workflows/ml/auto-retraining?action=trigger_retraining \
  -H "Content-Type: application/json" \
  -d '{"force": true, "model_types": ["content_performance"]}'
```

### 3. Check Dashboard

Visit: http://localhost:3000/ml-training

## 🔍 Monitoring & Troubleshooting

### System Health Checks

- API endpoints responding
- Database connectivity
- n8n workflow active
- Model training success rate

### Common Issues

1. **API Not Responding**: Check server status and database connection
2. **Workflow Not Triggering**: Verify n8n workflow activation and cron schedule
3. **Dashboard Not Loading**: Check API endpoints and browser console
4. **Training Failures**: Review error logs in ml_training_jobs table

### Debug Commands

```bash
# Check API health
curl http://localhost:3000/api/health

# Test database connection
npm run db:test

# View recent training jobs
curl http://localhost:3000/api/workflows/ml/auto-retraining?action=history
```

## 🚧 Architecture Overview

```
User Dashboard ←→ API Endpoint ←→ ML Engines
     ↓               ↓              ↓
Supabase DB ←→ n8n Workflow ←→ Notifications
```

### Data Flow

1. **n8n Workflow** runs every 4 hours (cron: `0 */4 * * *`)
2. **Performance Check** calls API to assess model accuracy
3. **Decision Logic** determines if retraining is needed
4. **Retraining Process** uses existing ML engines
5. **Validation** ensures new models meet quality standards
6. **Deployment** updates production models
7. **Notifications** alert team of results
8. **Dashboard** displays real-time status

## ✅ Task 71.5 Status: COMPLETED

The ML Auto-Retraining system is now fully operational with:

- ✅ Automated performance monitoring
- ✅ Smart retraining triggers
- ✅ Model validation and deployment
- ✅ Comprehensive monitoring dashboard
- ✅ Complete audit logging
- ✅ Notification system
- ✅ API endpoints for integration
- ✅ Full documentation

## 📚 Additional Resources

- **Full Documentation**: `docs/ML_AUTO_RETRAINING_SETUP.md`
- **Setup Script**: `scripts/setup-ml-retraining.sh` (Linux/Mac)
- **Database Schema**: `migrations/050_ml_auto_retraining_system.sql`
- **n8n Workflow**: `workflows/ML_Auto_Retraining_Workflow.json`

---

**🎉 The ML Auto-Retraining system is ready for production use!**

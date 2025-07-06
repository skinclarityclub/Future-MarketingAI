# ML Auto-Retraining System Setup & Documentation

**Task 71.5**: Automatiseer retraining en deployment van ML-modellen

## 🎯 Overview

Het ML Auto-Retraining systeem automatiseert het retrainen en deployen van machine learning modellen op basis van:

- **Performance degradatie**: Wanneer accuracy onder een drempel (3%) valt
- **Time-based scheduling**: Regelmatige retraining (elke 4 uur)
- **Manual triggers**: Handmatige retraining via dashboard of API

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   n8n Workflow  │───▶│   API Endpoint  │───▶│  ML Engines     │
│   (Scheduler)   │    │   (Orchestrator)│    │  (Processing)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   Supabase DB   │    │  Notifications  │
│   (Monitoring)  │    │   (Storage)     │    │  (Slack/Email)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Geïmplementeerde Componenten

### 1. API Endpoint (`/api/workflows/ml/auto-retraining`)

**File**: `src/app/api/workflows/ml/auto-retraining/route.ts`

**Endpoints**:

- `POST ?action=trigger_retraining` - Trigger handmatige retraining
- `POST ?action=check_performance` - Check model performance
- `POST ?action=validate_models` - Valideer model versies
- `POST ?action=deploy_model` - Deploy gevalideerde modellen
- `GET ?action=status` - Krijg huidige status
- `GET ?action=metrics` - Krijg performance metrics
- `GET ?action=models` - Lijst alle modellen
- `GET ?action=history` - Training geschiedenis

### 2. n8n Workflow

**File**: `workflows/ML_Auto_Retraining_Workflow.json`

**Features**:

- Cron trigger (elke 4 uur): `0 */4 * * *`
- Performance check → Retraining decision
- Model validation → Deployment
- Error handling met retry logic
- Slack/Email notificaties
- Comprehensive audit logging

**Nodes**:

1. **Cron Trigger** - Automatische scheduling
2. **Manual Webhook** - Handmatige triggers
3. **Performance Check** - API call naar check_performance
4. **Decision Node** - Retraining nodig?
5. **Trigger Retraining** - Start retraining proces
6. **Validation** - Valideer nieuwe modellen
7. **Deploy Models** - Deploy gevalideerde modellen
8. **Success Notification** - Slack/Email success
9. **Error Handler** - Error notifications
10. **Audit Logger** - Log alle acties

### 3. Database Schema

**File**: `migrations/050_ml_auto_retraining_system.sql`

**Tables**:

- `ml_training_jobs` - Training job historie
- `ml_models` - Model informatie
- `ml_model_deployments` - Deployment tracking
- `ml_retraining_schedules` - Schedule configuratie
- `ml_performance_metrics` - Performance tracking
- `ml_training_data_quality` - Data quality metrics
- `workflow_audit_logs` - Audit trail

**Helper Functions**:

- `get_model_performance_summary()` - Performance samenvatting
- `get_training_job_stats()` - Training statistieken

### 4. Dashboard Component

**File**: `src/components/analytics/ml-retraining-dashboard.tsx`
**Page**: `src/app/[locale]/ml-training/page.tsx`

**Features**:

- Real-time status monitoring (30s updates)
- Key metrics (Total models, Active jobs, Success rate)
- Performance trends charts
- Model status distribution
- Training jobs geschiedenis
- Manual retraining trigger
- Retraining schedules overview

## 🚀 Setup Instructions

### 1. Database Setup

```sql
-- Run the migration
psql -d your_database -f migrations/050_ml_auto_retraining_system.sql
```

### 2. Environment Variables

```env
# .env.local
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# n8n workflow
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ml-retraining
SLACK_WEBHOOK_URL=your_slack_webhook
EMAIL_SMTP_CONFIG=your_smtp_config
```

### 3. n8n Workflow Import

1. Open n8n interface
2. Import `workflows/ML_Auto_Retraining_Workflow.json`
3. Configure environment variables:
   - `DASHBOARD_URL` = http://localhost:3000
   - `API_BASE_URL` = http://localhost:3000/api
   - `SLACK_WEBHOOK` = your-slack-webhook-url
   - `EMAIL_SMTP_*` = your email configuration
4. Activate workflow

### 4. Dashboard Access

Navigate to: `http://localhost:3000/ml-training`

## ⚙️ Configuration

### Performance Thresholds

```typescript
const CONFIG = {
  retraining_threshold: 0.03, // 3% accuracy drop
  auto_deployment_threshold: 0.02, // 2% improvement for auto-deploy
  update_frequency: "daily",
  min_training_samples: 100,
};
```

### Schedule Configuration

- **Performance-based**: Check every 4 hours
- **Time-based**: Force retrain weekly
- **Manual**: Via dashboard or API

## 📊 Monitoring

### Key Metrics

- **Model Accuracy**: Huidige accuraatheid per model
- **Performance Drift**: Accuracy degradatie over tijd
- **Training Success Rate**: % successvolle retraining jobs
- **Average Improvement**: Gemiddelde accuracy verbetering
- **Data Quality**: Training data kwaliteit metrics

### Alerts

- **Performance Degradation**: Accuracy < threshold
- **Training Failures**: Failed retraining jobs
- **Deployment Issues**: Deployment failures
- **Data Quality Issues**: Insufficient/poor quality training data

## 🔧 API Usage Examples

### Trigger Manual Retraining

```bash
curl -X POST http://localhost:3000/api/workflows/ml/auto-retraining?action=trigger_retraining \
  -H "Content-Type: application/json" \
  -d '{
    "force": true,
    "model_types": ["content_performance", "engagement_prediction"],
    "webhook_url": "http://localhost:5678/webhook/training-complete"
  }'
```

### Check Model Performance

```bash
curl -X POST http://localhost:3000/api/workflows/ml/auto-retraining?action=check_performance \
  -H "Content-Type: application/json" \
  -d '{
    "model_types": ["content_performance"],
    "threshold": 0.03,
    "time_window": 7
  }'
```

### Get Training Status

```bash
curl http://localhost:3000/api/workflows/ml/auto-retraining?action=status
```

## 🛠️ Integration Points

### ML Engines Integration

```typescript
// Integrates with existing ML infrastructure
-ContinuousLearningEngine -
  ModelValidationFramework -
  ContentPerformanceMLEngine -
  ConfidenceBasedMLEngine;
```

### Notification Channels

- **Slack**: Training completion/failures
- **Email**: Critical alerts
- **Dashboard**: Real-time status updates
- **Webhooks**: External system integration

## 🔍 Troubleshooting

### Common Issues

1. **API Calls Failing**

   - Check Supabase connection
   - Verify API endpoint URLs
   - Check authentication

2. **n8n Workflow Not Triggering**

   - Verify cron expression
   - Check workflow activation status
   - Review environment variables

3. **Dashboard Not Loading Data**

   - Check API endpoints
   - Verify database connection
   - Check browser console for errors

4. **Training Jobs Failing**
   - Check training data availability
   - Verify ML engine configuration
   - Review error logs in database

### Debug Commands

```bash
# Check API health
curl http://localhost:3000/api/workflows/ml/auto-retraining?action=status

# Verify database connection
psql -d your_database -c "SELECT COUNT(*) FROM ml_training_jobs;"

# Check n8n workflow logs
# View in n8n interface under executions
```

## 📈 Performance Optimization

### Database Optimization

- Proper indexing on timestamp columns
- Regular cleanup of old training jobs
- Partitioning for large datasets

### API Optimization

- Response caching for metrics
- Async processing for long-running tasks
- Rate limiting for API calls

### Dashboard Optimization

- Pagination for large datasets
- Lazy loading for charts
- WebSocket for real-time updates

## 🔐 Security Considerations

- API endpoints require authentication
- Row Level Security on database tables
- Secure webhook endpoints
- Environment variable protection
- Audit logging for all operations

## 🚧 Future Enhancements

- **A/B Testing Integration**: Test model performance
- **Advanced Drift Detection**: Statistical drift detection
- **Multi-Environment Support**: Dev/staging/prod workflows
- **Model Rollback**: Automatic rollback on performance degradation
- **Custom Metrics**: User-defined performance metrics
- **Distributed Training**: Support for large-scale training

---

**Task 71.5 Status**: ✅ **COMPLETED**

This comprehensive ML Auto-Retraining system provides automated, intelligent model maintenance with full monitoring and alerting capabilities.

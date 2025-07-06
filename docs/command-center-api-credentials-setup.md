# Command Center API Credentials Setup Guide

**Task 102.2: Register Applications and Secure API Credentials**  
**Status**: Implemented  
**Last Updated**: 2025-01-24

## 🎯 Overview

This guide provides step-by-step instructions for registering applications and securing API credentials for all Command Center live data integrations. The Command Center requires these credentials to provide real-time analytics, social media monitoring, and workflow automation.

## 📋 Prerequisites

- Access to the SKC BI Dashboard admin panel
- Account credentials for each social media and service platform
- Basic understanding of OAuth2 and API key management
- Environment variable configuration access

## 🔧 Quick Setup Checklist

### Required Environment Variables

Copy the following template to your `.env.local` file and replace the placeholder values:

```env
# =================================================================
# COMMAND CENTER LIVE API INTEGRATIONS
# =================================================================

# N8N Workflow Integration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# =================================================================
# SOCIAL MEDIA APIS
# =================================================================

# Instagram Business API
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id

# Facebook Graph API
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PAGE_ID=your_facebook_page_id

# LinkedIn Marketing API
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_COMPANY_ID=your_linkedin_company_id

# Twitter/X API v2
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# TikTok Business API
TIKTOK_APP_ID=your_tiktok_app_id
TIKTOK_APP_SECRET=your_tiktok_app_secret
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
TIKTOK_BUSINESS_ACCOUNT_ID=your_tiktok_business_account_id

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_CHANNEL_ID=your_youtube_channel_id

# ClickUp API
CLICKUP_API_TOKEN=your_clickup_api_token
CLICKUP_TEAM_ID=your_clickup_team_id
CLICKUP_SPACE_ID=your_clickup_space_id

# Google Analytics 4
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GA4_CLIENT_ID=your_client_id
```

## 🌐 Platform-Specific Setup Instructions

### 1. Instagram Business API

**Purpose**: Real-time Instagram analytics and content performance monitoring

**Requirements**:

- Facebook Developer Account
- Instagram Business Account
- Facebook Page connected to Instagram Business Account

**Setup Steps**:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add Instagram Basic Display product
4. Configure Instagram Basic Display settings:
   - Valid OAuth Redirect URIs: `https://your-domain.com/api/auth/callback/instagram`
   - Deauthorize Callback URL: `https://your-domain.com/api/auth/deauthorize/instagram`
   - Data Deletion Request URL: `https://your-domain.com/api/auth/deletion/instagram`
5. Get App ID and App Secret from App Settings > Basic
6. Generate access token through Instagram's authorization flow
7. Add credentials to environment variables

**Required Scopes**:

- `instagram_basic`
- `instagram_manage_insights`
- `pages_read_engagement`

**Rate Limits**: 200 calls per hour per user

---

### 2. Facebook Graph API

**Purpose**: Facebook page analytics and advertising insights

**Requirements**:

- Facebook Developer Account
- Facebook Page with admin access
- Business Manager account (recommended)

**Setup Steps**:

1. Visit [Facebook Developers](https://developers.facebook.com/)
2. Create new app (Business type)
3. Add Facebook Login and Marketing API products
4. Configure Facebook Login settings:
   - Valid OAuth Redirect URIs: `https://your-domain.com/api/auth/callback/facebook`
5. Get App ID and App Secret
6. Generate Page Access Token through Graph API Explorer
7. Add credentials to environment variables

**Required Scopes**:

- `pages_manage_posts`
- `pages_read_engagement`
- `pages_show_list`
- `ads_read` (for advertising insights)

**Rate Limits**: 200 calls per hour per user

---

### 3. LinkedIn Marketing API

**Purpose**: LinkedIn company page analytics and marketing insights

**Requirements**:

- LinkedIn Developer Account
- LinkedIn Company Page admin access
- LinkedIn Marketing Developer Platform access

**Setup Steps**:

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create new app
3. Select LinkedIn Page for your company
4. Request access to Marketing Developer Platform
5. Configure OAuth 2.0 settings:
   - Redirect URLs: `https://your-domain.com/api/auth/callback/linkedin`
6. Get Client ID and Client Secret
7. Complete OAuth flow to get access token
8. Add credentials to environment variables

**Required Scopes**:

- `r_organization_social`
- `rw_organization_admin`
- `r_ads_reporting`

**Rate Limits**: 100 calls per hour

---

### 4. Twitter/X API v2

**Purpose**: Twitter analytics, engagement tracking, and trend monitoring

**Requirements**:

- Twitter Developer Account
- Twitter/X Business Account (recommended for higher limits)

**Setup Steps**:

1. Apply for [Twitter Developer Account](https://developer.twitter.com/)
2. Create new app in Developer Portal
3. Configure app settings:
   - App permissions: Read and Write
   - Type of app: Web App
   - Callback URIs: `https://your-domain.com/api/auth/callback/twitter`
4. Generate API Keys and Access Tokens
5. Get Bearer Token for app-only authentication
6. Add credentials to environment variables

**Required Scopes**:

- `tweet.read`
- `users.read`
- `follows.read`
- `offline.access`

**Rate Limits**: 300 calls per 15-minute window

---

### 5. TikTok Business API

**Purpose**: TikTok video analytics and creator insights

**Requirements**:

- TikTok Business Account
- TikTok Developer Account

**Setup Steps**:

1. Register at [TikTok for Business](https://business-api.tiktok.com/)
2. Create new app in Developer Portal
3. Configure app settings and permissions
4. Set redirect URI: `https://your-domain.com/api/auth/callback/tiktok`
5. Get App ID and App Secret
6. Complete OAuth flow for access tokens
7. Add credentials to environment variables

**Required Scopes**:

- `user.info.basic`
- `video.list`
- `video.insights`

**Rate Limits**: 100 calls per hour

---

### 6. YouTube Data API v3

**Purpose**: YouTube channel analytics and video performance

**Requirements**:

- Google Cloud Console account
- YouTube channel

**Setup Steps**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key for public data, OAuth 2.0 for private data)
5. Configure OAuth consent screen
6. Set authorized redirect URIs: `https://your-domain.com/api/auth/callback/youtube`
7. Add credentials to environment variables

**Required Scopes**:

- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/youtube.analytics.readonly`

**Rate Limits**: 10,000 quota units per day

---

### 7. ClickUp API

**Purpose**: Project management and task automation integration

**Requirements**:

- ClickUp account with admin access
- ClickUp workspace

**Setup Steps**:

1. Log in to [ClickUp](https://clickup.com/)
2. Go to Settings > Apps
3. Generate Personal API Token
4. Note your Team ID and Space ID from URL or API
5. Add credentials to environment variables

**Rate Limits**: 100 calls per minute

---

### 8. Google Analytics 4

**Purpose**: Website analytics and user behavior tracking

**Requirements**:

- Google Analytics 4 property
- Google Cloud Console access

**Setup Steps**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Analytics Reporting API
3. Create Service Account
4. Download Service Account JSON key
5. Add Service Account email to Google Analytics with Viewer permissions
6. Extract credentials and add to environment variables

**Required Permissions**:

- Viewer access to Google Analytics property

**Rate Limits**: 50,000 requests per day

---

## 🔐 Security Best Practices

### Environment Variable Security

1. **Never commit credentials to version control**

   ```bash
   # Add to .gitignore
   .env.local
   .env.*.local
   ```

2. **Use different credentials for different environments**

   - Development: Limited scope, test accounts
   - Staging: Separate credentials with staging data
   - Production: Full production credentials with monitoring

3. **Rotate credentials regularly**
   - Set up automated credential rotation where possible
   - Monitor credential expiry dates
   - Implement credential refresh mechanisms

### Access Control

1. **Principle of least privilege**

   - Only request necessary scopes/permissions
   - Use read-only access where possible
   - Separate credentials for different functions

2. **Monitor credential usage**
   - Track API call patterns
   - Set up alerts for unusual activity
   - Monitor rate limit usage

## 📊 Command Center Integration

### Accessing the Credentials Interface

1. Navigate to **Command Center** → **API Integrations**
2. Review the **Health Overview** dashboard
3. Configure missing credentials using the setup instructions
4. Validate credentials using the built-in testing tools

### API Endpoints

The Command Center provides REST API endpoints for credential management:

```bash
# Get overall health status
GET /api/command-center/credentials?action=health

# Get all providers
GET /api/command-center/credentials?action=providers

# Get providers by category
GET /api/command-center/credentials?action=providers&category=social_media

# Get missing credentials
GET /api/command-center/credentials?action=missing

# Validate specific credential
POST /api/command-center/credentials
{
  "action": "validate",
  "providerId": "instagram",
  "credentialId": "instagram_access_token"
}

# Refresh all credentials
POST /api/command-center/credentials
{
  "action": "refresh"
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Credential not configured" error**

   - Check environment variable spelling
   - Ensure `.env.local` file is in project root
   - Restart development server after changes

2. **"Token has expired" error**

   - Refresh OAuth tokens
   - Check token expiry settings
   - Implement automatic token refresh

3. **"Rate limit exceeded" error**

   - Review API call frequency
   - Implement request throttling
   - Consider upgrading API plan

4. **"Invalid scope" error**
   - Review required permissions
   - Re-authorize with correct scopes
   - Check app configuration

### Testing Credentials

Use the Command Center's built-in validation tools:

1. Go to **API Integrations** page
2. Select provider to test
3. Click **Validate** for individual credentials
4. Review validation results and errors
5. Follow setup instructions for missing credentials

## 📈 Monitoring and Maintenance

### Health Monitoring

- Monitor credential health score in Command Center
- Set up alerts for credential expiry
- Track API usage and rate limits
- Review failed validation reports

### Regular Maintenance

- **Weekly**: Review credential health dashboard
- **Monthly**: Check for API changes and updates
- **Quarterly**: Rotate credentials and review permissions
- **Annually**: Audit all integrations and remove unused credentials

## 🆘 Support

For additional support:

1. Check the [API Integrations Documentation](./api-integrations-documentation.md)
2. Review platform-specific developer documentation
3. Contact system administrator for credential access
4. Submit support ticket for technical issues

## 📝 Changelog

| Date       | Change                                 | Author |
| ---------- | -------------------------------------- | ------ |
| 2025-01-24 | Initial documentation creation         | System |
| 2025-01-24 | Added comprehensive setup instructions | System |
| 2025-01-24 | Added security best practices          | System |

---

**Note**: Keep this documentation updated as APIs change and new integrations are added. Always refer to the official API documentation for the most current information.

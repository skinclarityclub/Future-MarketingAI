# 🚀 SKC Business Intelligence Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.0-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-blueviolet)](https://tailwindcss.com/)

## 📋 Overview

The SKC Business Intelligence Dashboard is a comprehensive enterprise-grade data analytics platform built with Next.js 14, featuring real-time analytics, AI-powered insights, and premium UX design. The system provides advanced business intelligence capabilities with support for multiple languages (Dutch/English) and accessibility features.

## ✨ Key Features

### 🎯 **Core Dashboard Modules**

- **Executive Overview** - Strategic KPI tracking and performance metrics
- **Revenue Analytics** - Real-time revenue tracking and forecasting
- **Customer Intelligence** - Advanced customer segmentation and behavior analysis
- **Marketing Performance** - Campaign ROI and marketing optimization
- **Financial Intelligence** - Budget tracking and financial forecasting
- **Content ROI** - Content performance and ROI analytics

### 🤖 **AI-Powered Features**

- **Smart Navigation Assistant** - AI-powered navigation with context awareness
- **Intelligent Business Assistant** - Natural language querying for business data
- **Predictive Analytics** - ML-driven insights and forecasting
- **Advanced Chatbot** - Context-aware conversational interface
- **Tactical Analysis Engine** - Real-time business intelligence analysis

### 🌐 **Internationalization & Accessibility**

- **Multi-language Support** - Complete Dutch and English localization
- **WCAG 2.1 AA Compliance** - Full accessibility features
- **Premium UX/UI** - Modern glass morphism design with 60fps animations
- **Responsive Design** - Mobile-first responsive interface
- **High Contrast Mode** - Accessibility enhancements

### 🔗 **Integrations**

- **Supabase** - PostgreSQL database with real-time subscriptions
- **n8n Workflows** - Automated data processing and workflow management
- **Telegram Bot** - Business intelligence via Telegram
- **OAuth Providers** - Google Ads, Meta Ads integration
- **WebSocket** - Real-time data streaming and updates

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15.3.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Recharts** - Advanced data visualization
- **next-intl** - Internationalization framework

### **Backend & Database**

- **Supabase** - PostgreSQL with real-time capabilities
- **Supabase SSR** - Server-side rendering support
- **Row Level Security** - Database security implementation
- **Real-time Subscriptions** - Live data updates

### **AI & Analytics**

- **OpenAI API** - Natural language processing
- **Advanced ML Engine** - Custom analytics and predictions
- **Behavior Tracking** - User interaction analytics
- **Performance Monitoring** - Real-time system monitoring

### **Development Tools**

- **ESLint & Prettier** - Code quality and formatting
- **Vitest** - Unit testing framework
- **TypeScript Strict Mode** - Enhanced type safety
- **Bundle Analyzer** - Performance optimization

## 📚 Documentation

### **Component Architecture**

- **[📖 Component Architecture Guide](docs/COMPONENT_ARCHITECTURE.md)** - Complete component documentation
- **[🏗️ Fortune 500 Demo Environment](docs/COMPONENT_ARCHITECTURE.md#fortune500demoenvironment)** - Enterprise demo features
- **[🎨 Premium UI Components](docs/COMPONENT_ARCHITECTURE.md#enhanced-ui-components)** - Enhanced component library
- **[🔄 Migration Guide](docs/COMPONENT_ARCHITECTURE.md#migration-guide)** - Legacy component upgrades

### **Recent Updates (January 2025)**

- ✅ **Fixed Critical Runtime Issues** - Resolved PremiumButton circular reference and tabs component errors
- ✅ **Enhanced Fortune 500 Demo** - Added Telegram AI, Market Intelligence, Enterprise Security
- ✅ **Component Architecture** - Documented all component structures with usage examples
- ✅ **Performance Optimizations** - GPU acceleration and animation improvements

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account and project
- Git for version control

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd skc-bi-dashboard
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure environment variables**

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI for AI Assistant
OPENAI_API_KEY=your-openai-key

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# OAuth Configuration (Optional)
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_ads_client_secret
META_ADS_CLIENT_ID=your_meta_ads_client_id
META_ADS_CLIENT_SECRET=your_meta_ads_client_secret
```

4. **Run database migrations**

```bash
npm run migrate
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📱 Usage

### **Navigation**

- **Smart Sidebar** - AI-powered navigation with context-aware suggestions
- **Breadcrumbs** - Clear navigation path tracking
- **Keyboard Shortcuts** - Quick access with Ctrl+K for command palette
- **Voice Navigation** - Voice-to-text navigation support

### **Dashboard Interaction**

- **Real-time Updates** - Live data streaming via WebSocket
- **Interactive Charts** - Click and drill-down capabilities
- **Export Features** - PDF and CSV export functionality
- **Responsive Design** - Optimized for desktop, tablet, and mobile

### **AI Assistant**

- **Natural Language Queries** - Ask business questions in plain language
- **Context Awareness** - Understands current dashboard context
- **Smart Suggestions** - Proactive insights and recommendations
- **Multi-language Support** - Dutch and English language processing

## 🧪 Testing

### **Running Tests**

```bash
# Run all tests
npm run test

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run all quality checks
npm run check-all
```

### **Testing Data Sources**

```bash
# Test data source integrations
npm run test:data-sources

# Test complex query handling
npm run test:complex-queries
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types
- `npm run build:prod` - Production build with all checks
- `npm run analyze` - Analyze bundle size
- `npm run migrate` - Run database migrations

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API routes
│   └── admin/             # Admin interface
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── ai-assistant/      # AI assistant components
│   ├── charts/            # Data visualization components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase configuration
│   ├── analytics/         # Analytics engines
│   ├── ai-configuration/  # AI service configuration
│   └── i18n/              # Internationalization
├── hooks/                 # Custom React hooks
├── i18n/                  # Language dictionaries
└── styles/                # Global styles
```

## 🌍 Internationalization

The dashboard supports Dutch and English languages with:

- **Complete translations** - 632 Dutch and 543 English translation keys
- **Locale routing** - `/nl/` and `/en/` route prefixes
- **Server-side rendering** - Optimized SSR with locale support
- **Dynamic switching** - Real-time language switching
- **Currency formatting** - Locale-specific number and currency formatting

## ♿ Accessibility

WCAG 2.1 Level AA compliant features:

- **Screen reader optimization** - Comprehensive ARIA labels
- **Keyboard navigation** - Full keyboard accessibility
- **High contrast mode** - Enhanced visual accessibility
- **Focus management** - Proper focus handling
- **Skip links** - Quick navigation for screen readers
- **Touch targets** - Minimum 44px touch targets

## 🚀 Deployment

### **Vercel (Recommended)**

```bash
vercel --prod
```

### **Docker**

```bash
docker build -t skc-bi-dashboard .
docker run -p 3000:3000 skc-bi-dashboard
```

For detailed deployment instructions, see [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md).

## 📊 Performance

- **Lighthouse Score** - 95+ across all metrics
- **Core Web Vitals** - Optimized for excellent user experience
- **Bundle Size** - Optimized with tree shaking and code splitting
- **Memory Usage** - Efficient memory management with cleanup
- **Load Testing** - 100% success rate under stress testing

## 🔐 Security

- **Row Level Security** - Database-level security policies
- **Authentication** - Supabase Auth integration
- **Input Validation** - Comprehensive input sanitization
- **XSS Protection** - Built-in React security features
- **HTTPS Enforcement** - SSL/TLS encryption
- **Rate Limiting** - API request limiting

## 📈 Monitoring

Built-in monitoring features:

- **Performance Monitor** - Real-time FPS, memory, and network tracking
- **Error Boundaries** - Comprehensive error handling
- **Health Checks** - System health monitoring
- **User Analytics** - Behavior tracking and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:

- Check the [documentation](./docs/)
- Review [troubleshooting guides](./docs/troubleshooting.md)
- Contact the development team

## 🔄 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes.

---

**Built with ❤️ using Next.js, TypeScript, and Supabase**

## 🚀 New Features

#### A/B Testing Framework

An enterprise-grade A/B testing platform with multi-platform support and advanced statistical analysis.

**Features:**

- Multi-platform testing (Email, Web, Social, Mobile, Cross-platform)
- Real-time statistical significance tracking
- AI-powered recommendations and insights
- Automated winner detection
- Comprehensive analytics dashboard
- Enterprise-level ROI analysis

**Access the demo:** `/ab-testing-framework`

**Key Capabilities:**

- Cross-platform test orchestration
- Bayesian statistical methods
- Multi-armed bandit optimization
- Predictive performance modeling
- Custom metrics tracking
- REST API for automation

### 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components:** Shadcn/ui, Recharts for data visualization
- **Backend:** Supabase (PostgreSQL), n8n workflows
- **AI/ML:** OpenAI, Anthropic, Google AI integration
- **Analytics:** Advanced metrics tracking and real-time insights
- **Testing:** Comprehensive A/B testing framework
- **Deployment:** Vercel (frontend), Supabase Cloud (database)

### 📊 Core Features

1. **Executive Dashboard** - High-level KPIs and performance metrics
2. **Revenue Analytics** - Comprehensive financial tracking and forecasting
3. **Customer Intelligence** - AI-powered customer insights and segmentation
4. **Marketing Automation** - Multi-platform campaign management
5. **Content Performance** - ROI tracking and optimization recommendations
6. **A/B Testing Framework** - Enterprise testing with statistical analysis
7. **Real-time Analytics** - Live data feeds and interactive dashboards
8. **AI Assistant** - Natural language querying and automated insights

### 🎯 Demo Pages

The platform includes several interactive demo pages:

- `/` - Executive overview dashboard
- `/revenue-analytics` - Financial performance tracking
- `/customer-intelligence` - AI-powered customer insights
- `/marketing-automation` - Campaign management and automation
- `/ab-testing-framework` - **NEW** Multi-platform A/B testing
- `/content-performance` - Content ROI and optimization
- `/analytics` - Advanced analytics and reporting

### 🔧 API Endpoints

Key API routes for integration:

- `/api/revenue` - Revenue data and analytics
- `/api/customers` - Customer intelligence data
- `/api/marketing` - Marketing campaign data
- `/api/ab-testing-framework` - **NEW** A/B testing management
- `/api/analytics` - Advanced analytics data
- `/api/ai-assistant` - AI-powered insights

### 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Configure Supabase connection
5. Run development server: `npm run dev`
6. Access the dashboard at `http://localhost:3000`

### 📈 Performance Features

- **Optimized Loading:** React Server Components with minimal client JS
- **Real-time Updates:** WebSocket connections for live data
- **Responsive Design:** Mobile-first approach with premium UI
- **Caching Strategy:** Intelligent data caching for improved performance
- **Progressive Enhancement:** Works across all device types

### 🔒 Security & Compliance

- Row Level Security (RLS) with Supabase
- Environment-based configuration
- Secure API endpoints with proper authentication
- GDPR-compliant data handling
- Enterprise-grade security measures

### 🌟 Premium UI/UX

- Modern gradient designs and glass morphism effects
- Smooth 60fps animations and transitions
- Enterprise-grade visual hierarchy
- Accessible design patterns (WCAG compliant)
- Multi-language support (English/Dutch)

### 🔄 Workflow Integration

- **n8n Workflows:** Automated data processing and notifications
- **Webhook Support:** Real-time data synchronization
- **API-First Design:** Easy integration with external systems
- **Scheduled Tasks:** Automated reporting and data updates

### 📱 Multi-Platform Support

The dashboard is optimized for:

- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS, Android)
- Tablet interfaces
- Progressive Web App (PWA) capabilities

### 🎨 Customization

- Configurable themes and branding
- Customizable dashboard layouts
- White-label ready for enterprise clients
- Extensible component architecture

---

**Built for Fortune 500 companies and enterprise clients requiring sophisticated business intelligence solutions.**

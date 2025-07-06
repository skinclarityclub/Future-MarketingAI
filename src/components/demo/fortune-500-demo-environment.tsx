"use client";

import React, { useState, useEffect } from "react";
import { Locale } from "@/lib/i18n/config";
import { motion, AnimatePresence } from "framer-motion";
import NormalButton from "@/components/ui/normal-button";
import UltimateConverterDemo from "./ultimate-converter-demo";
import SOC2ComplianceDashboard from "@/components/security/soc2-compliance-dashboard";
import AuditDashboard from "@/components/admin/audit-dashboard";
import { RBACManagementDashboard } from "@/components/admin/rbac-management-dashboard";
import ApprovalWorkflowDashboard from "@/components/approval/approval-workflow-dashboard";
import ApprovalAnalyticsDashboard from "@/components/approval/approval-analytics-dashboard";
import EnterpriseContractsDashboard from "@/components/admin/enterprise-contracts-dashboard";
import {
  Building2,
  TrendingUp,
  Target,
  Users,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Brain,
  ArrowUpRight,
  Play,
  Pause,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  Lock,
  UserCheck,
  FileText,
  Briefcase,
} from "lucide-react";

interface Fortune500DemoEnvironmentProps {
  locale: Locale;
}

export default function Fortune500DemoEnvironment({
  locale,
}: Fortune500DemoEnvironmentProps) {
  const [currentView, setCurrentView] = useState<DemoView>("command-center");
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [demoProgress, setDemoProgress] = useState(0);
  const [enterpriseMetrics, setEnterpriseMetrics] = useState({
    totalROI: "€2.4M",
    efficiency: "89%",
    satisfaction: "96%",
    automation: "78%",
  });

  const demoViews: DemoView[] = [
    "command-center",
    "analytics-suite",
    "marketing-automation",
    "ai-insights",
    "enterprise-scaling",
  ];

  const enterpriseFeatures = {
    "command-center": {
      title: "Executive Command Center",
      subtitle: "Real-time enterprise dashboard voor C-level executives",
      description:
        "Krijg direct inzicht in alle kritieke bedrijfsmetrics met AI-gedreven voorspellingen en real-time analytics.",
      keyMetrics: [
        "Revenue Growth: +€1.2M ARR",
        "Customer Acquisition: +47%",
        "Operational Efficiency: 89%",
        "Market Share: +12%",
      ],
      components: [
        "CEO Dashboard",
        "KPI Monitoring",
        "Strategic Insights",
        "Board Reporting",
      ],
    },
    "analytics-suite": {
      title: "Advanced Analytics Suite",
      subtitle: "Enterprise-grade BI met machine learning capabilities",
      description:
        "Diepgaande analytics met predictive modeling voor strategische besluitvorming en concurrentievoordeel.",
      keyMetrics: [
        "Forecast Accuracy: 94%",
        "Data Processing: 10TB/day",
        "Insights Generated: 2,847",
        "Time to Insight: 2.3s",
      ],
      components: [
        "Predictive Analytics",
        "Customer Intelligence",
        "Market Analysis",
        "Performance Forecasting",
      ],
    },
    "marketing-automation": {
      title: "Marketing Machine",
      subtitle: "Volledig geautomatiseerde marketing met AI-optimalisatie",
      description:
        "Van content creatie tot multichannel distributie - alles volledig geautomatiseerd met continue optimalisatie.",
      keyMetrics: [
        "Campaign ROI: +340%",
        "Content Production: 95% automated",
        "Lead Quality: +67%",
        "Time Savings: 120hrs/week",
      ],
      components: [
        "Content Generator",
        "Multi-Platform Publishing",
        "Performance Optimization",
        "Lead Nurturing",
      ],
    },
    "ai-insights": {
      title: "AI Intelligence Engine",
      subtitle: "Machine learning insights voor strategische voordelen",
      description:
        "Geavanceerde AI die patronen ontdekt, trends voorspelt en actionable insights genereert voor groei.",
      keyMetrics: [
        "Pattern Recognition: 99.2%",
        "Trend Accuracy: 87%",
        "Action Items: 156/week",
        "Strategic Value: €890K",
      ],
      components: [
        "Trend Analysis",
        "Competitor Intelligence",
        "Opportunity Detection",
        "Strategic Recommendations",
      ],
    },
    "enterprise-scaling": {
      title: "Enterprise Scaling Platform",
      subtitle: "Schaalbare infrastructuur voor Fortune 500 groei",
      description:
        "Enterprise-grade platform dat meegroeit van startup naar Fortune 500 met unlimited scalability.",
      keyMetrics: [
        "Scalability: Unlimited",
        "Uptime: 99.99%",
        "Security: SOC2/ISO27001",
        "Global Reach: 147 countries",
      ],
      components: [
        "Infrastructure Management",
        "Security & Compliance",
        "Global Deployment",
        "Enterprise Support",
      ],
    },
  };

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "campaigns"
    | "roi-calculator"
    | "live-analytics"
    | "dashboard"
    | "telegram-ai"
    | "ultimate-converter"
    | "market-intelligence"
    | "enterprise-security"
    | "compliance-audit"
    | "rbac-management"
    | "approval-workflows"
    | "enterprise-contracts"
  >("overview");
  const [dashboardType, setDashboardType] = useState<
    "marketing" | "finance" | "operations" | "executive"
  >("marketing");

  const [animatedValues, setAnimatedValues] = useState({
    impressions: 125000000,
    clicks: 3800000,
    conversions: 156000,
    roi: 420,
  });

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setAnimatedValues(prev => ({
        impressions: prev.impressions + Math.floor(Math.random() * 50000),
        clicks: prev.clicks + Math.floor(Math.random() * 1500),
        conversions: prev.conversions + Math.floor(Math.random() * 20),
        roi: prev.roi + (Math.random() - 0.5) * 2,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  const companies = [
    {
      id: "techmotion-bv",
      name: "TechMotion B.V.",
      industry: "SaaS & Technology",
      marketingBudget: 25,
      annualRevenue: 0.8,
      employees: 45,
      logo: "🚀",
      status: "active",
      growth: "+34.2%",
    },
    {
      id: "greencycle-solutions",
      name: "GreenCycle Solutions",
      industry: "Sustainable Tech",
      marketingBudget: 35,
      annualRevenue: 1.2,
      employees: 78,
      logo: "🌱",
      status: "active",
      growth: "+28.7%",
    },
    {
      id: "fintech-innovations",
      name: "FinTech Innovations",
      industry: "Financial Services",
      marketingBudget: 45,
      annualRevenue: 2.1,
      employees: 95,
      logo: "💳",
      status: "optimizing",
      growth: "+41.3%",
    },
  ];

  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [customBudget, setCustomBudget] = useState(15);

  const calculateROI = (budget: number) => {
    const baseROI = 350;
    const budgetMultiplier = Math.log10(budget + 1) / Math.log10(26);
    return Math.round(baseROI * (0.8 + budgetMultiplier * 0.4));
  };

  const tabs = [
    { id: "overview", label: "Executive Overview", icon: Building2 },
    { id: "campaigns", label: "Live Campaigns", icon: Target },
    { id: "roi-calculator", label: "ROI Calculator", icon: TrendingUp },
    { id: "live-analytics", label: "Real-time Analytics", icon: Activity },
    { id: "dashboard", label: "🖥️ AI Dashboard", icon: Brain },
    { id: "telegram-ai", label: "🤖 Telegram AI", icon: Zap },
    { id: "ultimate-converter", label: "🚀 Ultimate Converter", icon: Rocket },
    { id: "market-intelligence", label: "🧠 Market Intelligence", icon: Globe },
    {
      id: "enterprise-security",
      label: "🔒 Enterprise Security",
      icon: Shield,
    },
    { id: "compliance-audit", label: "📋 Compliance & Audit", icon: FileText },
    { id: "rbac-management", label: "👥 User Management", icon: UserCheck },
    {
      id: "approval-workflows",
      label: "✅ Approval Workflows",
      icon: CheckCircle2,
    },
    {
      id: "enterprise-contracts",
      label: "📄 Enterprise Contracts",
      icon: Briefcase,
    },
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
      {/* Header with real-time status */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-xl border-b border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">
                    Scale-Up Intelligence Platform
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${isLiveMode ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
                      ></div>
                      <span className="text-sm text-blue-100">
                        {isLiveMode ? "Live Mode Active" : "Demo Mode"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-300 text-sm">
                      <Zap className="w-4 h-4" />
                      <span>AI-Powered Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Company Selector */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Select Scale-Up Client:
                </label>
                <div className="relative">
                  <select
                    value={selectedCompany.id}
                    onChange={e => {
                      const company = companies.find(
                        c => c.id === e.target.value
                      );
                      if (company) setSelectedCompany(company);
                    }}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-600 text-white rounded-xl px-4 py-3 font-medium min-w-[280px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {companies.map(company => (
                      <option
                        key={company.id}
                        value={company.id}
                        className="bg-slate-800"
                      >
                        {company.logo} {company.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Live Mode Toggle */}
              <div className="flex items-center gap-3">
                <NormalButton
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isLiveMode
                      ? "bg-green-600/20 border border-green-500/30 text-green-300"
                      : "bg-slate-700/50 border border-slate-600 text-slate-300"
                  }`}
                >
                  {isLiveMode ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isLiveMode ? "Live Data" : "Static Demo"}
                  </span>
                </NormalButton>

                <NormalButton className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Reset Demo</span>
                </NormalButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation with enhanced design */}
      <div className="border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
        <nav className="flex space-x-0 px-8">
          {tabs.map(tab => (
            <NormalButton
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative py-4 px-6 font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </NormalButton>
          ))}
        </nav>
      </div>

      {/* Content with advanced animations */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Company Overview Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-6xl">{selectedCompany.logo}</div>
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-1">
                          {selectedCompany.name}
                        </h3>
                        <p className="text-slate-300 text-lg">
                          {selectedCompany.industry}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                              selectedCompany.status === "active"
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                selectedCompany.status === "active"
                                  ? "bg-green-400"
                                  : "bg-yellow-400"
                              } animate-pulse`}
                            ></div>
                            {selectedCompany.status === "active"
                              ? "Campaign Active"
                              : "Optimizing"}
                          </div>
                          <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                            <ArrowUpRight className="w-4 h-4" />
                            {selectedCompany.growth}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                        €{selectedCompany.marketingBudget}K
                      </div>
                      <div className="text-sm text-slate-400">
                        Annual Marketing Budget
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-slate-400">
                          Annual Revenue
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        €{selectedCompany.annualRevenue}B
                      </div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-slate-400">
                          Employees
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {selectedCompany.employees.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-slate-400">
                          Current ROI
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-green-400">
                        {Math.round(animatedValues.roi)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: BarChart3,
                    label: "Monthly Impressions",
                    value: animatedValues.impressions,
                    format: (val: number) => `${(val / 1000000).toFixed(1)}M`,
                    change: "+15.2%",
                    color: "blue",
                  },
                  {
                    icon: Target,
                    label: "Monthly Clicks",
                    value: animatedValues.clicks,
                    format: (val: number) => `${(val / 1000000).toFixed(1)}M`,
                    change: "+22.4%",
                    color: "green",
                  },
                  {
                    icon: CheckCircle2,
                    label: "Conversions",
                    value: animatedValues.conversions,
                    format: (val: number) => `${(val / 1000).toFixed(0)}K`,
                    change: "+18.7%",
                    color: "purple",
                  },
                  {
                    icon: Zap,
                    label: "Engagement Rate",
                    value: 4.8,
                    format: (val: number) => `${val.toFixed(1)}%`,
                    change: "+0.8%",
                    color: "cyan",
                  },
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div
                      className={`absolute -inset-1 bg-gradient-to-r from-${metric.color}-500/20 to-${metric.color}-600/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-1000`}
                    ></div>
                    <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-500`}
                      >
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">
                        {metric.format(metric.value)}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">
                        {metric.label}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-green-400 text-xs font-medium">
                        <ArrowUpRight className="w-3 h-3" />
                        {metric.change} vs last month
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Insights Panel */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        AI Marketing Intelligence
                      </h3>
                      <p className="text-purple-300 text-sm">
                        Real-time insights and optimization recommendations
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">
                          Optimization Alert
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        LinkedIn campaigns showing 23% higher engagement.
                        Recommend budget reallocation from Facebook to LinkedIn
                        for Q4.
                      </p>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium text-green-400">
                          Performance Win
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        Video content generating 340% more engagement than
                        static posts. Consider increasing video budget
                        allocation.
                      </p>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">
                          Trend Insight
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        Sustainability messaging resonating 45% better with
                        target audience. Align Q4 campaigns with sustainability
                        themes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "campaigns" && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Live Campaign Dashboard
                </h3>
                <p className="text-slate-400">
                  Real-time monitoring of active scale-up campaigns
                </p>
              </div>

              {/* Campaign cards will go here */}
              <div className="grid gap-6">
                {[
                  {
                    name: "Q4 Product Launch",
                    budget: "€2.4M",
                    status: "Active",
                    performance: "+34%",
                  },
                  {
                    name: "Brand Awareness EU",
                    budget: "€1.8M",
                    status: "Optimizing",
                    performance: "+28%",
                  },
                  {
                    name: "Holiday Campaign",
                    budget: "€3.2M",
                    status: "Planning",
                    performance: "TBD",
                  },
                ].map((campaign, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {campaign.name}
                        </h4>
                        <p className="text-slate-400">
                          Budget: {campaign.budget}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-3 py-1 rounded-full text-sm ${
                            campaign.status === "Active"
                              ? "bg-green-500/20 text-green-300"
                              : campaign.status === "Optimizing"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {campaign.status}
                        </div>
                        <p className="text-green-400 mt-1">
                          {campaign.performance}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "roi-calculator" && (
            <motion.div
              key="roi-calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Enterprise ROI Calculator
                </h3>
                <p className="text-slate-400">
                  Calculate potential returns for scale-up marketing investments
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Marketing Budget (in millions €)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={customBudget}
                    onChange={e => setCustomBudget(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mt-2">
                    <span>€1M</span>
                    <span className="text-white font-bold">
                      €{customBudget}M
                    </span>
                    <span>€50M</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {calculateROI(customBudget)}%
                    </div>
                    <div className="text-sm text-slate-400">Expected ROI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      €
                      {Math.round(
                        customBudget * (calculateROI(customBudget) / 100)
                      )}
                      M
                    </div>
                    <div className="text-sm text-slate-400">
                      Additional Revenue
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {Math.round(12 + customBudget * 0.5)}
                    </div>
                    <div className="text-sm text-slate-400">
                      Months to Break-even
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "live-analytics" && (
            <motion.div
              key="live-analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Real-time Analytics Hub
                </h3>
                <p className="text-slate-400">
                  Live data streams from scale-up marketing campaigns
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                <div className="text-center text-slate-400">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>
                    Real-time analytics visualization will be displayed here
                  </p>
                  <p className="text-sm mt-2">Connected to live data streams</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  AI-Powered Executive Dashboard
                </h3>
                <p className="text-slate-400">
                  Switch between different enterprise dashboard views
                </p>
              </div>

              {/* Dashboard Type Selector */}
              <div className="flex justify-center gap-4 mb-8">
                {[
                  { id: "marketing", label: "📈 Marketing", color: "blue" },
                  { id: "finance", label: "💰 Finance", color: "green" },
                  { id: "operations", label: "⚙️ Operations", color: "purple" },
                  { id: "executive", label: "👔 Executive", color: "amber" },
                ].map(type => (
                  <NormalButton
                    key={type.id}
                    onClick={() => setDashboardType(type.id as any)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      dashboardType === type.id
                        ? `bg-${type.color}-600/30 border border-${type.color}-500/50 text-${type.color}-300`
                        : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"
                    }`}
                  >
                    {type.label}
                  </NormalButton>
                ))}
              </div>

              {/* Dashboard Content */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                {dashboardType === "marketing" && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white mb-4">
                      🚀 Marketing Performance Dashboard
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-300">
                          €8.2M
                        </div>
                        <div className="text-sm text-blue-200">
                          Campaign Spend
                        </div>
                      </div>
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-300">
                          342%
                        </div>
                        <div className="text-sm text-green-200">ROAS</div>
                      </div>
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-300">
                          24.3M
                        </div>
                        <div className="text-sm text-purple-200">
                          Impressions
                        </div>
                      </div>
                      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-cyan-300">
                          4.8%
                        </div>
                        <div className="text-sm text-cyan-200">CTR</div>
                      </div>
                    </div>
                  </div>
                )}
                {dashboardType === "finance" && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white mb-4">
                      💰 Financial Intelligence Dashboard
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-300">
                          €125.8M
                        </div>
                        <div className="text-sm text-green-200">
                          Quarterly Revenue
                        </div>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-300">
                          €34.2M
                        </div>
                        <div className="text-sm text-blue-200">
                          Profit Margin
                        </div>
                      </div>
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-300">
                          +18.5%
                        </div>
                        <div className="text-sm text-purple-200">
                          Growth Rate
                        </div>
                      </div>
                      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-amber-300">
                          €89.1M
                        </div>
                        <div className="text-sm text-amber-200">Cash Flow</div>
                      </div>
                    </div>
                  </div>
                )}
                {dashboardType === "operations" && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white mb-4">
                      ⚙️ Operations Intelligence Dashboard
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-300">
                          98.7%
                        </div>
                        <div className="text-sm text-purple-200">
                          System Uptime
                        </div>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-300">
                          847ms
                        </div>
                        <div className="text-sm text-blue-200">
                          Avg Response
                        </div>
                      </div>
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-300">
                          156K
                        </div>
                        <div className="text-sm text-green-200">
                          Daily Users
                        </div>
                      </div>
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-300">
                          0.02%
                        </div>
                        <div className="text-sm text-red-200">Error Rate</div>
                      </div>
                    </div>
                  </div>
                )}
                {dashboardType === "executive" && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white mb-4">
                      👔 Executive Summary Dashboard
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-amber-300">
                          €2.1B
                        </div>
                        <div className="text-sm text-amber-200">
                          Annual Revenue
                        </div>
                      </div>
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-300">
                          +23.4%
                        </div>
                        <div className="text-sm text-green-200">YoY Growth</div>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-300">
                          89
                        </div>
                        <div className="text-sm text-blue-200">
                          Market Score
                        </div>
                      </div>
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-300">
                          94%
                        </div>
                        <div className="text-sm text-purple-200">
                          Customer Sat.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "telegram-ai" && (
            <motion.div
              key="telegram-ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  🤖 24/7 Telegram AI Assistant
                </h3>
                <p className="text-slate-400">
                  Enterprise AI that knows everything about your business
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Telegram Chat Simulation */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        Live Telegram Chat
                      </h4>
                      <p className="text-sm text-slate-400">
                        @SKC_AI_Assistant
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="space-y-4 h-64 overflow-y-auto">
                    <div className="bg-blue-600/20 rounded-lg p-3 ml-8">
                      <p className="text-white text-sm">
                        Hoe presteren onze campagnes vandaag?
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        You - 2:34 PM
                      </p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 mr-8">
                      <p className="text-white text-sm">
                        🚀 Excellente prestaties! LinkedIn campagne +23%
                        engagement, ROI stijgt naar 342%. Zou je de details
                        willen zien?
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        SKC AI - 2:34 PM
                      </p>
                    </div>
                    <div className="bg-blue-600/20 rounded-lg p-3 ml-8">
                      <p className="text-white text-sm">
                        Ja graag! En vergelijk met concurrenten
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        You - 2:35 PM
                      </p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 mr-8">
                      <p className="text-white text-sm">
                        📊 Analyse voltooid! Jij presteert 34% beter dan
                        concurrenten. Grootste voordeel: video content strategy.
                        Detailrapport sturen?
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        SKC AI - 2:35 PM
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type je vraag..."
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <NormalButton className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </NormalButton>
                  </div>
                </div>

                {/* AI Capabilities */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-white mb-4">
                      🧠 AI Capabilities
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-white">
                          Real-time data access to all business systems
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-white">
                          Marketing performance analysis & optimization
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-white">
                          Financial insights & trend forecasting
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-white">
                          Competitor intelligence & market analysis
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-white">
                          Content generation & campaign ideas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-white mb-4">
                      📱 24/7 Accessibility
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">
                          Instant response to business questions
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">
                          Multi-language support (NL/EN/DE/FR)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">
                          Secure authentication & role-based access
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">
                          Integration with all business systems
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "ultimate-converter" && (
            <motion.div
              key="ultimate-converter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UltimateConverterDemo locale={locale} />
            </motion.div>
          )}

          {activeTab === "market-intelligence" && (
            <motion.div
              key="market-intelligence"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  🧠 Advanced Market Intelligence
                </h3>
                <p className="text-slate-400">
                  AI-powered competitor analysis and trend prediction
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Competitor Analysis */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    🎯 Competitor Intelligence
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        name: "CompetitorA",
                        performance: 87,
                        trend: "+5%",
                        threat: "medium",
                      },
                      {
                        name: "CompetitorB",
                        performance: 72,
                        trend: "-2%",
                        threat: "low",
                      },
                      {
                        name: "CompetitorC",
                        performance: 94,
                        trend: "+12%",
                        threat: "high",
                      },
                    ].map((comp, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">
                            {comp.name}
                          </span>
                          <div
                            className={`px-2 py-1 rounded text-xs ${
                              comp.threat === "high"
                                ? "bg-red-500/20 text-red-300"
                                : comp.threat === "medium"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {comp.threat} threat
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-white">
                            {comp.performance}%
                          </div>
                          <div
                            className={`text-sm ${comp.trend.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                          >
                            {comp.trend}
                          </div>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${comp.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trend Analysis */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    📈 Trend Prediction
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="font-medium text-green-300">
                          Rising Trend
                        </span>
                      </div>
                      <p className="text-white text-sm">
                        Video-first marketing strategies showing 340% growth in
                        engagement
                      </p>
                      <div className="text-xs text-green-200 mt-1">
                        Confidence: 94%
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-blue-400" />
                        <span className="font-medium text-blue-300">
                          AI Insight
                        </span>
                      </div>
                      <p className="text-white text-sm">
                        Sustainability messaging resonates 45% better with
                        target demographics
                      </p>
                      <div className="text-xs text-blue-200 mt-1">
                        Confidence: 87%
                      </div>
                    </div>

                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        <span className="font-medium text-purple-300">
                          Market Gap
                        </span>
                      </div>
                      <p className="text-white text-sm">
                        Untapped opportunity in interactive content formats
                        (+€2.3M potential)
                      </p>
                      <div className="text-xs text-purple-200 mt-1">
                        Confidence: 91%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Research Engine */}
              <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-xl p-8">
                <h4 className="text-xl font-bold text-white mb-6">
                  🔬 AI Content Research Engine
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-white mb-3">
                      n8n Workflow Integration
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-slate-300">
                          Real-time trend scraping
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-slate-300">
                          Competitor content analysis
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-slate-300">
                          SEO opportunity detection
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-slate-300">
                          Viral potential prediction
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white mb-3">
                      Generated Insights
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="bg-slate-700/50 rounded p-2">
                        <span className="text-cyan-300">Content Idea:</span>
                        <span className="text-white ml-2">
                          "B2B Video Series: Behind the ROI"
                        </span>
                      </div>
                      <div className="bg-slate-700/50 rounded p-2">
                        <span className="text-green-300">Trend:</span>
                        <span className="text-white ml-2">
                          Transparency in marketing ROI (+67% engagement)
                        </span>
                      </div>
                      <div className="bg-slate-700/50 rounded p-2">
                        <span className="text-purple-300">Gap:</span>
                        <span className="text-white ml-2">
                          Interactive ROI calculators underutilized
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enterprise Security Tab */}
          {activeTab === "enterprise-security" && (
            <motion.div
              key="enterprise-security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SOC2ComplianceDashboard />
            </motion.div>
          )}

          {/* Compliance & Audit Tab */}
          {activeTab === "compliance-audit" && (
            <motion.div
              key="compliance-audit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AuditDashboard />
            </motion.div>
          )}

          {/* RBAC Management Tab */}
          {activeTab === "rbac-management" && (
            <motion.div
              key="rbac-management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RBACManagementDashboard />
            </motion.div>
          )}

          {/* Approval Workflows Tab */}
          {activeTab === "approval-workflows" && (
            <motion.div
              key="approval-workflows"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <ApprovalWorkflowDashboard />
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">
                    📊 Approval Analytics
                  </h3>
                  <ApprovalAnalyticsDashboard />
                </div>
              </div>
            </motion.div>
          )}

          {/* Enterprise Contracts Tab */}
          {activeTab === "enterprise-contracts" && (
            <motion.div
              key="enterprise-contracts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EnterpriseContractsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

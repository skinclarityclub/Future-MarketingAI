"use client";

import Link from "next/link";
import { motion } from "@/components/ui/motion";
import {
  Building2,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  ArrowRight,
  Zap,
  Clock,
  Brain,
  Target,
  Calculator,
} from "lucide-react";

export default function FinancialIntelligencePage() {
  const features = [
    {
      icon: DollarSign,
      title: "Revenue Analytics",
      description:
        "Real-time revenue tracking met detailed breakdown per product, service en channel",
    },
    {
      icon: TrendingUp,
      title: "Financial Forecasting",
      description:
        "AI-powered forecasting voor revenue, costs en cash flow predictions",
    },
    {
      icon: Calculator,
      title: "Cost Analysis",
      description:
        "Complete cost breakdown en optimization opportunities identification",
    },
    {
      icon: PieChart,
      title: "Profit Optimization",
      description:
        "Margin analysis en profit optimization recommendations per business unit",
    },
    {
      icon: BarChart3,
      title: "Budget Management",
      description:
        "Budget tracking, variance analysis en spend optimization insights",
    },
    {
      icon: Target,
      title: "KPI Monitoring",
      description:
        "Financial KPI tracking met automated alerts voor belangrijke metrics",
    },
  ];

  const metrics = [
    { label: "Revenue Growth", value: "+142%", color: "text-emerald-400" },
    { label: "Cost Reduction", value: "-28%", color: "text-blue-400" },
    { label: "Profit Margin", value: "+76%", color: "text-purple-400" },
    { label: "Forecast Accuracy", value: "96%", color: "text-orange-400" },
  ];

  const kpis = [
    {
      name: "Monthly Recurring Revenue",
      value: "€167,340",
      change: "+23%",
      color: "text-emerald-400",
    },
    {
      name: "Customer Acquisition Cost",
      value: "€247",
      change: "-15%",
      color: "text-blue-400",
    },
    {
      name: "Customer Lifetime Value",
      value: "€2,890",
      change: "+41%",
      color: "text-purple-400",
    },
    {
      name: "Cash Flow",
      value: "€89,230",
      change: "+18%",
      color: "text-orange-400",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live financial data met updates elke 30 minuten",
      stat: "30 min",
    },
    {
      icon: Brain,
      title: "AI Insights",
      description: "Machine learning voor financial pattern recognition",
      stat: "AI-Powered",
    },
    {
      icon: Zap,
      title: "Fast Reporting",
      description: "Instant financial rapportage en executive summaries",
      stat: "Instant",
    },
    {
      icon: Target,
      title: "Accuracy",
      description: "96% forecasting accuracy voor betrouwbare planning",
      stat: "96%",
    },
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Building2 className="w-4 h-4 mr-2" />
                  Financial Intelligence
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-white via-purple-100 to-violet-100 bg-clip-text text-transparent">
                  Financial
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  Intelligence
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-300 mb-8"
              >
                Complete financial analytics platform met revenue tracking,
                forecasting en profit optimization voor datagedreven financial
                management.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/contact-sales"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start financial analytics
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/demo"
                  className="group inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
                >
                  Live Demo
                </Link>
              </motion.div>
            </div>

            {/* KPI Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {kpis.map((kpi, _index) => (
                <div
                  key={kpi.name}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="text-2xl font-bold text-white mb-1">
                    {kpi.value}
                  </div>
                  <div className={`text-sm font-medium ${kpi.color} mb-2`}>
                    {kpi.change}
                  </div>
                  <div className="text-slate-300 text-xs">{kpi.name}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 sm:py-24 md:py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Financial Performance Results
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Gemiddelde verbetering van financial KPIs bij onze klanten
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div
                  className={`text-3xl lg:text-4xl font-bold ${metric.color} mb-2`}
                >
                  {metric.value}
                </div>
                <div className="text-slate-300 text-sm lg:text-base">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Complete Financial Suite
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Alle tools voor comprehensive financial intelligence en
              optimization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 p-3 mb-6">
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-24 md:py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Enterprise Financial Intelligence
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Professional-grade financiële analytics voor growing businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 p-3">
                  <benefit.icon className="w-full h-full text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {benefit.stat}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-300 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Implementation Roadmap
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Van financial data tot complete intelligence platform in 4 stappen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Data Integration",
                description:
                  "Connectie met uw accounting, CRM en financial systems",
              },
              {
                step: "02",
                title: "KPI Setup",
                description:
                  "Configuratie van financial KPIs en performance metrics",
              },
              {
                step: "03",
                title: "Dashboard Config",
                description:
                  "Personalisatie van uw financial intelligence interface",
              },
              {
                step: "04",
                title: "Optimization",
                description: "Training en profit optimization voor maximum ROI",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-slate-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Optimaliseer uw Financial Performance
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Start vandaag met intelligent financial analytics en zie uw
            profitability stijgen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-sales"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Plan een demo
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/nl/dashboards"
              className="group inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              Andere Dashboards
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

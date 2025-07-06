"use client";

import Link from "next/link";
import { motion } from "@/components/ui/motion";
import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Zap,
  Eye,
  Calendar,
} from "lucide-react";

export default function ExecutiveDashboardPage() {
  const features = [
    {
      icon: BarChart3,
      title: "Strategic KPI Monitoring",
      description:
        "Real-time tracking van cruciale business metrics en performance indicators",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description:
        "Comprehensive analyse van business performance trends en growth patterns",
    },
    {
      icon: DollarSign,
      title: "Financial Overview",
      description:
        "Complete financial performance tracking met revenue, costs en profit margins",
    },
    {
      icon: Users,
      title: "Team Performance",
      description:
        "Department performance metrics en team productivity insights",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description:
        "Strategic goal monitoring met progress tracking en achievement analytics",
    },
    {
      icon: Eye,
      title: "Market Intelligence",
      description:
        "Competitive positioning en market opportunity identification",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Real-time Updates",
      description:
        "Live data refresh elke 5 minuten voor altijd actuele insights",
      stat: "5 min",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level beveiliging met role-based access control",
      stat: "99.9%",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-second query response times voor instant insights",
      stat: "<1s",
    },
    {
      icon: Calendar,
      title: "Historical Data",
      description: "5 jaar data geschiedenis voor trend analysis",
      stat: "5 jaar",
    },
  ];

  const metrics = [
    { label: "Revenue Growth", value: "+127%", color: "text-emerald-400" },
    { label: "Cost Reduction", value: "-23%", color: "text-blue-400" },
    { label: "Team Efficiency", value: "+89%", color: "text-purple-400" },
    { label: "Decision Speed", value: "+156%", color: "text-orange-400" },
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Marketing Header */}
      <ImprovedMarketingHeader />

      {/* Main Content with top padding for fixed header */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]" />

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
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Executive Dashboard
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
                >
                  <span className="bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
                    Strategic Command
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Center
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg sm:text-xl text-slate-300 mb-8"
                >
                  Complete executive overzicht met real-time KPI's, strategic
                  metrics en actionable insights voor datagedreven leadership
                  beslissingen.
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
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Start uw executive dashboard
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

              {/* Metrics Preview */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
              >
                {metrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <div className={`text-3xl font-bold ${metric.color} mb-2`}>
                      {metric.value}
                    </div>
                    <div className="text-slate-300 text-sm">{metric.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 sm:py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Executive Dashboard Features
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Complete strategic overzicht voor effectieve leadership
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
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 p-3 mb-6">
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
                Enterprise-Grade Performance
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Betrouwbare technologie voor kritieke business beslissingen
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
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 p-3">
                    <benefit.icon className="w-full h-full text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {benefit.stat}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {benefit.description}
                  </p>
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
                Implementatie Process
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Van opzet tot live dashboard in 4 stappen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Data Analyse",
                  description:
                    "Assessment van uw huidige data sources en KPI requirements",
                },
                {
                  step: "02",
                  title: "Dashboard Setup",
                  description:
                    "Custom configuratie van uw executive dashboard interface",
                },
                {
                  step: "03",
                  title: "Integration",
                  description:
                    "Connectie met uw bestaande business systems en data sources",
                },
                {
                  step: "04",
                  title: "Go Live",
                  description:
                    "Training, testing en lancering van uw executive command center",
                },
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center">
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
              Start uw Executive Dashboard
            </h2>
            <p className="text-xl text-slate-300 mb-12">
              Transformeer uw business data naar strategic insights voor betere
              beslissingen
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact-sales"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "@/components/ui/motion";
import {
  TrendingUp,
  Target,
  Users,
  BarChart3,
  PieChart,
  ArrowRight,
  CheckCircle,
  Zap,
  Clock,
  Brain,
  DollarSign,
  Activity,
} from "lucide-react";

export default function MarketingAnalyticsPage() {
  const features = [
    {
      icon: Target,
      title: "Campaign Performance",
      description:
        "Real-time tracking van alle marketing campaigns met detailed performance metrics",
    },
    {
      icon: DollarSign,
      title: "ROI Analytics",
      description:
        "Complete return on investment analyse per campaign, channel en marketing activity",
    },
    {
      icon: Users,
      title: "Attribution Modeling",
      description:
        "Multi-touch attribution om de customer journey en conversion paths te begrijpen",
    },
    {
      icon: BarChart3,
      title: "Channel Optimization",
      description:
        "Performance comparison tussen verschillende marketing channels en platforms",
    },
    {
      icon: Brain,
      title: "Predictive Analytics",
      description:
        "AI-powered forecasting voor toekomstige marketing performance en trends",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description:
        "Live monitoring van campaign performance met instant alerts en notifications",
    },
  ];

  const metrics = [
    { label: "ROI Improvement", value: "+187%", color: "text-emerald-400" },
    { label: "Cost Per Lead", value: "-34%", color: "text-blue-400" },
    { label: "Conversion Rate", value: "+92%", color: "text-purple-400" },
    { label: "Attribution Accuracy", value: "94%", color: "text-orange-400" },
  ];

  const channels = [
    { name: "Google Ads", performance: 92, color: "bg-blue-500" },
    { name: "Facebook", performance: 87, color: "bg-indigo-500" },
    { name: "LinkedIn", performance: 79, color: "bg-cyan-500" },
    { name: "Email", performance: 95, color: "bg-emerald-500" },
    { name: "SEO", performance: 88, color: "bg-purple-500" },
    { name: "Content", performance: 83, color: "bg-orange-500" },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Real-time Data",
      description:
        "Live updates elke 15 minuten voor actuele campaign insights",
      stat: "15 min",
    },
    {
      icon: Zap,
      title: "Fast Insights",
      description: "Instant rapportage en analytics voor snelle optimalisaties",
      stat: "Instant",
    },
    {
      icon: Brain,
      title: "AI Recommendations",
      description:
        "Machine learning powered aanbevelingen voor betere performance",
      stat: "AI-Driven",
    },
    {
      icon: PieChart,
      title: "Complete View",
      description: "360° overzicht van alle marketing activities en resultaten",
      stat: "360°",
    },
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]" />
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
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Marketing Analytics
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
                  Marketing
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Intelligence Hub
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-300 mb-8"
              >
                Complete marketing analytics platform met ROI tracking,
                attribution modeling en AI-powered insights voor optimale
                campaign performance.
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
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start marketing analytics
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

            {/* Channel Performance Chart */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Channel Performance
              </h3>
              {channels.map((channel, index) => (
                <div key={channel.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{channel.name}</span>
                    <span className="text-white font-medium">
                      {channel.performance}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${channel.performance}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`h-2 rounded-full ${channel.color}`}
                    />
                  </div>
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
              Bewezen Resultaten
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Gemiddelde performance verbetering van onze klanten
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
              Advanced Marketing Analytics
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Complete toolkit voor marketing optimization en ROI maximization
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
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 mb-6">
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
              Waarom onze Marketing Analytics?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Advanced technologie voor superior marketing performance
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
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3">
                  <benefit.icon className="w-full h-full text-white" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-2">
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
              Setup Process
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Van connectie tot complete analytics in 4 stappen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Channel Conectie",
                description:
                  "Verbinding met al uw marketing platforms en data sources",
              },
              {
                step: "02",
                title: "Attribution Setup",
                description:
                  "Configuratie van multi-touch attribution modellen",
              },
              {
                step: "03",
                title: "Dashboard Config",
                description:
                  "Personalisatie van uw marketing analytics interface",
              },
              {
                step: "04",
                title: "Optimization",
                description:
                  "Training en optimalisatie voor maximale marketing ROI",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
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
            Optimaliseer uw Marketing ROI
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Start vandaag met advanced marketing analytics en zie uw performance
            stijgen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-sales"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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

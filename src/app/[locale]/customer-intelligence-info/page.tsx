"use client";

import Link from "next/link";
import { motion } from "@/components/ui/motion";
import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import {
  Users,
  TrendingUp,
  Target,
  BarChart3,
  Brain,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Zap,
  Eye,
  Filter,
} from "lucide-react";

export default function CustomerIntelligenceInfoPage() {
  const features = [
    {
      icon: Users,
      title: "Customer Segmentation",
      description:
        "Automatische klant segmentatie gebaseerd op gedrag, voorkeuren en purchase patterns",
    },
    {
      icon: TrendingUp,
      title: "Behavior Analytics",
      description:
        "Diepgaande analyse van customer behavior en interaction patterns across all touchpoints",
    },
    {
      icon: Target,
      title: "Journey Mapping",
      description:
        "Complete customer journey visualization met touchpoint analysis en conversion funnels",
    },
    {
      icon: BarChart3,
      title: "Lifecycle Analytics",
      description:
        "Customer lifecycle tracking van awareness tot advocacy met retention insights",
    },
    {
      icon: Brain,
      title: "Predictive Insights",
      description:
        "AI-powered voorspellingen voor churn risk, lifetime value en next best actions",
    },
    {
      icon: Eye,
      title: "Real-time Monitoring",
      description:
        "Live customer activity monitoring met instant alerts voor belangrijke events",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "360° Customer View",
      description:
        "Complete klantprofiel met alle interacties, voorkeuren en historische data",
      stat: "360°",
    },
    {
      icon: Shield,
      title: "Privacy Compliant",
      description:
        "GDPR-compliant data verwerking met volledige privacy bescherming",
      stat: "100%",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "Live customer data updates voor immediate actionable insights",
      stat: "Live",
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      description: "Krachtige filtering opties voor precise customer analysis",
      stat: "50+",
    },
  ];

  const metrics = [
    {
      label: "Customer Understanding",
      value: "+165%",
      color: "text-emerald-400",
    },
    { label: "Conversion Rates", value: "+89%", color: "text-blue-400" },
    { label: "Customer Retention", value: "+134%", color: "text-purple-400" },
    { label: "Lifetime Value", value: "+203%", color: "text-orange-400" },
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
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Users className="w-4 h-4 mr-2" />
                    Customer Intelligence
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
                >
                  <span className="bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent">
                    Verstaan Uw Klanten
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    Volledig
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg sm:text-xl text-slate-300 mb-8"
                >
                  Advanced customer analytics platform voor groeiende bedrijven.
                  Krijg diepgaande inzichten in customer behavior, preferences
                  en journey patterns.
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
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Start customer intelligence
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
                Complete Customer Intelligence Suite
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Alle tools die u nodig heeft voor complete customer
                understanding
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
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
                Waarom Customer Intelligence?
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Datagedreven customer insights voor betere business beslissingen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mb-2">
                    {benefit.stat}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
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
                Eenvoudige 3-stappen implementatie voor immediate customer
                insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Data Connection",
                  description:
                    "Verbind uw customer data sources voor complete data integratie",
                  items: [
                    "CRM systems",
                    "Website analytics",
                    "E-commerce platforms",
                    "Customer support tools",
                  ],
                },
                {
                  step: "02",
                  title: "Intelligence Setup",
                  description:
                    "Configureer customer segmentation en behavior tracking parameters",
                  items: [
                    "Segmentation rules",
                    "Journey mapping",
                    "KPI definitions",
                    "Alert thresholds",
                  ],
                },
                {
                  step: "03",
                  title: "Insights & Actions",
                  description:
                    "Start met actionable customer insights en optimization recommendations",
                  items: [
                    "Real-time dashboards",
                    "Automated reports",
                    "Predictive analytics",
                    "Action recommendations",
                  ],
                },
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="glass-card p-8 rounded-2xl h-full">
                    <div className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-6">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-center text-slate-300"
                        >
                          <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-blue-400 transform -translate-y-1/2" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-24 md:py-32 bg-gradient-to-r from-emerald-900/20 to-blue-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Klaar voor Complete Customer Intelligence?
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Start vandaag nog met datagedreven customer insights en verhoog
                uw conversion rates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact-sales"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start uw customer intelligence platform
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  className="group inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
                >
                  Bekijk Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

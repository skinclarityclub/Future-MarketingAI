"use client";

import Link from "next/link";
import { motion } from "@/components/ui/motion";
import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle,
  Shield,
  Users,
  Target,
  Activity,
  PieChart,
} from "lucide-react";

export default function DashboardsPage() {
  const dashboards = [
    {
      icon: BarChart3,
      title: "Executive Dashboard",
      description:
        "Strategisch overzicht voor leidinggevenden met real-time KPI's en business metrics",
      features: [
        "Real-time performance monitoring",
        "Strategic KPI tracking",
        "Executive reporting",
        "Financial overview",
      ],
      href: "/nl/dashboards/executive",
      color: "from-blue-500 to-cyan-500",
      badge: "Strategic",
    },
    {
      icon: TrendingUp,
      title: "Marketing Analytics",
      description:
        "Comprehensive marketing performance tracking en optimization insights",
      features: [
        "Campaign performance",
        "ROI tracking",
        "Attribution analysis",
        "Channel optimization",
      ],
      href: "/nl/dashboards/marketing-analytics",
      color: "from-emerald-500 to-teal-500",
      badge: "Growth",
    },
    {
      icon: Building2,
      title: "Financial Intelligence",
      description:
        "Revenue analytics, forecasting en financial performance monitoring",
      features: [
        "Revenue tracking",
        "Financial forecasting",
        "Cost analysis",
        "Profit optimization",
      ],
      href: "/nl/dashboards/financial-intelligence",
      color: "from-purple-500 to-violet-500",
      badge: "Revenue",
    },
    {
      icon: Globe,
      title: "Market Research Hub",
      description:
        "Comprehensive market intelligence en competitive analysis platform",
      features: [
        "Market trends",
        "Competitor analysis",
        "Industry insights",
        "Opportunity identification",
      ],
      href: "/nl/dashboards/market-research",
      color: "from-orange-500 to-red-500",
      badge: "Intelligence",
    },
    {
      icon: Zap,
      title: "Command Center",
      description:
        "Ultimate marketing operations control voor complete workflow management",
      features: [
        "Campaign orchestration",
        "Workflow automation",
        "Real-time monitoring",
        "Team collaboration",
      ],
      href: "/nl/dashboards/command-center",
      color: "from-cyan-500 to-blue-500",
      badge: "Control",
    },
  ];

  const benefits = [
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Live data updates en instant alerts voor kritieke metrics",
    },
    {
      icon: Target,
      title: "Actionable Insights",
      description:
        "Data-driven aanbevelingen voor betere business beslissingen",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Gedeelde dashboards en collaborative analytics workflows",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level beveiliging met role-based access control",
    },
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

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 sm:mb-12 md:mb-16 lg:mb-20"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <PieChart className="w-4 h-4 mr-2" />
                Intelligence Hub Platform
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent mb-6 sm:mb-8 md:mb-10 lg:mb-12"
            >
              Krachtige Intelligence Hub voor
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Datagedreven Beslissingen
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 lg:mb-20"
            >
              Complete Intelligence Hub suite met real-time analytics, executive
              overzichten en actionable insights voor groeiende bedrijven.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/pricing"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start nu uw Intelligence Hub journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="group inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                Bekijk Demo
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Dashboards Grid */}
        <section className="py-20 sm:py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Complete Dashboard Suite
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Elke dashboard speciaal ontworpen voor specifieke business
                behoeften
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={dashboard.href}>
                    <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                      {/* Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${dashboard.color} text-white`}
                        >
                          {dashboard.badge}
                        </span>
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${dashboard.color} p-3 mb-6`}
                      >
                        <dashboard.icon className="w-full h-full text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                        {dashboard.title}
                      </h3>
                      <p className="text-slate-300 mb-6">
                        {dashboard.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {dashboard.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center text-sm text-slate-400"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Arrow */}
                      <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                        <span className="text-sm font-medium">Meer info</span>
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
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
                Waarom onze Intelligence Hub?
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Enterprise-grade functionaliteit voor groeiende bedrijven
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 p-3">
                    <benefit.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-300">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Klaar om te starten?
            </h2>
            <p className="text-xl text-slate-300 mb-12">
              Transformeer uw business data naar actionable insights
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
                href="/pricing"
                className="group inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                Bekijk Prijzen
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

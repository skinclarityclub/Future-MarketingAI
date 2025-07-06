import { Metadata } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe,
  Search,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  Zap,
  Clock,
  Brain,
  BarChart3,
  Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Market Research Hub | SKC Business Intelligence",
  description:
    "Comprehensive market intelligence platform voor groeiende bedrijven. Competitor analysis, market trends en opportunity identification.",
  keywords: [
    "Market Research",
    "Competitive Intelligence",
    "Market Trends",
    "Industry Analysis",
    "Opportunity Identification",
    "Market Intelligence",
  ],
};

export default function MarketResearchPage() {
  const features = [
    {
      icon: Search,
      title: "Competitive Analysis",
      description:
        "Real-time competitor monitoring met detailed performance benchmarking",
    },
    {
      icon: TrendingUp,
      title: "Market Trends",
      description:
        "AI-powered trend detection en market opportunity identification",
    },
    {
      icon: Users,
      title: "Customer Insights",
      description:
        "Deep customer behavior analysis en market segmentation intelligence",
    },
    {
      icon: BarChart3,
      title: "Industry Analytics",
      description:
        "Complete industry performance metrics en sector trend analysis",
    },
    {
      icon: Target,
      title: "Opportunity Mapping",
      description:
        "Market gap identification en growth opportunity prioritization",
    },
    {
      icon: Eye,
      title: "Market Intelligence",
      description:
        "Comprehensive market surveillance met automated insights generation",
    },
  ];

  const metrics = [
    { label: "Market Opportunities", value: "+156%", color: "text-orange-400" },
    { label: "Competitive Edge", value: "+89%", color: "text-red-400" },
    { label: "Research Speed", value: "-67%", color: "text-blue-400" },
    { label: "Insight Accuracy", value: "94%", color: "text-emerald-400" },
  ];

  const insights = [
    {
      category: "Technology",
      trend: "AI Integration",
      growth: "+340%",
      color: "bg-blue-500",
    },
    {
      category: "Sustainability",
      trend: "Green Solutions",
      growth: "+290%",
      color: "bg-emerald-500",
    },
    {
      category: "Remote Work",
      trend: "Digital Tools",
      growth: "+245%",
      color: "bg-purple-500",
    },
    {
      category: "E-commerce",
      trend: "Mobile Commerce",
      growth: "+198%",
      color: "bg-orange-500",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Real-time Monitoring",
      description: "Live market data met updates elke 1 uur",
      stat: "1 hour",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Machine learning voor pattern recognition en predictions",
      stat: "AI-Powered",
    },
    {
      icon: Zap,
      title: "Fast Research",
      description: "Instant market research rapporten binnen seconden",
      stat: "Instant",
    },
    {
      icon: Target,
      title: "Accuracy",
      description: "94% nauwkeurigheid in market trend predictions",
      stat: "94%",
    },
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.1),transparent_50%)]" />

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
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Globe className="w-4 h-4 mr-2" />
                  Market Research Hub
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent">
                  Market
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
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
                Comprehensive market research platform met competitive
                intelligence, trend analysis en opportunity identification voor
                strategic advantage.
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
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start market research
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

            {/* Market Trends */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Trending Markets
              </h3>
              {insights.map((insight, index) => (
                <div
                  key={insight.category}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${insight.color} mr-3`}
                      />
                      <span className="text-white font-medium">
                        {insight.category}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">
                      {insight.growth}
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm">{insight.trend}</div>
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
              Market Research Results
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Performance verbetering door intelligence-driven decision making
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
              Complete Market Intelligence
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Advanced research tools voor competitive advantage en strategic
              planning
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
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-3 mb-6">
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
              Advanced Research Technology
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Professional market intelligence tools voor growing businesses
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
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-3">
                  <benefit.icon className="w-full h-full text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-400 mb-2">
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
              Research Setup Process
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Van market analysis tot complete intelligence platform in 4
              stappen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Market Definition",
                description:
                  "Identificatie van uw target markets en competitive landscape",
              },
              {
                step: "02",
                title: "Data Sources",
                description:
                  "Setup van market data feeds en intelligence sources",
              },
              {
                step: "03",
                title: "Intelligence Config",
                description:
                  "Configuratie van uw market research dashboard en alerts",
              },
              {
                step: "04",
                title: "Strategic Planning",
                description:
                  "Training en strategic planning voor market advantage",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
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
            Gain Competitive Advantage
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Start vandaag met intelligent market research en blijf voorop in uw
            markt
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-sales"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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

"use client";

import { Metadata } from "next";
import Link from "next/link";
import { motion } from "@/components/ui/motion";
import {
  Brain,
  Search,
  PenTool,
  Sparkles,
  Send,
  Calendar,
  Target,
  ArrowRight,
  CheckCircle,
  Zap,
  Clock,
  Eye,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "MarketingMachine AI Platform | SKC Business Intelligence",
  description:
    "Complete AI-powered marketing platform voor groeiende bedrijven. Van research tot publishing met intelligente automatisering.",
  keywords: [
    "AI Marketing Platform",
    "Marketing Automation",
    "AI Content Creation",
    "Marketing Intelligence",
    "Automated Publishing",
    "Smart Marketing",
  ],
};

export default function MarketingMachinePage() {
  const features = [
    {
      icon: Search,
      title: "AI Research Assistant",
      description:
        "Intelligent market research en competitor analysis met real-time insights",
      href: "/nl/ai-features/research-assistant",
      color: "from-blue-500 to-cyan-500",
      badge: "Research",
    },
    {
      icon: Brain,
      title: "Trend Intelligence",
      description:
        "AI-powered trend detection en market opportunity identification",
      href: "/nl/ai-features/trend-intelligence",
      color: "from-purple-500 to-pink-500",
      badge: "Intelligence",
    },
    {
      icon: PenTool,
      title: "AI Content Creator",
      description:
        "Automated content generation en optimization voor alle channels",
      href: "/nl/ai-features/content-creator",
      color: "from-emerald-500 to-teal-500",
      badge: "Creation",
    },
    {
      icon: Sparkles,
      title: "Creative AI Studio",
      description:
        "AI-powered creative asset generation en visual content creation",
      href: "/nl/ai-features/creative-studio",
      color: "from-orange-500 to-red-500",
      badge: "Creative",
    },
    {
      icon: MessageSquare,
      title: "AI Copywriter",
      description:
        "Premium copywriting met AI-assistentie voor alle marketing materials",
      href: "/nl/ai-features/copywriter",
      color: "from-violet-500 to-purple-500",
      badge: "Writing",
    },
    {
      icon: Send,
      title: "Multi-Channel Publisher",
      description:
        "Automated publishing across alle platforms met smart scheduling",
      href: "/nl/ai-features/publisher",
      color: "from-cyan-500 to-blue-500",
      badge: "Publishing",
    },
    {
      icon: Calendar,
      title: "Smart Scheduler",
      description: "AI-optimized timing en scheduling voor maximum engagement",
      href: "/nl/ai-features/scheduler",
      color: "from-indigo-500 to-blue-500",
      badge: "Timing",
    },
    {
      icon: Target,
      title: "Audience Targeting",
      description: "Precision targeting met AI algorithms voor optimal reach",
      href: "/nl/ai-features/targeting",
      color: "from-pink-500 to-rose-500",
      badge: "Targeting",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Research & Intelligence",
      description: "AI analyseert market trends, competitors en opportunities",
      features: [
        "Market Research",
        "Trend Analysis",
        "Competitor Intelligence",
      ],
    },
    {
      step: "02",
      title: "Content Creation",
      description: "AI genereert high-quality content en creative assets",
      features: ["Content Generation", "Creative Assets", "Copywriting"],
    },
    {
      step: "03",
      title: "Publishing & Distribution",
      description: "Automated publishing met optimal timing en targeting",
      features: [
        "Multi-Channel Publishing",
        "Smart Scheduling",
        "Audience Targeting",
      ],
    },
    {
      step: "04",
      title: "Analytics & Optimization",
      description:
        "Performance tracking en AI-powered optimization recommendations",
      features: [
        "Performance Analytics",
        "ROI Tracking",
        "Continuous Learning",
      ],
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Time Savings",
      description: "87% minder tijd besteed aan repetitive marketing tasks",
      stat: "87%",
    },
    {
      icon: TrendingUp,
      title: "Performance Boost",
      description: "Gemiddeld 156% verbetering in marketing performance",
      stat: "+156%",
    },
    {
      icon: Zap,
      title: "Automation Level",
      description: "Tot 94% van marketing workflows volledig geautomatiseerd",
      stat: "94%",
    },
    {
      icon: Brain,
      title: "AI Accuracy",
      description:
        "96% nauwkeurigheid in AI-generated content en recommendations",
      stat: "96%",
    },
  ];

  const metrics = [
    {
      label: "Content Creation Speed",
      value: "+340%",
      color: "text-emerald-400",
    },
    { label: "Campaign Efficiency", value: "+187%", color: "text-blue-400" },
    { label: "Lead Quality", value: "+92%", color: "text-purple-400" },
    { label: "Marketing ROI", value: "+234%", color: "text-orange-400" },
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12 md:mb-16 lg:mb-20"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Brain className="w-4 h-4 mr-2" />
              AI Marketing Platform
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent mb-6 sm:mb-8 md:mb-10 lg:mb-12"
          >
            De Toekomst van Marketing is
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 lg:mb-20"
          >
            Complete AI-powered marketing platform die de volledige customer
            journey automatiseert - van research tot conversion met intelligente
            optimization.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/contact-sales"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start uw AI marketing journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="group inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              Bekijk Live Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 sm:py-24 md:py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              AI-Powered Results
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Bewezen performance verbetering door intelligente automatisering
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Complete AI Marketing Suite
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Acht gespecialiseerde AI tools voor elke fase van uw marketing
              workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="group">
                <Link href={feature.href}>
                  <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${feature.color} text-white`}
                      >
                        {feature.badge}
                      </span>
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-2.5 mb-4`}
                    >
                      <feature.icon className="w-full h-full text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 text-sm mb-4">
                      {feature.description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                      <span className="text-xs font-medium">Meer info</span>
                      <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 sm:py-24 md:py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              AI Marketing Workflow
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Geautomatiseerde end-to-end marketing process van research tot
              optimization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-slate-300 mb-4">{step.description}</p>
                <ul className="space-y-1">
                  {step.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm text-slate-400"
                    >
                      <CheckCircle className="w-3 h-3 text-purple-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Waarom MarketingMachine AI?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Cutting-edge AI technologie voor superior marketing results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-3">
                  <benefit.icon className="w-full h-full text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {benefit.stat}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-300 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready voor AI Marketing?
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Transformeer uw marketing met de kracht van artificial intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-sales"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
  );
}

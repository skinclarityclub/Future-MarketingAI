"use client";

import Link from "next/link";
import { motion } from "@/components/ui/motion";
import {
  Zap,
  Settings,
  Activity,
  Users,
  Target,
  ArrowRight,
  Clock,
  Brain,
  Shield,
  BarChart3,
  Workflow,
} from "lucide-react";

export default function CommandCenterPage() {
  const features = [
    {
      icon: Workflow,
      title: "Campaign Orchestration",
      description:
        "Complete campaign management van planning tot execution met automated workflows",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description:
        "Live monitoring van alle marketing activities met instant performance alerts",
    },
    {
      icon: Settings,
      title: "Workflow Automation",
      description:
        "Advanced automation voor repetitive tasks en optimized marketing processes",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Centralized collaboration platform voor marketing teams en departments",
    },
    {
      icon: BarChart3,
      title: "Performance Control",
      description:
        "Real-time performance dashboards met complete campaign oversight",
    },
    {
      icon: Target,
      title: "Strategic Planning",
      description:
        "Strategic marketing planning met goal setting en progress tracking",
    },
  ];

  const metrics = [
    { label: "Campaign Efficiency", value: "+234%", color: "text-cyan-400" },
    { label: "Team Productivity", value: "+167%", color: "text-blue-400" },
    { label: "Process Automation", value: "87%", color: "text-purple-400" },
    { label: "Response Time", value: "-78%", color: "text-emerald-400" },
  ];

  const workflows = [
    {
      name: "Content Creation",
      status: "Active",
      progress: 92,
      color: "bg-emerald-500",
    },
    {
      name: "Social Publishing",
      status: "Running",
      progress: 87,
      color: "bg-blue-500",
    },
    {
      name: "Email Campaigns",
      status: "Scheduled",
      progress: 74,
      color: "bg-purple-500",
    },
    {
      name: "Performance Analysis",
      status: "Live",
      progress: 96,
      color: "bg-cyan-500",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "24/7 Operations",
      description:
        "Round-the-clock marketing operations met automated monitoring",
      stat: "24/7",
    },
    {
      icon: Brain,
      title: "AI Optimization",
      description: "Machine learning voor workflow optimization en performance",
      stat: "AI-Driven",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level beveiliging voor kritieke marketing operations",
      stat: "Secure",
    },
    {
      icon: Zap,
      title: "Lightning Speed",
      description: "Sub-second response times voor instant command execution",
      stat: "<1s",
    },
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
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
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Zap className="w-4 h-4 mr-2" />
                  Command Center
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                  Marketing
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Command Center
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-300 mb-8"
              >
                Ultimate marketing operations control hub met campaign
                orchestration, workflow automation en real-time monitoring voor
                complete marketing excellence.
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
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start command center
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

            {/* Workflow Status */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Live Workflows
              </h3>
              {workflows.map((workflow, index) => (
                <div
                  key={workflow.name}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${workflow.color} mr-3 animate-pulse`}
                      />
                      <span className="text-white font-medium">
                        {workflow.name}
                      </span>
                    </div>
                    <span className="text-cyan-400 text-sm font-medium">
                      {workflow.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Progress</span>
                      <span className="text-white">{workflow.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${workflow.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-2 rounded-full ${workflow.color}`}
                      />
                    </div>
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
              Command Center Results
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Performance verbetering door centralized marketing operations
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
              Complete Operations Control
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Advanced command and control voor superior marketing performance
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
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-3 mb-6">
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
              Mission-Critical Operations
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Enterprise-grade command center voor growing businesses
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
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-3">
                  <benefit.icon className="w-full h-full text-white" />
                </div>
                <div className="text-2xl font-bold text-cyan-400 mb-2">
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
              Command Center Setup
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Van team onboarding tot complete operations command in 4 stappen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Team Integration",
                description:
                  "Onboarding van uw marketing team en system integrations",
              },
              {
                step: "02",
                title: "Workflow Setup",
                description:
                  "Configuratie van automated workflows en campaign templates",
              },
              {
                step: "03",
                title: "Command Config",
                description:
                  "Personalisatie van uw command center interface en controls",
              },
              {
                step: "04",
                title: "Operations Launch",
                description:
                  "Training en go-live van uw marketing command center",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
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
            Take Command of Your Marketing
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Start vandaag met ultimate marketing operations control en zie uw
            efficiency stijgen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-sales"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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

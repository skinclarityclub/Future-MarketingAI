"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadGenerationContactFlow from "@/components/marketing/lead-generation-contact-flow";
import {
  Zap,
  Target,
  Users,
  TrendingUp,
  Award,
  Shield,
  Clock,
  CheckCircle,
  Star,
  Building,
  Globe,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default function LeadGenerationDemoPage() {
  const [selectedPreset, setSelectedPreset] = useState<
    "demo" | "consultation" | "general" | "enterprise"
  >("general");
  const [leadCaptureCount, setLeadCaptureCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  const handleLeadCapture = (leadData: any) => {
    console.log("Lead captured:", leadData);
    setLeadCaptureCount(prev => prev + 1);
    setRecentLeads(prev => [leadData, ...prev.slice(0, 4)]);
  };

  const presetConfigs = {
    demo: {
      title: "Demo Request Form",
      description: "Optimized for booking product demonstrations",
      color: "from-blue-500 to-purple-600",
      icon: <Calendar className="w-5 h-5" />,
      stats: { conversion: "23.4%", leads: "156", avgTime: "2:34" },
    },
    consultation: {
      title: "Consultation Booking",
      description: "Perfect for scheduling expert consultations",
      color: "from-green-500 to-blue-600",
      icon: <Users className="w-5 h-5" />,
      stats: { conversion: "18.7%", leads: "89", avgTime: "3:12" },
    },
    general: {
      title: "General Contact Form",
      description: "Comprehensive form for various inquiries",
      color: "from-purple-500 to-pink-600",
      icon: <Mail className="w-5 h-5" />,
      stats: { conversion: "15.8%", leads: "234", avgTime: "4:45" },
    },
    enterprise: {
      title: "Enterprise Solutions",
      description: "Tailored for large organization needs",
      color: "from-orange-500 to-red-600",
      icon: <Building className="w-5 h-5" />,
      stats: { conversion: "31.2%", leads: "67", avgTime: "6:23" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Lead Generation & Contact Flows
            </h1>
          </div>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Conversion-optimized forms with multi-step flows, real-time
            validation, and seamless CRM integration
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Leads</p>
                  <p className="text-2xl font-bold text-white">2,547</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">
                  +12.5% this month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">21.3%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">
                  +3.2% improvement
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-white">3:47</p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-slate-400">
                  Optimal engagement
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Demo Sessions</p>
                  <p className="text-2xl font-bold text-white">
                    {leadCaptureCount}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-slate-400">Captured today</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preset Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Form Presets & Configurations
              </CardTitle>
              <CardDescription className="text-slate-400">
                Choose from pre-built form configurations optimized for
                different use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(presetConfigs).map(([key, config]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedPreset === key
                          ? "ring-2 ring-blue-400 bg-gradient-to-br from-slate-700/50 to-slate-800/50"
                          : "bg-gradient-to-br from-slate-800/30 to-slate-900/30 hover:from-slate-700/30 hover:to-slate-800/30"
                      } border-slate-600/50`}
                      onClick={() => setSelectedPreset(key as any)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${config.color}`}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm">
                              {config.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              {config.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Conversion:</span>
                            <span className="text-green-400">
                              {config.stats.conversion}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Leads:</span>
                            <span className="text-blue-400">
                              {config.stats.leads}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Avg Time:</span>
                            <span className="text-purple-400">
                              {config.stats.avgTime}
                            </span>
                          </div>
                        </div>

                        {selectedPreset === key && (
                          <div className="mt-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-green-400">
                              Active
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="demo" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="demo" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Live Demo
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Features
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="space-y-6">
              <LeadGenerationContactFlow
                preset={selectedPreset}
                source="demo-page"
                onLeadCapture={handleLeadCapture}
              />
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-8 h-8 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Smart Validation
                      </h3>
                    </div>
                    <p className="text-slate-400 mb-4">
                      Real-time form validation with intelligent error handling
                      and user-friendly feedback
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Email format validation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Phone number formatting
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Required field checking
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-8 h-8 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Multi-Step Flow
                      </h3>
                    </div>
                    <p className="text-slate-400 mb-4">
                      Guided multi-step process that increases completion rates
                      and reduces form abandonment
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Progress tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Step-by-step guidance
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Save & resume later
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-8 h-8 text-purple-400" />
                      <h3 className="text-xl font-semibold text-white">
                        CRM Integration
                      </h3>
                    </div>
                    <p className="text-slate-400 mb-4">
                      Seamless integration with popular CRM platforms and
                      automated lead nurturing workflows
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        HubSpot integration
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Salesforce sync
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Custom webhooks
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="w-8 h-8 text-yellow-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Multiple Channels
                      </h3>
                    </div>
                    <p className="text-slate-400 mb-4">
                      Offer multiple ways for prospects to connect: forms,
                      calendar booking, or live chat
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Contact forms
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Calendar integration
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Live chat widget
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Phone className="w-8 h-8 text-red-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Mobile Optimized
                      </h3>
                    </div>
                    <p className="text-slate-400 mb-4">
                      Fully responsive design with touch-friendly interactions
                      and mobile-first approach
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Touch-friendly UI
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Responsive layout
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Fast loading
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart3 className="w-8 h-8 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Advanced Analytics
                      </h3>
                    </div>
                    <p className="text-slate-400 mb-4">
                      Detailed analytics and insights to optimize conversion
                      rates and form performance
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Conversion tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Drop-off analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        A/B testing
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Recent Lead Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentLeads.length > 0 ? (
                      <div className="space-y-3">
                        {recentLeads.map((lead, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {lead.firstName?.[0] || "U"}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-sm text-slate-400">
                                {lead.company}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-green-400 text-green-400"
                            >
                              New
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No recent leads</p>
                        <p className="text-sm text-slate-500">
                          Complete a form to see activity here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">
                          Form Completion Rate
                        </span>
                        <span className="text-green-400 font-semibold">
                          84.3%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">
                          Average Time to Complete
                        </span>
                        <span className="text-blue-400 font-semibold">
                          3:47
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">
                          Mobile Conversion Rate
                        </span>
                        <span className="text-purple-400 font-semibold">
                          76.8%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">
                          Lead Quality Score
                        </span>
                        <span className="text-yellow-400 font-semibold">
                          92/100
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">
                          Follow-up Success Rate
                        </span>
                        <span className="text-green-400 font-semibold">
                          67.2%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

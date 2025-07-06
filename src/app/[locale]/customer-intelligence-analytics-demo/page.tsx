"use client";

import React from "react";
import {
  Users,
  TrendingUp,
  Heart,
  Ticket,
  AlertTriangle,
  Eye,
  Star,
  Activity,
  Shield,
  Brain,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { CustomerIntelligenceAnalyticsModule } from "@/components/admin/customer-intelligence-analytics-module";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CustomerIntelligenceAnalyticsDemoPage() {
  return (
    <div className="dark min-h-screen bg-gray-900 p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-white">
          Customer Intelligence Analytics Module
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Advanced customer behavior analysis, health monitoring, and engagement
          insights for data-driven customer success
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Admin Dashboard Component
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400">
            Real-time Analytics
          </Badge>
          <Badge
            variant="outline"
            className="text-purple-400 border-purple-400"
          >
            Enterprise Intelligence
          </Badge>
        </div>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg text-white">
                User Analytics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-3">
              Comprehensive user activity tracking with adoption metrics
            </p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• Daily/Weekly/Monthly Active Users</li>
              <li>• Feature Adoption Analysis</li>
              <li>• User Activation Metrics</li>
              <li>• Time-to-Value Tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-green-400" />
              <CardTitle className="text-lg text-white">
                Health Monitoring
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-3">
              Real-time customer health scoring and risk assessment
            </p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• Overall Health Score (1-10)</li>
              <li>• Health Distribution Analysis</li>
              <li>• Risk Categorization</li>
              <li>• Health Trend Monitoring</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-lg text-white">
                Support Analytics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-3">
              Comprehensive support ticket analysis and satisfaction tracking
            </p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• Open Ticket Management</li>
              <li>• Resolution Time Analysis</li>
              <li>• Customer Satisfaction Scores</li>
              <li>• Escalation Monitoring</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <CardTitle className="text-lg text-white">
                Churn Prevention
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-3">
              Predictive churn analysis with prevention recommendations
            </p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• Churn Rate Monitoring</li>
              <li>• Predictive Risk Scoring</li>
              <li>• Revenue Impact Analysis</li>
              <li>• Prevention Success Tracking</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Status */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Implementation Status
          </CardTitle>
          <CardDescription className="text-gray-400">
            Current development status and completed features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">
                ✅ Completed Features
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  5-Tab Interface (Overview, Users, Health, Support, Churn)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Real-time Data Integration Framework
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Customer Health Scoring & Risk Assessment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Support Ticket Analytics & Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Customer Segmentation Visualization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Churn Prediction & Prevention Metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Anomaly Detection & Alerting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Interactive Charts & Data Visualization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Export & Time Range Filtering
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Dark Theme Enterprise UI Design
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">
                🔄 Integration Points
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  Customer Intelligence Engine Integration
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  Churn Prediction Engine Connection
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  RBAC Security Framework Compatible
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Real-time Data Aggregator Integration
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-400" />
                  Customer Segmentation Service Connected
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                  Analytics Dashboard Framework
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white">Key Performance Metrics</CardTitle>
          <CardDescription className="text-gray-400">
            Real-time customer intelligence metrics and business impact
            indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Users</span>
                <span className="text-white font-bold">9,654</span>
              </div>
              <Progress value={85} className="h-2" />
              <span className="text-xs text-green-400">+12.3% growth</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Health Score</span>
                <span className="text-white font-bold">8.4/10</span>
              </div>
              <Progress value={84} className="h-2" />
              <span className="text-xs text-green-400">+2.1% improvement</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Support Satisfaction</span>
                <span className="text-white font-bold">4.6/5</span>
              </div>
              <Progress value={92} className="h-2" />
              <span className="text-xs text-blue-400">Excellent rating</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Churn Risk</span>
                <span className="text-white font-bold">2.3%</span>
              </div>
              <Progress value={23} className="h-2" />
              <span className="text-xs text-orange-400">152 predicted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Architecture */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white">Technical Architecture</CardTitle>
          <CardDescription className="text-gray-400">
            System architecture and data flow for customer intelligence
            analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                Data Sources
              </h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Customer Intelligence Database</li>
                <li>• Support Ticket System</li>
                <li>• User Activity Tracking</li>
                <li>• Churn Prediction Engine</li>
                <li>• Customer Segmentation Service</li>
                <li>• Health Monitoring System</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Real-time Engine
              </h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• AdminDashboardDataAggregator</li>
                <li>• Customer Intelligence Realtime Hook</li>
                <li>• WebSocket Connections</li>
                <li>• Server-Sent Events (SSE)</li>
                <li>• Automatic Refresh System</li>
                <li>• Connection Status Monitoring</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                Visualization
              </h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Interactive Recharts Integration</li>
                <li>• Composed Chart Analytics</li>
                <li>• Pie Chart Segmentation</li>
                <li>• Real-time Progress Indicators</li>
                <li>• Trend Line Visualizations</li>
                <li>• Export & Filtering Capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Characteristics */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white">
            Performance Characteristics
          </CardTitle>
          <CardDescription className="text-gray-400">
            System performance metrics and operational capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <Clock className="h-8 w-8 text-blue-400 mx-auto" />
              <div className="text-2xl font-bold text-white">&lt; 500ms</div>
              <div className="text-sm text-gray-400">
                Real-time Update Latency
              </div>
            </div>
            <div className="text-center space-y-2">
              <Activity className="h-8 w-8 text-green-400 mx-auto" />
              <div className="text-2xl font-bold text-white">30s</div>
              <div className="text-sm text-gray-400">
                Dashboard Refresh Interval
              </div>
            </div>
            <div className="text-center space-y-2">
              <Users className="h-8 w-8 text-purple-400 mx-auto" />
              <div className="text-2xl font-bold text-white">9,654</div>
              <div className="text-sm text-gray-400">Customers Monitored</div>
            </div>
            <div className="text-center space-y-2">
              <BarChart3 className="h-8 w-8 text-orange-400 mx-auto" />
              <div className="text-2xl font-bold text-white">5</div>
              <div className="text-sm text-gray-400">Analytics Modules</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Demo */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            Live Customer Intelligence Analytics Module
          </CardTitle>
          <CardDescription className="text-gray-400">
            Interactive demonstration with real-time data simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-gray-700">
            <CustomerIntelligenceAnalyticsModule />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-700">
        <p className="text-gray-400">
          Customer Intelligence Analytics Module - Part of the SKC BI Dashboard
          Admin Command Center
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Built with Next.js 14, TypeScript, TailwindCSS, and Recharts •
          Enterprise Analytics Platform
        </p>
      </div>
    </div>
  );
}

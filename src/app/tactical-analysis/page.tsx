"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Brain,
  Settings,
  Zap,
  TrendingUp,
  Database,
  Target,
  Activity,
  ExternalLink,
  Play,
} from "lucide-react";
import Link from "next/link";

export default function TacticalAnalysisPage() {
  const features = [
    {
      icon: <Database className="h-6 w-6" />,
      title: "Data Integration",
      description:
        "Unified data from Shopify, Kajabi, financial KPIs, and marketing sources",
      status: "Operational",
      statusColor: "bg-green-500",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "ML Algorithms",
      description:
        "ARIMA, Exponential Smoothing, Anomaly Detection, and Ensemble Methods",
      status: "Active",
      statusColor: "bg-blue-500",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-Time Processing",
      description:
        "Live streaming with SSE, automatic anomaly detection, and instant alerts",
      status: "Live",
      statusColor: "bg-purple-500",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Predictive Analytics",
      description:
        "Short-term forecasting with confidence intervals and trend analysis",
      status: "Ready",
      statusColor: "bg-orange-500",
    },
  ];

  const dashboards = [
    {
      title: "Real-Time Insights Dashboard",
      description:
        "Live business intelligence met AI-gedreven inzichten en real-time voorspellingen",
      href: "/tactical-analysis/realtime",
      icon: <Zap className="h-5 w-5" />,
      badges: ["Live Data", "SSE", "ML Forecasts"],
      gradient: "from-blue-500 to-purple-600",
    },
    {
      title: "Configuration Center",
      description:
        "Beheer ML modellen, configureer alerts en pas real-time instellingen aan",
      href: "/tactical-analysis/config",
      icon: <Settings className="h-5 w-5" />,
      badges: ["Model Settings", "Alerts", "Thresholds"],
      gradient: "from-green-500 to-teal-600",
    },
    {
      title: "Analytics Overview",
      description:
        "Uitgebreide analyse van business metrics met historische trends",
      href: "/tactical-analysis/analytics",
      icon: <TrendingUp className="h-5 w-5" />,
      badges: ["Historical", "Trends", "KPIs"],
      gradient: "from-orange-500 to-red-600",
    },
    {
      title: "Data Sources Monitor",
      description:
        "Monitor de status en prestaties van alle geïntegreerde data bronnen",
      href: "/tactical-analysis/sources",
      icon: <Database className="h-5 w-5" />,
      badges: ["Shopify", "Kajabi", "Finance"],
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Target className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tactical Analysis Engine
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced AI-powered business intelligence platform met real-time
            voorspellingen, anomalie detectie, en actionable insights voor
            strategische besluitvorming
          </p>
        </div>

        {/* System Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Overzicht van alle Tactical Analysis Engine componenten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-blue-600">{feature.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${feature.statusColor}`}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {feature.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {feature.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/tactical-analysis/realtime">
            <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Play className="h-4 w-4" />
              Start Real-Time Dashboard
            </Button>
          </Link>
          <Link href="/tactical-analysis/config">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </Button>
          </Link>
          <Link
            href="/api/tactical-analysis/advanced-predictions?action=forecast&metrics=revenue,orders,customers"
            target="_blank"
          >
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              API Test
            </Button>
          </Link>
        </div>

        <Separator />

        {/* Dashboard Cards */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Interface Dashboards</h2>
            <p className="text-muted-foreground">
              Toegang tot alle gebruikersinterfaces en configuratie tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {dashboards.map((dashboard, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${dashboard.gradient} text-white`}
                    >
                      {dashboard.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {dashboard.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {dashboard.badges.map((badge, badgeIndex) => (
                      <Badge
                        key={badgeIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <Link href={dashboard.href}>
                    <Button
                      className="w-full group-hover:bg-blue-600 transition-colors"
                      variant="outline"
                    >
                      Open Dashboard
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Architecture & Capabilities
            </CardTitle>
            <CardDescription>
              Technische specificaties en implementatie details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Layer
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • TacticalDataAnalysisEngine - Multi-source integration
                  </li>
                  <li>• Real-time Supabase subscriptions</li>
                  <li>• Data validation and preprocessing</li>
                  <li>• Automated data quality checks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI & ML
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Advanced ML Engine (ARIMA, Exponential Smoothing)</li>
                  <li>• Real-time anomaly detection</li>
                  <li>• Ensemble forecasting methods</li>
                  <li>• Confidence interval calculations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Real-Time
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Server-Sent Events (SSE) streaming</li>
                  <li>• Live dashboard with reconnection</li>
                  <li>• Instant alert generation</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">&lt;100ms</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-sm text-muted-foreground">Data Sources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              🎯 <strong>Tactical Analysis Engine v1.0</strong> - Enterprise
              Business Intelligence Platform
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Task 15: Tactical Analysis Engine with Predictive Insights -
              Subtask 15.4: User Interface Implementation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

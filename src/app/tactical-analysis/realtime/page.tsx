import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Brain,
  BarChart3,
  TrendingUp,
  Zap,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import RealtimeInsightsDashboard from "@/components/tactical-analysis/real-time-insights-dashboard";
import Link from "next/link";

export default function RealtimeTacticalAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Zap className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real-Time Tactical Analysis
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Live business intelligence dashboard met AI-gedreven inzichten,
            real-time voorspellingen en automatische waarschuwingen
          </p>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Machine learning algoritmes analyseren real-time data patronen
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  ARIMA
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Exponential Smoothing
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Anomaly Detection
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Live Forecasting</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Voorspellingen voor komend uur, dag en week
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  Short-term
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Confidence Intervals
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Trends
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Smart Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Automatische detectie van afwijkingen en trends
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  Anomalies
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Thresholds
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Actions
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Demo Modus</AlertTitle>
            <AlertDescription>
              Deze dashboard is verbonden met de Server-Sent Events (SSE)
              endpoint. Echte data wordt gestreamd van de Tactical Real-Time
              Engine.
            </AlertDescription>
          </Alert>

          <Alert>
            <Activity className="h-4 w-4" />
            <AlertTitle>Data Bronnen</AlertTitle>
            <AlertDescription>
              Live integratie met Shopify, Kajabi, financiële KPI&apos;s en
              marketing data. Gegevens worden elke 30 seconden bijgewerkt.
            </AlertDescription>
          </Alert>
        </div>

        {/* Technical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Technische Specificaties
            </CardTitle>
            <CardDescription>
              Architectuur en implementatie details van het real-time systeem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Backend Components</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    TacticalRealtimeEngine - Core processing engine
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    AdvancedMLEngine - Machine learning algorithms
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    SSE Endpoint - Real-time data streaming
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Supabase Integration - Database real-time subscriptions
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Frontend Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Real-time connection with automatic reconnection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Live data visualization with progress indicators
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    Severity-based alert categorization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    Actionable recommendations and insights
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/tactical-analysis">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Tactical Analysis Overview
            </Button>
          </Link>
          <Link
            href="/api/tactical-realtime/sse?clientId=demo&channels=insights,alerts,forecasts&token=demo-token-123"
            target="_blank"
          >
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View SSE Stream
            </Button>
          </Link>
          <Link href="/tactical-analysis-demo">
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              Demo Page
            </Button>
          </Link>
        </div>

        <Separator />

        {/* Main Dashboard Component */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Live Dashboard</h2>
            <p className="text-muted-foreground">
              Gebruik de schakelaar hieronder om de real-time verbinding te
              starten
            </p>
          </div>

          <Suspense
            fallback={
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-muted-foreground">
                      Loading real-time dashboard...
                    </span>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <RealtimeInsightsDashboard />
          </Suspense>
        </div>

        {/* Footer */}
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              🚀 <strong>Tactical Analysis Engine v1.0</strong> - Powered by
              Next.js 14, TypeScript, Supabase, and Advanced ML Algorithms
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Subtask 15.3: Real-Time Data Processing and Analysis
              Implementation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

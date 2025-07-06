"use client";

import { Suspense, use, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  Activity,
  Send,
  Webhook,
} from "lucide-react";

interface WebhookManagementPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function WebhookManagementPage({
  params,
}: WebhookManagementPageProps) {
  const { locale } = use(params);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            n8n Webhook Management
          </h1>
          <p className="text-muted-foreground">
            Beheer bidirectionele webhook communicatie tussen n8n workflows en
            het dashboard
          </p>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Suspense
            fallback={
              <div className="h-24 animate-pulse bg-muted rounded-lg" />
            }
          >
            <StatusCard
              title="Aktieve Endpoints"
              value="12"
              icon={<Webhook className="h-5 w-5" />}
              status="success"
              change="+2 deze week"
            />
          </Suspense>
          <Suspense
            fallback={
              <div className="h-24 animate-pulse bg-muted rounded-lg" />
            }
          >
            <StatusCard
              title="Recent Events"
              value="156"
              icon={<Activity className="h-5 w-5" />}
              status="active"
              change="Laatste 24u"
            />
          </Suspense>
          <Suspense
            fallback={
              <div className="h-24 animate-pulse bg-muted rounded-lg" />
            }
          >
            <StatusCard
              title="Workflow Triggers"
              value="8"
              icon={<Zap className="h-5 w-5" />}
              status="warning"
              change="3 pending"
            />
          </Suspense>
          <Suspense
            fallback={
              <div className="h-24 animate-pulse bg-muted rounded-lg" />
            }
          >
            <StatusCard
              title="Success Rate"
              value="98.5%"
              icon={<CheckCircle className="h-5 w-5" />}
              status="success"
              change="+0.2% dit uur"
            />
          </Suspense>
        </div>

        {/* Main Tabs Interface */}
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/50 backdrop-blur-sm border shadow-sm">
            <TabsTrigger value="endpoints" className="space-x-2">
              <Settings className="h-4 w-4" />
              <span>Endpoints</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="space-x-2">
              <Activity className="h-4 w-4" />
              <span>Event Log</span>
            </TabsTrigger>
            <TabsTrigger value="triggers" className="space-x-2">
              <Zap className="h-4 w-4" />
              <span>Triggers</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="space-x-2">
              <Send className="h-4 w-4" />
              <span>Testing</span>
            </TabsTrigger>
          </TabsList>

          {/* Webhook Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Suspense
                  fallback={
                    <div className="h-96 animate-pulse bg-muted rounded-lg" />
                  }
                >
                  <WebhookEndpointsList locale={locale} />
                </Suspense>
              </div>
              <div>
                <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Nieuw Endpoint
                    </CardTitle>
                    <CardDescription>
                      Configureer een nieuw webhook endpoint
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="endpoint-name">Naam</Label>
                      <Input
                        id="endpoint-name"
                        placeholder="Bijv. Content Workflow Hook"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endpoint-url">URL</Label>
                      <Input
                        id="endpoint-url"
                        placeholder="https://your-n8n.com/webhook/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endpoint-method">HTTP Method</Label>
                      <Select defaultValue="POST">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="endpoint-active"
                        checked={true}
                        onCheckedChange={checked =>
                          console.log("Switch toggled:", checked)
                        }
                      />
                      <Label htmlFor="endpoint-active">Actief</Label>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Endpoint Toevoegen
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Event Log Tab */}
          <TabsContent value="events" className="space-y-4">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse bg-muted rounded-lg" />
              }
            >
              <WebhookEventLog locale={locale} />
            </Suspense>
          </TabsContent>

          {/* Workflow Triggers Tab */}
          <TabsContent value="triggers" className="space-y-4">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse bg-muted rounded-lg" />
              }
            >
              <WorkflowTriggerManager locale={locale} />
            </Suspense>
          </TabsContent>

          {/* Testing Interface Tab */}
          <TabsContent value="testing" className="space-y-4">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse bg-muted rounded-lg" />
              }
            >
              <WebhookTestingInterface locale={locale} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status: "success" | "warning" | "error" | "active";
  change?: string;
}

function StatusCard({ title, value, icon, status, change }: StatusCardProps) {
  const statusColors = {
    success: "text-green-600 bg-green-50 border-green-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    error: "text-red-600 bg-red-50 border-red-200",
    active: "text-blue-600 bg-blue-50 border-blue-200",
  };

  const statusIcons = {
    success: <CheckCircle className="h-4 w-4" />,
    warning: <Clock className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    active: <Activity className="h-4 w-4" />,
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusColors[status]}`}
              >
                {statusIcons[status]}
                {change}
              </div>
            )}
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholder components that will be loaded
function WebhookEndpointsList({ locale }: { locale: string }) {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Webhook Endpoints
        </CardTitle>
        <CardDescription>
          Beheer en monitor uw webhook endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mock endpoints */}
          {[
            {
              id: 1,
              name: "Content Workflow Hook",
              url: "https://n8n.skc.com/webhook/content",
              status: "active",
              method: "POST",
            },
            {
              id: 2,
              name: "Analytics Trigger",
              url: "https://n8n.skc.com/webhook/analytics",
              status: "active",
              method: "POST",
            },
            {
              id: 3,
              name: "User Action Hook",
              url: "https://n8n.skc.com/webhook/user-action",
              status: "inactive",
              method: "POST",
            },
          ].map(endpoint => (
            <div
              key={endpoint.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-white/40"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{endpoint.name}</h3>
                  <Badge
                    variant={
                      endpoint.status === "active" ? "default" : "secondary"
                    }
                  >
                    {endpoint.status}
                  </Badge>
                  <Badge variant="outline">{endpoint.method}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{endpoint.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={endpoint.status === "active"}
                  onCheckedChange={checked =>
                    console.log("Endpoint toggled:", checked)
                  }
                />
                <Button variant="outline" size="sm">
                  Bewerken
                </Button>
                <Button variant="destructive" size="sm">
                  Verwijderen
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookEventLog({ locale }: { locale: string }) {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Event Log
        </CardTitle>
        <CardDescription>
          Real-time webhook events en hun status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Mock events */}
          {[
            {
              id: 1,
              timestamp: "2024-01-20 10:30:15",
              event: "Content Published",
              status: "success",
              endpoint: "Content Workflow Hook",
            },
            {
              id: 2,
              timestamp: "2024-01-20 10:28:42",
              event: "User Registration",
              status: "success",
              endpoint: "User Action Hook",
            },
            {
              id: 3,
              timestamp: "2024-01-20 10:25:10",
              event: "Analytics Update",
              status: "failed",
              endpoint: "Analytics Trigger",
            },
            {
              id: 4,
              timestamp: "2024-01-20 10:22:33",
              event: "Content Updated",
              status: "success",
              endpoint: "Content Workflow Hook",
            },
          ].map(event => (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 border-l-4 border-l-blue-200 bg-white/40 rounded-r-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{event.event}</span>
                  <Badge
                    variant={
                      event.status === "success" ? "default" : "destructive"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.endpoint}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {event.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowTriggerManager({ locale }: { locale: string }) {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Workflow Triggers
        </CardTitle>
        <CardDescription>
          Trigger n8n workflows handmatig vanuit het dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mock workflows */}
          {[
            {
              id: 1,
              name: "Content Analysis Workflow",
              description: "Analyseert content performance",
              status: "ready",
            },
            {
              id: 2,
              name: "User Onboarding Flow",
              description: "Automatische user onboarding",
              status: "running",
            },
            {
              id: 3,
              name: "Weekly Report Generator",
              description: "Genereert wekelijkse rapporten",
              status: "ready",
            },
            {
              id: 4,
              name: "Data Sync Process",
              description: "Synchroniseert externe data",
              status: "ready",
            },
          ].map(workflow => (
            <div
              key={workflow.id}
              className="p-4 border rounded-lg bg-white/40 space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{workflow.name}</h3>
                  <Badge
                    variant={
                      workflow.status === "running" ? "default" : "secondary"
                    }
                  >
                    {workflow.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {workflow.description}
                </p>
              </div>
              <Button
                className="w-full"
                disabled={workflow.status === "running"}
                variant={
                  workflow.status === "running" ? "secondary" : "default"
                }
              >
                {workflow.status === "running"
                  ? "Running..."
                  : "Trigger Workflow"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookTestingInterface({ locale }: { locale: string }) {
  const [testPayload, setTestPayload] = useState(
    '{\n  "event": "test",\n  "data": {\n    "message": "Hello from dashboard"\n  }\n}'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Outgoing Test */}
      <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Uitgaande Test
          </CardTitle>
          <CardDescription>Test webhook berichten naar n8n</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-endpoint">Doel Endpoint</Label>
            <Select defaultValue="content-hook">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content-hook">
                  Content Workflow Hook
                </SelectItem>
                <SelectItem value="analytics-trigger">
                  Analytics Trigger
                </SelectItem>
                <SelectItem value="user-action">User Action Hook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-payload">Test Payload (JSON)</Label>
            <Textarea
              id="test-payload"
              value={testPayload}
              onChange={e => setTestPayload(e.target.value)}
              className="font-mono text-sm h-32"
            />
          </div>
          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            Verstuur Test Webhook
          </Button>
        </CardContent>
      </Card>

      {/* Incoming Test */}
      <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Inkomende Test
          </CardTitle>
          <CardDescription>Monitor inkomende webhooks van n8n</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Test Endpoint URL</Label>
            <Input
              value="https://dashboard.skc.com/api/webhooks/n8n/test"
              readOnly
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Laatste Inkomende Payload</Label>
            <Textarea
              value='{\n  "timestamp": "2024-01-20T10:30:15Z",\n  "workflow": "content-analysis",\n  "status": "completed",\n  "result": {\n    "score": 85,\n    "recommendations": ["SEO optimization"]\n  }\n}'
              readOnly
              className="font-mono text-sm h-32 bg-muted"
            />
          </div>
          <Button variant="outline" className="w-full">
            Ververs Laatste Payload
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

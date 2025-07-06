"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Webhook,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Eye,
  Trash2,
  Plus,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface WebhookRegistration {
  id: string;
  team_id: string;
  endpoint: string;
  events: string[];
  status: "active" | "inactive" | "failed";
  fail_count: number;
  last_ping_at?: string;
  created_at: string;
}

interface WebhookEvent {
  id: string;
  webhook_id: string;
  event_type: string;
  processing_status: "pending" | "processing" | "completed" | "failed";
  sync_triggered: boolean;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

interface WebhookHealth {
  total_events: number;
  successful_events: number;
  failed_events: number;
  success_rate: number;
  last_event_at?: string;
}

interface WebhookStats {
  webhook_id: string;
  total_events: number;
  successful_events: number;
  failed_events: number;
  pending_events: number;
  sync_triggered_events: number;
  success_rate_percent: number;
  avg_processing_time_seconds?: number;
}

const AVAILABLE_EVENTS = [
  "taskCreated",
  "taskUpdated",
  "taskDeleted",
  "taskStatusUpdated",
  "taskPriorityUpdated",
  "taskAssigneeUpdated",
  "taskDueDateUpdated",
  "listCreated",
  "listUpdated",
  "listDeleted",
  "taskCommentPosted",
  "taskTimeTrackedUpdated",
];

export function ClickUpWebhookDashboard() {
  const [webhooks, setWebhooks] = useState<WebhookRegistration[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [health, setHealth] = useState<Record<string, WebhookHealth>>({});
  const [stats, setStats] = useState<WebhookStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);

  // New webhook form state
  const [showNewWebhookForm, setShowNewWebhookForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    team_id: "",
    endpoint: "",
    events: [] as string[],
    secret: "",
  });

  useEffect(() => {
    loadWebhooks();
    loadRecentEvents();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);

      // Get list of webhooks (this would need team_id from user settings)
      const response = await fetch(
        "/api/clickup/webhooks?action=list_webhooks&team_id=placeholder"
      );
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);

        // Load health for each webhook
        for (const webhook of data.webhooks || []) {
          loadWebhookHealth(webhook.id);
        }
      }
    } catch (error) {
      console.error("Error loading webhooks:", error);
      toast.error("Fout bij laden van webhooks");
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookHealth = async (webhookId: string) => {
    try {
      const response = await fetch(
        `/api/clickup/webhooks?action=webhook_health&webhook_id=${webhookId}`
      );
      if (response.ok) {
        const data = await response.json();
        setHealth(prev => ({
          ...prev,
          [webhookId]: data.health,
        }));
      }
    } catch (error) {
      console.error("Error loading webhook health:", error);
    }
  };

  const loadRecentEvents = async () => {
    try {
      const response = await fetch(
        "/api/clickup/webhooks?action=event_logs&limit=50"
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.event_logs || []);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const registerWebhook = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/clickup/webhooks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWebhook),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Webhook succesvol geregistreerd");
        setShowNewWebhookForm(false);
        setNewWebhook({ team_id: "", endpoint: "", events: [], secret: "" });
        loadWebhooks();
      } else {
        const error = await response.json();
        toast.error(`Fout bij registreren webhook: ${error.message}`);
      }
    } catch (error) {
      console.error("Error registering webhook:", error);
      toast.error("Fout bij registreren webhook");
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(
        `/api/clickup/webhooks?webhook_id=${webhookId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Webhook succesvol verwijderd");
        loadWebhooks();
      } else {
        const error = await response.json();
        toast.error(`Fout bij verwijderen webhook: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Fout bij verwijderen webhook");
    }
  };

  const testEndpoint = async () => {
    try {
      const response = await fetch(
        "/api/clickup/webhooks?action=endpoint_test"
      );
      if (response.ok) {
        const data = await response.json();
        toast.success("Webhook endpoint is bereikbaar");
      } else {
        toast.error("Webhook endpoint niet bereikbaar");
      }
    } catch (error) {
      console.error("Error testing endpoint:", error);
      toast.error("Fout bij testen endpoint");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getProcessingStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Zojuist";
    if (diffMins < 60) return `${diffMins}m geleden`;
    if (diffHours < 24) return `${diffHours}u geleden`;
    return `${diffDays}d geleden`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Webhook className="h-8 w-8 text-blue-600" />
              ClickUp Webhook Beheer
            </h1>
            <p className="text-slate-600 mt-2">
              Beheer real-time integraties en monitor webhook events
            </p>
          </div>
          <div className="flex gap-3">
            <NormalButton
              onClick={testEndpoint}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Test Endpoint
            </NormalButton>
            <NormalButton
              onClick={() => setShowNewWebhookForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nieuwe Webhook
            </NormalButton>
          </div>
        </div>

        {/* New Webhook Form */}
        {showNewWebhookForm && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle>Nieuwe Webhook Registreren</CardTitle>
              <CardDescription>
                Registreer een nieuwe webhook voor real-time ClickUp updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team_id">Team/Workspace ID</Label>
                  <Input
                    id="team_id"
                    value={newWebhook.team_id}
                    onChange={e =>
                      setNewWebhook(prev => ({
                        ...prev,
                        team_id: e.target.value,
                      }))
                    }
                    placeholder="Voer ClickUp team ID in"
                  />
                </div>
                <div>
                  <Label htmlFor="endpoint">Webhook Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={newWebhook.endpoint}
                    onChange={e =>
                      setNewWebhook(prev => ({
                        ...prev,
                        endpoint: e.target.value,
                      }))
                    }
                    placeholder="https://jouw-domein.com/api/clickup/webhooks"
                  />
                </div>
              </div>

              <div>
                <Label>Event Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewWebhook(prev => ({
                              ...prev,
                              events: [...prev.events, event],
                            }));
                          } else {
                            setNewWebhook(prev => ({
                              ...prev,
                              events: prev.events.filter(e => e !== event),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="secret">Webhook Secret (optioneel)</Label>
                <Input
                  id="secret"
                  type="password"
                  value={newWebhook.secret}
                  onChange={e =>
                    setNewWebhook(prev => ({ ...prev, secret: e.target.value }))
                  }
                  placeholder="Geheime sleutel voor verificatie"
                />
              </div>

              <div className="flex gap-2">
                <NormalButton
                  onClick={registerWebhook}
                  disabled={
                    loading ||
                    !newWebhook.team_id ||
                    !newWebhook.endpoint ||
                    newWebhook.events.length === 0
                  }
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Registreren
                </NormalButton>
                <NormalButton
                  onClick={() => setShowNewWebhookForm(false)}
                  variant="outline"
                >
                  Annuleren
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="webhooks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="webhooks">Webhook Registraties</TabsTrigger>
            <TabsTrigger value="events">Recent Events</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <div className="grid gap-4">
              {webhooks.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Geen webhooks
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Registreer je eerste webhook om real-time updates te
                        ontvangen
                      </p>
                      <NormalButton onClick={() => setShowNewWebhookForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nieuwe Webhook
                      </NormalButton>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                webhooks.map(webhook => (
                  <Card
                    key={webhook.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Webhook className="h-5 w-5" />
                            {webhook.endpoint}
                            <Badge
                              variant={getStatusBadgeVariant(webhook.status)}
                            >
                              {webhook.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Team: {webhook.team_id} • Geregistreerd:{" "}
                            {formatRelativeTime(webhook.created_at)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <NormalButton
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedWebhook(webhook.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </NormalButton>
                          <NormalButton
                            size="sm"
                            variant="outline"
                            onClick={() => deleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </NormalButton>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            Subscribed Events:
                          </Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {webhook.events.map(event => (
                              <Badge
                                key={event}
                                variant="secondary"
                                className="text-xs"
                              >
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {health[webhook.id] && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {health[webhook.id].total_events}
                              </div>
                              <div className="text-xs text-gray-500">
                                Total Events
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {health[webhook.id].successful_events}
                              </div>
                              <div className="text-xs text-gray-500">
                                Successful
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {health[webhook.id].failed_events}
                              </div>
                              <div className="text-xs text-gray-500">
                                Failed
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {health[webhook.id].success_rate.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                Success Rate
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Webhook Events</CardTitle>
                    <CardDescription>
                      Laatste 50 ontvangen webhook events
                    </CardDescription>
                  </div>
                  <NormalButton
                    onClick={loadRecentEvents}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </NormalButton>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {events.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getProcessingStatusIcon(event.processing_status)}
                        <div>
                          <div className="font-medium">{event.event_type}</div>
                          <div className="text-sm text-gray-500">
                            {formatRelativeTime(event.created_at)}
                            {event.sync_triggered && (
                              <Badge variant="outline" className="ml-2">
                                <Zap className="h-3 w-3 mr-1" />
                                Sync Triggered
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            event.processing_status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {event.processing_status}
                        </Badge>
                        {event.error_message && (
                          <div className="text-xs text-red-500 mt-1">
                            {event.error_message.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Geen events
                      </h3>
                      <p className="text-gray-500">
                        Webhook events verschijnen hier zodra ze ontvangen
                        worden
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Webhook Performance
                  </CardTitle>
                  <CardDescription>
                    Overzicht van webhook prestaties en betrouwbaarheid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Webhook Monitoring</AlertTitle>
                    <AlertDescription>
                      Monitoring statistieken worden hier getoond zodra er
                      webhook activiteit is. Gebruik de andere tabs om webhooks
                      te registreren en events te bekijken.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

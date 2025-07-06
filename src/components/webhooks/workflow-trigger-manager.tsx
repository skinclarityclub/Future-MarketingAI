"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Zap, Play, Pause, Settings2, Plus } from "lucide-react";

interface WorkflowTrigger {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerType: "webhook" | "schedule" | "manual" | "event";
  conditions: Record<string, any>;
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

interface WorkflowTriggerManagerProps {
  locale: string;
}

export function WorkflowTriggerManager({
  locale,
}: WorkflowTriggerManagerProps) {
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    workflowId: "",
    workflowName: "",
    triggerType: "webhook" as const,
    conditions: "{}",
    enabled: true,
  });

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      const response = await fetch("/api/webhooks/triggers");
      if (response.ok) {
        const data = await response.json();
        setTriggers(data);
      }
    } catch (error) {
      console.error("Error fetching workflow triggers:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrigger = async (triggerId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/triggers/${triggerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setTriggers(prev =>
          prev.map(trigger =>
            trigger.id === triggerId ? { ...trigger, enabled } : trigger
          )
        );
      }
    } catch (error) {
      console.error("Error toggling trigger:", error);
    }
  };

  const executeTrigger = async (triggerId: string) => {
    try {
      const response = await fetch(
        `/api/webhooks/triggers/${triggerId}/execute`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Trigger executed:", result);
        // Refresh triggers to update counts
        fetchTriggers();
      }
    } catch (error) {
      console.error("Error executing trigger:", error);
    }
  };

  const createTrigger = async () => {
    try {
      const response = await fetch("/api/webhooks/triggers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTrigger,
          conditions: JSON.parse(newTrigger.conditions || "{}"),
        }),
      });

      if (response.ok) {
        const trigger = await response.json();
        setTriggers(prev => [...prev, trigger]);
        setShowCreateForm(false);
        setNewTrigger({
          workflowId: "",
          workflowName: "",
          triggerType: "webhook",
          conditions: "{}",
          enabled: true,
        });
      }
    } catch (error) {
      console.error("Error creating trigger:", error);
    }
  };

  const getTriggerTypeColor = (type: string) => {
    switch (type) {
      case "webhook":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "schedule":
        return "bg-green-50 text-green-700 border-green-200";
      case "manual":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "event":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle>Workflow Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Workflow Triggers
            </CardTitle>
            <NormalButton
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Trigger
            </NormalButton>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.map(trigger => (
              <div
                key={trigger.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white/40"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getTriggerTypeColor(trigger.triggerType)}>
                      {trigger.triggerType}
                    </Badge>
                    <Switch
                      checked={trigger.enabled}
                      onCheckedChange={checked =>
                        toggleTrigger(trigger.id, checked)
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {trigger.workflowName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Workflow ID: {trigger.workflowId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trigger.triggerCount} triggers •{" "}
                      {trigger.lastTriggered
                        ? `Laatst: ${new Date(trigger.lastTriggered).toLocaleDateString()}`
                        : "Nog niet uitgevoerd"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <NormalButton
                    variant="outline"
                    size="sm"
                    onClick={() => executeTrigger(trigger.id)}
                    disabled={!trigger.enabled}
                  >
                    <Play className="h-4 w-4" />
                  </NormalButton>
                  <NormalButton variant="ghost" size="sm">
                    <Settings2 className="h-4 w-4" />
                  </NormalButton>
                </div>
              </div>
            ))}
            {triggers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Geen workflow triggers geconfigureerd
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
          <CardHeader>
            <CardTitle>Nieuwe Workflow Trigger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-id">Workflow ID</Label>
                <Input
                  id="workflow-id"
                  value={newTrigger.workflowId}
                  onChange={e =>
                    setNewTrigger(prev => ({
                      ...prev,
                      workflowId: e.target.value,
                    }))
                  }
                  placeholder="bijv. content-generation-workflow"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Workflow Naam</Label>
                <Input
                  id="workflow-name"
                  value={newTrigger.workflowName}
                  onChange={e =>
                    setNewTrigger(prev => ({
                      ...prev,
                      workflowName: e.target.value,
                    }))
                  }
                  placeholder="bijv. Content Generation"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditions">Trigger Condities (JSON)</Label>
              <Textarea
                id="conditions"
                value={newTrigger.conditions}
                onChange={e =>
                  setNewTrigger(prev => ({
                    ...prev,
                    conditions: e.target.value,
                  }))
                }
                placeholder='{"event": "content_request", "priority": "high"}'
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="trigger-enabled"
                checked={newTrigger.enabled}
                onCheckedChange={checked =>
                  setNewTrigger(prev => ({ ...prev, enabled: checked }))
                }
              />
              <Label htmlFor="trigger-enabled">Direct activeren</Label>
            </div>
            <div className="flex gap-2">
              <NormalButton
                onClick={createTrigger}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                Trigger Aanmaken
              </NormalButton>
              <NormalButton
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Annuleren
              </NormalButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface WebhookEvent {
  id: string;
  workflowId: string;
  eventType: string;
  timestamp: string;
  source: "n8n" | "dashboard";
  status: "pending" | "processed" | "failed";
  retryCount: number;
  payload: Record<string, any>;
  errorMessage?: string;
}

interface WebhookEventLogProps {
  locale: string;
}

export function WebhookEventLog({ locale }: WebhookEventLogProps) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
    // Set up polling for real-time updates
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/webhooks/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching webhook events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.workflowId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    const matchesSource =
      sourceFilter === "all" || event.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-50 text-green-700 border-green-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle>Webhook Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Webhook Event Log
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op workflow ID of event type..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Bronnen</SelectItem>
                <SelectItem value="n8n">n8n</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white/40"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(event.status)}
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {event.workflowId}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.source}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {event.eventType} •{" "}
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    {event.errorMessage && (
                      <div className="text-xs text-red-600 mt-1 truncate">
                        {event.errorMessage}
                      </div>
                    )}
                  </div>
                  {event.retryCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Retry {event.retryCount}
                    </Badge>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <NormalButton variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </NormalButton>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Event Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">
                            Event ID
                          </label>
                          <p className="font-mono text-sm">{event.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Workflow ID
                          </label>
                          <p className="font-mono text-sm">
                            {event.workflowId}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Event Type
                          </label>
                          <p className="text-sm">{event.eventType}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Source</label>
                          <Badge variant="outline">{event.source}</Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Timestamp
                          </label>
                          <p className="text-sm">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Payload</label>
                        <ScrollArea className="h-40 mt-2">
                          <pre className="text-xs bg-muted p-3 rounded">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                      {event.errorMessage && (
                        <div>
                          <label className="text-sm font-medium text-red-600">
                            Error Message
                          </label>
                          <p className="text-sm text-red-600 mt-1">
                            {event.errorMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Geen events gevonden met de huidige filters
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

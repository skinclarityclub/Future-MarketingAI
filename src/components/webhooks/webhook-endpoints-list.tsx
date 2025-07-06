"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Activity,
} from "lucide-react";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  method: string;
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
  successCount: number;
  errorCount: number;
  status: "active" | "inactive" | "error";
}

interface WebhookEndpointsListProps {
  locale: string;
}

export function WebhookEndpointsList({ locale }: WebhookEndpointsListProps) {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      const response = await fetch("/api/webhooks/endpoints");
      if (response.ok) {
        const data = await response.json();
        setEndpoints(data);
      }
    } catch (error) {
      console.error("Error fetching webhook endpoints:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEndpoint = async (endpointId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/endpoints/${endpointId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: active }),
      });

      if (response.ok) {
        setEndpoints(prev =>
          prev.map(ep =>
            ep.id === endpointId ? { ...ep, isActive: active } : ep
          )
        );
      }
    } catch (error) {
      console.error("Error toggling endpoint:", error);
    }
  };

  const deleteEndpoint = async (endpointId: string) => {
    try {
      const response = await fetch(`/api/webhooks/endpoints/${endpointId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEndpoints(prev => prev.filter(ep => ep.id !== endpointId));
      }
    } catch (error) {
      console.error("Error deleting endpoint:", error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>Beheer uw webhook endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
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
          <Activity className="h-5 w-5" />
          Webhook Endpoints
        </CardTitle>
        <CardDescription>
          Beheer en monitor uw webhook endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Statistieken</TableHead>
                <TableHead>Actief</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map(endpoint => (
                <TableRow key={endpoint.id}>
                  <TableCell className="font-medium">{endpoint.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{endpoint.url}</span>
                      <NormalButton
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(endpoint.url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </NormalButton>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{endpoint.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        endpoint.status === "active" ? "default" : "destructive"
                      }
                      className="flex items-center gap-1 w-fit"
                    >
                      {endpoint.status === "active" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {endpoint.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div>{endpoint.triggerCount} triggers</div>
                      <div className="text-xs">
                        {endpoint.successCount} success, {endpoint.errorCount}{" "}
                        errors
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={endpoint.isActive}
                      onCheckedChange={checked =>
                        toggleEndpoint(endpoint.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <NormalButton variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </NormalButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteEndpoint(endpoint.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface TestResult {
  id: string;
  timestamp: string;
  type: "outgoing" | "incoming";
  url: string;
  method: string;
  status: "success" | "error" | "pending";
  statusCode?: number;
  responseTime?: number;
  response?: any;
  error?: string;
}

interface WebhookTestingInterfaceProps {
  locale: string;
}

export function WebhookTestingInterface({
  locale,
}: WebhookTestingInterfaceProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [outgoingTest, setOutgoingTest] = useState({
    url: "",
    method: "POST",
    payload: JSON.stringify(
      {
        workflowId: "test-workflow",
        data: {
          message: "Test from dashboard",
        },
      },
      null,
      2
    ),
  });
  const [incomingTest, setIncomingTest] = useState({
    workflowId: "test-workflow-001",
    eventType: "execution_completed",
    payload: JSON.stringify(
      {
        execution: {
          id: "test-exec-001",
          status: "success",
        },
      },
      null,
      2
    ),
  });
  const [loading, setLoading] = useState(false);

  const testOutgoingWebhook = async () => {
    setLoading(true);
    const testId = `test_${Date.now()}`;
    const startTime = Date.now();

    const pendingResult: TestResult = {
      id: testId,
      timestamp: new Date().toISOString(),
      type: "outgoing",
      url: outgoingTest.url,
      method: outgoingTest.method,
      status: "pending",
    };
    setTestResults(prev => [pendingResult, ...prev]);

    try {
      const response = await fetch("/api/webhooks/test/outgoing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: outgoingTest.url,
          method: outgoingTest.method,
          payload: JSON.parse(outgoingTest.payload),
        }),
      });

      const responseData = await response.json();
      const responseTime = Date.now() - startTime;

      setTestResults(prev =>
        prev.map(result =>
          result.id === testId
            ? {
                ...result,
                status: response.ok ? "success" : "error",
                statusCode: response.status,
                responseTime,
                response: responseData,
                error: response.ok
                  ? undefined
                  : responseData.error || "Request failed",
              }
            : result
        )
      );
    } catch (error) {
      setTestResults(prev =>
        prev.map(result =>
          result.id === testId
            ? {
                ...result,
                status: "error",
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : result
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const testIncomingWebhook = async () => {
    setLoading(true);
    const testId = `test_${Date.now()}`;
    const startTime = Date.now();

    const pendingResult: TestResult = {
      id: testId,
      timestamp: new Date().toISOString(),
      type: "incoming",
      url: "/api/webhooks/n8n",
      method: "POST",
      status: "pending",
    };
    setTestResults(prev => [pendingResult, ...prev]);

    try {
      const payload = {
        workflowId: incomingTest.workflowId,
        eventType: incomingTest.eventType,
        payload: JSON.parse(incomingTest.payload),
        timestamp: new Date().toISOString(),
        source: "n8n",
      };

      const response = await fetch("/api/webhooks/n8n", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "webhook-test-client/1.0",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      const responseTime = Date.now() - startTime;

      setTestResults(prev =>
        prev.map(result =>
          result.id === testId
            ? {
                ...result,
                status: response.ok ? "success" : "error",
                statusCode: response.status,
                responseTime,
                response: responseData,
                error: response.ok
                  ? undefined
                  : responseData.error || "Request failed",
              }
            : result
        )
      );
    } catch (error) {
      setTestResults(prev =>
        prev.map(result =>
          result.id === testId
            ? {
                ...result,
                status: "error",
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : result
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Uitgaande Webhook Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outgoing-url">n8n Webhook URL</Label>
            <Input
              id="outgoing-url"
              value={outgoingTest.url}
              onChange={e =>
                setOutgoingTest(prev => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://your-n8n.com/webhook/test"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outgoing-method">HTTP Method</Label>
            <Select
              value={outgoingTest.method}
              onValueChange={value =>
                setOutgoingTest(prev => ({ ...prev, method: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="outgoing-payload">Test Payload (JSON)</Label>
            <Textarea
              id="outgoing-payload"
              value={outgoingTest.payload}
              onChange={e =>
                setOutgoingTest(prev => ({ ...prev, payload: e.target.value }))
              }
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <NormalButton
            onClick={testOutgoingWebhook}
            disabled={loading || !outgoingTest.url}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Send className="h-4 w-4 mr-2" />
            Test Uitgaande Webhook
          </NormalButton>
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Inkomende Webhook Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="incoming-workflow">Workflow ID</Label>
            <Input
              id="incoming-workflow"
              value={incomingTest.workflowId}
              onChange={e =>
                setIncomingTest(prev => ({
                  ...prev,
                  workflowId: e.target.value,
                }))
              }
              placeholder="test-workflow-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="incoming-event">Event Type</Label>
            <Select
              value={incomingTest.eventType}
              onValueChange={value =>
                setIncomingTest(prev => ({ ...prev, eventType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="execution_started">
                  Execution Started
                </SelectItem>
                <SelectItem value="execution_completed">
                  Execution Completed
                </SelectItem>
                <SelectItem value="execution_failed">
                  Execution Failed
                </SelectItem>
                <SelectItem value="workflow_updated">
                  Workflow Updated
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="incoming-payload">Test Payload (JSON)</Label>
            <Textarea
              id="incoming-payload"
              value={incomingTest.payload}
              onChange={e =>
                setIncomingTest(prev => ({ ...prev, payload: e.target.value }))
              }
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <NormalButton
            onClick={testIncomingWebhook}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Test Inkomende Webhook
          </NormalButton>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
          <CardHeader>
            <CardTitle>Test Resultaten</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {testResults.map(result => (
                  <div
                    key={result.id}
                    className="flex items-start justify-between p-4 border rounded-lg bg-white/40"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {result.type === "outgoing"
                              ? "UITGAAND"
                              : "INKOMEND"}
                          </Badge>
                          <span className="text-sm font-medium">
                            {result.method}
                          </span>
                          {result.statusCode && (
                            <Badge
                              variant={
                                result.statusCode < 300
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {result.statusCode}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate mb-1">
                          {result.url}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString()}
                          {result.responseTime && ` • ${result.responseTime}ms`}
                        </div>
                        {result.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                    {result.response && (
                      <NormalButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log("Response:", result.response);
                        }}
                      >
                        View
                      </NormalButton>
                    )}
                  </div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nog geen tests uitgevoerd
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

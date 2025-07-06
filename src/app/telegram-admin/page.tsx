"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Bot,
  Settings,
  Webhook,
  Info,
} from "lucide-react";

interface BotStatus {
  success: boolean;
  message: string;
  botInfo?: any;
  webhookInfo?: any;
  missing?: string[];
  required?: string[];
}

export default function TelegramAdminPage() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [envStatus, setEnvStatus] = useState<BotStatus | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    checkBotStatus();
    checkEnvironmentVariables();
    generateWebhookUrl();
  }, []);

  const checkBotStatus = async () => {
    try {
      const response = await fetch("/api/telegram/admin?action=bot-info");
      const data = await response.json();
      setBotStatus(data);
    } catch (error) {
      setBotStatus({
        success: false,
        message: "Failed to check bot status",
      });
    }
  };

  const checkEnvironmentVariables = async () => {
    try {
      const response = await fetch("/api/telegram/admin?action=env-check");
      const data = await response.json();
      setEnvStatus(data);
    } catch (error) {
      setEnvStatus({
        success: false,
        message: "Failed to check environment variables",
      });
    }
  };

  const generateWebhookUrl = async () => {
    try {
      const response = await fetch("/api/telegram/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-webhook-url" }),
      });
      const data = await response.json();
      if (data.success) {
        setWebhookUrl(data.webhookUrl);
      }
    } catch (error) {
      console.error("Failed to generate webhook URL:", error);
    }
  };

  const setupWebhook = async () => {
    if (!webhookUrl) {
      setMessage({ type: "error", text: "Please enter a webhook URL" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/telegram/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup-webhook", webhookUrl }),
      });
      const data = await response.json();

      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });

      if (data.success) {
        checkBotStatus();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to setup webhook" });
    } finally {
      setLoading(false);
    }
  };

  const removeWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/telegram/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove-webhook" }),
      });
      const data = await response.json();

      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });

      if (data.success) {
        checkBotStatus();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove webhook" });
    } finally {
      setLoading(false);
    }
  };

  const validateConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/telegram/admin?action=validate");
      const data = await response.json();

      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });

      setBotStatus(data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to validate configuration" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Telegram Bot Admin</h1>
          <p className="text-muted-foreground">
            Manage your SKC BI Dashboard Telegram bot
          </p>
        </div>
      </div>

      {message && (
        <Alert
          className={
            message.type === "success" ? "border-green-500" : "border-red-500"
          }
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Bot Status
                </CardTitle>
                <CardDescription>
                  Current status of your Telegram bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {botStatus ? (
                  <>
                    <div className="flex items-center gap-2">
                      {botStatus.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span
                        className={
                          botStatus.success ? "text-green-600" : "text-red-600"
                        }
                      >
                        {botStatus.message}
                      </span>
                    </div>

                    {botStatus.botInfo && (
                      <div className="space-y-2 p-3 bg-muted rounded-lg">
                        <p>
                          <strong>Bot Name:</strong>{" "}
                          {botStatus.botInfo.first_name}
                        </p>
                        <p>
                          <strong>Username:</strong> @
                          {botStatus.botInfo.username}
                        </p>
                        <p>
                          <strong>Bot ID:</strong> {botStatus.botInfo.id}
                        </p>
                        <p>
                          <strong>Can Join Groups:</strong>{" "}
                          {botStatus.botInfo.can_join_groups ? "Yes" : "No"}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span>Checking bot status...</span>
                  </div>
                )}

                <Button
                  onClick={validateConfiguration}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Validating..." : "Validate Configuration"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Environment Variables
                </CardTitle>
                <CardDescription>
                  Required environment variables status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {envStatus ? (
                  <>
                    <div className="flex items-center gap-2">
                      {envStatus.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span
                        className={
                          envStatus.success ? "text-green-600" : "text-red-600"
                        }
                      >
                        {envStatus.message}
                      </span>
                    </div>

                    {envStatus.required && (
                      <div className="space-y-2">
                        <p className="font-medium">Required Variables:</p>
                        <div className="space-y-1">
                          {envStatus.required.map(envVar => (
                            <div
                              key={envVar}
                              className="flex items-center gap-2"
                            >
                              {envStatus.missing?.includes(
                                envVar.split(" ")[0]
                              ) ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {envVar}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span>Checking environment variables...</span>
                  </div>
                )}

                <Button
                  onClick={checkEnvironmentVariables}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Check
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Set up the webhook URL for your Telegram bot to receive messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/telegram/webhook"
                />
                <p className="text-sm text-muted-foreground">
                  This URL will receive webhook updates from Telegram
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={setupWebhook}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Setting up..." : "Setup Webhook"}
                </Button>
                <Button
                  onClick={removeWebhook}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? "Removing..." : "Remove Webhook"}
                </Button>
              </div>

              <Button
                onClick={generateWebhookUrl}
                variant="ghost"
                className="w-full"
              >
                Generate Default URL
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot Settings</CardTitle>
              <CardDescription>
                Configure your bot behavior and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Bot settings are configured via environment variables. Update
                  your .env file and restart the application to apply changes.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Available Settings:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <code>TELEGRAM_BOT_TOKEN</code> - Your bot token from
                      @BotFather
                    </div>
                    <div>
                      <code>TELEGRAM_ALLOWED_USERS</code> - Comma-separated list
                      of allowed user IDs
                    </div>
                    <div>
                      <code>TELEGRAM_ADMIN_USERS</code> - Comma-separated list
                      of admin user IDs
                    </div>
                    <div>
                      <code>TELEGRAM_MAX_MESSAGE_LENGTH</code> - Maximum message
                      length (default: 4096)
                    </div>
                    <div>
                      <code>TELEGRAM_RATE_LIMIT</code> - Messages per minute
                      limit (default: 20)
                    </div>
                    <div>
                      <code>TELEGRAM_SESSION_TIMEOUT</code> - Session timeout in
                      milliseconds (default: 3600000)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

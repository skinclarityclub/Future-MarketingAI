"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Music,
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { blotato_n8n } from "@/lib/social-media/blotato-n8n-integration";

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: (platform: string, accountData: any) => void;
}

const PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    description: "Connect Facebook Pages for business posting",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    description: "Share photos and stories automatically",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    description: "Professional content and company updates",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "#1DA1F2",
    description: "Real-time updates and engagement",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "#FF0000",
    description: "Video content and channel management",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music,
    color: "#000000",
    description: "Short-form video content",
  },
];

export default function ConnectAccountModal({
  isOpen,
  onClose,
  onAccountConnected,
}: ConnectAccountModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<
    "select" | "oauth" | "configure" | "complete"
  >("select");
  const [workflowConfig, setWorkflowConfig] = useState({
    contentTypes: ["text", "image"],
    postingFrequency: "daily",
    postingTimes: ["09:00", "14:00", "18:00"],
    hashtags: "#SKC #BusinessIntelligence #DataDriven",
    tone: "Professional and informative",
    targetAudience: "Business professionals and decision makers",
    enableBlotato: true,
    enableN8n: true,
  });

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setConnectionStep("oauth");
  };

  const handleOAuthConnect = async () => {
    if (!selectedPlatform) return;

    setIsConnecting(true);
    try {
      // Initieer OAuth flow
      const authUrl = await blotato_n8n.initiatePlatformConnection(
        selectedPlatform,
        `${window.location.origin}/social-media/oauth/callback`
      );

      // Open OAuth window
      const authWindow = window.open(authUrl, "oauth", "width=600,height=600");

      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          setConnectionStep("configure");
          setIsConnecting(false);
        }
      }, 1000);
    } catch (error) {
      console.error("OAuth error:", error);
      setIsConnecting(false);
    }
  };

  const handleCompleteConnection = async () => {
    if (!selectedPlatform) return;

    setIsConnecting(true);
    try {
      // Simuleer OAuth completion voor demo
      const mockAuthCode = "demo_auth_code_" + Date.now();

      const connection = await blotato_n8n.completePlatformConnection(
        selectedPlatform,
        mockAuthCode,
        {
          campaignId: `skc_${selectedPlatform}_campaign`,
          contentTypes: workflowConfig.contentTypes as any,
          postingSchedule: {
            frequency: workflowConfig.postingFrequency as any,
            times: workflowConfig.postingTimes,
            timezone: "Europe/Amsterdam",
          },
          contentParams: {
            tone: workflowConfig.tone,
            hashtags: workflowConfig.hashtags.split(" "),
            mentions: [],
            targetAudience: workflowConfig.targetAudience,
          },
        }
      );

      onAccountConnected(selectedPlatform, connection);
      setConnectionStep("complete");

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        resetModal();
      }, 2000);
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const resetModal = () => {
    setSelectedPlatform(null);
    setConnectionStep("select");
    setIsConnecting(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return null;
    const Icon = platform.icon;
    return <Icon className="w-5 h-5" style={{ color: platform.color }} />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="dark bg-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Connect Social Media Account
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Connect your social media accounts to enable automated content
            posting via Blotato + n8n workflows
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {connectionStep === "select" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Choose Platform
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(platform => {
                  const Icon = platform.icon;
                  return (
                    <NormalButton
                      key={platform.id}
                      variant="secondary"
                      className="h-auto p-4 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all"
                      onClick={() => handlePlatformSelect(platform.id)}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Icon
                          className="w-6 h-6"
                          style={{ color: platform.color }}
                        />
                        <div>
                          <div className="font-medium text-white">
                            {platform.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {platform.description}
                          </div>
                        </div>
                      </div>
                    </NormalButton>
                  );
                })}
              </div>
            </motion.div>
          )}

          {connectionStep === "oauth" && selectedPlatform && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                {getPlatformIcon(selectedPlatform)}
                <h3 className="text-lg font-semibold text-white">
                  Connect {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
                </h3>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      Authorization Required
                    </h4>
                    <p className="text-slate-400 text-sm mb-4">
                      You'll be redirected to{" "}
                      {PLATFORMS.find(p => p.id === selectedPlatform)?.name} to
                      authorize SKC BI Dashboard to post content on your behalf.
                    </p>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div>✓ Read basic profile information</div>
                      <div>✓ Create and publish posts</div>
                      <div>✓ Read engagement metrics</div>
                      {selectedPlatform === "instagram" && (
                        <div>✓ Manage Instagram Business account</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <NormalButton
                  variant="secondary"
                  onClick={() => setConnectionStep("select")}
                  className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                >
                  Back
                </NormalButton>
                <NormalButton
                  onClick={handleOAuthConnect}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 flex-1"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Authorize & Connect
                    </>
                  )}
                </NormalButton>
              </div>
            </motion.div>
          )}

          {connectionStep === "configure" && selectedPlatform && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                {getPlatformIcon(selectedPlatform)}
                <h3 className="text-lg font-semibold text-white">
                  Configure Automation
                </h3>
              </div>

              <Tabs defaultValue="posting" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                  <TabsTrigger
                    value="posting"
                    className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
                  >
                    Posting Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
                  >
                    Content Config
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posting" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white mb-2 block">
                        Posting Frequency
                      </Label>
                      <select
                        className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white"
                        value={workflowConfig.postingFrequency}
                        onChange={e =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            postingFrequency: e.target.value,
                          })
                        }
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom">Custom Schedule</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">
                        Posting Times
                      </Label>
                      <Input
                        value={workflowConfig.postingTimes.join(", ")}
                        onChange={e =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            postingTimes: e.target.value.split(", "),
                          })
                        }
                        placeholder="09:00, 14:00, 18:00"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                      <div>
                        <div className="text-white font-medium">
                          Enable Blotato AI Content
                        </div>
                        <div className="text-slate-400 text-sm">
                          Automatically generate content using Blotato AI
                        </div>
                      </div>
                      <Switch
                        checked={workflowConfig.enableBlotato}
                        onCheckedChange={checked =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            enableBlotato: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                      <div>
                        <div className="text-white font-medium">
                          Enable n8n Automation
                        </div>
                        <div className="text-slate-400 text-sm">
                          Use n8n workflows for posting automation
                        </div>
                      </div>
                      <Switch
                        checked={workflowConfig.enableN8n}
                        onCheckedChange={checked =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            enableN8n: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white mb-2 block">
                        Content Tone
                      </Label>
                      <Input
                        value={workflowConfig.tone}
                        onChange={e =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            tone: e.target.value,
                          })
                        }
                        placeholder="Professional and informative"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">
                        Target Audience
                      </Label>
                      <Input
                        value={workflowConfig.targetAudience}
                        onChange={e =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            targetAudience: e.target.value,
                          })
                        }
                        placeholder="Business professionals and decision makers"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">
                        Default Hashtags
                      </Label>
                      <Input
                        value={workflowConfig.hashtags}
                        onChange={e =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            hashtags: e.target.value,
                          })
                        }
                        placeholder="#SKC #BusinessIntelligence #DataDriven"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">
                        Content Types
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {["text", "image", "video", "carousel"].map(type => (
                          <Badge
                            key={type}
                            variant={
                              workflowConfig.contentTypes.includes(type)
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer ${
                              workflowConfig.contentTypes.includes(type)
                                ? "bg-cyan-500 text-white"
                                : "border-slate-600 text-slate-400 hover:border-cyan-500"
                            }`}
                            onClick={() => {
                              const types =
                                workflowConfig.contentTypes.includes(type)
                                  ? workflowConfig.contentTypes.filter(
                                      t => t !== type
                                    )
                                  : [...workflowConfig.contentTypes, type];
                              setWorkflowConfig({
                                ...workflowConfig,
                                contentTypes: types,
                              });
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3">
                <NormalButton
                  variant="secondary"
                  onClick={() => setConnectionStep("oauth")}
                  className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                >
                  Back
                </NormalButton>
                <NormalButton
                  onClick={handleCompleteConnection}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 flex-1"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up workflow...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 w-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </NormalButton>
              </div>
            </motion.div>
          )}

          {connectionStep === "complete" && selectedPlatform && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Account Connected!
              </h3>
              <p className="text-slate-400">
                {PLATFORMS.find(p => p.id === selectedPlatform)?.name} account
                has been successfully connected with automated posting via
                Blotato + n8n workflows.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <Settings className="w-4 h-4" />
                Workflow created • Content automation enabled
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

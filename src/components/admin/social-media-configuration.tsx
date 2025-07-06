"use client";

import React, { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Zap,
  Shield,
  Users,
  BarChart3,
} from "lucide-react";

export default function SocialMediaConfiguration() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("instagram");

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Social Media Configuration
        </h1>
        <p className="text-gray-400">
          Configure and manage API integrations for all social media platforms
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Setup Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">3/6</div>
              <Progress value={50} className="h-2" />
              <p className="text-xs text-gray-400">50% configured</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-white">3</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-white">1</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" className="w-full">
              <RefreshCw className="h-4 w-4" />
              Check Health
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Platform Configuration */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Platform Configuration</CardTitle>
          <CardDescription className="text-gray-400">
            Configure API credentials for each social media platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full bg-gray-700/50">
              <TabsTrigger
                value="instagram"
                className="data-[state=active]:bg-gray-600"
              >
                📸 Instagram
              </TabsTrigger>
              <TabsTrigger
                value="facebook"
                className="data-[state=active]:bg-gray-600"
              >
                👥 Facebook
              </TabsTrigger>
              <TabsTrigger
                value="linkedin"
                className="data-[state=active]:bg-gray-600"
              >
                💼 LinkedIn
              </TabsTrigger>
              <TabsTrigger
                value="twitter"
                className="data-[state=active]:bg-gray-600"
              >
                🐦 Twitter
              </TabsTrigger>
              <TabsTrigger
                value="tiktok"
                className="data-[state=active]:bg-gray-600"
              >
                🎵 TikTok
              </TabsTrigger>
              <TabsTrigger
                value="youtube"
                className="data-[state=active]:bg-gray-600"
              >
                📺 YouTube
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instagram" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    📸 Instagram Business API
                    <Badge variant="default">Connected</Badge>
                  </h3>
                  <p className="text-sm text-gray-400">
                    Analytics • Publishing • Stories • Reels
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </div>

              <Separator className="bg-gray-700" />

              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  Connected to @skcbusiness_official
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">App ID *</Label>
                  <Input
                    placeholder="Instagram App ID"
                    className="bg-gray-700/50 border-gray-600 text-white"
                    value="123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">App Secret *</Label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="App Secret"
                      className="bg-gray-700/50 border-gray-600 text-white pr-10"
                      value="••••••••••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Access Token *</Label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Business Account Access Token"
                      className="bg-gray-700/50 border-gray-600 text-white pr-10"
                      value="••••••••••••••••••••••••••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                    >
                      <EyeOff className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Update Configuration
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Auth Type</p>
                    <p className="text-sm text-white font-medium">OAUTH2</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-400">Rate Limit</p>
                    <p className="text-sm text-white font-medium">200/hour</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Permissions</p>
                    <p className="text-sm text-white font-medium">3 scopes</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Other platform tabs would follow similar pattern */}
            <TabsContent value="facebook" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-white">
                  Facebook Configuration
                </h3>
                <p className="text-gray-400">
                  Configure Facebook Graph API credentials here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="linkedin" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-white">
                  LinkedIn Configuration
                </h3>
                <p className="text-gray-400">
                  Configure LinkedIn Marketing API credentials here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="twitter" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-white">
                  Twitter/X Configuration
                </h3>
                <p className="text-gray-400">
                  Configure Twitter API v2 credentials here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tiktok" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-white">
                  TikTok Configuration
                </h3>
                <p className="text-gray-400">
                  Configure TikTok Business API credentials here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="youtube" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-white">
                  YouTube Configuration
                </h3>
                <p className="text-gray-400">
                  Configure YouTube Data API credentials here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

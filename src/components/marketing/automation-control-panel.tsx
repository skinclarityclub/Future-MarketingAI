"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Zap,
  Target,
  BarChart3,
  Hash,
  Search,
  Play,
  RefreshCw,
  TrendingUp,
  Clock,
  Brain,
  CheckCircle,
  Plus,
} from "lucide-react";

export default function AutomationControlPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats] = useState({
    activeRules: 5,
    totalExecutions: 1247,
    successRate: 95.8,
    contentGenerated: 523,
    engagementImprovement: 23.4,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Automation Control Panel
          </h1>
          <p className="text-muted-foreground">
            Advanced content optimization and automation management
          </p>
        </div>
        <Badge variant="secondary">{stats.activeRules} Active Rules</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground">
              Automation rules running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Execution success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Content Generated
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentGenerated}</div>
            <p className="text-xs text-muted-foreground">
              Total automated content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Boost
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.engagementImprovement}%
            </div>
            <p className="text-xs text-muted-foreground">Average improvement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curation">Content Curation</TabsTrigger>
          <TabsTrigger value="reposting">Smart Reposting</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtag Optimization</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                Automation Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Content Curation</span>
                  <span className="font-medium">97.8%</span>
                </div>
                <Progress value={97.8} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Smart Reposting</span>
                  <span className="font-medium">91.3%</span>
                </div>
                <Progress value={91.3} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hashtag Optimization</span>
                  <span className="font-medium">94.6%</span>
                </div>
                <Progress value={94.6} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Content Curation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Topics</Label>
                <Input placeholder="AI, Marketing, Technology..." />
              </div>
              <div className="space-y-2">
                <Label>Target Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {["linkedin", "twitter", "instagram", "facebook"].map(
                    platform => (
                      <Badge
                        key={platform}
                        variant="secondary"
                        className="cursor-pointer"
                      >
                        {platform}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Content Curation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Automation Rules Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <h4 className="font-medium">
                          Morning Content Curation
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Daily curation • 45 executions
                        </p>
                      </div>
                    </div>
                    <Switch checked={true} onCheckedChange={() => {}} />
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Automation Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

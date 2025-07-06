"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Flag,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  Target,
  Activity,
  TrendingUp,
  Settings,
  Clock,
  Globe,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import {
  featureFlagService,
  FeatureFlag,
} from "@/lib/feature-flags/feature-flag-service";
import { FeatureKey } from "@/lib/rbac/access-tier-service";
import { cn } from "@/lib/utils";

export interface FeatureFlagManagementProps {
  className?: string;
}

export function FeatureFlagManagement({
  className,
}: FeatureFlagManagementProps) {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEnvironment, setFilterEnvironment] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Load feature flags
  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      const flags = featureFlagService.getAllFeatureFlags();
      setFeatureFlags(flags);
    } catch (error) {
      console.error("Error loading feature flags:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter feature flags
  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch =
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnvironment =
      filterEnvironment === "all" || flag.environment === filterEnvironment;
    const matchesCategory =
      filterCategory === "all" || flag.category === filterCategory;

    return matchesSearch && matchesEnvironment && matchesCategory;
  });

  const handleToggleFlag = async (key: FeatureKey, enabled: boolean) => {
    try {
      await featureFlagService.updateFeatureFlag(key, {
        enabled,
        updatedBy: "admin@skc.com",
      });
      await loadFeatureFlags();
    } catch (error) {
      console.error("Error toggling feature flag:", error);
    }
  };

  const handleUpdateRollout = async (key: FeatureKey, percentage: number) => {
    try {
      await featureFlagService.updateFeatureFlag(key, {
        rolloutPercentage: percentage,
        updatedBy: "admin@skc.com",
      });
      await loadFeatureFlags();
    } catch (error) {
      console.error("Error updating rollout:", error);
    }
  };

  const handleDeleteFlag = async (key: FeatureKey) => {
    try {
      await featureFlagService.deleteFeatureFlag(key);
      await loadFeatureFlags();
    } catch (error) {
      console.error("Error deleting feature flag:", error);
    }
  };

  const getStatusIcon = (flag: FeatureFlag) => {
    if (!flag.enabled) {
      return <EyeOff className="w-4 h-4 text-gray-500" />;
    }
    if (flag.rolloutPercentage === 100) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (flag.rolloutPercentage > 0) {
      return <Activity className="w-4 h-4 text-blue-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case "production":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "staging":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
      case "development":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ui":
        return <Eye className="w-3 h-3" />;
      case "api":
        return <Globe className="w-3 h-3" />;
      case "workflow":
        return <Settings className="w-3 h-3" />;
      case "analytics":
        return <BarChart3 className="w-3 h-3" />;
      case "integration":
        return <Target className="w-3 h-3" />;
      default:
        return <Flag className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feature Flag Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Control feature rollouts, access, and experiments
          </p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Feature Flag
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Search</Label>
              <Input
                placeholder="Search flags..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Environment</Label>
              <Select
                value={filterEnvironment}
                onValueChange={setFilterEnvironment}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ui">UI Features</SelectItem>
                  <SelectItem value="api">API Features</SelectItem>
                  <SelectItem value="workflow">Workflows</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="integration">Integrations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Activity className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags Grid */}
      <div className="grid gap-4">
        {filteredFlags.map(flag => (
          <Card
            key={flag.id}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    {getStatusIcon(flag)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {flag.name}
                    </h3>
                    <Badge variant={flag.enabled ? "default" : "secondary"}>
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-xs",
                        getEnvironmentColor(flag.environment)
                      )}
                    >
                      {flag.environment}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <span className="mr-1">
                        {getCategoryIcon(flag.category)}
                      </span>
                      {flag.category}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {flag.description}
                  </p>

                  {/* Rollout Information */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rollout:
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={flag.rolloutPercentage}
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {flag.rolloutPercentage}%
                        </span>
                      </div>
                    </div>

                    {flag.targetingRules.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {flag.targetingRules.length} targeting rule
                          {flag.targetingRules.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {flag.schedule && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          Scheduled
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last modified: {new Date(flag.updatedAt).toLocaleString()}{" "}
                    by {flag.updatedBy} • v{flag.version}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Rollout Slider */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Label className="text-xs font-medium">%</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={flag.rolloutPercentage}
                      onChange={e =>
                        handleUpdateRollout(
                          flag.key,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 h-8 text-xs"
                    />
                  </div>

                  {/* Toggle Switch */}
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={checked =>
                      handleToggleFlag(flag.key, checked)
                    }
                  />

                  {/* Edit Button */}
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>

                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{flag.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteFlag(flag.key)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFlags.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No feature flags found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ||
              filterEnvironment !== "all" ||
              filterCategory !== "all"
                ? "No flags match your current filters."
                : "Get started by creating your first feature flag."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Total Flags
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {featureFlags.length}
                </p>
              </div>
              <Flag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                  Enabled
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {featureFlags.filter(f => f.enabled).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                  Partial Rollout
                </p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {
                    featureFlags.filter(
                      f => f.enabled && f.rolloutPercentage < 100
                    ).length
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                  With Rules
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {featureFlags.filter(f => f.targetingRules.length > 0).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

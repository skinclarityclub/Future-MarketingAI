"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Copy,
  Settings,
  Calendar as CalendarIcon,
  Target,
  Users,
  Globe,
  Clock,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  Play,
  Save,
  Eye,
  Edit3,
} from "lucide-react";
import { format } from "date-fns";

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  content: {
    title: string;
    body: string;
    media?: string;
    cta: string;
    hashtags: string[];
  };
  targeting: {
    platforms: string[];
    demographics: {
      ageRange: string;
      location: string[];
      interests: string[];
    };
    behavior: {
      previousEngagement: string;
      deviceType: string[];
      timeOfDay: string[];
    };
  };
  timing: {
    postTime: string;
    timezone: string;
    frequency: string;
    duration: number;
  };
  trafficAllocation: number;
  isControl: boolean;
  blotato: {
    accountIds: string[];
    platforms: string[];
    scheduledPosts: boolean;
  };
}

export interface ABTestConfiguration {
  id: string;
  name: string;
  hypothesis: string;
  objective: string;
  audience: string;
  duration: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  significance: number;
  variants: ABTestVariant[];
  testType: "single" | "multi-variable";
  conflictCheck: boolean;
  autoStop: boolean;
  blotoSyncEnabled: boolean;
}

interface TestSetupInterfaceProps {
  onSave?: (config: ABTestConfiguration) => void;
  onPreview?: (config: ABTestConfiguration) => void;
  initialConfig?: ABTestConfiguration;
  isEditing?: boolean;
}

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "facebook", name: "Facebook", icon: "👥" },
  { id: "tiktok", name: "TikTok", icon: "🎵" },
  { id: "twitter", name: "Twitter/X", icon: "🐦" },
];

const TIME_ZONES = [
  { id: "UTC", name: "UTC" },
  { id: "Europe/Amsterdam", name: "Amsterdam (CET)" },
  { id: "America/New_York", name: "New York (EST)" },
  { id: "America/Los_Angeles", name: "Los Angeles (PST)" },
  { id: "Asia/Tokyo", name: "Tokyo (JST)" },
];

export default function TestSetupInterface({
  onSave,
  onPreview,
  initialConfig,
  isEditing = false,
}: TestSetupInterfaceProps) {
  const [config, setConfig] = useState<ABTestConfiguration>({
    id: "",
    name: "",
    hypothesis: "",
    objective: "",
    audience: "",
    duration: 7,
    startDate: undefined,
    endDate: undefined,
    significance: 95,
    variants: [],
    testType: "single",
    conflictCheck: true,
    autoStop: false,
    blotoSyncEnabled: true,
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const createNewVariant = (): ABTestVariant => ({
    id: `variant-${Date.now()}`,
    name: `Variant ${config.variants.length + 1}`,
    description: "",
    content: {
      title: "",
      body: "",
      cta: "",
      hashtags: [],
    },
    targeting: {
      platforms: [],
      demographics: {
        ageRange: "18-65",
        location: [],
        interests: [],
      },
      behavior: {
        previousEngagement: "all",
        deviceType: ["mobile", "desktop"],
        timeOfDay: ["morning", "afternoon", "evening"],
      },
    },
    timing: {
      postTime: "09:00",
      timezone: "Europe/Amsterdam",
      frequency: "once",
      duration: 24,
    },
    trafficAllocation: Math.floor(100 / (config.variants.length + 1)),
    isControl: config.variants.length === 0,
    blotato: {
      accountIds: [],
      platforms: [],
      scheduledPosts: true,
    },
  });

  const addVariant = () => {
    const newVariant = createNewVariant();
    const updatedVariants = [...config.variants, newVariant];

    // Redistribute traffic allocation
    const allocation = Math.floor(100 / updatedVariants.length);
    updatedVariants.forEach((variant, index) => {
      variant.trafficAllocation =
        index === updatedVariants.length - 1
          ? 100 - allocation * (updatedVariants.length - 1)
          : allocation;
    });

    setConfig({ ...config, variants: updatedVariants });
    setSelectedVariant(newVariant.id);
    setShowVariantDialog(true);
  };

  const removeVariant = (variantId: string) => {
    const updatedVariants = config.variants.filter(v => v.id !== variantId);

    // Redistribute traffic allocation
    if (updatedVariants.length > 0) {
      const allocation = Math.floor(100 / updatedVariants.length);
      updatedVariants.forEach((variant, index) => {
        variant.trafficAllocation =
          index === updatedVariants.length - 1
            ? 100 - allocation * (updatedVariants.length - 1)
            : allocation;
      });
    }

    setConfig({ ...config, variants: updatedVariants });
  };

  const duplicateVariant = (variantId: string) => {
    const originalVariant = config.variants.find(v => v.id === variantId);
    if (!originalVariant) return;

    const duplicatedVariant: ABTestVariant = {
      ...originalVariant,
      id: `variant-${Date.now()}`,
      name: `${originalVariant.name} Copy`,
      isControl: false,
    };

    const updatedVariants = [...config.variants, duplicatedVariant];

    // Redistribute traffic allocation
    const allocation = Math.floor(100 / updatedVariants.length);
    updatedVariants.forEach((variant, index) => {
      variant.trafficAllocation =
        index === updatedVariants.length - 1
          ? 100 - allocation * (updatedVariants.length - 1)
          : allocation;
    });

    setConfig({ ...config, variants: updatedVariants });
  };

  const updateVariant = (
    variantId: string,
    updates: Partial<ABTestVariant>
  ) => {
    const updatedVariants = config.variants.map(v =>
      v.id === variantId ? { ...v, ...updates } : v
    );
    setConfig({ ...config, variants: updatedVariants });
  };

  const validateConfiguration = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.name.trim()) {
      newErrors.name = "Test name is required";
    }

    if (!config.hypothesis.trim()) {
      newErrors.hypothesis = "Hypothesis is required";
    }

    if (!config.objective.trim()) {
      newErrors.objective = "Objective is required";
    }

    if (!config.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (config.variants.length < 2) {
      newErrors.variants = "At least 2 variants are required";
    }

    const totalAllocation = config.variants.reduce(
      (sum, v) => sum + v.trafficAllocation,
      0
    );
    if (Math.abs(totalAllocation - 100) > 0.1) {
      newErrors.allocation = "Traffic allocation must total 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateConfiguration() && onSave) {
      onSave(config);
    }
  };

  const handlePreview = () => {
    if (validateConfiguration() && onPreview) {
      onPreview(config);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit A/B Test" : "Create New A/B Test"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your test parameters and variants
          </p>
        </div>
        <div className="flex gap-2">
          <NormalButton variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </NormalButton>
          <NormalButton onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Update Test" : "Save Test"}
          </NormalButton>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Setup</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Setup */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Name *</Label>
                  <Input
                    value={config.name}
                    onChange={e =>
                      setConfig({ ...config, name: e.target.value })
                    }
                    placeholder="e.g., Holiday Campaign CTA Test"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select
                    value={config.testType}
                    onValueChange={(value: "single" | "multi-variable") =>
                      setConfig({ ...config, testType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Variable</SelectItem>
                      <SelectItem value="multi-variable">
                        Multi-Variable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hypothesis *</Label>
                <Textarea
                  value={config.hypothesis}
                  onChange={e =>
                    setConfig({ ...config, hypothesis: e.target.value })
                  }
                  placeholder="We believe that changing [variable] will result in [expected outcome] because [reasoning]"
                  rows={3}
                />
                {errors.hypothesis && (
                  <p className="text-sm text-red-500">{errors.hypothesis}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Primary Objective *</Label>
                <Input
                  value={config.objective}
                  onChange={e =>
                    setConfig({ ...config, objective: e.target.value })
                  }
                  placeholder="e.g., Increase click-through rate by 15%"
                />
                {errors.objective && (
                  <p className="text-sm text-red-500">{errors.objective}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  value={config.audience}
                  onChange={e =>
                    setConfig({ ...config, audience: e.target.value })
                  }
                  placeholder="e.g., Marketing professionals, 25-45, interested in analytics"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Management */}
        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Test Variants
                <Badge variant="secondary" className="ml-auto">
                  {config.variants.length} variants
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.variants.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No variants created yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create at least 2 variants to start your A/B test
                    </p>
                    <NormalButton onClick={addVariant}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Variant
                    </NormalButton>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {config.variants.map((variant, index) => (
                        <Card key={variant.id} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    variant.isControl ? "default" : "secondary"
                                  }
                                >
                                  {variant.isControl
                                    ? "Control"
                                    : `Variant ${index + 1}`}
                                </Badge>
                                <h4 className="font-medium">{variant.name}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <NormalButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedVariant(variant.id);
                                    setShowVariantDialog(true);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </NormalButton>
                                <NormalButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateVariant(variant.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                </NormalButton>
                                {!variant.isControl && (
                                  <NormalButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariant(variant.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </NormalButton>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground">
                                {variant.description ||
                                  "No description provided"}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  Traffic Allocation
                                </span>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={variant.trafficAllocation}
                                    className="w-20"
                                  />
                                  <span className="text-sm font-medium min-w-[3rem]">
                                    {variant.trafficAllocation}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {variant.targeting.platforms.map(platform => (
                                  <Badge
                                    key={platform}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {
                                      PLATFORMS.find(p => p.id === platform)
                                        ?.icon
                                    }{" "}
                                    {platform}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-center pt-4">
                      <NormalButton onClick={addVariant} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Variant
                      </NormalButton>
                    </div>
                  </>
                )}

                {errors.variants && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errors.variants}</AlertDescription>
                  </Alert>
                )}

                {errors.allocation && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errors.allocation}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Test Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <NormalButton
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!config.startDate && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {config.startDate
                          ? format(config.startDate, "PPP")
                          : "Pick a date"}
                      </NormalButton>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={config.startDate}
                        onSelect={date =>
                          setConfig({ ...config, startDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={config.duration}
                    onChange={e =>
                      setConfig({ ...config, duration: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Statistical Significance Level</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimum confidence level to declare a winner
                    </p>
                  </div>
                  <Select
                    value={config.significance.toString()}
                    onValueChange={value =>
                      setConfig({ ...config, significance: Number(value) })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                      <SelectItem value="99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Conflict Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Check for overlapping tests on same audience
                    </p>
                  </div>
                  <Switch
                    checked={config.conflictCheck}
                    onCheckedChange={checked =>
                      setConfig({ ...config, conflictCheck: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Stop on Significance</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically stop test when statistical significance is
                      reached
                    </p>
                  </div>
                  <Switch
                    checked={config.autoStop}
                    onCheckedChange={checked =>
                      setConfig({ ...config, autoStop: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Blotato Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync variants with Blotato for automated posting
                    </p>
                  </div>
                  <Switch
                    checked={config.blotoSyncEnabled}
                    onCheckedChange={checked =>
                      setConfig({ ...config, blotoSyncEnabled: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Variant Configuration Dialog */}
      <VariantConfigDialog
        variant={config.variants.find(v => v.id === selectedVariant)}
        open={showVariantDialog}
        onOpenChange={setShowVariantDialog}
        onSave={updates => {
          if (selectedVariant) {
            updateVariant(selectedVariant, updates);
            setShowVariantDialog(false);
          }
        }}
      />
    </div>
  );
}

// Variant Configuration Dialog Component
interface VariantConfigDialogProps {
  variant?: ABTestVariant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<ABTestVariant>) => void;
}

function VariantConfigDialog({
  variant,
  open,
  onOpenChange,
  onSave,
}: VariantConfigDialogProps) {
  const [formData, setFormData] = useState<ABTestVariant | null>(null);

  useEffect(() => {
    if (variant) {
      setFormData({ ...variant });
    }
  }, [variant]);

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Variant: {formData.name}</DialogTitle>
          <DialogDescription>
            Set up content, targeting, and timing for this test variant
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="blotato">Blotato</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Variant Name</Label>
                  <Input
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content Title</Label>
                <Input
                  value={formData.content.title}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, title: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Content Body</Label>
                <Textarea
                  rows={4}
                  value={formData.content.body}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, body: e.target.value },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Call to Action</Label>
                  <Input
                    value={formData.content.cta}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, cta: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hashtags (comma separated)</Label>
                  <Input
                    value={formData.content.hashtags.join(", ")}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        content: {
                          ...formData.content,
                          hashtags: e.target.value
                            .split(",")
                            .map(tag => tag.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Platforms</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map(platform => (
                    <div
                      key={platform.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`platform-${platform.id}`}
                        checked={formData.targeting.platforms.includes(
                          platform.id
                        )}
                        onChange={e => {
                          const platforms = e.target.checked
                            ? [...formData.targeting.platforms, platform.id]
                            : formData.targeting.platforms.filter(
                                p => p !== platform.id
                              );
                          setFormData({
                            ...formData,
                            targeting: { ...formData.targeting, platforms },
                          });
                        }}
                      />
                      <label
                        htmlFor={`platform-${platform.id}`}
                        className="text-sm"
                      >
                        {platform.icon} {platform.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Select
                    value={formData.targeting.demographics.ageRange}
                    onValueChange={value =>
                      setFormData({
                        ...formData,
                        targeting: {
                          ...formData.targeting,
                          demographics: {
                            ...formData.targeting.demographics,
                            ageRange: value,
                          },
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="26-35">26-35</SelectItem>
                      <SelectItem value="36-45">36-45</SelectItem>
                      <SelectItem value="46-55">46-55</SelectItem>
                      <SelectItem value="56-65">56-65</SelectItem>
                      <SelectItem value="18-65">18-65</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Previous Engagement</Label>
                  <Select
                    value={formData.targeting.behavior.previousEngagement}
                    onValueChange={value =>
                      setFormData({
                        ...formData,
                        targeting: {
                          ...formData.targeting,
                          behavior: {
                            ...formData.targeting.behavior,
                            previousEngagement: value,
                          },
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="engaged">
                        Previously Engaged
                      </SelectItem>
                      <SelectItem value="new">New Users Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Post Time</Label>
                <Input
                  type="time"
                  value={formData.timing.postTime}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      timing: { ...formData.timing, postTime: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={formData.timing.timezone}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      timing: { ...formData.timing, timezone: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_ZONES.map(tz => (
                      <SelectItem key={tz.id} value={tz.id}>
                        {tz.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blotato" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Scheduled Posts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically schedule posts via Blotato
                  </p>
                </div>
                <Switch
                  checked={formData.blotato.scheduledPosts}
                  onCheckedChange={checked =>
                    setFormData({
                      ...formData,
                      blotato: { ...formData.blotato, scheduledPosts: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Account IDs (comma separated)</Label>
                <Input
                  placeholder="account1, account2, account3"
                  value={formData.blotato.accountIds.join(", ")}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      blotato: {
                        ...formData.blotato,
                        accountIds: e.target.value
                          .split(",")
                          .map(id => id.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <NormalButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </NormalButton>
          <NormalButton onClick={() => onSave(formData)}>
            Save Variant
          </NormalButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Calendar,
  Target,
  Users,
  DollarSign,
  Settings,
  Plus,
  Minus,
  Copy,
  Eye,
  BarChart3,
  Clock,
  Zap,
  Brain,
  Sparkles,
  Globe,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Palette,
  FileText,
  Save,
  Play,
  RefreshCw,
} from "lucide-react";
import {
  CrossPlatformType,
  CrossPlatformCampaign,
} from "@/lib/workflows/cross-platform-content-manager";
import {
  ABTest,
  ABVariant,
  CampaignMetrics,
} from "@/lib/marketing/campaign-performance-service";

// Types for Campaign Creation
interface CampaignFormData {
  name: string;
  description: string;
  campaignType:
    | "awareness"
    | "engagement"
    | "conversion"
    | "retention"
    | "seasonal"
    | "product_launch";
  targetPlatforms: CrossPlatformType[];
  startDate: Date;
  endDate: Date;
  budget: {
    total: number;
    daily?: number;
    platformAllocation: Record<string, number>;
  };
  targetAudience: {
    demographics: string[];
    interests: string[];
    locations: string[];
    customAudiences: string[];
  };
  goals: {
    primary: string;
    kpis: { metric: string; target: number; unit: string }[];
  };
  abTesting: {
    enabled: boolean;
    variants: CampaignVariant[];
    testType: "creative" | "audience" | "timing" | "budget";
    trafficSplit: number[];
  };
  content: {
    templateId?: string;
    customContent: boolean;
    brandVoice:
      | "professional"
      | "casual"
      | "friendly"
      | "authoritative"
      | "creative";
    contentThemes: string[];
  };
  scheduling: {
    strategy: "immediate" | "scheduled" | "optimal-timing" | "cascade";
    customSchedule?: Record<string, Date>;
    timezone: string;
  };
  automation: {
    autoOptimization: boolean;
    budgetReallocation: boolean;
    performanceAlerts: boolean;
    autoScale: boolean;
  };
}

interface CampaignVariant {
  id: string;
  name: string;
  description: string;
  creative?: {
    headline: string;
    description: string;
    ctaText: string;
    imageUrl?: string;
  };
  audience?: {
    demographics: string[];
    interests: string[];
  };
  budget?: number;
}

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "product_launch"
    | "brand_awareness"
    | "conversion"
    | "seasonal"
    | "engagement";
  platforms: CrossPlatformType[];
  estimatedBudget: { min: number; max: number };
  duration: { min: number; max: number }; // days
  templates: {
    creative: string[];
    copy: string[];
    hashtags: string[];
  };
  goals: string[];
  kpis: { metric: string; benchmark: number; unit: string }[];
  preview: string;
}

// Platform configurations
const PLATFORM_CONFIGS = {
  instagram: {
    name: "Instagram",
    icon: "📷",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    minBudget: 1,
    maxCharacters: 2200,
    contentTypes: ["post", "story", "reel", "carousel"],
    audienceSize: "1.2B",
  },
  facebook: {
    name: "Facebook",
    icon: "📘",
    color: "bg-gradient-to-br from-blue-600 to-blue-800",
    minBudget: 1,
    maxCharacters: 63206,
    contentTypes: ["post", "story", "video", "carousel"],
    audienceSize: "2.9B",
  },
  linkedin: {
    name: "LinkedIn",
    icon: "💼",
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
    minBudget: 2,
    maxCharacters: 3000,
    contentTypes: ["post", "article", "video", "carousel"],
    audienceSize: "900M",
  },
  twitter: {
    name: "Twitter",
    icon: "🐦",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    minBudget: 1,
    maxCharacters: 280,
    contentTypes: ["post", "thread", "video"],
    audienceSize: "450M",
  },
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    color: "bg-gradient-to-br from-black to-red-600",
    minBudget: 20,
    maxCharacters: 4000,
    contentTypes: ["video", "post"],
    audienceSize: "1B",
  },
};

// Pre-built campaign templates
const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "product-launch-pro",
    name: "Product Launch Pro",
    description:
      "Complete product launch campaign with pre-launch buzz, launch day, and follow-up",
    category: "product_launch",
    platforms: ["instagram", "facebook", "linkedin", "twitter"],
    estimatedBudget: { min: 2000, max: 10000 },
    duration: { min: 14, max: 30 },
    templates: {
      creative: [
        "🚀 Something amazing is coming... Get ready!",
        "The wait is almost over. {PRODUCT_NAME} launches {DATE}",
        "Meet {PRODUCT_NAME} - the future of {INDUSTRY}",
      ],
      copy: [
        "Revolutionary {PRODUCT_TYPE} that will change how you {ACTION}",
        "After months of development, we're excited to share {PRODUCT_NAME}",
      ],
      hashtags: ["#ProductLaunch", "#Innovation", "#NewProduct", "#ComingSoon"],
    },
    goals: [
      "Brand Awareness",
      "Pre-orders",
      "Email Signups",
      "Social Engagement",
    ],
    kpis: [
      { metric: "Reach", benchmark: 100000, unit: "impressions" },
      { metric: "Engagement Rate", benchmark: 3.5, unit: "%" },
      { metric: "Conversions", benchmark: 500, unit: "signups" },
    ],
    preview:
      "Multi-phase product launch with teaser content, launch announcement, and follow-up campaigns.",
  },
  {
    id: "brand-awareness-360",
    name: "Brand Awareness 360",
    description:
      "Comprehensive brand awareness campaign across all major platforms",
    category: "brand_awareness",
    platforms: ["instagram", "facebook", "linkedin", "twitter", "tiktok"],
    estimatedBudget: { min: 1500, max: 8000 },
    duration: { min: 21, max: 60 },
    templates: {
      creative: [
        "Discover what makes {BRAND_NAME} different",
        "Join the {BRAND_NAME} community",
        "Behind the scenes at {BRAND_NAME}",
      ],
      copy: [
        "We believe in {BRAND_VALUE}. That's why we {BRAND_ACTION}",
        "Meet the team behind {BRAND_NAME}",
      ],
      hashtags: ["#BrandStory", "#Community", "#Values", "#BehindTheScenes"],
    },
    goals: ["Brand Recognition", "Audience Growth", "Community Building"],
    kpis: [
      { metric: "Brand Mentions", benchmark: 1000, unit: "mentions" },
      { metric: "Follower Growth", benchmark: 15, unit: "%" },
      { metric: "Share of Voice", benchmark: 25, unit: "%" },
    ],
    preview:
      "Build brand recognition through storytelling, community engagement, and consistent messaging.",
  },
  {
    id: "conversion-optimizer",
    name: "Conversion Optimizer",
    description:
      "High-performance conversion campaign with advanced retargeting",
    category: "conversion",
    platforms: ["facebook", "instagram", "linkedin"],
    estimatedBudget: { min: 3000, max: 15000 },
    duration: { min: 14, max: 45 },
    templates: {
      creative: [
        "Limited time offer: {DISCOUNT}% off {PRODUCT_NAME}",
        "Don't miss out - only {TIME_LEFT} left!",
        "Join {NUMBER} satisfied customers",
      ],
      copy: [
        "Transform your {AREA} with {PRODUCT_NAME}. Get {BENEFIT} in just {TIMEFRAME}",
        "See why {TESTIMONIAL_COUNT} customers choose {BRAND_NAME}",
      ],
      hashtags: ["#LimitedOffer", "#Sale", "#Transform", "#Results"],
    },
    goals: ["Sales", "Conversions", "ROI Optimization"],
    kpis: [
      { metric: "ROAS", benchmark: 4.0, unit: "x" },
      { metric: "Conversion Rate", benchmark: 2.5, unit: "%" },
      { metric: "CPA", benchmark: 25, unit: "€" },
    ],
    preview:
      "Drive sales with compelling offers, social proof, and strategic retargeting campaigns.",
  },
];

interface CampaignCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated: (campaign: Partial<CrossPlatformCampaign>) => void;
  existingCampaign?: Partial<CrossPlatformCampaign>;
}

export default function CampaignCreationModal({
  open,
  onOpenChange,
  onCampaignCreated,
  existingCampaign,
}: CampaignCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    campaignType: "awareness",
    targetPlatforms: [],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    budget: {
      total: 1000,
      platformAllocation: {},
    },
    targetAudience: {
      demographics: [],
      interests: [],
      locations: [],
      customAudiences: [],
    },
    goals: {
      primary: "",
      kpis: [],
    },
    abTesting: {
      enabled: false,
      variants: [],
      testType: "creative",
      trafficSplit: [50, 50],
    },
    content: {
      customContent: false,
      brandVoice: "professional",
      contentThemes: [],
    },
    scheduling: {
      strategy: "scheduled",
      timezone: "Europe/Amsterdam",
    },
    automation: {
      autoOptimization: true,
      budgetReallocation: true,
      performanceAlerts: true,
      autoScale: false,
    },
  });

  const [selectedTemplate, setSelectedTemplate] =
    useState<CampaignTemplate | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form steps
  const STEPS = [
    { id: "basics", title: "Campaign Basics", icon: FileText },
    { id: "platforms", title: "Platform Selection", icon: Globe },
    { id: "audience", title: "Target Audience", icon: Users },
    { id: "budget", title: "Budget & Goals", icon: DollarSign },
    { id: "content", title: "Content & Templates", icon: Palette },
    { id: "testing", title: "A/B Testing", icon: BarChart3 },
    { id: "automation", title: "Automation", icon: Zap },
    { id: "review", title: "Review & Launch", icon: CheckCircle },
  ];

  // Initialize form with existing campaign data
  useEffect(() => {
    if (existingCampaign) {
      // Populate form with existing campaign data
      setFormData(prev => ({
        ...prev,
        name: existingCampaign.name || "",
        description: existingCampaign.description || "",
        targetPlatforms: existingCampaign.targetPlatforms || [],
        startDate: existingCampaign.startDate || new Date(),
        endDate: existingCampaign.endDate || new Date(),
        budget: {
          total: existingCampaign.budget || 1000,
          platformAllocation: {},
        },
      }));
    }
  }, [existingCampaign]);

  // Apply template to form
  const applyTemplate = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      campaignType: template.category as any,
      targetPlatforms: template.platforms,
      budget: {
        ...prev.budget,
        total: template.estimatedBudget.min,
      },
      goals: {
        primary: template.goals[0],
        kpis: template.kpis.map(kpi => ({
          metric: kpi.metric,
          target: kpi.benchmark,
          unit: kpi.unit,
        })),
      },
      content: {
        ...prev.content,
        contentThemes: template.templates.hashtags,
      },
    }));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Basics
        if (!formData.name.trim()) errors.name = "Campaign name is required";
        if (!formData.description.trim())
          errors.description = "Description is required";
        break;
      case 1: // Platforms
        if (formData.targetPlatforms.length === 0)
          errors.platforms = "Select at least one platform";
        break;
      case 2: // Audience
        if (formData.targetAudience.demographics.length === 0) {
          errors.audience = "Define target audience demographics";
        }
        break;
      case 3: // Budget
        if (formData.budget.total <= 0)
          errors.budget = "Budget must be greater than 0";
        if (!formData.goals.primary) errors.goals = "Primary goal is required";
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Handle platform selection
  const togglePlatform = (platform: CrossPlatformType) => {
    setFormData(prev => {
      const platforms = prev.targetPlatforms.includes(platform)
        ? prev.targetPlatforms.filter(p => p !== platform)
        : [...prev.targetPlatforms, platform];

      // Update budget allocation
      const allocation = { ...prev.budget.platformAllocation };
      if (platforms.includes(platform)) {
        allocation[platform] = Math.round(prev.budget.total / platforms.length);
      } else {
        delete allocation[platform];
      }

      return {
        ...prev,
        targetPlatforms: platforms,
        budget: { ...prev.budget, platformAllocation: allocation },
      };
    });
  };

  // Handle budget allocation
  const updateBudgetAllocation = (platform: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        platformAllocation: {
          ...prev.budget.platformAllocation,
          [platform]: amount,
        },
      },
    }));
  };

  // Add A/B test variant
  const addABVariant = () => {
    const newVariant: CampaignVariant = {
      id: `variant-${Date.now()}`,
      name: `Variant ${formData.abTesting.variants.length + 1}`,
      description: "",
      creative: {
        headline: "",
        description: "",
        ctaText: "Learn More",
      },
    };

    setFormData(prev => ({
      ...prev,
      abTesting: {
        ...prev.abTesting,
        variants: [...prev.abTesting.variants, newVariant],
      },
    }));
  };

  // Remove A/B test variant
  const removeABVariant = (variantId: string) => {
    setFormData(prev => ({
      ...prev,
      abTesting: {
        ...prev.abTesting,
        variants: prev.abTesting.variants.filter(v => v.id !== variantId),
      },
    }));
  };

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    if (!validateStep(currentStep)) return;

    setIsCreating(true);

    try {
      const campaignData: Partial<CrossPlatformCampaign> = {
        id: existingCampaign?.id || `campaign-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetPlatforms: formData.targetPlatforms,
        budget: formData.budget.total,
        goals: [
          formData.goals.primary,
          ...formData.goals.kpis.map(
            kpi => `${kpi.metric}: ${kpi.target}${kpi.unit}`
          ),
        ],
        targetAudience: [
          ...formData.targetAudience.demographics,
          ...formData.targetAudience.interests,
          ...formData.targetAudience.locations,
        ],
        status: "draft",
        contentIds: [],
        metrics: {
          totalReach: 0,
          totalEngagement: 0,
          totalCost: 0,
          roi: 0,
          conversionRate: 0,
          clickThroughRate: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onCampaignCreated(campaignData);
      onOpenChange(false);

      // Reset form
      setCurrentStep(0);
      setFormData({
        name: "",
        description: "",
        campaignType: "awareness",
        targetPlatforms: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: { total: 1000, platformAllocation: {} },
        targetAudience: {
          demographics: [],
          interests: [],
          locations: [],
          customAudiences: [],
        },
        goals: { primary: "", kpis: [] },
        abTesting: {
          enabled: false,
          variants: [],
          testType: "creative",
          trafficSplit: [50, 50],
        },
        content: {
          customContent: false,
          brandVoice: "professional",
          contentThemes: [],
        },
        scheduling: { strategy: "scheduled", timezone: "Europe/Amsterdam" },
        automation: {
          autoOptimization: true,
          budgetReallocation: true,
          performanceAlerts: true,
          autoScale: false,
        },
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden dark">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {existingCampaign ? "Edit Campaign" : "Create New Campaign"}
              </DialogTitle>
              <DialogDescription>
                Step {currentStep + 1} of {STEPS.length}:{" "}
                {STEPS[currentStep].title}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <NormalButton
                variant="secondary"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Edit" : "Preview"}
              </NormalButton>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress
            value={(currentStep / (STEPS.length - 1)) * 100}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center cursor-pointer transition-colors ${
                    index <= currentStep ? "text-blue-400" : "text-gray-500"
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 0: Campaign Basics */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name *</Label>
                    <Input
                      id="campaign-name"
                      value={formData.name}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter campaign name"
                      className={validationErrors.name ? "border-red-500" : ""}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="campaign-type">Campaign Type</Label>
                    <Select
                      value={formData.campaignType}
                      onValueChange={(value: any) =>
                        setFormData(prev => ({ ...prev, campaignType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">
                          Brand Awareness
                        </SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="conversion">Conversion</SelectItem>
                        <SelectItem value="retention">
                          Customer Retention
                        </SelectItem>
                        <SelectItem value="seasonal">
                          Seasonal Campaign
                        </SelectItem>
                        <SelectItem value="product_launch">
                          Product Launch
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.startDate.toISOString().split("T")[0]}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            startDate: new Date(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.endDate.toISOString().split("T")[0]}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            endDate: new Date(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="campaign-description">Description *</Label>
                  <Textarea
                    id="campaign-description"
                    value={formData.description}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe your campaign objectives and strategy"
                    rows={6}
                    className={
                      validationErrors.description ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Campaign Templates */}
              <div>
                <Label>Campaign Templates</Label>
                <p className="text-sm text-gray-400 mb-4">
                  Choose a pre-built template to get started faster
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CAMPAIGN_TEMPLATES.map(template => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        selectedTemplate?.id === template.id
                          ? "ring-2 ring-blue-500 bg-blue-900/20"
                          : "hover:bg-gray-800/50"
                      }`}
                      onClick={() => applyTemplate(template)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                        <Badge variant="secondary">
                          {template.category.replace("_", " ")}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 mb-3">
                          {template.description}
                        </p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Budget:</span>
                            <span>
                              €{template.estimatedBudget.min.toLocaleString()} -
                              €{template.estimatedBudget.max.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>
                              {template.duration.min}-{template.duration.max}{" "}
                              days
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platforms:</span>
                            <span>{template.platforms.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Platform Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Select Target Platforms *</Label>
                <p className="text-sm text-gray-400 mb-4">
                  Choose which platforms you want to run your campaign on
                </p>
                {validationErrors.platforms && (
                  <p className="text-red-500 text-sm mb-4">
                    {validationErrors.platforms}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
                  const isSelected = formData.targetPlatforms.includes(
                    platform as CrossPlatformType
                  );

                  return (
                    <Card
                      key={platform}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        isSelected
                          ? "ring-2 ring-blue-500 bg-blue-900/20"
                          : "hover:bg-gray-800/50"
                      }`}
                      onClick={() =>
                        togglePlatform(platform as CrossPlatformType)
                      }
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${config.color} text-white text-xl`}
                            >
                              {config.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {config.name}
                              </CardTitle>
                              <p className="text-sm text-gray-400">
                                {config.audienceSize} users
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Min Budget:</span>
                            <span>€{config.minBudget}/day</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Content Types:</span>
                            <span>{config.contentTypes.length} types</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Char Limit:</span>
                            <span>{config.maxCharacters.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Platform Budget Allocation */}
              {formData.targetPlatforms.length > 0 && (
                <div>
                  <Label>Budget Allocation</Label>
                  <p className="text-sm text-gray-400 mb-4">
                    Allocate your total budget across selected platforms
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.targetPlatforms.map(platform => {
                      const config = PLATFORM_CONFIGS[platform];
                      const allocation =
                        formData.budget.platformAllocation[platform] || 0;

                      return (
                        <div
                          key={platform}
                          className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg"
                        >
                          <div
                            className={`p-2 rounded-lg ${config.color} text-white`}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Label>{config.name}</Label>
                              <span className="text-sm text-gray-400">
                                {(
                                  (allocation / formData.budget.total) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <Input
                              type="number"
                              value={allocation}
                              onChange={e =>
                                updateBudgetAllocation(
                                  platform,
                                  Number(e.target.value)
                                )
                              }
                              min={config.minBudget}
                              max={formData.budget.total}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Target Audience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Target Audience Definition *</Label>
                <p className="text-sm text-gray-400 mb-4">
                  Define who you want to reach with your campaign
                </p>
                {validationErrors.audience && (
                  <p className="text-red-500 text-sm mb-4">
                    {validationErrors.audience}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Demographics */}
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Demographics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Age Groups</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          "18-24",
                          "25-34",
                          "35-44",
                          "45-54",
                          "55-64",
                          "65+",
                        ].map(age => (
                          <div
                            key={age}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`age-${age}`}
                              checked={formData.targetAudience.demographics.includes(
                                age
                              )}
                              onChange={e => {
                                const demographics = e.target.checked
                                  ? [
                                      ...formData.targetAudience.demographics,
                                      age,
                                    ]
                                  : formData.targetAudience.demographics.filter(
                                      d => d !== age
                                    );
                                setFormData(prev => ({
                                  ...prev,
                                  targetAudience: {
                                    ...prev.targetAudience,
                                    demographics,
                                  },
                                }));
                              }}
                              className="rounded"
                              aria-label={`Age group ${age}`}
                            />
                            <Label htmlFor={`age-${age}`} className="text-sm">
                              {age}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Gender</Label>
                      <div className="flex gap-4 mt-2">
                        {["All", "Male", "Female", "Non-binary"].map(gender => (
                          <div
                            key={gender}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="radio"
                              id={`gender-${gender}`}
                              name="gender"
                              checked={formData.targetAudience.demographics.includes(
                                gender
                              )}
                              onChange={() => {
                                const demographics =
                                  formData.targetAudience.demographics
                                    .filter(
                                      d =>
                                        ![
                                          "All",
                                          "Male",
                                          "Female",
                                          "Non-binary",
                                        ].includes(d)
                                    )
                                    .concat([gender]);
                                setFormData(prev => ({
                                  ...prev,
                                  targetAudience: {
                                    ...prev.targetAudience,
                                    demographics,
                                  },
                                }));
                              }}
                              className="rounded"
                              aria-label={`Gender ${gender}`}
                            />
                            <Label
                              htmlFor={`gender-${gender}`}
                              className="text-sm"
                            >
                              {gender}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Interests */}
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Interests & Behaviors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Interest Categories</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {[
                          "Technology",
                          "Business",
                          "Health & Fitness",
                          "Travel",
                          "Food & Dining",
                          "Fashion",
                          "Sports",
                          "Entertainment",
                          "Education",
                          "Finance",
                        ].map(interest => (
                          <div
                            key={interest}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`interest-${interest}`}
                              checked={formData.targetAudience.interests.includes(
                                interest
                              )}
                              onChange={e => {
                                const interests = e.target.checked
                                  ? [
                                      ...formData.targetAudience.interests,
                                      interest,
                                    ]
                                  : formData.targetAudience.interests.filter(
                                      i => i !== interest
                                    );
                                setFormData(prev => ({
                                  ...prev,
                                  targetAudience: {
                                    ...prev.targetAudience,
                                    interests,
                                  },
                                }));
                              }}
                              className="rounded"
                              aria-label={`Interest ${interest}`}
                            />
                            <Label
                              htmlFor={`interest-${interest}`}
                              className="text-sm"
                            >
                              {interest}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Locations */}
              <Card className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Geographic Targeting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      "Netherlands",
                      "Germany",
                      "Belgium",
                      "France",
                      "United Kingdom",
                      "United States",
                      "Canada",
                      "Australia",
                      "Global",
                    ].map(location => (
                      <div
                        key={location}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`location-${location}`}
                          checked={formData.targetAudience.locations.includes(
                            location
                          )}
                          onChange={e => {
                            const locations = e.target.checked
                              ? [...formData.targetAudience.locations, location]
                              : formData.targetAudience.locations.filter(
                                  l => l !== location
                                );
                            setFormData(prev => ({
                              ...prev,
                              targetAudience: {
                                ...prev.targetAudience,
                                locations,
                              },
                            }));
                          }}
                          className="rounded"
                        />
                        <Label
                          htmlFor={`location-${location}`}
                          className="text-sm"
                        >
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Budget & Goals */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget Configuration */}
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Budget Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="total-budget">
                        Total Campaign Budget (€) *
                      </Label>
                      <Input
                        id="total-budget"
                        type="number"
                        value={formData.budget.total}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            budget: {
                              ...prev.budget,
                              total: Number(e.target.value),
                            },
                          }))
                        }
                        min="1"
                        className={
                          validationErrors.budget ? "border-red-500" : ""
                        }
                      />
                      {validationErrors.budget && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.budget}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="daily-budget">
                        Daily Budget Limit (€)
                      </Label>
                      <Input
                        id="daily-budget"
                        type="number"
                        value={formData.budget.daily || ""}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            budget: {
                              ...prev.budget,
                              daily: Number(e.target.value) || undefined,
                            },
                          }))
                        }
                        placeholder="Optional"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Leave empty for automatic daily distribution
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Goals & KPIs */}
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Campaign Goals & KPIs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primary-goal">
                        Primary Campaign Goal *
                      </Label>
                      <Select
                        value={formData.goals.primary}
                        onValueChange={value =>
                          setFormData(prev => ({
                            ...prev,
                            goals: { ...prev.goals, primary: value },
                          }))
                        }
                      >
                        <SelectTrigger
                          className={
                            validationErrors.goals ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select primary goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand-awareness">
                            Brand Awareness
                          </SelectItem>
                          <SelectItem value="lead-generation">
                            Lead Generation
                          </SelectItem>
                          <SelectItem value="sales">
                            Sales & Conversions
                          </SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                          <SelectItem value="traffic">
                            Website Traffic
                          </SelectItem>
                          <SelectItem value="app-installs">
                            App Installs
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.goals && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.goals}
                        </p>
                      )}
                    </div>

                    {/* KPI Targets */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Key Performance Indicators</Label>
                        <NormalButton
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const newKPI = {
                              metric: "Impressions",
                              target: 10000,
                              unit: "views",
                            };
                            setFormData(prev => ({
                              ...prev,
                              goals: {
                                ...prev.goals,
                                kpis: [...prev.goals.kpis, newKPI],
                              },
                            }));
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add KPI
                        </NormalButton>
                      </div>

                      <div className="space-y-3">
                        {formData.goals.kpis.map((kpi, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-800/50 rounded"
                          >
                            <Select
                              value={kpi.metric}
                              onValueChange={value => {
                                const updatedKPIs = [...formData.goals.kpis];
                                updatedKPIs[index] = { ...kpi, metric: value };
                                setFormData(prev => ({
                                  ...prev,
                                  goals: { ...prev.goals, kpis: updatedKPIs },
                                }));
                              }}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Impressions">
                                  Impressions
                                </SelectItem>
                                <SelectItem value="Clicks">Clicks</SelectItem>
                                <SelectItem value="Conversions">
                                  Conversions
                                </SelectItem>
                                <SelectItem value="CTR">
                                  Click-Through Rate
                                </SelectItem>
                                <SelectItem value="CPA">
                                  Cost per Acquisition
                                </SelectItem>
                                <SelectItem value="ROAS">
                                  Return on Ad Spend
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              type="number"
                              value={kpi.target}
                              onChange={e => {
                                const updatedKPIs = [...formData.goals.kpis];
                                updatedKPIs[index] = {
                                  ...kpi,
                                  target: Number(e.target.value),
                                };
                                setFormData(prev => ({
                                  ...prev,
                                  goals: { ...prev.goals, kpis: updatedKPIs },
                                }));
                              }}
                              className="w-24"
                              placeholder="Target"
                            />

                            <Select
                              value={kpi.unit}
                              onValueChange={value => {
                                const updatedKPIs = [...formData.goals.kpis];
                                updatedKPIs[index] = { ...kpi, unit: value };
                                setFormData(prev => ({
                                  ...prev,
                                  goals: { ...prev.goals, kpis: updatedKPIs },
                                }));
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="views">Views</SelectItem>
                                <SelectItem value="clicks">Clicks</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                                <SelectItem value="€">€</SelectItem>
                                <SelectItem value="x">x</SelectItem>
                              </SelectContent>
                            </Select>

                            <NormalButton
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const updatedKPIs = formData.goals.kpis.filter(
                                  (_, i) => i !== index
                                );
                                setFormData(prev => ({
                                  ...prev,
                                  goals: { ...prev.goals, kpis: updatedKPIs },
                                }));
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </NormalButton>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Content & Templates */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content Strategy */}
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Content Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Brand Voice</Label>
                      <Select
                        value={formData.content.brandVoice}
                        onValueChange={(value: any) =>
                          setFormData(prev => ({
                            ...prev,
                            content: { ...prev.content, brandVoice: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="casual">
                            Casual & Friendly
                          </SelectItem>
                          <SelectItem value="friendly">
                            Warm & Approachable
                          </SelectItem>
                          <SelectItem value="authoritative">
                            Expert & Authoritative
                          </SelectItem>
                          <SelectItem value="creative">
                            Creative & Bold
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Content Themes</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          "Educational",
                          "Behind-the-scenes",
                          "Product showcase",
                          "Customer stories",
                          "Industry news",
                          "Tips & tricks",
                          "Seasonal content",
                          "User-generated content",
                        ].map(theme => (
                          <div
                            key={theme}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`theme-${theme}`}
                              checked={formData.content.contentThemes.includes(
                                theme
                              )}
                              onChange={e => {
                                const themes = e.target.checked
                                  ? [...formData.content.contentThemes, theme]
                                  : formData.content.contentThemes.filter(
                                      t => t !== theme
                                    );
                                setFormData(prev => ({
                                  ...prev,
                                  content: {
                                    ...prev.content,
                                    contentThemes: themes,
                                  },
                                }));
                              }}
                              className="rounded"
                            />
                            <Label
                              htmlFor={`theme-${theme}`}
                              className="text-sm"
                            >
                              {theme}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="custom-content"
                        checked={formData.content.customContent}
                        onCheckedChange={checked =>
                          setFormData(prev => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              customContent: checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor="custom-content">
                        Use custom content (override templates)
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Scheduling Strategy */}
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Scheduling Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Publishing Strategy</Label>
                      <Select
                        value={formData.scheduling.strategy}
                        onValueChange={(value: any) =>
                          setFormData(prev => ({
                            ...prev,
                            scheduling: { ...prev.scheduling, strategy: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">
                            Immediate Publishing
                          </SelectItem>
                          <SelectItem value="scheduled">
                            Scheduled Publishing
                          </SelectItem>
                          <SelectItem value="optimal-timing">
                            AI Optimal Timing
                          </SelectItem>
                          <SelectItem value="cascade">
                            Cascade (Staggered)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Timezone</Label>
                      <Select
                        value={formData.scheduling.timezone}
                        onValueChange={value =>
                          setFormData(prev => ({
                            ...prev,
                            scheduling: { ...prev.scheduling, timezone: value },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Amsterdam">
                            Europe/Amsterdam (CET)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            Europe/London (GMT)
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            America/New_York (EST)
                          </SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            America/Los_Angeles (PST)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 5: A/B Testing */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>A/B Testing Configuration</Label>
                  <p className="text-sm text-gray-400">
                    Test different variants to optimize campaign performance
                  </p>
                </div>
                <Switch
                  checked={formData.abTesting.enabled}
                  onCheckedChange={checked =>
                    setFormData(prev => ({
                      ...prev,
                      abTesting: { ...prev.abTesting, enabled: checked },
                    }))
                  }
                />
              </div>

              {formData.abTesting.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Test Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Test Type</Label>
                        <Select
                          value={formData.abTesting.testType}
                          onValueChange={(value: any) =>
                            setFormData(prev => ({
                              ...prev,
                              abTesting: { ...prev.abTesting, testType: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="creative">
                              Creative Testing
                            </SelectItem>
                            <SelectItem value="audience">
                              Audience Testing
                            </SelectItem>
                            <SelectItem value="timing">
                              Timing Testing
                            </SelectItem>
                            <SelectItem value="budget">
                              Budget Testing
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Traffic Split</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">Variant A:</span>
                          <Input
                            type="number"
                            value={formData.abTesting.trafficSplit[0]}
                            onChange={e => {
                              const newSplit = [
                                Number(e.target.value),
                                100 - Number(e.target.value),
                              ];
                              setFormData(prev => ({
                                ...prev,
                                abTesting: {
                                  ...prev.abTesting,
                                  trafficSplit: newSplit,
                                },
                              }));
                            }}
                            min="10"
                            max="90"
                            className="w-20"
                          />
                          <span className="text-sm">%</span>
                          <span className="text-sm">
                            Variant B: {formData.abTesting.trafficSplit[1]}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Test Variants
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm">
                          Variants ({formData.abTesting.variants.length})
                        </span>
                        <NormalButton size="sm" onClick={addABVariant}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Variant
                        </NormalButton>
                      </div>

                      <div className="space-y-3">
                        {formData.abTesting.variants.map((variant, index) => (
                          <div
                            key={variant.id}
                            className="p-3 border border-gray-700 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Input
                                value={variant.name}
                                onChange={e => {
                                  const updatedVariants = [
                                    ...formData.abTesting.variants,
                                  ];
                                  updatedVariants[index] = {
                                    ...variant,
                                    name: e.target.value,
                                  };
                                  setFormData(prev => ({
                                    ...prev,
                                    abTesting: {
                                      ...prev.abTesting,
                                      variants: updatedVariants,
                                    },
                                  }));
                                }}
                                placeholder="Variant name"
                                className="font-medium"
                              />
                              <NormalButton
                                size="sm"
                                variant="secondary"
                                onClick={() => removeABVariant(variant.id)}
                              >
                                <Minus className="h-4 w-4" />
                              </NormalButton>
                            </div>

                            <Textarea
                              value={variant.description}
                              onChange={e => {
                                const updatedVariants = [
                                  ...formData.abTesting.variants,
                                ];
                                updatedVariants[index] = {
                                  ...variant,
                                  description: e.target.value,
                                };
                                setFormData(prev => ({
                                  ...prev,
                                  abTesting: {
                                    ...prev.abTesting,
                                    variants: updatedVariants,
                                  },
                                }));
                              }}
                              placeholder="Describe what makes this variant different..."
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Automation */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <Label>Automation Settings</Label>
                <p className="text-sm text-gray-400 mb-4">
                  Configure intelligent automation features for your campaign
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Performance Automation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Optimization</Label>
                        <p className="text-xs text-gray-400">
                          Automatically adjust targeting based on performance
                        </p>
                      </div>
                      <Switch
                        checked={formData.automation.autoOptimization}
                        onCheckedChange={checked =>
                          setFormData(prev => ({
                            ...prev,
                            automation: {
                              ...prev.automation,
                              autoOptimization: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Budget Reallocation</Label>
                        <p className="text-xs text-gray-400">
                          Shift budget to best-performing platforms
                        </p>
                      </div>
                      <Switch
                        checked={formData.automation.budgetReallocation}
                        onCheckedChange={checked =>
                          setFormData(prev => ({
                            ...prev,
                            automation: {
                              ...prev.automation,
                              budgetReallocation: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Scaling</Label>
                        <p className="text-xs text-gray-400">
                          Increase budget when performance is strong
                        </p>
                      </div>
                      <Switch
                        checked={formData.automation.autoScale}
                        onCheckedChange={checked =>
                          setFormData(prev => ({
                            ...prev,
                            automation: {
                              ...prev.automation,
                              autoScale: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Alerts & Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Performance Alerts</Label>
                        <p className="text-xs text-gray-400">
                          Get notified about significant changes
                        </p>
                      </div>
                      <Switch
                        checked={formData.automation.performanceAlerts}
                        onCheckedChange={checked =>
                          setFormData(prev => ({
                            ...prev,
                            automation: {
                              ...prev.automation,
                              performanceAlerts: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 7: Review & Launch */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <Label>Campaign Review</Label>
                <p className="text-sm text-gray-400 mb-4">
                  Review your campaign settings before launching
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Summary */}
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle>Campaign Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Name:</span>
                      <span className="text-sm font-medium">
                        {formData.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Type:</span>
                      <span className="text-sm">
                        {formData.campaignType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Duration:</span>
                      <span className="text-sm">
                        {Math.ceil(
                          (formData.endDate.getTime() -
                            formData.startDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Budget:</span>
                      <span className="text-sm font-medium">
                        €{formData.budget.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Platforms:</span>
                      <span className="text-sm">
                        {formData.targetPlatforms.length} platforms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        A/B Testing:
                      </span>
                      <span className="text-sm">
                        {formData.abTesting.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Breakdown */}
                <Card className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle>Platform Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.targetPlatforms.map(platform => {
                        const config = PLATFORM_CONFIGS[platform];
                        const allocation =
                          formData.budget.platformAllocation[platform] || 0;
                        const percentage = (
                          (allocation / formData.budget.total) *
                          100
                        ).toFixed(1);

                        return (
                          <div
                            key={platform}
                            className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{config.icon}</span>
                              <span className="text-sm">{config.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                €{allocation.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <NormalButton variant="secondary" onClick={prevStep}>
                Previous
              </NormalButton>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 ? (
              <NormalButton onClick={nextStep}>Next</NormalButton>
            ) : (
              <NormalButton
                onClick={handleCreateCampaign}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {existingCampaign ? "Update Campaign" : "Create Campaign"}
                  </>
                )}
              </NormalButton>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

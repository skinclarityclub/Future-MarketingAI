"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Settings,
  Zap,
  Crown,
  Shield,
  Users,
  BarChart3,
  CheckCircle,
  Trash2,
  Edit,
  Copy,
  Star,
  Target,
  Rocket,
  Gem,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DemoTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: Record<string, number>;
  metadata: {
    popular?: boolean;
    recommended?: boolean;
    supportLevel: string;
    businessSize: string;
    tags: string[];
  };
}

interface DemoFeature {
  key: string;
  name: string;
  description: string;
  category: string;
  requiredTier: string;
}

const DEMO_CATEGORIES = {
  dashboard: { name: "Dashboard", icon: BarChart3, color: "blue" },
  analytics: { name: "Analytics", icon: TrendingUp, color: "green" },
  ai: { name: "AI Features", icon: Zap, color: "purple" },
  integrations: { name: "Integrations", icon: Users, color: "orange" },
  enterprise: { name: "Enterprise", icon: Shield, color: "red" },
};

export default function ExtensibleTierDemo() {
  const [tiers, setTiers] = useState<DemoTier[]>([
    {
      id: "free",
      name: "Free",
      description: "Basic features to get started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ["basic_dashboard", "team_collaboration"],
      limits: { maxUsers: 2, maxProjects: 1, storageGB: 1 },
      metadata: {
        supportLevel: "community",
        businessSize: "individual",
        tags: ["free", "basic"],
      },
    },
    {
      id: "professional",
      name: "Professional",
      description: "Advanced features for growing teams",
      monthlyPrice: 149,
      yearlyPrice: 1490,
      features: [
        "basic_dashboard",
        "advanced_dashboard",
        "ai_chatbot",
        "analytics",
      ],
      limits: { maxUsers: 25, maxProjects: 10, storageGB: 100 },
      metadata: {
        popular: true,
        supportLevel: "priority",
        businessSize: "medium",
        tags: ["popular", "business"],
      },
    },
  ]);

  const [features, setFeatures] = useState<DemoFeature[]>([
    {
      key: "basic_dashboard",
      name: "Basic Dashboard",
      description: "Basic analytics overview",
      category: "dashboard",
      requiredTier: "free",
    },
    {
      key: "advanced_dashboard",
      name: "Advanced Dashboard",
      description: "Advanced widgets and customization",
      category: "dashboard",
      requiredTier: "professional",
    },
    {
      key: "ai_chatbot",
      name: "AI Assistant",
      description: "Intelligent chatbot",
      category: "ai",
      requiredTier: "professional",
    },
    {
      key: "analytics",
      name: "Advanced Analytics",
      description: "Deep data insights",
      category: "analytics",
      requiredTier: "professional",
    },
    {
      key: "team_collaboration",
      name: "Team Collaboration",
      description: "Team workspaces",
      category: "integrations",
      requiredTier: "free",
    },
  ]);

  const [showAddTierDialog, setShowAddTierDialog] = useState(false);
  const [showAddFeatureDialog, setShowAddFeatureDialog] = useState(false);
  const [newTier, setNewTier] = useState<Partial<DemoTier>>({
    metadata: { tags: [], supportLevel: "email", businessSize: "small" },
  });
  const [newFeature, setNewFeature] = useState<Partial<DemoFeature>>({});

  const handleAddTier = () => {
    if (
      newTier.name &&
      newTier.description &&
      newTier.monthlyPrice !== undefined
    ) {
      const tier: DemoTier = {
        id: newTier.name!.toLowerCase().replace(/\s+/g, "_"),
        name: newTier.name!,
        description: newTier.description!,
        monthlyPrice: newTier.monthlyPrice!,
        yearlyPrice: newTier.yearlyPrice || newTier.monthlyPrice! * 10,
        features: newTier.features || [],
        limits: newTier.limits || {},
        metadata: newTier.metadata || {
          tags: [],
          supportLevel: "email",
          businessSize: "small",
        },
      };

      setTiers(prev =>
        [...prev, tier].sort((a, b) => a.monthlyPrice - b.monthlyPrice)
      );
      setShowAddTierDialog(false);
      setNewTier({
        metadata: { tags: [], supportLevel: "email", businessSize: "small" },
      });
    }
  };

  const handleAddFeature = () => {
    if (
      newFeature.key &&
      newFeature.name &&
      newFeature.category &&
      newFeature.requiredTier
    ) {
      const feature: DemoFeature = {
        key: newFeature.key!,
        name: newFeature.name!,
        description: newFeature.description || "",
        category: newFeature.category!,
        requiredTier: newFeature.requiredTier!,
      };

      setFeatures(prev => [...prev, feature]);
      setShowAddFeatureDialog(false);
      setNewFeature({});
    }
  };

  const addPredefinedTier = (
    type: "startup" | "agency" | "enterprise_plus"
  ) => {
    const predefinedTiers = {
      startup: {
        id: "startup",
        name: "Startup",
        description: "Perfect for growing startups",
        monthlyPrice: 79,
        yearlyPrice: 790,
        features: ["basic_dashboard", "advanced_dashboard", "ai_chatbot"],
        limits: { maxUsers: 10, maxProjects: 5, storageGB: 50 },
        metadata: {
          recommended: true,
          supportLevel: "email",
          businessSize: "small",
          tags: ["startup", "growth"],
        },
      },
      agency: {
        id: "agency",
        name: "Agency",
        description: "Specialized for marketing agencies",
        monthlyPrice: 299,
        yearlyPrice: 2990,
        features: [
          "basic_dashboard",
          "advanced_dashboard",
          "ai_chatbot",
          "analytics",
          "team_collaboration",
        ],
        limits: { maxUsers: 50, maxProjects: 25, storageGB: 250 },
        metadata: {
          supportLevel: "priority",
          businessSize: "medium",
          tags: ["agency", "marketing", "specialized"],
        },
      },
      enterprise_plus: {
        id: "enterprise_plus",
        name: "Enterprise+",
        description: "Ultimate enterprise solution",
        monthlyPrice: 799,
        yearlyPrice: 7990,
        features: [
          "basic_dashboard",
          "advanced_dashboard",
          "ai_chatbot",
          "analytics",
          "team_collaboration",
        ],
        limits: { maxUsers: -1, maxProjects: -1, storageGB: -1 },
        metadata: {
          supportLevel: "dedicated",
          businessSize: "enterprise",
          tags: ["enterprise", "unlimited", "premium"],
        },
      },
    };

    const tier = predefinedTiers[type];
    setTiers(prev =>
      [...prev, tier].sort((a, b) => a.monthlyPrice - b.monthlyPrice)
    );
  };

  const getTierIcon = (tier: DemoTier) => {
    if (tier.monthlyPrice === 0)
      return <Users className="h-5 w-5 text-gray-400" />;
    if (tier.monthlyPrice < 100)
      return <Target className="h-5 w-5 text-blue-400" />;
    if (tier.monthlyPrice < 300)
      return <Rocket className="h-5 w-5 text-purple-400" />;
    if (tier.monthlyPrice < 500)
      return <Crown className="h-5 w-5 text-yellow-400" />;
    return <Gem className="h-5 w-5 text-pink-400" />;
  };

  const getCategoryIcon = (category: string) => {
    const cat = DEMO_CATEGORIES[category as keyof typeof DEMO_CATEGORIES];
    if (!cat) return <Settings className="h-4 w-4" />;
    const Icon = cat.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Extensible Tier Architecture Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Demonstratie van hoe eenvoudig nieuwe subscription tiers en features
            kunnen worden toegevoegd
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-400" />
              Extensibiliteit Voordelen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-300">
                  🚀 Zero Downtime
                </h4>
                <p className="text-sm text-gray-300">
                  Nieuwe tiers toevoegen zonder code deployment
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-300">
                  🔧 Dynamic Features
                </h4>
                <p className="text-sm text-gray-300">
                  Features en beperkingen configureerbaar via UI
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-300">
                  📊 Advanced Targeting
                </h4>
                <p className="text-sm text-gray-300">
                  Complexe conditional logic en A/B testing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Dialog open={showAddTierDialog} onOpenChange={setShowAddTierDialog}>
            <DialogTrigger asChild>
              <NormalButton
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nieuwe Tier Toevoegen
              </NormalButton>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Nieuwe Subscription Tier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tier Naam</Label>
                  <Input
                    value={newTier.name || ""}
                    onChange={e =>
                      setNewTier(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="bijv. Startup Pro"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <Label>Beschrijving</Label>
                  <Textarea
                    value={newTier.description || ""}
                    onChange={e =>
                      setNewTier(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Korte beschrijving van de tier"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Maandprijs (€)</Label>
                    <Input
                      type="number"
                      value={newTier.monthlyPrice || ""}
                      onChange={e =>
                        setNewTier(prev => ({
                          ...prev,
                          monthlyPrice: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label>Jaarprijs (€)</Label>
                    <Input
                      type="number"
                      value={newTier.yearlyPrice || ""}
                      onChange={e =>
                        setNewTier(prev => ({
                          ...prev,
                          yearlyPrice: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <NormalButton onClick={handleAddTier} className="w-full">
                  Tier Toevoegen
                </NormalButton>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showAddFeatureDialog}
            onOpenChange={setShowAddFeatureDialog}
          >
            <DialogTrigger asChild>
              <NormalButton
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Nieuwe Feature Toevoegen
              </NormalButton>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Nieuwe Feature</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Feature Key</Label>
                  <Input
                    value={newFeature.key || ""}
                    onChange={e =>
                      setNewFeature(prev => ({ ...prev, key: e.target.value }))
                    }
                    placeholder="bijv. advanced_reporting"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <Label>Feature Naam</Label>
                  <Input
                    value={newFeature.name || ""}
                    onChange={e =>
                      setNewFeature(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="bijv. Advanced Reporting"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <Label>Categorie</Label>
                  <Select
                    value={newFeature.category || ""}
                    onValueChange={value =>
                      setNewFeature(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Selecteer categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEMO_CATEGORIES).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Minimum Tier</Label>
                  <Select
                    value={newFeature.requiredTier || ""}
                    onValueChange={value =>
                      setNewFeature(prev => ({ ...prev, requiredTier: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Selecteer tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.map(tier => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <NormalButton onClick={handleAddFeature} className="w-full">
                  Feature Toevoegen
                </NormalButton>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <NormalButton
              variant="outline"
              onClick={() => addPredefinedTier("startup")}
              className="text-xs"
            >
              + Startup Tier
            </NormalButton>
            <NormalButton
              variant="outline"
              onClick={() => addPredefinedTier("agency")}
              className="text-xs"
            >
              + Agency Tier
            </NormalButton>
            <NormalButton
              variant="outline"
              onClick={() => addPredefinedTier("enterprise_plus")}
              className="text-xs"
            >
              + Enterprise+ Tier
            </NormalButton>
          </div>
        </div>

        {/* Current Tiers */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Huidige Subscription Tiers ({tiers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {tiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className={`bg-gray-700/50 border-gray-600 relative ${tier.metadata.popular ? "ring-2 ring-blue-500" : ""}`}
                    >
                      {tier.metadata.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-600 text-white">
                            Populair
                          </Badge>
                        </div>
                      )}
                      {tier.metadata.recommended && (
                        <div className="absolute -top-3 right-4">
                          <Badge className="bg-green-600 text-white">
                            Aanbevolen
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          {getTierIcon(tier)}
                          <div>
                            <CardTitle className="text-lg">
                              {tier.name}
                            </CardTitle>
                            <p className="text-sm text-gray-400">
                              {tier.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            €{tier.monthlyPrice}
                          </span>
                          <span className="text-gray-400">/maand</span>
                          {tier.yearlyPrice > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              €{tier.yearlyPrice}/jaar
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">
                            Features
                          </h4>
                          <div className="space-y-1">
                            {tier.features.map(featureKey => {
                              const feature = features.find(
                                f => f.key === featureKey
                              );
                              return (
                                <div
                                  key={featureKey}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <span>{feature?.name || featureKey}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-300 mb-2">
                            Limieten
                          </h4>
                          <div className="space-y-1 text-sm text-gray-400">
                            {Object.entries(tier.limits).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key}:</span>
                                <span>
                                  {value === -1 ? "Unlimited" : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {tier.metadata.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <NormalButton
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </NormalButton>
                          <NormalButton
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Clone
                          </NormalButton>
                          <NormalButton
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setTiers(prev =>
                                prev.filter(t => t.id !== tier.id)
                              )
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </NormalButton>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-400" />
              Beschikbare Features ({features.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(feature => (
                <Card
                  key={feature.key}
                  className="bg-gray-700/30 border-gray-600"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(feature.category)}
                      <span className="font-medium">{feature.name}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {DEMO_CATEGORIES[
                          feature.category as keyof typeof DEMO_CATEGORIES
                        ]?.name || feature.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <ArrowRight className="h-3 w-3" />
                        {tiers.find(t => t.id === feature.requiredTier)?.name ||
                          feature.requiredTier}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Architecture Benefits */}
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <CheckCircle className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-blue-300">
            Architectuur Voordelen
          </AlertTitle>
          <AlertDescription className="text-blue-200 space-y-2">
            <div>
              ✅ <strong>Zero-downtime updates:</strong> Nieuwe tiers en
              features toevoegen zonder deployment
            </div>
            <div>
              ✅ <strong>Backward compatibility:</strong> Bestaande integraties
              blijven werken
            </div>
            <div>
              ✅ <strong>A/B testing ready:</strong> Features kunnen
              conditioneel worden geactiveerd
            </div>
            <div>
              ✅ <strong>Future-proof:</strong> Schaalbaar naar honderden tiers
              en duizenden features
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

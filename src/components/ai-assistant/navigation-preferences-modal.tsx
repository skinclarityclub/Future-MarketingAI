"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import NormalButton from "@/components/ui/normal-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2,
  Brain,
  TrendingUp,
  Star,
  ThumbsUp,
  Eye,
  BarChart3,
  Clock,
  MousePointer,
  Users,
  Target,
  Save,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavigationPreferences {
  maxSuggestions: number;
  showConfidenceScores: boolean;
  showRecommendationTypes: boolean;
  enableAnimations: boolean;
  compactMode: boolean;
  enableMLPredictions: boolean;
  enableAISuggestions: boolean;
  enableBehaviorTracking: boolean;
  enableRealTimeUpdates: boolean;
  preferredPages: string[];
  hiddenPages: string[];
  clickToNavigate: boolean;
  hoverPreview: boolean;
  keyboardShortcuts: boolean;
  shareUsageData: boolean;
  personalizedExperience: boolean;
  showUpdateNotifications: boolean;
  highlightNewSuggestions: boolean;
}

export interface NavigationFeedback {
  suggestionId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  comment?: string;
  timestamp: string;
}

interface NavigationPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NavigationPreferences;
  onPreferencesChange: (preferences: NavigationPreferences) => void;
  onFeedbackSubmit: (feedback: NavigationFeedback) => void;
}

const defaultPreferences: NavigationPreferences = {
  maxSuggestions: 5,
  showConfidenceScores: true,
  showRecommendationTypes: true,
  enableAnimations: true,
  compactMode: false,
  enableMLPredictions: true,
  enableAISuggestions: true,
  enableBehaviorTracking: true,
  enableRealTimeUpdates: true,
  preferredPages: [],
  hiddenPages: [],
  clickToNavigate: true,
  hoverPreview: false,
  keyboardShortcuts: true,
  shareUsageData: true,
  personalizedExperience: true,
  showUpdateNotifications: true,
  highlightNewSuggestions: true,
};

export function NavigationPreferencesModal({
  open,
  onOpenChange,
  preferences,
  onPreferencesChange,
  onFeedbackSubmit,
}: NavigationPreferencesModalProps) {
  const [localPreferences, setLocalPreferences] =
    useState<NavigationPreferences>(preferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<1 | 2 | 3 | 4 | 5>(5);

  useEffect(() => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  }, [preferences]);

  const updatePreference = <K extends keyof NavigationPreferences>(
    key: K,
    value: NavigationPreferences[K]
  ) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onPreferencesChange(localPreferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const handleFeedbackSubmit = () => {
    const feedback: NavigationFeedback = {
      suggestionId: "general_feedback",
      rating: feedbackRating,
      helpful: feedbackRating >= 3,
      comment: feedbackText.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    onFeedbackSubmit(feedback);
    setFeedbackText("");
    setFeedbackRating(5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Navigatie Voorkeuren
          </DialogTitle>
          <DialogDescription>
            Personaliseer je navigatie-ervaring en deel feedback om onze
            suggesties te verbeteren.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="display">Weergave</TabsTrigger>
            <TabsTrigger value="behavior">Gedrag</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Weergave Instellingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>
                    Maximum aantal suggesties: {localPreferences.maxSuggestions}
                  </Label>
                  <Slider
                    value={[localPreferences.maxSuggestions]}
                    onValueChange={([value]) =>
                      updatePreference("maxSuggestions", value)
                    }
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confidence">Betrouwbaarheidsscores</Label>
                    <Switch
                      id="confidence"
                      checked={localPreferences.showConfidenceScores}
                      onCheckedChange={checked =>
                        updatePreference("showConfidenceScores", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="types">Aanbeveling types</Label>
                    <Switch
                      id="types"
                      checked={localPreferences.showRecommendationTypes}
                      onCheckedChange={checked =>
                        updatePreference("showRecommendationTypes", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations">Animaties</Label>
                    <Switch
                      id="animations"
                      checked={localPreferences.enableAnimations}
                      onCheckedChange={checked =>
                        updatePreference("enableAnimations", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact">Compacte modus</Label>
                    <Switch
                      id="compact"
                      checked={localPreferences.compactMode}
                      onCheckedChange={checked =>
                        updatePreference("compactMode", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Gedrag Instellingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ml">ML Voorspellingen</Label>
                    <Switch
                      id="ml"
                      checked={localPreferences.enableMLPredictions}
                      onCheckedChange={checked =>
                        updatePreference("enableMLPredictions", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai">AI Suggesties</Label>
                    <Switch
                      id="ai"
                      checked={localPreferences.enableAISuggestions}
                      onCheckedChange={checked =>
                        updatePreference("enableAISuggestions", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="tracking">Gedrag Tracking</Label>
                    <Switch
                      id="tracking"
                      checked={localPreferences.enableBehaviorTracking}
                      onCheckedChange={checked =>
                        updatePreference("enableBehaviorTracking", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="realtime">Real-time Updates</Label>
                    <Switch
                      id="realtime"
                      checked={localPreferences.enableRealTimeUpdates}
                      onCheckedChange={checked =>
                        updatePreference("enableRealTimeUpdates", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Privacy Instellingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Gebruiksdata delen</h4>
                    <p className="text-sm text-muted-foreground">
                      Help ons verbeteren door anonieme data te delen
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.shareUsageData}
                    onCheckedChange={checked =>
                      updatePreference("shareUsageData", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Gepersonaliseerde ervaring</h4>
                    <p className="text-sm text-muted-foreground">
                      Gebruik data voor persoonlijke aanbevelingen
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.personalizedExperience}
                    onCheckedChange={checked =>
                      updatePreference("personalizedExperience", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">
                      Tevredenheid met navigatie suggesties
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <NormalButton
                          key={rating}
                          variant={
                            feedbackRating === rating ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setFeedbackRating(rating as 1 | 2 | 3 | 4 | 5)
                          }
                          className="w-12 h-12"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              feedbackRating >= rating ? "fill-current" : ""
                            )}
                          />
                        </NormalButton>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedback-text">Feedback</Label>
                    <Textarea
                      id="feedback-text"
                      placeholder="Deel je gedachten..."
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <NormalButton
                    onClick={handleFeedbackSubmit}
                    className="w-full"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Feedback Versturen
                  </NormalButton>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {hasChanges && <Badge variant="secondary">Niet opgeslagen</Badge>}
          </div>

          <div className="flex items-center gap-2">
            <NormalButton variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </NormalButton>
            <NormalButton onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </NormalButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

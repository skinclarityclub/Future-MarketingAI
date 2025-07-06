"use client";

import React, { useState, useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Wand2,
  Sparkles,
  Copy,
  Download,
  Share2,
  Eye,
  Zap,
  Target,
  TrendingUp,
  Image as ImageIcon,
  Calendar,
  Clock,
} from "lucide-react";
import { aiContentGenerator } from "@/lib/services/ai-content-generator";
import { contentManagementService } from "@/lib/services/content-management";
import type {
  ContentGenerationRequest,
  GeneratedContent,
} from "@/lib/services/ai-content-generator";

interface AIContentCreatorProps {
  onContentGenerated?: (content: GeneratedContent) => void;
  onContentSaved?: (contentId: string) => void;
  locale?: string;
}

export function AIContentCreator({
  onContentGenerated,
  onContentSaved,
}: AIContentCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [request, setRequest] = useState<ContentGenerationRequest>({
    type: "post",
    platform: ["instagram"],
    tone: "professional",
    length: "medium",
  });
  const [variations, setVariations] = useState<GeneratedContent[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const platforms = [
    { id: "instagram", name: "Instagram", emoji: "📸" },
    { id: "facebook", name: "Facebook", emoji: "👥" },
    { id: "twitter", name: "Twitter", emoji: "🐦" },
    { id: "linkedin", name: "LinkedIn", emoji: "💼" },
    { id: "tiktok", name: "TikTok", emoji: "🎵" },
    { id: "youtube", name: "YouTube", emoji: "📺" },
  ];

  const contentTypes = [
    { id: "post", name: "Social Post", emoji: "📝" },
    { id: "email", name: "Email", emoji: "📧" },
    { id: "ad", name: "Advertisement", emoji: "🎯" },
    { id: "story", name: "Story", emoji: "📚" },
    { id: "campaign", name: "Campaign", emoji: "🚀" },
    { id: "video_script", name: "Video Script", emoji: "🎬" },
  ];

  const tones = [
    { id: "professional", name: "Professional", emoji: "💼" },
    { id: "casual", name: "Casual", emoji: "😊" },
    { id: "friendly", name: "Friendly", emoji: "🤝" },
    { id: "authoritative", name: "Authoritative", emoji: "🎓" },
    { id: "creative", name: "Creative", emoji: "🎨" },
  ];

  const handleGenerateContent = async () => {
    if (!request.topic?.trim()) {
      alert("Please enter a topic for your content");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const content = await aiContentGenerator.generateContent(request);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      setGeneratedContent(content);
      onContentGenerated?.(content);

      // Generate variations if requested
      if (request.platform.length > 1) {
        const contentVariations = await aiContentGenerator.generateVariations(
          request,
          3
        );
        setVariations(contentVariations);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handleSaveContent = async () => {
    if (!generatedContent) return;

    try {
      const contentItem = await contentManagementService.createContentItem({
        title: generatedContent.title,
        type: generatedContent.type,
        platform: generatedContent.platform,
        content_preview: generatedContent.content.substring(0, 100) + "...",
        content_full: generatedContent.content,
        hashtags: generatedContent.hashtags,
        status: "draft",
        author: "AI Assistant",
        scheduled_date: new Date(),
        scheduled_time: "12:00",
        engagement_prediction: generatedContent.metadata.estimatedEngagement,
      });

      onContentSaved?.(contentItem.id);
      alert("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save content. Please try again.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Content copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Content Generation Form */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-blue-600" />
            AI Content Creator
          </CardTitle>
          <CardDescription>
            Generate engaging content with AI-powered tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select
                value={request.type}
                onValueChange={(value: any) =>
                  setRequest(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <span className="flex items-center gap-2">
                        <span>{type.emoji}</span>
                        {type.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={request.tone}
                onValueChange={(value: any) =>
                  setRequest(prev => ({ ...prev, tone: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map(tone => (
                    <SelectItem key={tone.id} value={tone.id}>
                      <span className="flex items-center gap-2">
                        <span>{tone.emoji}</span>
                        {tone.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., New product launch, Company milestone, Industry insights..."
              value={request.topic || ""}
              onChange={e =>
                setRequest(prev => ({ ...prev, topic: e.target.value }))
              }
            />
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(platform => (
                <Badge
                  key={platform.id}
                  variant={
                    request.platform.includes(platform.id)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => {
                    setRequest(prev => ({
                      ...prev,
                      platform: prev.platform.includes(platform.id)
                        ? prev.platform.filter(p => p !== platform.id)
                        : [...prev.platform, platform.id],
                    }));
                  }}
                >
                  <span className="mr-1">{platform.emoji}</span>
                  {platform.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Young professionals, Small businesses..."
                value={request.audience || ""}
                onChange={e =>
                  setRequest(prev => ({ ...prev, audience: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="e.g., innovation, technology, growth"
                value={request.keywords?.join(", ") || ""}
                onChange={e =>
                  setRequest(prev => ({
                    ...prev,
                    keywords: e.target.value
                      .split(",")
                      .map(k => k.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Call to Action</Label>
              <Input
                id="cta"
                placeholder="e.g., Learn more, Sign up now, Get started"
                value={request.callToAction || ""}
                onChange={e =>
                  setRequest(prev => ({
                    ...prev,
                    callToAction: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <NormalButton
              onClick={handleGenerateContent}
              disabled={isGenerating || !request.topic?.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </NormalButton>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Generating your content...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                Generated Content
              </span>
              <div className="flex gap-2">
                <NormalButton
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.content)}
                >
                  <Copy className="h-4 w-4" />
                </NormalButton>
                <NormalButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4" />
                </NormalButton>
                <NormalButton size="sm" onClick={handleSaveContent}>
                  <Download className="mr-2 h-4 w-4" />
                  Save
                </NormalButton>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {generatedContent.title}
                  </h3>
                  <div className="bg-white p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap font-sans">
                      {generatedContent.content}
                    </pre>
                  </div>
                </div>

                {generatedContent.hashtags &&
                  generatedContent.hashtags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Hashtags</h4>
                      <div className="flex flex-wrap gap-1">
                        {generatedContent.hashtags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">
                        {Math.round(
                          generatedContent.metadata.estimatedEngagement
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">Est. Engagement</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">
                        {Math.round(generatedContent.metadata.confidence * 100)}
                        %
                      </p>
                      <p className="text-sm text-gray-600">Confidence</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">
                        {generatedContent.metadata.wordCount}
                      </p>
                      <p className="text-sm text-gray-600">Words</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold">A+</p>
                      <p className="text-sm text-gray-600">AI Grade</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Variations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {generatedContent.suggestions.variations.map(
                        (suggestion, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {suggestion}
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Improvements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {generatedContent.suggestions.improvements.map(
                        (suggestion, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {suggestion}
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Optimizations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {generatedContent.suggestions.optimizations.map(
                        (suggestion, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {suggestion}
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Preview</DialogTitle>
            <DialogDescription>
              How your content will appear on different platforms
            </DialogDescription>
          </DialogHeader>
          {generatedContent && (
            <div className="space-y-4">
              {generatedContent.platform.map(platform => (
                <Card key={platform}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm capitalize">
                      {platform}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">
                        {generatedContent.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

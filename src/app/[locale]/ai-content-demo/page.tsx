"use client";

import React from "react";
import { AIContentCreator } from "@/components/content/ai-content-creator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Zap, Target } from "lucide-react";

interface AIContentDemoPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function AIContentDemoPage({ params }: AIContentDemoPageProps) {
  const { locale } = React.use(params);
  const handleContentGenerated = (content: any) => {
    console.log("Content generated:", content);
  };

  const handleContentSaved = (contentId: string) => {
    console.log("Content saved with ID:", contentId);
  };

  // Locale-aware text content
  const content = {
    en: {
      title: "AI Content Creation Demo",
      subtitle:
        "Experience the power of AI-driven content creation. Generate engaging social media posts, emails, ads, and more with advanced AI technology.",
      smartGeneration: {
        title: "Smart AI Generation",
        description:
          "Advanced AI models create content tailored to your brand voice and audience",
      },
      platformOptimization: {
        title: "Platform Optimization",
        description:
          "Content automatically optimized for different social media platforms",
      },
      performancePrediction: {
        title: "Performance Prediction",
        description:
          "AI-powered engagement prediction and content optimization suggestions",
      },
      badges: {
        multiPlatform: "Multi-Platform Support",
        toneCustomization: "Tone Customization",
        hashtagGeneration: "Hashtag Generation",
        performanceAnalytics: "Performance Analytics",
        contentVariations: "Content Variations",
      },
      integration: {
        title: "Integration Details",
        description:
          "This AI content creation system integrates with existing components from Task 10",
        integratedServices: "Integrated Services:",
        keyFeatures: "Key Features:",
        technicalImplementation: "Technical Implementation:",
      },
    },
    nl: {
      title: "AI Content Creatie Demo",
      subtitle:
        "Ervaar de kracht van AI-gedreven content creatie. Genereer boeiende social media posts, e-mails, advertenties en meer met geavanceerde AI-technologie.",
      smartGeneration: {
        title: "Slimme AI Generatie",
        description:
          "Geavanceerde AI-modellen creëren content afgestemd op jouw merkstem en doelgroep",
      },
      platformOptimization: {
        title: "Platform Optimalisatie",
        description:
          "Content automatisch geoptimaliseerd voor verschillende social media platforms",
      },
      performancePrediction: {
        title: "Prestatie Voorspelling",
        description:
          "AI-gedreven engagement voorspelling en content optimalisatie suggesties",
      },
      badges: {
        multiPlatform: "Multi-Platform Ondersteuning",
        toneCustomization: "Toon Aanpassing",
        hashtagGeneration: "Hashtag Generatie",
        performanceAnalytics: "Prestatie Analytics",
        contentVariations: "Content Variaties",
      },
      integration: {
        title: "Integratie Details",
        description:
          "Dit AI content creatie systeem integreert met bestaande componenten van Taak 10",
        integratedServices: "Geïntegreerde Services:",
        keyFeatures: "Hoofdkenmerken:",
        technicalImplementation: "Technische Implementatie:",
      },
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <CardTitle className="text-lg">
                {t.smartGeneration.title}
              </CardTitle>
              <CardDescription>{t.smartGeneration.description}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-indigo-200 hover:border-indigo-300 transition-colors">
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-indigo-600" />
              <CardTitle className="text-lg">
                {t.platformOptimization.title}
              </CardTitle>
              <CardDescription>
                {t.platformOptimization.description}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <CardTitle className="text-lg">
                {t.performancePrediction.title}
              </CardTitle>
              <CardDescription>
                {t.performancePrediction.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {t.badges.multiPlatform}
          </Badge>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
            {t.badges.toneCustomization}
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {t.badges.hashtagGeneration}
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {t.badges.performanceAnalytics}
          </Badge>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {t.badges.contentVariations}
          </Badge>
        </div>

        {/* Main AI Content Creator */}
        <AIContentCreator
          onContentGenerated={handleContentGenerated}
          onContentSaved={handleContentSaved}
        />

        {/* Integration Information */}
        <Card className="mt-12 border-2 border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle>{t.integration.title}</CardTitle>
            <CardDescription>{t.integration.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">
                {t.integration.integratedServices}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • AI Content Generator Service
                  (src/lib/services/ai-content-generator.ts)
                </li>
                <li>
                  • Enhanced Content Management Service
                  (src/lib/services/content-management.ts)
                </li>
                <li>
                  • AI Configuration System (existing AI personality profiles)
                </li>
                <li>
                  • Content Generation API
                  (src/app/api/content/generate/text/route.ts)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">
                {t.integration.keyFeatures}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • Multiple content types (posts, emails, ads, stories,
                  campaigns, video scripts)
                </li>
                <li>
                  • Platform-specific optimization (Instagram, Facebook,
                  Twitter, LinkedIn, TikTok)
                </li>
                <li>
                  • Tone adjustment (professional, casual, friendly,
                  authoritative, creative)
                </li>
                <li>• Performance prediction and analytics</li>
                <li>• Hashtag generation and content variations</li>
                <li>• Integration with existing content management workflow</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">
                {t.integration.technicalImplementation}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Utilizes existing AI assistant infrastructure</li>
                <li>• Extends content management with AI capabilities</li>
                <li>• RESTful API design for content generation</li>
                <li>• React component with TypeScript support</li>
                <li>• Comprehensive error handling and fallback systems</li>
                <li>• Full internationalization support (EN/NL)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

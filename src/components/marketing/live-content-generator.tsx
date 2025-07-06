"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PremiumCard,
  NormalButton,
  PremiumHeading,
  GlassContainer,
} from "@/components/ui/premium-design-system";
import {
  Wand2,
  Mail,
  MessageSquare,
  FileText,
  Copy,
  Download,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface ContentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
}

interface GeneratedContent {
  type: string;
  title: string;
  content: string;
  metadata?: {
    wordCount?: number;
    estimatedReadTime?: string;
    tone?: string;
  };
}

interface LiveContentGeneratorProps {
  onInteraction?: (type: string, data: any) => void;
  locale?: string;
}

const contentTypes: ContentType[] = [
  {
    id: "email",
    name: "Email Campaign",
    icon: <Mail className="w-5 h-5" />,
    description: "Personalized email marketing campaigns",
    placeholder: "Generate email for new product launch...",
  },
  {
    id: "social",
    name: "Social Media",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "Engaging social media posts",
    placeholder: "Create LinkedIn post about AI innovation...",
  },
  {
    id: "blog",
    name: "Blog Outline",
    icon: <FileText className="w-5 h-5" />,
    description: "Comprehensive blog post outlines",
    placeholder: "Blog outline: How to scale your business...",
  },
];

// Mock AI content generation with realistic results
const generateMockContent = async (
  type: string,
  brand: string,
  industry: string,
  prompt: string,
  locale: string = "en"
): Promise<GeneratedContent> => {
  // Simulate API delay
  await new Promise(resolve =>
    setTimeout(resolve, 2000 + Math.random() * 1000)
  );

  const isNL = locale === "nl";

  const contentTemplates = {
    email: {
      en: {
        title: `${brand} - Exclusive Offer Inside`,
        content: `Subject: Transform Your ${industry} Business with AI-Powered Solutions

Dear Valued Customer,

Are you ready to revolutionize your ${industry} operations? At ${brand}, we understand the unique challenges facing modern businesses in your sector.

🚀 What We're Offering:
• 40% increase in operational efficiency
• Real-time analytics and insights
• Automated workflow management
• 24/7 intelligent support

✨ Special Launch Offer:
Get started with our premium platform for just €99/month (normally €199)
Valid until the end of this month!

Ready to scale your business?
[Book Your Free Demo Today]

Best regards,
The ${brand} Team

P.S. Join over 10,000+ businesses already transforming their operations with our AI-powered solutions.`,
      },
      nl: {
        title: `${brand} - Exclusieve Aanbieding`,
        content: `Onderwerp: Transformeer Uw ${industry} Bedrijf met AI-Gestuurde Oplossingen

Beste Klant,

Bent u klaar om uw ${industry} operaties te revolutioneren? Bij ${brand} begrijpen we de unieke uitdagingen van moderne bedrijven in uw sector.

🚀 Wat Wij Bieden:
• 40% toename in operationele efficiëntie
• Real-time analytics en inzichten
• Geautomatiseerd workflow management
• 24/7 intelligente ondersteuning

✨ Speciale Lanceringsaanbieding:
Start met ons premium platform voor slechts €99/maand (normaal €199)
Geldig tot eind van deze maand!

Klaar om uw bedrijf te schalen?
[Boek Uw Gratis Demo Vandaag]

Met vriendelijke groet,
Het ${brand} Team

P.S. Sluit u aan bij meer dan 10.000+ bedrijven die al hun operaties transformeren met onze AI-gestuurde oplossingen.`,
      },
    },
    social: {
      en: {
        title: `${brand} LinkedIn Post`,
        content: `🚀 Exciting news for ${industry} professionals!

At ${brand}, we're witnessing a revolution in how businesses operate. Here's what caught our attention this week:

📊 Key Industry Insights:
• 73% of ${industry} companies are investing in AI automation
• Average ROI increase of 127% within 6 months
• 89% report improved customer satisfaction

💡 Pro Tip: The secret isn't just adopting new technology—it's integrating it seamlessly with your existing workflows.

What's your biggest challenge in ${industry} right now? Drop a comment below! 👇

#${industry.replace(/\s+/g, "")} #AI #BusinessGrowth #Innovation

---
Ready to transform your operations? Learn more at ${brand}.com`,
      },
      nl: {
        title: `${brand} LinkedIn Post`,
        content: `🚀 Spannend nieuws voor ${industry} professionals!

Bij ${brand} zijn we getuige van een revolutie in hoe bedrijven opereren. Dit viel ons deze week op:

📊 Belangrijkste Branche Inzichten:
• 73% van ${industry} bedrijven investeert in AI-automatisering
• Gemiddelde ROI-toename van 127% binnen 6 maanden
• 89% rapporteert verbeterde klanttevredenheid

💡 Pro Tip: Het geheim is niet alleen het adopteren van nieuwe technologie—het is de naadloze integratie met uw bestaande workflows.

What is uw grootste uitdaging in ${industry} op dit moment? Laat een reactie achter! 👇

#${industry.replace(/\s+/g, "")} #AI #BedrijfsGroei #Innovatie

---
Klaar om uw operaties te transformeren? Meer info op ${brand}.com`,
      },
    },
    blog: {
      en: {
        title: `How ${brand} is Transforming the ${industry} Industry`,
        content: `# Blog Outline: How ${brand} is Transforming the ${industry} Industry

## I. Introduction
- Current state of the ${industry} industry
- Challenges facing modern ${industry} businesses
- Introduction to ${brand}'s innovative approach

## II. The Problem: Traditional ${industry} Operations
- Manual processes and inefficiencies
- Data silos and lack of integration
- Limited scalability and growth bottlenecks
- Case study: Before transformation

## III. The Solution: AI-Powered Transformation
- Overview of ${brand}'s platform capabilities
- Key features and benefits:
  * Automated workflow management
  * Real-time analytics and reporting
  * Intelligent customer engagement
  * Predictive insights and forecasting

## IV. Success Stories & Results
- Client case study #1: 40% efficiency increase
- Client case study #2: 127% ROI improvement
- Quantifiable metrics and KPIs
- Testimonials and feedback

## V. Implementation Strategy
- Step-by-step implementation process
- Best practices for ${industry} businesses
- Common pitfalls to avoid
- Timeline and resource requirements

## VI. Future Outlook
- Emerging trends in ${industry}
- Role of AI in industry evolution
- ${brand}'s roadmap and innovations
- Call-to-action for readers

**Estimated Word Count:** 2,500-3,000 words
**Target Audience:** ${industry} decision-makers and executives
**SEO Keywords:** ${industry} automation, AI transformation, business efficiency`,
      },
      nl: {
        title: `Hoe ${brand} de ${industry} Industrie Transformeert`,
        content: `# Blog Outline: Hoe ${brand} de ${industry} Industrie Transformeert

## I. Inleiding
- Huidige staat van de ${industry} industrie
- Uitdagingen voor moderne ${industry} bedrijven
- Introductie van ${brand}'s innovatieve aanpak

## II. Het Probleem: Traditionele ${industry} Operaties
- Handmatige processen en inefficiënties
- Data silo's en gebrek aan integratie
- Beperkte schaalbaarheid en groei-knelpunten
- Case study: Voor transformatie

## III. De Oplossing: AI-Gestuurde Transformatie
- Overzicht van ${brand}'s platform mogelijkheden
- Belangrijkste features en voordelen:
  * Geautomatiseerd workflow management
  * Real-time analytics en rapportage
  * Intelligente klantbetrokkenheid
  * Voorspellende inzichten en forecasting

## IV. Succesverhalen & Resultaten
- Klant case study #1: 40% efficiëntie toename
- Klant case study #2: 127% ROI verbetering
- Kwantificeerbare metrics en KPI's
- Testimonials en feedback

## V. Implementatie Strategie
- Stap-voor-stap implementatie proces
- Best practices voor ${industry} bedrijven
- Veel voorkomende valkuilen vermijden
- Tijdlijn en resource vereisten

## VI. Toekomst Outlook
- Opkomende trends in ${industry}
- Rol van AI in industrie evolutie
- ${brand}'s roadmap en innovaties
- Call-to-action voor lezers

**Geschat Aantal Woorden:** 2.500-3.000 woorden
**Doelgroep:** ${industry} besluitvormers en executives
**SEO Keywords:** ${industry} automatisering, AI transformatie, bedrijfsefficiëntie`,
      },
    },
  };

  const template = contentTemplates[type as keyof typeof contentTemplates];
  const localeTemplate = template[isNL ? "nl" : "en"];

  return {
    type,
    title: localeTemplate.title,
    content: localeTemplate.content,
    metadata: {
      wordCount: localeTemplate.content.split(" ").length,
      estimatedReadTime:
        Math.ceil(localeTemplate.content.split(" ").length / 200) + " min",
      tone: isNL ? "Professioneel & Vriendelijk" : "Professional & Friendly",
    },
  };
};

export default function LiveContentGenerator({
  onInteraction,
  locale = "en",
}: LiveContentGeneratorProps) {
  const [selectedType, setSelectedType] = useState<string>("email");
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const isNL = locale === "nl";

  const handleGenerate = async () => {
    if (!brandName || !industry) return;

    setIsGenerating(true);
    onInteraction?.("content_generation_started", {
      type: selectedType,
      brand: brandName,
      industry,
    });

    try {
      const content = await generateMockContent(
        selectedType,
        brandName,
        industry,
        customPrompt,
        locale
      );

      setGeneratedContent(content);
      setShowPreview(true);

      onInteraction?.("content_generation_completed", {
        type: selectedType,
        success: true,
        wordCount: content.metadata?.wordCount,
      });
    } catch (error) {
      console.error("Content generation failed:", error);
      onInteraction?.("content_generation_failed", { type: selectedType });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      onInteraction?.("content_copied", { type: generatedContent.type });
    }
  };

  const handleDownloadContent = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedContent.type}-${brandName}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onInteraction?.("content_downloaded", { type: generatedContent.type });
    }
  };

  return (
    <div className="w-full">
      <PremiumCard className="p-8 mb-8" glow>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <PremiumHeading level={3} className="mb-1">
              {isNL ? "Live AI Content Generator" : "Live AI Content Generator"}
            </PremiumHeading>
            <p className="text-gray-400 text-sm">
              {isNL
                ? "Genereer direct gepersonaliseerde content voor uw merk"
                : "Generate personalized content for your brand instantly"}
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-6 mb-8">
          {/* Brand & Industry Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isNL ? "Bedrijfsnaam" : "Brand Name"}
              </label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder={
                  isNL
                    ? "Voer uw bedrijfsnaam in..."
                    : "Enter your brand name..."
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isNL ? "Industrie" : "Industry"}
              </label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder={
                  isNL
                    ? "b.v. E-commerce, SaaS, Healthcare..."
                    : "e.g. E-commerce, SaaS, Healthcare..."
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {isNL ? "Content Type" : "Content Type"}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contentTypes.map(type => (
                <NormalButton
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedType === type.id
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {type.icon}
                    <span className="font-medium text-white">{type.name}</span>
                  </div>
                  <p className="text-sm text-gray-400">{type.description}</p>
                </NormalButton>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isNL
                ? "Extra Context (Optioneel)"
                : "Additional Context (Optional)"}
            </label>
            <textarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder={
                contentTypes.find(t => t.id === selectedType)?.placeholder
              }
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
            />
          </div>

          {/* Generate Button */}
          <NormalButton
            onClick={handleGenerate}
            disabled={!brandName || !industry || isGenerating}
            className="w-full md:w-auto"
            size="lg"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {isNL ? "Genereren..." : "Generating..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {isNL ? "Genereer Content" : "Generate Content"}
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </NormalButton>
        </div>
      </PremiumCard>

      {/* Generated Content Preview */}
      <AnimatePresence>
        {showPreview && generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <PremiumCard className="p-8" glow>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <PremiumHeading level={4} className="mb-1">
                    {generatedContent.title}
                  </PremiumHeading>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>
                      {generatedContent.metadata?.wordCount}{" "}
                      {isNL ? "woorden" : "words"}
                    </span>
                    <span>
                      {generatedContent.metadata?.estimatedReadTime}{" "}
                      {isNL ? "leestijd" : "read"}
                    </span>
                    <span>{generatedContent.metadata?.tone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <NormalButton
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyContent}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {isNL ? "Kopiëren" : "Copy"}
                  </NormalButton>
                  <NormalButton
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadContent}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isNL ? "Download" : "Download"}
                  </NormalButton>
                </div>
              </div>

              <GlassContainer className="p-6" intensity="light">
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono leading-relaxed">
                  {generatedContent.content}
                </pre>
              </GlassContainer>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {isNL
                      ? "Tevreden met het resultaat? Genereer meer content of pas uw inputs aan."
                      : "Happy with the result? Generate more content or adjust your inputs."}
                  </p>
                  <NormalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                  >
                    {isNL ? "Nieuw Genereren" : "Generate New"}
                  </NormalButton>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

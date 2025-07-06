import { Metadata } from "next";
import MultiPlatformPublishingHub from "@/components/marketing/multi-platform-publishing-hub";
import { Globe, Send, Share2, TrendingUp, Users, Zap } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Multi-Platform Publishing Hub Demo | SKC BI Dashboard",
    description:
      "Comprehensive demo of our multi-platform social media publishing system with queue management and analytics",
    keywords: [
      "social media publishing",
      "multi-platform",
      "content management",
      "marketing automation",
      "social media scheduler",
    ],
  };
}

const content = {
  en: {
    title: "Multi-Platform Publishing Hub",
    subtitle: "Comprehensive Social Media Publishing & Queue Management System",
    description:
      "Create, schedule, and publish content across all major social media platforms with intelligent queue management, real-time analytics, and enterprise-grade features.",
    features: {
      title: "Key Features",
      items: [
        {
          icon: <Send className="h-6 w-6" />,
          title: "One-Click Publishing",
          description:
            "Publish to multiple platforms simultaneously with a single click, saving time and ensuring consistency.",
        },
        {
          icon: <Share2 className="h-6 w-6" />,
          title: "Smart Queue Management",
          description:
            "Intelligent queueing system with priority management, retry logic, and failure handling.",
        },
        {
          icon: <Globe className="h-6 w-6" />,
          title: "Multi-Platform Support",
          description:
            "Support for Facebook, Instagram, Twitter/X, LinkedIn, YouTube, and TikTok with platform-specific optimizations.",
        },
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: "Engagement Prediction",
          description:
            "AI-powered engagement prediction to optimize posting times and content strategy.",
        },
        {
          icon: <Users className="h-6 w-6" />,
          title: "Account Management",
          description:
            "Centralized management of all your social media accounts with connection status monitoring.",
        },
        {
          icon: <Zap className="h-6 w-6" />,
          title: "Real-Time Analytics",
          description:
            "Live performance tracking with detailed analytics and reporting across all platforms.",
        },
      ],
    },
    cta: {
      title: "Ready to Transform Your Social Media Strategy?",
      description:
        "Experience the power of unified social media publishing with our comprehensive demo.",
      button: "Try the Demo Below",
    },
  },
  nl: {
    title: "Multi-Platform Publishing Hub",
    subtitle: "Uitgebreid Social Media Publishing & Wachtrijbeheer Systeem",
    description:
      "Creëer, plan en publiceer content op alle grote sociale media platforms met intelligent wachtrijbeheer, real-time analytics en enterprise functies.",
    features: {
      title: "Belangrijkste Functies",
      items: [
        {
          icon: <Send className="h-6 w-6" />,
          title: "Één-Klik Publiceren",
          description:
            "Publiceer naar meerdere platforms tegelijkertijd met één klik, bespaar tijd en zorg voor consistentie.",
        },
        {
          icon: <Share2 className="h-6 w-6" />,
          title: "Slim Wachtrijbeheer",
          description:
            "Intelligent wachtrijsysteem met prioriteitsbeheer, herhaallogica en foutafhandeling.",
        },
        {
          icon: <Globe className="h-6 w-6" />,
          title: "Multi-Platform Ondersteuning",
          description:
            "Ondersteuning voor Facebook, Instagram, Twitter/X, LinkedIn, YouTube en TikTok met platform-specifieke optimalisaties.",
        },
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: "Engagement Voorspelling",
          description:
            "AI-gestuurde engagement voorspelling om posttijden en contentstrategie te optimaliseren.",
        },
        {
          icon: <Users className="h-6 w-6" />,
          title: "Account Beheer",
          description:
            "Gecentraliseerd beheer van al je sociale media accounts met monitoring van verbindingsstatus.",
        },
        {
          icon: <Zap className="h-6 w-6" />,
          title: "Real-Time Analytics",
          description:
            "Live performance tracking met gedetailleerde analytics en rapportage over alle platforms.",
        },
      ],
    },
    cta: {
      title: "Klaar om Je Social Media Strategie te Transformeren?",
      description:
        "Ervaar de kracht van unified social media publishing met onze uitgebreide demo.",
      button: "Probeer de Demo Hieronder",
    },
  },
};

export default async function MultiPlatformPublishingDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = content[locale as keyof typeof content] || content.en;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          <Share2 className="h-4 w-4" />
          <span>Multi-Platform Publishing System</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
          {t.title}
        </h1>

        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t.subtitle}
        </p>

        <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          {t.description}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="col-span-full text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{t.features.title}</h2>
        </div>

        {t.features.items.map((feature, index) => (
          <div key={index} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 bg-card border rounded-lg hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">{t.cta.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.cta.description}
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg text-lg font-medium">
          <Send className="h-5 w-5" />
          <span>{t.cta.button}</span>
        </div>
      </div>

      {/* Demo Component */}
      <div className="border-t pt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Interactive Demo</h2>
          <p className="text-muted-foreground">
            Experience the full functionality of our Multi-Platform Publishing
            Hub below.
          </p>
        </div>

        <MultiPlatformPublishingHub />
      </div>
    </div>
  );
}

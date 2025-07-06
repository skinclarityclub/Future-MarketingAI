import React from "react";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Bot,
  Globe,
  TrendingUp,
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Eye,
  Users,
  Star,
  Shield,
  Sparkles,
  Brain,
  Cpu,
  Database,
} from "lucide-react";

// SEO optimized metadata
export const metadata: Metadata = {
  title: "SEO Optimization Demo - Traditional + LLM SEO | SKC BI Dashboard",
  description:
    "Comprehensive SEO optimization demo showcasing traditional search engine optimization and modern LLM/AI agent optimization techniques for maximum discoverability.",
  keywords: [
    "SEO optimization",
    "LLM SEO",
    "AI agent optimization",
    "search engine optimization",
    "structured data",
    "metadata optimization",
    "semantic SEO",
    "voice search optimization",
    "AI discovery",
    "enterprise SEO",
  ],
  openGraph: {
    title: "SEO Optimization Demo - Traditional + LLM SEO",
    description:
      "Advanced SEO optimization for both search engines and AI agents",
    type: "article",
    images: ["/og-seo-demo.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Optimization Demo - Traditional + LLM SEO",
    description:
      "Advanced SEO optimization for both search engines and AI agents",
    images: ["/og-seo-demo.jpg"],
  },
  other: {
    // AI/LLM specific metadata
    "ai:semantic-context":
      "Comprehensive SEO optimization demonstration covering traditional search engine optimization and modern AI agent discovery techniques",
    "ai:content-type": "informational",
    "ai:complexity": "intermediate",
    "ai:primary-intent":
      "Learn about advanced SEO optimization techniques for both traditional search engines and AI agents",
    "ai:entities":
      "SEO, LLM optimization, AI agents, search engines, structured data, metadata",
    "ai:key-insights":
      "Modern SEO requires optimization for both traditional search engines and AI agents | Structured data and semantic markup improve AI understanding | LLM SEO focuses on context and meaning rather than just keywords",
    "ai:answerable-questions":
      "What is LLM SEO? | How to optimize for AI agents? | What is the difference between traditional and LLM SEO? | How to implement structured data?",
  },
  robots: "index,follow",
  alternates: {
    canonical: "/seo-optimization-demo",
  },
};

// Structured data for the page
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "SEO Optimization Demo",
  description: "Comprehensive SEO optimization demonstration",
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "SKC BI Dashboard SEO System",
    description:
      "Advanced SEO optimization system for traditional and LLM search",
    applicationCategory: "SEO Tools",
    offers: {
      "@type": "Offer",
      price: "15000",
      priceCurrency: "EUR",
    },
  },
};

export default function SEOOptimizationDemoPage() {
  const traditionalSEOFeatures = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Meta Tags Optimization",
      description: "Comprehensive title, description, and keyword optimization",
      status: "Active",
      impact: "+45% organic traffic",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Structured Data (JSON-LD)",
      description: "Rich snippets and enhanced search results",
      status: "Active",
      impact: "+32% click-through rate",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Sitemap & Robots.txt",
      description: "Optimized crawling and indexing directives",
      status: "Active",
      impact: "100% page discovery",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Open Graph & Twitter Cards",
      description: "Social media sharing optimization",
      status: "Active",
      impact: "+28% social engagement",
    },
  ];

  const llmSEOFeatures = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "AI Agent Metadata",
      description: "Semantic context and intent optimization for AI agents",
      status: "Active",
      impact: "+67% AI discovery",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Semantic Markup",
      description: "Entity recognition and relationship mapping",
      status: "Active",
      impact: "+54% context understanding",
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "LLM-Friendly Content Structure",
      description: "Optimized for AI comprehension and summarization",
      status: "Active",
      impact: "+41% AI citation rate",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Factual Data Validation",
      description: "Verified claims and source attribution",
      status: "Active",
      impact: "+73% AI trust score",
    },
  ];

  const seoMetrics = [
    { label: "Organic Traffic Growth", value: "+156%", trend: "up" },
    { label: "AI Agent Discovery", value: "+234%", trend: "up" },
    { label: "Search Visibility", value: "94%", trend: "up" },
    { label: "LLM Citation Rate", value: "+189%", trend: "up" },
    { label: "Voice Search Optimization", value: "87%", trend: "up" },
    { label: "Structured Data Coverage", value: "100%", trend: "stable" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Inject structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Search className="h-12 w-12 text-blue-400" />
              <Bot className="h-6 w-6 text-green-400 absolute -top-1 -right-1" />
            </div>
            <div className="h-12 w-px bg-gradient-to-b from-blue-400 to-green-400" />
            <Sparkles className="h-12 w-12 text-purple-400" />
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            SEO Optimization Demo
          </h1>
          <p className="text-xl text-slate-300 mb-6 max-w-3xl mx-auto">
            Comprehensive SEO optimization for both{" "}
            <span className="text-blue-400 font-semibold">
              traditional search engines
            </span>{" "}
            and{" "}
            <span className="text-green-400 font-semibold">
              modern AI agents
            </span>
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Traditional SEO
            </Badge>
            <Badge
              variant="outline"
              className="text-green-400 border-green-400"
            >
              LLM SEO
            </Badge>
            <Badge
              variant="outline"
              className="text-purple-400 border-purple-400"
            >
              AI Agent Optimization
            </Badge>
            <Badge
              variant="outline"
              className="text-orange-400 border-orange-400"
            >
              Semantic Markup
            </Badge>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {seoMetrics.map((metric, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-slate-400">{metric.label}</div>
                <div className="flex items-center justify-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="traditional" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger
              value="traditional"
              className="data-[state=active]:bg-blue-600"
            >
              Traditional SEO
            </TabsTrigger>
            <TabsTrigger
              value="llm"
              className="data-[state=active]:bg-green-600"
            >
              LLM SEO
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="data-[state=active]:bg-purple-600"
            >
              Comparison
            </TabsTrigger>
            <TabsTrigger
              value="implementation"
              className="data-[state=active]:bg-orange-600"
            >
              Implementation
            </TabsTrigger>
          </TabsList>

          {/* Traditional SEO Tab */}
          <TabsContent value="traditional" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Search className="h-6 w-6 text-blue-400" />
                  Traditional SEO Features
                </CardTitle>
                <CardDescription>
                  Optimized for Google, Bing, and other traditional search
                  engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {traditionalSEOFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg"
                    >
                      <div className="text-blue-400">{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-slate-300 text-sm mb-2">
                          {feature.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="text-green-400 border-green-400"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {feature.status}
                          </Badge>
                          <span className="text-sm text-blue-400">
                            {feature.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LLM SEO Tab */}
          <TabsContent value="llm" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Bot className="h-6 w-6 text-green-400" />
                  LLM SEO Features
                </CardTitle>
                <CardDescription>
                  Optimized for ChatGPT, Claude, Perplexity, and other AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {llmSEOFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg"
                    >
                      <div className="text-green-400">{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-slate-300 text-sm mb-2">
                          {feature.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="text-green-400 border-green-400"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {feature.status}
                          </Badge>
                          <span className="text-sm text-green-400">
                            {feature.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-400">
                    Traditional SEO
                  </CardTitle>
                  <CardDescription>Focus on search engines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Characteristics:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Keyword-focused optimization</li>
                      <li>• Meta tags and descriptions</li>
                      <li>• Link building and authority</li>
                      <li>• Technical SEO (speed, mobile)</li>
                      <li>• Structured data markup</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Target Audience:</h4>
                    <p className="text-sm text-slate-300">
                      Search engine crawlers and ranking algorithms
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400">LLM SEO</CardTitle>
                  <CardDescription>Focus on AI agents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Characteristics:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Context and semantic meaning</li>
                      <li>• Entity relationships</li>
                      <li>• Factual accuracy and sources</li>
                      <li>• Natural language processing</li>
                      <li>• AI-friendly content structure</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Target Audience:</h4>
                    <p className="text-sm text-slate-300">
                      AI models and language understanding systems
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Implementation Tab */}
          <TabsContent value="implementation" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-orange-400" />
                  Implementation Guide
                </CardTitle>
                <CardDescription>
                  How to implement comprehensive SEO optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-400">
                      Traditional SEO Setup
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">Meta Tags</h4>
                          <p className="text-sm text-slate-400">
                            Title, description, keywords optimization
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">Structured Data</h4>
                          <p className="text-sm text-slate-400">
                            JSON-LD schema markup
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">Sitemap & Robots</h4>
                          <p className="text-sm text-slate-400">
                            Crawling optimization
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-400">
                      LLM SEO Setup
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">Semantic Context</h4>
                          <p className="text-sm text-slate-400">
                            AI-readable content structure
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">Entity Mapping</h4>
                          <p className="text-sm text-slate-400">
                            Relationship and context definition
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">AI Hints</h4>
                          <p className="text-sm text-slate-400">
                            Agent-specific metadata
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    Best Practices
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Combine both traditional and LLM SEO strategies</li>
                    <li>• Regularly audit and update metadata</li>
                    <li>• Monitor AI agent discovery and citation rates</li>
                    <li>• Ensure factual accuracy and source attribution</li>
                    <li>
                      • Optimize for voice search and conversational queries
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-2xl border border-slate-700">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Optimize Your SEO?
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Get discovered by both traditional search engines and modern AI
            agents with our comprehensive SEO optimization system.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
              Start SEO Audit
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300">
              Contact SEO Expert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

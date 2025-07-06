"use client";

import React from "react";
import {
  BarChart3,
  Users,
  Crown,
  Shield,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  Brain,
  Lightbulb,
  Settings,
  Lock,
  PlayCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressiveDisclosureManager from "@/components/ui/progressive-disclosure-manager";
import {
  ProgressiveTooltip,
  SmartUpgradeHint,
  FeaturePreview,
} from "@/components/ui/interactive-elements";

export default function ProgressiveDisclosureDemoClient() {
  const handleUpgrade = () => {
    console.log("Upgrade triggered");
    // In production, this would redirect to upgrade flow
    alert(
      "🎉 Upgrade flow geactiveerd! In productie gaat dit naar de upgrade pagina."
    );
  };

  const mockPreviewContent = (
    <div className="space-y-2">
      <div className="h-3 bg-blue-400 rounded-full w-full animate-pulse" />
      <div className="h-3 bg-purple-400 rounded-full w-3/4 animate-pulse" />
      <div className="h-3 bg-green-400 rounded-full w-1/2 animate-pulse" />
      <div className="text-xs text-center mt-2 text-gray-400">
        Advanced Analytics Preview
      </div>
    </div>
  );

  return (
    <ProgressiveDisclosureManager
      userTier="free"
      enableAnalytics={true}
      enableSmartTiming={true}
      enableContextualHints={true}
      maxConcurrentDisclosures={2}
      className="min-h-screen p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Progressive Disclosure Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ontdek hoe contextual hints en smart upgrade prompts je helpen om de
            juiste features op het juiste moment te ontdekken
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-gray-800">
              <Users className="h-3 w-3 mr-1" />
              Free Tier
            </Badge>
            <Badge variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              Progressive Disclosure Active
            </Badge>
            <Badge className="bg-blue-600">
              <PlayCircle className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
        </div>

        {/* Instructions Panel */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Hoe deze demo werkt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-300">
                  ✨ Progressive Tooltips:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Hover over chart icons voor instant feedback</li>
                  <li>• Klik op de team button voor interactieve tooltips</li>
                  <li>• Verschillende posities en timing delays</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-green-300">
                  🎯 Smart Upgrade Hints:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Hover 2+ seconden voor delayed hints</li>
                  <li>• Klik 3+ keer voor contextual suggestions</li>
                  <li>• Tier-specifieke upgrade paths</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-purple-300 mb-2">
                🔮 Feature Previews:
              </h4>
              <p className="text-sm text-gray-300">
                Hover over locked features hieronder om previews te zien met
                directe unlock opties. Elke tier heeft verschillende features
                beschikbaar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section 1: Basic Tooltips */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Progressive Tooltips
              <Badge variant="outline" className="text-xs">
                Hover & Click
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <ProgressiveTooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold">Advanced Chart Features</p>
                    <p className="text-sm">
                      Hover longer to see interactive features
                    </p>
                    <div className="pt-2 border-t border-gray-600">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert("Chart feature clicked!")}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                }
                trigger="hover"
                showDelay={300}
                interactive={true}
                maxWidth="250px"
              >
                <Card className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm">Hover voor details</p>
                    <p className="text-xs text-gray-400 mt-1">300ms delay</p>
                  </CardContent>
                </Card>
              </ProgressiveTooltip>

              <ProgressiveTooltip
                content={
                  <div className="w-64">
                    <p className="font-semibold mb-2">Team Collaboration</p>
                    <p className="text-sm mb-3">
                      Share dashboards en werk samen in real-time
                    </p>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="h-3 w-3" />
                        <span>Tot 5 teamleden</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Shield className="h-3 w-3" />
                        <span>Veilige toegang</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleUpgrade}
                    >
                      Upgrade voor Teams
                    </Button>
                  </div>
                }
                trigger="click"
                position="bottom"
                interactive={true}
              >
                <Button
                  variant="outline"
                  className="w-full hover:bg-blue-600/10"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Click voor team features
                </Button>
              </ProgressiveTooltip>

              <ProgressiveTooltip
                content={
                  <span>Deze feature wordt binnenkort beschikbaar! 🚀</span>
                }
                position="left"
              >
                <Card className="opacity-75 cursor-help hover:opacity-90 transition-opacity">
                  <CardContent className="p-4 text-center">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm">AI Insights</p>
                    <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                  </CardContent>
                </Card>
              </ProgressiveTooltip>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-gray-200 mb-2">💡 Pro Tip:</h4>
              <p className="text-sm text-gray-300">
                Progressive tooltips kunnen verschillende triggers hebben
                (hover, click, delay) en zijn volledig aanpasbaar. Ze kunnen ook
                interactive zijn met buttons en links voor directe acties.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section 2: Smart Upgrade Hints */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              Smart Upgrade Hints
              <Badge variant="outline" className="text-xs">
                Contextual & Timed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SmartUpgradeHint
                featureName="Advanced Analytics"
                requiredTier="pro"
                currentTier="free"
                benefits={[
                  "Real-time data visualisatie",
                  "Custom dashboard layouts",
                  "Export naar PDF/Excel",
                  "API access voor integraties",
                ]}
                onUpgrade={handleUpgrade}
                timing={{
                  hoverDelay: 2000,
                  maxShowsPerSession: 3,
                  cooldownBetweenShows: 5000,
                }}
              >
                <Card className="cursor-pointer hover:ring-2 hover:ring-green-400 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold">Advanced Analytics</h3>
                        <p className="text-sm text-gray-400">
                          Hover 2 sec voor hint
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">
                      Krijg diepere inzichten met geavanceerde analytics tools
                      en real-time data processing.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400">
                        Pro Feature
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </SmartUpgradeHint>

              <SmartUpgradeHint
                featureName="Team Collaboration"
                requiredTier="team"
                currentTier="free"
                benefits={[
                  "Unlimited team members",
                  "Real-time collaborative editing",
                  "Role-based access control",
                  "Team activity tracking",
                ]}
                onUpgrade={handleUpgrade}
                timing={{
                  clickThreshold: 3,
                  maxShowsPerSession: 2,
                }}
                showCondition={interactions => interactions.clicks >= 3}
              >
                <Card className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold">Team Features</h3>
                        <p className="text-sm text-gray-400">
                          Klik 3x voor suggestion
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">
                      Werk samen met je team in real-time en deel insights
                      direct binnen de dashboard.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Crown className="h-4 w-4 text-purple-400" />
                      <span className="text-xs text-purple-400">
                        Team Feature
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </SmartUpgradeHint>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30">
              <h4 className="font-semibold text-green-300 mb-2">
                🎯 Smart Timing:
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                Deze hints verschijnen alleen op het juiste moment - na genoeg
                interactie om interesse te tonen, maar niet te vaak om irritant
                te worden.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium text-green-400">
                    Hover Timing:
                  </span>
                  <p className="text-gray-400">
                    2 seconden hover = duidelijke interesse
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-400">
                    Click Threshold:
                  </span>
                  <p className="text-gray-400">
                    3+ clicks = actieve engagement
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section 3: Feature Previews */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-400" />
              Feature Previews
              <Badge variant="outline" className="text-xs">
                Hover to Unlock
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <FeaturePreview
                previewContent={mockPreviewContent}
                previewTitle="Advanced Analytics Dashboard"
                previewDescription="Zie real-time metrics en geavanceerde visualisaties"
                locked={true}
                onUnlock={handleUpgrade}
              >
                <Card className="relative overflow-hidden group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 className="h-8 w-8 text-purple-400" />
                      <div>
                        <h3 className="font-semibold">Analytics Pro</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">
                      Geavanceerde analytics met real-time data en custom
                      visualisaties.
                    </p>
                  </CardContent>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent group-hover:from-purple-500/20 transition-all" />
                </Card>
              </FeaturePreview>

              <FeaturePreview
                previewContent={
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm">5 Active Members</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Sarah Johnson</span>
                        <span className="text-green-400">Online</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Mike Chen</span>
                        <span className="text-green-400">Online</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Lisa Rodriguez</span>
                        <span className="text-yellow-400">Away</span>
                      </div>
                    </div>
                  </div>
                }
                previewTitle="Team Collaboration Hub"
                previewDescription="Zie wie online is en werk samen in real-time"
                locked={true}
                onUnlock={handleUpgrade}
              >
                <Card className="relative overflow-hidden group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-8 w-8 text-blue-400" />
                      <div>
                        <h3 className="font-semibold">Team Hub</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">
                      Realtime samenwerking met je team en shared dashboards.
                    </p>
                  </CardContent>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent group-hover:from-blue-500/20 transition-all" />
                </Card>
              </FeaturePreview>

              <FeaturePreview
                previewContent={
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span>AI-Powered Insights</span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Automated trend detection</p>
                      <p>• Predictive analytics</p>
                      <p>• Smart recommendations</p>
                      <p>• Anomaly detection</p>
                    </div>
                  </div>
                }
                previewTitle="AI Intelligence Suite"
                previewDescription="Automatische insights en predictive analytics"
                locked={true}
                onUnlock={handleUpgrade}
              >
                <Card className="relative overflow-hidden group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="h-8 w-8 text-purple-400" />
                      <div>
                        <h3 className="font-semibold">AI Insights</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Enterprise
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">
                      AI-powered analytics die automatisch patronen en kansen
                      identificeren.
                    </p>
                  </CardContent>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent group-hover:from-yellow-500/20 transition-all" />
                </Card>
              </FeaturePreview>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
              <h4 className="font-semibold text-purple-300 mb-2">
                🔮 Preview Magic:
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                Hover over locked features om een preview te zien van wat je
                krijgt. Elke preview is interactief en toont echte
                functionaliteit.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium text-purple-400">
                    Visual Previews:
                  </span>
                  <p className="text-gray-400">
                    Zie exact hoe features eruit zien
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-400">
                    Interactive Demo:
                  </span>
                  <p className="text-gray-400">
                    Probeer features uit voor je upgrade
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-400">
                    Direct Unlock:
                  </span>
                  <p className="text-gray-400">
                    One-click upgrade vanuit preview
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Analytics Integration */}
        <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Analytics Integration
              <Badge className="bg-green-600">Live Tracking</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-300">
                  📊 What's Being Tracked:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Hover duration en engagement patterns</li>
                  <li>• Click frequencies en feature interactions</li>
                  <li>• Upgrade hint effectiveness</li>
                  <li>• Feature preview engagement rates</li>
                  <li>• Conversion funnel performance</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-blue-300">
                  🎯 Optimization Insights:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Beste timing voor upgrade hints</li>
                  <li>• Meest effectieve preview content</li>
                  <li>• User journey optimization</li>
                  <li>• A/B testing voor messaging</li>
                  <li>• ROI tracking van features</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-green-400">
                  Real-time tracking active:
                </strong>{" "}
                Alle interacties op deze pagina worden getrackt voor analytics.
                Check de browser console voor event details en bezoek de{" "}
                <a
                  href="/usage-analytics"
                  className="text-blue-400 hover:underline"
                >
                  Usage Analytics dashboard
                </a>{" "}
                voor volledige insights.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to Upgrade?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Progressive Disclosure helpt gebruikers de waarde van premium
            features te ontdekken op het perfecte moment, resulterend in hogere
            conversie rates.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Start Free Trial
            </Button>
            <Button variant="outline">
              <Info className="h-4 w-4 mr-2" />
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </ProgressiveDisclosureManager>
  );
}

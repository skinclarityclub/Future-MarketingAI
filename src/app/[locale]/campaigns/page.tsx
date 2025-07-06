"use client";

import React, { useState } from "react";
import {
  UltraPremiumDashboardLayout,
  UltraPremiumSection,
  UltraPremiumGrid,
  UltraPremiumCard,
} from "@/components/layout/ultra-premium-dashboard-layout";
import MarketingOptimization from "@/components/dashboard/marketing-optimization";
import CampaignCreationModal from "@/components/marketing/campaign-creation-modal";
import PremiumButton from "@/components/ui/premium-button";
import {
  Zap,
  TrendingUp,
  MousePointer,
  DollarSign,
  Eye,
  Plus,
} from "lucide-react";
import { CrossPlatformCampaign } from "@/lib/workflows/cross-platform-content-manager";

export default function CampaignsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Partial<CrossPlatformCampaign>[]>(
    []
  );

  // Handle campaign creation
  const handleCampaignCreated = (campaign: Partial<CrossPlatformCampaign>) => {
    setCampaigns(prev => [...prev, campaign]);
    console.log("Campaign created:", campaign);
  };

  // Mock campaign data
  const campaignMetrics = [
    {
      title: "Active Campaigns",
      value: "12",
      change: "+3",
      trend: "up",
      icon: Zap,
      color: "text-purple-600",
    },
    {
      title: "Total Impressions",
      value: "2.4M",
      change: "+18.5%",
      trend: "up",
      icon: Eye,
      color: "text-blue-600",
    },
    {
      title: "Click-Through Rate",
      value: "3.8%",
      change: "+0.5%",
      trend: "up",
      icon: MousePointer,
      color: "text-green-600",
    },
    {
      title: "Campaign Spend",
      value: "€28.5K",
      change: "+12.1%",
      trend: "up",
      icon: DollarSign,
      color: "text-orange-600",
    },
  ];

  return (
    <UltraPremiumDashboardLayout>
      <UltraPremiumSection
        title="Campaign Analytics"
        description="Monitor and optimize marketing campaign performance"
        priority="primary"
        action={
          <PremiumButton onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </PremiumButton>
        }
      >
        {/* Campaign Metrics */}
        <UltraPremiumGrid>
          {campaignMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <UltraPremiumCard
                key={index}
                title={metric.title}
                variant="glass"
                colSpan={1}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {metric.value}
                    </div>
                    <div
                      className={`text-sm flex items-center gap-1 ${
                        metric.trend === "up"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <TrendingUp
                        className={`h-3 w-3 ${
                          metric.trend === "down" ? "rotate-180" : ""
                        }`}
                      />
                      {metric.change}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted/30 ${metric.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </UltraPremiumCard>
            );
          })}
        </UltraPremiumGrid>

        {/* Marketing Optimization Dashboard */}
        <UltraPremiumCard
          title="Campaign Optimization"
          description="AI-powered campaign insights and recommendations"
          variant="glass"
          colSpan={4}
        >
          <MarketingOptimization />
        </UltraPremiumCard>

        {/* Active Campaigns List */}
        {campaigns.length > 0 && (
          <UltraPremiumCard
            title="Active Campaigns"
            description={`Managing ${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""}`}
            variant="glass"
            colSpan={4}
          >
            <div className="space-y-4">
              {campaigns.map((campaign, index) => (
                <div
                  key={campaign.id || index}
                  className="p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {campaign.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        €{campaign.budget?.toLocaleString()}
                      </span>
                      <div className="flex gap-1">
                        {campaign.targetPlatforms?.map(platform => (
                          <span
                            key={platform}
                            className="text-xs px-2 py-1 bg-blue-600/20 rounded"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </UltraPremiumCard>
        )}
      </UltraPremiumSection>

      {/* Campaign Creation Modal */}
      <CampaignCreationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCampaignCreated={handleCampaignCreated}
      />
    </UltraPremiumDashboardLayout>
  );
}

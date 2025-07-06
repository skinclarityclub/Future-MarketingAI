"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share,
  RefreshCw,
  Settings,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Calendar,
  Target,
  Globe,
} from "lucide-react";
import ConnectAccountModal from "./connect-account-modal";

interface SocialMediaAccount {
  id: string;
  platform:
    | "facebook"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "tiktok";
  account_name: string;
  account_id: string;
  followers: number;
  engagement_rate: number;
  posts_today: number;
  posts_this_week: number;
  posts_this_month: number;
  status: "connected" | "disconnected" | "error" | "syncing";
  last_sync: Date;
  profile_picture?: string;
  verified?: boolean;
  metrics: {
    impressions_24h: number;
    reach_24h: number;
    likes_24h: number;
    comments_24h: number;
    shares_24h: number;
    clicks_24h: number;
    saves_24h: number;
  };
}

interface SocialMediaPost {
  id: string;
  platform: string;
  account_id: string;
  post_id: string;
  content: string;
  media_type: "photo" | "video" | "carousel" | "text" | "story";
  published_at: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    impressions: number;
    reach: number;
  };
  performance_score: number;
  hashtags: string[];
}

interface SocialMediaInsights {
  account_id: string;
  platform: string;
  time_period: "24h" | "7d" | "30d";
  metrics: {
    total_followers: number;
    new_followers: number;
    total_engagement: number;
    average_engagement_rate: number;
    total_reach: number;
    total_impressions: number;
    audience_demographics?: {
      age_groups: Record<string, number>;
      gender: Record<string, number>;
      locations: Record<string, number>;
    };
  };
}

const PLATFORM_COLORS = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  tiktok: "#000000",
};

const PLATFORM_ICONS = {
  facebook: "📘",
  instagram: "📷",
  twitter: "🐦",
  linkedin: "💼",
  youtube: "🎥",
  tiktok: "🎵",
};

export default function SocialMediaOversightDashboard() {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [insights, setInsights] = useState<SocialMediaInsights[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<"24h" | "7d" | "30d">("24h");
  const [showSettings, setShowSettings] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Fetch social media data
  useEffect(() => {
    // Use mock data for demo
    const mockData = {
      success: true,
      data: {
        overview: {
          total_followers: 234567,
          total_accounts: 4,
          average_engagement_rate: 4.8,
          posts_today: 12,
          connected_accounts: 4,
          total_reach_24h: 145230,
          total_engagement_24h: 3420,
        },
        accounts: [
          {
            id: "acc-001",
            platform: "facebook" as const,
            account_name: "SKC Business",
            account_id: "fb_12345",
            followers: 65420,
            engagement_rate: 4.8,
            posts_today: 3,
            posts_this_week: 12,
            posts_this_month: 45,
            status: "connected",
            last_sync: new Date(Date.now() - 15 * 60 * 1000),
            profile_picture: "https://via.placeholder.com/100",
            verified: true,
            metrics: {
              impressions_24h: 32500,
              reach_24h: 28900,
              likes_24h: 842,
              comments_24h: 158,
              shares_24h: 89,
              clicks_24h: 234,
              saves_24h: 45,
            },
          },
          {
            id: "acc-002",
            platform: "instagram",
            account_name: "@skcbusiness",
            account_id: "ig_67890",
            followers: 89330,
            engagement_rate: 6.2,
            posts_today: 2,
            posts_this_week: 8,
            posts_this_month: 28,
            status: "connected",
            last_sync: new Date(Date.now() - 20 * 60 * 1000),
            profile_picture: "https://via.placeholder.com/100",
            verified: false,
            metrics: {
              impressions_24h: 45900,
              reach_24h: 36200,
              likes_24h: 1445,
              comments_24h: 289,
              shares_24h: 167,
              clicks_24h: 89,
              saves_24h: 234,
            },
          },
          {
            id: "acc-003",
            platform: "linkedin",
            account_name: "SKC Company",
            account_id: "li_11111",
            followers: 34560,
            engagement_rate: 3.9,
            posts_today: 1,
            posts_this_week: 5,
            posts_this_month: 18,
            status: "error",
            last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000),
            profile_picture: "https://via.placeholder.com/100",
            verified: true,
            metrics: {
              impressions_24h: 12100,
              reach_24h: 9800,
              likes_24h: 278,
              comments_24h: 42,
              shares_24h: 28,
              clicks_24h: 145,
              saves_24h: 15,
            },
          },
          {
            id: "acc-004",
            platform: "twitter",
            account_name: "@SKCBusiness",
            account_id: "tw_22222",
            followers: 45257,
            engagement_rate: 2.1,
            posts_today: 5,
            posts_this_week: 23,
            posts_this_month: 89,
            status: "connected",
            last_sync: new Date(Date.now() - 10 * 60 * 1000),
            profile_picture: "https://via.placeholder.com/100",
            verified: false,
            metrics: {
              impressions_24h: 55600,
              reach_24h: 42100,
              likes_24h: 534,
              comments_24h: 167,
              shares_24h: 289,
              clicks_24h: 445,
              saves_24h: 67,
            },
          },
        ],
        recent_posts: [
          {
            id: "post-001",
            platform: "instagram",
            account_id: "ig_67890",
            post_id: "ig_post_123",
            content:
              "Excited to share our latest business insights! 🚀 #BusinessIntelligence #DataDriven",
            media_type: "photo",
            published_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
            engagement: {
              likes: 234,
              comments: 45,
              shares: 12,
              saves: 89,
              clicks: 0,
              impressions: 2340,
              reach: 1890,
            },
            performance_score: 8.5,
            hashtags: ["#BusinessIntelligence", "#DataDriven"],
          },
          {
            id: "post-002",
            platform: "linkedin",
            account_id: "li_11111",
            post_id: "li_post_456",
            content:
              "How data analytics is transforming modern business strategies. Read our latest whitepaper.",
            media_type: "text",
            published_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
            engagement: {
              likes: 89,
              comments: 23,
              shares: 34,
              saves: 12,
              clicks: 156,
              impressions: 1240,
              reach: 980,
            },
            performance_score: 7.2,
            hashtags: ["#DataAnalytics", "#Business"],
          },
          {
            id: "post-003",
            platform: "twitter",
            account_id: "tw_22222",
            post_id: "tw_post_789",
            content:
              "Real-time dashboard insights are game-changers for enterprise decision making. See how SKC is leading the way! 📊",
            media_type: "text",
            published_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
            engagement: {
              likes: 156,
              comments: 34,
              shares: 67,
              saves: 23,
              clicks: 234,
              impressions: 4560,
              reach: 3210,
            },
            performance_score: 6.8,
            hashtags: ["#Dashboard", "#Enterprise"],
          },
        ],
        recent_posts: [
          {
            id: "post-001",
            platform: "facebook",
            account_id: "acc-001",
            post_id: "fb_post_12345",
            content:
              "🚀 Exciting news! Our new BI Dashboard is helping businesses make data-driven decisions. Check out these amazing analytics insights! #BusinessIntelligence #DataDriven #SKC",
            media_type: "photo" as const,
            published_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            engagement: {
              likes: 1247,
              comments: 89,
              shares: 156,
              saves: 67,
              clicks: 234,
              impressions: 15420,
              reach: 12800,
            },
            performance_score: 8.5,
            hashtags: ["#BusinessIntelligence", "#DataDriven", "#SKC"],
          },
          {
            id: "post-002",
            platform: "instagram",
            account_id: "acc-002",
            post_id: "ig_post_67890",
            content:
              "📊 Beautiful data visualization from our latest client project. Transform your raw data into actionable insights! ✨ #DataVisualization #Analytics #BusinessGrowth",
            media_type: "carousel" as const,
            published_at: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            engagement: {
              likes: 2156,
              comments: 134,
              shares: 0, // Instagram doesn't have shares
              saves: 298,
              clicks: 445,
              impressions: 23650,
              reach: 19420,
            },
            performance_score: 9.2,
            hashtags: ["#DataVisualization", "#Analytics", "#BusinessGrowth"],
          },
          {
            id: "post-003",
            platform: "linkedin",
            account_id: "acc-003",
            post_id: "li_post_11111",
            content:
              "The future of business intelligence lies in real-time analytics and automated insights. Our platform helps Fortune 500 companies stay ahead of the curve. What's your biggest data challenge?",
            media_type: "text" as const,
            published_at: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            engagement: {
              likes: 567,
              comments: 78,
              shares: 89,
              saves: 0,
              clicks: 156,
              impressions: 8940,
              reach: 7650,
            },
            performance_score: 7.8,
            hashtags: [
              "#BusinessIntelligence",
              "#RealTimeAnalytics",
              "#Fortune500",
            ],
          },
          {
            id: "post-004",
            platform: "twitter",
            account_id: "acc-004",
            post_id: "tw_post_22222",
            content:
              "Just launched our new AI-powered analytics feature! 🤖 Now businesses can get instant insights without manual data crunching. The future is automated! #AI #Analytics #Automation",
            media_type: "text" as const,
            published_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            engagement: {
              likes: 834,
              comments: 45,
              shares: 167, // Retweets
              saves: 23,
              clicks: 289,
              impressions: 12450,
              reach: 9870,
            },
            performance_score: 8.1,
            hashtags: ["#AI", "#Analytics", "#Automation"],
          },
          {
            id: "post-005",
            platform: "instagram",
            account_id: "acc-002",
            post_id: "ig_post_33333",
            content:
              "Behind the scenes: Our team working on the next-generation dashboard features. Innovation never stops! 💡 #TeamWork #Innovation #BehindTheScenes",
            media_type: "video" as const,
            published_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            engagement: {
              likes: 1876,
              comments: 92,
              shares: 0,
              saves: 189,
              clicks: 356,
              impressions: 19870,
              reach: 16540,
            },
            performance_score: 8.7,
            hashtags: ["#TeamWork", "#Innovation", "#BehindTheScenes"],
          },
        ],
        insights: [
          {
            account_id: "acc-001",
            platform: "facebook",
            time_period: "24h" as const,
            metrics: {
              total_followers: 65420,
              new_followers: 156,
              total_engagement: 2890,
              average_engagement_rate: 4.8,
              total_reach: 45230,
              total_impressions: 67800,
              audience_demographics: {
                age_groups: {
                  "18-24": 15,
                  "25-34": 35,
                  "35-44": 28,
                  "45-54": 15,
                  "55+": 7,
                },
                gender: {
                  male: 52,
                  female: 46,
                  other: 2,
                },
                locations: {
                  Netherlands: 45,
                  Germany: 20,
                  Belgium: 15,
                  "United Kingdom": 12,
                  Other: 8,
                },
              },
            },
          },
          {
            account_id: "acc-002",
            platform: "instagram",
            time_period: "24h" as const,
            metrics: {
              total_followers: 89330,
              new_followers: 234,
              total_engagement: 4567,
              average_engagement_rate: 6.2,
              total_reach: 56780,
              total_impressions: 89450,
              audience_demographics: {
                age_groups: {
                  "18-24": 25,
                  "25-34": 40,
                  "35-44": 22,
                  "45-54": 10,
                  "55+": 3,
                },
                gender: {
                  male: 48,
                  female: 50,
                  other: 2,
                },
                locations: {
                  Netherlands: 42,
                  "United States": 18,
                  Germany: 16,
                  "United Kingdom": 14,
                  Other: 10,
                },
              },
            },
          },
          {
            account_id: "acc-003",
            platform: "linkedin",
            time_period: "24h" as const,
            metrics: {
              total_followers: 34567,
              new_followers: 67,
              total_engagement: 1890,
              average_engagement_rate: 3.9,
              total_reach: 28900,
              total_impressions: 42300,
              audience_demographics: {
                age_groups: {
                  "18-24": 8,
                  "25-34": 32,
                  "35-44": 35,
                  "45-54": 20,
                  "55+": 5,
                },
                gender: {
                  male: 58,
                  female: 40,
                  other: 2,
                },
                locations: {
                  Netherlands: 38,
                  "United States": 22,
                  Germany: 18,
                  "United Kingdom": 12,
                  Other: 10,
                },
              },
            },
          },
          {
            account_id: "acc-004",
            platform: "twitter",
            time_period: "24h" as const,
            metrics: {
              total_followers: 45234,
              new_followers: 89,
              total_engagement: 1567,
              average_engagement_rate: 2.1,
              total_reach: 34560,
              total_impressions: 56780,
              audience_demographics: {
                age_groups: {
                  "18-24": 20,
                  "25-34": 38,
                  "35-44": 25,
                  "45-54": 12,
                  "55+": 5,
                },
                gender: {
                  male: 55,
                  female: 43,
                  other: 2,
                },
                locations: {
                  Netherlands: 35,
                  "United States": 25,
                  "United Kingdom": 15,
                  Germany: 15,
                  Other: 10,
                },
              },
            },
          },
        ],
      },
    };

    console.log("🎯 Using Mock Data for Demo:", mockData.data);
    setOverview(mockData.data.overview);
    setAccounts(mockData.data.accounts);
    setPosts(mockData.data.recent_posts);
    setInsights(mockData.data.insights);
    console.log(
      "📊 Mock Accounts loaded:",
      mockData.data.accounts?.length || 0
    );
    console.log("📈 Mock Overview loaded:", mockData.data.overview);
    console.log(
      "📝 Mock Posts loaded:",
      mockData.data.recent_posts?.length || 0
    );
    console.log(
      "🔍 Mock Insights loaded:",
      mockData.data.insights?.length || 0
    );
    setLoading(false);

    // Also try real API as fallback
    // fetchSocialMediaData();
  }, []);

  const fetchSocialMediaData = async () => {
    try {
      setLoading(true);

      // Fetch overview data
      const overviewResponse = await fetch("/api/marketing/social-media");
      const overviewData = await overviewResponse.json();

      if (overviewData.success) {
        console.log("✅ Social Media API Response:", overviewData.data);
        setOverview(overviewData.data.overview);
        setAccounts(overviewData.data.accounts);
        setPosts(overviewData.data.recent_posts);
        console.log(
          "📊 Accounts loaded:",
          overviewData.data.accounts?.length || 0
        );
        console.log("📈 Overview loaded:", overviewData.data.overview);
      } else {
        console.error("❌ API Error:", overviewData.message);
      }
    } catch (error) {
      console.error("Error fetching social media data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountInsights = async (accountId: string) => {
    try {
      const response = await fetch(
        `/api/marketing/social-media?action=insights&account_id=${accountId}&time_period=${timePeriod}`
      );
      const data = await response.json();

      if (data.success) {
        setInsights(prev => {
          const filtered = prev.filter(
            insight => insight.account_id !== accountId
          );
          return [...filtered, data.data];
        });
      }
    } catch (error) {
      console.error("Error fetching account insights:", error);
    }
  };

  const handleRefresh = async () => {
    console.log("🔄 Refresh button clicked!");
    setRefreshing(true);

    // Simulate refresh with new mock data
    setTimeout(() => {
      console.log("✅ Refresh completed!");
      setRefreshing(false);
      // Could add a toast notification here
    }, 2000);
  };

  const handleSyncAccount = async (accountId: string) => {
    try {
      const response = await fetch(
        `/api/marketing/social-media?action=sync&account_id=${accountId}`
      );
      const data = await response.json();

      if (data.success) {
        await fetchSocialMediaData();
      }
    } catch (error) {
      console.error("Error syncing account:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return "default";
      case "error":
        return "destructive";
      case "syncing":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const targetDate = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (!targetDate || isNaN(targetDate.getTime())) {
      return "Unknown";
    }

    const diffInMinutes = Math.floor(
      (now.getTime() - targetDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getEngagementTrend = (currentRate: number, platform: string) => {
    // Mock trend calculation - in real app, this would use historical data
    const mockTrend = Math.random() > 0.5 ? "up" : "down";
    const mockPercentage = (Math.random() * 10).toFixed(1);

    return {
      direction: mockTrend,
      percentage: mockPercentage,
    };
  };

  // Prepare chart data
  const engagementTrendData = (accounts || []).map((account, index) => ({
    name: account.platform,
    engagement: account.engagement_rate,
    followers: account.followers,
    reach: account.metrics.reach_24h,
  }));

  const platformDistributionData = Object.entries(PLATFORM_COLORS).map(
    ([platform, color]) => ({
      name: platform,
      value: (accounts || []).filter(acc => acc.platform === platform).length,
      color,
    })
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading social media data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-slate-950/95 p-6 space-y-6">
      {/* TEST BUTTON - Debug */}
      <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
        <h2 className="text-white mb-2">🚨 BUTTON TEST AREA</h2>
        <NormalButton
          onClick={() => alert("TEST BUTTON WORKS!")}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
          style={{ pointerEvents: "auto", cursor: "pointer" }}
        >
          CLICK ME TO TEST
        </NormalButton>
        <NormalButton
          onClick={() => alert("PLAIN HTML BUTTON WORKS!")}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "8px 16px",
            margin: "0 8px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          PLAIN BUTTON
        </NormalButton>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Social Media Oversight
          </h1>
          <p className="text-slate-300 mt-1">
            Monitor engagement metrics and oversee social media performance
            across platforms
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NormalButton
            onClick={() => {
              console.log("🔄 Refresh button clicked!");
              alert("Refresh button works! Check console for logs.");
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 2000);
            }}
            disabled={refreshing}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700/50 h-9 px-3 cursor-pointer"
            style={{ pointerEvents: "auto", cursor: "pointer" }}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </NormalButton>

          <NormalButton
            onClick={() => {
              console.log("⚙️ Settings button clicked!");
              alert("Settings button works! (Demo mode)");
              setShowSettings(true);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700/50 h-9 px-3 cursor-pointer"
            style={{ pointerEvents: "auto", cursor: "pointer" }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </NormalButton>

          <NormalButton
            onClick={() => {
              console.log("🔗 Connect Account button clicked!");
              alert("Connect Account button works! (Demo mode)");
              setShowConnectModal(true);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 h-9 px-3 cursor-pointer"
            style={{ pointerEvents: "auto", cursor: "pointer" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Connect Account
          </NormalButton>
        </div>
      </div>

      {/* Overview Metrics */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Followers
              </CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {formatNumber(overview.total_followers)}
              </div>
              <p className="text-xs text-slate-400">
                across {overview.total_accounts} platforms
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Avg Engagement
              </CardTitle>
              <Heart className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {overview.average_engagement_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-400">engagement rate today</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Posts Today
              </CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {overview.posts_today}
              </div>
              <p className="text-xs text-slate-400">published content</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Connected
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {overview.connected_accounts}
              </div>
              <p className="text-xs text-slate-400">active accounts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
          <TabsTrigger
            value="accounts"
            className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
          >
            Recent Posts
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
          >
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {!accounts || accounts.length === 0 ? (
            <Card className="bg-slate-900/80 border-slate-700/50 p-8">
              <div className="text-center">
                <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Loading Social Media Accounts...
                </h3>
                <p className="text-slate-400">
                  Fetching your connected social media platforms and metrics.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(account => {
                const trend = getEngagementTrend(
                  account.engagement_rate,
                  account.platform
                );

                return (
                  <Card
                    key={account.id}
                    className="relative bg-slate-900/80 border-slate-700/50"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
                            style={{
                              backgroundColor:
                                PLATFORM_COLORS[account.platform],
                            }}
                          >
                            {PLATFORM_ICONS[account.platform]}
                          </div>
                          <div>
                            <CardTitle className="text-base text-white">
                              {account.account_name}
                            </CardTitle>
                            <CardDescription className="capitalize flex items-center gap-1 text-slate-400">
                              {account.platform}
                              {account.verified && (
                                <CheckCircle className="h-3 w-3 text-blue-400" />
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(account.status) as any}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(account.status)}
                            {account.status}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Followers</p>
                          <p className="text-lg font-bold text-white">
                            {formatNumber(account.followers)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Engagement</p>
                          <div className="flex items-center gap-1">
                            <p className="text-lg font-bold text-white">
                              {account.engagement_rate}%
                            </p>
                            {trend.direction === "up" ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span
                              className={`text-xs ${trend.direction === "up" ? "text-green-500" : "text-red-500"}`}
                            >
                              {trend.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Today's Metrics */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Today's Performance
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <Eye className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                            <p className="font-medium">
                              {formatNumber(account.metrics.reach_24h)}
                            </p>
                            <p className="text-muted-foreground">Reach</p>
                          </div>
                          <div className="text-center">
                            <Heart className="h-3 w-3 mx-auto mb-1 text-red-500" />
                            <p className="font-medium">
                              {formatNumber(account.metrics.likes_24h)}
                            </p>
                            <p className="text-muted-foreground">Likes</p>
                          </div>
                          <div className="text-center">
                            <MessageCircle className="h-3 w-3 mx-auto mb-1 text-green-500" />
                            <p className="font-medium">
                              {formatNumber(account.metrics.comments_24h)}
                            </p>
                            <p className="text-muted-foreground">Comments</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <NormalButton
                          size="sm"
                          variant="secondary"
                          className="flex-1 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                          onClick={() => {
                            console.log(
                              `🔄 Syncing account: ${account.platform} - ${account.account_name}`
                            );
                            handleSyncAccount(account.id);
                            alert(
                              `Syncing ${account.platform} account! (Demo mode)`
                            );
                          }}
                          disabled={account.status === "syncing"}
                        >
                          <RefreshCw
                            className={`h-3 w-3 mr-1 ${account.status === "syncing" ? "animate-spin" : ""}`}
                          />
                          Sync
                        </NormalButton>
                        <NormalButton
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                          onClick={() => {
                            console.log(
                              `📊 Viewing details for: ${account.platform} - ${account.account_name}`
                            );
                            setSelectedAccount(account.id);
                            fetchAccountInsights(account.id);
                            alert(
                              `Viewing details for ${account.platform} account! (Demo mode)`
                            );
                          }}
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Details
                        </NormalButton>
                        <NormalButton
                          size="sm"
                          variant="outline"
                          className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                          onClick={() => {
                            console.log(
                              `🌐 Opening external link for: ${account.platform}`
                            );
                            alert(
                              `Would open ${account.platform} account in new tab! (Demo mode)`
                            );
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </NormalButton>
                      </div>

                      {/* Last Sync */}
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        Last sync: {formatTimeAgo(account.last_sync)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Engagement Trends</CardTitle>
                <CardDescription className="text-slate-400">
                  Platform engagement rates comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                      formatter={(value, name) => [
                        name === "engagement"
                          ? `${value}%`
                          : formatNumber(value as number),
                        name === "engagement"
                          ? "Engagement Rate"
                          : name === "followers"
                            ? "Followers"
                            : "Reach",
                      ]}
                    />
                    <Bar dataKey="engagement" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Platform Distribution
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Connected accounts by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {platformDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                      formatter={value => [`${value} accounts`, "Connected"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>
                Comprehensive view of all platform metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Platform</th>
                      <th className="text-left p-2">Account</th>
                      <th className="text-right p-2">Followers</th>
                      <th className="text-right p-2">Engagement</th>
                      <th className="text-right p-2">Reach (24h)</th>
                      <th className="text-right p-2">Posts Today</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(accounts || []).map(account => (
                      <tr key={account.id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span
                              style={{
                                color: PLATFORM_COLORS[account.platform],
                              }}
                            >
                              {PLATFORM_ICONS[account.platform]}
                            </span>
                            <span className="capitalize">
                              {account.platform}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">{account.account_name}</td>
                        <td className="text-right p-2">
                          {formatNumber(account.followers)}
                        </td>
                        <td className="text-right p-2">
                          {account.engagement_rate}%
                        </td>
                        <td className="text-right p-2">
                          {formatNumber(account.metrics.reach_24h)}
                        </td>
                        <td className="text-right p-2">
                          {account.posts_today}
                        </td>
                        <td className="text-center p-2">
                          <Badge
                            variant={getStatusBadge(account.status) as any}
                          >
                            {account.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(posts || []).map(post => (
              <Card
                key={post.id}
                className="bg-slate-900/80 border-slate-700/50"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color:
                            PLATFORM_COLORS[
                              post.platform as keyof typeof PLATFORM_COLORS
                            ],
                        }}
                      >
                        {
                          PLATFORM_ICONS[
                            post.platform as keyof typeof PLATFORM_ICONS
                          ]
                        }
                      </span>
                      <span className="text-sm font-medium capitalize text-white">
                        {post.platform}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Score: {post.performance_score}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm line-clamp-2 text-slate-300">
                    {post.content}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <Heart className="h-3 w-3 mx-auto mb-1 text-red-500" />
                      <p className="font-medium text-white">
                        {formatNumber(post.engagement.likes)}
                      </p>
                    </div>
                    <div className="text-center">
                      <MessageCircle className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                      <p className="font-medium text-white">
                        {formatNumber(post.engagement.comments)}
                      </p>
                    </div>
                    <div className="text-center">
                      <Share className="h-3 w-3 mx-auto mb-1 text-green-500" />
                      <p className="font-medium text-white">
                        {formatNumber(post.engagement.shares)}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">
                    Published: {formatTimeAgo(post.published_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              Platform Insights
            </h3>
            <div className="flex gap-2">
              {(["24h", "7d", "30d"] || []).map(period => (
                <NormalButton
                  key={period}
                  size="sm"
                  variant={timePeriod === period ? "default" : "outline"}
                  className={
                    timePeriod === period
                      ? "bg-cyan-500 text-white hover:bg-cyan-600"
                      : "bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                  }
                  onClick={() => {
                    console.log(`📅 Time period changed to: ${period}`);
                    setTimePeriod(period as any);
                    alert(`Time period changed to ${period}! (Demo mode)`);
                  }}
                >
                  {period}
                </NormalButton>
              ))}
            </div>
          </div>

          {(insights || []).length === 0 ? (
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium mb-2 text-white">
                  No Insights Available
                </p>
                <p className="text-slate-400 mb-4">
                  Select an account from the Accounts tab to view detailed
                  insights
                </p>
                <NormalButton
                  variant="outline"
                  className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                  onClick={() => setSelectedAccount((accounts || [])[0]?.id)}
                >
                  View Account Details
                </NormalButton>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(insights || []).map(insight => {
                const account = (accounts || []).find(
                  acc => acc.id === insight.account_id
                );

                return (
                  <Card
                    key={insight.account_id}
                    className="bg-slate-900/80 border-slate-700/50"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <span
                          style={{
                            color:
                              PLATFORM_COLORS[
                                insight.platform as keyof typeof PLATFORM_COLORS
                              ],
                          }}
                        >
                          {
                            PLATFORM_ICONS[
                              insight.platform as keyof typeof PLATFORM_ICONS
                            ]
                          }
                        </span>
                        {account?.account_name} Insights
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {insight.time_period} performance overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">
                            New Followers
                          </p>
                          <p className="text-2xl font-bold text-green-400">
                            +{formatNumber(insight.metrics.new_followers)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">
                            Total Engagement
                          </p>
                          <p className="text-2xl font-bold text-blue-400">
                            {formatNumber(insight.metrics.total_engagement)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">Reach</span>
                          <span className="font-medium text-white">
                            {formatNumber(insight.metrics.total_reach)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">
                            Impressions
                          </span>
                          <span className="font-medium text-white">
                            {formatNumber(insight.metrics.total_impressions)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-400">
                            Avg Engagement Rate
                          </span>
                          <span className="font-medium text-white">
                            {insight.metrics.average_engagement_rate}%
                          </span>
                        </div>
                      </div>

                      {insight.metrics.audience_demographics && (
                        <div className="border-t border-slate-700 pt-4">
                          <p className="text-sm font-medium mb-2 text-white">
                            Top Audience Segments
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Age 25-34</span>
                              <span className="text-white">
                                {
                                  insight.metrics.audience_demographics
                                    .age_groups["25-34"]
                                }
                                %
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">
                                Netherlands
                              </span>
                              <span className="text-white">
                                {
                                  insight.metrics.audience_demographics
                                    .locations["Netherlands"]
                                }
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onAccountConnected={handleAccountConnected}
      />
    </div>
  );

  // Handler for when a new account is connected
  function handleAccountConnected(platform: string, accountData: any) {
    console.log("✅ New account connected:", platform, accountData);

    // Add the new account to our accounts list
    const newAccount: SocialMediaAccount = {
      id: accountData.id || `new-${Date.now()}`,
      platform: platform as any,
      account_name: accountData.accountName || `${platform} Account`,
      account_id: accountData.accountId || `${platform}_${Date.now()}`,
      followers: accountData.followers || 0,
      engagement_rate: accountData.engagement_rate || 0,
      posts_today: 0,
      posts_this_week: 0,
      posts_this_month: 0,
      status: "connected",
      last_sync: new Date(),
      verified: accountData.verified || false,
      metrics: {
        impressions_24h: 0,
        reach_24h: 0,
        likes_24h: 0,
        comments_24h: 0,
        shares_24h: 0,
        clicks_24h: 0,
        saves_24h: 0,
      },
    };

    setAccounts(prev => [...prev, newAccount]);

    // Update overview stats
    if (overview) {
      setOverview({
        ...overview,
        total_accounts: overview.total_accounts + 1,
        connected_accounts: overview.connected_accounts + 1,
      });
    }

    // Show success message (you could add a toast here)
    console.log(
      `🎉 ${platform} account successfully connected with automated posting!`
    );
  }
}

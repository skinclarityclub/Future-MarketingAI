import React, { useState, useEffect, useMemo } from "react";
import {
  DashboardCard,
  DashboardGrid,
} from "@/components/layout/dashboard-layout";
import {
  MapPin,
  Clock,
  TrendingUp,
  Users,
  ChevronRight,
  Calendar,
  Filter,
  Eye,
  Target,
  Activity,
  MousePointer,
  Mail,
  Phone,
  ShoppingCart,
  Globe,
  MessageCircle,
  Star,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Cell,
  Sankey,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Journey stage interface
interface JourneyStage {
  id: string;
  name: string;
  description: string;
  customers: number;
  conversionRate: number;
  averageTimeSpent: number; // in hours
  dropOffRate: number;
  topActions: string[];
  nextStages: { stageId: string; percentage: number }[];
}

// Touchpoint interface
interface Touchpoint {
  id: string;
  name: string;
  type: "email" | "website" | "phone" | "social" | "store" | "app" | "support";
  stage: string;
  interactions: number;
  conversionRate: number;
  averageEngagement: number;
  icon: any;
  color: string;
}

// Customer journey interface
interface CustomerJourney {
  customerId: string;
  customerName: string;
  startDate: string;
  currentStage: string;
  stages: {
    stageId: string;
    timestamp: string;
    duration: number;
    touchpoints: string[];
    actions: string[];
  }[];
  totalValue: number;
  isActive: boolean;
}

// Journey metrics interface
interface JourneyMetrics {
  totalCustomers: number;
  averageJourneyTime: number;
  conversionRate: number;
  dropOffPoints: string[];
  topPerformingPaths: string[];
  bottlenecks: string[];
}

const TOUCHPOINT_ICONS = {
  email: Mail,
  website: Globe,
  phone: Phone,
  social: MessageCircle,
  store: MapPin,
  app: ShoppingCart,
  support: Activity,
};

const STAGE_COLORS = [
  "#10B981", // Green
  "#3B82F6", // Blue
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#EC4899", // Pink
];

export function CustomerJourney() {
  const [stages, setStages] = useState<JourneyStage[]>([]);
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([]);
  const [journeys, setJourneys] = useState<CustomerJourney[]>([]);
  const [metrics, setMetrics] = useState<JourneyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("30d");
  const [activeView, setActiveView] = useState<
    "overview" | "funnel" | "paths" | "individual"
  >("overview");

  useEffect(() => {
    fetchJourneyData();
  }, [timeframe]);

  const fetchJourneyData = async () => {
    try {
      // Mock journey stages data
      const mockStages: JourneyStage[] = [
        {
          id: "awareness",
          name: "Awareness",
          description: "Customer becomes aware of our brand",
          customers: 25000,
          conversionRate: 74.0,
          averageTimeSpent: 48,
          dropOffRate: 26.0,
          topActions: ["Website visit", "Social media view", "Ad click"],
          nextStages: [
            { stageId: "interest", percentage: 74 },
            { stageId: "exit", percentage: 26 },
          ],
        },
        {
          id: "interest",
          name: "Interest",
          description: "Customer shows interest in our products",
          customers: 18500,
          conversionRate: 66.5,
          averageTimeSpent: 72,
          dropOffRate: 33.5,
          topActions: ["Product page view", "Email signup", "Content download"],
          nextStages: [
            { stageId: "consideration", percentage: 66.5 },
            { stageId: "exit", percentage: 33.5 },
          ],
        },
        {
          id: "consideration",
          name: "Consideration",
          description: "Customer evaluates our offerings",
          customers: 12300,
          conversionRate: 65.9,
          averageTimeSpent: 120,
          dropOffRate: 34.1,
          topActions: ["Compare products", "Read reviews", "Contact support"],
          nextStages: [
            { stageId: "purchase", percentage: 65.9 },
            { stageId: "exit", percentage: 34.1 },
          ],
        },
        {
          id: "purchase",
          name: "Purchase",
          description: "Customer makes a purchase decision",
          customers: 8100,
          conversionRate: 83.3,
          averageTimeSpent: 24,
          dropOffRate: 16.7,
          topActions: ["Add to cart", "Checkout", "Payment"],
          nextStages: [
            { stageId: "onboarding", percentage: 83.3 },
            { stageId: "exit", percentage: 16.7 },
          ],
        },
        {
          id: "onboarding",
          name: "Onboarding",
          description: "Customer gets familiar with the product",
          customers: 6750,
          conversionRate: 78.5,
          averageTimeSpent: 168,
          dropOffRate: 21.5,
          topActions: ["Setup account", "Tutorial completion", "First use"],
          nextStages: [
            { stageId: "retention", percentage: 78.5 },
            { stageId: "exit", percentage: 21.5 },
          ],
        },
        {
          id: "retention",
          name: "Retention",
          description: "Customer becomes a repeat user",
          customers: 5300,
          conversionRate: 67.9,
          averageTimeSpent: 720,
          dropOffRate: 32.1,
          topActions: [
            "Regular usage",
            "Feature adoption",
            "Support interaction",
          ],
          nextStages: [
            { stageId: "advocacy", percentage: 67.9 },
            { stageId: "exit", percentage: 32.1 },
          ],
        },
        {
          id: "advocacy",
          name: "Advocacy",
          description: "Customer becomes a brand advocate",
          customers: 3600,
          conversionRate: 100,
          averageTimeSpent: 2160,
          dropOffRate: 0,
          topActions: ["Referrals", "Reviews", "Social sharing"],
          nextStages: [],
        },
      ];

      const mockTouchpoints: Touchpoint[] = [
        {
          id: "website-visit",
          name: "Website Visit",
          type: "website",
          stage: "awareness",
          interactions: 45000,
          conversionRate: 18.5,
          averageEngagement: 65,
          icon: TOUCHPOINT_ICONS.website,
          color: "#3B82F6",
        },
        {
          id: "email-campaign",
          name: "Email Campaign",
          type: "email",
          stage: "interest",
          interactions: 28000,
          conversionRate: 24.3,
          averageEngagement: 42,
          icon: TOUCHPOINT_ICONS.email,
          color: "#10B981",
        },
        {
          id: "phone-consultation",
          name: "Phone Consultation",
          type: "phone",
          stage: "consideration",
          interactions: 5400,
          conversionRate: 67.8,
          averageEngagement: 89,
          icon: TOUCHPOINT_ICONS.phone,
          color: "#F59E0B",
        },
        {
          id: "social-engagement",
          name: "Social Media",
          type: "social",
          stage: "awareness",
          interactions: 32000,
          conversionRate: 12.1,
          averageEngagement: 34,
          icon: TOUCHPOINT_ICONS.social,
          color: "#8B5CF6",
        },
        {
          id: "store-visit",
          name: "Store Visit",
          type: "store",
          stage: "purchase",
          interactions: 2800,
          conversionRate: 78.9,
          averageEngagement: 92,
          icon: TOUCHPOINT_ICONS.store,
          color: "#EF4444",
        },
        {
          id: "app-interaction",
          name: "Mobile App",
          type: "app",
          stage: "retention",
          interactions: 15600,
          conversionRate: 45.2,
          averageEngagement: 71,
          icon: TOUCHPOINT_ICONS.app,
          color: "#06B6D4",
        },
      ];

      const mockMetrics: JourneyMetrics = {
        totalCustomers: 25000,
        averageJourneyTime: 28.5,
        conversionRate: 14.4,
        dropOffPoints: ["Interest → Consideration", "Purchase → Onboarding"],
        topPerformingPaths: [
          "Awareness → Interest → Purchase",
          "Interest → Consideration → Purchase",
        ],
        bottlenecks: ["Consideration stage", "Onboarding completion"],
      };

      setStages(mockStages);
      setTouchpoints(mockTouchpoints);
      setMetrics(mockMetrics);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching journey data:", error);
      setLoading(false);
    }
  };

  // Calculate funnel data for visualization
  const funnelData = stages.map((stage, index) => ({
    name: stage.name,
    value: stage.customers,
    conversionRate: stage.conversionRate,
    fill: STAGE_COLORS[index % STAGE_COLORS.length],
  }));

  // Calculate conversion flow data
  const conversionFlowData = stages.slice(0, -1).map((stage, index) => ({
    stage: stage.name,
    current: stage.customers,
    next: stages[index + 1]?.customers || 0,
    conversionRate: stage.conversionRate,
  }));

  // Calculate touchpoint performance
  const touchpointPerformanceData = touchpoints.map(touchpoint => ({
    name: touchpoint.name,
    interactions: touchpoint.interactions,
    conversionRate: touchpoint.conversionRate,
    engagement: touchpoint.averageEngagement,
    fill: touchpoint.color,
  }));

  // Calculate time-based journey progression
  const journeyProgressionData = stages.map((stage, index) => ({
    stage: stage.name,
    averageTime: stage.averageTimeSpent,
    customers: stage.customers,
    cumulativeTime: stages
      .slice(0, index + 1)
      .reduce((sum, s) => sum + s.averageTimeSpent, 0),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger
              className="w-40"
              aria-label="Select timeframe for customer journey analysis"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs
          value={activeView}
          onValueChange={value => setActiveView(value as any)}
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
            <TabsTrigger value="paths">Journey Paths</TabsTrigger>
            <TabsTrigger value="individual">Individual Journeys</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Tab */}
      {activeView === "overview" && (
        <>
          {/* Key Metrics */}
          <DashboardGrid>
            <DashboardCard
              title="Total Customers"
              description="In customer journey"
            >
              <div className="text-2xl font-bold">
                {metrics?.totalCustomers.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">
                +12.3% from last period
              </div>
            </DashboardCard>

            <DashboardCard
              title="Avg. Journey Time"
              description="Days from awareness to purchase"
            >
              <div className="text-2xl font-bold">
                {metrics?.averageJourneyTime} days
              </div>
              <div className="text-xs text-red-600 mt-1">
                +2.1 days from last period
              </div>
            </DashboardCard>

            <DashboardCard
              title="Overall Conversion"
              description="Awareness to advocacy rate"
            >
              <div className="text-2xl font-bold">
                {metrics?.conversionRate}%
              </div>
              <div className="text-xs text-green-600 mt-1">
                +1.8% from last period
              </div>
            </DashboardCard>

            <DashboardCard
              title="Active Stages"
              description="Stages with customer activity"
            >
              <div className="text-2xl font-bold">{stages.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                All stages operational
              </div>
            </DashboardCard>
          </DashboardGrid>

          {/* Journey Stages Overview */}
          <DashboardCard
            title="Journey Stages Performance"
            description="Customer flow through journey stages"
            colSpan={4}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedStage === stage.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setSelectedStage(
                      selectedStage === stage.id ? null : stage.id
                    )
                  }
                >
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor:
                          STAGE_COLORS[index % STAGE_COLORS.length],
                      }}
                    >
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{stage.name}</h3>
                    <div className="text-lg font-bold">
                      {stage.customers.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      customers
                    </div>
                    <div className="text-xs">
                      <span className="text-green-600">
                        {stage.conversionRate}%
                      </span>{" "}
                      conversion
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stage.averageTimeSpent}h avg time
                    </div>
                  </div>

                  {index < stages.length - 1 && (
                    <div className="hidden xl:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                      <ChevronRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Stage Details */}
          {selectedStage && (
            <DashboardCard
              title={`${stages.find(s => s.id === selectedStage)?.name} Stage Details`}
              description="Detailed stage analysis and performance metrics"
              colSpan={4}
            >
              {(() => {
                const stage = stages.find(s => s.id === selectedStage);
                if (!stage) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Stage Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Customers
                          </span>
                          <span className="font-medium">
                            {stage.customers.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Conversion Rate
                          </span>
                          <span className="font-medium text-green-600">
                            {stage.conversionRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Drop-off Rate
                          </span>
                          <span className="font-medium text-red-600">
                            {stage.dropOffRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Avg Time Spent
                          </span>
                          <span className="font-medium">
                            {stage.averageTimeSpent}h
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Top Actions</h4>
                      <div className="space-y-2">
                        {stage.topActions.map((action, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="block w-fit"
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Next Stage Flow</h4>
                      <div className="space-y-2">
                        {stage.nextStages.map((next, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {next.stageId === "exit"
                                ? "Exit"
                                : stages.find(s => s.id === next.stageId)?.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={next.percentage}
                                className="w-16 h-2"
                              />
                              <span className="text-xs">
                                {next.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </DashboardCard>
          )}
        </>
      )}

      {/* Funnel Analysis Tab */}
      {activeView === "funnel" && (
        <>
          <DashboardGrid>
            <DashboardCard
              title="Journey Funnel"
              description="Customer progression through stages"
              colSpan={3}
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={funnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    formatter={(value: any) => [
                      value.toLocaleString(),
                      "Customers",
                    ]}
                    labelFormatter={label => `Stage: ${label}`}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </DashboardCard>

            <DashboardCard
              title="Conversion Rates"
              description="Stage-to-stage conversion rates"
            >
              <div className="space-y-4">
                {conversionFlowData.map((stage, index) => (
                  <div key={stage.stage}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{stage.stage}</span>
                      <span className="text-sm text-muted-foreground">
                        {stage.conversionRate}%
                      </span>
                    </div>
                    <Progress value={stage.conversionRate} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {stage.current.toLocaleString()} →{" "}
                      {stage.next.toLocaleString()} customers
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </DashboardGrid>

          <DashboardCard
            title="Journey Timeline"
            description="Average time progression through stages"
            colSpan={4}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={journeyProgressionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === "averageTime"
                      ? `${value}h`
                      : value.toLocaleString(),
                    name === "averageTime" ? "Average Time" : "Customers",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="averageTime"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </DashboardCard>
        </>
      )}

      {/* Journey Paths Tab */}
      {activeView === "paths" && (
        <>
          <DashboardCard
            title="Touchpoint Performance"
            description="Effectiveness of different customer touchpoints"
            colSpan={4}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={touchpointPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === "conversionRate" || name === "engagement"
                      ? `${value}%`
                      : value.toLocaleString(),
                    name === "conversionRate"
                      ? "Conversion Rate"
                      : name === "engagement"
                        ? "Engagement"
                        : "Interactions",
                  ]}
                />
                <Bar yAxisId="left" dataKey="interactions" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="conversionRate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>

          <DashboardGrid>
            {touchpoints.map(touchpoint => (
              <DashboardCard
                key={touchpoint.id}
                title={touchpoint.name}
                description={`${touchpoint.type} touchpoint`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <touchpoint.icon
                      className="h-5 w-5"
                      style={{ color: touchpoint.color }}
                    />
                    <Badge variant="outline">{touchpoint.stage}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Interactions
                      </span>
                      <span className="font-medium">
                        {touchpoint.interactions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Conversion Rate
                      </span>
                      <span className="font-medium text-green-600">
                        {touchpoint.conversionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium">
                        {touchpoint.averageEngagement}%
                      </span>
                    </div>
                  </div>

                  <Progress
                    value={touchpoint.averageEngagement}
                    className="h-2"
                  />
                </div>
              </DashboardCard>
            ))}
          </DashboardGrid>
        </>
      )}

      {/* Individual Journeys Tab */}
      {activeView === "individual" && (
        <DashboardCard
          title="Individual Customer Journeys"
          description="Track specific customer paths"
          colSpan={4}
        >
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Individual Journey Tracking
            </h3>
            <p className="text-muted-foreground mb-4">
              This feature allows you to track individual customer journeys with
              detailed touchpoint analysis, timeline views, and personalized
              recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
              <div className="p-4 border rounded-lg">
                <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-medium">Journey Mapping</div>
                <div className="text-muted-foreground">
                  Visual customer path tracking
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-medium">Timeline Analysis</div>
                <div className="text-muted-foreground">
                  Detailed interaction history
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-medium">Personalization</div>
                <div className="text-muted-foreground">
                  Tailored recommendations
                </div>
              </div>
            </div>
            <NormalButton className="mt-6" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Sample Journey
            </NormalButton>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}

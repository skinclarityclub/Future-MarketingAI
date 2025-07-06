import React, { useState, useEffect, useMemo } from "react";
import { useLocale } from "@/lib/i18n/context";
import {
  DashboardCard,
  DashboardGrid,
} from "@/components/layout/dashboard-layout";
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Filter,
  Download,
  Search,
  ChevronDown,
  BarChart3,
  PieChart,
  Eye,
  Settings,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Customer segment interface
interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  percentage: number;
  averageLifetimeValue: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  churnRate: number;
  growthRate: number;
  color: string;
  characteristics: string[];
  recommendedActions: string[];
}

// Customer interface
interface Customer {
  id: string;
  name: string;
  email: string;
  segment: string;
  lifetimeValue: number;
  lastPurchaseDate: string;
  totalOrders: number;
  averageOrderValue: number;
  churnRisk: number;
  acquisitionDate: string;
  location: string;
  preferredChannel: string;
}

// Filter interface
interface SegmentFilters {
  searchTerm: string;
  valueRange: [number, number];
  churnRisk: string;
  acquisitionPeriod: string;
  location: string;
  channel: string;
}

const SEGMENT_COLORS = [
  "#10B981", // Green
  "#3B82F6", // Blue
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
];

export function CustomerSegmentation() {
  const { t } = useLocale();
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<
    "overview" | "segments" | "customers"
  >("overview");
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [filters, setFilters] = useState<SegmentFilters>({
    searchTerm: "",
    valueRange: [0, 10000],
    churnRisk: "all",
    acquisitionPeriod: "all",
    location: "all",
    channel: "all",
  });

  useEffect(() => {
    fetchSegmentData();
    fetchCustomerData();
  }, []);

  const fetchSegmentData = async () => {
    try {
      // Mock data - in real implementation this would come from API
      const mockSegments: CustomerSegment[] = [
        {
          id: "champions",
          name: "Champions",
          description: "High-value, highly engaged customers",
          count: 1247,
          percentage: 12.5,
          averageLifetimeValue: 4850,
          averageOrderValue: 245,
          purchaseFrequency: 8.2,
          churnRate: 2.1,
          growthRate: 15.3,
          color: "#10B981",
          characteristics: [
            "High CLV",
            "Frequent purchases",
            "Brand advocates",
          ],
          recommendedActions: [
            "VIP programs",
            "Early access",
            "Referral incentives",
          ],
        },
        {
          id: "loyal-customers",
          name: "Loyal Customers",
          description: "Regular, satisfied customers",
          count: 2891,
          percentage: 28.9,
          averageLifetimeValue: 2340,
          averageOrderValue: 156,
          purchaseFrequency: 5.1,
          churnRate: 8.7,
          growthRate: 8.9,
          color: "#3B82F6",
          characteristics: [
            "Regular purchases",
            "Moderate CLV",
            "Consistent engagement",
          ],
          recommendedActions: [
            "Loyalty programs",
            "Cross-selling",
            "Personalized offers",
          ],
        },
        {
          id: "potential-loyalists",
          name: "Potential Loyalists",
          description: "New customers with good engagement",
          count: 1856,
          percentage: 18.6,
          averageLifetimeValue: 1420,
          averageOrderValue: 128,
          purchaseFrequency: 3.4,
          churnRate: 15.2,
          growthRate: 22.1,
          color: "#F59E0B",
          characteristics: [
            "Recent acquisition",
            "Growing engagement",
            "Price sensitive",
          ],
          recommendedActions: [
            "Onboarding campaigns",
            "Educational content",
            "Discount offers",
          ],
        },
        {
          id: "new-customers",
          name: "New Customers",
          description: "Recently acquired customers",
          count: 2134,
          percentage: 21.3,
          averageLifetimeValue: 680,
          averageOrderValue: 95,
          purchaseFrequency: 1.8,
          churnRate: 28.5,
          growthRate: 45.2,
          color: "#8B5CF6",
          characteristics: [
            "First-time buyers",
            "Exploring products",
            "High potential",
          ],
          recommendedActions: [
            "Welcome series",
            "Product recommendations",
            "Support focus",
          ],
        },
        {
          id: "at-risk",
          name: "At Risk",
          description: "Declining engagement, potential churn",
          count: 1342,
          percentage: 13.4,
          averageLifetimeValue: 1890,
          averageOrderValue: 134,
          purchaseFrequency: 2.1,
          churnRate: 45.7,
          growthRate: -12.8,
          color: "#EF4444",
          characteristics: [
            "Declining activity",
            "Long absence",
            "Previous complaints",
          ],
          recommendedActions: [
            "Win-back campaigns",
            "Personalized outreach",
            "Feedback surveys",
          ],
        },
        {
          id: "lost-customers",
          name: "Lost Customers",
          description: "Churned customers requiring reactivation",
          count: 521,
          percentage: 5.2,
          averageLifetimeValue: 950,
          averageOrderValue: 89,
          purchaseFrequency: 0.0,
          churnRate: 100.0,
          growthRate: -25.4,
          color: "#6B7280",
          characteristics: [
            "No recent activity",
            "Churned",
            "Reactivation potential",
          ],
          recommendedActions: [
            "Reactivation campaigns",
            "Special offers",
            "Apology campaigns",
          ],
        },
      ];
      setSegments(mockSegments);
    } catch (error) {
      console.error("Error fetching segment data:", error);
    }
  };

  const fetchCustomerData = async () => {
    try {
      // Mock customer data
      const mockCustomers: Customer[] = Array.from({ length: 100 }, (_, i) => ({
        id: `customer-${i + 1}`,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        segment:
          segments[Math.floor(Math.random() * segments.length)]?.id ||
          "new-customers",
        lifetimeValue: Math.floor(Math.random() * 5000) + 100,
        lastPurchaseDate: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        totalOrders: Math.floor(Math.random() * 20) + 1,
        averageOrderValue: Math.floor(Math.random() * 300) + 50,
        churnRisk: Math.floor(Math.random() * 100),
        acquisitionDate: new Date(
          Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        location: ["USA", "Canada", "UK", "Germany", "France"][
          Math.floor(Math.random() * 5)
        ],
        preferredChannel: ["Email", "SMS", "Push", "Direct"][
          Math.floor(Math.random() * 4)
        ],
      }));
      setCustomers(mockCustomers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      setLoading(false);
    }
  };

  // Filter customers based on current filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch =
        customer.name
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesValue =
        customer.lifetimeValue >= filters.valueRange[0] &&
        customer.lifetimeValue <= filters.valueRange[1];
      const matchesChurn =
        filters.churnRisk === "all" ||
        (filters.churnRisk === "high" && customer.churnRisk > 70) ||
        (filters.churnRisk === "medium" &&
          customer.churnRisk >= 30 &&
          customer.churnRisk <= 70) ||
        (filters.churnRisk === "low" && customer.churnRisk < 30);
      const matchesLocation =
        filters.location === "all" || customer.location === filters.location;
      const matchesChannel =
        filters.channel === "all" ||
        customer.preferredChannel === filters.channel;

      return (
        matchesSearch &&
        matchesValue &&
        matchesChurn &&
        matchesLocation &&
        matchesChannel
      );
    });
  }, [customers, filters]);

  // Calculate segment metrics for visualizations
  const segmentChartData = segments.map((segment, index) => ({
    ...segment,
    fill: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));

  const valueDistributionData = segments.map(segment => ({
    segment: segment.name,
    averageValue: segment.averageLifetimeValue,
    count: segment.count,
  }));

  const riskVsValueData = segments.map(segment => ({
    x: segment.churnRate,
    y: segment.averageLifetimeValue,
    segment: segment.name,
    size: segment.count,
    color: segment.color,
  }));

  const handleExportSegments = () => {
    const csvContent = [
      [
        "Segment",
        "Count",
        "Percentage",
        "Avg LTV",
        "Avg AOV",
        "Churn Rate",
        "Growth Rate",
      ],
      ...segments.map(segment => [
        segment.name,
        segment.count.toString(),
        `${segment.percentage}%`,
        `$${segment.averageLifetimeValue}`,
        `$${segment.averageOrderValue}`,
        `${segment.churnRate}%`,
        `${segment.growthRate}%`,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-segments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: "overview", label: "Overview", icon: Eye },
          { id: "segments", label: "Segment Analysis", icon: BarChart3 },
          { id: "customers", label: "Customer Explorer", icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <NormalButton
            key={id}
            onClick={() => setActiveView(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeView === id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NormalButton>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("customers.searchCustomers")}
              value={filters.searchTerm}
              onChange={e =>
                setFilters(prev => ({ ...prev, searchTerm: e.target.value }))
              }
              className="pl-10 w-64"
            />
          </div>
          <Select
            value={filters.churnRisk}
            onValueChange={value =>
              setFilters(prev => ({ ...prev, churnRisk: value }))
            }
          >
            <SelectTrigger
              className="w-40"
              aria-label="Filter by churn risk level"
            >
              <SelectValue placeholder="Churn Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("customers.allRiskLevels")}
              </SelectItem>
              <SelectItem value="high">{t("customers.highRisk")}</SelectItem>
              <SelectItem value="medium">
                {t("customers.mediumRisk")}
              </SelectItem>
              <SelectItem value="low">{t("customers.lowRisk")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NormalButton
          onClick={handleExportSegments}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {t("common.exportData")}
        </NormalButton>
      </div>

      {/* Overview Tab */}
      {activeView === "overview" && (
        <>
          {/* Key Metrics */}
          <DashboardGrid>
            <DashboardCard
              title="Total Segments"
              description="Active customer segments"
            >
              <div className="text-2xl font-bold">{segments.length}</div>
              <div className="text-xs text-green-600 mt-1">
                +2 from last quarter
              </div>
            </DashboardCard>

            <DashboardCard
              title="Largest Segment"
              description="Most populated segment"
            >
              <div className="text-2xl font-bold">
                {segments.reduce(
                  (max, segment) => (segment.count > max.count ? segment : max),
                  segments[0]
                )?.name || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {segments
                  .reduce(
                    (max, segment) =>
                      segment.count > max.count ? segment : max,
                    segments[0]
                  )
                  ?.count.toLocaleString() || 0}{" "}
                customers
              </div>
            </DashboardCard>

            <DashboardCard
              title="Avg. Segment Value"
              description="Average CLV per segment"
            >
              <div className="text-2xl font-bold">
                $
                {Math.round(
                  segments.reduce(
                    (sum, segment) => sum + segment.averageLifetimeValue,
                    0
                  ) / segments.length
                ).toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">
                +8.3% from last month
              </div>
            </DashboardCard>

            <DashboardCard
              title="Growth Segments"
              description="Segments with positive growth"
            >
              <div className="text-2xl font-bold">
                {segments.filter(segment => segment.growthRate > 0).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(
                  (segments.filter(segment => segment.growthRate > 0).length /
                    segments.length) *
                    100
                )}
                % of total
              </div>
            </DashboardCard>
          </DashboardGrid>

          {/* Segment Distribution */}
          <DashboardGrid>
            <DashboardCard
              title="Segment Distribution"
              description="Customer count by segment"
              colSpan={2}
            >
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={segmentChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {segmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      value.toLocaleString(),
                      "Customers",
                    ]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </DashboardCard>

            <DashboardCard
              title="Value vs Risk Analysis"
              description="CLV vs churn rate by segment"
              colSpan={2}
            >
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={riskVsValueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    name="Churn Rate"
                    unit="%"
                    label={{
                      value: "Churn Rate (%)",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    dataKey="y"
                    name="Average LTV"
                    unit="$"
                    label={{
                      value: "Average LTV ($)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "y" ? `$${value}` : `${value}%`,
                      name === "y" ? "Average LTV" : "Churn Rate",
                    ]}
                    labelFormatter={(label: any, payload: any) =>
                      payload?.[0]?.payload?.segment || ""
                    }
                  />
                  <Scatter dataKey="y" fill="#8884d8">
                    {riskVsValueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </DashboardCard>
          </DashboardGrid>
        </>
      )}

      {/* Segments Tab */}
      {activeView === "segments" && (
        <>
          <DashboardCard
            title="Segment Performance"
            description="Detailed segment analysis"
            colSpan={4}
          >
            <div className="space-y-4">
              {segments.map((segment, index) => (
                <div
                  key={segment.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    setSelectedSegment(
                      selectedSegment === segment.id ? null : segment.id
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <h3 className="font-semibold">{segment.name}</h3>
                      <Badge variant="outline">
                        {segment.count.toLocaleString()} customers
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        ${segment.averageLifetimeValue.toLocaleString()} CLV
                      </span>
                      <span
                        className={
                          segment.growthRate > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {segment.growthRate > 0 ? "+" : ""}
                        {segment.growthRate}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {segment.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Avg Order Value
                      </div>
                      <div className="font-medium">
                        ${segment.averageOrderValue}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Purchase Frequency
                      </div>
                      <div className="font-medium">
                        {segment.purchaseFrequency}x/year
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Churn Rate
                      </div>
                      <div className="font-medium">{segment.churnRate}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Market Share
                      </div>
                      <div className="font-medium">{segment.percentage}%</div>
                    </div>
                  </div>

                  {selectedSegment === segment.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">
                            Key Characteristics
                          </h4>
                          <div className="space-y-1">
                            {segment.characteristics.map((char, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="mr-2 mb-1"
                              >
                                {char}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">
                            Recommended Actions
                          </h4>
                          <div className="space-y-1">
                            {segment.recommendedActions.map((action, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="mr-2 mb-1"
                              >
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DashboardCard>
        </>
      )}

      {/* Customers Tab */}
      {activeView === "customers" && (
        <>
          <DashboardCard
            title="Customer Explorer"
            description="Filtered customer list"
            colSpan={4}
          >
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Lifetime Value</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Churn Risk</TableHead>
                    <TableHead>Last Purchase</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.slice(0, 50).map(customer => {
                    const segment = segments.find(
                      s => s.id === customer.segment
                    );
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: segment?.color,
                              color: segment?.color,
                            }}
                          >
                            {segment?.name || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ${customer.lifetimeValue.toLocaleString()}
                        </TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={customer.churnRisk}
                              className="w-16 h-2"
                            />
                            <span className="text-xs">
                              {customer.churnRisk}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{customer.lastPurchaseDate}</TableCell>
                        <TableCell>{customer.location}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredCustomers.length > 50 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing first 50 results. Use filters to narrow down the list.
              </div>
            )}
          </DashboardCard>
        </>
      )}
    </div>
  );
}

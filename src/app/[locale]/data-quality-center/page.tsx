/**
 * Data Quality Monitoring Center
 * Task 72.3: Implementeer data cleaning en normalisatie modules
 *
 * Centraal dashboard voor monitoring van data cleaning, normalisatie
 * en kwaliteitsanalyse voor alle AI/ML engines
 */

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Zap,
  Database,
  Shield,
  RefreshCw,
  Target,
  Scale,
  Award,
} from "lucide-react";
import { AdvancedDataQualityScoring } from "@/lib/data-seeding/advanced-data-quality-scoring";
import {
  DataGovernanceFramework,
  type GovernanceDashboard,
} from "@/lib/data-seeding/data-governance-framework";
import {
  BiasDetectionMitigation,
  type BiasAnalysisResult,
} from "@/lib/data-seeding/bias-detection-mitigation";

// Types for the enhanced quality data
interface QualityData {
  overall_score: number;
  confidence_level: number;
  dimension_scores: Record<
    string,
    {
      name: string;
      score: number;
      confidence: number;
      weight: number;
    }
  >;
  quality_trend: {
    direction: string;
    rate_of_change: number;
    forecast_next_period: number;
  };
  recommendations: Array<{
    priority: string;
    category: string;
    description: string;
    expected_improvement: number;
  }>;
}

// Real-time status components
const DataQualityOverviewCard = () => (
  <Card className="border-l-4 border-l-emerald-500">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Overall Data Quality
      </CardTitle>
      <BarChart3 className="h-4 w-4 text-emerald-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-emerald-600">91.2%</div>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
        <TrendingUp className="h-3 w-3 text-emerald-500" />
        <span>+2.4% from last week</span>
      </div>
      <Progress value={91.2} className="mt-3 h-2" />
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="flex justify-between">
          <span>Completeness:</span>
          <span className="font-medium">94.1%</span>
        </div>
        <div className="flex justify-between">
          <span>Accuracy:</span>
          <span className="font-medium">96.3%</span>
        </div>
        <div className="flex justify-between">
          <span>Consistency:</span>
          <span className="font-medium">89.7%</span>
        </div>
        <div className="flex justify-between">
          <span>Timeliness:</span>
          <span className="font-medium">87.8%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NormalizationStatusCard = () => (
  <Card className="border-l-4 border-l-blue-500">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Active Normalization Schemas
      </CardTitle>
      <Database className="h-4 w-4 text-blue-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-blue-600">8</div>
      <div className="text-xs text-muted-foreground mt-1">
        Schemas actively processing
      </div>
      <div className="space-y-2 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs">Content Performance</span>
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Active
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Marketing Intelligence</span>
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Active
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Navigation ML</span>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1 text-yellow-500" />
            Processing
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DataProcessingMetricsCard = () => (
  <Card className="border-l-4 border-l-purple-500">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Processing Metrics</CardTitle>
      <Zap className="h-4 w-4 text-purple-600" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-purple-600">24.7K</div>
          <div className="text-xs text-muted-foreground">Records/hour</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">1.2ms</div>
          <div className="text-xs text-muted-foreground">Avg processing</div>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Cleaning Success Rate:</span>
          <span className="font-medium text-green-600">97.8%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Normalization Success:</span>
          <span className="font-medium text-green-600">94.2%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Auto-fix Applied:</span>
          <span className="font-medium text-blue-600">89.1%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const QualityIssuesCard = () => (
  <Card className="border-l-4 border-l-orange-500">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Active Quality Issues
      </CardTitle>
      <AlertTriangle className="h-4 w-4 text-orange-600" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm">Critical Issues</span>
          </div>
          <Badge variant="destructive" className="text-xs">
            3
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Warnings</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            12
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Auto-resolved</span>
          </div>
          <Badge variant="outline" className="text-xs">
            47
          </Badge>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="text-xs space-y-1">
        <div className="text-red-600">
          • Missing engagement metrics in Instagram data
        </div>
        <div className="text-orange-600">
          • Date format inconsistencies in LinkedIn feeds
        </div>
        <div className="text-orange-600">
          • Outlier detection in campaign ROI values
        </div>
      </div>
    </CardContent>
  </Card>
);

// Data sources monitoring table
const DataSourcesMonitoringTable = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Database className="h-5 w-5" />
        <span>Data Sources Quality Status</span>
      </CardTitle>
      <CardDescription>
        Real-time monitoring van alle data sources en hun kwaliteitsstatus
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          {
            source: "Instagram Business API",
            status: "healthy",
            quality: 94.2,
            lastUpdate: "2 min ago",
            records: "1.2K",
            issues: 0,
          },
          {
            source: "LinkedIn Marketing API",
            status: "warning",
            quality: 87.3,
            lastUpdate: "5 min ago",
            records: "856",
            issues: 3,
          },
          {
            source: "Facebook Graph API",
            status: "healthy",
            quality: 96.8,
            lastUpdate: "1 min ago",
            records: "2.1K",
            issues: 0,
          },
          {
            source: "Google Analytics 4",
            status: "processing",
            quality: 91.5,
            lastUpdate: "8 min ago",
            records: "5.7K",
            issues: 1,
          },
          {
            source: "Website Scraping",
            status: "error",
            quality: 73.2,
            lastUpdate: "15 min ago",
            records: "432",
            issues: 8,
          },
        ].map((source, index) => (
          <div
            key={index}
            className="grid grid-cols-6 items-center py-3 px-4 rounded-lg border"
          >
            <div className="font-medium">{source.source}</div>
            <div className="flex items-center space-x-2">
              {source.status === "healthy" && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {source.status === "warning" && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              {source.status === "error" && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {source.status === "processing" && (
                <Clock className="h-4 w-4 text-blue-500" />
              )}
              <Badge
                variant={
                  source.status === "healthy"
                    ? "default"
                    : source.status === "warning"
                      ? "secondary"
                      : source.status === "error"
                        ? "destructive"
                        : "outline"
                }
              >
                {source.status}
              </Badge>
            </div>
            <div className="text-right">
              <div className="font-medium">{source.quality}%</div>
              <Progress value={source.quality} className="mt-1 h-1" />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {source.lastUpdate}
            </div>
            <div className="text-center font-medium">{source.records}</div>
            <div className="text-center">
              {source.issues > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  {source.issues}
                </Badge>
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Normalization schemas status
const NormalizationSchemasStatus = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Filter className="h-5 w-5" />
        <span>Normalization Schemas Performance</span>
      </CardTitle>
      <CardDescription>
        Status en performance van alle active normalization schemas
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          {
            schema: "Content Performance Schema",
            engine: "Content Analysis Engine",
            records: "12.4K",
            successRate: 96.8,
            avgProcessingTime: "1.2ms",
            qualityScore: 94.2,
            lastRun: "30 sec ago",
          },
          {
            schema: "Marketing Intelligence Schema",
            engine: "Campaign Optimizer",
            records: "8.7K",
            successRate: 94.3,
            avgProcessingTime: "2.1ms",
            qualityScore: 91.7,
            lastRun: "1 min ago",
          },
          {
            schema: "Navigation ML Schema",
            engine: "AI Navigation Framework",
            records: "15.2K",
            successRate: 89.1,
            avgProcessingTime: "1.8ms",
            qualityScore: 87.3,
            lastRun: "2 min ago",
          },
        ].map((schema, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-gradient-to-r from-slate-50 to-blue-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold">{schema.schema}</h4>
                <p className="text-sm text-muted-foreground">{schema.engine}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {schema.lastRun}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-600">
                  {schema.records}
                </div>
                <div className="text-xs text-muted-foreground">
                  Records processed
                </div>
              </div>
              <div>
                <div className="font-medium text-green-600">
                  {schema.successRate}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Success rate
                </div>
              </div>
              <div>
                <div className="font-medium text-purple-600">
                  {schema.avgProcessingTime}
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg processing
                </div>
              </div>
              <div>
                <div className="font-medium text-orange-600">
                  {schema.qualityScore}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Quality score
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Processing efficiency</span>
                <span>{schema.successRate}%</span>
              </div>
              <Progress value={schema.successRate} className="h-2" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Quality trends chart placeholder
const QualityTrendsChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <TrendingUp className="h-5 w-5" />
        <span>Quality Trends & Forecasting</span>
      </CardTitle>
      <CardDescription>
        Historical trends en predictive analysis voor data kwaliteit
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Interactive quality trends chart</p>
          <p className="text-sm text-gray-400">
            Real-time data visualization with forecasting
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">+2.4%</div>
          <div className="text-xs text-green-700">7-day improvement</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">92.1%</div>
          <div className="text-xs text-blue-700">Predicted next week</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">15</div>
          <div className="text-xs text-purple-700">Auto-fixes applied</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Compliance & audit status
const ComplianceStatus = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Shield className="h-5 w-5" />
        <span>Compliance & Audit Status</span>
      </CardTitle>
      <CardDescription>
        GDPR compliance, data retention policies en audit readiness
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium">GDPR Compliance</div>
              <div className="text-sm text-muted-foreground">
                All data handling policies compliant
              </div>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">Compliant</Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium">Data Retention Policy</div>
              <div className="text-sm text-muted-foreground">
                Automated cleanup and archiving active
              </div>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <div className="font-medium">Audit Readiness</div>
              <div className="text-sm text-muted-foreground">
                3 quality issues need resolution
              </div>
            </div>
          </div>
          <Badge className="bg-orange-100 text-orange-800">
            Attention Required
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">Data Lineage Tracking</div>
              <div className="text-sm text-muted-foreground">
                Full traceability implemented
              </div>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">Active</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Add these new components for enhanced governance and bias monitoring
const GovernanceComplianceSection = () => {
  const [governanceData, setGovernanceData] =
    useState<GovernanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGovernanceData = async () => {
      try {
        const governance = new DataGovernanceFramework();
        const dashboard = await governance.generateGovernanceDashboard();
        setGovernanceData(dashboard);
      } catch (error) {
        console.error("Failed to load governance data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGovernanceData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Governance Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Data Governance Compliance</span>
        </CardTitle>
        <CardDescription>
          Comprehensive governance monitoring with policy enforcement and
          compliance tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Compliance Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Policy Compliance
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {governanceData
                      ? (governanceData.policy_compliance_score * 100).toFixed(
                          1
                        )
                      : 0}
                    %
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Violations
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {governanceData?.active_violations || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lineage Coverage
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {governanceData
                      ? (governanceData.data_lineage_coverage * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Compliance by Category */}
          <div className="space-y-3">
            <h4 className="font-medium">Compliance by Category</h4>
            {governanceData?.policy_compliance_by_category &&
              Object.entries(governanceData.policy_compliance_by_category).map(
                ([category, score]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="capitalize font-medium">
                      {category.replace("_", " ")}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${score >= 0.9 ? "bg-green-500" : score >= 0.7 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {(score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              )}
          </div>

          {/* Recent Violations */}
          {governanceData?.recent_violations &&
            governanceData.recent_violations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Recent Violations</h4>
                <div className="space-y-2">
                  {governanceData.recent_violations
                    .slice(0, 5)
                    .map((violation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              violation.severity === "critical"
                                ? "bg-red-500"
                                : violation.severity === "high"
                                  ? "bg-orange-500"
                                  : violation.severity === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                            }`}
                          ></div>
                          <div>
                            <p className="text-sm font-medium">
                              {violation.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                violation.detected_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            violation.severity === "critical"
                              ? "destructive"
                              : violation.severity === "high"
                                ? "destructive"
                                : violation.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {violation.severity}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

const BiasMonitoringSection = () => {
  const [biasData, setBiasData] = useState<Partial<BiasAnalysisResult> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBiasData = async () => {
      try {
        // Simulate bias analysis data - in production would come from actual analysis
        setBiasData({
          overall_bias_score: 0.15,
          bias_confidence: 0.78,
          detected_biases: [
            {
              bias_type: "representation_bias",
              severity: "medium",
              confidence: 0.85,
              affected_groups: ["age_group_18-25", "location_rural"],
              metric_values: {
                representation_ratio: 0.65,
                expected_ratio: 0.85,
              },
              statistical_significance: 0.92,
              description: "Underrepresentation of young rural demographics",
              business_impact:
                "May lead to biased insights for rural young adults segment",
              examples: [],
            },
          ],
          fairness_metrics: {
            demographic_parity_difference: 0.12,
            equalized_odds_difference: 0.08,
            disparate_impact_ratio: 0.75,
            statistical_parity_difference: 0.09,
            calibration_difference: 0.05,
          },
          statistical_significance: {
            chi_square: {
              test_statistic: 12.5,
              p_value: 0.002,
              significant: true,
              effect_size: 0.3,
              interpretation: "Significant demographic disparity detected",
            },
            mannwhitney_u: {
              test_statistic: 145.2,
              p_value: 0.01,
              significant: true,
              effect_size: 0.25,
              interpretation: "Significant difference in group outcomes",
            },
            fishers_exact: {
              test_statistic: 8.7,
              p_value: 0.003,
              significant: true,
              effect_size: 0.2,
              interpretation:
                "Significant association between demographics and outcomes",
            },
            kolmogorov_smirnov: {
              test_statistic: 0.15,
              p_value: 0.04,
              significant: true,
              effect_size: 0.18,
              interpretation: "Significant difference in distribution shapes",
            },
            welchs_t_test: {
              test_statistic: 2.8,
              p_value: 0.006,
              significant: true,
              effect_size: 0.22,
              interpretation: "Significant difference in group means",
            },
          },
          demographic_analysis: {
            group_distributions: {},
            representation_ratios: {},
            outcome_distributions: {},
            intersectional_analysis: [],
          },
          mitigation_recommendations: [],
          risk_assessment: {
            overall_risk_level: "medium",
            legal_compliance_risks: [],
            business_reputation_risks: [
              "Potential criticism for demographic gaps",
            ],
            ethical_concerns: ["Fairness in representation"],
            stakeholder_impact: {
              rural_communities: "Underrepresented in analysis",
            },
            regulatory_implications: [
              "May require additional diversity measures",
            ],
          },
        });
      } catch (error) {
        console.error("Failed to load bias data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBiasData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bias Detection & Mitigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Bias Detection & Fairness Monitoring</span>
        </CardTitle>
        <CardDescription>
          Advanced bias detection with statistical significance testing and
          mitigation recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bias Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overall Bias Score
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {biasData?.overall_bias_score
                      ? (biasData.overall_bias_score * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <Scale className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Detection Confidence
                  </p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {biasData?.bias_confidence
                      ? (biasData.bias_confidence * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-cyan-600" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Risk Level
                  </p>
                  <p className="text-2xl font-bold text-orange-600 capitalize">
                    {biasData?.risk_assessment?.overall_risk_level || "Low"}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Detected Biases */}
          {biasData?.detected_biases && biasData.detected_biases.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Detected Biases</h4>
              <div className="space-y-2">
                {biasData.detected_biases.map((bias, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            bias.severity === "critical"
                              ? "destructive"
                              : bias.severity === "high"
                                ? "destructive"
                                : bias.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {bias.severity}
                        </Badge>
                        <span className="font-medium capitalize">
                          {bias.bias_type.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(bias.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bias.description}
                    </p>
                    {bias.affected_groups &&
                      bias.affected_groups.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {bias.affected_groups.map((group, groupIndex) => (
                            <Badge
                              key={groupIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              {group}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {biasData?.risk_assessment && (
            <div className="space-y-3">
              <h4 className="font-medium">Risk Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {biasData.risk_assessment.business_reputation_risks?.length >
                  0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-yellow-800 mb-2">
                      Reputation Risks
                    </h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {biasData.risk_assessment.business_reputation_risks.map(
                        (risk, index) => (
                          <li key={index}>• {risk}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {biasData.risk_assessment.legal_compliance_risks?.length >
                  0 && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h5 className="font-medium text-red-800 mb-2">
                      Legal Risks
                    </h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      {biasData.risk_assessment.legal_compliance_risks.map(
                        (risk, index) => (
                          <li key={index}>• {risk}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AdvancedQualityMetrics = () => {
  const [qualityData, setQualityData] = useState<QualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQualityData = async () => {
      try {
        // Simulate advanced quality scoring data
        setQualityData({
          overall_score: 0.87,
          confidence_level: 0.92,
          dimension_scores: {
            completeness: {
              name: "completeness",
              score: 0.89,
              confidence: 0.95,
              weight: 0.25,
            },
            accuracy: {
              name: "accuracy",
              score: 0.91,
              confidence: 0.88,
              weight: 0.25,
            },
            consistency: {
              name: "consistency",
              score: 0.85,
              confidence: 0.9,
              weight: 0.2,
            },
            timeliness: {
              name: "timeliness",
              score: 0.82,
              confidence: 0.93,
              weight: 0.15,
            },
            validity: {
              name: "validity",
              score: 0.94,
              confidence: 0.89,
              weight: 0.1,
            },
            uniqueness: {
              name: "uniqueness",
              score: 0.96,
              confidence: 0.97,
              weight: 0.05,
            },
          },
          quality_trend: {
            direction: "improving",
            rate_of_change: 0.03,
            forecast_next_period: 0.9,
          },
          recommendations: [
            {
              priority: "high",
              category: "data",
              description:
                "Improve timeliness by implementing real-time data updates",
              expected_improvement: 15,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to load quality data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQualityData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Advanced Quality Scoring with Confidence Metrics</span>
        </CardTitle>
        <CardDescription>
          Multi-dimensional quality assessment with temporal confidence
          degradation and source reliability weighting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overall Quality Score
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {qualityData
                      ? (qualityData.overall_score * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Confidence Level
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {qualityData
                      ? (qualityData.confidence_level * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Quality Trend
                  </p>
                  <p className="text-2xl font-bold text-violet-600 capitalize">
                    {qualityData?.quality_trend?.direction || "Stable"}
                  </p>
                </div>
                <TrendingUp
                  className={`h-8 w-8 ${
                    qualityData?.quality_trend?.direction === "improving"
                      ? "text-green-600"
                      : qualityData?.quality_trend?.direction === "declining"
                        ? "text-red-600"
                        : "text-violet-600"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Quality Dimensions */}
          <div className="space-y-3">
            <h4 className="font-medium">Quality Dimensions</h4>
            {qualityData?.dimension_scores &&
              Object.values(qualityData.dimension_scores).map(dimension => (
                <div key={dimension.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="capitalize font-medium">
                      {dimension.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Weight: {(dimension.weight * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="secondary">
                        Confidence: {(dimension.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                        <div
                          className={`h-3 rounded-full ${
                            dimension.score >= 0.9
                              ? "bg-green-500"
                              : dimension.score >= 0.8
                                ? "bg-yellow-500"
                                : dimension.score >= 0.7
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${dimension.score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {(dimension.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Quality Recommendations */}
          {qualityData?.recommendations &&
            qualityData.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">
                  Quality Improvement Recommendations
                </h4>
                <div className="space-y-2">
                  {qualityData.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant={
                            rec.priority === "critical"
                              ? "destructive"
                              : rec.priority === "high"
                                ? "destructive"
                                : rec.priority === "medium"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {rec.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Expected improvement: {rec.expected_improvement}%
                        </span>
                      </div>
                      <p className="text-sm">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main dashboard component
export default function DataQualityCenterPage() {
  // Note: Translation functionality would be added here when i18n is fully implemented

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Data Quality Monitoring Center
              </h1>
              <p className="text-gray-600 mt-2">
                Centraal dashboard voor data cleaning, normalisatie en
                kwaliteitsmonitoring
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </div>

        {/* Quick status alert */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Quality Alert</AlertTitle>
          <AlertDescription>
            3 critical data quality issues detected requiring immediate
            attention. LinkedIn data source showing 87.3% quality score below
            threshold.
          </AlertDescription>
        </Alert>

        {/* Overview metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DataQualityOverviewCard />
          <NormalizationStatusCard />
          <DataProcessingMetricsCard />
          <QualityIssuesCard />
        </div>

        {/* Main content tabs */}
        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="schemas">Schemas</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            <DataSourcesMonitoringTable />
          </TabsContent>

          <TabsContent value="schemas">
            <NormalizationSchemasStatus />
          </TabsContent>

          <TabsContent value="trends">
            <QualityTrendsChart />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceStatus />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Quality Monitoring Settings</CardTitle>
                <CardDescription>
                  Configure thresholds, alerts, and automated remediation
                  settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Configuration interface for quality monitoring parameters
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Quality Metrics */}
        <AdvancedQualityMetrics />

        {/* Data Governance Section */}
        <GovernanceComplianceSection />

        {/* Bias Monitoring Section */}
        <BiasMonitoringSection />

        {/* Enhanced compliance status with governance integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Enhanced Compliance & Audit Status</span>
            </CardTitle>
            <CardDescription>
              Integrated GDPR compliance, data retention policies, governance
              framework, and audit readiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">GDPR Compliance</div>
                      <div className="text-sm text-muted-foreground">
                        Full compliance active
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Data Governance</div>
                      <div className="text-sm text-muted-foreground">
                        Policies enforced
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Bias Detection</div>
                      <div className="text-sm text-muted-foreground">
                        Continuous monitoring
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Quality Scoring</div>
                      <div className="text-sm text-muted-foreground">
                        Advanced algorithms
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">
                    Enhanced
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

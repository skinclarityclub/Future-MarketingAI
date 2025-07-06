"use client";

/**
 * Audit Dashboard Component
 * Task 37.3: Develop Centralized Audit Logging System
 *
 * Comprehensive dashboard for monitoring and managing audit logs
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Shield,
  Activity,
  Users,
  Clock,
  Download,
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";

interface AuditLog {
  id: string;
  event_id: string;
  event_category: string;
  event_type: string;
  event_name: string;
  status: string;
  severity: string;
  user_id?: string;
  ip_address?: string;
  message: string;
  event_timestamp: string;
  risk_score?: number;
  requires_review: boolean;
  details?: Record<string, any>;
}

interface AuditStats {
  totalEvents: number;
  securityEvents: number;
  failedEvents: number;
  highRiskEvents: number;
  eventsLast24h: number;
  averageRiskScore: number;
}

export default function AuditDashboard() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    totalEvents: 0,
    securityEvents: 0,
    failedEvents: 0,
    highRiskEvents: 0,
    eventsLast24h: 0,
    averageRiskScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    category: "",
    severity: "",
    status: "",
    userId: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  /**
   * Fetch audit logs with current filters
   */
  const fetchAuditLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      // Add filters to params
      if (filters.category) params.append("category", filters.category);
      if (filters.severity) params.append("severity", filters.severity);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/audit/logs?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setAuditLogs(result.data);
        setTotalPages(Math.ceil(result.total / pageSize));

        // Calculate stats
        calculateStats(result.data, result.total);
      } else {
        throw new Error(result.message || "Failed to fetch audit logs");
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate dashboard statistics
   */
  const calculateStats = (logs: AuditLog[], total: number) => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const securityEvents = logs.filter(
      log =>
        log.event_category === "security_event" || log.severity === "security"
    ).length;

    const failedEvents = logs.filter(
      log => log.status === "failure" || log.status === "blocked"
    ).length;

    const highRiskEvents = logs.filter(
      log => log.risk_score && log.risk_score >= 7
    ).length;

    const eventsLast24h = logs.filter(
      log => new Date(log.event_timestamp) >= yesterday
    ).length;

    const riskScores = logs
      .filter(log => log.risk_score !== null && log.risk_score !== undefined)
      .map(log => log.risk_score!);

    const averageRiskScore =
      riskScores.length > 0
        ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
        : 0;

    setStats({
      totalEvents: total,
      securityEvents,
      failedEvents,
      highRiskEvents,
      eventsLast24h,
      averageRiskScore: Math.round(averageRiskScore * 100) / 100,
    });
  };

  /**
   * Get severity badge color
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "security":
        return "destructive";
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      case "debug":
        return "outline";
      default:
        return "default";
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "failure":
        return "destructive";
      case "blocked":
        return "destructive";
      case "warning":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "default";
    }
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("nl-NL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  /**
   * Export audit logs
   */
  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: "10000", // Export more records
        offset: "0",
      });

      // Add current filters
      if (filters.category) params.append("category", filters.category);
      if (filters.severity) params.append("severity", filters.severity);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/audit/logs?${params}`);
      const result = await response.json();

      if (result.success) {
        // Create CSV content
        const headers = [
          "Event ID",
          "Category",
          "Type",
          "Severity",
          "Status",
          "User ID",
          "IP Address",
          "Message",
          "Timestamp",
          "Risk Score",
        ];
        const csvContent = [
          headers.join(","),
          ...result.data.map((log: AuditLog) =>
            [
              log.event_id,
              log.event_category,
              log.event_type,
              log.severity,
              log.status,
              log.user_id || "",
              log.ip_address || "",
              `"${log.message.replace(/"/g, '""')}"`,
              log.event_timestamp,
              log.risk_score || "",
            ].join(",")
          ),
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error exporting logs:", err);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Apply filters
   */
  const applyFilters = () => {
    setCurrentPage(1);
    fetchAuditLogs(1);
  };

  /**
   * Clear filters
   */
  const clearFilters = () => {
    setFilters({
      category: "",
      severity: "",
      status: "",
      userId: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setCurrentPage(1);
    fetchAuditLogs(1);
  };

  // Initial load
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Audit Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Enterprise security audit log monitoring and management
              </p>
            </div>
            <div className="flex gap-3">
              <NormalButton
                onClick={() => fetchAuditLogs(currentPage)}
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </NormalButton>
              <NormalButton onClick={exportLogs} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </NormalButton>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">
                  {stats.totalEvents.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-2xl font-bold text-red-600">
                  {stats.securityEvents}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Failed Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-2xl font-bold text-orange-600">
                  {stats.failedEvents}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                High Risk Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-2xl font-bold text-red-600">
                  {stats.highRiskEvents}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last 24h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">
                  {stats.eventsLast24h}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">
                  {stats.averageRiskScore}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={value => handleFilterChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="authentication">
                      Authentication
                    </SelectItem>
                    <SelectItem value="authorization">Authorization</SelectItem>
                    <SelectItem value="data_access">Data Access</SelectItem>
                    <SelectItem value="data_modification">
                      Data Modification
                    </SelectItem>
                    <SelectItem value="security_event">
                      Security Event
                    </SelectItem>
                    <SelectItem value="api_access">API Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Severity
                </label>
                <Select
                  value={filters.severity}
                  onValueChange={value => handleFilterChange("severity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All severities</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Start Date
                </label>
                <Input
                  type="datetime-local"
                  value={filters.startDate}
                  onChange={e =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  End Date
                </label>
                <Input
                  type="datetime-local"
                  value={filters.endDate}
                  onChange={e => handleFilterChange("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <NormalButton onClick={applyFilters}>
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </NormalButton>
              <NormalButton variant="outline" onClick={clearFilters}>
                Clear Filters
              </NormalButton>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              Recent audit events and security logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {log.event_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.event_type}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.event_category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getSeverityColor(log.severity) as any}
                            >
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(log.status) as any}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.user_id || "-"}</TableCell>
                          <TableCell>{log.ip_address || "-"}</TableCell>
                          <TableCell>
                            {log.risk_score ? (
                              <Badge
                                variant={
                                  log.risk_score >= 7
                                    ? "destructive"
                                    : log.risk_score >= 4
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {log.risk_score}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {formatTimestamp(log.event_timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <NormalButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPage = currentPage - 1;
                          setCurrentPage(newPage);
                          fetchAuditLogs(newPage);
                        }}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </NormalButton>
                      <NormalButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPage = currentPage + 1;
                          setCurrentPage(newPage);
                          fetchAuditLogs(newPage);
                        }}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </NormalButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

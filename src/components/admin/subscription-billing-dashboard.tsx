"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { SubscriptionTier } from "@/lib/rbac/access-tier-service";
import { SubscriptionAnalytics } from "@/lib/subscription/subscription-service";

// Mock data interfaces
interface SubscriptionMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalSubscribers: number;
  activeSubscribers: number;
  churnRate: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  revenueGrowth: number;
  subscriberGrowth: number;
}

interface CustomerSubscription {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  tier: SubscriptionTier;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  amount: number;
  billingInterval: "monthly" | "yearly";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  lastPayment?: Date;
  nextBillingDate: Date;
}

interface InvoiceData {
  id: string;
  customerName: string;
  email: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "failed";
  invoiceDate: Date;
  dueDate: Date;
  paidAt?: Date;
  description: string;
}

interface SubscriptionBillingDashboardProps {
  className?: string;
}

export function SubscriptionBillingDashboard({
  className,
}: SubscriptionBillingDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState("30d");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  // Mock data - would be fetched from API
  const [metrics, setMetrics] = useState<SubscriptionMetrics>({
    totalRevenue: 145280,
    monthlyRecurringRevenue: 23450,
    annualRecurringRevenue: 281400,
    totalSubscribers: 1247,
    activeSubscribers: 1189,
    churnRate: 3.2,
    averageRevenuePerUser: 19.7,
    conversionRate: 12.5,
    revenueGrowth: 8.5,
    subscriberGrowth: 15.2,
  });

  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([
    {
      id: "sub_1",
      userId: "user_1",
      customerName: "Acme Corporation",
      email: "billing@acme.com",
      tier: "enterprise",
      status: "active",
      amount: 449,
      billingInterval: "monthly",
      currentPeriodStart: new Date("2025-01-01"),
      currentPeriodEnd: new Date("2025-02-01"),
      createdAt: new Date("2024-06-15"),
      lastPayment: new Date("2025-01-01"),
      nextBillingDate: new Date("2025-02-01"),
    },
    {
      id: "sub_2",
      userId: "user_2",
      customerName: "TechStart BV",
      email: "founder@techstart.nl",
      tier: "professional",
      status: "active",
      amount: 149,
      billingInterval: "monthly",
      currentPeriodStart: new Date("2025-01-10"),
      currentPeriodEnd: new Date("2025-02-10"),
      createdAt: new Date("2024-08-20"),
      lastPayment: new Date("2025-01-10"),
      nextBillingDate: new Date("2025-02-10"),
    },
    {
      id: "sub_3",
      userId: "user_3",
      customerName: "Marketing Plus",
      email: "admin@marketingplus.com",
      tier: "starter",
      status: "past_due",
      amount: 49,
      billingInterval: "monthly",
      currentPeriodStart: new Date("2024-12-25"),
      currentPeriodEnd: new Date("2025-01-25"),
      createdAt: new Date("2024-11-01"),
      lastPayment: new Date("2024-12-25"),
      nextBillingDate: new Date("2025-01-25"),
    },
  ]);

  const [invoices, setInvoices] = useState<InvoiceData[]>([
    {
      id: "inv_001",
      customerName: "Acme Corporation",
      email: "billing@acme.com",
      amount: 449,
      status: "paid",
      invoiceDate: new Date("2025-01-01"),
      dueDate: new Date("2025-01-15"),
      paidAt: new Date("2025-01-02"),
      description: "Enterprise Plan - January 2025",
    },
    {
      id: "inv_002",
      customerName: "TechStart BV",
      email: "founder@techstart.nl",
      amount: 149,
      status: "paid",
      invoiceDate: new Date("2025-01-10"),
      dueDate: new Date("2025-01-25"),
      paidAt: new Date("2025-01-12"),
      description: "Professional Plan - January 2025",
    },
    {
      id: "inv_003",
      customerName: "Marketing Plus",
      email: "admin@marketingplus.com",
      amount: 49,
      status: "overdue",
      invoiceDate: new Date("2024-12-25"),
      dueDate: new Date("2025-01-10"),
      description: "Starter Plan - January 2025",
    },
  ]);

  // Mock data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch =
      sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesTier = tierFilter === "all" || sub.tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "trialing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "past_due":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case "free":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "starter":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "professional":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "enterprise":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "ultimate":
        return "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading subscription data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription & Billing Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor revenue, manage subscriptions, and track billing metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={selectedDateRange}
            onValueChange={setSelectedDateRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Recurring Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics.monthlyRecurringRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">
                    +{metrics.revenueGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Subscribers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.activeSubscribers.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">
                    +{metrics.subscriberGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Revenue Per User
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics.averageRevenuePerUser)}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+2.1%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Churn Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.churnRate}%
                </p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">-0.3%</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="ultimate">Ultimate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Customer Subscriptions ({filteredSubscriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Tier</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Billing</th>
                      <th className="text-left p-4 font-medium">
                        Next Payment
                      </th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map(subscription => (
                      <tr
                        key={subscription.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium">
                              {subscription.customerName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {subscription.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getTierColor(subscription.tier)}>
                            {subscription.tier}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={getStatusColor(subscription.status)}
                          >
                            {subscription.status}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">
                          {formatCurrency(subscription.amount)}
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            /{subscription.billingInterval}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {formatDate(subscription.currentPeriodStart)} -{" "}
                            {formatDate(subscription.currentPeriodEnd)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(subscription.nextBillingDate)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Invoices ({filteredInvoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Invoice</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Due Date</th>
                      <th className="text-left p-4 font-medium">Paid Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(invoice => (
                      <tr
                        key={invoice.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-4">
                          <div className="font-medium">{invoice.id}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {invoice.description}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">
                              {invoice.customerName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {invoice.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-4">{formatDate(invoice.dueDate)}</td>
                        <td className="p-4">
                          {invoice.paidAt ? formatDate(invoice.paidAt) : "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Revenue chart would be implemented here with Recharts
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries({
                    enterprise: 15,
                    professional: 45,
                    starter: 35,
                    free: 5,
                  }).map(([tier, percentage]) => (
                    <div
                      key={tier}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Badge
                          className={getTierColor(tier as SubscriptionTier)}
                        >
                          {tier}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

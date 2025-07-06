"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  TrendingUp,
  Mail,
  Calendar,
  Search,
  Download,
  Send,
  Eye,
  CheckCircle,
  DollarSign,
  Building,
  Star,
  BarChart3,
  User,
  Zap,
} from "lucide-react";

interface WaitlistEntry {
  id: string;
  // Basic Contact Info
  email: string;
  company: string;
  name: string;
  firstName?: string;
  lastName?: string;
  jobTitle: string;
  phone?: string;

  // Business Intelligence
  companySize: string;
  industry: string;
  monthlyMarketingBudget: string;
  currentMarketingApproach: string;

  // Goals & Challenges
  primaryGoals: string[];
  biggestChallenges: string[];
  desiredTimeline: string;

  // Platform & Expectations
  currentPlatforms: string[];
  expectedROI: string;

  // Context & Notes
  hearAboutUs: string;
  additionalInfo?: string;

  // System Fields
  product: "marketingMachine" | "biDashboard" | "combo" | "hero_waitlist";
  signupDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "contacted" | "qualified" | "converted" | "rejected";
  notes?: string;
  qualificationScore: number;
  source: string;
}

interface WaitlistStats {
  total: number;
  pendingCount: number;
  contactedCount: number;
  qualifiedCount: number;
  convertedCount: number;
  conversionRate: number;
  totalPotentialRevenue: string;
  marketingMachineCount: number;
  biDashboardCount: number;
  comboCount: number;
}

export default function WaitlistManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in production, this would come from API
  const mockWaitlistEntries: WaitlistEntry[] = [
    {
      id: "1",
      email: "john.doe@techcorp.com",
      company: "TechCorp BV",
      name: "John Doe",
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Marketing Director",
      phone: "+31 6 12345678",
      companySize: "50-200",
      industry: "Technology",
      monthlyMarketingBudget: "€50,000-€100,000",
      currentMarketingApproach: "AI automation",
      primaryGoals: ["Increase efficiency", "Improve customer experience"],
      biggestChallenges: [
        "Finding skilled professionals",
        "Scaling the business",
      ],
      desiredTimeline: "2024-01-15",
      currentPlatforms: ["MarketingMachine"],
      expectedROI: "20%",
      hearAboutUs: "Landing Page",
      qualificationScore: 92,
      source: "Landing Page",
      product: "marketingMachine",
      signupDate: "2024-01-15",
      priority: "high",
      status: "qualified",
      notes: "Very interested in AI automation. Has budget approval.",
    },
    {
      id: "2",
      email: "sarah.wilson@innovate.com",
      company: "Innovate Solutions",
      name: "Sarah Wilson",
      firstName: "Sarah",
      lastName: "Wilson",
      jobTitle: "CEO",
      phone: "+31 6 87654321",
      companySize: "20-50",
      industry: "Technology",
      monthlyMarketingBudget: "€25,000-€50,000",
      currentMarketingApproach: "BI Dashboard functionality",
      primaryGoals: ["Improve data analysis", "Enhance customer insights"],
      biggestChallenges: [
        "Finding reliable data sources",
        "Integrating new technologies",
      ],
      desiredTimeline: "2024-01-16",
      currentPlatforms: ["BI Dashboard"],
      expectedROI: "15%",
      hearAboutUs: "LinkedIn Campaign",
      qualificationScore: 87,
      source: "LinkedIn Campaign",
      product: "biDashboard",
      signupDate: "2024-01-16",
      priority: "high",
      status: "contacted",
      notes: "Needs demo of BI Dashboard functionality.",
    },
    {
      id: "3",
      email: "mike.johnson@retail.nl",
      company: "Retail Plus",
      name: "Mike Johnson",
      firstName: "Mike",
      lastName: "Johnson",
      jobTitle: "Operations Manager",
      phone: "+31 6 12345678",
      companySize: "10-20",
      industry: "Retail",
      monthlyMarketingBudget: "€10,000-€25,000",
      currentMarketingApproach: "Google Ads",
      primaryGoals: ["Increase online sales", "Improve customer retention"],
      biggestChallenges: ["Finding new customers", "Managing inventory"],
      desiredTimeline: "2024-01-17",
      currentPlatforms: ["MarketingMachine"],
      expectedROI: "10%",
      hearAboutUs: "Google Ads",
      qualificationScore: 68,
      source: "Google Ads",
      product: "marketingMachine",
      signupDate: "2024-01-17",
      priority: "medium",
      status: "pending",
      notes: "Interested but needs approval from board.",
    },
  ];

  const [waitlistEntries, setWaitlistEntries] =
    useState<WaitlistEntry[]>(mockWaitlistEntries);

  // Calculate statistics
  const calculateStats = (): WaitlistStats => {
    const total = waitlistEntries.length;
    const pendingCount = waitlistEntries.filter(
      e => e.status === "pending"
    ).length;
    const contactedCount = waitlistEntries.filter(
      e => e.status === "contacted"
    ).length;
    const qualifiedCount = waitlistEntries.filter(
      e => e.status === "qualified"
    ).length;
    const convertedCount = waitlistEntries.filter(
      e => e.status === "converted"
    ).length;
    const conversionRate = total > 0 ? (convertedCount / total) * 100 : 0;
    const totalPotentialRevenue = waitlistEntries.reduce((sum, e) => {
      const price = parseInt(e.monthlyMarketingBudget.replace(/[€,]/g, ""));
      return sum + price;
    }, 0);
    const marketingMachineCount = waitlistEntries.filter(
      e => e.product === "marketingMachine"
    ).length;
    const biDashboardCount = waitlistEntries.filter(
      e => e.product === "biDashboard"
    ).length;
    const comboCount = waitlistEntries.filter(
      e => e.product === "combo"
    ).length;

    return {
      total,
      pendingCount,
      contactedCount,
      qualifiedCount,
      convertedCount,
      conversionRate,
      totalPotentialRevenue: `€${totalPotentialRevenue.toLocaleString()}`,
      marketingMachineCount,
      biDashboardCount,
      comboCount,
    };
  };

  const stats = calculateStats();

  // Filter entries based on search and filters
  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;
    const matchesProduct =
      productFilter === "all" || entry.product === productFilter;
    const matchesPriority =
      priorityFilter === "all" || entry.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesProduct && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "Pending",
      },
      contacted: {
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "Contacted",
      },
      qualified: {
        className: "bg-green-500/10 text-green-400 border-green-500/20",
        label: "Qualified",
      },
      converted: {
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        label: "Converted",
      },
      rejected: {
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Rejected",
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: {
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "High",
      },
      medium: {
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "Medium",
      },
      low: {
        className: "bg-green-500/10 text-green-400 border-green-500/20",
        label: "Low",
      },
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const updateEntryStatus = (id: string, newStatus: string) => {
    setWaitlistEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, status: newStatus as WaitlistEntry["status"] }
          : entry
      )
    );
  };

  const handleSendEmail = (entry: WaitlistEntry) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Email sent to ${entry.email}`);
    }, 1000);
  };

  const exportData = () => {
    const csvData = filteredEntries.map(entry => ({
      Name: entry.name,
      Email: entry.email,
      Company: entry.company,
      Product: entry.product,
      Status: entry.status,
      Priority: entry.priority,
      Score: entry.qualificationScore,
      "Current Price": entry.monthlyMarketingBudget,
      "Signup Date": entry.signupDate,
      Budget: entry.monthlyMarketingBudget,
      "Company Size": entry.companySize,
      Industry: entry.industry,
      "Monthly Marketing Budget": entry.monthlyMarketingBudget,
      "Current Marketing Approach": entry.currentMarketingApproach,
      "Primary Goals": entry.primaryGoals.join(", "),
      "Biggest Challenges": entry.biggestChallenges.join(", "),
      "Desired Timeline": entry.desiredTimeline,
      "Current Platforms": entry.currentPlatforms.join(", "),
      "Expected ROI": entry.expectedROI,
      "Hear About Us": entry.hearAboutUs,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waitlist-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Waitlist Management
          </h2>
          <p className="text-slate-400 mt-1">
            Manage and track your MarketingMachine waitlist leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportData}
            className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600">
            <Send className="w-4 h-4 mr-2" />
            Bulk Email
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.total}
                </div>
                <div className="text-sm text-cyan-400">Total Signups</div>
              </div>
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.qualifiedCount}
                </div>
                <div className="text-sm text-green-400">Qualified Leads</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-400">Conversion Rate</div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalPotentialRevenue}
                </div>
                <div className="text-sm text-yellow-400">Potential Revenue</div>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-white">
                  {stats.marketingMachineCount}
                </div>
                <div className="text-sm text-slate-400">MarketingMachine</div>
              </div>
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-white">
                  {stats.biDashboardCount}
                </div>
                <div className="text-sm text-slate-400">BI Dashboard</div>
              </div>
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-white">
                  {stats.comboCount}
                </div>
                <div className="text-sm text-slate-400">Combo Package</div>
              </div>
              <Star className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-40 bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="marketingMachine">
                  MarketingMachine
                </SelectItem>
                <SelectItem value="biDashboard">BI Dashboard</SelectItem>
                <SelectItem value="combo">Combo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40 bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Waitlist Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Waitlist Entries ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {entry.name}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {entry.jobTitle} at {entry.company}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">{entry.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">{entry.product}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">
                          {entry.monthlyMarketingBudget}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">
                          {entry.signupDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      {getStatusBadge(entry.status)}
                      {getPriorityBadge(entry.priority)}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Score:</span>
                        <span
                          className={`font-medium ${getScoreColor(entry.qualificationScore)}`}
                        >
                          {entry.qualificationScore}
                        </span>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="bg-slate-800/50 p-3 rounded-md">
                        <p className="text-sm text-slate-300">{entry.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleSendEmail(entry)}
                      disabled={isLoading}
                      className="bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Select
                      value={entry.status}
                      onValueChange={value =>
                        updateEntryStatus(entry.id, value)
                      }
                    >
                      <SelectTrigger className="w-32 bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

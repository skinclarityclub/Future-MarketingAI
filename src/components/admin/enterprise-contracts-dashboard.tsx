"use client";

import React, { useState } from "react";
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
import {
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";

/**
 * Enterprise Contract Management Dashboard
 * Task 36.6: Enterprise Contract Management System
 * Fortune 500 contract administration and monitoring
 */

interface EnterpriseContract {
  id: string;
  contract_number: string;
  contract_name: string;
  company_name: string;
  annual_contract_value: number;
  effective_date: string;
  expiration_date: string;
  status: "draft" | "active" | "renewal" | "terminated" | "suspended";
  service_tier: "marketing-machine" | "complete-intelligence" | "custom";
  health_score: number;
}

const CONTRACT_STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  renewal: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
  suspended: "bg-orange-100 text-orange-800",
};

const SERVICE_TIER_LABELS = {
  "marketing-machine": "Marketing Machine (€180K)",
  "complete-intelligence": "Complete Intelligence (€300K)",
  custom: "Custom Enterprise",
};

// Sample data for demonstration
const sampleContracts: EnterpriseContract[] = [
  {
    id: "1",
    contract_number: "MKB-2024-001",
    contract_name: "Scale-Up Marketing Intelligence Platform",
    company_name: "TechMotion B.V.",
    annual_contract_value: 18000,
    effective_date: "2024-01-01",
    expiration_date: "2024-12-31",
    status: "active",
    service_tier: "complete-intelligence",
    health_score: 0.92,
  },
  {
    id: "2",
    contract_number: "MKB-2024-002",
    contract_name: "Marketing Automation Suite",
    company_name: "GreenCycle Solutions",
    annual_contract_value: 24000,
    effective_date: "2024-03-15",
    expiration_date: "2025-03-14",
    status: "active",
    service_tier: "marketing-machine",
    health_score: 0.87,
  },
  {
    id: "3",
    contract_number: "MKB-2024-003",
    contract_name: "Custom Analytics Platform",
    company_name: "FinTech Innovations",
    annual_contract_value: 36000,
    effective_date: "2024-06-01",
    expiration_date: "2026-05-31",
    status: "renewal",
    service_tier: "custom",
    health_score: 0.95,
  },
];

export default function EnterpriseContractsDashboard() {
  const [contracts] = useState<EnterpriseContract[]>(sampleContracts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  // Filter contracts based on search and filters
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch =
      contract.contract_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || contract.status === statusFilter;
    const matchesTier =
      tierFilter === "all" || contract.service_tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  // Calculate stats
  const stats = {
    total_contracts: contracts.length,
    active_contracts: contracts.filter(c => c.status === "active").length,
    pending_renewal: contracts.filter(c => c.status === "renewal").length,
    total_annual_value: contracts.reduce(
      (sum, c) => sum + c.annual_contract_value,
      0
    ),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getDaysRemaining = (expirationDate: string) => {
    const days = Math.ceil(
      (new Date(expirationDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Scale-Up Contract Management
          </h1>
          <p className="text-gray-600 mt-1">
            MKB contract administration and monitoring
          </p>
        </div>

        <NormalButton className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Contract
        </NormalButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contracts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_contracts}</div>
            <p className="text-xs text-muted-foreground">
              Enterprise agreements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Contracts
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active_contracts}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Renewal
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending_renewal}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.total_annual_value)}
            </div>
            <p className="text-xs text-muted-foreground">Total ACV</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contracts, companies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="renewal">Renewal</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="marketing-machine">
                  Marketing Machine
                </SelectItem>
                <SelectItem value="complete-intelligence">
                  Complete Intelligence
                </SelectItem>
                <SelectItem value="custom">Custom Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <NormalButton
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTierFilter("all");
              }}
            >
              Clear Filters
            </NormalButton>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Contracts</CardTitle>
          <CardDescription>
            Manage Fortune 500 enterprise agreements and their lifecycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Service Tier</TableHead>
                  <TableHead>Annual Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map(contract => {
                  const daysRemaining = getDaysRemaining(
                    contract.expiration_date
                  );

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {contract.contract_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.contract_number}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          <div className="font-medium">
                            {contract.company_name}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {SERVICE_TIER_LABELS[contract.service_tier]}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium">
                        {formatCurrency(contract.annual_contract_value)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={CONTRACT_STATUS_COLORS[contract.status]}
                        >
                          {contract.status.charAt(0).toUpperCase() +
                            contract.status.slice(1)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`font-medium ${getHealthScoreColor(contract.health_score)}`}
                        >
                          {Math.round(contract.health_score * 100)}%
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm">
                              {new Date(
                                contract.expiration_date
                              ).toLocaleDateString("nl-NL")}
                            </div>
                            <div
                              className={`text-xs ${daysRemaining < 90 ? "text-yellow-600" : "text-gray-500"}`}
                            >
                              {daysRemaining > 0
                                ? `${daysRemaining} days left`
                                : "Expired"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <NormalButton variant="ghost" size="sm">
                          View Details
                        </NormalButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredContracts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No contracts found matching your criteria
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

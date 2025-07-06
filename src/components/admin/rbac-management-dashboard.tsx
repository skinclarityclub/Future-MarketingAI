"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Shield,
  Users,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useRBAC, useIsAdmin } from "@/hooks/use-rbac";
import { createRBACService, UserRoleType } from "@/lib/rbac/rbac-service";

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export function RBACManagementDashboard() {
  const { isAdmin, isLoading: rbacLoading } = useIsAdmin();
  const { userId: currentUserId, permissions } = useRBAC();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for different sections
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  // Form states
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRoleType | "">("");
  const [assignedBy, setAssignedBy] = useState(currentUserId || "");

  const rbacService = createRBACService();

  // Check if user has admin permissions
  if (rbacLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You do not have permission to access the RBAC management dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // This would typically load from your user management system
      // For now, we'll focus on the RBAC-specific data
      const [rolesData, permissionsData, logsData] = await Promise.all([
        loadUserRoles(),
        loadRolePermissions(),
        loadAuditLogs(),
      ]);

      setUserRoles(rolesData);
      setRolePermissions(permissionsData);
      setAuditLogs(logsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRoles = async () => {
    // In a real implementation, you'd fetch all user roles
    // For now, return sample data structure
    return [];
  };

  const loadRolePermissions = async () => {
    // Load role permissions for all roles
    const roles: UserRoleType[] = [
      "super_admin",
      "admin",
      "compliance_officer",
      "security_admin",
      "auditor",
      "risk_manager",
      "executive",
      "manager",
      "analyst",
      "user",
    ];

    const allPermissions = [];
    for (const role of roles) {
      try {
        const permissions = await rbacService.getRolePermissions(role);
        allPermissions.push(...permissions.map(p => ({ ...p, role })));
      } catch (error) {
        console.error(`Failed to load permissions for role ${role}:`, error);
      }
    }
    return allPermissions;
  };

  const loadAuditLogs = async () => {
    try {
      return await rbacService.getAuditLogs(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        50
      );
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      return [];
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole || !assignedBy) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await rbacService.assignRole(selectedUser, selectedRole, assignedBy);
      setSuccess(`Successfully assigned ${selectedRole} role to user`);

      // Reload data
      await loadDashboardData();

      // Reset form
      setSelectedUser("");
      setSelectedRole("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeRole = async (roleId: string) => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      await rbacService.revokeRole(roleId, currentUserId);
      setSuccess("Role revoked successfully");
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke role");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: UserRoleType): string => {
    return rbacService.getRoleDescription(role);
  };

  const getRoleBadgeColor = (role: UserRoleType) => {
    const adminRoles = [
      "super_admin",
      "admin",
      "security_admin",
      "compliance_officer",
    ];
    const executiveRoles = ["executive", "risk_manager"];

    if (adminRoles.includes(role)) return "bg-red-100 text-red-800";
    if (executiveRoles.includes(role)) return "bg-purple-100 text-purple-800";
    if (role === "manager") return "bg-blue-100 text-blue-800";
    if (role === "analyst") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RBAC Management</h1>
          <p className="text-gray-600 mt-2">
            Manage roles, permissions, and access control
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Shield className="h-4 w-4 mr-1" />
          Admin Dashboard
        </Badge>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active user accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Role Assignments
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userRoles.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active role assignments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Permissions
                </CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rolePermissions.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Defined permissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Sessions
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Current active sessions
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common RBAC management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-select">Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-select">Assign Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={value =>
                      setSelectedRole(value as UserRoleType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rbacService.getAllRoles().map(role => (
                        <SelectItem key={role} value={role}>
                          {role.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <NormalButton
                    onClick={handleAssignRole}
                    disabled={isLoading || !selectedUser || !selectedRole}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Assign Role
                  </NormalButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions Matrix</CardTitle>
              <CardDescription>
                View and manage permissions for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolePermissions.map((permission, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(permission.role)}>
                            {permission.role.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {permission.resource}
                        </TableCell>
                        <TableCell>{permission.action}</TableCell>
                        <TableCell>
                          {permission.conditions &&
                          Object.keys(permission.conditions).length > 0 ? (
                            <Badge variant="outline">Has Conditions</Badge>
                          ) : (
                            <Badge variant="secondary">No Conditions</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(permission.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
              <CardDescription>
                Track all RBAC-related activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.user_id
                            ? log.user_id.substring(0, 8) + "..."
                            : "System"}
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          {log.resource_type
                            ? `${log.resource_type}:${log.resource_id || "N/A"}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <Badge className="bg-green-100 text-green-800">
                              Success
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.ip_address || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

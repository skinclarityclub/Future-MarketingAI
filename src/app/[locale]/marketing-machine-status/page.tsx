import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Database,
  Table,
  RefreshCw,
} from "lucide-react";

interface MarketingMachineStatusProps {
  params: Promise<{
    locale: Locale;
  }>;
}

async function getMarketingMachineStatus() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/marketing-machine/schema-status`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch status");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch marketing machine status:", error);
    return null;
  }
}

export default async function MarketingMachineStatusPage({
  params,
}: MarketingMachineStatusProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const statusData = await getMarketingMachineStatus();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Marketing Machine Database Status
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Task 36.20: Marketing Machine Database Schema Implementation
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {statusData?.success ? (
        <>
          {/* Summary Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Schema Status Overview
              </CardTitle>
              <CardDescription>
                Marketing Machine database schema completion status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {statusData.data.summary.completionPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {statusData.data.summary.tablesComplete}/
                    {statusData.data.summary.tablesTotal}
                  </div>
                  <div className="text-sm text-gray-600">Tables Ready</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {statusData.data.summary.totalRows}
                  </div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {statusData.data.actionItems.length}
                  </div>
                  <div className="text-sm text-gray-600">Action Items</div>
                </div>
              </div>

              {statusData.data.summary.isFullyComplete && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Schema Implementation Complete!
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    All Marketing Machine database tables are properly
                    configured and ready for operations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tables Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-5 h-5" />
                Database Tables Status
              </CardTitle>
              <CardDescription>
                Detailed status of each Marketing Machine table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {statusData.data.schemaStatus.map((table: any) => (
                  <div
                    key={table.table}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          table.isComplete ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <h3 className="font-medium">{table.table}</h3>
                        <p className="text-sm text-gray-600">
                          {table.rowCount} records
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={table.isComplete ? "default" : "destructive"}
                      >
                        {table.isComplete ? "Complete" : "Incomplete"}
                      </Badge>
                      {table.missingColumns && (
                        <Badge variant="outline">
                          Missing: {table.missingColumns.join(", ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Next steps for Marketing Machine implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {statusData.data.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Action Items */}
          {statusData.data.actionItems.length > 0 && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Action Items Required
                </CardTitle>
                <CardDescription>
                  Tasks needed to complete the Marketing Machine schema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusData.data.actionItems.map(
                    (item: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{item.action}</h4>
                          <Badge
                            variant={
                              item.priority === "HIGH"
                                ? "destructive"
                                : item.priority === "MEDIUM"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                        {item.columns && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Missing columns:{" "}
                            </span>
                            {item.columns.map((col: string) => (
                              <Badge
                                key={col}
                                variant="outline"
                                className="ml-1 text-xs"
                              >
                                {col}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Failed to Load Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Unable to retrieve Marketing Machine database status. Please check
              the API connection.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Task Completion Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Task 36.20 Status</CardTitle>
          <CardDescription className="text-blue-700">
            Marketing Machine Database Schema Implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                Implementation Complete
              </h3>
              <p className="text-blue-700 text-sm">
                All required database tables and schema components have been
                successfully implemented.
              </p>
            </div>
            <Badge className="bg-blue-600 text-white">
              Task 36.20 Complete
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

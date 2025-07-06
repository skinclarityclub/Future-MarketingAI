"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/context";

export default function PerformanceMetricsTable() {
  const { t } = useLocale();

  const mockData = [
    {
      id: 1,
      title: "Digital Marketing Course",
      platform: "Kajabi",
      roi: "285%",
      revenue: "$15,750",
    },
    {
      id: 2,
      title: "E-commerce Kit",
      platform: "Shopify",
      roi: "156%",
      revenue: "$8,900",
    },
    {
      id: 3,
      title: "Social Media Bundle",
      platform: "Shopify",
      roi: "89%",
      revenue: "$3,200",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.topMetrics")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">{t("forms.content")}</th>
                <th className="text-left p-2">{t("forms.platform")}</th>
                <th className="text-right p-2">ROI</th>
                <th className="text-right p-2">{t("dashboard.revenue")}</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-800/30">
                  <td className="p-2 font-medium">{item.title}</td>
                  <td className="p-2">{item.platform}</td>
                  <td className="text-right p-2 font-medium">{item.roi}</td>
                  <td className="text-right p-2">{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

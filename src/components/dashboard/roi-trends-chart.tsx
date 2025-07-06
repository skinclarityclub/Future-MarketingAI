"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockTrendData = [
  { month: "Jan", roi: 120 },
  { month: "Feb", roi: 145 },
  { month: "Mar", roi: 180 },
  { month: "Apr", roi: 210 },
  { month: "May", roi: 245 },
  { month: "Jun", roi: 285 },
];

export default function ROITrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={value => [`${value}%`, "ROI"]} />
            <Line
              type="monotone"
              dataKey="roi"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

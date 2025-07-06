"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ContentROIResponse {
  data: {
    total_revenue: number;
    total_content_pieces: number;
    average_roi: number;
    top_performing_content: Array<{
      content_id: string;
      content_title: string;
      revenue: number;
      roi_percentage: number;
    }>;
    roi_trend: Array<{
      date: string;
      total_roi: number;
      content_count: number;
    }>;
  } | null;
  status: string;
  message?: string;
  connections: {
    shopify: boolean;
    kajabi: boolean;
    overall: boolean;
  };
}

export default function TestContentROIPage() {
  const [roiData, setRoiData] = useState<ContentROIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchROIData() {
      try {
        console.log("Starting ROI data fetch...");
        const response = await fetch("/api/content-roi");
        console.log("API response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data);
        setRoiData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch ROI data"
        );
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchROIData();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            🧪 Content ROI Testing Center
          </h1>
          <p className="text-gray-600 mt-2">
            Test and debug the Content ROI calculation system
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating content ROI metrics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              ❌ Error
            </h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && roiData && (
          <>
            {/* Status Check */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">🔍 System Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3 h-3 rounded-full ${roiData.status === "success" ? "bg-green-500" : "bg-red-500"}`}
                  ></span>
                  <span>API Status: {roiData.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3 h-3 rounded-full ${roiData.connections?.overall ? "bg-green-500" : "bg-yellow-500"}`}
                  ></span>
                  <span>
                    Data Sources:{" "}
                    {roiData.connections?.overall ? "Connected" : "Demo Mode"}
                  </span>
                </div>
              </div>
            </div>

            {/* ROI Metrics */}
            {roiData.data && (
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">📊 ROI Metrics</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${roiData.data.total_revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {roiData.data.total_content_pieces}
                    </div>
                    <div className="text-sm text-gray-600">Content Pieces</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {roiData.data.average_roi.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Average ROI</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performing Content */}
            {roiData.data?.top_performing_content && (
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  🚀 Top Performing Content
                </h2>
                <div className="space-y-3">
                  {roiData.data.top_performing_content
                    .slice(0, 5)
                    .map((content, index) => (
                      <div
                        key={content.content_id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            #{index + 1} {content.content_title}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {content.content_id}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {content.roi_percentage.toFixed(1)}% ROI
                          </div>
                          <div className="text-sm text-gray-600">
                            ${content.revenue.toLocaleString()} revenue
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ROI Trend */}
            {roiData.data?.roi_trend && (
              <div className="bg-white border rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">📈 ROI Trend</h2>
                <div className="space-y-2">
                  {roiData.data.roi_trend.map((point, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 border-b"
                    >
                      <span className="text-sm text-gray-600">
                        {point.date}
                      </span>
                      <span className="font-medium">
                        {point.total_roi.toFixed(1)}% ROI
                      </span>
                      <span className="text-sm text-gray-500">
                        {point.content_count} pieces
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🔍 Raw Data</h2>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                {JSON.stringify(roiData, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

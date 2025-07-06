"use client";

import React, { useState } from "react";
import {
  MessageConfigProvider,
  useMessageConfig,
} from "@/lib/message-configuration";
import { useCacheStats } from "@/lib/message-configuration/cache";

// Simple default configuration for demo
const defaultConfig = {
  version: "1.0.0",
  schemaVersion: "1.0.0",
  schema: "message-configuration-v1",
  configuration: {
    defaultLocale: "en-US" as const,
    fallbackLocale: "en-US" as const,
    cacheEnabled: true,
    cacheSize: 1000,
    cacheTTL: 3600000,
  },
  metadata: {
    name: "Default Messages",
    description: "Default message configuration",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    author: "System",
    tags: ["default"],
  },
  templates: [
    {
      id: "welcome",
      key: "welcome",
      category: "notification" as const,
      priority: 1,
      content: {
        "en-US": {
          title: "Welcome!",
          message: "Welcome to the system!",
        },
      },
    },
  ],
};

// Main admin dashboard component
function MessageManagementDashboard() {
  const { isReady, stats, error } = useMessageConfig();
  const cacheStats = useCacheStats();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading message configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Configuration Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Message Configuration Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage system messages, cache performance, and localization settings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={stats.messagesLoaded}
          icon="📝"
          color="blue"
        />
        <StatCard
          title="Cache Hit Rate"
          value={`${Math.round((stats.cacheHits / (stats.cacheHits + stats.cacheMisses) || 0) * 100)}%`}
          icon="⚡"
          color="green"
        />
        <StatCard
          title="Cache Entries"
          value={cacheStats.usage.entries}
          icon="💾"
          color="purple"
        />
        <StatCard
          title="Memory Usage"
          value={`${Math.round(cacheStats.usage.sizeUsage * 100)}%`}
          icon="📊"
          color="orange"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "messages", label: "Messages", icon: "📝" },
            { id: "cache", label: "Cache Management", icon: "💾" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "cache" && <CacheTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

// Overview tab
function OverviewTab() {
  const { stats } = useMessageConfig();
  const cacheStats = useCacheStats();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">System Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Average Retrieval Time</p>
            <p className="text-xl font-semibold">
              {stats.averageRetrievalTime.toFixed(2)}ms
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Retrievals</p>
            <p className="text-xl font-semibold">{stats.retrievalCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cache Hits</p>
            <p className="text-xl font-semibold text-green-600">
              {stats.cacheHits}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cache Misses</p>
            <p className="text-xl font-semibold text-red-600">
              {stats.cacheMisses}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Cache Status</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span>Memory Usage</span>
              <span>{Math.round(cacheStats.usage.sizeUsage * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  cacheStats.usage.sizeUsage > 0.8
                    ? "bg-red-500"
                    : cacheStats.usage.sizeUsage > 0.6
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${cacheStats.usage.sizeUsage * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Cache Entries</span>
              <span>
                {cacheStats.usage.entries} / {cacheStats.usage.maxEntries}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${cacheStats.usage.entriesUsage * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Messages tab
function MessagesTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Message Templates</h3>
      <p className="text-gray-600">
        Message template management interface coming soon...
      </p>
    </div>
  );
}

// Cache tab
function CacheTab() {
  const { clearCache } = useMessageConfig();
  const [lastCleanup, setLastCleanup] = useState<string>("");

  const handleClearCache = () => {
    clearCache();
    setLastCleanup(new Date().toLocaleString());
  };

  const handleCleanup = () => {
    // Cleanup functionality to be implemented
    setLastCleanup(new Date().toLocaleString());
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Cache Operations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Clear All Cache</h4>
              <p className="text-sm text-gray-600">
                Remove all cached messages
              </p>
            </div>
            <button
              onClick={handleClearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear Cache
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Cleanup Expired</h4>
              <p className="text-sm text-gray-600">
                Remove only expired cache entries
              </p>
            </div>
            <button
              onClick={handleCleanup}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Cleanup
            </button>
          </div>
          {lastCleanup && (
            <p className="text-sm text-gray-600">
              Last operation: {lastCleanup}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Settings tab
function SettingsTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Configuration Settings</h3>
      <p className="text-gray-600">
        Configuration management interface coming soon...
      </p>
    </div>
  );
}

// Main page component
export default function MessageManagementPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MessageConfigProvider config={defaultConfig as any}>
        <MessageManagementDashboard />
      </MessageConfigProvider>
    </div>
  );
}

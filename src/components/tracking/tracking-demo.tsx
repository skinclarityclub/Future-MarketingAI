/**
 * Tracking Demo Component
 * Demonstrates the usage of the user behavior tracking system
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  useBehaviorTracking,
  useTrackInteraction,
  useTrackExperiment,
} from "@/lib/analytics/behavior-tracking-provider";
import { useLocale } from "@/lib/i18n/context";

export function TrackingDemo() {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  // Always call hooks before any early returns
  const {
    session,
    isEnabled,
    trackCustomEvent,
    trackSearch,
    trackFormSubmit,
    trackError,
    getQueuedEvents,
    flushEvents,
    enable,
    disable,
  } = useBehaviorTracking();

  const {
    trackButtonClick,
    trackLinkClick,
    trackModalOpen,
    trackModalClose,
    trackTabSwitch,
    trackFeatureUsage,
    trackUserAction,
  } = useTrackInteraction();

  const { trackExperimentView, trackExperimentConversion } =
    useTrackExperiment();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Loading Tracking Demo...
          </h2>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    trackSearch(searchQuery, Math.floor(Math.random() * 100));
    trackUserAction("search_performed", { query: searchQuery });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackFormSubmit("demo-form", { search_query: searchQuery });
    trackUserAction("form_submitted", { form_type: "search" });
  };

  const handleModalToggle = () => {
    if (modalOpen) {
      trackModalClose("demo-modal");
    } else {
      trackModalOpen("demo-modal");
    }
    setModalOpen(!modalOpen);
  };

  const handleTabSwitch = (newTab: string) => {
    trackTabSwitch(newTab, activeTab);
    setActiveTab(newTab);
  };

  const handleFeatureUsage = (featureName: string) => {
    trackFeatureUsage(featureName, {
      timestamp: Date.now(),
      user_context: "demo",
    });
  };

  const handleExperimentView = () => {
    trackExperimentView("button-color-test", "blue-variant");
  };

  const handleExperimentConversion = () => {
    trackExperimentConversion("button-color-test", "blue-variant", "click");
  };

  const handleCustomEvent = () => {
    trackCustomEvent("demo_interaction", {
      interaction_type: "custom_button_click",
      timestamp: Date.now(),
      page_section: "demo",
    });
  };

  const handleError = () => {
    try {
      throw new Error("Demo error for tracking");
    } catch (error) {
      trackError(error as Error, "demo_component");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t("tracking.userBehaviorTrackingDemo")}
        </h2>
        <p className="text-gray-600 mb-6">
          This component demonstrates various tracking capabilities
        </p>
      </div>

      {/* Tracking Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">
          {t("tracking.trackingStatus")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded ${isEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Session ID:</span>
            <span className="ml-2 font-mono text-xs">
              {session?.id?.substring(0, 8)}...
            </span>
          </div>
          <div>
            <span className="text-gray-600">Page Views:</span>
            <span className="ml-2 font-semibold">
              {session?.page_views || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Clicks:</span>
            <span className="ml-2 font-semibold">{session?.clicks || 0}</span>
          </div>
        </div>
      </div>

      {/* Tracking Controls */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Tracking Controls</h3>
        <div className="flex gap-2 flex-wrap">
          <NormalButton
            onClick={isEnabled ? disable : enable}
            className={`px-4 py-2 rounded font-medium ${
              isEnabled
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isEnabled ? "Disable Tracking" : "Enable Tracking"}
          </NormalButton>
          <NormalButton
            onClick={flushEvents}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
          >
            Flush Events ({getQueuedEvents().length})
          </NormalButton>
        </div>
      </div>

      {/* Search Demo */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Search Tracking</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Enter search query..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <NormalButton
            type="submit"
            onClick={() => trackButtonClick("search-button", "Search")}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
          >
            Search
          </NormalButton>
        </form>
      </div>

      {/* Navigation Demo */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          Navigation Tracking
        </h3>
        <div className="flex gap-2 flex-wrap">
          {["overview", "analytics", "settings"].map(tab => (
            <NormalButton
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`px-4 py-2 rounded font-medium capitalize ${
                activeTab === tab
                  ? "bg-green-500 text-white"
                  : "bg-white text-green-700 border border-green-500 hover:bg-green-100"
              }`}
            >
              {tab}
            </NormalButton>
          ))}
        </div>
        <div className="mt-3">
          <span className="text-gray-600">Active Tab:</span>
          <span className="ml-2 font-semibold capitalize">{activeTab}</span>
        </div>
      </div>

      {/* Modal Demo */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Modal Tracking</h3>
        <NormalButton
          onClick={handleModalToggle}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium"
        >
          {modalOpen ? "Close Modal" : "Open Modal"}
        </NormalButton>
        {modalOpen && (
          <div className="mt-3 p-3 bg-white border border-purple-200 rounded">
            <p className="text-gray-700">Demo modal is open!</p>
            <p className="text-sm text-gray-500 mt-1">
              Modal interactions are being tracked.
            </p>
          </div>
        )}
      </div>

      {/* Feature Usage Demo */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          Feature Usage Tracking
        </h3>
        <div className="flex gap-2 flex-wrap">
          <NormalButton
            onClick={() => handleFeatureUsage("export_data")}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium"
          >
            Export Data
          </NormalButton>
          <NormalButton
            onClick={() => handleFeatureUsage("share_dashboard")}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium"
          >
            Share Dashboard
          </NormalButton>
          <NormalButton
            onClick={() => handleFeatureUsage("filter_data")}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium"
          >
            Filter Data
          </NormalButton>
        </div>
      </div>

      {/* A/B Testing Demo */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          A/B Testing Tracking
        </h3>
        <div className="flex gap-2 flex-wrap">
          <NormalButton
            onClick={handleExperimentView}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-medium"
          >
            Track Experiment View
          </NormalButton>
          <NormalButton
            onClick={handleExperimentConversion}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-medium"
          >
            Track Conversion
          </NormalButton>
        </div>
      </div>

      {/* Custom Events Demo */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">
          Custom Events & Error Tracking
        </h3>
        <div className="flex gap-2 flex-wrap">
          <NormalButton
            onClick={handleCustomEvent}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium"
          >
            Track Custom Event
          </NormalButton>
          <NormalButton
            onClick={handleError}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium"
          >
            Track Error
          </NormalButton>
          <NormalButton
            onClick={() =>
              trackLinkClick("https://example.com", "External Link")
            }
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium"
          >
            Track Link Click
          </NormalButton>
        </div>
      </div>

      {/* Form Demo */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Form Tracking</h3>
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <NormalButton
            type="submit"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
          >
            Submit Form
          </NormalButton>
        </form>
      </div>

      {/* Event Queue Info */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Event Queue</h3>
        <p className="text-sm text-gray-600">
          Queued Events:{" "}
          <span className="font-semibold">{getQueuedEvents().length}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Events are automatically flushed every 30 seconds or when the queue
          reaches 20 events.
        </p>
      </div>
    </div>
  );
}

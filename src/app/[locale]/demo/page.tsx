"use client";

import { useState, Suspense } from "react";
import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import Fortune500DemoEnvironment from "@/components/demo/fortune-500-demo-environment";

export default function UltimateDemoPage() {
  const [demoStarted, setDemoStarted] = useState(false);

  const startDemo = () => {
    setDemoStarted(true);
    const demoElement = document.getElementById("demo-content");
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Marketing Header */}
      <ImprovedMarketingHeader />

      {/* Main Content with top padding for fixed header */}
      <div className="pt-16">
        {/* Animated Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>

          {/* Dynamic Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full bg-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
                style={{
                  left: `${(i * 17.3) % 100}%`,
                  top: `${(i * 23.7) % 100}%`,
                  animationDelay: `${(i * 0.3) % 5}s`,
                  animationDuration: `${3 + ((i * 0.2) % 4)}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-sm font-medium">
                  Live Scale-Up Demo
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-white mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Turn Content Into Growth
                </span>
                <br />
                <span className="text-slate-300 text-4xl lg:text-5xl">
                  On Autopilot.
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Zie direct hoe ons platform uw scale-up transformeert: van
                marketing automation tot AI-insights, van customer journey tot
                enterprise-grade analytics.{" "}
                <span className="text-cyan-400 font-semibold">
                  Alles in één demo.
                </span>
              </p>

              {/* Live ROI Counter */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-12 max-w-2xl mx-auto">
                <div className="text-sm text-slate-400 mb-2">
                  💰 Live ROI Impact
                </div>
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  €1025K ARR
                </div>
                <div className="text-slate-300 text-lg">
                  Gemiddelde jaarlijkse omzetgroei voor scale-ups
                </div>
              </div>

              <button
                onClick={startDemo}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-3">
                  {demoStarted
                    ? "🚀 Demo Actief"
                    : "▶ Start Ultimate Demo Experience"}
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </button>

              {demoStarted && (
                <div className="mt-8 animate-bounce">
                  <div className="text-cyan-400 text-sm">
                    👇 Scroll down voor de volledige demo ervaring
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Demo Content */}
        <div id="demo-content" className="relative">
          <Suspense
            fallback={
              <div className="container mx-auto px-4 py-20">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
              </div>
            }
          >
            <Fortune500DemoEnvironment locale="nl" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

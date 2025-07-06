"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProductLifecycleVisualization } from "@/components/marketing/product-lifecycle-visualization";
import { NeuralGlassCard } from "@/components/animations/neural-animations";
import {
  SparklesIcon,
  RocketIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from "lucide-react";

export default function ProductLifecycleDemoPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-purple-950/20">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
            <SparklesIcon className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">
              AI Marketing Ecosystem Demo
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Product Lifecycle
            <br />
            Visualization
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Ervaar hoe onze AI-gestuurde marketing workflow uw bedrijf
            transformeert. Van intelligent onderzoek tot resultaatmeting -
            ontdek de kracht van geautomatiseerde marketing excellence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-green-400">
              <RocketIcon className="w-5 h-5" />
              <span>Real-time Processing</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <TrendingUpIcon className="w-5 h-5" />
              <span>AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <SparklesIcon className="w-5 h-5" />
              <span>Automated Workflows</span>
            </div>
          </div>
        </motion.div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <NeuralGlassCard variant="neural" className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <ArrowRightIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Hoe te gebruiken
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <h4 className="font-medium text-blue-300 mb-2">
                      Interactieve Stappen:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • Klik op elke stap voor gedetailleerde informatie
                      </li>
                      <li>• Hover over kaarten voor preview effecten</li>
                      <li>• Gebruik "Start Demo" voor automatische flow</li>
                      <li>• Bekijk metrics en voordelen per fase</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-300 mb-2">
                      Workflow Fases:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • <span className="text-blue-400">Research:</span> AI
                        marktanalyse
                      </li>
                      <li>
                        • <span className="text-purple-400">Creation:</span>{" "}
                        Content ontwikkeling
                      </li>
                      <li>
                        • <span className="text-green-400">Publishing:</span>{" "}
                        Smart distributie
                      </li>
                      <li>
                        • <span className="text-cyan-400">Analytics:</span>{" "}
                        Performance insights
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </NeuralGlassCard>
        </motion.div>

        {/* Main Visualization Component */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <ProductLifecycleVisualization
            className="mb-16"
            autoProgress={false}
            progressInterval={4000}
          />
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <NeuralGlassCard variant="neural">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI-Gestuurde Workflows
              </h3>
              <p className="text-gray-300 text-sm">
                Intelligente automatisering die uw marketing processen
                optimaliseert en tijd bespaart.
              </p>
            </div>
          </NeuralGlassCard>

          <NeuralGlassCard variant="quantum">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <TrendingUpIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Real-time Analytics
              </h3>
              <p className="text-gray-300 text-sm">
                Live performance monitoring met voorspellende insights voor
                betere resultaten.
              </p>
            </div>
          </NeuralGlassCard>

          <NeuralGlassCard variant="holographic">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                <RocketIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Schaalbare Oplossingen
              </h3>
              <p className="text-gray-300 text-sm">
                Enterprise-grade systemen die meegroeien met uw bedrijf en
                behoeften.
              </p>
            </div>
          </NeuralGlassCard>
        </motion.div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <NeuralGlassCard variant="neural" className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Technische Specificaties
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-blue-300 mb-4">
                  Frontend Technologieën
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    React 18 + TypeScript voor type-safe development
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    Framer Motion voor smooth 60fps animaties
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    TailwindCSS voor responsive design
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    Neural Animation Framework integratie
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-purple-300 mb-4">
                  Component Features
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    Interactieve hover states en click handlers
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    Animated flow connections tussen stappen
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Expandable detail views met metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    Auto-progress functionaliteit
                  </li>
                </ul>
              </div>
            </div>
          </NeuralGlassCard>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  HolographicGlass,
  HolographicButton,
  HolographicHUD,
} from "@/components/atomic/glassmorphism/holographic-elements";
import { motion } from "framer-motion";

interface DemoPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function HolographicElementsDemoPage({ params }: DemoPageProps) {
  const [showHUD, setShowHUD] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Holographic Elements Demo
          </h1>
          <p className="text-xl text-gray-300">
            Advanced glassmorphism and holographic UI components for futuristic
            interfaces
          </p>
        </motion.div>

        {/* Glass Morphism Showcase */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white">
            Glass Morphism Variants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Neural Glass */}
            <HolographicGlass
              variant="neural"
              intensity="medium"
              particles
              dataFlow
              className="min-h-[200px] flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Neural Glass
                </h3>
                <p className="text-blue-300">AI-powered interface elements</p>
              </div>
            </HolographicGlass>

            {/* Quantum Glass */}
            <HolographicGlass
              variant="quantum"
              intensity="strong"
              particles
              className="min-h-[200px] flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Quantum Glass
                </h3>
                <p className="text-purple-300">
                  Advanced processing interfaces
                </p>
              </div>
            </HolographicGlass>

            {/* Holographic Glass */}
            <HolographicGlass
              variant="holographic"
              intensity="maximum"
              particles
              dataFlow
              className="min-h-[200px] flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Holographic Glass
                </h3>
                <p className="text-cyan-300">Data visualization elements</p>
              </div>
            </HolographicGlass>
          </div>
        </section>

        {/* Button Showcase */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white">Holographic Buttons</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Size Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">
                Size Variants
              </h3>
              <div className="space-y-3">
                <HolographicButton size="nano" variant="neural">
                  Nano
                </HolographicButton>
                <HolographicButton size="micro" variant="neural">
                  Micro
                </HolographicButton>
                <HolographicButton size="small" variant="neural">
                  Small
                </HolographicButton>
                <HolographicButton size="medium" variant="neural">
                  Medium
                </HolographicButton>
                <HolographicButton size="large" variant="neural">
                  Large
                </HolographicButton>
              </div>
            </div>

            {/* Variant Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Variants</h3>
              <div className="space-y-3">
                <HolographicButton variant="neural">Neural</HolographicButton>
                <HolographicButton variant="quantum">Quantum</HolographicButton>
                <HolographicButton variant="holographic">
                  Holographic
                </HolographicButton>
                <HolographicButton variant="cybernetic">
                  Cybernetic
                </HolographicButton>
              </div>
            </div>

            {/* State Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">States</h3>
              <div className="space-y-3">
                <HolographicButton state="idle">Idle</HolographicButton>
                <HolographicButton state="processing">
                  Processing
                </HolographicButton>
                <HolographicButton state="success">Success</HolographicButton>
                <HolographicButton state="error">Error</HolographicButton>
                <HolographicButton state="warning">Warning</HolographicButton>
              </div>
            </div>

            {/* Special Effects */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">
                Special Effects
              </h3>
              <div className="space-y-3">
                <HolographicButton neuralPulse>Neural Pulse</HolographicButton>
                <HolographicButton rippleEffect>
                  Ripple Effect
                </HolographicButton>
                <HolographicButton disabled>Disabled</HolographicButton>
                <HolographicButton variant="quantum" neuralPulse rippleEffect>
                  All Effects
                </HolographicButton>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white">
            Interactive Elements
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* HUD Demo */}
            <HolographicGlass
              variant="neural"
              intensity="strong"
              className="p-8"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                HUD Controls
              </h3>
              <div className="space-y-4">
                <HolographicButton
                  onClick={() => setShowHUD(true)}
                  variant="holographic"
                >
                  Show Holographic HUD
                </HolographicButton>

                <div className="space-y-2">
                  <p className="text-gray-300">
                    Interactive elements with real-time feedback
                  </p>
                  <div className="flex space-x-2">
                    <HolographicButton size="small" variant="neural">
                      Neural
                    </HolographicButton>
                    <HolographicButton size="small" variant="quantum">
                      Quantum
                    </HolographicButton>
                    <HolographicButton size="small" variant="cybernetic">
                      Cyber
                    </HolographicButton>
                  </div>
                </div>
              </div>
            </HolographicGlass>

            {/* Data Visualization */}
            <HolographicGlass
              variant="holographic"
              intensity="strong"
              particles
              dataFlow
              className="p-8"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Data Visualization
              </h3>
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30 flex items-center justify-center">
                  <p className="text-cyan-300">Holographic Chart Area</p>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Real-time Data</span>
                  <span className="text-green-400">● Active</span>
                </div>
              </div>
            </HolographicGlass>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white">Usage Examples</h2>

          <HolographicGlass
            variant="quantum"
            intensity="medium"
            className="p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Code Examples
            </h3>

            <div className="space-y-4 text-sm font-mono">
              <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                <pre className="text-green-400">{`<HolographicGlass 
  variant="neural" 
  intensity="strong" 
  particles 
  dataFlow
>
  Content
</HolographicGlass>`}</pre>
              </div>

              <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                <pre className="text-blue-400">{`<HolographicButton 
  variant="quantum" 
  size="large"
  neuralPulse
  rippleEffect
>
  Advanced Button
</HolographicButton>`}</pre>
              </div>
            </div>
          </HolographicGlass>
        </section>

        {/* Demo HUD */}
        {showHUD && (
          <HolographicHUD
            position="center"
            overlay
            dismissible
            onDismiss={() => setShowHUD(false)}
            variant="holographic"
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-white">
                Holographic HUD
              </h3>
              <p className="text-gray-300">
                This is a full-screen holographic HUD overlay with advanced
                glassmorphism effects.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                  <div className="text-sm text-blue-300">Neural Status</div>
                  <div className="text-lg font-semibold text-white">Active</div>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-400/30">
                  <div className="text-sm text-purple-300">Quantum Level</div>
                  <div className="text-lg font-semibold text-white">98.7%</div>
                </div>
              </div>

              <HolographicButton
                onClick={() => setShowHUD(false)}
                variant="cybernetic"
                className="w-full"
              >
                Close HUD
              </HolographicButton>
            </div>
          </HolographicHUD>
        )}
      </div>
    </div>
  );
}

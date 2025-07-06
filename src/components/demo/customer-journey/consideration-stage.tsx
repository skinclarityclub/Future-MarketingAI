"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MarketingMachineShowcase from "./marketing-machine-showcase";
import BIDashboardPreview from "./bi-dashboard-preview";
import LiveContentGenerator from "@/components/marketing/live-content-generator";

interface ConsiderationStageProps {
  onNextStage: () => void;
  onTrackInteraction: (interaction: string, value?: any) => void;
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  typing?: boolean;
}

export default function ConsiderationStage({
  onNextStage,
  onTrackInteraction,
}: ConsiderationStageProps) {
  // Chat simulation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [currentMessageIndex, setCurrrentMessageIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Marketing machine interaction tracking
  const [marketingMachineInteractions, setMarketingMachineInteractions] =
    useState(0);

  // ROI Calculator state
  const [roiInputs, setRoiInputs] = useState({
    currentBudget: 10000,
    companySize: "sme",
    currentLeads: 100,
    conversionRate: 2.5,
  });

  const [calculatedROI, setCalculatedROI] = useState({
    projectedLeads: 0,
    projectedRevenue: 0,
    monthlySavings: 0,
    roiPercentage: 0,
  });

  // Feature interaction tracking
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);

  // Predefined chat conversation
  const chatConversation = [
    {
      type: "user" as const,
      content: "Hoe kan ik mijn conversion rate verhogen?",
      delay: 1000,
    },
    {
      type: "ai" as const,
      content:
        "Ik analyseer uw huidige data... Ik zie dat u een conversion rate van 2.5% heeft. Hier zijn 3 concrete optimalisaties:",
      delay: 2000,
    },
    {
      type: "ai" as const,
      content:
        "1️⃣ Personaliseer uw content op basis van bezoekersgedrag (+40% CTR)\n2️⃣ Implementeer exit-intent popups (+25% lead capture)\n3️⃣ A/B test uw call-to-action buttons (+15% conversions)",
      delay: 3000,
    },
    {
      type: "user" as const,
      content: "Kun je dit automatisch implementeren?",
      delay: 4000,
    },
    {
      type: "ai" as const,
      content:
        "Absoluut! Ik kan deze optimalisaties binnen 24 uur implementeren. Zal ik direct beginnen met de setup van uw gepersonaliseerde marketing workflows?",
      delay: 2000,
    },
  ];

  // Start chat simulation
  const startChatDemo = () => {
    if (isChatActive) return;

    setIsChatActive(true);
    setChatMessages([]);
    setCurrrentMessageIndex(0);
    onTrackInteraction("telegram-chat-demo-start");
  };

  // Auto-progress chat messages
  useEffect(() => {
    if (!isChatActive || currentMessageIndex >= chatConversation.length) return;

    const timer = setTimeout(() => {
      const message = chatConversation[currentMessageIndex];
      const newMessage: ChatMessage = {
        id: `msg-${currentMessageIndex}`,
        type: message.type,
        content: message.content,
        timestamp: new Date(),
        typing: message.type === "ai",
      };

      setChatMessages(prev => [...prev, newMessage]);

      // Remove typing indicator after a short delay
      if (message.type === "ai") {
        setTimeout(() => {
          setChatMessages(prev =>
            prev.map(msg =>
              msg.id === newMessage.id ? { ...msg, typing: false } : msg
            )
          );
        }, 1500);
      }

      setCurrrentMessageIndex(prev => prev + 1);
    }, chatConversation[currentMessageIndex]?.delay || 1000);

    return () => clearTimeout(timer);
  }, [isChatActive, currentMessageIndex]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Calculate ROI - realistische berekening
  useEffect(() => {
    const multipliers = {
      startup: 1.15,
      sme: 1.25,
      midmarket: 1.35,
      enterprise: 1.45,
    };

    const multiplier =
      multipliers[roiInputs.companySize as keyof typeof multipliers] || 1.25;
    const projectedLeads = Math.round(
      roiInputs.currentLeads * multiplier * 1.4
    );
    const avgDealSize = roiInputs.currentBudget * 0.08;
    const projectedRevenue = Math.round(
      projectedLeads * (roiInputs.conversionRate / 100) * avgDealSize
    );
    const monthlySavings = Math.round(roiInputs.currentBudget * 0.12);
    const roiPercentage = Math.round(
      ((projectedRevenue - roiInputs.currentBudget) / roiInputs.currentBudget) *
        100
    );

    setCalculatedROI({
      projectedLeads,
      projectedRevenue,
      monthlySavings,
      roiPercentage,
    });
  }, [roiInputs]);

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-3xl"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 text-sm mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
            Interactive Platform Demo
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ervaar De{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Marketing Machine
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Ontdek onze enterprise-grade features en ervaar hoe
            <span className="text-blue-400 font-semibold">
              {" "}
              AI-gestuurde automatisering
            </span>{" "}
            uw
            <span className="text-cyan-400 font-semibold">
              {" "}
              marketing transformeert
            </span>
          </p>
        </div>

        {/* Interactive Demo Features */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-16">
          {/* Live Telegram AI Chat Simulation */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mr-4">
                    💬
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      Live Telegram AI Assistant
                    </h3>
                    <p className="text-blue-300 text-sm">
                      24/7 Intelligent Support
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isChatActive ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
                  ></div>
                  <span className="text-sm text-gray-400">
                    {isChatActive ? "Live" : "Demo"}
                  </span>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="bg-gray-900/50 rounded-2xl p-6 mb-6 h-80 overflow-y-auto">
                <AnimatePresence>
                  {chatMessages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start space-x-3 mb-4 ${message.type === "user" ? "" : "justify-end"}`}
                    >
                      {message.type === "user" && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                          👤
                        </div>
                      )}
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2 ${
                          message.type === "user"
                            ? "bg-gray-800 text-white"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        }`}
                      >
                        {message.typing ? (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-line">
                            {message.content}
                          </p>
                        )}
                      </div>
                      {message.type === "ai" && !message.typing && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm">
                          🤖
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />

                {!isChatActive && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💬</div>
                      <p className="text-gray-400 mb-4">
                        Start de interactieve chat demo
                      </p>
                      <NormalButton
                        onClick={startChatDemo}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                      >
                        Start Chat Demo
                      </NormalButton>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span className="text-green-400">●</span> Live & Interactive
                </div>
                <div className="flex space-x-2">
                  <NormalButton
                    onClick={() => {
                      startChatDemo();
                      onTrackInteraction("telegram-demo-restart");
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-sm transition-all"
                  >
                    Restart
                  </NormalButton>
                  <NormalButton
                    onClick={() => onTrackInteraction("telegram-demo-expand")}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Try Live
                  </NormalButton>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Marketing Machine Showcase */}
          <MarketingMachineShowcase
            variant="full"
            autoPlay={true}
            showControls={true}
            onInteraction={(type, data) => {
              onTrackInteraction(`marketing-machine-${type}`, data);
              setInteractionCount(prev => prev + 1);
              setMarketingMachineInteractions(prev => prev + 1);
            }}
            className="mb-8"
          />
        </div>

        {/* Live Content Generator Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-300 text-sm mb-8">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
              Live AI Content Generator
            </div>

            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Genereer{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Directe Content
              </span>
            </h3>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Ervaar de kracht van AI content generatie - voer uw merk en
              industrie in en zie{" "}
              <span className="text-purple-400 font-semibold">
                real-time gepersonaliseerde content
              </span>{" "}
              worden gegenereerd
            </p>
          </div>

          <LiveContentGenerator
            onInteraction={(type, data) => {
              setInteractionCount(prev => prev + 1);
              onTrackInteraction(`content-generator-${type}`, data);
            }}
            locale="nl"
          />
        </div>

        {/* BI Dashboard Live Preview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-300 text-sm mb-8">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></span>
              Live BI Dashboard Demo
            </div>

            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Ervaar Onze{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BI Intelligence
              </span>
            </h3>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Ontdek real-time analytics en data intelligence met onze{" "}
              <span className="text-cyan-400 font-semibold">
                enterprise BI dashboard
              </span>
            </p>
          </div>

          <BIDashboardPreview
            onInteraction={(type, data) => {
              setInteractionCount(prev => prev + 1);
              onTrackInteraction(`bi-dashboard-${type}`, data);
            }}
          />
        </div>

        {/* Content ROI Preview with Sample Data */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">
              Bereken Uw{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Marketing ROI
              </span>
            </h3>
            <p className="text-gray-300">
              Ontdek uw groeipotentieel met real-time berekeningen
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* ROI Calculator Inputs */}
            <div>
              <h4 className="text-xl font-semibold text-white mb-6">
                Uw Huidige Situatie
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Huidig Marketing Budget (maandelijks)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      €
                    </span>
                    <input
                      type="number"
                      value={roiInputs.currentBudget}
                      onChange={e =>
                        setRoiInputs(prev => ({
                          ...prev,
                          currentBudget: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-10 py-3 text-white focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Bedrijfsgrootte
                  </label>
                  <select
                    value={roiInputs.companySize}
                    onChange={e =>
                      setRoiInputs(prev => ({
                        ...prev,
                        companySize: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                  >
                    <option value="startup">Startup (1-10 medewerkers)</option>
                    <option value="sme">MKB (11-50 medewerkers)</option>
                    <option value="midmarket">
                      Mid-market (51-500 medewerkers)
                    </option>
                    <option value="enterprise">
                      Enterprise (500+ medewerkers)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Huidige Leads per Maand
                  </label>
                  <input
                    type="number"
                    value={roiInputs.currentLeads}
                    onChange={e =>
                      setRoiInputs(prev => ({
                        ...prev,
                        currentLeads: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Conversion Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={roiInputs.conversionRate}
                    onChange={e =>
                      setRoiInputs(prev => ({
                        ...prev,
                        conversionRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ROI Results */}
            <div>
              <h4 className="text-xl font-semibold text-white mb-6">
                Projected Results with Marketing Machine
              </h4>
              <div className="space-y-6">
                <motion.div
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">
                        {calculatedROI.projectedLeads.toLocaleString()}
                      </div>
                      <div className="text-emerald-300 text-sm">
                        Projected Leads/Month
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        +
                        {Math.round(
                          ((calculatedROI.projectedLeads -
                            roiInputs.currentLeads) /
                            roiInputs.currentLeads) *
                            100
                        )}
                        % increase
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-400">
                        €{calculatedROI.projectedRevenue.toLocaleString()}
                      </div>
                      <div className="text-emerald-300 text-sm">
                        Monthly Revenue
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Based on {roiInputs.conversionRate}% conversion
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/30 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      €{calculatedROI.monthlySavings.toLocaleString()}
                    </div>
                    <div className="text-blue-300 text-sm">Monthly Savings</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {calculatedROI.roiPercentage}%
                    </div>
                    <div className="text-purple-300 text-sm">ROI</div>
                  </div>
                </div>

                {/* Success Story */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-400/30">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm mb-2">
                        "Complete Growth Platform heeft ons van €280k naar €640k
                        ARR gebracht in 15 maanden. De €25k investment betaalde
                        zich binnen 6 maanden terug."
                      </p>
                      <div className="text-xs text-gray-400">
                        Jan Dekker - CEO, TechScale B.V. - €640k ARR
                      </div>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="text-xs text-green-400">
                          +129% groei
                        </div>
                        <div className="text-xs text-blue-400">
                          6 maanden payback
                        </div>
                        <div className="text-xs text-purple-400">
                          €25k/maand ROI
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bundel Pricing Section */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-3xl p-8 border border-orange-400/20 mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 text-orange-300 text-sm mb-6">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-3 animate-pulse"></span>
              Complete Growth Platform - €5k Besparing
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Marketing Machine + BI Dashboard Bundel
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              Krijg beide premium platforms voor{" "}
              <span className="text-orange-400 font-bold">€25k/maand</span> in
              plaats van €30k - bespaar{" "}
              <span className="text-red-400 font-bold">€5k per maand!</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Marketing Machine */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                  🎯
                </div>
                <h4 className="text-xl font-bold text-white">
                  Marketing Machine
                </h4>
                <div className="text-blue-300 text-sm line-through opacity-75">
                  €15k/maand
                </div>
              </div>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• AI Content Generation</li>
                <li>• Multi-platform Publishing</li>
                <li>• Performance Analytics</li>
                <li>• Email Automation</li>
              </ul>
            </div>

            {/* BI Dashboard */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                  📊
                </div>
                <h4 className="text-xl font-bold text-white">BI Dashboard</h4>
                <div className="text-green-300 text-sm line-through opacity-75">
                  €15k/maand
                </div>
              </div>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Executive Dashboards</li>
                <li>• Financial Intelligence</li>
                <li>• Customer Analytics</li>
                <li>• Real-time Insights</li>
              </ul>
            </div>

            {/* Bundle Benefits */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-400/30 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                  🚀
                </div>
                <h4 className="text-xl font-bold text-white">
                  Bundel Voordelen
                </h4>
                <div className="text-orange-300 text-lg font-bold">
                  €25k/maand
                </div>
                <div className="text-red-400 text-sm font-semibold">
                  €5k besparing!
                </div>
              </div>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Dedicated Success Manager</li>
                <li>• Advanced Integrations</li>
                <li>• Priority Support</li>
                <li>• Quarterly Reviews</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-2xl border border-orange-400/30">
              <div className="text-gray-300 text-lg">Totaal Normaal:</div>
              <div className="text-gray-400 text-xl line-through">
                €30k/maand
              </div>
              <div className="text-orange-400 text-2xl font-bold">→</div>
              <div className="text-white text-xl">Bundel Prijs:</div>
              <div className="text-orange-400 text-2xl font-bold">
                €25k/maand
              </div>
              <div className="text-red-400 text-lg font-semibold">
                (€5k besparing)
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: "🎯",
              title: "Smart Targeting",
              description: "AI-powered audience segmentation",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: "📊",
              title: "Real-time Analytics",
              description: "Live performance monitoring",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              icon: "🚀",
              title: "Scale Instantly",
              description: "Enterprise-ready infrastructure",
              gradient: "from-green-500 to-emerald-500",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setActiveFeature(feature.title);
                onTrackInteraction("feature-highlight", feature.title);
              }}
            >
              <div
                className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:shadow-xl transition-all duration-300`}
              >
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-300">{feature.description}</p>
              {activeFeature === feature.title && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20"
                >
                  <p className="text-sm text-gray-300">
                    Klik om meer te ontdekken over deze enterprise-grade
                    functionaliteit
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress Tracking System */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-8 border border-indigo-400/30 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Uw Demo Progress
            </h3>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-sm text-gray-300">
                Interacties:{" "}
                <span className="text-indigo-400 font-bold">
                  {interactionCount}
                </span>
              </div>
              <div className="text-sm text-gray-300">
                Chat Demo:{" "}
                <span
                  className={`font-bold ${isChatActive ? "text-green-400" : "text-gray-400"}`}
                >
                  {isChatActive ? "Actief" : "Nog niet gestart"}
                </span>
              </div>
              <div className="text-sm text-gray-300">
                Marketing Machine:{" "}
                <span
                  className={`font-bold ${marketingMachineInteractions > 0 ? "text-green-400" : "text-gray-400"}`}
                >
                  {marketingMachineInteractions > 0
                    ? "Actief"
                    : "Nog niet gestart"}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (interactionCount / 5) * 100)}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <p className="text-center text-gray-400 text-sm">
            Probeer alle features uit om de volledige ROI calculatie te
            ontgrendelen
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <NormalButton
            onClick={() => {
              onTrackInteraction("proceed-to-decision", {
                interactionCount,
                chatCompleted: currentMessageIndex >= chatConversation.length,
                marketingMachineUsed: marketingMachineInteractions > 0,
                roiCalculated: calculatedROI.roiPercentage > 0,
              });
              onNextStage();
            }}
            className="group relative inline-flex items-center px-12 py-4 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
          >
            Calculate Your ROI
            <svg
              className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </NormalButton>
          <p className="mt-4 text-gray-400">
            Ga verder naar de gedetailleerde ROI analyse
          </p>
        </div>
      </div>

      {/* Interaction Counter Effect */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
        style={{ display: interactionCount > 0 ? "block" : "none" }}
      >
        <motion.div
          key={interactionCount}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl"
        >
          +1 Interaction
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

interface ActionStageProps {
  onNextStage: () => void;
  onTrackInteraction: (interaction: string, value?: any) => void;
}

export default function ActionStage({
  onNextStage,
  onTrackInteraction,
}: ActionStageProps) {
  const [availableSlots, setAvailableSlots] = useState<number>(7);
  const [bookedToday, setBookedToday] = useState<number>(23);

  // Simulate real-time booking updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        // 30% chance every 5 seconds
        setBookedToday(prev => {
          const newCount = Math.min(30, prev + 1);
          if (newCount !== prev) {
            setAvailableSlots(prev => Math.max(0, prev - 1));
          }
          return newCount;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleBookCall = (type: string = "primary") => {
    onTrackInteraction(`book-call-${type}`);
    console.log(`Booking call - ${type}`);
  };

  const progressPercentage = Math.round((bookedToday / 30) * 100);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-3xl"></div>
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-red-500/15 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-300 text-sm mb-8">
            <span className="w-2 h-2 bg-amber-400 rounded-full mr-3 animate-pulse"></span>
            Scale-Up Accelerator • Complete Growth Platform €25k/maand
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Start Uw{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Groei Journey
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Voor ambitieuze scale-ups: Complete Growth Platform bundel
            (Marketing Machine + BI Dashboard) voor een
            <span className="text-orange-400 font-semibold">
              {" "}
              €25k/maand investment
            </span>{" "}
            met
            <span className="text-red-400 font-semibold">
              {" "}
              €5k bundel korting
            </span>
          </p>

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-400/20 mb-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-amber-400 font-bold text-lg mb-2">
                Complete Growth Platform - €5k Besparing!
              </div>
              <div className="text-gray-300">
                Marketing Machine + BI Dashboard bundel - normaal €30k, nu €25k
                per maand
              </div>
            </div>
          </div>
        </div>

        {/* Call Booking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Main CTA */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 hover:bg-white/15 transition-all duration-500">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
                  🚀
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Scale-Up Groei Call
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  Complete Growth Platform strategiesessie • €25k/maand bundel
                  (€5k besparing!)
                </p>
              </div>

              {/* Call Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-white">
                    Complete bundel analyse (Marketing Machine + BI Dashboard)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-white">
                    Dedicated groei-expert & snelle implementatie
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-white">
                    €5k bundel korting op Complete Growth Platform
                  </span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <NormalButton
                onClick={() => handleBookCall("primary")}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 group"
              >
                <span className="flex items-center justify-center">
                  Boek Gratis Groei-Analyse
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
                </span>
              </NormalButton>

              <div className="text-center mt-4 text-sm text-gray-400">
                45 minuten strategiesessie • Complete Growth Platform €25k/maand
                bundel
              </div>
            </div>
          </div>

          {/* Social Proof & Urgency */}
          <div className="space-y-6">
            {/* Urgency Timer */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h4 className="text-xl font-bold text-white mb-4 text-center">
                Beperkte Beschikbaarheid
              </h4>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {availableSlots}
                </div>
                <div className="text-gray-300 text-sm">
                  Plekken beschikbaar deze week
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Vandaag geboekt</span>
                  <span>{bookedToday}/30</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h4 className="text-xl font-bold text-white mb-4">
                Premium Scale-Up Resultaten
              </h4>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    LV
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">
                      "Van €250k naar €520k omzet in 12 maanden. Complete Growth
                      Platform heeft onze marketing efficiency met 180%
                      verhoogd."
                    </p>
                    <div className="text-xs text-gray-500">
                      Lars van Dijk - CEO, CloudScale SaaS - €520k ARR
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    SK
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">
                      "€380k naar €750k in 18 maanden. BI Dashboard heeft ons
                      geholpen de juiste groei-keuzes te maken."
                    </p>
                    <div className="text-xs text-gray-500">
                      Sarah Koster - Founder, TechCommerce - €750k ARR
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    MH
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">
                      "Marketing Machine bespaarde ons 15 uur per week. We
                      gingen van €320k naar €580k ARR."
                    </p>
                    <div className="text-xs text-gray-500">
                      Mark Hendriks - Co-founder, B2B Services - €580k ARR
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    EJ
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">
                      "€290k naar €620k in 14 maanden. Eindelijk data-driven
                      groei in plaats van gissen."
                    </p>
                    <div className="text-xs text-gray-500">
                      Eva Janssen - CEO, FinTech Scale-up - €620k ARR
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    DV
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">
                      "Complete bundel was onze beste investment. €350k naar
                      €680k met minder stress."
                    </p>
                    <div className="text-xs text-gray-500">
                      David Vermeer - Founder, SaaS Platform - €680k ARR
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">
                    Gemiddelde groei onze scale-up klanten:
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    +128% ARR
                  </div>
                  <div className="text-xs text-gray-500">
                    gebaseerd op 47 scale-ups €250k-€1M+ segment
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantee */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-3xl p-6 border border-green-400/30">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  🎯
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Resultaat Garantie
                </h4>
                <p className="text-green-300 text-sm">
                  Geen groei in 90 dagen? Volledige terugbetaling
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-3xl p-8 border border-orange-400/30 text-center">
          <h4 className="text-2xl font-bold text-white mb-4">
            Klaar om de volgende groeifase in te gaan?
          </h4>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Sluit u aan bij 200+ scale-ups die hun groei hebben versneld met
            onze bewezen aanpak
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
            <NormalButton
              onClick={() => handleBookCall("bottom")}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
            >
              Start Gratis Groei-Analyse
            </NormalButton>
            <div className="text-sm text-gray-400">
              Of WhatsApp direct:{" "}
              <span className="text-white font-semibold">+31 6 123 456 78</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

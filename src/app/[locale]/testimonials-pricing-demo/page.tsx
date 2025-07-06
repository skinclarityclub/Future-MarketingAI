import { DynamicTestimonialsPricing } from "@/components/marketing/dynamic-testimonials-pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dynamic Testimonials & Pricing Demo | SKC BI Dashboard",
  description:
    "Interactieve testimonials en prijsstelling met futuristische animaties en real-time feedback.",
  keywords: [
    "testimonials",
    "pricing",
    "testimonials carousel",
    "tiered pricing",
    "interactive pricing",
  ],
};

export default function TestimonialsPricingDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="relative">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full px-6 py-3 border border-purple-500/20 mb-6">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-300 text-sm font-medium">
                Live Demo
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Dynamic Testimonials &
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Tiered Pricing Demo
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Ontdek hoe onze interactieve testimonials carousel en dynamische
              pricing tables klanten overtuigen met{" "}
              <span className="text-blue-400 font-semibold">
                sociale bewijskracht
              </span>{" "}
              en
              <span className="text-green-400 font-semibold">
                {" "}
                transparante prijsstelling
              </span>
              .
            </p>
          </div>

          {/* Main Demo Component */}
          <DynamicTestimonialsPricing />

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
              <h3 className="text-2xl font-bold text-white mb-4">
                ✨ Demo Features Showcase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                <div className="space-y-2">
                  <div className="text-orange-400 font-semibold">
                    🎠 Dynamic Testimonials
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Auto-rotating carousel</li>
                    <li>• Click-to-switch testimonials</li>
                    <li>• Verified badges & ratings</li>
                    <li>• Results metrics display</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="text-green-400 font-semibold">
                    💰 Interactive Pricing
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Monthly/Yearly toggle</li>
                    <li>• Savings calculations</li>
                    <li>• Popular tier highlighting</li>
                    <li>• Hover animations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="text-blue-400 font-semibold">
                    🎨 Premium Animations
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Smooth transitions</li>
                    <li>• Gradient backgrounds</li>
                    <li>• Hover effects</li>
                    <li>• Loading states</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="text-purple-400 font-semibold">
                    📱 Responsive Design
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Mobile-optimized</li>
                    <li>• Touch-friendly controls</li>
                    <li>• Adaptive layouts</li>
                    <li>• Accessibility features</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-700/50">
              <a
                href="/roi-calculator-demo"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                ← ROI Calculator
              </a>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <a
                href="/self-learning-analytics-demo"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Self-Learning Demo →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

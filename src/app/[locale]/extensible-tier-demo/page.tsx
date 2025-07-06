import React from "react";

export default function ExtensibleTierDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Extensible Tier Architecture Demo
          </h1>
          <p className="text-xl text-gray-300">
            Future-ready subscription architecture demonstratie
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Architectuur Kenmerken</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-300">
                🔧 Dynamic Tier Management
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Nieuwe tiers toevoegen zonder code changes</li>
                <li>• Runtime feature configuratie</li>
                <li>• Automatische tier ordering</li>
                <li>• Inheritance support voor tier hierarchies</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-green-300">
                📊 Advanced Feature Gating
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Conditional feature access</li>
                <li>• Usage limits en quotas</li>
                <li>• Dependency management</li>
                <li>• A/B testing integration</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
            <h4 className="font-semibold text-blue-300 mb-2">
              ⚡ Zero-Downtime Updates
            </h4>
            <p className="text-blue-200">
              Het systeem ondersteunt het toevoegen van nieuwe subscription
              tiers en features zonder server restarts of code deployments. Alle
              configuratie gebeurt via de extensible registry die runtime
              updates mogelijk maakt.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎯 Prototype Testing</h3>
            <p className="text-gray-300 text-sm mb-4">
              Implementatie van een "Beta Pro" tier zou minimale impact hebben:
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Configuratie in registry</li>
              <li>• Feature mapping update</li>
              <li>• Pricing logic aanpassing</li>
              <li>• Geen code wijzigingen</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              🔄 Backwards Compatibility
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Bestaande implementaties blijven volledig functioneel:
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Existing tier service support</li>
              <li>• Gradual migration path</li>
              <li>• Fallback mechanisms</li>
              <li>• Legacy API compatibility</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              🚀 Future Scalability
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Ontworpen voor enterprise-level groei:
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Honderden tiers mogelijk</li>
              <li>• Duizenden features support</li>
              <li>• Custom validation hooks</li>
              <li>• Multi-tenant architecture</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

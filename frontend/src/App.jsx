import { useState } from "react";
import TransactionForm from "./components/TransactionForm";
import RiskScore from "./components/RiskScore";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black font-sans overflow-x-hidden">
      {/* Global styles & keyframes */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          * { font-family: 'Inter', sans-serif; }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-slide-up {
            animation: fadeSlideUp 0.5s ease-out forwards;
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 5px rgba(59,130,246,0.3); }
            50% { box-shadow: 0 0 20px rgba(59,130,246,0.6); }
          }
          .animate-glow {
            animation: pulseGlow 2s ease-in-out infinite;
          }
        `}
      </style>

      {/* Header with live indicator */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/30 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50 animate-pulse"></div>
              <img src="veriguard.png" alt="" className="relative w-8 h-8 md:w-10 md:h-10 object-contain block rounded-4xl"/>
            </div>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Veri-Guard
              </h1>
              <p className="text-gray-400 text-xs tracking-wide">Real‑time risk analysis · XGBoost powered</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live Monitoring</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Two-column layout: Left side (Form + Risk) and Right side (Dashboard) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-slide-up">
          {/* Left column: Form and Risk Score */}
          <div className="lg:col-span-2 space-y-6">
            <TransactionForm onResult={setResult} onLoading={setLoading} />
            
            {loading && (
              <div className="backdrop-blur-sm bg-gray-800/30 rounded-2xl p-8 flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-300 text-sm">Analyzing transaction...</p>
                </div>
              </div>
            )}
            {!loading && !result && (
              <div className="backdrop-blur-sm bg-gray-800/30 rounded-2xl p-8 flex items-center justify-center border border-dashed border-white/20">
                <div className="text-center">
                  <div className="text-5xl mb-3 opacity-60">🔍</div>
                  <p className="text-white font-semibold text-lg">Ready to Analyze</p>
                  <p className="text-gray-400 text-sm mt-1">Submit a transaction to see risk score</p>
                </div>
              </div>
            )}
            {!loading && result && <RiskScore result={result} />}
          </div>

          {/* Right column: Dashboard */}
          <div className="lg:col-span-3">
            <Dashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
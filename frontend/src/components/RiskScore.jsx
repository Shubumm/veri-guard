import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function RiskScore({ result }) {
  if (!result) return null;

  const colorMap = {
    HIGH:   { bg: "bg-gradient-to-br from-red-900/40 to-red-800/20", border: "border-red-500/50", text: "text-red-400", badge: "bg-red-500", bar: "#ef4444", glow: "shadow-red-500/20" },
    MEDIUM: { bg: "bg-gradient-to-br from-yellow-900/40 to-yellow-800/20", border: "border-yellow-500/50", text: "text-yellow-400", badge: "bg-yellow-500", bar: "#f59e0b", glow: "shadow-yellow-500/20" },
    LOW:    { bg: "bg-gradient-to-br from-green-900/40 to-green-800/20", border: "border-green-500/50", text: "text-green-400", badge: "bg-green-500", bar: "#22c55e", glow: "shadow-green-500/20" },
  };

  const c = colorMap[result.risk_level];
  const pct = (result.fraud_probability * 100).toFixed(2);

  // SHAP data for chart
  const shapData = result.top_features?.map(f => ({
    feature: f.feature,
    impact: parseFloat(f.impact.toFixed(3)),
    abs: Math.abs(f.impact),
  })) || [];

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-2 text-xs">
          <p className="text-white font-bold">{d.feature}</p>
          <p className={d.impact > 0 ? "text-red-400" : "text-green-400"}>
            Impact: {d.impact > 0 ? "+" : ""}{d.impact}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 shadow-2xl ${c.glow} transition-all duration-300`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Risk Assessment</h2>
        <span className={`${c.badge} text-white font-bold px-4 py-1 rounded-full text-xs shadow-md`}>
          {result.action}
        </span>
      </div>

      {/* Big % */}
      <div className="text-center my-3">
        <p className={`text-6xl font-black ${c.text} drop-shadow-lg`}>{pct}%</p>
        <p className="text-gray-300 text-sm mt-1">Fraud Probability</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${pct}%`, backgroundColor: c.bar, boxShadow: `0 0 8px ${c.bar}` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {[
          { label: "Risk Level", value: result.risk_level, cls: c.text },
          { label: "Decision",   value: result.action,     cls: "text-white" },
          { label: "Threshold",  value: result.threshold_used.toFixed(4), cls: "text-white" },
        ].map(s => (
          <div key={s.label} className="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 flex justify-between items-center border border-white/5">
            <span className="text-gray-300 text-xs font-medium">{s.label}</span>
            <span className={`${s.cls} font-bold text-sm`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* SHAP Feature Importance */}
      {shapData.length > 0 && (
        <div className="mt-3">
          <p className="text-white text-xs font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Why this decision? (Top Features)
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 9 }} />
              <YAxis type="category" dataKey="feature" tick={{ fill: "#94a3b8", fontSize: 9 }} width={30} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                {shapData.map((entry, i) => (
                  <Cell key={i} fill={entry.impact > 0 ? "#ef4444" : "#22c55e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs mt-1 px-1">
            <span className="text-green-400">← Reduces fraud risk</span>
            <span className="text-red-400">Increases fraud risk →</span>
          </div>
        </div>
      )}

      {/* Risk Meter */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1 px-1">
          <span className="text-green-400 font-medium">LOW</span>
          <span className="text-yellow-400 font-medium">MED</span>
          <span className="text-red-400 font-medium">HIGH</span>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
          <div className="absolute top-0 w-3 h-3 bg-white rounded-full border-2 border-gray-900 -mt-0.5 shadow-lg transition-all duration-500"
            style={{ left: `calc(${pct}% - 6px)` }} />
        </div>
      </div>
    </div>
  );
}
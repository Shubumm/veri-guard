import { useState, useEffect, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";

const COLORS = { BLOCKED: "#ef4444", FLAGGED: "#f59e0b", APPROVED: "#22c55e" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [simCount, setSimCount] = useState(0);
  const simRef = useRef(null);

  const fetchData = async () => {
    try {
      const [s, t] = await Promise.all([
        fetch("https://veri-guard.onrender.com/stats"),
        fetch("https://veri-guard.onrender.com/transactions?limit=50"),
      ]);
      const sd = await s.json();
      const td = await t.json();
      setStats(sd.stats);
      setTransactions(td.transactions);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const startSimulator = () => {
    if (simulating) {
      clearInterval(simRef.current);
      setSimulating(false);
      return;
    }
    setSimulating(true);
    simRef.current = setInterval(async () => {
      try {
        await fetch("https://veri-guard.onrender.com/simulate", { method: "POST" });
        setSimCount(c => c + 1);
        fetchData();
      } catch (err) { console.error(err); }
    }, 2000);
  };

  const pieData = stats ? [
    { name: "Blocked", value: stats.blocked },
    { name: "Flagged", value: stats.flagged },
    { name: "Approved", value: stats.approved },
  ].filter(d => d.value > 0) : [];

  const buckets = { "0-20%": 0, "20-40%": 0, "40-60%": 0, "60-80%": 0, "80-100%": 0 };
  transactions.forEach(tx => {
    const p = tx.fraud_probability * 100;
    if (p < 20) buckets["0-20%"]++;
    else if (p < 40) buckets["20-40%"]++;
    else if (p < 60) buckets["40-60%"]++;
    else if (p < 80) buckets["60-80%"]++;
    else buckets["80-100%"]++;
  });
  const barData = Object.entries(buckets).map(([range, count]) => ({ range, count }));

  const timeData = [...transactions].reverse().slice(-8).map((tx, i) => ({
    t: i + 1,
    amount: parseFloat(tx.amount.toFixed(2)),
    risk: parseFloat((tx.fraud_probability * 100).toFixed(1)),
  }));

  const actionColor = { BLOCKED: "text-red-400", FLAGGED: "text-yellow-400", APPROVED: "text-green-400" };
  const actionBg = { BLOCKED: "bg-red-900/20 border-red-800/40", FLAGGED: "bg-yellow-900/20 border-yellow-800/40", APPROVED: "bg-green-900/20 border-green-800/40" };

  const customTooltip = {
    contentStyle: { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "11px", color: "#f1f5f9", padding: "6px 10px" },
  };

  return (
    <div className="space-y-6">

      {/* Simulator Control */}
      <div className="backdrop-blur-sm bg-gray-800/30 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">🤖 Live Transaction Simulator</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {simulating
              ? `Running... ${simCount} transactions generated`
              : "Auto-generates real transactions every 2 seconds"}
          </p>
        </div>
        <button
          onClick={startSimulator}
          className={`px-5 py-2 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
            simulating
              ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          }`}
        >
          {simulating ? "⏹ Stop" : "▶ Start Simulator"}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Transactions", value: stats.total,    icon: "📊", gradient: "from-white to-gray-900" },
            { label: "Blocked",            value: stats.blocked,  icon: "🚫", gradient: "from-red-500 to-red-700" },
            { label: "Flagged",            value: stats.flagged,  icon: "⚠️", gradient: "from-yellow-500 to-yellow-700" },
            { label: "Approved",           value: stats.approved, icon: "✅", gradient: "from-green-500 to-green-700" },
          ].map((card, idx) => (
            <div key={idx}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 shadow-lg transform transition-all hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex justify-between items-start">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-xs text-white/60 font-medium">{card.label.split(" ")[0]}</span>
              </div>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
              <p className="text-xs text-white/80 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Pie Chart */}
        <div className="backdrop-blur-sm bg-gray-800/30 rounded-2xl p-4 border border-white/10 shadow-xl flex flex-col items-center">
          <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2 self-start">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Decision Breakdown
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                {pieData.map(e => <Cell key={e.name} fill={COLORS[e.name.toUpperCase()]} />)}
              </Pie>
              <Tooltip {...customTooltip} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {[["Blocked","#ef4444"],["Flagged","#f59e0b"],["Approved","#22c55e"]].map(([l,c]) => (
              <div key={l} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-gray-300 text-xs">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="backdrop-blur-sm bg-gray-800/30 rounded-2xl p-4 border border-white/10 shadow-xl flex flex-col items-center">
          <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2 self-start">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Probability Distribution
          </p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" tick={{ fill: "#94a3b8", fontSize: 9 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} />
              <Tooltip {...customTooltip} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart */}
        <div className="backdrop-blur-sm bg-gray-800/30 rounded-2xl p-4 border border-white/10 shadow-xl flex flex-col items-center">
          <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2 self-start">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            Amount & Risk Over Time
          </p>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="amountGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="t" tick={{ fill: "#94a3b8", fontSize: 9 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} />
              <Tooltip {...customTooltip} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#amountGrad)" name="Amount ($)" dot={false} />
              <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" name="Risk %" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="backdrop-blur-sm bg-gray-800/30 rounded-2xl p-4 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Recent Transactions
          </p>
          <span className="text-xs text-gray-400">Last 6 entries</span>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No transactions yet</p>
          ) : transactions.slice(0, 6).map((tx, i) => (
            <div key={i} className={`${actionBg[tx.action]} border rounded-xl p-3 flex justify-between items-center transition-all hover:scale-[1.01] hover:shadow-md`}>
              <div>
                <p className="text-white text-sm font-medium">${tx.amount.toFixed(2)}</p>
                <p className="text-gray-400 text-xs">{new Date(tx.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center w-16">
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${tx.fraud_probability * 100}%`, backgroundColor: tx.fraud_probability > 0.9 ? "#ef4444" : tx.fraud_probability > 0.5 ? "#f59e0b" : "#22c55e" }} />
                  </div>
                  <p className="text-gray-300 text-xs">{(tx.fraud_probability * 100).toFixed(1)}%</p>
                </div>
                <p className={`font-bold text-sm ${actionColor[tx.action]}`}>{tx.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>
    </div>
  );
}
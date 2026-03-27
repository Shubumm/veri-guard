import { useState, useRef } from "react";

const fraudSample = {
  Time: 406, V1: -2.3122265423263, V2: 1.95199201064158,
  V3: -1.60985073229769, V4: 3.9979055875468, V5: -0.522187864667764,
  V6: -1.42654531920595, V7: -2.53738730624579, V8: 1.39165724829804,
  V9: -2.77008927719433, V10: -2.77227214465915, V11: 3.20203320709635,
  V12: -2.89990738849473, V13: -0.595221881324605, V14: -4.28925378244217,
  V15: 0.389724120274487, V16: -1.14074717980657, V17: -2.83005567450437,
  V18: -0.0168224681808257, V19: 0.416955705037907, V20: 0.126910559061474,
  V21: 0.517232370861764, V22: -0.0350493686052974, V23: -0.465211076182388,
  V24: 0.320198198514526, V25: 0.0445191674731724, V26: 0.177839798284401,
  V27: 0.261145002567677, V28: -0.143275874698919, Amount: 149.62
};

const legitimateSample = {
  Time: 44261, V1: 0.339812267, V2: -2.743745237,
  V3: -0.134070514, V4: -1.385729189, V5: -1.451413965,
  V6: 0.248487158, V7: -0.694138956, V8: 0.177280379,
  V9: -2.483061139, V10: 1.399559588, V11: 0.425851823,
  V12: 0.412381787, V13: 0.860869513, V14: -2.507046661,
  V15: 0.522287296, V16: 0.508457542, V17: -0.551404553,
  V18: 0.397737587, V19: -0.422116152, V20: -0.029659853,
  V21: 0.045229566, V22: -0.086545463, V23: -0.030353583,
  V24: 0.215913963, V25: 0.215913963, V26: 0.145486674,
  V27: -0.015337945, V28: 0.017509053, Amount: 520.12
};

export default function TransactionForm({ onResult, onLoading }) {
  const [form, setForm] = useState(fraudSample);
  const [csvError, setCsvError] = useState("");
  const fileRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleCSV = (e) => {
    setCsvError("");
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const lines = evt.target.result.trim().split("\n");
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        const values = lines[1].split(",").map(v => parseFloat(v.trim()));
        const row = {};
        headers.forEach((h, i) => { row[h] = values[i]; });
        const required = Object.keys(fraudSample);
        const missing = required.filter(k => !(k in row));
        if (missing.length > 0) { setCsvError(`Missing: ${missing.join(", ")}`); return; }
        const filtered = {};
        required.forEach(k => { filtered[k] = row[k]; });
        setForm(filtered);
      } catch { setCsvError("Invalid CSV format."); }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    try {
      const res = await fetch("https://veri-guard.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      onResult(data.result);
    } catch (err) { console.error(err); }
    finally { onLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-sm bg-gray-800/30 rounded-2xl p-5 border border-white/10 shadow-2xl">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 rounded-full bg-blue-500"></span>
        Transaction Details
      </h2>

      <div className="flex gap-3 mb-5">
        <button type="button" onClick={() => setForm(fraudSample)}
          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold py-2 rounded-xl transition-all transform hover:scale-105 shadow-md">
          🚨 Fraud Sample
        </button>
        <button type="button" onClick={() => setForm(legitimateSample)}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-xs font-bold py-2 rounded-xl transition-all transform hover:scale-105 shadow-md">
          ✅ Legit Sample
        </button>
        <button type="button" onClick={() => fileRef.current.click()}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold py-2 rounded-xl transition-all transform hover:scale-105 shadow-md">
          📂 CSV Upload
        </button>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
      </div>
      {csvError && <p className="text-red-400 text-xs mb-3 bg-red-900/30 p-2 rounded-lg">{csvError}</p>}

      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 mb-5 custom-scroll">
        {Object.keys(fraudSample).map((key) => (
          <div key={key}>
            <label className="text-gray-300 text-xs block mb-1 font-medium">{key}</label>
            <input
              type="number" name={key} step="any" value={form[key]}
              onChange={handleChange}
              className="w-full bg-gray-900/60 border border-gray-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        ))}
      </div>

      <button type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg mt-2">
        Analyze Transaction
      </button>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
      `}</style>
    </form>
  );
}
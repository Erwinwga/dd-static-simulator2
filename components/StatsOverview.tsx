"use client";

import { AggregatedStats } from "@/lib/simulator";

interface Props {
  stats: AggregatedStats;
}

export default function StatsOverview({ stats }: Props) {
  const sp = stats.successProbability.toFixed(1);
  const fp = stats.failureProbability.toFixed(1);

  return (
    <div className="fade-in flex flex-col gap-4">
      {/* Big probability cards */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="card p-5 text-center"
          style={{ border: "1px solid rgba(0,229,160,0.3)", boxShadow: "0 0 30px rgba(0,229,160,0.08)" }}
        >
          <p className="label mb-2">Probabilidad de Éxito</p>
          <div
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "3.5rem",
              lineHeight: 1,
              color: "var(--accent-green)",
              textShadow: "var(--glow-green-lg)",
            }}
          >
            {sp}%
          </div>
          <p className="label mt-2" style={{ color: "var(--accent-green)", opacity: 0.7 }}>
            {stats.profitCount} / {stats.totalSimulations} sims
          </p>
          <div className="progress-bar mt-3">
            <div className="progress-fill-green" style={{ width: `${sp}%` }} />
          </div>
        </div>

        <div
          className="card p-5 text-center"
          style={{ border: "1px solid rgba(255,61,107,0.3)", boxShadow: "0 0 30px rgba(255,61,107,0.08)" }}
        >
          <p className="label mb-2">Probabilidad de Fracaso</p>
          <div
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "3.5rem",
              lineHeight: 1,
              color: "var(--accent-red)",
              textShadow: "var(--glow-red-lg)",
            }}
          >
            {fp}%
          </div>
          <p className="label mt-2" style={{ color: "var(--accent-red)", opacity: 0.7 }}>
            {stats.drawdownCount} / {stats.totalSimulations} sims
          </p>
          <div className="progress-bar mt-3">
            <div className="progress-fill-red" style={{ width: `${fp}%` }} />
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Días Prom. → Profit" value={`${stats.avgTradesForProfit.toFixed(1)}`} color="green" />
        <StatCard label="Días Prom. → DD" value={`${stats.avgTradesForDrawdown.toFixed(1)}`} color="red" />
        <StatCard label="Máx. Días Obs." value={`${stats.maxTradesObserved}`} color="blue" />
        <StatCard label="Mín. Días Obs." value={`${stats.minTradesObserved}`} color="gold" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "green" | "red" | "blue" | "gold" }) {
  const colorMap = {
    green: "var(--accent-green)",
    red: "var(--accent-red)",
    blue: "var(--accent-blue)",
    gold: "var(--accent-gold)",
  };
  return (
    <div className="card p-4">
      <p className="label mb-1">{label}</p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.4rem", fontWeight: 600, color: colorMap[color] }}>
        {value}
      </p>
    </div>
  );
}

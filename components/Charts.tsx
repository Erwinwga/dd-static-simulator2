"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { AggregatedStats } from "@/lib/simulator";

interface Props {
  stats: AggregatedStats;
}

const TOOLTIP_STYLE = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.78rem",
};

const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.03) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", fill: "#000", fontWeight: 700 }}>
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

export default function Charts({ stats }: Props) {
  const pieData = [
    { name: "Profit", value: stats.profitCount },
    { name: "Drawdown", value: stats.drawdownCount },
  ];

  // Bucket distribution for bar chart
  const distData = stats.distributionByTrades;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 fade-in-delay-1">
      {/* Pie */}
      <div className="card p-5" style={{ position: "relative" }}>
        <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "1rem" }}>
          DISTRIBUCIÓN DE RESULTADOS
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              <Cell key="profit" fill="#00e5a0" />
              <Cell key="drawdown" fill="#ff3d6b" />
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        {/* Porcentajes esquina inferior izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", padding: "0 0.2rem 0.2rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.45rem" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: "var(--accent-green)", lineHeight: 1 }}>
              {stats.successProbability.toFixed(1)}%
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--accent-green)", opacity: 0.85 }}>
              Profit
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.45rem" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: "var(--accent-red)", lineHeight: 1 }}>
              {stats.failureProbability.toFixed(1)}%
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--accent-red)", opacity: 0.85 }}>
              Drawdown
            </span>
          </div>
        </div>
      </div>

      {/* Distribution bar */}
      <div className="card p-5">
        <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "1rem" }}>
          DISTRIBUCIÓN POR TRADES
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={distData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="range"
              tick={{ fill: "var(--text-muted)", fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(61,142,255,0.06)" }} />
            <Bar dataKey="count" name="Simulaciones" fill="#3d8eff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

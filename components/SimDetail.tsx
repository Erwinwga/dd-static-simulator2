"use client";

import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import { AggregatedStats } from "@/lib/simulator";

interface Props {
  stats: AggregatedStats;
  profitTarget: number;
  maxDrawdown: number;
  selectedSim: number;
  onSelectSim: (sim: number) => void;
  chartType: "line" | "bar";
  onChartTypeChange: (type: "line" | "bar") => void;
}

const TOOLTIP_STYLE = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.75rem",
};

export default function SimDetail({ stats, profitTarget, maxDrawdown, selectedSim, onSelectSim, chartType, onChartTypeChange }: Props) {

  const sim = stats.results.find((r) => r.simIndex === selectedSim);
  const chartData = sim?.trades.map((t) => ({
    trade: t.tradeNumber,
    balance: t.accumulated,
    result: t.result,
    isWin: t.isWin,
    floor: t.floor,
  })) ?? [];

  return (
    <div className="card p-5 fade-in-delay-3">
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
          {chartType === "line" ? "CURVA DE CAPITAL" : "RESULTADO POR DÍA"} — SIMULACIÓN #{selectedSim}
        </p>
        <div className="flex items-center gap-3">
          {/* Toggle línea / barras */}
          <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
            <button
              onClick={() => onChartTypeChange("line")}
              style={{
                padding: "0.3rem 0.75rem",
                fontSize: "0.72rem",
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                border: "none",
                background: chartType === "line" ? "var(--accent-blue)" : "transparent",
                color: chartType === "line" ? "#fff" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              LÍNEA
            </button>
            <button
              onClick={() => onChartTypeChange("bar")}
              style={{
                padding: "0.3rem 0.75rem",
                fontSize: "0.72rem",
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                border: "none",
                borderLeft: "1px solid var(--border)",
                background: chartType === "bar" ? "var(--accent-blue)" : "transparent",
                color: chartType === "bar" ? "#fff" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              BARRAS
            </button>
          </div>

          <label className="label" style={{ fontSize: "0.7rem" }}>Ver simulación #</label>
          <input
            type="number"
            min={1}
            max={stats.totalSimulations}
            value={selectedSim}
            onChange={(e) => {
              const v = Math.min(stats.totalSimulations, Math.max(1, parseInt(e.target.value) || 1));
              onSelectSim(v);
            }}
            style={{
              width: 80,
              background: "var(--bg-card2)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.85rem",
              padding: "0.35rem 0.6rem",
              borderRadius: 6,
              outline: "none",
            }}
          />
        </div>
      </div>

      {sim && (
        <div className="flex gap-4 mb-4 flex-wrap">
          <Chip label="Resultado" value={sim.outcome === "profit" ? "PROFIT ✓" : "DRAWDOWN ✗"} color={sim.outcome === "profit" ? "green" : "red"} />
          <Chip label="Días" value={`${sim.tradesNeeded}`} color="blue" />
          <Chip label="Balance Final" value={`$${sim.finalBalance.toFixed(0)}`} color={sim.finalBalance >= 0 ? "green" : "red"} />
          <Chip label="Max DD" value={`$${sim.maxDrawdownReached.toFixed(0)}`} color="red" />
          <Chip label="Mejor Racha +" value={`${sim.maxWinStreak} días`} color="green" />
          <Chip label="Peor Racha −" value={`${sim.maxLoseStreak} días`} color="red" />
        </div>
      )}

      <div style={{ border: "1px solid rgba(0,0,0,0.35)", borderRadius: 6, padding: "8px 4px 4px 0", background: "transparent" }}>
      <ResponsiveContainer width="100%" height={240}>
        {chartType === "line" ? (
          <LineChart data={chartData} margin={{ top: 8, right: 48, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="trade"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--chart-axis)" }}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: number, name: string) => [`$${v.toFixed(0)}`, name === "floor" ? "Piso DD" : "Balance"]}
              labelFormatter={(l) => `Día #${l}`}
            />
            <ReferenceLine y={profitTarget} stroke="var(--accent-green)" strokeDasharray="5 4" label={{ value: "TARGET", position: "right", fill: "var(--accent-green)", fontSize: 9 }} />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Line
              type="monotone"
              dataKey="floor"
              stroke="var(--accent-red)"
              dot={false}
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke={sim?.outcome === "profit" ? "var(--accent-green)" : "var(--accent-red)"}
              dot={false}
              strokeWidth={1.5}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="trade"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--chart-axis)" }}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: number) => [`$${v.toFixed(0)}`, "Resultado"]}
              labelFormatter={(l) => `Día #${l}`}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Bar dataKey="result" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isWin ? "var(--accent-green)" : "var(--accent-red)"}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
      </div>
    </div>
  );
}

function Chip({ label, value, color }: { label: string; value: string; color: "green" | "red" | "blue" }) {
  const c = { green: "var(--accent-green)", red: "var(--accent-red)", blue: "var(--accent-blue)" }[color];
  return (
    <div style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 6, padding: "0.3rem 0.7rem" }}>
      <p className="label" style={{ fontSize: "0.65rem" }}>{label}</p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: c, fontWeight: 600 }}>{value}</p>
    </div>
  );
}

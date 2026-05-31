"use client";

import { useState } from "react";
import { AggregatedStats } from "@/lib/simulator";

interface Props {
  stats: AggregatedStats;
  selectedSim: number;
  onSelectSim: (sim: number) => void;
}

export default function ResultsTable({ stats, selectedSim, onSelectSim }: Props) {
  const [filter, setFilter] = useState<"all" | "profit" | "drawdown">("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const filtered = stats.results.filter((r) => {
    if (filter === "all") return true;
    return r.outcome === filter;
  });

  const total = filtered.length;
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="card fade-in-delay-2" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
          RESULTADOS POR SIMULACIÓN
        </p>
        <div className="flex gap-2">
          {(["all", "profit", "drawdown"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: 5,
                fontSize: "0.75rem",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.15s",
                borderColor: filter === f
                  ? f === "profit" ? "var(--accent-green)" : f === "drawdown" ? "var(--accent-red)" : "var(--accent-blue)"
                  : "var(--border)",
                background: filter === f
                  ? f === "profit" ? "rgba(0,229,160,0.1)" : f === "drawdown" ? "rgba(255,61,107,0.1)" : "rgba(61,142,255,0.1)"
                  : "transparent",
                color: filter === f
                  ? f === "profit" ? "var(--accent-green)" : f === "drawdown" ? "var(--accent-red)" : "var(--accent-blue)"
                  : "var(--text-muted)",
              }}
            >
              {f === "all" ? "Todos" : f === "profit" ? "✓ Profit" : "✗ DD"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", maxHeight: "380px", overflowY: "auto" }}>
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Resultado</th>
              <th>Trades</th>
              <th>Balance Final</th>
              <th>Max DD</th>
              <th>Max Win Streak</th>
              <th>Max Lose Streak</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr
                key={r.simIndex}
                onClick={() => onSelectSim(r.simIndex)}
                style={{
                  cursor: "pointer",
                  background: r.simIndex === selectedSim
                    ? "rgba(61,142,255,0.1)"
                    : undefined,
                  outline: r.simIndex === selectedSim
                    ? "1px solid rgba(61,142,255,0.35)"
                    : undefined,
                }}
              >
                <td style={{ color: "var(--text-muted)" }}>{r.simIndex}</td>
                <td>
                  <span
                    style={{
                      color: r.outcome === "profit" ? "var(--accent-green)" : "var(--accent-red)",
                      fontWeight: 600,
                    }}
                  >
                    {r.outcome === "profit" ? "✓ PROFIT" : "✗ DRAWDOWN"}
                  </span>
                </td>
                <td style={{ color: "var(--accent-blue)" }}>{r.tradesNeeded}</td>
                <td style={{ color: r.finalBalance >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {r.finalBalance >= 0 ? "+" : ""}${r.finalBalance.toFixed(0)}
                </td>
                <td style={{ color: "var(--accent-red)" }}>${r.maxDrawdownReached.toFixed(0)}</td>
                <td style={{ color: "var(--accent-green)" }}>{r.maxWinStreak}</td>
                <td style={{ color: "var(--accent-red)" }}>{r.maxLoseStreak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: 5,
                fontSize: "0.75rem",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: page === 0 ? "not-allowed" : "pointer",
                opacity: page === 0 ? 0.4 : 1,
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: 5,
                fontSize: "0.75rem",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                opacity: page === totalPages - 1 ? 0.4 : 1,
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

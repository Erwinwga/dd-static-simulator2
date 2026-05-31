"use client";

import { useState, useCallback } from "react";
import InputPanel from "@/components/InputPanel";
import StatsOverview from "@/components/StatsOverview";
import Charts from "@/components/Charts";
import ResultsTable from "@/components/ResultsTable";
import SimDetail from "@/components/SimDetail";
import ThemeToggle from "@/components/ThemeToggle";
import { runSimulations, SimulationParams, AggregatedStats } from "@/lib/simulator";

const DEFAULT: SimulationParams = {
  riskPerTrade: 500,
  tradesPerDay: 1,
  winRate: 58,
  riskRewardRatio: 1.1,
  maxDrawdown: 4000,
  ddMode: "static",
  profitColchon: 2500,
  profitTarget: 5000,
  simulations: 1000,
};

export default function Home() {
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastParams, setLastParams] = useState<SimulationParams | null>(null);
  const [selectedSim, setSelectedSim] = useState(1);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [params, setParams] = useState<SimulationParams>(DEFAULT);
  const [raw, setRaw] = useState<Record<keyof SimulationParams, string>>(
    Object.fromEntries(Object.entries(DEFAULT).map(([k, v]) => [k, String(v)])) as Record<keyof SimulationParams, string>
  );

  const handleSet = (key: keyof SimulationParams, value: string) => {
    setRaw((r) => ({ ...r, [key]: value }));
    const num = parseFloat(value);
    if (!isNaN(num) && value.trim() !== "") {
      setParams((p) => ({ ...p, [key]: num }));
    }
  };

  const handleSetDdMode = (mode: "static" | "eod") => {
    setParams((p) => ({ ...p, ddMode: mode }));
  };

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setLastParams(params);
    setTimeout(() => {
      try {
        const result = runSimulations(params);
        setStats(result);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  }, [params]);

  const handleReset = () => {
    setStats(null);
    setLastParams(null);
    setSelectedSim(1);
    setParams(DEFAULT);
    setRaw(Object.fromEntries(Object.entries(DEFAULT).map(([k, v]) => [k, String(v)])) as Record<keyof SimulationParams, string>);
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg, #00c47a, #3d8eff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.1rem",
                color: "#000",
                fontWeight: 900,
              }}
            >
              AG
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1.15rem",
                  letterSpacing: "0.12em",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}
              >
                AG BROTHERS INVESTMENT
              </h1>
              <p
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                DD Static Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                padding: "0.45rem 1.25rem",
                borderRadius: 8,
                border: "none",
                background: isRunning ? "var(--text-muted)" : "#00e5a0",
                color: "#000",
                fontSize: "0.78rem",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.08em",
                cursor: isRunning ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isRunning ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  SIMULANDO...
                </>
              ) : (
                "▶ EJECUTAR SIMULACIÓN"
              )}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
              }}
            >
              Limpiar
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero tagline */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "2rem 1.5rem",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <h2 className="hero-title">
          Simulador de Probabilidad de Éxito
        </h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem", maxWidth: 560 }}>
          Evalúa tu estrategia de trading con simulaciones estadísticas. Define tus parámetros y descubre la probabilidad real de alcanzar tu objetivo antes de quemar la cuenta.
        </p>
      </div>

      {/* Main layout */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "2rem 1.5rem",
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Left: Input */}
        <div style={{ position: "sticky", top: 80 }}>
          <InputPanel params={params} raw={raw} onSet={handleSet} onSetDdMode={handleSetDdMode} />
        </div>

        {/* Right: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", minHeight: 400 }}>
          {isRunning && (
            <div
              className="card p-8 flex flex-col items-center justify-center gap-4"
              style={{ minHeight: 300 }}
            >
              <div className="spinner" style={{ width: 40, height: 40 }} />
              <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                EJECUTANDO SIMULACIONES...
              </p>
            </div>
          )}

          {!isRunning && !stats && (
            <div
              className="card p-12 flex flex-col items-center justify-center gap-4"
              style={{ minHeight: 300, textAlign: "center" }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(61,142,255,0.08)",
                  border: "1px solid rgba(61,142,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                }}
              >
                📊
              </div>
              <div>
                <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                  CONFIGURA Y EJECUTA
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
                  Ajusta los parámetros en el panel izquierdo y presiona Ejecutar Simulación
                </p>
              </div>
            </div>
          )}

          {!isRunning && stats && (
            <>
              <StatsOverview stats={stats} />
              <Charts stats={stats} />
              {lastParams && (
                <SimDetail
                  stats={stats}
                  profitTarget={lastParams.profitTarget}
                  maxDrawdown={lastParams.maxDrawdown}
                  selectedSim={selectedSim}
                  onSelectSim={setSelectedSim}
                  chartType={chartType}
                  onChartTypeChange={setChartType}
                />
              )}
              <ResultsTable stats={stats} selectedSim={selectedSim} onSelectSim={setSelectedSim} />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1.5rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          marginTop: "2rem",
        }}
      >
        AG Brothers Investment · DD Static Simulator · Solo para fines educativos y de investigación
      </footer>
    </main>
  );
}

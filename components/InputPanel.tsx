"use client";

import { SimulationParams } from "@/lib/simulator";
import { Layers, CheckLg, XLg } from "react-bootstrap-icons";

interface Props {
  params: SimulationParams;
  raw: Record<keyof SimulationParams, string>;
  onSet: (key: keyof SimulationParams, value: string) => void;
  onSetDdMode: (mode: "static" | "eod") => void;
}

export default function InputPanel({ params, raw, onSet, onSetDdMode }: Props) {
  const dailyRisk = params.riskPerTrade * params.tradesPerDay;

  const fields: { key: keyof SimulationParams; label: string; prefix?: string; suffix?: string; min: number; max?: number; step?: number }[] = [
    { key: "riskPerTrade", label: "Riesgo Por Operación", prefix: "$", min: 1, step: 100 },
    { key: "tradesPerDay", label: "Número de Trades por Día", min: 1, max: 50, step: 1 },
    { key: "winRate", label: "Probabilidad de Acierto", suffix: "%", min: 1, max: 99, step: 1 },
    { key: "riskRewardRatio", label: "Ratio Riesgo / Beneficio", min: 0.1, step: 0.1 },
    { key: "maxDrawdown", label: "Draw Down Máximo", prefix: "$", min: 1, step: 500 },
    { key: "profitTarget", label: "Profit Target", prefix: "$", min: 1, step: 500 },
    { key: "simulations", label: "Número de Simulaciones", min: 10, max: 5000, step: 10 },
  ];

  const isEod = params.ddMode === "eod";

  return (
    <div className="card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(61,142,255,0.15)", border: "1px solid rgba(61,142,255,0.3)" }}>
          <Layers size={16} color="var(--accent-blue)" />
        </div>
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em", color: "var(--text-primary)" }}>
            PARÁMETROS
          </h2>
          <p className="label" style={{ fontSize: "0.65rem" }}>Configuración de la estrategia</p>
        </div>
      </div>

      {fields.map(({ key, label, prefix, suffix, min, max, step }) => (
        <div key={key}>
          <div className="flex flex-col gap-1.5">
            <label className="label">{label}</label>
            <div className="flex items-center gap-2">
              {prefix && (
                <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", minWidth: "16px" }}>
                  {prefix}
                </span>
              )}
              <input
                className="input-field"
                type="number"
                min={min}
                max={max}
                step={step ?? 1}
                value={raw[key]}
                onChange={(e) => onSet(key, e.target.value)}
              />
              {suffix && (
                <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem" }}>
                  {suffix}
                </span>
              )}
            </div>
          </div>

          {key === "maxDrawdown" && (
            <>
              {/* DD Mode toggle */}
              <div className="flex items-center justify-between mt-3">
                <span className="label" style={{ fontSize: "0.7rem" }}>Modo DD</span>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", color: !isEod ? "var(--text-primary)" : "var(--text-muted)", transition: "color 0.2s" }}>
                    ESTÁTICO
                  </span>
                  <button
                    onClick={() => onSetDdMode(isEod ? "static" : "eod")}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: isEod ? "var(--accent-blue)" : "var(--bg-card2)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      top: 2,
                      left: isEod ? 20 : 2,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </button>
                  <span style={{ fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", color: isEod ? "var(--accent-blue)" : "var(--text-muted)", transition: "color 0.2s" }}>
                    EOD
                  </span>
                </div>
              </div>

              {/* Profit Colchón — only visible in EOD mode */}
              {isEod && (
                <div className="flex flex-col gap-1.5 mt-4 p-3 rounded-lg" style={{ background: "rgba(61,142,255,0.05)", border: "1px solid rgba(61,142,255,0.2)" }}>
                  <label className="label" style={{ color: "var(--accent-blue)" }}>Profit Colchón</label>
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", minWidth: "16px" }}>$</span>
                    <input
                      className="input-field"
                      type="number"
                      min={1}
                      step={500}
                      value={raw["profitColchon"]}
                      onChange={(e) => onSet("profitColchon", e.target.value)}
                    />
                  </div>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                    Al alcanzarlo el DD se vuelve estático
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Daily risk highlight */}
      <div className="p-3 rounded-lg" style={{ background: "rgba(61,142,255,0.06)", border: "1px solid rgba(61,142,255,0.25)" }}>
        <p className="label mb-1" style={{ fontSize: "0.65rem" }}>Riesgo Total por Día</p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.25rem", color: "var(--accent-blue)", fontWeight: 700 }}>
          ${dailyRisk.toFixed(0)}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", marginTop: "0.2rem" }}>
          ${params.riskPerTrade.toFixed(0)} × {params.tradesPerDay} trades/día
        </p>
      </div>

      {/* Expected reward preview */}
      <div className="p-3 rounded-lg" style={{ background: "var(--bg-card2)", border: "1px solid var(--border)" }}>
        <p className="label mb-2">Vista previa por día</p>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--accent-green)", fontFamily: "'JetBrains Mono', monospace" }}>
            <CheckLg size={12} /> +${(dailyRisk * params.riskRewardRatio).toFixed(0)}
          </span>
          <span style={{ color: "var(--accent-red)", fontFamily: "'JetBrains Mono', monospace" }}>
            <XLg size={12} /> -${dailyRisk.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
            EV/día: ${((dailyRisk * params.riskRewardRatio * (params.winRate / 100)) - (dailyRisk * (1 - params.winRate / 100))).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

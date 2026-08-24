// src/components/ForgeLoader.tsx
import React, { useEffect, useState } from "react";

interface ForgeLoaderProps {
  title?: string;
  subtitle?: string;
  logs?: string[];
  accentColor?: string;
  speedMs?: number;
  minHeight?: string;
}

const DEFAULT_LOGS = [
  "CONNECTING_FIREBASE_CORE...",
  "SYNCING_DISCIPLINE_METRICS...",
  "CALCULATING_BODY_COMPOSITION...",
  "INITIALIZING_NEURAL_INTERFACE..."
];

export const ForgeLoader: React.FC<ForgeLoaderProps> = ({
  title = "FORGEOS // ЗАГРУЗКА",
  subtitle = "ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ",
  logs = DEFAULT_LOGS,
  accentColor = "#00ff15",
  speedMs = 450,
  minHeight = "80vh",
}) => {
  const [logIndex, setLogIndex] = useState<number>(0);

  useEffect(() => {
    if (!logs || logs.length === 0) return;
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % logs.length);
    }, speedMs);

    return () => clearInterval(interval);
  }, [logs, speedMs]);

  const currentLog = logs && logs.length > 0 ? logs[logIndex] : "LOADING_MODULE...";

  return (
    <div
      style={{
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        backgroundColor: "#080808",
        color: "#fff",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes forgePulseAnim {
          0% { transform: scale(0.95); box-shadow: 0 0 10px ${accentColor}33; }
          50% { transform: scale(1.05); box-shadow: 0 0 35px ${accentColor}aa; }
          100% { transform: scale(0.95); box-shadow: 0 0 10px ${accentColor}33; }
        }
        @keyframes forgeSpinCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes forgeSpinCCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes forgeScanLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Киберпанк-реактор */}
      <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "26px" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: `2px dashed ${accentColor}`,
            borderRadius: "50%",
            animation: "forgeSpinCW 7s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "8px",
            border: `1px solid ${accentColor}55`,
            borderRadius: "50%",
            animation: "forgeSpinCCW 3.5s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "22px",
            backgroundColor: accentColor,
            borderRadius: "50%",
            animation: "forgePulseAnim 1.6s ease-in-out infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          ⚡
        </div>
      </div>

      {/* Заголовок */}
      <div style={{ fontSize: "20px", letterSpacing: "2.5px", fontWeight: "bold", marginBottom: "4px", textAlign: "center" }}>
        {title}
      </div>

      {subtitle && (
        <span style={{ color: "#666", fontSize: "11px", letterSpacing: "1px", marginBottom: "16px" }}>
          {subtitle}
        </span>
      )}

      {/* Бегущая строка логов */}
      <div
        style={{
          fontSize: "12px",
          color: accentColor,
          letterSpacing: "0.8px",
          backgroundColor: "#0d1a0e",
          border: `1px solid ${accentColor}44`,
          padding: "6px 14px",
          borderRadius: "4px",
          marginBottom: "16px",
          minWidth: "260px",
          maxWidth: "90%",
          textAlign: "center",
          wordBreak: "break-all",
        }}
      >
        &gt; {currentLog}
      </div>

      {/* Сканирующая полоса */}
      <div
        style={{
          width: "200px",
          height: "3px",
          backgroundColor: "#161616",
          borderRadius: "2px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "40%",
            height: "100%",
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
            borderRadius: "2px",
            position: "absolute",
            animation: "forgeScanLine 1.3s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
};

export default ForgeLoader;
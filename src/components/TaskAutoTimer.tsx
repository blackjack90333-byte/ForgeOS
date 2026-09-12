// src/components/TaskAutoTimer.tsx
import React, { useEffect, useState, useRef } from "react";

interface TaskAutoTimerProps {
  taskText: string;
  stepIndex: number;
}

// Извлекаем секунды из естественного русского текста
export const parseDurationFromText = (text: string): number | null => {
  if (!text) return null;

  // 1. Поиск часов: "1 час", "2 ч", "1час"
  const hourMatch = text.match(/(\d+)\s*(?:ч|час|часа|часов)/i);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 3600;
  }

  // 2. Поиск минут: "12+ минут", "12 мин", "3минуты", "5м"
  const minMatch = text.match(/(\d+)\+?\s*(?:мин|минута|минуты|минут|м\b)/i);
  if (minMatch) {
    return parseInt(minMatch[1], 10) * 60;
  }

  // 3. Поиск секунд: "30 сек", "45 секунд", "30с"
  const secMatch = text.match(/(\d+)\s*(?:сек|секунд|секунды|с\b)/i);
  if (secMatch) {
    return parseInt(secMatch[1], 10);
  }

  return null;
};

// Звуковой сигнал завершения на Web Audio API (без сторонних mp3)
const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // нота Ля (880Hz)
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // игнор если заблокировано политикой браузера
  }
};

const TaskAutoTimer: React.FC<TaskAutoTimerProps> = ({ taskText, stepIndex }) => {
  const initialSeconds = parseDurationFromText(taskText);

  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds || 0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Сброс таймера при смене текущего шага
  useEffect(() => {
    const parsed = parseDurationFromText(taskText);
    setTimeLeft(parsed || 0);
    setIsRunning(false);
    setIsFinished(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stepIndex, taskText]);

  // Тиканье таймера
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  if (!initialSeconds) {
    return null; // В задаче нет упоминания времени — не занимаем место
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const percent = Math.max(0, Math.min(100, Math.round(((initialSeconds - timeLeft) / initialSeconds) * 100)));

  return (
    <div
      style={{
        backgroundColor: "#080d0a",
        border: `1px solid ${isFinished ? "#00ff15" : "#1f3323"}`,
        borderRadius: "6px",
        padding: "12px 14px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: isFinished ? "#00ff15" : "#4ade80", letterSpacing: "1px", fontWeight: "bold" }}>
          ⏱ АВТО-ТАЙМЕР ЗАДАЧИ {isFinished && "— ВРЕМЯ ВЫШЛО! 🔥"}
        </span>
        <span style={{ fontSize: "11px", color: "#666" }}>
          Цель: {formatTime(initialSeconds)}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px" }}>
        {/* Большой цифровой циферблат */}
        <div
          style={{
            fontSize: "32px",
            fontFamily: "monospace",
            fontWeight: "bold",
            color: isFinished ? "#00ff15" : "#fff",
            textShadow: isRunning ? "0 0 10px rgba(0,255,21,0.5)" : "none",
            minWidth: "100px",
          }}
        >
          {formatTime(timeLeft)}
        </div>

        {/* Кнопки управления */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={timeLeft === 0}
            style={{
              backgroundColor: isRunning ? "#2a1e0b" : "#0d2b14",
              border: `1px solid ${isRunning ? "#f0932b" : "#00ff15"}`,
              color: isRunning ? "#f0932b" : "#00ff15",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "bold",
              fontFamily: "monospace",
              cursor: timeLeft === 0 ? "not-allowed" : "pointer",
            }}
          >
            {isRunning ? "⏸ ПАУЗА" : "▶ СТАРТ"}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setIsFinished(false);
              setTimeLeft(initialSeconds);
            }}
            style={{
              backgroundColor: "#161922",
              border: "1px solid #333",
              color: "#888",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "13px",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
            title="Сбросить таймер"
          >
            ↺ СБРОС
          </button>
        </div>
      </div>

      {/* Полоса прогресса таймера */}
      <div style={{ width: "100%", height: "4px", backgroundColor: "#141720", borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: isFinished ? "#00ff15" : "#00ff15aa",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

export default TaskAutoTimer;
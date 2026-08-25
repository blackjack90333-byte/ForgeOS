// src/components/NofapPanicModal.tsx
import React, { useEffect, useRef, useState } from "react";
import ActionButton from "./ActionButton";

export interface PanicStep {
  id: string;
  title: string;
  desc: string;
  durationSec: number;
}

interface NofapPanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  customSteps?: PanicStep[];
}

const DEFAULT_PANIC_STEPS: PanicStep[] = [
  {
    id: "step_pushups",
    title: "3 ПОДХОДА ОТЖИМАНИЙ ДО ОТКАЗА",
    desc: "Упал на пол прямо сейчас. 3 плотных подхода. Кровь уходит из тазовой области в грудные мышцы и трицепс.",
    durationSec: 180, // 3 мин
  },
  {
    id: "step_squats",
    title: "3 ПОДХОДА ГЛУБОКИХ ПРИСЕДАНИЙ",
    desc: "По 25-30 повторений в темпе. Разгоняй пульс, задействуй квадрицепсы и ягодичные мышцы.",
    durationSec: 240, // 4 мин
  },
  {
    id: "step_cold_shower",
    title: "ЛЕДЯНОЙ ДУШ // КОНТРАСТ",
    desc: "Включай максимально холодную воду. Мощный выброс норадреналина мгновенно смывает дофаминовый морок.",
    durationSec: 300, // 5 мин
  },
  {
    id: "step_grounding",
    title: "СТАКАН ХОЛОДНОЙ ВОДЫ + ДЫХАНИЕ 4-4-6",
    desc: "Медленный вдох носом 4 сек, задержка 4 сек, выдох ртом 6 сек. Возврат контроля в префронтальную кору.",
    durationSec: 180, // 3 мин
  },
];

// Генератор звуков на Web Audio API (работает автономно без внешних файлов)
const playBeep = (freq: number = 800, durationMs: number = 100, type: OscillatorType = "sine") => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Игнорируем блокировки автоплея браузера
  }
};

const playNextStepSound = () => {
  playBeep(587.33, 120, "triangle"); // D5
  setTimeout(() => playBeep(880, 200, "triangle"), 130); // A5
};

const playTickSound = () => {
  playBeep(900, 60, "sine");
};

const formatSeconds = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const NofapPanicModal: React.FC<NofapPanicModalProps> = ({
  isOpen,
  onClose,
  customSteps = DEFAULT_PANIC_STEPS,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(customSteps[0]?.durationSec || 180);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setTimeLeft(customSteps[0]?.durationSec || 180);
      setIsActive(true);
      setIsCompleted(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, customSteps]);

  // Обратный отсчет таймера
  useEffect(() => {
    if (!isOpen || !isActive || isCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          playTickSound();
        }

        if (prev <= 1) {
          // Переход на следующий шаг
          if (currentStepIndex + 1 < customSteps.length) {
            playNextStepSound();
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            return customSteps[nextIdx].durationSec;
          } else {
            // Финиш
            playNextStepSound();
            setIsCompleted(true);
            setIsActive(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isActive, currentStepIndex, customSteps, isCompleted]);

  if (!isOpen) return null;

  const currentStep = customSteps[currentStepIndex] || customSteps[0];
  const stepTotal = currentStep.durationSec || 1;
  const progressPercent = Math.min(100, Math.max(0, ((stepTotal - timeLeft) / stepTotal) * 100));

  const handleSkipStep = () => {
    if (currentStepIndex + 1 < customSteps.length) {
      playNextStepSound();
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setTimeLeft(customSteps[nextIdx].durationSec);
    } else {
      setIsCompleted(true);
      setIsActive(false);
    }
  };

  const handleAdd30Sec = () => {
    setTimeLeft((prev) => prev + 30);
  };

  const handleCloseModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.94)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        padding: "16px",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          backgroundColor: "#0a0a0a",
          border: "2px solid #ff4d4d",
          boxShadow: "0 0 30px rgba(255, 77, 77, 0.3)",
          borderRadius: "6px",
          maxWidth: "540px",
          width: "100%",
          padding: "24px",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        {/* Верхняя панель */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222", paddingBottom: "12px", marginBottom: "20px" }}>
          <div>
            <span style={{ backgroundColor: "#ff4d4d", color: "#000", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "2px", letterSpacing: "1px" }}>
              ПРОТОКОЛ ПЕРЕХВАТА
            </span>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
              ЭТАП {currentStepIndex + 1} ИЗ {customSteps.length}
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            style={{
              background: "none",
              border: "1px solid #333",
              color: "#888",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "12px",
              borderRadius: "4px",
            }}
          >
            ЗАКРЫТЬ [ESC]
          </button>
        </div>

        {!isCompleted ? (
          <>
            {/* Название и описание текущего упражнения */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "15px", fontWeight: "bold", color: "#ff4d4d", letterSpacing: "1px", marginBottom: "6px" }}>
                &gt; {currentStep.title}
              </div>
              <div style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.5", backgroundColor: "#111", padding: "10px 12px", borderRadius: "4px", border: "1px solid #222" }}>
                {currentStep.desc}
              </div>
            </div>

            {/* Главный цифровой таймер */}
            <div style={{ textAlign: "center", padding: "16px 0", backgroundColor: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: "6px", marginBottom: "16px" }}>
              <div style={{ fontSize: "52px", fontWeight: "bold", color: timeLeft <= 5 ? "#ff4d4d" : "#00ff15", letterSpacing: "2px" }}>
                {formatSeconds(timeLeft)}
              </div>
              <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                ОСТАЛОСЬ ВРЕМЕНИ НА ЭТАП
              </div>
            </div>

            {/* Полоса прогресса этапа */}
            <div style={{ height: "4px", backgroundColor: "#1c1c1c", borderRadius: "2px", overflow: "hidden", marginBottom: "24px" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progressPercent}%`,
                  backgroundColor: "#00ff15",
                  transition: "width 1s linear",
                }}
              />
            </div>

            {/* Кнопки управления */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <button
                onClick={() => setIsActive(!isActive)}
                style={{
                  padding: "10px",
                  backgroundColor: isActive ? "#222" : "#00ff15",
                  color: isActive ? "#fff" : "#000",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {isActive ? "ПАУЗА" : "СТАРТ"}
              </button>

              <button
                onClick={handleAdd30Sec}
                style={{
                  padding: "10px",
                  backgroundColor: "#161616",
                  color: "#aaa",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                +30 СЕК
              </button>

              <button
                onClick={handleSkipStep}
                style={{
                  padding: "10px",
                  backgroundColor: "#161616",
                  color: "#aaa",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                СЛЕД. ШАГ →
              </button>
            </div>
          </>
        ) : (
          /* Экран успешного завершения протокола */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00ff15", letterSpacing: "1px", marginBottom: "8px" }}>
              ПРОТОКОЛ ВЫПОЛНЕН // ИМПУЛЬС ПОДАВЛЕН
            </div>
            <p style={{ color: "#aaa", fontSize: "13px", lineHeight: "1.5", marginBottom: "24px" }}>
              Дофаминовый шторм сбит физической нагрузкой. Кровь перераспределена, контроль сохранен. Возвращайся к текущим задачам.
            </p>
            <ActionButton
              onClick={handleCloseModal}
              variant="primary"
              style={{ padding: "12px 24px", fontSize: "13px" }}
            >
              ВЕРНУТЬСЯ В СТРОЙ
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default NofapPanicModal;
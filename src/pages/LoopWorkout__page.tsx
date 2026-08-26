// src/pages/LoopWorkout__page.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LoopWorkoutConfig, WorkoutExerciseItem } from "../types";

const LOCAL_STORAGE_KEY = "forgeos_loop_workout_config";
const DEFAULT_MUSIC_URL = "https://youtu.be/nH3XHIgkN8w?si=FBPLwITFcAEimdTQ";

const DEFAULT_CONFIG: LoopWorkoutConfig = {
  roundsCount: 4,
  restBetweenRoundsSec: 60,
  prepareSec: 60,
  musicUrl: DEFAULT_MUSIC_URL,
  exercises: [
    { id: "1", name: "Махи гирей 16кг", workSec: 40, restSec: 20 },
    { id: "2", name: "Отжимания от пола (ноги на кровати)", workSec: 40, restSec: 20 },
    { id: "3", name: "Тяга гири в наклоне", workSec: 40, restSec: 20 },
    { id: "4", name: "Тяга гири в наклоне (другой рукой)", workSec: 40, restSec: 20 },
    { id: "5", name: "Приседания", workSec: 60, restSec: 20 },
    { id: "6", name: "Закидывание + жим гири", workSec: 40, restSec: 20 },
    { id: "7", name: "Закидывание + жим гири (другой рукой)", workSec: 40, restSec: 20 },
    { id: "8", name: "Отжимания треугольником (трицепс)", workSec: 40, restSec: 20 },
    { id: "9", name: "Пресс", workSec: 40, restSec: 20 },
    { id: "10", name: "Шея", workSec: 80, restSec: 20 },
    { id: "11", name: "Шея (другой стороной)", workSec: 80, restSec: 20 },
    { id: "12", name: "Рис пронация", workSec: 80, restSec: 20 },
    { id: "13", name: "Рис супинация", workSec: 80, restSec: 20 },
  ],
};

const playCymbalHit = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(850, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.35);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (err) {
    console.error("Audio error:", err);
  }
};

type WorkoutPhase = "idle" | "prepare" | "work" | "rest" | "round_rest" | "finished";

const LoopWorkoutPage: React.FC = () => {
  const [config, setConfig] = useState<LoopWorkoutConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  const [phase, setPhase] = useState<WorkoutPhase>("idle");
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [showMusicEdit, setShowMusicEdit] = useState<boolean>(false);
  const [musicInput, setMusicInput] = useState<string>(config.musicUrl || DEFAULT_MUSIC_URL);

  const timerRef = useRef<any>(null);

  const saveToLocalStorage = (newConfig: LoopWorkoutConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error("Ошибка сохранения в localStorage", e);
    }
  };

  useEffect(() => {
    if (phase !== "idle" && phase !== "finished" && !isPaused) {
      if (secondsLeft === 3 || secondsLeft === 2 || secondsLeft === 1) {
        playCymbalHit();
      }
    }
  }, [secondsLeft, phase, isPaused]);

  useEffect(() => {
    if (phase === "idle" || phase === "finished" || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        handlePhaseTransition();
        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused, currentRound, currentExerciseIndex, config]);

  const handlePhaseTransition = () => {
    const currentEx = config.exercises[currentExerciseIndex];

    if (phase === "prepare") {
      setPhase("work");
      setSecondsLeft(Number(config.exercises[0]?.workSec) || 40);
      playCymbalHit();
    } else if (phase === "work") {
      const rest = Number(currentEx?.restSec) || 0;
      if (rest > 0) {
        setPhase("rest");
        setSecondsLeft(rest);
      } else {
        advanceToNextExerciseOrRound();
      }
    } else if (phase === "rest") {
      advanceToNextExerciseOrRound();
    } else if (phase === "round_rest") {
      setCurrentRound((r) => r + 1);
      setCurrentExerciseIndex(0);
      setPhase("work");
      setSecondsLeft(Number(config.exercises[0]?.workSec) || 40);
      playCymbalHit();
    }
  };

  const advanceToNextExerciseOrRound = () => {
    const isLastExercise = currentExerciseIndex >= config.exercises.length - 1;
    const isLastRound = currentRound >= Number(config.roundsCount);

    if (!isLastExercise) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setPhase("work");
      setSecondsLeft(Number(config.exercises[nextIndex].workSec) || 40);
      playCymbalHit();
    } else {
      if (!isLastRound) {
        setPhase("round_rest");
        setSecondsLeft(Number(config.restBetweenRoundsSec) || 60);
      } else {
        setPhase("finished");
        setSecondsLeft(0);
        playCymbalHit();
      }
    }
  };

  // Валидация перед стартом
  const isWorkoutValid =
    config.exercises.length > 0 &&
    config.roundsCount > 0 &&
    config.exercises.every((ex) => ex.workSec > 0);

  const handleStartWorkout = () => {
    if (!isWorkoutValid) {
      alert("Заполните корректное время нагрузки (минимум 1 сек) для всех упражнений!");
      return;
    }

    setCurrentRound(1);
    setCurrentExerciseIndex(0);
    setIsPaused(false);

    const prep = Number(config.prepareSec) || 0;
    if (prep > 0) {
      setPhase("prepare");
      setSecondsLeft(prep);
    } else {
      setPhase("work");
      setSecondsLeft(Number(config.exercises[0].workSec) || 40);
    }
  };

  const handleStopWorkout = () => {
    if (!window.confirm("Прервать тренировку?")) return;
    setPhase("idle");
    setSecondsLeft(0);
    setIsPaused(false);
  };

  const handleAddExercise = () => {
    const updated = [
      ...config.exercises,
      {
        id: `ex_${Date.now()}`,
        name: `Упражнение ${config.exercises.length + 1}`,
        workSec: 40,
        restSec: 20,
      },
    ];
    saveToLocalStorage({ ...config, exercises: updated });
  };

  const handleRemoveExercise = (id: string) => {
    const updated = config.exercises.filter((e) => e.id !== id);
    saveToLocalStorage({ ...config, exercises: updated });
  };

  // Безопасный парсинг чисел (защита от букв и NaN)
  const parseSafeInt = (val: string, fallback: number = 0): number => {
    const clean = val.replace(/[^0-9]/g, "");
    if (!clean) return fallback;
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? fallback : parsed;
  };

  const handleExerciseChange = (id: string, field: keyof WorkoutExerciseItem, val: any) => {
    const updated = config.exercises.map((ex) => {
      if (ex.id === id) {
        if (field === "workSec" || field === "restSec") {
          return { ...ex, [field]: parseSafeInt(String(val), 0) };
        }
        return { ...ex, [field]: val };
      }
      return ex;
    });
    saveToLocalStorage({ ...config, exercises: updated });
  };

  const handleSaveMusicUrl = () => {
    const newConfig = { ...config, musicUrl: musicInput.trim() || DEFAULT_MUSIC_URL };
    saveToLocalStorage(newConfig);
    setShowMusicEdit(false);
  };

  const currentExercise = config.exercises[currentExerciseIndex];

  // --------------------------------------------------------------------------
  // ЭКРАН 1: АКТИВНЫЙ РАННЕР ТРЕНИРОВКИ
  // --------------------------------------------------------------------------
  if (phase !== "idle") {
    let phaseTitle = "ПОДГОТОВКА";
    let phaseColor = "#f0932b";
    let subText = "Приготовься к первому упражнению";

    if (phase === "work") {
      phaseTitle = `РАБОТА: ${currentExercise?.name || ""}`;
      phaseColor = "#00ff15";
      subText = `Круг ${currentRound} из ${config.roundsCount} • Упражнение ${currentExerciseIndex + 1}/${config.exercises.length}`;
    } else if (phase === "rest") {
      phaseTitle = "ПЕРЕДЫШКА";
      phaseColor = "#3498db";
      const nextEx = config.exercises[currentExerciseIndex + 1];
      subText = nextEx ? `Дальше: ${nextEx.name}` : "Конец круга";
    } else if (phase === "round_rest") {
      phaseTitle = "ОТДЫХ МЕЖДУ КРУГАМИ";
      phaseColor = "#e056fd";
      subText = `Глоток воды. Впереди круг ${currentRound + 1} из ${config.roundsCount}`;
    } else if (phase === "finished") {
      phaseTitle = "ТРЕНИРОВКА ЗАВЕРШЕНА!";
      phaseColor = "#00ff15";
      subText = "Все круги закрыты.";
    }

    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#060608", padding: "20px", color: "#ddd", fontFamily: "monospace", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222", paddingBottom: "12px" }}>
          <div>
            <span style={{ fontSize: "14px", color: "#666" }}>LOOP TRACKER //</span>
            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginLeft: "8px" }}>
              КРУГ {currentRound} / {config.roundsCount}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <a
              href={config.musicUrl || DEFAULT_MUSIC_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: "#111",
                border: "1px solid #f0932b",
                color: "#f0932b",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              🎵 МУЗОН
            </a>
            <button
              onClick={handleStopWorkout}
              style={{
                backgroundColor: "#2a1212",
                border: "1px solid #ff4d4d",
                color: "#ff4d4d",
                padding: "8px 14px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              ВЫЙТИ
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", margin: "auto 0" }}>
          <div style={{ fontSize: "18px", color: phaseColor, letterSpacing: "1.5px", fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase" }}>
            {phaseTitle}
          </div>

          <div
            style={{
              fontSize: "clamp(80px, 22vw, 150px)",
              fontWeight: "bold",
              color: phaseColor,
              lineHeight: "1",
              fontFamily: "monospace",
              textShadow: `0 0 30px ${phaseColor}44`,
            }}
          >
            {secondsLeft}s
          </div>

          <div style={{ fontSize: "16px", color: "#aaa", marginTop: "16px", maxWidth: "560px", margin: "16px auto 0 auto", lineHeight: "1.4" }}>
            {subText}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "14px", borderTop: "1px solid #222", paddingTop: "16px" }}>
          {phase !== "finished" ? (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  backgroundColor: isPaused ? "#00ff15" : "#1a1a1a",
                  color: isPaused ? "#000" : "#fff",
                  border: "1px solid #333",
                  padding: "12px 28px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}
              >
                {isPaused ? "▶ ПРОДОЛЖИТЬ" : "❚❚ ПАУЗА"}
              </button>

              <button
                onClick={handlePhaseTransition}
                style={{
                  backgroundColor: "#111",
                  border: "1px solid #444",
                  color: "#aaa",
                  padding: "12px 22px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}
              >
                ПРОПУСТИТЬ &rarr;
              </button>
            </>
          ) : (
            <button
              onClick={() => setPhase("idle")}
              style={{
                backgroundColor: "#00ff15",
                color: "#000",
                border: "none",
                padding: "14px 32px",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              ЗАКРЫТЬ
            </button>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ЭКРАН 2: РЕДАКТОР С ЧИСТЫМИ ЧИСЛОВЫМИ ИНПУТАМИ БЕЗ СТРЕЛОК
  // --------------------------------------------------------------------------
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", padding: "16px", color: "#ddd", fontFamily: "monospace" }}>
      {/* Скрытие спиннеров на всех устройствах */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>

      {/* Шапка */}
      <div style={{ maxWidth: "900px", margin: "0 auto 14px auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a1a1a", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* <Link to="/" style={{ color: "#777", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>&larr; ДАШБОРД</Link> */}
          <span style={{ color: "#00ff15", fontWeight: "bold", fontSize: "16px" }}>
            LOOP ТРЕНИРОВКА
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <a
            href={config.musicUrl || DEFAULT_MUSIC_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: "#111",
              border: "1px solid #f0932b",
              color: "#f0932b",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            🎵 МУЗОН
          </a>
          <button
            onClick={() => setShowMusicEdit(!showMusicEdit)}
            style={{
              backgroundColor: "#111",
              border: "1px solid #333",
              color: "#888",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ✎
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Инпут ссылки на музыку */}
        {showMusicEdit && (
          <div style={{ backgroundColor: "#111", border: "1px solid #f0932b55", borderRadius: "6px", padding: "10px 12px", marginBottom: "12px", display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Вставь ссылку на YouTube плейлист..."
              value={musicInput}
              onChange={(e) => setMusicInput(e.target.value)}
              style={{ flex: 1, backgroundColor: "#161616", border: "1px solid #333", color: "#fff", padding: "8px 12px", borderRadius: "4px", fontFamily: "monospace", fontSize: "14px" }}
            />
            <button
              onClick={handleSaveMusicUrl}
              style={{ backgroundColor: "#f0932b", color: "#000", border: "none", padding: "8px 16px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", borderRadius: "4px" }}
            >
              СОХРАНИТЬ
            </button>
          </div>
        )}

        {/* Панель настроек параметров тренировки */}
        <div
          style={{
            backgroundColor: "#0d0d0d",
            border: "1px solid #1f1f1f",
            borderRadius: "6px",
            padding: "12px 16px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "#888", fontWeight: "bold" }}>КРУГОВ:</span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                max={20}
                value={config.roundsCount || ""}
                onChange={(e) =>
                  saveToLocalStorage({
                    ...config,
                    roundsCount: parseSafeInt(e.target.value, 1),
                  })
                }
                style={{ width: "48px", padding: "5px 4px", backgroundColor: "#141414", border: "1px solid #333", color: "#00ff15", fontWeight: "bold", borderRadius: "4px", fontFamily: "monospace", fontSize: "15px", textAlign: "center" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "#888", fontWeight: "bold" }}>ОТДЫХ КРУГА:</span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                value={config.restBetweenRoundsSec ?? ""}
                onChange={(e) =>
                  saveToLocalStorage({
                    ...config,
                    restBetweenRoundsSec: parseSafeInt(e.target.value, 0),
                  })
                }
                style={{ width: "54px", padding: "5px 4px", backgroundColor: "#141414", border: "1px solid #333", color: "#3498db", fontWeight: "bold", borderRadius: "4px", fontFamily: "monospace", fontSize: "15px", textAlign: "center" }}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>сек</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "#888", fontWeight: "bold" }}>СТАРТ:</span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                value={config.prepareSec ?? ""}
                onChange={(e) =>
                  saveToLocalStorage({
                    ...config,
                    prepareSec: parseSafeInt(e.target.value, 0),
                  })
                }
                style={{ width: "54px", padding: "5px 4px", backgroundColor: "#141414", border: "1px solid #333", color: "#f0932b", fontWeight: "bold", borderRadius: "4px", fontFamily: "monospace", fontSize: "15px", textAlign: "center" }}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>сек</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleAddExercise}
              style={{
                backgroundColor: "#161616",
                border: "1px solid #00ff1566",
                color: "#00ff15",
                padding: "8px 14px",
                borderRadius: "4px",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              + СТРОКА
            </button>

            <button
              onClick={handleStartWorkout}
              disabled={!isWorkoutValid}
              style={{
                backgroundColor: isWorkoutValid ? "#00ff15" : "#222",
                color: isWorkoutValid ? "#000" : "#666",
                border: "none",
                borderRadius: "4px",
                padding: "8px 18px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: isWorkoutValid ? "pointer" : "not-allowed",
                fontFamily: "monospace",
                boxShadow: isWorkoutValid ? "0 0 12px rgba(0, 255, 21, 0.25)" : "none",
              }}
            >
              ▶ СТАРТ ({config.roundsCount} КР)
            </button>
          </div>
        </div>

        {/* Список упражнений */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {config.exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              style={{
                backgroundColor: "#0c0c0e",
                border: "1px solid #1c1f26",
                borderRadius: "5px",
                padding: "6px 12px",
                display: "grid",
                gridTemplateColumns: "30px 1fr 110px 110px 28px",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#555", fontWeight: "bold" }}>
                #{index + 1}
              </span>

              <input
                type="text"
                value={exercise.name}
                placeholder="Название упражнения..."
                onChange={(e) => handleExerciseChange(exercise.id, "name", e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid #252830",
                  color: "#fff",
                  padding: "6px 8px",
                  fontFamily: "monospace",
                  fontSize: "15px",
                  width: "100%",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              {/* УСИЛИЕ */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1}
                  value={exercise.workSec || ""}
                  onChange={(e) => handleExerciseChange(exercise.id, "workSec", e.target.value)}
                  style={{
                    backgroundColor: "#141416",
                    border: `1px solid ${exercise.workSec > 0 ? "#00ff1544" : "#ff4d4d"}`,
                    color: exercise.workSec > 0 ? "#00ff15" : "#ff4d4d",
                    padding: "5px 4px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "15px",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "48px",
                    boxSizing: "border-box",
                  }}
                  title="Время усилия в секундах"
                />
                <span style={{ fontSize: "11px", color: "#777", fontWeight: "bold" }}>УСИЛИЕ</span>
              </div>

              {/* ОТДЫХ */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={0}
                  value={exercise.restSec ?? ""}
                  onChange={(e) => handleExerciseChange(exercise.id, "restSec", e.target.value)}
                  style={{
                    backgroundColor: "#141416",
                    border: "1px solid #3498db44",
                    color: "#3498db",
                    padding: "5px 4px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "15px",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "48px",
                    boxSizing: "border-box",
                  }}
                  title="Время отдыха в секундах"
                />
                <span style={{ fontSize: "11px", color: "#777", fontWeight: "bold" }}>ОТДЫХ</span>
              </div>

              <button
                onClick={() => handleRemoveExercise(exercise.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "0 4px",
                  textAlign: "center",
                }}
                title="Удалить строку"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoopWorkoutPage;
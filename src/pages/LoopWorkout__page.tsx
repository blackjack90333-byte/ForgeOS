// src/pages/LoopWorkout__page.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LoopWorkoutConfig, WorkoutExerciseItem } from "../types";

const LOCAL_STORAGE_KEY = "forgeos_loop_workout_config";
const DEFAULT_MUSIC_URL = "https://youtu.be/nH3XHIgkN8w?si=FBPLwITFcAEimdTQ";
const FIGHT_SOUND_URL = "/sound/drum_fight.mp3";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Инициализация аудиофайла drum_fight.mp3
  useEffect(() => {
    const audio = new Audio(FIGHT_SOUND_URL);
    audio.preload = "auto";
    audioRef.current = audio;
  }, []);

  const playFightSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Автовоспроизведение звука заблокировано браузером:", err);
      });
    }
  };

  const saveToLocalStorage = (newConfig: LoopWorkoutConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error("Ошибка сохранения в localStorage", e);
    }
  };

  // Запуск звука за 3 секунды до конца текущей фазы
  useEffect(() => {
    if (phase !== "idle" && phase !== "finished" && !isPaused) {
      if (secondsLeft === 3) {
        playFightSound();
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
    } else {
      if (!isLastRound) {
        setPhase("round_rest");
        setSecondsLeft(Number(config.restBetweenRoundsSec) || 60);
      } else {
        setPhase("finished");
        setSecondsLeft(0);
      }
    }
  };

  const isWorkoutValid =
    config.exercises.length > 0 &&
    config.roundsCount > 0 &&
    config.exercises.every((ex) => ex.workSec > 0);

  const handleStartWorkout = () => {
    if (!isWorkoutValid) {
      alert("Заполните корректное время нагрузки для всех упражнений!");
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
  // ЭКРАН 1: РАННЕР (ГИГАНТСКИЙ ШРИФТ ДЛЯ ПРОСМОТРА С 5 МЕТРОВ)
  // --------------------------------------------------------------------------
  if (phase !== "idle") {
    let phaseBadge = "ПОДГОТОВКА";
    let phaseColor = "#f0932b";
    let bigExerciseTitle = "ГОТОВНОСТЬ К СТАРТУ";
    let nextInfo = config.exercises[0]?.name ? `Первое: ${config.exercises[0].name}` : "";

    if (phase === "work") {
      phaseBadge = "РАБОТА // ВЫЖИМАЙ";
      phaseColor = "#00ff15";
      bigExerciseTitle = currentExercise?.name || "Упражнение";
      const nextEx = config.exercises[currentExerciseIndex + 1];
      nextInfo = nextEx
        ? `Дальше: ${nextEx.name}`
        : currentRound < config.roundsCount
        ? `Дальше: Отдых между кругами (${config.restBetweenRoundsSec}с)`
        : "Дальше: Финал тренировки!";
    } else if (phase === "rest") {
      phaseBadge = "ПЕРЕДЫШКА";
      phaseColor = "#3498db";
      const nextEx = config.exercises[currentExerciseIndex + 1];
      bigExerciseTitle = nextEx ? `ДАЛЬШЕ: ${nextEx.name}` : "КОНЕЦ КРУГА";
      nextInfo = `Восстанови дыхание перед ${nextEx ? nextEx.name : "отдыхом"}`;
    } else if (phase === "round_rest") {
      phaseBadge = "ОТДЫХ МЕЖДУ КРУГАМИ";
      phaseColor = "#e056fd";
      bigExerciseTitle = `ГЛОТОК ВОДЫ // КРУГ ${currentRound} ЗАКРЫТ`;
      nextInfo = `Следующий круг: ${currentRound + 1} из ${config.roundsCount}`;
    } else if (phase === "finished") {
      phaseBadge = "ПОБЕДА";
      phaseColor = "#00ff15";
      bigExerciseTitle = "ТРЕНИРОВКА ЗАКРЫТА!";
      nextInfo = `Все ${config.roundsCount} кругов выполнены. Форма держится.`;
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#050608",
          padding: "20px 24px",
          color: "#fff",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Верхняя статусная панель */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #1a202c",
            paddingBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "26px",
                fontWeight: "900",
                color: "#fff",
                letterSpacing: "1px",
              }}
            >
              КРУГ <span style={{ color: "#00ff15" }}>{currentRound}</span> / {config.roundsCount}
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#888",
              }}
            >
              ({currentExerciseIndex + 1}/{config.exercises.length})
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <a
              href={config.musicUrl || DEFAULT_MUSIC_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: "#161b22",
                border: "2px solid #f0932b",
                color: "#f0932b",
                textDecoration: "none",
                padding: "10px 18px",
                borderRadius: "6px",
                fontSize: "18px",
                fontWeight: "900",
                letterSpacing: "1px",
              }}
            >
              🎵 МУЗОН
            </a>
            <button
              onClick={handleStopWorkout}
              style={{
                backgroundColor: "#2a1212",
                border: "2px solid #ff4d4d",
                color: "#ff4d4d",
                padding: "10px 18px",
                borderRadius: "6px",
                fontSize: "18px",
                fontWeight: "900",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              ВЫЙТИ
            </button>
          </div>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ЗОНА: БОЛЬШОЙ ТЕКСТ И ЦИФРЫ ДЛЯ ДИСТАНЦИИ В 5 МЕТРОВ */}
        <div style={{ textAlign: "center", margin: "auto 0", padding: "10px 0" }}>
          {/* Бейдж фазы */}
          <div
            style={{
              display: "inline-block",
              fontSize: "22px",
              color: phaseColor,
              backgroundColor: `${phaseColor}18`,
              border: `2px solid ${phaseColor}`,
              padding: "6px 20px",
              borderRadius: "6px",
              letterSpacing: "2px",
              fontWeight: "900",
              marginBottom: "20px",
              textTransform: "uppercase",
            }}
          >
            {phaseBadge}
          </div>

          {/* ГИГАНТСКОЕ НАЗВАНИЕ УПРАЖНЕНИЯ */}
          <div
            style={{
              fontSize: "clamp(34px, 5.5vw, 68px)",
              fontWeight: "900",
              color: "#fff",
              lineHeight: "1.15",
              letterSpacing: "0.5px",
              maxWidth: "1100px",
              margin: "0 auto 16px auto",
              textShadow: "0 2px 14px rgba(0,0,0,0.8)",
              wordBreak: "break-word",
            }}
          >
            {bigExerciseTitle}
          </div>

          {/* ГИГАНТСКИЙ ТАЙМЕР */}
          <div
            style={{
              fontSize: "clamp(100px, 24vw, 190px)",
              fontWeight: "900",
              color: phaseColor,
              lineHeight: "0.95",
              fontFamily: "monospace",
              textShadow: `0 0 40px ${phaseColor}66`,
              margin: "10px 0",
              userSelect: "none",
            }}
          >
            {secondsLeft}s
          </div>

          {/* КРУПНАЯ СТРОКА: ЧТО БУДЕТ ДАЛЬШЕ */}
          <div
            style={{
              fontSize: "clamp(20px, 2.8vw, 32px)",
              fontWeight: "bold",
              color: "#94a3b8",
              marginTop: "16px",
              lineHeight: "1.3",
            }}
          >
            {nextInfo}
          </div>
        </div>

        {/* НИЖНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            borderTop: "2px solid #1a202c",
            paddingTop: "20px",
          }}
        >
          {phase !== "finished" ? (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  backgroundColor: isPaused ? "#00ff15" : "#1a1f2c",
                  color: isPaused ? "#000" : "#fff",
                  border: "2px solid #334155",
                  padding: "16px 36px",
                  borderRadius: "8px",
                  fontSize: "20px",
                  fontWeight: "900",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                }}
              >
                {isPaused ? "▶ ПРОДОЛЖИТЬ" : "❚❚ ПАУЗА"}
              </button>

              <button
                onClick={handlePhaseTransition}
                style={{
                  backgroundColor: "#161b22",
                  border: "2px solid #475569",
                  color: "#cbd5e1",
                  padding: "16px 28px",
                  borderRadius: "8px",
                  fontSize: "20px",
                  fontWeight: "900",
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
                padding: "18px 48px",
                borderRadius: "8px",
                fontSize: "22px",
                fontWeight: "900",
                cursor: "pointer",
                fontFamily: "monospace",
                letterSpacing: "1px",
              }}
            >
              ВЫЙТИ В РЕДАКТОР
            </button>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ЭКРАН 2: АДАПТИВНЫЙ РЕДАКТОР (ТАКЖЕ С УВЕЛИЧЕННЫМИ ШРИФТАМИ)
  // --------------------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#080808",
        padding: "16px 12px",
        color: "#ddd",
        fontFamily: "monospace",
        fontSize: "16px",
      }}
    >
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
      <div
        style={{
          maxWidth: "920px",
          margin: "0 auto 14px auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1f2533",
          paddingBottom: "12px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/" style={{ color: "#666", textDecoration: "none", fontSize: "16px" }}>
            &larr; ДАШБОРД
          </Link>
          <span style={{ color: "#00ff15", fontWeight: "900", fontSize: "18px" }}>
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
              padding: "8px 14px",
              borderRadius: "4px",
              fontSize: "15px",
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
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "15px",
              cursor: "pointer",
            }}
            title="Изменить ссылку на музыку"
          >
            ✎
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        {/* Инпут ссылки на музыку */}
        {showMusicEdit && (
          <div
            style={{
              backgroundColor: "#111",
              border: "1px solid #f0932b55",
              borderRadius: "6px",
              padding: "10px 12px",
              marginBottom: "12px",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="YouTube URL..."
              value={musicInput}
              onChange={(e) => setMusicInput(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: "#161616",
                border: "1px solid #333",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "15px",
              }}
            />
            <button
              onClick={handleSaveMusicUrl}
              style={{
                backgroundColor: "#f0932b",
                color: "#000",
                border: "none",
                padding: "8px 16px",
                fontWeight: "bold",
                fontSize: "15px",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              OK
            </button>
          </div>
        )}

        {/* Панель настроек тренировки */}
        <div
          style={{
            backgroundColor: "#0d0f14",
            border: "1px solid #1c2230",
            borderRadius: "6px",
            padding: "14px 16px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "15px", color: "#888", fontWeight: "bold" }}>КРУГОВ:</span>
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
                style={{
                  width: "50px",
                  padding: "6px",
                  backgroundColor: "#141722",
                  border: "1px solid #333",
                  color: "#00ff15",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "15px", color: "#888", fontWeight: "bold" }}>ОТДЫХ:</span>
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
                style={{
                  width: "56px",
                  padding: "6px",
                  backgroundColor: "#141722",
                  border: "1px solid #333",
                  color: "#3498db",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              />
              <span style={{ fontSize: "15px", color: "#666" }}>сек</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "15px", color: "#888", fontWeight: "bold" }}>СТАРТ:</span>
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
                style={{
                  width: "56px",
                  padding: "6px",
                  backgroundColor: "#141722",
                  border: "1px solid #333",
                  color: "#f0932b",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              />
              <span style={{ fontSize: "15px", color: "#666" }}>сек</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "space-between" }}>
            <button
              onClick={handleAddExercise}
              style={{
                flex: 1,
                backgroundColor: "#12151d",
                border: "1px solid #00ff1566",
                color: "#00ff15",
                padding: "10px",
                borderRadius: "4px",
                fontSize: "15px",
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
                flex: 2,
                backgroundColor: isWorkoutValid ? "#00ff15" : "#222",
                color: isWorkoutValid ? "#000" : "#666",
                border: "none",
                borderRadius: "4px",
                padding: "10px 14px",
                fontSize: "16px",
                fontWeight: "900",
                cursor: isWorkoutValid ? "pointer" : "not-allowed",
                fontFamily: "monospace",
                letterSpacing: "1px",
                boxShadow: isWorkoutValid ? "0 0 16px rgba(0, 255, 21, 0.3)" : "none",
              }}
            >
              ▶ СТАРТ ({config.roundsCount} КР)
            </button>
          </div>
        </div>

        {/* Шапка колонок таблицы */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "30px 1fr 68px 68px 28px",
            alignItems: "center",
            gap: "8px",
            padding: "6px 10px",
            fontSize: "14px",
            color: "#666",
            fontWeight: "bold",
          }}
        >
          <span>#</span>
          <span>УПРАЖНЕНИЕ</span>
          <span style={{ textAlign: "center", color: "#00ff15" }}>УСИЛИЕ</span>
          <span style={{ textAlign: "center", color: "#3498db" }}>ОТДЫХ</span>
          <span></span>
        </div>

        {/* Список строк упражнений */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {config.exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              style={{
                backgroundColor: "#0d0f14",
                border: "1px solid #1c2230",
                borderRadius: "4px",
                padding: "6px 10px",
                display: "grid",
                gridTemplateColumns: "30px 1fr 68px 68px 28px",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "15px", color: "#555", fontWeight: "bold" }}>
                {index + 1}
              </span>

              <input
                type="text"
                value={exercise.name}
                placeholder="Упражнение..."
                onChange={(e) => handleExerciseChange(exercise.id, "name", e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid #222",
                  color: "#fff",
                  padding: "6px 4px",
                  fontFamily: "monospace",
                  fontSize: "15px",
                  fontWeight: "bold",
                  width: "100%",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              {/* УСИЛИЕ */}
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                value={exercise.workSec || ""}
                onChange={(e) => handleExerciseChange(exercise.id, "workSec", e.target.value)}
                style={{
                  backgroundColor: "#141722",
                  border: `1px solid ${exercise.workSec > 0 ? "#00ff1544" : "#ff4d4d"}`,
                  color: exercise.workSec > 0 ? "#00ff15" : "#ff4d4d",
                  padding: "8px 2px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "15px",
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                title="Усилие (сек)"
              />

              {/* ОТДЫХ */}
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                value={exercise.restSec ?? ""}
                onChange={(e) => handleExerciseChange(exercise.id, "restSec", e.target.value)}
                style={{
                  backgroundColor: "#141722",
                  border: "1px solid #3498db44",
                  color: "#3498db",
                  padding: "8px 2px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "15px",
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                title="Отдых (сек)"
              />

              <button
                onClick={() => handleRemoveExercise(exercise.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#555",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "center",
                }}
                title="Удалить"
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
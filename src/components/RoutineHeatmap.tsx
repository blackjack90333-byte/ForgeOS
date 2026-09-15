// src/components/RoutineHeatmap.tsx
import React, { useMemo, useState, useRef, useEffect } from "react";

export interface RoutineHeatmapProps {
  /** Даты активности в формате "YYYY-MM-DD" */
  activeDates: string[];
  /** Количество строк (высота) - по умолчанию 3 */
  rowsCount?: number;
  /** Количество колонок (в ширину) - по умолчанию 36 (под всю ширину экрана) */
  colsCount?: number;
  /** Размер квадратика в px */
  squareSize?: number;
  /** Цвет активного дня */
  activeColor?: string;
  /** Цвет пустого дня */
  emptyColor?: string;
  /** Название цели для тултипа */
  label?: string;
}

const formatDateToKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const RoutineHeatmap: React.FC<RoutineHeatmapProps> = ({
  activeDates = [],
  rowsCount = 3,
  colsCount = 36,
  squareSize = 13,
  activeColor = "#00ff15",
  emptyColor = "#12151d",
  label = "РУТИНА ДИСЦИПЛИНЫ",
}) => {
  const activeSet = useMemo(() => new Set(activeDates), [activeDates]);
  const todayKey = useMemo(() => formatDateToKey(new Date()), []);
  const isTodayActive = activeSet.has(todayKey);

  // Управление воспроизведением речи Арсена
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/sound/motivation_arsen.mp3");
    audioRef.current = audio;

    const handleEnded = () => {
      setIsPlayingAudio(false);
      audio.currentTime = 0;
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch((err) => {
          console.error("Ошибка воспроизведения аудио:", err);
          setIsPlayingAudio(false);
        });
    }
  };

  // Генерируем матрицу дней назад (справа внизу - сегодня)
  const totalCells = rowsCount * colsCount;

  const matrix = useMemo(() => {
    const cells: { dateKey: string; isActive: boolean; isToday: boolean }[] = [];
    const now = new Date();

    for (let i = totalCells - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDateToKey(d);
      cells.push({
        dateKey: key,
        isActive: activeSet.has(key),
        isToday: key === todayKey,
      });
    }

    // Раскладываем по колонкам
    const columns: typeof cells[] = [];
    for (let c = 0; c < colsCount; c++) {
      columns.push(cells.slice(c * rowsCount, (c + 1) * rowsCount));
    }
    return columns;
  }, [totalCells, colsCount, rowsCount, activeSet, todayKey]);

  return (
    <div
      style={{
        backgroundColor: "#0a0c10",
        border: "1px solid #1c202a",
        borderLeft: `3px solid ${isTodayActive ? activeColor : "#f0932b"}`,
        borderRadius: "6px",
        padding: "10px 14px",
        marginBottom: "16px",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "auto",
      }}
    >
      <style>{`
        @keyframes subtleGlimmer {
          0%, 90%, 100% {
            filter: brightness(1) drop-shadow(0 0 0px transparent);
          }
          95% {
            filter: brightness(1.7) drop-shadow(0 0 6px ${activeColor});
          }
        }
        .heatmap_active_cell {
          animation: subtleGlimmer 7s infinite ease-in-out;
        }
        .heatmap_active_cell:nth-child(2n) {
          animation-delay: 2.3s;
        }
        .heatmap_active_cell:nth-child(3n) {
          animation-delay: 4.8s;
        }
        .heatmap_cell_hover:hover {
          transform: scale(1.25);
          z-index: 5;
          filter: brightness(1.5);
        }
        @keyframes audioPulse {
          0%, 100% {
            box-shadow: 0 0 4px rgba(255, 77, 77, 0.4);
          }
          50% {
            box-shadow: 0 0 12px rgba(255, 77, 77, 0.9);
          }
        }
        .audio_playing_btn {
          animation: audioPulse 1.2s infinite ease-in-out;
        }
      `}</style>

      {/* Верхняя статусная строчка */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          fontFamily: "monospace",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#8a91a0", letterSpacing: "1px", fontWeight: "bold" }}>
            ДИСЦИПЛИНАРНЫЙ HEAT MAP // {label}
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "1px 6px",
              borderRadius: "3px",
              backgroundColor: isTodayActive ? "#00ff1520" : "#2a1b10",
              color: isTodayActive ? activeColor : "#f0932b",
              border: `1px solid ${isTodayActive ? activeColor : "#f0932b55"}`,
              fontWeight: "bold",
            }}
          >
            {isTodayActive ? "СЕГОДНЯ: В ДЕЛЕ ⚡" : "СЕГОДНЯ: ОЖИДАЕТ СТАРТА"}
          </span>

          {/* Кнопка мотивационной аудиоречи Арсена */}
          <button
            onClick={handleToggleAudio}
            className={isPlayingAudio ? "audio_playing_btn" : ""}
            style={{
              backgroundColor: isPlayingAudio ? "#2a1212" : "#0d1f12",
              border: `1px solid ${isPlayingAudio ? "#ff4d4d" : "#00ff15"}`,
              color: isPlayingAudio ? "#ff4d4d" : "#00ff15",
              padding: "2px 8px",
              borderRadius: "3px",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: "monospace",
              userSelect: "none",
              transition: "all 0.15s ease",
            }}
            title={isPlayingAudio ? "Остановить и сбросить" : "Слушать речь Арсена"}
          >
            <span style={{ fontSize: "11px" }}>{isPlayingAudio ? "■" : "▶"}</span>
            <span>{isPlayingAudio ? "СТОП" : "РЕЧЬ АРСЕНА"}</span>
          </button>
        </div>

        <div style={{ fontSize: "11px", color: "#666" }}>
          Активных дней: <strong style={{ color: activeColor }}>{activeDates.length}</strong>
        </div>
      </div>

      {/* Сетка квадратов */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          justifyContent: "space-between",
          minWidth: `${colsCount * (squareSize + 4)}px`,
        }}
      >
        {matrix.map((col, colIdx) => (
          <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {col.map((cell) => {
              const bg = cell.isActive ? activeColor : emptyColor;
              const border = cell.isToday
                ? `1px solid ${activeColor}`
                : cell.isActive
                ? `1px solid ${activeColor}55`
                : "1px solid #1a1e28";

              return (
                <div
                  key={cell.dateKey}
                  title={`${cell.dateKey}: ${cell.isActive ? "Рутина выполнена" : "Пропуск"}${cell.isToday ? " (Сегодня)" : ""}`}
                  className={`heatmap_cell_hover ${cell.isActive ? "heatmap_active_cell" : ""}`}
                  style={{
                    width: `${squareSize}px`,
                    height: `${squareSize}px`,
                    backgroundColor: bg,
                    border,
                    borderRadius: "2px",
                    boxSizing: "border-box",
                    boxShadow: cell.isToday
                      ? `0 0 6px ${activeColor}88`
                      : cell.isActive
                      ? `0 0 3px ${activeColor}44`
                      : "none",
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutineHeatmap;
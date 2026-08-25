// src/pages/Body__page.tsx
import React, { useEffect, useState, useRef } from "react";
import { useAppSelector } from "../redux/store";
import { getUserData, addBodyMetric, removeBodyMetric } from "../services/firebase";
import { BodyMetric } from "../types";
import ActionButton from "../components/ActionButton"; // <-- ИМПОРТ КНОПКИ
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ForgeLoader from "../components/ForgeLoader";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface SkufCalculation {
  index: number;
  fatPercent: number;
  lbm: number;
  ffmi: number;
}

export const calculateAdvancedSkufIndex = (
  weight: number,
  caliperMm: number = 10,
  heightCm: number = 175
): SkufCalculation => {
  const validHeight = heightCm > 0 ? heightCm : 175;

  const fatPercent = Math.max(5, Math.min(45, 4 + caliperMm * 0.9));
  const fatMass = weight * (fatPercent / 100);
  const lbm = weight - fatMass;

  const heightM = validHeight / 100;
  const ffmi = lbm / (heightM * heightM);

  const fatScore = (fatPercent - 8) * 5.5;
  const muscleBonus = Math.max(0, (ffmi - 18) * 4);

  const rawIndex = Math.round(fatScore - muscleBonus);
  const index = Math.min(100, Math.max(0, rawIndex));

  return {
    index,
    fatPercent: Math.round(fatPercent * 10) / 10,
    lbm: Math.round(lbm * 10) / 10,
    ffmi: Math.round(ffmi * 10) / 10,
  };
};

const getSkufStatus = (index: number) => {
  if (index <= 20) {
    return { title: "Гигачад / Сухой атлет", color: "#00ff15", badge: "⚡", bg: "#0d2612" };
  }
  if (index <= 45) {
    return { title: "Рабочая форма (Фокус)", color: "#3498db", badge: "⚔️", bg: "#0d1b26" };
  }
  if (index <= 70) {
    return { title: "Зона риска / Заплыв", color: "#f1c40f", badge: "⚠️", bg: "#26220d" };
  }
  return { title: "Скуф-мод", color: "#ff4d4d", badge: "🛑", bg: "#260d0d" };
};

const SOUND_TRACKS = [
  "/sound/ne_zabrasyvay_trenirovky.mp3",
  "/sound/ne_zabrasyvay_trenirovky_2.mp3",
];

const BodyPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Поля формы замера
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [height, setHeight] = useState<string>("163");
  const [weight, setWeight] = useState<string>("");
  const [caliper, setCaliper] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef<boolean>(false);

  const playRandomSound = () => {
    try {
      const randomIndex = Math.floor(Math.random() * SOUND_TRACKS.length);
      const chosenTrack = SOUND_TRACKS[randomIndex];

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(chosenTrack);
      audio.volume = 0.85;
      audioRef.current = audio;

      audio.play().then(() => {
        hasPlayedRef.current = true;
      }).catch((e) => {
        console.log("Автоплей ожидает взаимодействия пользователя:", e);
      });
    } catch (err) {
      console.error("Ошибка аудио:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasPlayedRef.current) {
        playRandomSound();
      }
    }, 1000);

    const handleFirstUserInteraction = () => {
      if (!hasPlayedRef.current) {
        playRandomSound();
      }
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchstart", handleFirstUserInteraction);
    };

    window.addEventListener("click", handleFirstUserInteraction);
    window.addEventListener("touchstart", handleFirstUserInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchstart", handleFirstUserInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      try {
        const data = await getUserData(user.uid);
        if (data && (data as any).body_metrics) {
          const sorted = [...(data as any).body_metrics].sort((a, b) => a.timestamp - b.timestamp);
          setMetrics(sorted);
          if (sorted.length > 0 && sorted[sorted.length - 1].height) {
            setHeight(String(sorted[sorted.length - 1].height));
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных тела:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user?.uid]);

  // Асинхронная отправка данных
  const handleAddMetric = async () => {
    if (!user?.uid || !weight || !height) return;

    const newMetric: BodyMetric = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      date,
      height: parseFloat(height),
      weight: parseFloat(weight),
      caliper: caliper ? parseFloat(caliper) : undefined,
      note: note.trim(),
      timestamp: new Date(date).getTime() || Date.now(),
    };

    await addBodyMetric(user.uid, newMetric);
    const updated = [...metrics, newMetric].sort((a, b) => a.timestamp - b.timestamp);
    setMetrics(updated);
    setWeight("");
    setCaliper("");
    setNote("");
  };

  const handleDeleteMetric = async (metric: BodyMetric) => {
    if (!user?.uid) return;
    const isConfirmed = window.confirm(`Удалить замер за ${metric.date}?`);
    if (!isConfirmed) return;

    await removeBodyMetric(user.uid, metric);
    setMetrics((prev) => prev.filter((m) => m.id !== metric.id));
  };

  const latestMetric = metrics[metrics.length - 1];
  const currentHeight = latestMetric?.height || parseFloat(height) || 163;
  const currentWeight = latestMetric?.weight || 74;
  const currentCaliper = latestMetric?.caliper || 18;

  const currentCalc = calculateAdvancedSkufIndex(currentWeight, currentCaliper, currentHeight);
  const status = getSkufStatus(currentCalc.index);

  const chartData = {
    labels: metrics.map((m) => m.date),
    datasets: [
      {
        label: "Скуфометр (%)",
        data: metrics.map(
          (m) => calculateAdvancedSkufIndex(m.weight, m.caliper || 10, m.height || 163).index
        ),
        borderColor: status.color,
        backgroundColor: "rgba(0, 255, 21, 0.08)",
        fill: true,
        pointBackgroundColor: status.color,
        pointBorderColor: "#000",
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.25,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Скуфометр: ${context.raw}%`,
          afterBody: (context: any) => {
            const rawIndex = context[0]?.raw;
            if (rawIndex !== undefined) {
              return `Статус: ${getSkufStatus(Number(rawIndex)).title}`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#888" },
        grid: { color: "#1a1a1a" },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: status.color,
          callback: (value: number) => `${value}%`,
        },
        grid: { color: "#1a1a1a" },
        title: {
          display: true,
          text: "Индекс Скуфа (%)",
          color: status.color,
        },
      },
    },
  };

  // if (isLoading) {
  //   return <div style={{ padding: "20px", color: "#888" }}>Загрузка метрик тела...</div>;
  // }
  if (isLoading) {
  return (
    <ForgeLoader
      title="КУЗНИЦА ТЕЛА // КАЛИБРОВКА"
      logs={["SCANNING_METRICS...", "PARSING_CALIPER...", "CALCULATING_SKUF_INDEX..."]}
    />
  );
}

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h1 style={{ margin: 0 }}>Кузница Тела АНТИ-СКУФ</h1>
        <button
          onClick={playRandomSound}
          title="Слушать мотивацию Диего"
          style={{
            backgroundColor: "#161616",
            border: "1px solid #00ff1544",
            color: "#00ff15",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🔊 Диего: Не забрасывай!
        </button>
      </div>

      {/* Манифест и формула */}
      <div
        style={{
          backgroundColor: "#0d1a0e",
          border: "1px solid #1c3b20",
          borderLeft: "4px solid #00ff15",
          borderRadius: "8px",
          padding: "16px 20px",
          marginBottom: "25px",
          fontFamily: "monospace",
          color: "#e0e0e0",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#00ff15", letterSpacing: "1px" }}>
          ⚡ СУПЕР-ФОРМУЛА СКУФОМЕТРА [LBM + FFMI + CALIPER]
        </div>
        <p style={{ margin: "6px 0 0 0", fontSize: "14px", lineHeight: "1.5" }}>
          Вычисления идут по спортивной физиологии: замер калипера оценивает реальный % жира, вычитает его и находит чистую мышечную массу (LBM) под указанный рост. Мышцы сбивают скуф-индекс вниз, лишний жир поднимает вверх.
        </p>
      </div>

      {/* Главная карточка текущего статуса */}
      <div
        style={{
          backgroundColor: status.bg,
          border: `1px solid ${status.color}`,
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "1px" }}>
            Текущий статус формы
          </span>
          <h2 style={{ margin: "4px 0 8px 0", color: status.color, fontSize: "24px" }}>
            {status.badge} {status.title}
          </h2>
          <div style={{ fontSize: "13px", color: "#ddd", display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <span>Рост: <strong style={{ color: "#fff" }}>{currentHeight} см</strong></span>
            <span>Вес: <strong style={{ color: "#fff" }}>{currentWeight} кг</strong></span>
            <span>Складка: <strong style={{ color: "#fff" }}>{currentCaliper} мм</strong></span>
            <span>Жир: <strong style={{ color: "#f1c40f" }}>~{currentCalc.fatPercent}%</strong></span>
            <span>Сухие мышцы: <strong style={{ color: "#3498db" }}>{currentCalc.lbm} кг</strong></span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "12px", color: "#aaa" }}>Скуфометр</span>
          <h1 style={{ margin: "2px 0 0 0", color: status.color, fontSize: "38px" }}>
            {currentCalc.index}%
          </h1>
        </div>
      </div>

      {/* График динамики */}
      {metrics.length > 1 && (
        <div style={{ backgroundColor: "#111", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>Динамика Скуфометра</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Форма фиксации замера с ActionButton */}
      <div
        style={{
          backgroundColor: "#141414",
          border: "1px solid #222",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>Зафиксировать замер</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>Дата</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>
              Рост (см) *
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="163"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>
              Вес (кг) *
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="74.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>
              Складка калипера (мм)
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="18"
              value={caliper}
              onChange={(e) => setCaliper(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>
              Заметка / Тренировка
            </label>
            <input
              type="text"
              placeholder="Турники, дефицит калорий"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* УМНАЯ КНОПКА С МГНОВЕННЫМ ОТКЛИКОМ */}
        <div style={{ marginTop: "15px" }}>
          <ActionButton
            onClick={handleAddMetric}
            loadingText="Синхронизация с базой..."
            successText="✓ Форма зафиксирована!"
            disabled={!weight || !height}
          >
            + Зафиксировать форму
          </ActionButton>
        </div>
      </div>

      {/* Журнал замеров */}
      <div>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>Журнал записей</h3>
        {metrics.length === 0 ? (
          <p style={{ color: "#666" }}>Записей пока нет. Внеси замер роста, веса и калипера.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...metrics].reverse().map((m) => {
              const calc = calculateAdvancedSkufIndex(m.weight, m.caliper || 10, m.height || 163);
              const itemStatus = getSkufStatus(calc.index);
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#111",
                    border: "1px solid #222",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <strong style={{ color: "#00ff15", marginRight: "12px" }}>{m.date}</strong>
                    <span style={{ marginRight: "12px", color: "#aaa" }}>{m.height || 163} см</span>
                    <span style={{ marginRight: "12px" }}>{m.weight} кг</span>
                    {m.caliper && (
                      <span style={{ color: "#f1c40f", marginRight: "12px" }}>{m.caliper} мм ({calc.fatPercent}%)</span>
                    )}
                    <span style={{ color: "#3498db", marginRight: "12px" }}>Мышцы: {calc.lbm} кг</span>
                    <span style={{ color: itemStatus.color, fontSize: "13px", marginRight: "12px" }}>
                      [{calc.index}% {itemStatus.title}]
                    </span>
                    {m.note && <span style={{ color: "#888", fontSize: "13px" }}>({m.note})</span>}
                  </div>
                  <ActionButton
                    onClick={() => handleDeleteMetric(m)}
                    variant="danger"
                    loadingText="Удаление..."
                    successText="✓ Удалено"
                    style={{ padding: "4px 8px", fontSize: "12px" }}
                  >
                    Удалить
                  </ActionButton>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyPage;
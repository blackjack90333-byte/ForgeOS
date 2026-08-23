// src/components/NofapGraph.tsx
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface NofapGraphProps {
  timestamp: number; // nofap_timestamp из Firestore
}


// Гипербола с выходом из минуса (при x=0 -> -50%, при x=5 -> 0%, при x -> inf -> 100%)
const calculatePowerByDays = (days: number): number => {
  if (days < 0) return -50;
  // Смещенная гипербола: на 5-й день дает ровно 0
  const power = 100 - 750 / (days + 5);
  return Math.round(power * 100) / 100;
};

const getRankStatus = (power: number) => {
  if (power >= 85) return { title: "Титан // Нейро-ребут", color: "#e056fd" };
  if (power >= 65) return { title: "Мастер Воли", color: "#f1c40f" };
  if (power >= 40) return { title: "Фокус & Контроль", color: "#3498db" };
  if (power >= 20) return { title: "Всплеск энергии", color: "#00ff15" };
  return { title: "Разгон рецепторов", color: "#888" };
};

export const NofapGraph: React.FC<NofapGraphProps> = ({ timestamp }) => {
  const now = Date.now();
  const currentDiffMs = timestamp > 0 ? Math.max(0, now - timestamp) : 0;
  const currentDaysExact = currentDiffMs / (1000 * 60 * 60 * 24);

  // Точные дни, часы и минуты для подписи
  const daysInt = Math.floor(currentDaysExact);
  const hoursInt = Math.floor((currentDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesInt = Math.floor((currentDiffMs % (1000 * 60)) / 1000);
  const streakText = daysInt > 0 ? `${daysInt}д ${hoursInt}ч ${minutesInt}м` : `${hoursInt}ч ${minutesInt}м`;

  const currentPower = calculatePowerByDays(currentDaysExact);
  const rank = getRankStatus(currentPower);

  // Адаптивная шкала: МИНИМУМ 7 дней
  const maxAxisDays = useMemo(() => {
    if (currentDaysExact <= 5) return 7;
    if (currentDaysExact <= 11) return 14;
    if (currentDaysExact <= 24) return 30;
    if (currentDaysExact <= 50) return 60;
    if (currentDaysExact <= 75) return 90;
    return Math.ceil(currentDaysExact * 1.25);
  }, [currentDaysExact]);

  // Генерируем массив точек СТРОГО от 0 до currentDaysExact
  const userProgressPoints = useMemo(() => {
    if (currentDaysExact <= 0) return [{ x: 0, y: 0 }];

    const count = 30; // плотность линии для идеальной плавности
    const pts = [];

    for (let i = 0; i <= count; i++) {
      const d = (currentDaysExact * i) / count;
      pts.push({
        x: d,
        y: calculatePowerByDays(d),
      });
    }

    return pts;
  }, [currentDaysExact]);

  // Плагин для отрисовки вертикальных линий ключевых рубежей
  const verticalMilestonePlugin = {
    id: "verticalMilestones",
    beforeDraw: (chart: any) => {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.x) return;

      const milestones = [
        { day: 3, label: "⚡ 3 дня (Искра)", color: "rgba(0, 255, 21, 0.4)" },
        { day: 7, label: "🛡️ 7 дней (Воля)", color: "rgba(46, 204, 113, 0.4)" },
        { day: 14, label: "⚔️ 14 дней (Фокус)", color: "rgba(52, 152, 219, 0.4)" },
        { day: 30, label: "👑 30 дней (Монолит)", color: "rgba(241, 196, 15, 0.4)" },
        { day: 60, label: "🏛️ 60 дней", color: "rgba(240, 147, 43, 0.4)" },
        { day: 90, label: "🌌 90 дней (Титан)", color: "rgba(224, 86, 253, 0.4)" },
      ];

      ctx.save();
      ctx.font = "10px monospace";

      milestones.forEach((m) => {
        if (m.day <= maxAxisDays) {
          const x = scales.x.getPixelForValue(m.day);
          if (x >= chartArea.left && x <= chartArea.right) {
            ctx.beginPath();
            ctx.strokeStyle = m.color;
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.moveTo(x, chartArea.top);
            ctx.lineTo(x, chartArea.bottom);
            ctx.stroke();

            // Текстовая подпись рубежа вверху
            ctx.fillStyle = m.color.replace("0.4", "0.85");
            ctx.fillText(m.label, x + 4, chartArea.top + 12);
          }
        }
      });

      ctx.restore();
    },
  };

  const chartData = {
    datasets: [
      {
        label: "Фактический прогресс силы",
        data: userProgressPoints,
        borderColor: "#00ff15",
        backgroundColor: "rgba(0, 255, 21, 0.15)",
        fill: true,
        borderWidth: 3,
        pointRadius: (ctx: any) => (ctx.dataIndex === ctx.dataset.data.length - 1 ? 6 : 0),
        pointHoverRadius: 8,
        pointBackgroundColor: "#00ff15",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        tension: 0.35,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0d0d0d",
        titleColor: "#00ff15",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          title: (items: any) => {
            const dVal = items[0].parsed.x;
            const d = Math.floor(dVal);
            const h = Math.floor((dVal - d) * 24);
            return `Время в пути: ${d}д ${h}ч`;
          },
          label: (context: any) => `Сила & Фокус: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: maxAxisDays, // МИНИМУМ 7 ДНЕЙ
        ticks: {
          color: "#888",
          font: { size: 10 },
          stepSize: maxAxisDays <= 7 ? 1 : maxAxisDays <= 14 ? 2 : 5,
          callback: (val: number) => `День ${val}`,
        },
        grid: {
          color: "#161616",
        },
      },
      y: {
        min: -60, // чтобы было видно нижнюю точку -50%
        max: 100,
        ticks: {
          color: (ctx: any) => (ctx.tick.value < 0 ? "#ff4d4d" : "#00ff15"), // красные цифры в минусе, зеленые в плюсе
          callback: (v: number) => `${v}%`,
          stepSize: 20,
          font: { size: 10 },
        },
        grid: {
          color: (ctx: any) => (ctx.tick.value === 0 ? "#555" : "#181818"), // линия нуля более яркая
          lineWidth: (ctx: any) => (ctx.tick.value === 0 ? 1.5 : 1),
        },
        title: {
          display: true,
          text: "СИЛА И ФОКУС (%)",
          color: "#00ff15",
          font: { size: 11, weight: "bold" },
        },
      },
    },
  };

  return (
    <div
      style={{
        backgroundColor: "#0d0d0d",
        border: "1px solid #222",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "25px",
      }}
    >
      {/* Шапка графика */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {/* <div>
          <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
            Текущий стрик: <strong style={{ color: "#00ff15" }}>{streakText}</strong>
          </span>
          <h3 style={{ margin: "2px 0 0 0", fontSize: "16px", color: "#fff" }}>
            📈 Динамика Силы &amp; Фокуса
          </h3>
        </div> */}

        <div style={{ textAlign: "right" }}>
          {/* <span style={{ fontSize: "11px", color: "#888" }}>Текущий уровень:</span> */}
          <div style={{ fontSize: "14px", fontWeight: "bold", color: rank.color }}>
            {currentPower}% • {rank.title}
          </div>
        </div>
      </div>

      {/* Холст графика */}
      <div style={{ height: "230px", width: "100%", position: "relative" }}>
        <Line data={chartData} options={chartOptions} plugins={[verticalMilestonePlugin]} />
      </div>
    </div>
  );
};

export default NofapGraph;
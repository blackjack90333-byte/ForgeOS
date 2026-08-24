// src/pages/Dashboard__page.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import { getUserData } from "../services/firebase";
import { calculateAdvancedSkufIndex } from "./Body__page";
import { MoneyGoal, EisenhowerTask } from "../types";
import ForgeLoader from "../components/ForgeLoader";

const getNoFapRank = (days: number) => {
  if (days >= 90) return { title: "Титан", color: "#e056fd", badge: "🌌" };
  if (days >= 60) return { title: "Монолит", color: "#f0932b", badge: "🏛️" };
  if (days >= 30) return { title: "Мастер Воли", color: "#f1c40f", badge: "👑" };
  if (days >= 14) return { title: "Адепт", color: "#3498db", badge: "⚔️" };
  if (days >= 7) return { title: "Страж", color: "#2ecc71", badge: "🛡️" };
  if (days >= 3) return { title: "Инициат", color: "#1abc9c", badge: "⚡" };
  return { title: "Новичок", color: "#95a5a6", badge: "🌱" };
};

const calculateLiveTimeDifference = (timestamp: number, now: number): string => {
  if (!timestamp || timestamp === 0) return "0д 0ч 0м 0с";
  const difference = Math.max(0, now - timestamp);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60)) / 1000);
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return `${days}д ${hours}ч ${minutes}м ${seconds}с`;
};

const getSkufStatus = (index: number) => {
  if (index <= 20) return { title: "Сухой атлет", color: "#00ff15", badge: "⚡" };
  if (index <= 45) return { title: "Рабочая форма", color: "#3498db", badge: "⚔️" };
  if (index <= 70) return { title: "Зона риска", color: "#f1c40f", badge: "⚠️" };
  return { title: "Скуф-мод", color: "#ff4d4d", badge: "🛑" };
};

const DashboardPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      if (!user?.uid) return;
      try {
        const userData = await getUserData(user.uid);
        setData(userData);
      } catch (err) {
        console.error("Ошибка загрузки данных дашборда:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [user?.uid]);

  if (isLoading) {
    return <ForgeLoader />;
  }

  // 1. Дисциплина (NoFap)
  const nofapTimestamp = Number(data?.nofap_timestamp) || 0;
  const nofapDays =
    nofapTimestamp > 0
      ? Math.floor((now - nofapTimestamp) / (1000 * 60 * 60 * 24))
      : 0;
  const nofapRank = getNoFapRank(nofapDays);
  const liveTimeStr = calculateLiveTimeDifference(nofapTimestamp, now);

  // 2. Тело & Форма (Body)
  const bodyMetrics = data?.body_metrics || [];
  const latestBody = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1] : null;
  const bodyCalc = latestBody
    ? calculateAdvancedSkufIndex(
        latestBody.weight,
        latestBody.caliper || 10,
        latestBody.height || 163
      )
    : null;
  const bodyStatus = bodyCalc ? getSkufStatus(bodyCalc.index) : null;

  // 3. Финансы (Money)
  const moneySum = data?.money_count?.sum ?? 0;

  let goals: MoneyGoal[] = [];
  if (data?.money_goals) {
    try {
      goals = JSON.parse(data.money_goals);
    } catch {
      goals = [];
    }
  }

  const currentGoal = goals.length > 0 ? goals[0] : null;
  const goalProgress =
    currentGoal && currentGoal.price > 0
      ? Math.min(100, (moneySum / currentGoal.price) * 100)
      : 0;

  // 4. Задачи (TodoList)
  let tasks: EisenhowerTask[] = [];
  if (data?.eisenhower_tasks) {
    try {
      tasks = JSON.parse(data.eisenhower_tasks);
    } catch {
      tasks = [];
    }
  }
  const pendingTasksCount = tasks.filter((t) => t.status !== "done").length;
  const q1Count = tasks.filter((t) => t.quadrant === "q1_urgent_important" && t.status !== "done").length;

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "950px",
        margin: "0 auto",
      }}
    >
      {/* Шапка дашборда */}
      <div style={{ marginBottom: "25px", borderBottom: "1px solid #222", paddingBottom: "15px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", letterSpacing: "1px" }}>
          FORGE<span style={{ color: "#00ff15" }}>OS</span>
        </h1>
        <span style={{ color: "#666", fontSize: "13px", fontFamily: "monospace" }}>
          КЛЮЧЕВАЯ СВОДКА
        </span>
      </div>

      {/* Модули */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* Карточка: Дисциплина */}
        <Link
          to="/nofap_page"
          style={{
            textDecoration: "none",
            backgroundColor: "#111",
            border: `1px solid ${nofapRank.color}44`,
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Моральное состояние
            </span>
            <h2 style={{ color: nofapRank.color, margin: "8px 0 4px 0", fontSize: "22px" }}>
              {nofapRank.badge} {nofapRank.title}
            </h2>
            <div style={{ marginTop: "10px" }}>
              <span style={{ color: "#888", fontSize: "12px" }}>В строю до секунды:</span>
              <p
                style={{
                  color: "#00ff15",
                  fontSize: "16px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  margin: "2px 0 0 0",
                }}
              >
                {liveTimeStr}
              </p>
            </div>
          </div>
          <div style={{ marginTop: "20px", color: "#00ff15", fontSize: "13px", fontWeight: "bold" }}>
            Открыть протокол →
          </div>
        </Link>

        {/* Карточка: Тело */}
        <Link
          to="/body_page"
          style={{
            textDecoration: "none",
            backgroundColor: "#111",
            border: `1px solid ${bodyStatus ? bodyStatus.color : "#333"}44`,
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Физическое состояние
            </span>
            <h2 style={{ color: bodyStatus ? bodyStatus.color : "#fff", margin: "8px 0 4px 0", fontSize: "22px" }}>
              {bodyStatus ? `${bodyStatus.badge} ${bodyStatus.title}` : "Нет замеров"}
            </h2>
            <p style={{ color: "#aaa", fontSize: "14px", margin: "10px 0 0 0" }}>
              Скуфометр:{" "}
              <strong style={{ color: bodyStatus ? bodyStatus.color : "#fff" }}>
                {bodyCalc ? `${bodyCalc.index}%` : "—"}
              </strong>{" "}
              {latestBody && `(${latestBody.weight} кг)`}
            </p>
          </div>
          <div style={{ marginTop: "20px", color: "#00ff15", fontSize: "13px", fontWeight: "bold" }}>
            Кузница тела →
          </div>
        </Link>

        {/* Карточка: Капитал */}
        <Link
          to="/countmoney_page"
          style={{
            textDecoration: "none",
            backgroundColor: "#111",
            border: "1px solid #00ff1544",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Финансовое состояние
            </span>
            <h2 style={{ color: "#00ff15", margin: "8px 0 4px 0", fontSize: "22px" }}>
              {moneySum.toLocaleString("ru-RU")} ₽
            </h2>
            {currentGoal ? (
              <div style={{ marginTop: "10px" }}>
                <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 4px 0" }}>
                  Цель: <strong style={{ color: "#fff" }}>{currentGoal.name}</strong> ({goalProgress.toFixed(1)}%)
                </p>
                <div
                  style={{
                    width: "100%",
                    height: "4px",
                    backgroundColor: "#222",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ width: `${goalProgress}%`, height: "100%", backgroundColor: "#00ff15" }} />
                </div>
              </div>
            ) : (
              <p style={{ color: "#aaa", fontSize: "14px", margin: "10px 0 0 0" }}>Целей пока нет</p>
            )}
          </div>
          <div style={{ marginTop: "20px", color: "#00ff15", fontSize: "13px", fontWeight: "bold" }}>
            Управление капиталом →
          </div>
        </Link>

        {/* Карточка: Дела & Фокус */}
        <Link
          to="/todolist_page"
          style={{
            textDecoration: "none",
            backgroundColor: "#111",
            border: "1px solid #3498db44",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Задачи &amp; Фокус
            </span>
            <h2 style={{ color: "#3498db", margin: "8px 0 4px 0", fontSize: "22px" }}>
              📋 Матрица Дел
            </h2>
            <div style={{ marginTop: "10px", fontSize: "14px", color: "#aaa" }}>
              В работе: <strong style={{ color: "#fff" }}>{pendingTasksCount}</strong>
              {q1Count > 0 && (
                <span style={{ color: "#ff4d4d", marginLeft: "8px" }}>
                  (Срочно: {q1Count})
                </span>
              )}
            </div>
          </div>
          <div style={{ marginTop: "20px", color: "#3498db", fontSize: "13px", fontWeight: "bold" }}>
            Открыть канбан →
          </div>
        </Link>

        {/* Карточка: Квесты Дисциплины */}
        <Link
          to="/quest_page"
          style={{
            textDecoration: "none",
            backgroundColor: "#111",
            border: "1px solid #00ff1544",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>
              Дисциплина // Поток
            </span>
            <h2 style={{ color: "#00ff15", margin: "8px 0 4px 0", fontSize: "22px" }}>
              ⚡ Квесты
            </h2>
            <p style={{ color: "#aaa", fontSize: "14px", margin: "10px 0 0 0" }}>
              Пошаговый раннер рутины и базы
            </p>
          </div>
          <div style={{ marginTop: "20px", color: "#00ff15", fontSize: "13px", fontWeight: "bold" }}>
            Начать квест →
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
// src/pages/Dashboard__page.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import { getUserData, updateUserData } from "../services/firebase";
import { calculateAdvancedSkufIndex } from "./Body__page";
import { MoneyGoal, EisenhowerTask } from "../types";
import ForgeLoader from "../components/ForgeLoader";
import ForgeImage from "../components/ForgeImage";
import ActionButton from "../components/ActionButton";

const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/053/066/486/large_2x/mysterious-person-in-black-hoodie-with-hidden-face-isolated-on-transparent-background-free-png.png";

const calculateLiveTimeDifference = (timestamp: number, now: number): string => {
  if (!timestamp || timestamp === 0) return "0д 0ч 0м";
  const difference = Math.max(0, now - timestamp);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}д ${hours}ч ${minutes}м`;
};

const getSkufStatus = (index: number) => {
  if (index <= 20) return { title: "Сухой атлет", color: "#00ff15" };
  if (index <= 45) return { title: "Рабочая форма", color: "#3498db" };
  if (index <= 70) return { title: "Зона риска", color: "#f1c40f" };
  return { title: "Скуф-мод", color: "#ff4d4d" };
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [now, setNow] = useState<number>(Date.now());

  // Состояние аватара
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [isEditingAvatar, setIsEditingAvatar] = useState<boolean>(false);
  const [newAvatarInput, setNewAvatarInput] = useState<string>("");

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
        if (userData?.user_avatar_url) {
          setAvatarUrl(userData.user_avatar_url);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных дашборда:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [user?.uid]);

  const handleSaveAvatar = async () => {
    if (!user?.uid) return;
    const urlToSave = newAvatarInput.trim() || DEFAULT_AVATAR;
    setAvatarUrl(urlToSave);
    setIsEditingAvatar(false);
    try {
      await updateUserData(user.uid, "user_avatar_url" as any, urlToSave);
    } catch (err) {
      console.error("Ошибка сохранения фото:", err);
    }
  };

  if (isLoading) {
    return <ForgeLoader title="СИНХРОНИЗАЦИЯ..." logs={["ЧТЕНИЕ СТАТИСТИКИ...", "ЗАГРУЗКА ДАННЫХ..."]} />;
  }

  // 1. Дисциплина (NoFap)
  const nofapTimestamp = Number(data?.nofap_timestamp) || 0;
  const nofapDays =
    nofapTimestamp > 0
      ? Math.floor((now - nofapTimestamp) / (1000 * 60 * 60 * 24))
      : 0;
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

  // 5. Навыки
  let skillsCount = 0;
  if (data?.skills_tree) {
    try {
      skillsCount = JSON.parse(data.skills_tree).length;
    } catch {
      skillsCount = 0;
    }
  }

  // Расчет уровня и опыта
  const characterLvl = Math.max(1, Math.floor(nofapDays / 7) + Math.floor(skillsCount / 2) + 1);
  const currentExp = (nofapDays * 500) + (skillsCount * 1200) + (moneySum > 0 ? 3000 : 0);
  const maxExp = characterLvl * 6000;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#060608",
        backgroundImage: "radial-gradient(ellipse at 50% 10%, #151821 0%, #060608 80%)",
        padding: "20px 14px 40px 14px",
        color: "#ddd",
        fontFamily: "monospace, -apple-system, sans-serif",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      <style>{`
        .gothic_dashboard_layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 980px;
          margin: 0 auto;
          align-items: center;
        }
        .gothic_panel {
          background: linear-gradient(180deg, #101116 0%, #0a0b0e 100%);
          border: 1px solid #232733;
          border-left: 3px solid #f0932b;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }
        .gothic_skill_row {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 10px 14px;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 7px;
          transition: all 0.18s ease;
          font-size: 13.5px;
          font-family: monospace, sans-serif;
          font-weight: 500;
        }
        .gothic_skill_row:hover {
          transform: translateY(-1px) translateX(2px);
          filter: brightness(1.2);
        }
        .gothic_skill_row:active {
          transform: translateY(1px) translateX(0);
        }

        /* Сочные фоны и границы для разных типов кнопок */
        .btn_nofap {
          background: linear-gradient(90deg, rgba(0, 255, 21, 0.08) 0%, rgba(0, 255, 21, 0.02) 100%);
          border: 1px solid rgba(0, 255, 21, 0.25);
          color: #d8ffd9;
        }
        .btn_nofap:hover {
          border-color: #00ff15;
          box-shadow: 0 0 14px rgba(0, 255, 21, 0.2);
        }

        .btn_body {
          background: linear-gradient(90deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.02) 100%);
          border: 1px solid rgba(52, 152, 219, 0.25);
          color: #dcf0ff;
        }
        .btn_body:hover {
          border-color: #3498db;
          box-shadow: 0 0 14px rgba(52, 152, 219, 0.2);
        }

        .btn_money {
          background: linear-gradient(90deg, rgba(241, 196, 15, 0.1) 0%, rgba(241, 196, 15, 0.02) 100%);
          border: 1px solid rgba(241, 196, 15, 0.25);
          color: #fff8d6;
        }
        .btn_money:hover {
          border-color: #f1c40f;
          box-shadow: 0 0 14px rgba(241, 196, 15, 0.2);
        }

        .btn_tasks {
          background: linear-gradient(90deg, rgba(240, 147, 43, 0.1) 0%, rgba(240, 147, 43, 0.02) 100%);
          border: 1px solid rgba(240, 147, 43, 0.25);
          color: #ffe8d1;
        }
        .btn_tasks:hover {
          border-color: #f0932b;
          box-shadow: 0 0 14px rgba(240, 147, 43, 0.2);
        }

        .gothic_section_header {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gothic_section_header::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #1e222d;
        }
        @media (min-width: 850px) {
          .gothic_dashboard_layout {
            display: grid;
            grid-template-columns: 500px 1fr;
            align-items: start;
            gap: 28px;
          }
        }
      `}</style>

      <div className="gothic_dashboard_layout">
        {/* ЛЕВАЯ ПАНЕЛЬ: ИНТЕРФЕЙС ПЕРСОНАЖА */}
        <div
          className="gothic_panel"
          style={{
            width: "100%",
            padding: "22px 24px",
            boxSizing: "border-box",
          }}
        >
          {/* Заголовок «ПЕРСОНАЖ» */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                letterSpacing: "4px",
                color: "#fff",
                textTransform: "uppercase",
                fontWeight: "bold",
                textShadow: "0 0 15px rgba(240, 147, 43, 0.3)",
              }}
            >
              ПЕРСОНАЖ
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "6px" }}>
              <div style={{ height: "1px", width: "45px", background: "linear-gradient(90deg, transparent, #f0932b)" }} />
              <span style={{ color: "#f0932b", fontSize: "12px" }}>◈</span>
              <div style={{ height: "1px", width: "45px", background: "linear-gradient(270deg, transparent, #f0932b)" }} />
            </div>
          </div>

          {/* УРОВЕНЬ И ОПЫТ */}
          <div style={{ borderBottom: "1px solid #1a1e28", paddingBottom: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold", color: "#fff", marginBottom: "4px" }}>
              <span>УРОВЕНЬ <span style={{ color: "#f0932b" }}>{characterLvl}</span></span>
              <span style={{ color: "#f0932b" }}>Очки опыта {skillsCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8a91a0", marginBottom: "6px" }}>
              <span>Опыт {currentExp} т.</span>
              <span>/ {maxExp} т.</span>
            </div>
            {/* Шкала опыта */}
            <div style={{ height: "6px", backgroundColor: "#11141c", border: "1px solid #232836", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, (currentExp / maxExp) * 100)}%`,
                  background: "linear-gradient(90deg, #d35400 0%, #f0932b 100%)",
                  boxShadow: "0 0 8px rgba(240, 147, 43, 0.5)",
                }}
              />
            </div>
          </div>

          {/* ХАРАКТЕРИСТИКИ */}
          <div style={{ borderBottom: "1px solid #1a1e28", paddingBottom: "14px", marginBottom: "16px" }}>
            <div className="gothic_section_header" style={{ color: "#8a91a0" }}>ХАРАКТЕРИСТИКИ</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #1a1e28", paddingBottom: "3px" }}>
                <span style={{ color: "#8a91a0" }}>Здоровье</span>
                <span style={{ color: "#ff4d4d", fontWeight: "bold" }}>999/999</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #1a1e28", paddingBottom: "3px" }}>
                <span style={{ color: "#8a91a0" }}>Дофамин</span>
                <span style={{ color: "#3498db", fontWeight: "bold" }}>{nofapDays >= 14 ? "Чистый" : "Ребут"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #1a1e28", paddingBottom: "3px" }}>
                <span style={{ color: "#8a91a0" }}>Вес тела</span>
                <span style={{ color: "#fff", fontWeight: "bold" }}>{latestBody ? `${latestBody.weight} кг` : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #1a1e28", paddingBottom: "3px" }}>
                <span style={{ color: "#8a91a0" }}>Скуфометр</span>
                <span style={{ color: bodyStatus ? bodyStatus.color : "#f0932b", fontWeight: "bold" }}>
                  {bodyCalc ? `${bodyCalc.index}%` : "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gridColumn: "span 2", paddingTop: "4px" }}>
                <span style={{ color: "#8a91a0" }}>Воздержание NoFap</span>
                <span style={{ color: "#00ff15", fontWeight: "bold", textShadow: "0 0 8px rgba(0,255,21,0.3)" }}>{liveTimeStr}</span>
              </div>
            </div>
          </div>

          {/* 2. ДОФАМИН & ВОЛЯ */}
          <div style={{ marginBottom: "14px" }}>
            <div className="gothic_section_header" style={{ color: "#00ff15" }}>КОНТРОЛЬ ДОФАМИНА & ВОЛИ</div>
            <div className="gothic_skill_row btn_nofap" onClick={() => navigate("/nofap_page")}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#00ff15" }}>⚡</span>
                <span>Трекер воздержания (NoFap)</span>
              </span>
              <span style={{ color: "#00ff15", fontSize: "12px", fontWeight: "bold" }}>{liveTimeStr}</span>
            </div>
          </div>

          {/* 3. ТЕЛО */}
          <div style={{ marginBottom: "14px" }}>
            <div className="gothic_section_header" style={{ color: "#3498db" }}>УПРАВЛЕНИЕ ТЕЛОМ</div>
            <div className="gothic_skill_row btn_body" onClick={() => navigate("/body_page")}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#3498db" }}>⚔️</span>
                <span>Физическое состояние & Замеры</span>
              </span>
              <span style={{ color: bodyStatus ? bodyStatus.color : "#3498db", fontSize: "12px", fontWeight: "bold" }}>
                {bodyStatus ? bodyStatus.title : "Замеры"}
              </span>
            </div>
          </div>

          {/* 4. ФИНАНСЫ */}
          <div style={{ marginBottom: "14px" }}>
            <div className="gothic_section_header" style={{ color: "#f1c40f" }}>ФИНАНСОВЫЙ КОНТРОЛЬ</div>
            <div className="gothic_skill_row btn_money" onClick={() => navigate("/countmoney_page")}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#f1c40f" }}>💰</span>
                <span>Управление капиталом & Цели</span>
              </span>
              <span style={{ color: "#f1c40f", fontSize: "12px", fontWeight: "bold" }}>
                {moneySum.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          </div>

          {/* ГРУППЫ НАВЫКОВ (1. САМООРГАНИЗАЦИЯ) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div className="gothic_section_header" style={{ color: "#f0932b" }}>САМООРГАНИЗАЦИЯ & ПРОДУКТИВНОСТЬ</div>
              
              <div className="gothic_skill_row btn_tasks" onClick={() => navigate("/todolist_page")}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#f0932b" }}>📋</span>
                  <span>Матрица задач</span>
                </span>
                <span style={{ color: pendingTasksCount > 0 ? "#ff7675" : "#55e06a", fontSize: "12px", fontWeight: "bold" }}>
                  {pendingTasksCount > 0 ? `${pendingTasksCount} в работе` : "Чисто"}
                </span>
              </div>

              <div className="gothic_skill_row btn_tasks" onClick={() => navigate("/quest_page")}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#f0932b" }}>🎯</span>
                  <span>Квесты потока (Рутина)</span>
                </span>
                <span style={{ color: "#f0932b", fontSize: "12px", fontWeight: "bold" }}>Раннер</span>
              </div>

              <div className="gothic_skill_row btn_tasks" onClick={() => navigate("/skills_page")}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#f0932b" }}>🧠</span>
                  <span>Скиллы & База достижений</span>
                </span>
                <span style={{ color: "#f0932b", fontSize: "12px", fontWeight: "bold" }}>{skillsCount} освоено</span>
              </div>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ: АВАТАР ПЕРСОНАЖА */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "sticky",
            top: "20px",
          }}
        >
          {/* Контейнер фотки персонажа */}
          <div
            className="gothic_panel"
            style={{
              width: "100%",
              maxWidth: "380px",
              padding: "16px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderLeftColor: "#3498db",
            }}
          >
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                border: "1px solid #232733",
                borderRadius: "4px",
                background: "#08090c",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
              }}
            >
              <ForgeImage
                src={avatarUrl}
                alt="Аватар Персонажа"
                aspectRatio="3 / 4"
                borderRadius="0px"
                borderColor="transparent"
                style={{ width: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Панель управления аватаром */}
            <div style={{ width: "100%", marginTop: "14px", textAlign: "center" }}>
              {!isEditingAvatar ? (
                <button
                  onClick={() => {
                    setNewAvatarInput(avatarUrl);
                    setIsEditingAvatar(true);
                  }}
                  style={{
                    background: "linear-gradient(180deg, #181b24 0%, #10121a 100%)",
                    border: "1px solid #2d3345",
                    color: "#f0932b",
                    fontSize: "11px",
                    padding: "7px 16px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    fontFamily: "monospace, sans-serif",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#f0932b";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(240, 147, 43, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2d3345";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  ✎ СМЕНИТЬ ПОРТРЕТ
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                  <input
                    type="text"
                    placeholder="Вставь ссылку на портрет..."
                    value={newAvatarInput}
                    onChange={(e) => setNewAvatarInput(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      backgroundColor: "#0d0f14",
                      border: "1px solid #2d3345",
                      color: "#fff",
                      padding: "8px 10px",
                      fontSize: "12px",
                      fontFamily: "monospace, sans-serif",
                      borderRadius: "4px",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <ActionButton
                      onClick={handleSaveAvatar}
                      loadingText="Сохранение..."
                      successText="✓ Готово"
                      style={{
                        backgroundColor: "#f0932b",
                        color: "#000",
                        fontSize: "11px",
                        padding: "6px 14px",
                        fontWeight: "bold",
                        fontFamily: "monospace, sans-serif",
                        borderRadius: "4px",
                      }}
                    >
                      СОХРАНИТЬ
                    </ActionButton>
                    <button
                      onClick={() => setIsEditingAvatar(false)}
                      style={{
                        backgroundColor: "#161922",
                        border: "1px solid #2a2f3f",
                        color: "#8a91a0",
                        fontSize: "11px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontFamily: "monospace, sans-serif",
                        borderRadius: "4px",
                      }}
                    >
                      ОТМЕНА
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
// src/pages/NoFap__page.tsx
import React, { useEffect, useState } from "react";
import {
  addLinkToUser_nofap,
  getUserData,
  removeLinkFromUser_nofap,
  updateUserData,
} from "../services/firebase";
import { useAppSelector } from "../redux/store";
import { NofapLink, RelapseRecord } from "../types";
import NofapGraph from "../components/NofapGraph";
import ActionButton from "../components/ActionButton";
import ForgeLoader from "../components/ForgeLoader";
import ForgeImage from "../components/ForgeImage";
import NofapPanicModal from "../components/NofapPanicModal";
import NofapBuffs from "../components/NofapBuffs";

interface Milestone {
  days: number;
  title: string;
  badge: string;
  desc: string;
}

const MILESTONES: Milestone[] = [
  { days: 3, title: "Искра", badge: "⚡", desc: "Первый физический барьер пройден" },
  { days: 7, title: "Железная воля", badge: "🛡️", desc: "1 неделя контроля над импульсами" },
  { days: 14, title: "Фокус", badge: "⚔️", desc: "2 недели: стабилизация дофамина" },
  { days: 30, title: "Осознанность", badge: "👑", desc: "1 месяц: перезапуск рецепторов" },
  { days: 60, title: "Монолит", badge: "🏛️", desc: "2 месяца: железная дисциплина" },
  { days: 90, title: "Перерождение", badge: "🌌", desc: "Полный нейробиологический ребут" },
];

const getCurrentRank = (days: number) => {
  if (days >= 90) return { title: "Титан", color: "#e056fd", badge: "🌌" };
  if (days >= 60) return { title: "Монолит", color: "#f0932b", badge: "🏛️" };
  if (days >= 30) return { title: "Мастер Воли", color: "#f1c40f", badge: "👑" };
  if (days >= 14) return { title: "Адепт", color: "#3498db", badge: "⚔️" };
  if (days >= 7) return { title: "Страж", color: "#2ecc71", badge: "🛡️" };
  if (days >= 3) return { title: "Инициат", color: "#1abc9c", badge: "⚡" };
  return { title: "Новичок", color: "#95a5a6", badge: "🌱" };
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString("ru", { month: "long" });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

const calculateTimeDifference = (timestamp: number, now: number): string => {
  const difference = Math.max(0, now - timestamp);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return `${days}д ${hours}ч ${minutes}м ${seconds}с`;
};

interface ProgressBarProps {
  timestamp: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ timestamp }) => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const difference = Math.max(0, now - timestamp);
  const dayMs = 1000 * 60 * 60 * 24;
  const fullDays = Math.floor(difference / dayMs);
  const remainingTime = (difference % dayMs) / dayMs;

  const currentRank = getCurrentRank(fullDays);

  const totalBoxes = fullDays + (remainingTime > 0 ? 1 : 0);
  const boxes = Array.from({ length: totalBoxes }, (_, index) => {
    if (index < fullDays) {
      return { filled: 1 };
    } else {
      return { filled: remainingTime };
    }
  });

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Карточка текущего ранга */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#111",
          border: `1px solid ${currentRank.color}`,
          borderRadius: "8px",
          padding: "12px 20px",
          marginBottom: "20px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>
            Текущий ранг
          </span>
          <h2 style={{ margin: "2px 0 0 0", color: currentRank.color }}>
            {currentRank.badge} {currentRank.title}
          </h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>Дней в строю</span>
          <h2 style={{ margin: "2px 0 0 0", color: "#00ff15" }}>{fullDays}</h2>
        </div>
      </div>

      {/* Таймеры */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          lineHeight: "28px",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <div>
          <span style={{ color: "#888", fontSize: "13px" }}>Дата старта:</span>
          <br />
          <strong className="light_green">{formatTimestamp(timestamp)}</strong>
        </div>

        <div>
          <span style={{ color: "#888", fontSize: "13px" }}>Время без срывов:</span>
          <br />
          <strong className="light_green">{calculateTimeDifference(timestamp, now)}</strong>
        </div>
      </div>

      {/* Прогресс-бар из кубиков */}
      <div className="progressBar_green_boxes_wrap">
        {boxes.map((box, index) => (
          <div key={index} className="progressBar_green_box_wrap">
            <div
              className="progressBar_green_box"
              style={{
                background:
                  box.filled === 1
                    ? "#00ff15"
                    : `linear-gradient(to right, #00ff15 ${box.filled * 100}%, transparent ${box.filled * 100}%)`,
              }}
            />
          </div>
        ))}
        <div className="progressBar_green_box_wrap">
          <div className="progressBar_green_box" />
        </div>
      </div>

      {/* Сетка достижений / Майлстоунов */}
      <div style={{ marginTop: "35px" }}>
        <h3 style={{ marginBottom: "15px", fontSize: "16px", color: "#aaa" }}>
          Алтарь дисциплины
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "10px",
          }}
        >
          {MILESTONES.map((m) => {
            const isUnlocked = fullDays >= m.days;
            return (
              <div
                key={m.days}
                style={{
                  backgroundColor: isUnlocked ? "#152417" : "#0d0d0d",
                  border: `1px solid ${isUnlocked ? "#00ff15" : "#222"}`,
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                  opacity: isUnlocked ? 1 : 0.45,
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>{m.badge}</div>
                <strong style={{ fontSize: "13px", display: "block", color: isUnlocked ? "#fff" : "#777" }}>
                  {m.title}
                </strong>
                <span style={{ fontSize: "11px", color: isUnlocked ? "#00ff15" : "#555" }}>
                  {m.days} {m.days === 3 ? "дня" : "дней"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const NoFapPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [nofapTimestamp, setNofapTimestamp] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [links, setLinks] = useState<NofapLink[]>([]);
  const [newLink, setNewLink] = useState<string>("");
  const [newLinkNote, setNewLinkNote] = useState<string>("");

  // Состояние Дневника срывов
  const [relapses, setRelapses] = useState<RelapseRecord[]>([]);
  const [showRelapseModal, setShowRelapseModal] = useState<boolean>(false);
  const [showPanicModal, setShowPanicModal] = useState<boolean>(false);

  // Поля формы срыва (формула книги: Триггер -> Заменитель -> Награда + Вывод)
  const [relapseReason, setRelapseReason] = useState<string>("");
  const [relapseSubstitute, setRelapseSubstitute] = useState<string>("");
  const [relapseReward, setRelapseReward] = useState<string>("");
  const [relapseLesson, setRelapseLesson] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      try {
        const data = await getUserData(user.uid);
        if (data) {
          setNofapTimestamp(Number(data.nofap_timestamp) || 0);
          if (data.nofap_links) {
            setLinks(data.nofap_links);
          }
          if ((data as any).nofap_relapses) {
            try {
              setRelapses(JSON.parse((data as any).nofap_relapses));
            } catch {
              setRelapses([]);
            }
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных из Firestore:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleAddLink = async () => {
    if (!user?.uid || !newLink.trim()) return;

    const item: NofapLink = { link: newLink.trim(), note: newLinkNote.trim() };
    await addLinkToUser_nofap(user.uid, item);
    setLinks((prev) => [...prev, item]);
    setNewLink("");
    setNewLinkNote("");
  };

  const handleRemoveLink = async (linkToRemove: NofapLink) => {
    if (!user?.uid) return;
    const isConfirmed = window.confirm(`Удалить ссылку "${linkToRemove.note || linkToRemove.link}"?`);
    if (!isConfirmed) return;

    await removeLinkFromUser_nofap(user.uid, linkToRemove);
    setLinks((prev) =>
      prev.filter((l) => l.link !== linkToRemove.link || l.note !== linkToRemove.note)
    );
  };

  const startNofapNow = async () => {
    if (!user?.uid) return;
    const dateNow = Date.now();
    await updateUserData(user.uid, "nofap_timestamp", dateNow);
    setNofapTimestamp(dateNow);
  };

  const startNofapFromDate = async () => {
    if (!user?.uid || !startDate || !startTime) return;

    const [hours, minutes] = startTime.split(":").map(Number);
    const dateObj = new Date(startDate);
    dateObj.setHours(hours || 0);
    dateObj.setMinutes(minutes || 0);
    dateObj.setSeconds(0);
    const timestamp = dateObj.getTime();

    await updateUserData(user.uid, "nofap_timestamp", timestamp);
    setNofapTimestamp(timestamp);
  };

  const handleOpenRelapseModal = () => {
    setShowRelapseModal(true);
  };

  // Фиксация срыва по новой формуле
  const confirmRelapseAndReset = async () => {
    if (!user?.uid) return;

    const durationStr = calculateTimeDifference(nofapTimestamp, Date.now());
    const newRecord: RelapseRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      durationFormatted: durationStr,
      reason: relapseReason.trim() || "Причина не указана (импульс)",
      substitute: relapseSubstitute.trim() || undefined,
      reward: relapseReward.trim() || undefined,
      lesson: relapseLesson.trim() || "Сделать выводы и двигаться дальше",
    };

    const updatedRelapses = [newRecord, ...relapses];

    await updateUserData(user.uid, "nofap_timestamp", 0);
    await updateUserData(user.uid, "nofap_relapses" as any, JSON.stringify(updatedRelapses));

    setNofapTimestamp(0);
    setRelapses(updatedRelapses);
    setShowRelapseModal(false);
    setRelapseReason("");
    setRelapseSubstitute("");
    setRelapseReward("");
    setRelapseLesson("");
  };

  const handleDeleteRelapse = async (id: string) => {
    if (!user?.uid) return;
    const isConfirmed = window.confirm("Удалить эту запись из журнала срывов?");
    if (!isConfirmed) return;

    const filtered = relapses.filter((r) => r.id !== id);
    setRelapses(filtered);
    await updateUserData(user.uid, "nofap_relapses" as any, JSON.stringify(filtered));
  };

  

  if (isLoading) {
    return (
      <ForgeLoader
        title="NOFAP // NOPORN"
        logs={[
          "CHECKING_DOPAMINE_BASELINE...",
          "SYNCING_RELAPSE_JOURNAL...",
          "LOADING_NEURAL_CALIBRATION...",
          "CALCULATING_STREAK..."
        ]}
      />
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "950px", margin: "0 auto" }}>
      <div className="nofap_container">
        <div>
          <h1>Трекер воздержания</h1>

          
          

          {nofapTimestamp > 0 ? (
            <>
              <ProgressBar timestamp={nofapTimestamp} />

              <NofapGraph timestamp={nofapTimestamp} />

              {/* СЮДА ВСТАВЬ БЛОК С КАРТИНКОЙ */}
              <div style={{ marginTop: "30px" }}>
                
                <div style={{ marginBottom: "40px", marginTop: "30px" }}>
                  <h2>База знаний &amp; Фокус</h2>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
                    <input
                      type="text"
                      placeholder="Введите ссылку"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      style={{ flex: 1, minWidth: "200px", padding: "8px", backgroundColor: "#141414", border: "1px solid #333", color: "#fff", borderRadius: "4px" }}
                    />
                    <input
                      type="text"
                      placeholder="Введите описание"
                      value={newLinkNote}
                      onChange={(e) => setNewLinkNote(e.target.value)}
                      style={{ flex: 1, minWidth: "200px", padding: "8px", backgroundColor: "#141414", border: "1px solid #333", color: "#fff", borderRadius: "4px" }}
                    />
                    <ActionButton
                      onClick={handleAddLink}
                      loadingText="Сохранение..."
                      successText="✓ Сохранено"
                      disabled={!newLink.trim()}
                      style={{ padding: "8px 16px" }}
                    >
                      Сохранить
                    </ActionButton>
                  </div>
                  {links.map((link, index) => (
                    <div key={`${link.link}-${index}`} className="nofap_link" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", backgroundColor: "#111", padding: "10px 14px", borderRadius: "6px", border: "1px solid #222" }}>
                      <a href={link.link} target="_blank" rel="noopener noreferrer" style={{ color: "#00ff15", textDecoration: "none" }}>
                        {link.note || link.link}
                      </a>
                      <ActionButton
                        onClick={() => handleRemoveLink(link)}
                        variant="danger"
                        loadingText="..."
                        successText="✓"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                      >
                        Удалить
                      </ActionButton>
                    </div>
                  ))}
                </div>

                <div>
                  {/* Баффы и дебаффы вместо скучных правил */}
                  <NofapBuffs />
                </div>


                
              </div>
            </>
          ) : (
            <div style={{ marginBottom: "20px" }}>
              <h2>Начать воздержание</h2>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Дата начала:
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ marginLeft: "10px", padding: "6px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label>
                  Время начала:
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ marginLeft: "10px", padding: "6px" }}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <ActionButton
                  onClick={startNofapNow}
                  loadingText="Запуск таймера..."
                  successText="✓ В строю!"
                >
                  Начать воздержание сейчас
                </ActionButton>

                <ActionButton
                  onClick={startNofapFromDate}
                  variant="secondary"
                  loadingText="Сохранение..."
                  successText="✓ Дата зафиксирована!"
                  disabled={!startDate || !startTime}
                >
                  Уже воздерживаюсь
                </ActionButton>
              </div>
            </div>
          )}
        </div>

        {/* SOS Модалка рутины */}
        <NofapPanicModal
          isOpen={showPanicModal}
          onClose={() => setShowPanicModal(false)}
        />

        {/* Модальное окно фиксации срыва (по формуле из книги) */}
        {showRelapseModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.88)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "#111",
                border: "2px solid #ff4d4d",
                borderRadius: "10px",
                padding: "24px",
                maxWidth: "580px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 0 30px rgba(255, 77, 77, 0.25)",
              }}
            >
              <h2 style={{ margin: "0 0 8px 0", color: "#ff4d4d", fontSize: "19px" }}>
                🛑 РАЗБОР СРЫВА // ПРОШИВКА ТРИГГЕРА
              </h2>
              <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                Перепиши шаблон привычки: <em>«Когда происходит [Триггер], я буду делать [Заменитель], потому что это дает мне [Награду]»</em>.
              </p>

              {/* 1. Триггер */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", color: "#ff8080", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px", fontWeight: "bold" }}>
                  1. Триггер («Когда происходит...»)
                </label>
                <textarea
                  rows={2}
                  placeholder="Листал маркетплейс, стрим папича, скука в кровати перед сном..."
                  value={relapseReason}
                  onChange={(e) => setRelapseReason(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* 2. Заменитель */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", color: "#3498db", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px", fontWeight: "bold" }}>
                  2. Действие-заменитель («Я буду делать...»)
                </label>
                <input
                  type="text"
                  placeholder="Упаду на 30 отжиманий, ледяной душ, прогулка 20 мин, выпью воды..."
                  value={relapseSubstitute}
                  onChange={(e) => setRelapseSubstitute(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* 3. Награда */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", color: "#f1c40f", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px", fontWeight: "bold" }}>
                  3. Истинная награда («Потому что это дает мне...»)
                </label>
                <input
                  type="text"
                  placeholder="Гордость за контроль, тестостерон, чистый мозг, каменный стояк утром..."
                  value={relapseReward}
                  onChange={(e) => setRelapseReward(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
              </div>

              {/* 4. Вывод / Урок */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#00ff15", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px", fontWeight: "bold" }}>
                  4. Вывод на будущее (Орг-решение)
                </label>
                <textarea
                  rows={2}
                  placeholder="Удалить приложение, телефон класть в коридор в 23:00, отписаться от канала..."
                  value={relapseLesson}
                  onChange={(e) => setRelapseLesson(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    color: "#00ff15",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowRelapseModal(false)}
                  style={{
                    backgroundColor: "#222",
                    color: "#aaa",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Отмена
                </button>
                <ActionButton
                  onClick={confirmRelapseAndReset}
                  variant="danger"
                  loadingText="Запись в дневник..."
                  successText="✓ Зафиксировано"
                >
                  Записать шаблон и сбросить счетчик
                </ActionButton>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "25px", marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
          
          

            {/* сюда нужно вставить дневник */}
            <div>

              <div
                style={{
                  marginTop: "10px",
                  borderTop: "1px solid #222",
                  paddingTop: "25px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "#ff4d4d" }}>
                      📓 Дневник срывов &amp; Анализ триггеров
                    </h2>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Всего зафиксировано: {relapses.length}
                    </span>
                  </div>
                </div>

                {relapses.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "#0d0d0d",
                      border: "1px dashed #222",
                      borderRadius: "8px",
                      padding: "20px",
                      textAlign: "center",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    Срывов не зафиксировано. Держи линию обороны! 🛡️
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {relapses.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: "#111",
                          border: "1px solid #222",
                          borderLeft: "4px solid #ff4d4d",
                          borderRadius: "6px",
                          padding: "14px 16px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div>
                            <span style={{ color: "#ff4d4d", fontWeight: "bold", fontSize: "14px" }}>
                              {formatTimestamp(item.timestamp)}
                            </span>
                            <span style={{ color: "#888", fontSize: "12px", marginLeft: "10px" }}>
                              (Прерван стрик: <strong style={{ color: "#fff" }}>{item.durationFormatted}</strong>)
                            </span>
                          </div>
                          <ActionButton
                            onClick={() => handleDeleteRelapse(item.id)}
                            variant="danger"
                            loadingText="..."
                            successText="✓"
                            style={{ padding: "2px 8px", fontSize: "12px" }}
                          >
                            ×
                          </ActionButton>
                        </div>

                        {/* Триггер */}
                        <div style={{ fontSize: "14px", color: "#ddd", marginBottom: "6px" }}>
                          <strong style={{ color: "#ff8080" }}>Триггер:</strong> {item.reason}
                        </div>

                        {/* Заменитель (если есть) */}
                        {item.substitute && (
                          <div style={{ fontSize: "13px", color: "#bbb", marginBottom: "4px" }}>
                            <strong style={{ color: "#3498db" }}>Заменитель:</strong> {item.substitute}
                          </div>
                        )}

                        {/* Награда (если есть) */}
                        {item.reward && (
                          <div style={{ fontSize: "13px", color: "#bbb", marginBottom: "6px" }}>
                            <strong style={{ color: "#f1c40f" }}>Награда:</strong> {item.reward}
                          </div>
                        )}

                        {/* Вывод */}
                        <div style={{ fontSize: "13px", color: "#aaa" }}>
                          <strong style={{ color: "#00ff15" }}>Вывод на будущее:</strong> {item.lesson}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
            onClick={() => setShowPanicModal(true)}
            style={{
              width: "100%",
              backgroundColor: "#3a0d0d",
              border: "2px solid #ff4d4d",
              boxShadow: "0 0 15px rgba(255, 77, 77, 0.4)",
              color: "#fff",
              padding: "14px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "15px",
              letterSpacing: "1px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            🚨 СЕЙЧАС СОРВУСЬ // SOS-ПРОТОКОЛ (15 МИН)
          </button>

          {/* Кнопка фиксации срыва */}
          <button
            onClick={handleOpenRelapseModal}
            style={{
              width: "100%",
              cursor: "pointer",
              backgroundColor: "#161616",
              color: "#888",
              border: "1px solid #333",
              padding: "10px 18px",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            Срыв произошел (Зафиксировать в журнал)
          </button>

          <ForgeImage
            src="/images/nofap.png"
            alt="Напоминание о вреде порно"
            aspectRatio="741 / 435"
            style={{ maxWidth: "741px", margin: "0 auto 25px auto" }}
          />


        </div>

        {/* База знаний */}
        


        
        

        {/* СНИЗУ ЭКРАНА: ДНЕВНИК И ЖУРНАЛ СРЫВОВ */}

      </div>
    </div>
  );
};

export default NoFapPage;
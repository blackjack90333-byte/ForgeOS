// src/pages/NoFap__page.tsx
import React, { useEffect, useState } from "react";
import {
  addLinkToUser_nofap,
  getUserData,
  removeLinkFromUser_nofap,
  updateUserData,
} from "../services/firebase";
import { useAppSelector } from "../redux/store";
import { NofapLink } from "../types";

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
  return `${day} ${month} ${year}`;
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
    <div className="progressBar_noFap">
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

    try {
      await addLinkToUser_nofap(user.uid, item);
      setLinks((prev) => [...prev, item]);
      setNewLink("");
      setNewLinkNote("");
    } catch (error: any) {
      console.error("Ошибка при добавлении ссылки:", error.message);
    }
  };

  const handleRemoveLink = async (linkToRemove: NofapLink) => {
    if (!user?.uid) return;

    // Окно подтверждения с кнопками ОК / Отмена
    const isConfirmed = window.confirm(
      `Удалить ссылку "${linkToRemove.note || linkToRemove.link}"?`
    );
    if (!isConfirmed) return;

    try {
      await removeLinkFromUser_nofap(user.uid, linkToRemove);
      setLinks((prev) =>
        prev.filter(
          (l) => l.link !== linkToRemove.link || l.note !== linkToRemove.note
        )
      );
    } catch (error: any) {
      console.error("Ошибка при удалении ссылки:", error.message);
    }
  };

  const startNofapNow = async () => {
    if (!user?.uid) return;
    try {
      const dateNow = Date.now();
      await updateUserData(user.uid, "nofap_timestamp", dateNow);
      setNofapTimestamp(dateNow);
    } catch (error) {
      console.error("Ошибка при запуске таймера:", error);
    }
  };

  const startNofapFromDate = async () => {
    if (!user?.uid || !startDate || !startTime) return;

    const createTimestamp = (dateStr: string, timeStr: string): number => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const dateObj = new Date(dateStr);
      dateObj.setHours(hours || 0);
      dateObj.setMinutes(minutes || 0);
      dateObj.setSeconds(0);
      return dateObj.getTime();
    };

    try {
      const timestamp = createTimestamp(startDate, startTime);
      await updateUserData(user.uid, "nofap_timestamp", timestamp);
      setNofapTimestamp(timestamp);
    } catch (error) {
      console.error("Ошибка при сохранении даты:", error);
    }
  };

  const wipeNofap = async () => {
    if (!user?.uid) return;
    const isConfirmed = window.confirm("Сбросить текущий прогресс?");
    if (!isConfirmed) return;

    try {
      await updateUserData(user.uid, "nofap_timestamp", 0);
      setNofapTimestamp(0);
    } catch (error) {
      console.error("Ошибка при сбросе таймера:", error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <p>Загрузка из базы данных... подождите...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div className="nofap_container">
        <div>
            <h1>Трекер воздержания</h1>
            <div
                style={{
                    // backgroundColor: "#0d1a0e",
                    // border: "1px solid #1c3b20",
                    // borderLeft: "4px solid #00ff15",
                    // borderRadius: "8px",
                    // padding: "20px 24px",
                    marginBottom: "25px",
                    fontFamily: "monospace",
                    color: "#e0e0e0",
                }}
                >
                <div
                    style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#00ff15",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    }}
                >
                    Правила:
                </div>

                <div
                    style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "10px 24px",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    }}
                >
                    <div style={{ padding: "4px 0" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", marginRight: "8px" }}>01.</span>
                    Не смотреть порно
                    </div>
                    <div style={{ padding: "4px 0" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", marginRight: "8px" }}>02.</span>
                    Не фантазировать и не уходить в иллюзии
                    </div>
                    <div style={{ padding: "4px 0" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", marginRight: "8px" }}>03.</span>
                    Не смотреть эротику / NSFW
                    </div>
                    <div style={{ padding: "4px 0" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", marginRight: "8px" }}>04.</span>
                    Не играть в 18+ игры
                    </div>
                    <div style={{ padding: "4px 0" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", marginRight: "8px" }}>05.</span>
                    Не чекать TG-каналы с адалтом
                    </div>
                    <div style={{ padding: "4px 0" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", marginRight: "8px" }}>06.</span>
                    Не листать паблики VK с эротикой
                    </div>
                    <div style={{ padding: "4px 0" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", marginRight: "8px" }}>07.</span>
                    Не серфить адалт-сайты и треды
                    </div>
                    <div style={{ padding: "4px 0" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", marginRight: "8px" }}>08.</span>
                    Драйв Энергию переводить в физуху
                    </div>
                </div>
                </div>



          {nofapTimestamp > 0 ? (
            <>
              <ProgressBar timestamp={nofapTimestamp} />

              <div style={{ marginBottom: "20px" }}>
                <button
                  onClick={wipeNofap}
                  style={{
                    marginTop: "30px",
                    cursor: "pointer",
                  }}
                >
                  Подрочил / Посмотрел порно (Сброс)
                </button>
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
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Время начала:
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>

              <button onClick={startNofapNow} style={{ padding: "5px 10px" }}>
                Начать воздержание сейчас
              </button>
              <button
                onClick={startNofapFromDate}
                style={{ padding: "5px 10px", marginLeft: "10px" }}
              >
                Уже воздерживаюсь
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: "50px", marginTop: "40px" }}>
          <h2>База знаний &amp; Фокус</h2>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Введите ссылку"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              style={{ marginRight: "10px", padding: "5px" }}
            />
            <input
              type="text"
              placeholder="Введите описание"
              value={newLinkNote}
              onChange={(e) => setNewLinkNote(e.target.value)}
              style={{ marginRight: "10px", padding: "5px" }}
            />
            <button onClick={handleAddLink} style={{ padding: "5px 10px" }}>
              Сохранить
            </button>
          </div>

          {links.map((link, index) => (
            <div key={`${link.link}-${index}`} className="nofap_link">
              <a href={link.link} target="_blank" rel="noopener noreferrer">
                {link.note || link.link}
              </a>
              <button onClick={() => handleRemoveLink(link)}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoFapPage;
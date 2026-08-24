// src/pages/Quest__page.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import { getUserData, updateUserData } from "../services/firebase";
import ForgeLoader from "../components/ForgeLoader";

const DEFAULT_QUEST_TEMPLATE = `ЕЖЕДНЕВНАЯ БАЗА
Триггер: прочитать сообщение тг https://t.me/c/1863625570/1673/1956
Бро, давай 10 благодарностей, подумай что у тебя есть и чего могло бы не быть...
Сделать thumbpulling 30 сек делаешь, 20 сек перерыв, 5 раз https://youtube.com/shorts/tLo2ddddTKg
Включить музыку из ветки Motivation - hail to the king, shout 2000)))
узнать свой вес + замерить жир калиппером и записать их в huawei health.. может ты уже LEAN 13% жира?)
ЭТАП 1 ФИЗУХА. Переодеться в спортивные шорты
200 кегеля на корточках или стоя + 5 раз на максимум)
вакуум 10 раз "3 вдоха ➡️➡️➡️ вакуум ➡️➡️➡️ 3 вдоха ➡️➡️➡️ вакуум"
планка, сколько можешь 18.11 сделал 3 минуты 30 сек)
треня на стояк, эта реальная https://youtu.be/lMeB_5T3fC8 , ну можно и эту https://youtu.be/HpzxdFW9e3w или эту https://youtu.be/ZGBLaExFVic
Растяжка подвоздошно-поясничных мышц https://youtu.be/FNnxxVgOVNU 10 раз на ВЫДОХЕ. должны быть болевые ощущения в области паха
качнуть шею лежа бочком
1 табата тренировка подтягивания-приседания-отжимания 6 минут
5 км на дорожке)
100 приседаний
ГИРЯ ЧЕРТОВА ДЮЖИНА (опционально, ну если сделаешь то красавчик)
8 минут треня с рисом табата 45/15)
постоять на доске садху по желанию, попробовать встать 3 раза
ЭТАП 2 АНТИ-ШЕРСТЬ. убраться в комнате 5 минут стол-кровать-одежда, протри стол, убери в шкафах срань с плесенью
побриться и подровнять виски ➡️➡️➡️ контрастный душ + помыть голову + скраб
увлажняйка + бепантен ➡️➡️➡️ ГУАША по 10 движений
навести раствор 1/4 ч.л. соды и перекиси в 100мл воды ➡️➡️➡️ почистить зубы ➡️➡️➡️ почистить язык скребком ➡️➡️➡️ выложить сторис в ветку "зубы"
сделать массаж десен И АТЛАНТ ВАЛИКОМ
почистить уши + подстричь ногти (опционально, мб все в порядке)
намазаться солевым дезиком + пшикнуться ➡️➡️➡️ переодеться обратно в джинсы
рутина по голосу ➡️➡️➡️ читать закрытым ртом - читать что?) - можно читать ехал грека через реку, видит грека в реке рак, сунул грека руку в реку, рак за руку греку цап, 5 раз ➡️➡️➡️ проработать зажим на горле, 5 раз по 20 крутящих-давящих движений ➡️➡️➡️ можно пердеть губами чтобы расслабить губы, 5-10 раз на максимум ➡️➡️➡️ мычание монаха ОМ -вибрация, 5-10 раз ➡️➡️➡️ прокашляться громко), можно в процессе прокашливаться
сделать прическу, выпрямить волосы
Сделать thumbpulling 30 сек делаешь, 20 сек перерыв, 5 раз https://youtube.com/shorts/tLo2ddddTKg
обещай себе не улетать из реальности, в игры в порно и тд.. пжж
чекнуть свои ачивки по жизни и в интернет-маркетинге https://my-achievements-five.vercel.app/
ЕДА. обещай сначала добавить еду в приложуху ➡️➡️➡️ скушать
ЕДА. самый лучший режим питания это интервальное голодание 16+ часов, можешь кушать с 9 утра до 5 вечера.... на интервальном голодании ЯЗЫК ОЧИЩАЕТСЯ, чекай тайминги https://calories-rosy.vercel.app/
ЕДА. есть техника голодания 36 часов, только для продвинутых (опционально, можешь скипнуть)
ЕДА. ОТЕКИ. 5г калия в день. бады + картошка..
ЕДА. следи за солью, говорят надо есть +-2г соли в день, одна щепотка это 0.4г, чайная ложка это 10г
ЕДА. нарезать овощи!!!!!!!!!!!! (опционально, походу уже не нужно, ведь у тебя ИНТЕРВАЛЬНОЕ ГОЛОДАНИЕ, можешь скипнуть)
планирование yougile 10+ минут, планируй большие задачи и ПЕРЕТАСКИВАЙ
напиши в тг mystory28rus чем собираешься заниматься, и напиши что выполнил ежедневную базу) ➡️➡️➡️ шаблон Дневной Срез`;

// Функция подсветки и парсинга ссылок в тексте задания
const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#00ff15",
            textDecoration: "underline",
            wordBreak: "break-all",
            margin: "0 4px",
            fontWeight: "bold",
          }}
        >
          {part.includes("youtube") || part.includes("youtu.be")
            ? "▶ Смотреть видео"
            : part.includes("t.me")
            ? "💬 Открыть Telegram"
            : "🔗 Открыть ссылку"}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const QuestPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [rawQuestText, setRawQuestText] = useState<string>("");
  const [questTitle, setQuestTitle] = useState<string>("КВЕСТ ДИСЦИПЛИНЫ");
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isQuestActive, setIsQuestActive] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Загрузка состояния квеста из Firebase
  useEffect(() => {
    const loadQuestData = async () => {
      if (!user?.uid) return;
      try {
        const data = await getUserData(user.uid);
        const savedQuest = (data as any)?.active_quest;
        if (savedQuest) {
          try {
            const parsed = JSON.parse(savedQuest);
            setSteps(parsed.steps || []);
            setQuestTitle(parsed.title || "КВЕСТ");
            setCurrentStepIndex(parsed.currentIndex || 0);
            setCompletedSteps(parsed.completed || []);
            setIsQuestActive(parsed.isActive || false);
            setRawQuestText(parsed.rawText || "");
          } catch {
            // fallback
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки квеста:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestData();
  }, [user?.uid]);

  // Сохранение состояния в Firebase
  const syncQuestToFirebase = async (
    activeSteps: string[],
    index: number,
    completed: string[],
    isActive: boolean,
    title: string,
    rawText: string
  ) => {
    if (!user?.uid) return;
    try {
      const payload = {
        title,
        steps: activeSteps,
        currentIndex: index,
        completed,
        isActive,
        rawText,
        updatedAt: Date.now(),
      };
      await updateUserData(user.uid, "active_quest" as any, JSON.stringify(payload));
    } catch (err) {
      console.error("Ошибка синхронизации квеста:", err);
    }
  };

  // Запуск квеста из Textarea
  const startQuest = () => {
    if (!rawQuestText.trim()) return;

    const lines = rawQuestText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const title = lines[0];
    const taskSteps = lines.slice(1);

    setQuestTitle(title);
    setSteps(taskSteps);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsQuestActive(true);

    syncQuestToFirebase(taskSteps, 0, [], true, title, rawQuestText);
  };

  // Следующий шаг
  const handleCompleteStep = () => {
    const currentTask = steps[currentStepIndex];
    const newCompleted = [...completedSteps, currentTask];
    const nextIndex = currentStepIndex + 1;

    setCompletedSteps(newCompleted);
    setCurrentStepIndex(nextIndex);

    syncQuestToFirebase(steps, nextIndex, newCompleted, true, questTitle, rawQuestText);
  };

  // Пропуск опционального шага
  const handleSkipStep = () => {
    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);
    syncQuestToFirebase(steps, nextIndex, completedSteps, true, questTitle, rawQuestText);
  };

  // Сброс / Перезапуск квеста
  const handleResetQuest = () => {
    const isConfirmed = window.confirm("Сбросить текущий прогресс квеста и вернуться к настройкам?");
    if (!isConfirmed) return;

    setIsQuestActive(false);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    syncQuestToFirebase([], 0, [], false, "", "");
  };

  const handleSetTemplate = () => {
    setRawQuestText(DEFAULT_QUEST_TEMPLATE);
  };

  if (isLoading) {
    return (
      <ForgeLoader
        title="ПРОТОКОЛ КВЕСТОВ // ИНИЦИАЛИЗАЦИЯ"
        subtitle="РАЗВЕРТЫВАНИЕ ДИСЦИПЛИНАРНОГО РАННЕРА"
        logs={[
          "PARSING_QUEST_FLOW...",
          "CALIBRATING_FOCUS_STATE...",
          "SYNCING_XP_PROGRESSION...",
          "PREPARING_STAGE_TARGETS..."
        ]}
        accentColor="#00ff15"
      />
    );
  }

  const totalSteps = steps.length;
  const isFinished = isQuestActive && totalSteps > 0 && currentStepIndex >= totalSteps;
  const progressPercent = totalSteps > 0 ? Math.min(100, Math.round((currentStepIndex / totalSteps) * 100)) : 0;
  const currentTask = steps[currentStepIndex];
  const isOptional = currentTask && (currentTask.toLowerCase().includes("опционально") || currentTask.toLowerCase().includes("по желанию"));

  return (
    <div style={{ padding: "16px 20px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      {/* Верхняя шапка */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #222", paddingBottom: "15px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", letterSpacing: "1px" }}>
            FORGE<span style={{ color: "#00ff15" }}>OS</span> // КВЕСТЫ
          </h1>
          <span style={{ color: "#666", fontSize: "13px", fontFamily: "monospace" }}>
            ПОТОКОВОЕ ВЫПОЛНЕНИЕ • ДИСЦИПЛИНАРНЫЙ ПРОТОКОЛ
          </span>
        </div>
        <Link
          to="/"
          style={{
            backgroundColor: "#1a1a1a",
            color: "#00ff15",
            textDecoration: "none",
            padding: "8px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "bold",
            border: "1px solid #333",
          }}
        >
          ← В Дашборд
        </Link>
      </div>

      {/* Внешний портал базы квестов */}
      <div
        style={{
          backgroundColor: "#0f1a10",
          border: "1px solid #00ff1544",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>Внешняя база квестов:</span>
          <div style={{ color: "#fff", fontSize: "14px", fontWeight: "bold" }}>Life Quests Portal</div>
        </div>
        <a
          href="https://life-quests-tau.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#00ff15",
            color: "#000",
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          Открыть life-quests ↗
        </a>
      </div>

      {/* ЭКРАН 1: Настройка и вставка текста квеста */}
      {!isQuestActive && (
        <div style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", color: "#00ff15" }}>Загрузить текст квеста</h2>
            <button
              onClick={handleSetTemplate}
              style={{
                backgroundColor: "#1f1f1f",
                border: "1px solid #333",
                color: "#aaa",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Вставить «Ежедневную Базу»
            </button>
          </div>

          <p style={{ color: "#888", fontSize: "13px", margin: "0 0 12px 0" }}>
            Первая строка станет <strong>названием квеста</strong>. Каждая следующая строка — <strong>отдельным шагом</strong>, который ты будешь закрывать по очереди.
          </p>

          <textarea
            rows={12}
            value={rawQuestText}
            onChange={(e) => setRawQuestText(e.target.value)}
            placeholder="Вставь сюда текст своего квеста..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "#080808",
              border: "1px solid #333",
              color: "#00ff15",
              fontFamily: "monospace",
              fontSize: "14px",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "16px",
              lineHeight: "1.5",
            }}
          />

          <button
            onClick={startQuest}
            disabled={!rawQuestText.trim()}
            style={{
              width: "100%",
              backgroundColor: rawQuestText.trim() ? "#00ff15" : "#333",
              color: "#000",
              border: "none",
              padding: "14px",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: rawQuestText.trim() ? "pointer" : "not-allowed",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            🔥 НАЧАТЬ ВЫПОЛНЕНИЕ КВЕСТА
          </button>
        </div>
      )}

      {/* ЭКРАН 2: Активное прохождение квеста */}
      {isQuestActive && !isFinished && (
        <div>
          {/* Панель статуса и HUD */}
          <div style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#00ff15", fontWeight: "bold", fontSize: "14px", letterSpacing: "1px" }}>
                🎯 {questTitle}
              </span>
              <span style={{ color: "#888", fontSize: "13px", fontFamily: "monospace" }}>
                Шаг {currentStepIndex + 1} из {totalSteps} ({progressPercent}%)
              </span>
            </div>

            {/* Прогресс-бар */}
            <div style={{ width: "100%", height: "8px", backgroundColor: "#1c1c1c", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  backgroundColor: "#00ff15",
                  boxShadow: "0 0 10px #00ff1588",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#666" }}>Очки дисциплины: +{completedSteps.length * 100} XP</span>
              <button
                onClick={handleResetQuest}
                style={{ background: "none", border: "none", color: "#555", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
              >
                Прервать / Настроить квест
              </button>
            </div>
          </div>

          {/* Карточка текущей задачи (Фокус-блок) */}
          <div
            style={{
              backgroundColor: "#0a140c",
              border: "2px solid #00ff15",
              borderRadius: "10px",
              padding: "24px 20px",
              marginBottom: "20px",
              boxShadow: "0 0 20px rgba(0, 255, 21, 0.08)",
            }}
          >
            <div style={{ fontSize: "11px", color: "#00ff15", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px", fontWeight: "bold" }}>
              ▶ ТЕКУЩАЯ ЗАДАЧА // ВЫПОЛНИ СЕЙЧАС:
            </div>

            <div
              style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#fff",
                fontWeight: "500",
                marginBottom: "25px",
                wordBreak: "break-word",
              }}
            >
              {renderTextWithLinks(currentTask)}
            </div>

            {/* Кнопки завершения */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleCompleteStep}
                style={{
                  flex: 1,
                  minWidth: "220px",
                  backgroundColor: "#00ff15",
                  color: "#000",
                  border: "none",
                  padding: "16px 20px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  boxShadow: "0 4px 15px rgba(0, 255, 21, 0.3)",
                }}
              >
                ✓ ГОТОВО // СДЕЛАЛ (+100 XP)
              </button>

              {isOptional && (
                <button
                  onClick={handleSkipStep}
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #444",
                    color: "#aaa",
                    padding: "16px 20px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Пропустить (Опционально)
                </button>
              )}
            </div>
          </div>

          {/* Следующая задача на горизонте */}
          {currentStepIndex + 1 < totalSteps && (
            <div style={{ backgroundColor: "#111", border: "1px dashed #2a2a2a", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Следом по плану:
              </span>
              <span style={{ color: "#888", fontSize: "14px" }}>{steps[currentStepIndex + 1]}</span>
            </div>
          )}

          {/* История закрытых шагов */}
          {completedSteps.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h3 style={{ fontSize: "13px", color: "#555", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "1px" }}>
                Выполнено в этом квесте ({completedSteps.length}):
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {completedSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#0d0d0d",
                      border: "1px solid #1a1a1a",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      color: "#555",
                      fontSize: "13px",
                      textDecoration: "line-through",
                    }}
                  >
                    ✓ {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ЭКРАН 3: Квест полностью пройден */}
      {isFinished && (
        <div style={{ backgroundColor: "#0e1f11", border: "2px solid #00ff15", borderRadius: "10px", padding: "30px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>👑</div>
          <h2 style={{ color: "#00ff15", margin: "0 0 10px 0", fontSize: "26px" }}>КВЕСТ ПОЛНОСТЬЮ ЗАКРЫТ!</h2>
          <p style={{ color: "#aaa", fontSize: "15px", margin: "0 0 25px 0" }}>
            Ты выполнил все <strong>{totalSteps}</strong> шагов. Дисциплина укреплена (+{totalSteps * 100} XP).
          </p>
          <button
            onClick={handleResetQuest}
            style={{
              backgroundColor: "#00ff15",
              color: "#000",
              border: "none",
              padding: "14px 28px",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Начать новый квест
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestPage;
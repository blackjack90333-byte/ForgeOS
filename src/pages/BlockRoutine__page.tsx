// src/pages/BlockRoutine__page.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import { getUserData, updateUserData } from "../services/firebase";
import { RoutineBlock, RoutineRunnerState, RoutineTag } from "../types";
import ForgeLoader from "../components/ForgeLoader";
import RoutineTabsLibrary from "../components/RoutineTabsLibrary";
import RoutineDropStack from "../components/RoutineDropStack";
import RoutineHeatmap from "../components/RoutineHeatmap";
import TaskAutoTimer from "../components/TaskAutoTimer";
import RoutineShareReport from "../components/RoutineShareReport";

const LOCAL_HEATMAP_KEY = "forgeos_routine_activity_dates";

const getTodayFormatted = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const DEFAULT_BLOCKS: RoutineBlock[] = [
  {
    id: "block_not_skuf",
    title: "Я НЕ СКУФ (треня version)",
    tag: "СПОРТ",
    benefits: [
      "Сухой хищный рельеф: сверхсигнал редкости, самки вожделеют тебя сами",
      "Стальные клешни и плечи: чужие самцы инстинктивно жмутся к полу",
      "Арматурный стояк: тотальный животный разврат и доминирование",
      "+Плоский живот",
      "+V образный силуэт - Сверх Сильный Сигнал Редкости",
      "Бронебойный каркас: ноль признаков скинни-фэт дрыща",
      "Печь для калорий: топит жир даже в покое",
    ],
    items: [
      "Замер веса + складка калипером",
      "Вакуум 5 раз на четвереньках",
      "Планка от 3 минут супер польза",
      "ТРЕНЯ С ГИРЕЙ КРУГОВАЯ ФУЛБАДИ",
      "200 упражнений Кегеля (контроль тазового дна)",
    ],
  },
  {
    id: "block_not_sherd",
    title: "Я НЕ ШЕРСТЬ (ГИГИЕНА & ПОРЯДОК)",
    tag: "ГИГИЕНА",
    benefits: [
      "Запах альфа-хищника: самки текут от одного твоего присутствия рядом",
      "Челюсть гигачада и чистое табло: моментальный сигнал высшей генетики",
      "Логово вожака: абсолютный контроль над своей территорией",
    ],
    items: [
      "Сходить в душ (с холодной ноткой)",
      "Почистить зубы и язык",
      "Подстричь ногти + почистить уши",
      "Прибраться в комнате 5 минут",
      "Протереть рабочий стол и навести порядок",
      "Сделать прическу, выпрямить волосы",
    ],
  },
  {
    id: "block_focus_habits",
    title: "ФОКУС & ВНЕДРЕНИЕ ПРИВЫЧЕК",
    tag: "РАЗУМ",
    benefits: [
      "Громовой рык вожака: стая цепенеет от страха, самки — от возбуждения",
      "Ядерный реактор энергии: вся первобытная ярость идет на захват бабла",
      "Хищный лазерный фокус: стая пускает слюни, пока ты жрешь лучшее мясо",
    ],
    items: [
      "Работа с голосом (пердеть губами 10 раз)",
      "Работа с голосом (ОМ 10 раз)",
      "Работа с голосом (читать закрытым ртом)",
      "Зафиксировать дефицит калорий",
      "Обещай себе не срываться в игры и дешевый дофамин",
      "Помни ты должен жить без сексуальной стимуляции через экран - сегодня и всегда 😎😎😎",
    ],
  },
  {
    id: "block_1788930463011",
    title: "Припомнить карточки Анки + Ходьба",
    tag: "ДИСЦИПЛИНА",
    benefits: [
      "Мозг хищника: впитываешь знания на шагах, пока стая деградирует",
      "Интеллектуальное превосходство: держишь базу в оперативной памяти",
      "Пассивный жиросжиг: час ходьбы плавит сало без стресса для сердца",
    ],
    items: ["Идти по дорожке час + Повторять карточки анки"],
  },
  {
    id: "block_1788930847241",
    title: "Я НЕ СКУФ (chill version)",
    tag: "СПОРТ",
    benefits: [
      "Сухой хищный рельеф: сверхсигнал редкости, самки вожделеют тебя сами",
      "Стальные клешни и плечи: чужие самцы инстинктивно жмутся к полу",
      "Арматурный стояк: тотальный животный разврат и доминирование",
      "+Плоский живот",
      "+V образный силуэт - Сверх Сильный Сигнал Редкости",
    ],
    items: [
      "Вакуум 5 раз на корточках",
      "Планка от 3 минут супер польза",
      "Треня от негра https://youtu.be/lMeB_5T3fC8",
      "200 кегеля",
      "30 приседаний",
      "30 отжиманий",
      "10 подтягиваний",
    ],
  },
  {
    id: "block_mfr_massage",
    title: "ПРОРАБОТКА ЗАЖИМОВ // МФР & ПЕРКУССИЯ",
    tag: "ЗДОРОВЬЕ",
    benefits: [
      "Снятие панциря зажимов: расслабленный хищник готов к броску без скованности",
      "Осанка доминатора: развернутые плечи и прямая спина заявляют о силе издалека",
      "Бешеный кровоток: мышцы мгновенно наполняются кровью и восстанавливаются",
    ],
    items: [
      "МФР ролл: грудной отдел спины и лопатки 2 мин",
      "МФР ролл: ягодицы и бицепс бедра по 1 мин",
      "МФР ролл: икры и квадрицепсы по 1 мин",
      "Перкуссионный массажер: трапеции и шея (разбить спазмы)",
      "Перкуссионный массажер: триггерные точки в ягодицах и пояснице",
      "Перкуссионный массажер: грудные мышцы (раскрыть осанку)",
    ],
  },
  {
    id: "block_eye_training",
    title: "ВЗГЛЯД ОРЛА // ТРЕНИРОВКА ГЛАЗ",
    tag: "ЗДОРОВЬЕ",
    benefits: [
      "Зрение хищника: четкий дальнобойный фокус без мыла и усталости",
      "Тяжелый пронзительный взгляд: смотришь в упор без моргания, ломая чужую волю",
      "Разгрузка зрительной коры: ясность мышления и свежая голова для работы",
    ],
    items: [
      "12+ минут играть в яндекс игры на мобилке с закрытым правым глазом (повязка для сна хорошо закрывает глаз)",
      "3 минуты: медленно води пальцем по кругу, по диагоналям и «восьмеркой» (знак бесконечности)",
      "10 повторений: Плавная конвергенция (сведение к носу)",
      "2 минуты: Пальминг (Разотри ладони до горячего состояния)",
    ],
  },
  {
    id: "block_1788996300765",
    title: "Лечь - проснуться в одно время",
    tag: "ДИСЦИПЛИНА",
    benefits: [
      "Поток энергии: когда режим стабильный +500% к энергии",
    ],
    items: [
      "Лечь в 10",
      "Проснуться в 6",
    ],
  },
  {
    id: "block_1788996396824",
    title: "Подготовка (покушать)",
    tag: "ДИСЦИПЛИНА",
    benefits: [
      "Дисциплина ебет мотивацию, а ты с дисциплиной будешь всех ебать",
    ],
    items: [
      "Схавать 50-100г овсянки",
      "Схавать 4-5 яиц жареных",
      "Подождать 1 час (чтобы переварилось)",
    ],
  },
  {
    id: "block_1789197309336",
    title: "Закрыть гештальты",
    tag: "РАЗУМ",
    benefits: [
      "Свободный разум",
      "Оперативка свободна",
    ],
    items: [
      "найти 3 гештальта которых сегодня закроешь (можешь искать в блокноте или мессенджерах)",
      "1 закрыт",
      "2 закрыт",
      "3 закрыт",
    ],
  },
];

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
            ? "▶ Видео"
            : part.includes("t.me")
            ? "💬 Telegram"
            : "🔗 Ссылка"}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const BlockRoutinePage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [blocksLibrary, setBlocksLibrary] = useState<RoutineBlock[]>(DEFAULT_BLOCKS);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([
    "block_1788996396824",
    "block_eye_training",
    "block_focus_habits",
    "block_1788930847241",
    "block_1788930463011",
    "block_not_sherd",
    "block_1789197309336",
  ]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Даты активности для Heatmap
  const [activeDates, setActiveDates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_HEATMAP_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Модалка создания / редактирования блока
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockTitleInput, setBlockTitleInput] = useState<string>("");
  const [blockTagInput, setBlockTagInput] = useState<RoutineTag>("СПОРТ");
  const [blockItemsText, setBlockItemsText] = useState<string>("");
  const [blockBenefitsText, setBlockBenefitsText] = useState<string>("");

  // Модалка Импорта / Экспорта JSON
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>("");

  // Фиксация сегодняшнего дня как активного (ТОЛЬКО ПОСЛЕ ПОЛНОГО ЗАКРЫТИЯ КВЕСТА)
  const markTodayAsActive = (currentDates: string[] = activeDates): string[] => {
    const today = getTodayFormatted();
    if (!currentDates.includes(today)) {
      const updated = [...currentDates, today];
      setActiveDates(updated);
      try {
        localStorage.setItem(LOCAL_HEATMAP_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Local storage error:", err);
      }
      return updated;
    }
    return currentDates;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      try {
        const userData = await getUserData(user.uid);
        const raw = (userData as any)?.block_routine_data;
        if (raw) {
          try {
            const parsed: RoutineRunnerState = JSON.parse(raw);
            if (parsed.blocksLibrary && parsed.blocksLibrary.length > 0) {
              setBlocksLibrary(parsed.blocksLibrary);
            }
            if (Array.isArray(parsed.historyDates)) {
              const histDates = parsed.historyDates;
              setActiveDates((prev) => Array.from(new Set([...prev, ...histDates])));
            }
            if (parsed.selectedBlockIds) {
              setSelectedBlockIds(parsed.selectedBlockIds);
            }
            setActiveStepIndex(parsed.activeStepIndex || 0);
            setCompletedItems(parsed.completedItems || []);
            setIsRunning(parsed.isRunning || false);
          } catch {
            // fallback
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки блочной рутины:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.uid]);

  // Единая атомарная функция сохранения в Firestore и localStorage
  const syncToFirebase = async (
    lib: RoutineBlock[],
    selectedIds: string[],
    running: boolean,
    stepIdx: number,
    completed: string[],
    dates: string[] = activeDates
  ) => {
    if (!user?.uid) return;
    try {
      const payload: RoutineRunnerState = {
        blocksLibrary: lib,
        selectedBlockIds: selectedIds,
        isRunning: running,
        activeStepIndex: stepIdx,
        completedItems: completed,
        historyDates: dates,
      };

      localStorage.setItem(LOCAL_HEATMAP_KEY, JSON.stringify(dates));
      await updateUserData(user.uid, "block_routine_data" as any, JSON.stringify(payload));
    } catch (err) {
      console.error("Критическая ошибка синхронизации с Firestore:", err);
    }
  };

  const getCompiledSteps = (): { blockTitle: string; task: string }[] => {
    const result: { blockTitle: string; task: string }[] = [];
    selectedBlockIds.forEach((id) => {
      const b = blocksLibrary.find((x) => x.id === id);
      if (b) {
        b.items.forEach((item) => {
          result.push({ blockTitle: b.title, task: item });
        });
      }
    });
    return result;
  };

  const compiledSteps = getCompiledSteps();
  const totalSteps = compiledSteps.length;
  const isFinished = isRunning && totalSteps > 0 && activeStepIndex >= totalSteps;
  const progressPercent =
    totalSteps > 0 ? Math.min(100, Math.round((activeStepIndex / totalSteps) * 100)) : 0;
  const currentItem = compiledSteps[activeStepIndex];

  const handleDropBlock = (blockId: string, targetIndex?: number) => {
    let next = selectedBlockIds.filter((id) => id !== blockId);

    if (typeof targetIndex === "number") {
      next.splice(targetIndex, 0, blockId);
    } else {
      next.push(blockId);
    }

    setSelectedBlockIds(next);
    syncToFirebase(blocksLibrary, next, isRunning, activeStepIndex, completedItems);
  };

  const handleToggleBlockInStack = (id: string) => {
    let next: string[];
    if (selectedBlockIds.includes(id)) {
      next = selectedBlockIds.filter((x) => x !== id);
    } else {
      next = [...selectedBlockIds, id];
    }
    setSelectedBlockIds(next);
    syncToFirebase(blocksLibrary, next, isRunning, activeStepIndex, completedItems);
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedBlockIds.length) return;

    const next = [...selectedBlockIds];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    setSelectedBlockIds(next);
    syncToFirebase(blocksLibrary, next, isRunning, activeStepIndex, completedItems);
  };

  const handleStartRunner = () => {
    if (compiledSteps.length === 0) return;
    setIsRunning(true);
    setActiveStepIndex(0);
    setCompletedItems([]);
    syncToFirebase(blocksLibrary, selectedBlockIds, true, 0, []);
  };

  // Предзагрузка звука выполнения задачи
  const completeSoundRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/sound/achieve_sound.mp3");
    audio.preload = "auto";
    completeSoundRef.current = audio;
  }, []);

  const playAchieveSound = () => {
    if (completeSoundRef.current) {
      completeSoundRef.current.currentTime = 0;
      completeSoundRef.current.play().catch(() => {
        // браузерные ограничения на автовоспроизведение не сработают, 
        // так как вызов происходит внутри прямого клика пользователя
      });
    }
  };

  const handleCompleteStep = () => {
    if (!currentItem) return;

    // 🔊 Проигрываем звук ачивки
    playAchieveSound();

    const newCompleted = [...completedItems, currentItem.task];
    const nextIdx = activeStepIndex + 1;

    setCompletedItems(newCompleted);
    setActiveStepIndex(nextIdx);

    if (nextIdx >= totalSteps) {
      const updatedDates = markTodayAsActive();
      syncToFirebase(blocksLibrary, selectedBlockIds, true, nextIdx, newCompleted, updatedDates);
    } else {
      syncToFirebase(blocksLibrary, selectedBlockIds, true, nextIdx, newCompleted);
    }
  };

  const handleSkipStep = () => {
    const nextIdx = activeStepIndex + 1;
    setActiveStepIndex(nextIdx);

    if (nextIdx >= totalSteps) {
      const updatedDates = markTodayAsActive();
      syncToFirebase(blocksLibrary, selectedBlockIds, true, nextIdx, completedItems, updatedDates);
    } else {
      syncToFirebase(blocksLibrary, selectedBlockIds, true, nextIdx, completedItems);
    }
  };

  const handleResetRunner = () => {
    if (!window.confirm("Остановить выполнение и вернуться в конструктор?")) return;
    setIsRunning(false);
    setActiveStepIndex(0);
    setCompletedItems([]);
    syncToFirebase(blocksLibrary, selectedBlockIds, false, 0, []);
  };

  const handleOpenCreateBlock = () => {
    setEditingBlockId(null);
    setBlockTitleInput("");
    setBlockTagInput("СПОРТ");
    setBlockItemsText("");
    setBlockBenefitsText("");
    setShowBlockModal(true);
  };

  const handleOpenEditBlock = (b: RoutineBlock) => {
    setEditingBlockId(b.id);
    setBlockTitleInput(b.title);
    setBlockTagInput((b.tag as RoutineTag) || "СПОРТ");
    setBlockItemsText(b.items.join("\n"));
    setBlockBenefitsText((b.benefits || []).join("\n"));
    setShowBlockModal(true);
  };

  const handleSaveBlock = () => {
    if (!blockTitleInput.trim()) return;

    const items = blockItemsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const benefits = blockBenefitsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let nextLib: RoutineBlock[];
    if (editingBlockId) {
      nextLib = blocksLibrary.map((b) =>
        b.id === editingBlockId
          ? {
              ...b,
              title: blockTitleInput.trim(),
              tag: blockTagInput,
              items,
              benefits,
            }
          : b
      );
    } else {
      const newBlock: RoutineBlock = {
        id: `block_${Date.now()}`,
        title: blockTitleInput.trim(),
        tag: blockTagInput,
        items,
        benefits,
      };
      nextLib = [...blocksLibrary, newBlock];
      setSelectedBlockIds((prev) => [...prev, newBlock.id]);
    }

    setBlocksLibrary(nextLib);
    setShowBlockModal(false);
    syncToFirebase(nextLib, selectedBlockIds, isRunning, activeStepIndex, completedItems);
  };

  const handleDeleteBlock = (id: string) => {
    if (!window.confirm("Удалить этот блок из библиотеки?")) return;
    const nextLib = blocksLibrary.filter((b) => b.id !== id);
    const nextSelected = selectedBlockIds.filter((x) => x !== id);
    setBlocksLibrary(nextLib);
    setSelectedBlockIds(nextSelected);
    syncToFirebase(nextLib, nextSelected, isRunning, activeStepIndex, completedItems);
  };

  const handleOpenExport = () => {
    setJsonText(JSON.stringify({ blocksLibrary, selectedBlockIds }, null, 2));
    setShowJsonModal(true);
  };

  const handleApplyJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.blocksLibrary && Array.isArray(parsed.blocksLibrary)) {
        setBlocksLibrary(parsed.blocksLibrary);
        const sel = parsed.selectedBlockIds || parsed.blocksLibrary.map((b: any) => b.id);
        setSelectedBlockIds(sel);
        syncToFirebase(parsed.blocksLibrary, sel, false, 0, []);
        setShowJsonModal(false);
      } else {
        alert("Неверный формат JSON.");
      }
    } catch {
      alert("Ошибка синтаксиса JSON.");
    }
  };

  if (isLoading) {
    return <ForgeLoader title="ЗАГРУЗКА КОНСТРУКТОРА РУТИНЫ..." logs={["ПОСТРОЕНИЕ МОДУЛЕЙ...", "СИНХРОНИЗАЦИЯ ТЕГОВ..."]} />;
  }

  // --------------------------------------------------------------------------
  // ЭКРАН РАННЕРА
  // --------------------------------------------------------------------------
  if (isRunning) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#08080a", padding: "16px", color: "#ddd", fontFamily: "monospace", fontSize: "16px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1c1f26", paddingBottom: "12px", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "14px", color: "#00ff15", letterSpacing: "1px", fontWeight: "bold" }}>
              ▶ РАННЕР РУТИНЫ
            </span>
            <div style={{ fontSize: "16px", color: "#fff", fontWeight: "bold", marginTop: "2px" }}>
              Шаг {activeStepIndex + 1} из {totalSteps} ({progressPercent}%)
            </div>
          </div>

          <button
            onClick={handleResetRunner}
            style={{
              backgroundColor: "#2a1212",
              border: "1px solid #ff4d4d",
              color: "#ff4d4d",
              padding: "7px 14px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            ВЫЙТИ В КОНСТРУКТОР
          </button>
        </div>

        <div style={{ width: "100%", height: "8px", backgroundColor: "#141720", borderRadius: "4px", overflow: "hidden", marginBottom: "20px" }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              backgroundColor: "#00ff15",
              boxShadow: "0 0 12px rgba(0, 255, 21, 0.4)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {isFinished ? (
          <div style={{ backgroundColor: "#0c1a10", border: "2px solid #00ff15", borderRadius: "8px", padding: "30px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>👑</div>
            <h2 style={{ color: "#00ff15", margin: "0 0 10px 0", fontSize: "24px" }}>РУТИНА ДНЯ ВЫПОЛНЕНА!</h2>
            <p style={{ color: "#aaa", fontSize: "16px", margin: "0 0 20px 0" }}>
              Все <strong>{totalSteps}</strong> шагов закрыты. День зафиксирован в Heat Map!
            </p>

            <button
              onClick={handleResetRunner}
              style={{
                backgroundColor: "#00ff15",
                color: "#000",
                border: "none",
                padding: "13px 28px",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              ВЕРНУТЬСЯ В КОНСТРУКТОР
            </button>

            {/* 📢 БЛОК ШЕРИНГА И КОПИРОВАНИЯ В ОДИН КЛИК */}
            <RoutineShareReport
              completedItems={completedItems}
              totalSteps={totalSteps}
              streakDaysCount={activeDates.length}
            />
          </div>
        ) : (
          <div>
            <div
              style={{
                backgroundColor: "#0d1410",
                border: "2px solid #00ff15",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "16px",
                boxShadow: "0 0 20px rgba(0, 255, 21, 0.1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px", color: "#00ff15", letterSpacing: "1px", fontWeight: "bold" }}>
                  БЛОК: {currentItem?.blockTitle}
                </span>
                <span style={{ fontSize: "14px", color: "#666" }}>+100 XP</span>
              </div>

              <div
                style={{
                  fontSize: "21px",
                  lineHeight: "1.5",
                  color: "#fff",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  wordBreak: "break-word",
                }}
              >
                {renderTextWithLinks(currentItem?.task || "")}
              </div>

              {/* 🔥 АВТО-ТАЙМЕР ТЕКУЩЕЙ ЗАДАЧИ */}
              <TaskAutoTimer taskText={currentItem?.task || ""} stepIndex={activeStepIndex} />

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={handleCompleteStep}
                  style={{
                    flex: 2,
                    minWidth: "180px",
                    backgroundColor: "#00ff15",
                    color: "#000",
                    border: "none",
                    padding: "15px",
                    borderRadius: "4px",
                    fontSize: "17px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    boxShadow: "0 4px 14px rgba(0, 255, 21, 0.25)",
                  }}
                >
                  ✓ ВЫПОЛНЕНО
                </button>
                <button
                  onClick={handleSkipStep}
                  style={{
                    flex: 1,
                    backgroundColor: "#161922",
                    border: "1px solid #333",
                    color: "#888",
                    padding: "15px",
                    borderRadius: "4px",
                    fontSize: "15px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                  }}
                >
                  ПРОПУСТИТЬ →
                </button>
              </div>
            </div>

            {activeStepIndex + 1 < totalSteps && (
              <div style={{ backgroundColor: "#0e1014", border: "1px dashed #232733", borderRadius: "6px", padding: "12px 16px", marginBottom: "16px" }}>
                <span style={{ fontSize: "14px", color: "#666", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                  Следующее действие:
                </span>
                <span style={{ fontSize: "15px", color: "#aaa" }}>
                  [{compiledSteps[activeStepIndex + 1].blockTitle}] — {compiledSteps[activeStepIndex + 1].task}
                </span>
              </div>
            )}

            {completedItems.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "14px", color: "#666", textTransform: "uppercase", marginBottom: "8px" }}>
                  Сделано ({completedItems.length}):
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {completedItems.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: "#0b0c0e", border: "1px solid #161820", padding: "8px 12px", borderRadius: "3px", color: "#555", fontSize: "14px", textDecoration: "line-through" }}>
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ЭКРАН КОНСТРУКТОРА С HEAT MAP
  // --------------------------------------------------------------------------
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#070709", padding: "16px", color: "#ddd", fontFamily: "monospace", fontSize: "16px" }}>
      <style>{`
        .routine_split_layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 900px) {
          .routine_split_layout {
            grid-template-columns: 1.15fr 0.85fr;
            align-items: start;
          }
        }
      `}</style>

      {/* Верхняя навигационная панель */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 12px auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1c1f26", paddingBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link to="/" style={{ color: "#666", textDecoration: "none", fontSize: "15px" }}>&larr; ДАШБОРД</Link>
          <span style={{ color: "#00ff15", fontWeight: "bold", fontSize: "17px" }}>
            КОНСТРУКТОР РУТИНЫ
          </span>
        </div>

        <button
          onClick={handleOpenExport}
          style={{
            backgroundColor: "#11141c",
            border: "1px solid #283044",
            color: "#3498db",
            padding: "8px 14px",
            borderRadius: "4px",
            fontSize: "14px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontWeight: "bold",
          }}
        >
          📋 JSON / ИМПОРТ
        </button>
      </div>

      {/* ПОЗИЦИЯ: HEAT MAP */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <RoutineHeatmap
          activeDates={activeDates}
          rowsCount={3}
          colsCount={38}
          squareSize={13}
          activeColor="#00ff15"
          emptyColor="#11141b"
          label="DISCIPLINE CHAIN"
        />
      </div>

      {/* Основная сетка каталога и очереди */}
      <div className="routine_split_layout">
        {/* ЛЕВАЯ КОЛОНКА */}
        <RoutineTabsLibrary
          blocks={blocksLibrary}
          selectedBlockIds={selectedBlockIds}
          onAddBlockToStack={handleToggleBlockInStack}
          onEditBlock={handleOpenEditBlock}
          onDeleteBlock={handleDeleteBlock}
          onCreateNewBlock={handleOpenCreateBlock}
        />

        {/* ПРАВАЯ КОЛОНКА */}
        <RoutineDropStack
          selectedBlockIds={selectedBlockIds}
          blocksLibrary={blocksLibrary}
          onDropBlock={handleDropBlock}
          onRemoveBlock={handleToggleBlockInStack}
          onMoveBlock={handleMoveBlock}
          onStartRunner={handleStartRunner}
          totalStepsCount={compiledSteps.length}
        />
      </div>

      {/* Модалка создания / редактирования */}
      {showBlockModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#0c0d12", border: "1px solid #283040", borderRadius: "6px", padding: "20px", maxWidth: "500px", width: "100%", color: "#ddd" }}>
            <h3 style={{ margin: "0 0 14px 0", color: "#00ff15", fontSize: "16px" }}>
              {editingBlockId ? "РЕДАКТИРОВАНИЕ КВЕСТА" : "НОВЫЙ КВЕСТ / БЛОК"}
            </h3>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "14px", color: "#888", marginBottom: "4px" }}>
                НАЗВАНИЕ КВЕСТА:
              </label>
              <input
                type="text"
                value={blockTitleInput}
                placeholder="Например: Я НЕ СКУФ (ФИЗУХА)"
                onChange={(e) => setBlockTitleInput(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px", backgroundColor: "#141722", border: "1px solid #2d3548", color: "#fff", borderRadius: "4px", fontFamily: "monospace", fontSize: "15px" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "14px", color: "#888", marginBottom: "4px" }}>
                КАТЕГОРИЯ (ТЕГ):
              </label>
              <select
                value={blockTagInput}
                onChange={(e) => setBlockTagInput(e.target.value as RoutineTag)}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px", backgroundColor: "#141722", border: "1px solid #2d3548", color: "#3498db", borderRadius: "4px", fontFamily: "monospace", fontSize: "15px" }}
              >
                <option value="СПОРТ">СПОРТ</option>
                <option value="ГИГИЕНА">ГИГИЕНА</option>
                <option value="РАЗУМ">РАЗУМ</option>
                <option value="ЗДОРОВЬЕ">ЗДОРОВЬЕ</option>
                <option value="ДИСЦИПЛИНА">ДИСЦИПЛИНА</option>
                <option value="ДОФАМИН">ДОФАМИН</option>
                <option value="ФИНАНСЫ">ФИНАНСЫ</option>
                <option value="ПРОЧЕЕ">ПРОЧЕЕ</option>
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "14px", color: "#00ff15", marginBottom: "4px", fontWeight: "bold" }}>
                ПРОФИТ / БЕНЕФИТЫ (КАЖДЫЙ С НОВОЙ СТРОКИ):
              </label>
              <textarea
                rows={3}
                value={blockBenefitsText}
                placeholder={`Сухой хищный рельеф: сверхсигнал редкости\nЗапах альфа-хищника`}
                onChange={(e) => setBlockBenefitsText(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 10px",
                  backgroundColor: "#141722",
                  border: "1px solid #00ff1544",
                  color: "#85e89d",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  lineHeight: "1.4",
                }}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "14px", color: "#888", marginBottom: "4px" }}>
                СПИСОК ЗАДАЧ (КАЖДАЯ С НОВОЙ СТРОКИ):
              </label>
              <textarea
                rows={8}
                value={blockItemsText}
                placeholder={`100 приседаний\n50 отжиманий\nПланка 3 минуты`}
                onChange={(e) => setBlockItemsText(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px", backgroundColor: "#141722", border: "1px solid #2d3548", color: "#00ff15", borderRadius: "4px", fontFamily: "monospace", fontSize: "15px", lineHeight: "1.4" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowBlockModal(false)}
                style={{ backgroundColor: "#1a1d26", border: "1px solid #333", color: "#888", padding: "10px 16px", cursor: "pointer", borderRadius: "4px", fontFamily: "monospace", fontSize: "14px" }}
              >
                Отмена
              </button>
              <button
                onClick={handleSaveBlock}
                style={{ backgroundColor: "#00ff15", color: "#000", border: "none", padding: "10px 18px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace", fontSize: "14px" }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка JSON */}
      {showJsonModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#0c0d12", border: "1px solid #283040", borderRadius: "6px", padding: "20px", maxWidth: "580px", width: "100%", color: "#ddd" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#3498db", fontSize: "16px" }}>
              ИМПОРТ / ЭКСПОРТ БЛОКОВ (JSON)
            </h3>
            <p style={{ fontSize: "14px", color: "#888", margin: "0 0 12px 0" }}>
              Скопируй этот JSON себе для бэкапа или вставь новый и нажми «Применить импорт».
            </p>

            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px", backgroundColor: "#07080b", border: "1px solid #283040", color: "#00ff15", borderRadius: "4px", fontFamily: "monospace", fontSize: "14px", marginBottom: "16px" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowJsonModal(false)}
                style={{ backgroundColor: "#1a1d26", border: "1px solid #333", color: "#888", padding: "10px 16px", cursor: "pointer", borderRadius: "4px", fontFamily: "monospace", fontSize: "14px" }}
              >
                Закрыть
              </button>
              <button
                onClick={handleApplyJsonImport}
                style={{ backgroundColor: "#3498db", color: "#000", border: "none", padding: "10px 18px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace", fontSize: "14px" }}
              >
                Применить импорт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockRoutinePage;
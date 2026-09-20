// src/components/RoutineShareReport.tsx
import React, { useState } from "react";

interface RoutineShareReportProps {
  completedItems: string[];
  totalSteps: number;
  streakDaysCount?: number;
}

const RoutineShareReport: React.FC<RoutineShareReportProps> = ({
  completedItems,
  totalSteps,
  streakDaysCount = 0,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const todayStr = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Генерируем сочный структурированный текст для Telegram / VK
  const generateReportText = (): string => {
    const header = `⚔️ FORGE OS // РУТИНА ЗАКРЫТА!\n📅 ${todayStr}\n🔥 Закрыто шагов: ${completedItems.length} из ${totalSteps}${
      streakDaysCount > 0 ? `\n⚡ Дней в строю: ${streakDaysCount}` : ""
    }\n\n📋 ВЫПОЛНЕННЫЕ КВЕСТЫ:`;

    const tasksList = completedItems
      .map((item, idx) => `${idx + 1}. ✅ ${item}`)
      .join("\n");

    const footer = `\n\n🦾 Дисциплина ебет мотивацию. День зафиксирован в Heat Map.`;

    return `${header}\n${tasksList}${footer}`;
  };

  const reportText = generateReportText();

  // 1. Копирование в буфер
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(reportText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = reportText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Ошибка копирования в буфер:", err);
    }
  };

  // 2. Открыть в Telegram
  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(
      "https://t.me"
    )}&text=${encodeURIComponent(reportText)}`;
    window.open(tgUrl, "_blank");
  };

  // 3. Открыть во ВКонтакте
  const handleShareVK = () => {
    const vkUrl = `https://vk.com/share.php?comment=${encodeURIComponent(reportText)}`;
    window.open(vkUrl, "_blank");
  };

  // 4. Нативный Share на смартфонах
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Рутина дня выполнена!",
          text: reportText,
        });
      } catch {
        // пользователь отменил
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#070b08",
        border: "1px solid #00ff1544",
        borderRadius: "8px",
        padding: "16px",
        marginTop: "20px",
        textAlign: "left",
      }}
    >
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
        <span
          style={{
            fontSize: "13px",
            color: "#00ff15",
            fontWeight: "bold",
            letterSpacing: "1px",
            fontFamily: "monospace",
          }}
        >
          📢 ПОДЕЛИТЬСЯ РЕЗУЛЬТАТОМ
        </span>

        <span style={{ fontSize: "12px", color: "#666", fontFamily: "monospace" }}>
          {completedItems.length} задач готово к отправке
        </span>
      </div>

      {/* Окно предпросмотра отчета */}
      <pre
        style={{
          backgroundColor: "#0b0e14",
          border: "1px solid #1c2230",
          borderRadius: "6px",
          padding: "12px",
          fontSize: "12px",
          lineHeight: "1.4",
          color: "#9be9a8",
          maxHeight: "160px",
          overflowY: "auto",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: "0 0 14px 0",
        }}
      >
        {reportText}
      </pre>

      {/* Панель кнопок шеринга */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {/* Главная кнопка скопировать */}
        <button
          onClick={handleCopy}
          style={{
            flex: 2,
            minWidth: "160px",
            backgroundColor: copied ? "#13381b" : "#00ff15",
            color: copied ? "#00ff15" : "#000",
            border: `1px solid ${copied ? "#00ff15" : "transparent"}`,
            padding: "10px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "monospace",
            transition: "all 0.15s ease",
          }}
        >
          {copied ? "✓ СКОПИРОВАНО В БУФЕР!" : "📋 СКОПИРОВАТЬ ОТЧЕТ"}
        </button>

        {/* Telegram */}
        {/* <button
          onClick={handleShareTelegram}
          style={{
            flex: 1,
            minWidth: "120px",
            backgroundColor: "#17212b",
            border: "1px solid #2b5278",
            color: "#54a9eb",
            padding: "10px 12px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          ✈ TELEGRAM
        </button> */}

        {/* VK */}
        {/* <button
          onClick={handleShareVK}
          style={{
            backgroundColor: "#18202c",
            border: "1px solid #2e4a6f",
            color: "#4680c2",
            padding: "10px 12px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          VK
        </button> */}

        {/* Web Share API (если поддерживается браузером/телефоном) */}
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <button
            onClick={handleNativeShare}
            style={{
              backgroundColor: "#1c202a",
              border: "1px solid #333",
              color: "#ddd",
              padding: "10px 12px",
              borderRadius: "4px",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
            title="Системное меню шеринга"
          >
            🔗 ЕЩЁ
          </button>
        )}
      </div>
    </div>
  );
};

export default RoutineShareReport;
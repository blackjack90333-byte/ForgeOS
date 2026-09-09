// src/components/RoutineDropStack.tsx
import React, { useState } from "react";
import { RoutineBlock } from "../types";

interface RoutineDropStackProps {
  selectedBlockIds: string[];
  blocksLibrary: RoutineBlock[];
  onDropBlock: (blockId: string, targetIndex?: number) => void;
  onRemoveBlock: (id: string) => void;
  onMoveBlock: (index: number, direction: "up" | "down") => void;
  onStartRunner: () => void;
  totalStepsCount: number;
}

const RoutineDropStack: React.FC<RoutineDropStackProps> = ({
  selectedBlockIds,
  blocksLibrary,
  onDropBlock,
  onRemoveBlock,
  onMoveBlock,
  onStartRunner,
  totalStepsCount,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverArea, setIsDragOverArea] = useState<boolean>(false);

  // Сбор всех уникальных бенефитов из выбранных на сегодня блоков
  const allSelectedBenefits = selectedBlockIds.reduce<string[]>((acc, blockId) => {
    const block = blocksLibrary.find((b) => b.id === blockId);
    if (block?.benefits) {
      block.benefits.forEach((benefit) => {
        const trimmed = benefit.trim();
        if (trimmed && !acc.includes(trimmed)) {
          acc.push(trimmed);
        }
      });
    }
    return acc;
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const blockId = e.dataTransfer.getData("text/plain");
    if (blockId) {
      onDropBlock(blockId, index);
    }
    setDragOverIndex(null);
    setIsDragOverArea(false);
  };

  const handleDropOnEnd = (e: React.DragEvent) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData("text/plain");
    if (blockId) {
      onDropBlock(blockId);
    }
    setDragOverIndex(null);
    setIsDragOverArea(false);
  };

  return (
    <div
      onDragOver={(e) => {
        handleDragOver(e);
        setIsDragOverArea(true);
      }}
      onDragLeave={() => setIsDragOverArea(false)}
      onDrop={handleDropOnEnd}
      style={{
        backgroundColor: "#0d0f14",
        border: `2px dashed ${isDragOverArea ? "#00ff15" : "#1f2533"}`,
        borderRadius: "6px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minHeight: "420px",
        transition: "border-color 0.15s ease",
      }}
    >
      {/* Верхний заголовок */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px", color: "#f0932b", letterSpacing: "1px", fontWeight: "bold" }}>
          ОЧЕРЕДЬ НА СЕГОДНЯ ({selectedBlockIds.length} БЛОКОВ)
        </span>
        <span style={{ fontSize: "14px", color: "#666" }}>
          {totalStepsCount} задач в цепочке
        </span>
      </div>

      {/* Сводный блок всех бенефитов дня */}
      {allSelectedBenefits.length > 0 && (
        <div
          style={{
            backgroundColor: "#09140c",
            border: "1px solid #00ff1544",
            borderLeft: "3px solid #00ff15",
            borderRadius: "4px",
            padding: "10px 12px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#00ff15",
              fontWeight: "bold",
              letterSpacing: "1px",
              display: "block",
              marginBottom: "6px",
              textTransform: "uppercase",
            }}
          >
            ТВОЙ ПРОФИТ ОТ ВЫПОЛНЕНИЯ СТЕКА ({allSelectedBenefits.length}):
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {allSelectedBenefits.map((benefit, bIdx) => (
              <div
                key={bIdx}
                style={{
                  fontSize: "14px",
                  color: "#a3f7b5",
                  lineHeight: "1.35",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px",
                }}
              >
                <span style={{ color: "#00ff15", fontWeight: "bold" }}>+</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка старта */}
      <button
        onClick={onStartRunner}
        disabled={selectedBlockIds.length === 0}
        style={{
          width: "100%",
          backgroundColor: selectedBlockIds.length > 0 ? "#00ff15" : "#1a1a1a",
          color: selectedBlockIds.length > 0 ? "#000" : "#555",
          border: "none",
          borderRadius: "4px",
          padding: "14px",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: selectedBlockIds.length > 0 ? "pointer" : "not-allowed",
          fontFamily: "monospace",
          letterSpacing: "1px",
          boxShadow: selectedBlockIds.length > 0 ? "0 0 14px rgba(0, 255, 21, 0.25)" : "none",
        }}
      >
        ▶ НАЧАТЬ ВЫПОЛНЕНИЕ ({totalStepsCount} ЗАДАЧ)
      </button>

      {/* Список блоков в стеке с зонами вставки */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {selectedBlockIds.length === 0 ? (
          <div
            style={{
              padding: "40px 16px",
              textAlign: "center",
              color: "#555",
              fontSize: "14px",
              border: "1px dashed #1a1e28",
              borderRadius: "4px",
              margin: "auto 0",
            }}
          >
            Перетащи квест сюда мышкой из левой колонки
          </div>
        ) : (
          selectedBlockIds.map((blockId, index) => {
            const block = blocksLibrary.find((b) => b.id === blockId);
            if (!block) return null;

            return (
              <React.Fragment key={`${blockId}_${index}`}>
                {/* Индикатор вставки при наведении */}
                {dragOverIndex === index && (
                  <div
                    style={{
                      height: "3px",
                      backgroundColor: "#00ff15",
                      boxShadow: "0 0 8px #00ff15",
                      borderRadius: "2px",
                      margin: "2px 0",
                    }}
                  />
                )}

                <div
                  onDragOver={(e) => {
                    handleDragOver(e);
                    setDragOverIndex(index);
                  }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => handleDropOnItem(e, index)}
                  style={{
                    backgroundColor: "#11141c",
                    border: "1px solid #1f2533",
                    borderLeft: "3px solid #00ff15",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#00ff15", fontWeight: "bold", fontSize: "14px" }}>
                      #{index + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: "14px", color: "#fff", fontWeight: "bold" }}>
                        {block.title}
                      </div>
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        [{block.tag}] • {block.items.length} шагов
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      disabled={index === 0}
                      onClick={() => onMoveBlock(index, "up")}
                      style={{
                        background: "#161922",
                        border: "1px solid #283040",
                        color: index === 0 ? "#333" : "#aaa",
                        padding: "3px 6px",
                        cursor: index === 0 ? "default" : "pointer",
                        borderRadius: "3px",
                        fontSize: "14px",
                      }}
                      title="Поднять выше"
                    >
                      ▲
                    </button>
                    <button
                      disabled={index === selectedBlockIds.length - 1}
                      onClick={() => onMoveBlock(index, "down")}
                      style={{
                        background: "#161922",
                        border: "1px solid #283040",
                        color: index === selectedBlockIds.length - 1 ? "#333" : "#aaa",
                        padding: "3px 6px",
                        cursor: index === selectedBlockIds.length - 1 ? "default" : "pointer",
                        borderRadius: "3px",
                        fontSize: "14px",
                      }}
                      title="Опустить ниже"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => onRemoveBlock(block.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ff4d4d",
                        fontSize: "16px",
                        cursor: "pointer",
                        padding: "0 4px",
                      }}
                      title="Убрать из очереди"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoutineDropStack;
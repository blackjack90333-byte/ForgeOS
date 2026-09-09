// src/components/RoutineTabsLibrary.tsx
import React, { useState } from "react";
import { RoutineBlock, RoutineTag } from "../types";

export const ROUTINE_TAGS: RoutineTag[] = [
  "СПОРТ",
  "ГИГИЕНА",
  "РАЗУМ",
  "ЗДОРОВЬЕ",
  "ДИСЦИПЛИНА",
  "ДОФАМИН",
  "ФИНАНСЫ",
  "ПРОЧЕЕ",
];

interface RoutineTabsLibraryProps {
  blocks: RoutineBlock[];
  selectedBlockIds: string[];
  onAddBlockToStack: (id: string) => void;
  onEditBlock: (block: RoutineBlock) => void;
  onDeleteBlock: (id: string) => void;
  onCreateNewBlock: () => void;
}

const RoutineTabsLibrary: React.FC<RoutineTabsLibraryProps> = ({
  blocks,
  selectedBlockIds,
  onAddBlockToStack,
  onEditBlock,
  onDeleteBlock,
  onCreateNewBlock,
}) => {
  const [activeTag, setActiveTag] = useState<RoutineTag>("СПОРТ");

  const filteredBlocks = blocks.filter((b) => {
    if (activeTag === "ПРОЧЕЕ") {
      return !ROUTINE_TAGS.slice(0, 7).includes(b.tag as RoutineTag);
    }
    return b.tag === activeTag;
  });

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    e.dataTransfer.setData("text/plain", blockId);
    e.dataTransfer.effectAllowed = "copyMove";
  };

  const handlePrevTag = () => {
    const currentIndex = ROUTINE_TAGS.indexOf(activeTag);
    const prevIndex = (currentIndex - 1 + ROUTINE_TAGS.length) % ROUTINE_TAGS.length;
    setActiveTag(ROUTINE_TAGS[prevIndex]);
  };

  const handleNextTag = () => {
    const currentIndex = ROUTINE_TAGS.indexOf(activeTag);
    const nextIndex = (currentIndex + 1) % ROUTINE_TAGS.length;
    setActiveTag(ROUTINE_TAGS[nextIndex]);
  };

  return (
    <div
      style={{
        backgroundColor: "#0d0f14",
        border: "1px solid #1c202a",
        borderRadius: "6px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "14px", color: "#8a91a0", letterSpacing: "1px", fontWeight: "bold" }}>
          КАТАЛОГ РУТИН
        </span>
        <button
          onClick={onCreateNewBlock}
          style={{
            backgroundColor: "#00ff1518",
            border: "1px solid #00ff15",
            color: "#00ff15",
            padding: "4px 10px",
            borderRadius: "3px",
            fontSize: "14px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontWeight: "bold",
          }}
        >
          + НОВЫЙ БЛОК
        </button>
      </div>

      {/* Панель переключения тегов: Стрелка назад + Селект + Стрелка вперед */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        

        <select
          value={activeTag}
          onChange={(e) => setActiveTag(e.target.value as RoutineTag)}
          style={{
            flex: 1,
            backgroundColor: "#12141c",
            border: "1px solid #283040",
            color: "#3498db",
            padding: "8px 10px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            fontFamily: "monospace",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {ROUTINE_TAGS.map((tag) => {
            const count = blocks.filter((b) =>
              tag === "ПРОЧЕЕ"
                ? !ROUTINE_TAGS.slice(0, 7).includes(b.tag as RoutineTag)
                : b.tag === tag
            ).length;

            return (
              <option key={tag} value={tag} style={{ backgroundColor: "#0d0f14", color: "#fff" }}>
                {tag} ({count})
              </option>
            );
          })}
        </select>

        <button
          onClick={handlePrevTag}
          style={{
            backgroundColor: "#12141c",
            border: "1px solid #283040",
            color: "#3498db",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "monospace",
            userSelect: "none",
          }}
          title="Предыдущий тег"
        >
          ◀
        </button>

        <button
          onClick={handleNextTag}
          style={{
            backgroundColor: "#12141c",
            border: "1px solid #283040",
            color: "#3498db",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "monospace",
            userSelect: "none",
          }}
          title="Следующий тег"
        >
          ▶
        </button>
      </div>

      {/* Список блоков текущего тега */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxHeight: "72vh",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {filteredBlocks.length === 0 ? (
          <div style={{ padding: "24px 12px", textAlign: "center", border: "1px dashed #222735", borderRadius: "4px", color: "#555", fontSize: "14px" }}>
            В категории «{activeTag}» пока нет квестов. Нажми «+ НОВЫЙ БЛОК».
          </div>
        ) : (
          filteredBlocks.map((block) => {
            const isAlreadyInStack = selectedBlockIds.includes(block.id);

            return (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block.id)}
                style={{
                  backgroundColor: "#11141c",
                  border: `1px solid ${isAlreadyInStack ? "#00ff1555" : "#1f2533"}`,
                  borderRadius: "5px",
                  padding: "12px 14px",
                  cursor: "grab",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}>
                    {block.title}
                  </span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      onClick={() => onEditBlock(block)}
                      style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "14px" }}
                      title="Редактировать"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDeleteBlock(block.id)}
                      style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "14px" }}
                      title="Удалить"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                {/* БЛОК БЕНЕФИТОВ / ПРОФИТА */}
                {block.benefits && block.benefits.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "#0d1710",
                      borderLeft: "2px solid #00ff15",
                      padding: "6px 8px",
                      borderRadius: "0 4px 4px 0",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {block.benefits.map((benefit, bIdx) => (
                        <div key={bIdx} style={{ fontSize: "14px", color: "#85e89d", lineHeight: "1.3" }}>
                          + {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Список задач */}
                <div style={{ fontSize: "14px", color: "#8a91a0", marginBottom: "10px" }}>
                  <span style={{ fontSize: "14px", color: "#555", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                    Задачи ({block.items.length}):
                  </span>
                  {block.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      • {item}
                    </div>
                  ))}
                  {block.items.length > 3 && (
                    <span style={{ fontSize: "14px", color: "#666" }}>
                      ... и еще {block.items.length - 3} задач
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #191e2b", paddingTop: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#555" }}>
                    ⠿ Перетащи мышкой вправо
                  </span>
                  <button
                    onClick={() => onAddBlockToStack(block.id)}
                    style={{
                      backgroundColor: isAlreadyInStack ? "#142416" : "#161922",
                      border: `1px solid ${isAlreadyInStack ? "#00ff15" : "#283040"}`,
                      color: isAlreadyInStack ? "#00ff15" : "#aaa",
                      padding: "4px 10px",
                      borderRadius: "3px",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                    }}
                  >
                    {isAlreadyInStack ? "✓ В СТЕКЕ" : "+ В СТЕК"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoutineTabsLibrary;
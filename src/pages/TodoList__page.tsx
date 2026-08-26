// src/pages/TodoList__page.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import { getUserData, saveEisenhowerTasks } from "../services/firebase";
import { EisenhowerTask, TaskQuadrant, TaskStatus } from "../types";
import ActionButton from "../components/ActionButton";
import ForgeLoader from "../components/ForgeLoader";

interface QuadrantConfig {
  id: TaskQuadrant;
  title: string;
  subtitle: string;
  tag: string;
  borderColor: string;
}

const QUADRANTS: QuadrantConfig[] = [
  {
    id: "q1_urgent_important",
    title: "ВАЖНО & СРОЧНО",
    subtitle: "Сделай немедленно // Фокус",
    tag: "Q1",
    borderColor: "#ff4d4d",
  },
  {
    id: "q2_not_urgent_important",
    title: "ВАЖНО & НЕ СРОЧНО",
    subtitle: "Стратегия // Рост // Скиллы",
    tag: "Q2",
    borderColor: "#3498db",
  },
  {
    id: "q3_urgent_not_important",
    title: "НЕ ВАЖНО & СРОЧНО",
    subtitle: "Рутина // Быстрый сброс",
    tag: "Q3",
    borderColor: "#f1c40f",
  },
  {
    id: "q4_not_urgent_not_important",
    title: "НЕ ВАЖНО & НЕ СРОЧНО",
    subtitle: "Пожиратели времени // Отдых",
    tag: "Q4",
    borderColor: "#555",
  },
];

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "Сделать" },
  { id: "in_progress", label: "В работе" },
  { id: "done", label: "Готово" },
];

const TodoListPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState<EisenhowerTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inboxInput, setInboxInput] = useState<string>("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.uid) return;
      try {
        const userData = await getUserData(user.uid);
        const rawTasks = (userData as any)?.eisenhower_tasks;
        if (rawTasks) {
          try {
            setTasks(JSON.parse(rawTasks));
          } catch {
            setTasks([]);
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки задач:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user?.uid]);

  const handleAddInboxTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inboxInput.trim() || !user?.uid) return;

    const newTask: EisenhowerTask = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: inboxInput.trim(),
      quadrant: "inbox",
      status: "todo",
      createdAt: Date.now(),
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    setInboxInput("");
    await saveEisenhowerTasks(user.uid, updated);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user?.uid) return;
    const isConfirmed = window.confirm("Удалить задачу?");
    if (!isConfirmed) return;

    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    await saveEisenhowerTasks(user.uid, updated);
  };

  const moveTaskDirect = async (taskId: string, targetQuadrant: TaskQuadrant, targetStatus: TaskStatus) => {
    if (!user?.uid) return;
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, quadrant: targetQuadrant, status: targetStatus };
      }
      return t;
    });
    setTasks(updated);
    await saveEisenhowerTasks(user.uid, updated);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = async (e: React.DragEvent, targetQuadrant: TaskQuadrant, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId || !user?.uid) return;

    const updated = tasks.map((t) => {
      if (t.id === draggedTaskId) {
        return { ...t, quadrant: targetQuadrant, status: targetStatus };
      }
      return t;
    });

    setTasks(updated);
    setDraggedTaskId(null);
    await saveEisenhowerTasks(user.uid, updated);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const renderProgressBar = (quadrantTasks: EisenhowerTask[]) => {
    const total = quadrantTasks.length;
    if (total === 0) {
      return <div style={{ height: "4px", backgroundColor: "#111", borderRadius: "2px", marginBottom: "8px" }} />;
    }

    const inProgressCount = quadrantTasks.filter((t) => t.status === "in_progress").length;
    const doneCount = quadrantTasks.filter((t) => t.status === "done").length;

    const donePercent = (doneCount / total) * 100;
    const inProgressPercent = (inProgressCount / total) * 100;

    return (
      <div
        style={{
          height: "4px",
          backgroundColor: "#111",
          borderRadius: "2px",
          overflow: "hidden",
          marginBottom: "8px",
          display: "flex",
          border: "1px solid #222",
        }}
      >
        <div style={{ width: `${donePercent}%`, backgroundColor: "#00ff15", transition: "width 0.3s" }} />
        <div style={{ width: `${inProgressPercent}%`, backgroundColor: "#0e5a1b", transition: "width 0.3s" }} />
      </div>
    );
  };

  if (isLoading) {
    return (
      <ForgeLoader
        title="МАТРИЦА ДЕЛ // СИНХРОНИЗАЦИЯ"
        subtitle="ПОСТРОЕНИЕ КВАДРАНТОВ ЭЙЗЕНХАУЭРА"
        logs={[
          "SCANNING_INBOX_BUFFER...",
          "SORTING_PRIORITIES_Q1_Q4...",
          "CALCULATING_COMPLETION_RATES...",
          "MOUNTING_KANBAN_GRID..."
        ]}
        accentColor="#3498db"
      />
    );
  }

  const inboxTasks = tasks.filter((t) => t.quadrant === "inbox");

  return (
    <div style={{ padding: "10px 14px", fontFamily: "Arial, sans-serif", width: "100%", boxSizing: "border-box" }}>
      {/* Стили для адаптива и 3px скроллбаров с белым треком и серым ползунком */}
      <style>{`
        .todo_layout {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .quadrants_grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          width: 100%;
        }
        .columns_grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .column_scroll_area {
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: #777777 #ffffff;
        }
        .inbox_scroll_area {
          max-height: 600px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: #777777 #ffffff;
        }
        .column_scroll_area::-webkit-scrollbar,
        .inbox_scroll_area::-webkit-scrollbar {
          width: 3px;
        }
        .column_scroll_area::-webkit-scrollbar-track,
        .inbox_scroll_area::-webkit-scrollbar-track {
          background: #ffffff;
          border-radius: 1px;
        }
        .column_scroll_area::-webkit-scrollbar-thumb,
        .inbox_scroll_area::-webkit-scrollbar-thumb {
          background: #777777;
          border-radius: 1px;
        }
        .column_scroll_area::-webkit-scrollbar-thumb:hover,
        .inbox_scroll_area::-webkit-scrollbar-thumb:hover {
          background: #444444;
        }

        @media (min-width: 900px) {
          .todo_layout {
            display: grid;
            grid-template-columns: 200px 1fr;
            align-items: start;
            gap: 12px;
          }
          .quadrants_grid {
            grid-template-columns: 1fr 1fr;
          }
          .columns_grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
          .column_scroll_area {
            max-height: 300px;
          }
        }
      `}</style>

      {/* Навигация */}
      {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #222", paddingBottom: "8px" }}>
        <h1 style={{ margin: 0, fontSize: "18px", letterSpacing: "1px" }}>
          FORGE<span style={{ color: "#00ff15" }}>OS</span> // МАТРИЦА
        </h1>
        <Link
          to="/"
          style={{
            backgroundColor: "#1a1a1a",
            color: "#00ff15",
            textDecoration: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            border: "1px solid #333",
          }}
        >
          ← Дашборд
        </Link>
      </div> */}

      <div className="todo_layout">
        {/* Компактный буфер входящих */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "inbox", "todo")}
          style={{
            backgroundColor: "#0a0a0a",
            border: "1px solid #222",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#00ff15", marginBottom: "8px", letterSpacing: "1px" }}>
            📥 БУФЕР ({inboxTasks.length})
          </div>

          <form onSubmit={handleAddInboxTask} style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Дело..."
              value={inboxInput}
              onChange={(e) => setInboxInput(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "6px 8px",
                backgroundColor: "#141414",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <ActionButton
              type="submit"
              onClick={handleAddInboxTask}
              loadingText="..."
              successText="✓"
              disabled={!inboxInput.trim()}
              style={{ padding: "0 10px" }}
            >
              +
            </ActionButton>
          </form>

          <div className="inbox_scroll_area">
            {inboxTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                style={{
                  backgroundColor: "#161616",
                  border: "1px solid #2a2a2a",
                  borderRadius: "4px",
                  padding: "6px 8px",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ color: "#eee", wordBreak: "break-word", lineHeight: "1.3", flex: 1 }}>
                    {task.title}
                  </span>
                  <ActionButton
                    onClick={() => handleDeleteTask(task.id)}
                    variant="danger"
                    loadingText="..."
                    successText="✓"
                    style={{
                      padding: "0px 4px",
                      fontSize: "11px",
                      lineHeight: "14px",
                      alignSelf: "flex-start",
                      flexShrink: 0,
                      minHeight: "16px",
                    }}
                  >
                    ×
                  </ActionButton>
                </div>

                <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                  <ActionButton
                    onClick={() => moveTaskDirect(task.id, "q1_urgent_important", "todo")}
                    variant="secondary"
                    loadingText="..."
                    successText="✓"
                    style={{ backgroundColor: "#221111", border: "1px solid #ff4d4d", color: "#ff4d4d", fontSize: "9px", padding: "1px 4px" }}
                  >
                    Q1
                  </ActionButton>
                  <ActionButton
                    onClick={() => moveTaskDirect(task.id, "q2_not_urgent_important", "todo")}
                    variant="secondary"
                    loadingText="..."
                    successText="✓"
                    style={{ backgroundColor: "#111b24", border: "1px solid #3498db", color: "#3498db", fontSize: "9px", padding: "1px 4px" }}
                  >
                    Q2
                  </ActionButton>
                  <ActionButton
                    onClick={() => moveTaskDirect(task.id, "q3_urgent_not_important", "todo")}
                    variant="secondary"
                    loadingText="..."
                    successText="✓"
                    style={{ backgroundColor: "#242011", border: "1px solid #f1c40f", color: "#f1c40f", fontSize: "9px", padding: "1px 4px" }}
                  >
                    Q3
                  </ActionButton>
                  <ActionButton
                    onClick={() => moveTaskDirect(task.id, "q4_not_urgent_not_important", "todo")}
                    variant="secondary"
                    loadingText="..."
                    successText="✓"
                    style={{ backgroundColor: "#181818", border: "1px solid #666", color: "#888", fontSize: "9px", padding: "1px 4px" }}
                  >
                    Q4
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Сетка Квадрантов на всю ширину */}
        <div className="quadrants_grid">
          {QUADRANTS.map((quadrant) => {
            const quadrantTasks = tasks.filter((t) => t.quadrant === quadrant.id);

            return (
              <div
                key={quadrant.id}
                style={{
                  backgroundColor: "#0c0c0c",
                  border: `1px solid ${quadrant.borderColor}44`,
                  borderTop: `3px solid ${quadrant.borderColor}`,
                  borderRadius: "8px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: quadrant.borderColor }}>
                    [{quadrant.tag}] {quadrant.title}
                  </div>
                  <span style={{ fontSize: "11px", color: "#666" }}>{quadrantTasks.length}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#777", marginBottom: "6px" }}>{quadrant.subtitle}</div>

                {renderProgressBar(quadrantTasks)}

                <div className="columns_grid">
                  {COLUMNS.map((col) => {
                    const colTasks = quadrantTasks.filter((t) => t.status === col.id);

                    return (
                      <div
                        key={col.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, quadrant.id, col.id)}
                        style={{
                          backgroundColor: "#121212",
                          border: "1px dashed #262626",
                          borderRadius: "6px",
                          padding: "6px",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div style={{ fontSize: "10px", color: "#888", textAlign: "center", borderBottom: "1px solid #1c1c1c", paddingBottom: "3px", marginBottom: "6px" }}>
                          {col.label} ({colTasks.length})
                        </div>

                        <div className="column_scroll_area">
                          {colTasks.map((t) => (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, t.id)}
                              style={{
                                backgroundColor: col.id === "done" ? "#0f2112" : "#1a1a1a",
                                border: `1px solid ${col.id === "done" ? "#00ff1555" : "#333"}`,
                                borderRadius: "4px",
                                padding: "6px 8px",
                                fontSize: "12px",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                                <span
                                  style={{
                                    textDecoration: col.id === "done" ? "line-through" : "none",
                                    color: col.id === "done" ? "#88e090" : "#ddd",
                                    wordBreak: "break-word",
                                    lineHeight: "1.35",
                                    flex: 1,
                                  }}
                                >
                                  {t.title}
                                </span>
                                <ActionButton
                                  onClick={() => handleDeleteTask(t.id)}
                                  variant="danger"
                                  loadingText="..."
                                  successText="✓"
                                  style={{
                                    padding: "0px 4px",
                                    fontSize: "11px",
                                    lineHeight: "14px",
                                    alignSelf: "flex-start",
                                    flexShrink: 0,
                                    minHeight: "16px",
                                  }}
                                >
                                  ×
                                </ActionButton>
                              </div>

                              <div style={{ display: "flex", gap: "3px", marginTop: "6px", flexWrap: "wrap" }}>
                                {col.id !== "todo" && (
                                  <ActionButton
                                    onClick={() => moveTaskDirect(t.id, quadrant.id, "todo")}
                                    variant="secondary"
                                    loadingText="..."
                                    successText="✓"
                                    style={{ background: "#222", color: "#aaa", fontSize: "9px", padding: "2px 4px" }}
                                  >
                                    ← Сделать
                                  </ActionButton>
                                )}
                                {col.id !== "in_progress" && (
                                  <ActionButton
                                    onClick={() => moveTaskDirect(t.id, quadrant.id, "in_progress")}
                                    variant="secondary"
                                    loadingText="..."
                                    successText="✓"
                                    style={{ background: "#113317", color: "#32d64a", fontSize: "9px", padding: "2px 4px" }}
                                  >
                                    ⚙ В работе
                                  </ActionButton>
                                )}
                                {col.id !== "done" && (
                                  <ActionButton
                                    onClick={() => moveTaskDirect(t.id, quadrant.id, "done")}
                                    loadingText="..."
                                    successText="✓"
                                    style={{ fontSize: "9px", padding: "2px 4px" }}
                                  >
                                    ✓ Готово
                                  </ActionButton>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodoListPage;
// src/pages/TodoList__page.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import { getUserData, saveEisenhowerTasks } from "../services/firebase";
import { EisenhowerTask, TaskQuadrant, TaskStatus } from "../types";

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

  // Прямое перемещение кликом (для мобилок)
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

  // Drag and Drop (для ПК)
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
    return <div style={{ padding: "20px", color: "#888" }}>Загрузка задач...</div>;
  }

  const inboxTasks = tasks.filter((t) => t.quadrant === "inbox");

  return (
    <div style={{ padding: "12px", fontFamily: "Arial, sans-serif", maxWidth: "1550px", margin: "0 auto" }}>
      {/* Стили для адаптива */}
      <style>{`
        .todo_layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .quadrants_grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .columns_grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        @media (min-width: 900px) {
          .todo_layout {
            display: grid;
            grid-template-columns: minmax(220px, 20%) 1fr;
            align-items: start;
          }
          .quadrants_grid {
            grid-template-columns: 1fr 1fr;
          }
          .columns_grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
      `}</style>

      {/* Навигация */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #222", paddingBottom: "10px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", letterSpacing: "1px" }}>
            FORGE<span style={{ color: "#00ff15" }}>OS</span> // МАТРИЦА
          </h1>
        </div>
        <Link
          to="/"
          style={{
            backgroundColor: "#1a1a1a",
            color: "#00ff15",
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            border: "1px solid #333",
          }}
        >
          ← Дашборд
        </Link>
      </div>

      <div className="todo_layout">
        {/* Буфер входящих */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "inbox", "todo")}
          style={{
            backgroundColor: "#0a0a0a",
            border: "1px solid #222",
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#00ff15", marginBottom: "8px", letterSpacing: "1px" }}>
            📥 БУФЕР ВХОДЯЩИХ ({inboxTasks.length})
          </div>

          <form onSubmit={handleAddInboxTask} style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="Новое дело..."
              value={inboxInput}
              onChange={(e) => setInboxInput(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 10px",
                backgroundColor: "#141414",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "16px", // 16px предотвращает зум на iPhone
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#00ff15",
                color: "#000",
                border: "none",
                fontWeight: "bold",
                borderRadius: "4px",
                padding: "0 14px",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {inboxTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                style={{
                  backgroundColor: "#161616",
                  border: "1px solid #2a2a2a",
                  borderRadius: "5px",
                  padding: "8px 10px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ color: "#eee" }}>{task.title}</span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "14px" }}
                  >
                    ×
                  </button>
                </div>

                {/* Кнопки быстрого перемещения на мобилках */}
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => moveTaskDirect(task.id, "q1_urgent_important", "todo")}
                    style={{ backgroundColor: "#221111", border: "1px solid #ff4d4d", color: "#ff4d4d", fontSize: "10px", padding: "2px 6px", borderRadius: "3px", cursor: "pointer" }}
                  >
                    В Q1
                  </button>
                  <button
                    onClick={() => moveTaskDirect(task.id, "q2_not_urgent_important", "todo")}
                    style={{ backgroundColor: "#111b24", border: "1px solid #3498db", color: "#3498db", fontSize: "10px", padding: "2px 6px", borderRadius: "3px", cursor: "pointer" }}
                  >
                    В Q2
                  </button>
                  <button
                    onClick={() => moveTaskDirect(task.id, "q3_urgent_not_important", "todo")}
                    style={{ backgroundColor: "#242011", border: "1px solid #f1c40f", color: "#f1c40f", fontSize: "10px", padding: "2px 6px", borderRadius: "3px", cursor: "pointer" }}
                  >
                    В Q3
                  </button>
                  <button
                    onClick={() => moveTaskDirect(task.id, "q4_not_urgent_not_important", "todo")}
                    style={{ backgroundColor: "#181818", border: "1px solid #666", color: "#888", fontSize: "10px", padding: "2px 6px", borderRadius: "3px", cursor: "pointer" }}
                  >
                    В Q4
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Сетка Квадрантов */}
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
                  padding: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: quadrant.borderColor }}>
                    [{quadrant.tag}] {quadrant.title}
                  </div>
                  <span style={{ fontSize: "11px", color: "#666" }}>{quadrantTasks.length}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#777", marginBottom: "6px" }}>{quadrant.subtitle}</div>

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
                        }}
                      >
                        <div style={{ fontSize: "11px", color: "#888", textAlign: "center", borderBottom: "1px solid #1c1c1c", paddingBottom: "3px", marginBottom: "6px" }}>
                          {col.label} ({colTasks.length})
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {colTasks.map((t) => (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, t.id)}
                              style={{
                                backgroundColor: col.id === "done" ? "#0f2112" : "#1a1a1a",
                                border: `1px solid ${col.id === "done" ? "#00ff1555" : "#333"}`,
                                borderRadius: "4px",
                                padding: "6px",
                                fontSize: "12px",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ textDecoration: col.id === "done" ? "line-through" : "none", color: col.id === "done" ? "#88e090" : "#ddd" }}>
                                  {t.title}
                                </span>
                                <button
                                  onClick={() => handleDeleteTask(t.id)}
                                  style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "12px" }}
                                >
                                  ×
                                </button>
                              </div>

                              {/* Стрелочки смены статуса (для тапа на телефоне) */}
                              <div style={{ display: "flex", gap: "4px", marginTop: "5px" }}>
                                {col.id !== "todo" && (
                                  <button
                                    onClick={() => moveTaskDirect(t.id, quadrant.id, "todo")}
                                    style={{ background: "#222", border: "none", color: "#aaa", fontSize: "10px", padding: "2px 5px", borderRadius: "2px", cursor: "pointer" }}
                                  >
                                    ← Сделать
                                  </button>
                                )}
                                {col.id !== "in_progress" && (
                                  <button
                                    onClick={() => moveTaskDirect(t.id, quadrant.id, "in_progress")}
                                    style={{ background: "#113317", border: "none", color: "#32d64a", fontSize: "10px", padding: "2px 5px", borderRadius: "2px", cursor: "pointer" }}
                                  >
                                    ⚙ В работе
                                  </button>
                                )}
                                {col.id !== "done" && (
                                  <button
                                    onClick={() => moveTaskDirect(t.id, quadrant.id, "done")}
                                    style={{ background: "#00ff15", border: "none", color: "#000", fontWeight: "bold", fontSize: "10px", padding: "2px 5px", borderRadius: "2px", cursor: "pointer" }}
                                  >
                                    ✓ Готово
                                  </button>
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
// src/pages/Skills__page.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import { getUserData, saveUserSkills } from "../services/firebase";
import { SkillAchievement } from "../types";
import ActionButton from "../components/ActionButton";
import ForgeLoader from "../components/ForgeLoader";
import ForgeImage from "../components/ForgeImage";

const INITIAL_SKILLS: SkillAchievement[] = [
  {
    id: "auto_doors",
    title: "Шумоизоляция и разбор дверей",
    level: 9,
    desc: `Снял дверную карту аккуратно, не поломав ни одного заводского пистона.
https://static.wol.su/assets/uploads/posts/2026-06/611c2d145d_12.webp
Проклеил виброизоляцию 3мм первым слоем и поверх шумопоглотитель.
Установил подиумы под новые мидбасы.`,
    unlockedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: "auto_sound",
    title: "Инсталляция автозвука",
    level: 8,
    desc: "Прокладка силовой и акустической проводки, подключение активного сабвуфера и настройка срезов частот.",
    unlockedAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
];

const isImageUrl = (url: string): boolean => {
  return /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?.*)?)/i.test(url.trim());
};

const SkillsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [skills, setSkills] = useState<SkillAchievement[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillAchievement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Модалка (создание или редактирование)
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDesc, setFormDesc] = useState<string>("");
  const [formLevel, setFormLevel] = useState<number>(7);

  useEffect(() => {
    const loadSkills = async () => {
      if (!user?.uid) return;
      try {
        const userData = await getUserData(user.uid);
        const raw = (userData as any)?.skills_tree;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setSkills(parsed);
            if (parsed.length > 0) setSelectedSkill(parsed[0]);
          } catch {
            setSkills(INITIAL_SKILLS);
            setSelectedSkill(INITIAL_SKILLS[0]);
          }
        } else {
          setSkills(INITIAL_SKILLS);
          setSelectedSkill(INITIAL_SKILLS[0]);
          await saveUserSkills(user.uid, INITIAL_SKILLS);
        }
      } catch (err) {
        console.error("Ошибка загрузки навыков:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, [user?.uid]);

  // Открыть модалку на создание
  const handleOpenCreateModal = () => {
    setEditingSkillId(null);
    setFormTitle("");
    setFormDesc("");
    setFormLevel(7);
    setShowModal(true);
  };

  // Открыть модалку на редактирование
  const handleOpenEditModal = (skill: SkillAchievement) => {
    setEditingSkillId(skill.id);
    setFormTitle(skill.title);
    setFormDesc(skill.desc);
    setFormLevel(skill.level);
    setShowModal(true);
  };

  // Сохранить навык (новый или отредактированный)
  const handleSaveSkill = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formTitle.trim() || !user?.uid) return;

    let updated: SkillAchievement[];

    if (editingSkillId) {
      // Редактирование
      updated = skills.map((s) => {
        if (s.id === editingSkillId) {
          const edited = {
            ...s,
            title: formTitle.trim(),
            desc: formDesc.trim(),
            level: Number(formLevel),
          };
          setSelectedSkill(edited);
          return edited;
        }
        return s;
      });
    } else {
      // Создание
      const newSkill: SkillAchievement = {
        id: `skill_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: formTitle.trim(),
        desc: formDesc.trim() || "Навык успешно освоен и применен на практике.",
        level: Number(formLevel),
        unlockedAt: Date.now(),
      };
      updated = [newSkill, ...skills];
      setSelectedSkill(newSkill);
    }

    setSkills(updated);
    setShowModal(false);
    await saveUserSkills(user.uid, updated);
  };

  // Быстрое изменение уровня (+1 / -1) прямо из инспектора
  const handleQuickLevelChange = async (skillId: string, delta: number) => {
    if (!user?.uid) return;

    const updated = skills.map((s) => {
      if (s.id === skillId) {
        const nextLevel = Math.max(0, Math.min(10, s.level + delta));
        const edited = { ...s, level: nextLevel };
        setSelectedSkill(edited);
        return edited;
      }
      return s;
    });

    setSkills(updated);
    await saveUserSkills(user.uid, updated);
  };

  const handleDeleteSkill = async (id: string) => {
    if (!user?.uid) return;
    const isConfirmed = window.confirm("Удалить этот навык?");
    if (!isConfirmed) return;

    const updated = skills.filter((s) => s.id !== id);
    setSkills(updated);
    if (selectedSkill?.id === id) {
      setSelectedSkill(updated[0] || null);
    }
    await saveUserSkills(user.uid, updated);
  };

  // Построчный рендер: сохраняет порядок текста и картинок
  const renderDescriptionInLineOrder = (text: string) => {
    const lines = text.split("\n");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} style={{ height: "4px" }} />;

          if (isImageUrl(trimmed)) {
            return (
              <div key={idx} style={{ margin: "6px 0" }}>
                <ForgeImage
                  src={trimmed}
                  alt="Схема / Фото навыка"
                  aspectRatio="16 / 9"
                  borderRadius="4px"
                  borderColor="#262626"
                  style={{ width: "100%", maxHeight: "300px" }}
                />
              </div>
            );
          }

          return (
            <p
              key={idx}
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.6",
                color: "#bbb",
                wordBreak: "break-word",
              }}
            >
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <ForgeLoader title="КОДЕКС НАВЫКОВ // ЗАГРУЗКА" logs={["СКАНИРОВАНИЕ НАВЫКОВ...", "ЧТЕНИЕ ЗАПИСЕЙ..."]} />;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", padding: "16px", color: "#ddd", fontFamily: "monospace" }}>
      <style>{`
        .skills_layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .skill_row_item {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          border: 1px solid #1a1a1a;
          transition: all 0.12s ease;
          font-size: 13px;
          color: #aaa;
          background: #0d0d0d;
          margin-bottom: 6px;
        }
        .skill_row_item:hover, .skill_row_item.active {
          color: #fff;
          background: #141414;
          border-color: #00ff1588;
        }
        @media (min-width: 850px) {
          .skills_layout {
            display: grid;
            grid-template-columns: 460px 1fr;
            align-items: start;
            gap: 20px;
          }
        }
      `}</style>

      {/* Верхняя навигация */}
      <div style={{ maxWidth: "1100px", margin: "0 auto 16px auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1f1f1f", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", letterSpacing: "1px" }}>
          <Link to="/" style={{ color: "#666", textDecoration: "none" }}>&larr; ДАШБОРД</Link>
          <span style={{ color: "#00ff15", fontWeight: "bold" }}>
            НАВЫКИ // В ЧЕМ РАЗОБРАЛСЯ ({skills.length})
          </span>
        </div>
        <button
          onClick={handleOpenCreateModal}
          style={{
            backgroundColor: "#111",
            border: "1px solid #00ff15",
            color: "#00ff15",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "monospace",
            borderRadius: "4px",
          }}
        >
          + ДОБАВИТЬ НАВЫК
        </button>
      </div>

      <div className="skills_layout">
        {/* ЛЕВАЯ КОЛОНКА: СПИСОК НАВЫКОВ */}
        <div
          style={{
            backgroundColor: "#0c0c0c",
            border: "1px solid #1c1c1c",
            padding: "16px",
            borderRadius: "6px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {skills.length === 0 ? (
            <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>
              Список пуст. Добавь свой первый навык.
            </div>
          ) : (
            skills.map((skill) => {
              const isSelected = selectedSkill?.id === skill.id;

              return (
                <div
                  key={skill.id}
                  className={`skill_row_item ${isSelected ? "active" : ""}`}
                  onMouseEnter={() => setSelectedSkill(skill)}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#00ff15", fontSize: "11px" }}>&gt;</span>
                    <span>{skill.title}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: skill.level >= 8 ? "#00ff15" : skill.level >= 5 ? "#3498db" : "#888",
                      backgroundColor: "#111",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      border: "1px solid #222",
                    }}
                  >
                    LVL {skill.level}/10
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНСПЕКТОР С ПРОКАЧКОЙ УРОВНЯ */}
        <div style={{ position: "sticky", top: "20px" }}>
          {selectedSkill ? (
            <div
              style={{
                backgroundColor: "#0c0c0c",
                border: "1px solid #262626",
                borderRadius: "6px",
                padding: "20px",
              }}
            >
              {/* Заголовок */}
              <div style={{ borderBottom: "1px solid #1c1c1c", paddingBottom: "12px", marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: "#666", letterSpacing: "1px", textTransform: "uppercase" }}>
                    ОПИСАНИЕ НАВЫКА
                  </span>
                  <button
                    onClick={() => handleOpenEditModal(selectedSkill)}
                    style={{
                      background: "none",
                      border: "1px solid #333",
                      color: "#3498db",
                      padding: "2px 8px",
                      borderRadius: "3px",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    ✎ Редактировать
                  </button>
                </div>

                <h3 style={{ margin: "6px 0 8px 0", fontSize: "17px", color: "#fff", letterSpacing: "0.5px" }}>
                  {selectedSkill.title}
                </h3>

                {/* Шкала мастерства 0..10 с кнопками апгрейда */}
                <div style={{ marginTop: "12px", backgroundColor: "#111", padding: "10px", borderRadius: "4px", border: "1px solid #1c1c1c" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginBottom: "6px", color: "#888" }}>
                    <span>УРОВЕНЬ ПОНИМАНИЯ (LVL)</span>
                    <span style={{ color: "#00ff15", fontWeight: "bold", fontSize: "13px" }}>
                      {selectedSkill.level} / 10
                    </span>
                  </div>

                  {/* Визуальная шкала */}
                  <div style={{ height: "6px", backgroundColor: "#161616", borderRadius: "3px", overflow: "hidden", display: "flex", gap: "2px", marginBottom: "8px" }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          backgroundColor: i < selectedSkill.level ? "#00ff15" : "#222",
                        }}
                      />
                    ))}
                  </div>

                  {/* Кнопки прокачки прямо на месте */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        disabled={selectedSkill.level <= 0}
                        onClick={() => handleQuickLevelChange(selectedSkill.id, -1)}
                        style={{
                          backgroundColor: "#1c1c1c",
                          border: "1px solid #333",
                          color: selectedSkill.level <= 0 ? "#444" : "#aaa",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "12px",
                          cursor: selectedSkill.level <= 0 ? "not-allowed" : "pointer",
                          fontFamily: "monospace",
                        }}
                      >
                        -1 LVL
                      </button>
                      <button
                        disabled={selectedSkill.level >= 10}
                        onClick={() => handleQuickLevelChange(selectedSkill.id, 1)}
                        style={{
                          backgroundColor: "#152b18",
                          border: "1px solid #00ff1566",
                          color: selectedSkill.level >= 10 ? "#444" : "#00ff15",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: selectedSkill.level >= 10 ? "not-allowed" : "pointer",
                          fontFamily: "monospace",
                        }}
                      >
                        +1 ПРОГРЕСС
                      </button>
                    </div>

                    <span style={{ fontSize: "10px", color: "#666" }}>
                      {selectedSkill.level >= 8 ? "МАСТЕР" : selectedSkill.level >= 5 ? "ПРАКТИК" : "БАЗА"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Описание сути */}
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "10px", color: "#666", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  СУТЬ & ПРАКТИЧЕСКИЙ ОПЫТ:
                </span>
                <div style={{ backgroundColor: "#111", padding: "12px", borderRadius: "4px", border: "1px solid #1c1c1c" }}>
                  {renderDescriptionInLineOrder(selectedSkill.desc)}
                </div>
              </div>

              {/* Нижняя панель действий */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1c1c1c", paddingTop: "12px" }}>
                <span style={{ fontSize: "11px", color: "#00ff15" }}>
                  {/* ✓ ОСВОЕНО */}
                </span>
                <button
                  onClick={() => handleDeleteSkill(selectedSkill.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ff4d4d",
                    fontSize: "11px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontFamily: "monospace",
                  }}
                >
                  Удалить навык
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", color: "#555", border: "1px dashed #222", borderRadius: "6px" }}>
              Наведите курсор на навык в списке слева
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно (Создание / Редактирование) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid #333",
              borderRadius: "6px",
              padding: "20px",
              maxWidth: "460px",
              width: "100%",
              color: "#ddd",
            }}
          >
            <h3 style={{ margin: "0 0 14px 0", color: "#00ff15", fontSize: "15px", letterSpacing: "1px" }}>
              {editingSkillId ? "// РЕДАКТИРОВАНИЕ НАВЫКА" : "// НОВЫЙ НАВЫК"}
            </h3>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", color: "#888", marginBottom: "4px" }}>
                НАЗВАНИЕ:
              </label>
              <input
                type="text"
                placeholder="В чем разобрался..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "8px", backgroundColor: "#141414", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px", fontFamily: "monospace" }}
              />
            </div>

            {/* Ползунок уровня от 0 до 10 */}
            <div style={{ marginBottom: "14px", backgroundColor: "#121212", padding: "10px", borderRadius: "4px", border: "1px solid #222" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", color: "#aaa" }}>
                  УРОВЕНЬ ПОНИМАНИЯ (LVL):
                </label>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#00ff15" }}>
                  {formLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={formLevel}
                onChange={(e) => setFormLevel(Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer", accentColor: "#00ff15" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#555", marginTop: "2px" }}>
                <span>0 (База)</span>
                <span>5 (Практик)</span>
                <span>10 (Мастер)</span>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", color: "#888", marginBottom: "4px" }}>
                СУТЬ & ОПЫТ (ССЫЛКИ НА ФОТО ВСТАВЛЯЙ ОТДЕЛЬНОЙ СТРОКОЙ):
              </label>
              <textarea
                rows={5}
                placeholder={`текст\nhttps://site.com/image.webp\nтекст`}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "8px", backgroundColor: "#141414", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px", fontFamily: "monospace" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: "#1c1c1c", border: "1px solid #333", color: "#888", padding: "8px 14px", cursor: "pointer", borderRadius: "4px", fontFamily: "monospace" }}
              >
                Отмена
              </button>
              <ActionButton
                onClick={handleSaveSkill}
                loadingText="Сохранение..."
                successText="✓ Сохранено"
                disabled={!formTitle.trim()}
                style={{ backgroundColor: "#00ff15", color: "#000", padding: "8px 16px", borderRadius: "4px", fontWeight: "bold" }}
              >
                {editingSkillId ? "Обновить" : "Зафиксировать"}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
// src/components/NofapBuffs.tsx
import React from "react";

export interface EffectRow {
  buff: string;
  debuff: string;
}

interface NofapBuffsProps {
  rows?: EffectRow[];
}

export const DEFAULT_EFFECT_ROWS: EffectRow[] = [
  {
    buff: "Высокий уровень витальной энергии и физического тонуса",
    debuff: "Упадок сил, хроническая вялость и апатия",
  },
  {
    buff: "Ясность мышления, улучшение памяти и концентрации",
    debuff: "Деградация серого вещества (до -50%), снижение интеллекта",
  },
  {
    buff: "Удовлетворение от самоконтроля и повод для гордости",
    debuff: "Сиюминутное удовольствие с последующей виной (эффект обоссаных штанов на морозе)",
  },
  {
    buff: "Снижение депрессии, стабильно высокий фон настроения",
    debuff: "Дофаминовая яма, эмоциональное выгорание и депрессивные эпизоды",
  },
  {
    buff: "Повышение уверенности в себе и снижение тревожности",
    debuff: "Фоновая социальная тревога, стыд и неуверенность",
  },
  {
    buff: "Истинное желание общаться и социализироваться",
    debuff: "Замкнутость, аутизация и бегство от реальных контактов",
  },
  {
    buff: "Качественная эрекция и здоровый отклик сосудов",
    debuff: "Порно-индуцированная эректильная дисфункция (PIED)",
  },
  {
    buff: "Возврат естественного влечения к реальным женщинам",
    debuff: "Десенсибилизация рецепторов и потеря интереса к реальности",
  },
  {
    buff: "Высокая продуктивность и готовность решать задачи",
    debuff: "Тяжелая прокрастинация и паралич воли",
  },
  {
    buff: "Укрепление общего физического здоровья и иммунитета",
    debuff: "Мозговой туман (Brain Fog) и синдром рассеянного внимания",
  },
];

export const NofapBuffs: React.FC<NofapBuffsProps> = ({
  rows = DEFAULT_EFFECT_ROWS,
}) => {
  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        border: "1px solid #1f1f1f",
        borderRadius: "4px",
        marginBottom: "25px",
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >
      

      {/* Шапка колонок */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          backgroundColor: "#141414",
          borderBottom: "1px solid #1f1f1f",
          fontSize: "11px",
          fontWeight: "bold",
          letterSpacing: "0.5px",
        }}
      >
        <div
          style={{
            padding: "8px 14px",
            color: "#00ff15",
            borderRight: "1px solid #1f1f1f",
          }}
        >
          [+] БАФФЫ ВОЗДЕРЖАНИЯ
        </div>
        <div
          style={{
            padding: "8px 14px",
            color: "#ff4d4d",
          }}
        >
          [-] ДЕБАФФЫ ПОРНОЗАВИСИМОСТИ
        </div>
      </div>

      {/* Таблица строк */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                backgroundColor: isEven ? "#0a0a0a" : "#0d0d0d",
                borderBottom: index === rows.length - 1 ? "none" : "1px solid #161616",
                fontSize: "12px",
                lineHeight: "1.4",
              }}
            >
              {/* Позитивный эффект */}
              <div
                style={{
                  padding: "9px 14px",
                  color: "#d0d0d0",
                  borderRight: "1px solid #161616",
                  borderLeft: "2px solid #00ff1533",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#00ff15", fontWeight: "bold" }}>+</span>
                <span>{row.buff}</span>
              </div>

              {/* Негативный эффект */}
              <div
                style={{
                  padding: "9px 14px",
                  color: "#a0a0a0",
                  borderLeft: "2px solid #ff4d4d33",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#ff4d4d", fontWeight: "bold" }}>-</span>
                <span>{row.debuff}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NofapBuffs;
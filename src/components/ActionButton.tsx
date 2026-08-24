// src/components/ActionButton.tsx
import React, { useState } from "react";

export type ButtonVariant = "primary" | "danger" | "secondary";

interface ActionButtonProps {
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<any> | void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: React.CSSProperties;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  loadingText = "Загрузка...",
  successText = "✓ Готово!",
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  style,
  className,
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === "loading" || disabled) return;

    if (!onClick) {
      // Если это submit кнопка без своего onClick, форму обработает onSubmit формы
      return;
    }

    try {
      setStatus("loading");
      const result = onClick(e);
      if (result instanceof Promise) {
        await result;
      }
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1600);
    } catch (err) {
      console.error("Ошибка в ActionButton:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2200);
    }
  };

  // Цветовые схемы
  const getColors = () => {
    if (status === "loading") {
      return { bg: "#1f291e", color: "#00ff15", border: "1px solid #00ff1566", cursor: "wait" };
    }
    if (status === "success") {
      return { bg: "#00ff15", color: "#000", border: "1px solid #00ff15", cursor: "default" };
    }
    if (status === "error") {
      return { bg: "#3d1414", color: "#ff4d4d", border: "1px solid #ff4d4d", cursor: "default" };
    }

    if (disabled) {
      return { bg: "#222", color: "#666", border: "1px solid #333", cursor: "not-allowed" };
    }

    switch (variant) {
      case "danger":
        return { bg: "#2a1111", color: "#ff4d4d", border: "1px solid #ff4d4d66", cursor: "pointer" };
      case "secondary":
        return { bg: "#1f1f1f", color: "#ccc", border: "1px solid #333", cursor: "pointer" };
      case "primary":
      default:
        return { bg: "#00ff15", color: "#000", border: "none", cursor: "pointer" };
    }
  };

  const colors = getColors();

  return (
    <>
      <style>{`
        @keyframes actionBtnSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .action_btn_spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(0, 255, 21, 0.3);
          border-radius: 50%;
          border-top-color: #00ff15;
          animation: actionBtnSpin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
      `}</style>

      <button
        type={type}
        onClick={handleClick}
        disabled={disabled || status === "loading"}
        className={className}
        style={{
          padding: "10px 20px",
          fontWeight: "bold",
          fontSize: "14px",
          borderRadius: "4px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          letterSpacing: "0.5px",
          backgroundColor: colors.bg,
          color: colors.color,
          border: colors.border,
          cursor: colors.cursor,
          ...style,
        }}
      >
        {status === "loading" && <span className="action_btn_spinner" />}
        {status === "loading" && loadingText}
        {status === "success" && successText}
        {status === "error" && "✕ Ошибка отправки"}
        {status === "idle" && children}
      </button>
    </>
  );
};

export default ActionButton;
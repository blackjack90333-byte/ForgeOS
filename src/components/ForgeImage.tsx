// src/components/ForgeImage.tsx
import React, { useState } from "react";

interface ForgeImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string; // Например, "741 / 435"
  borderRadius?: string;
  borderColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const ForgeImage: React.FC<ForgeImageProps> = ({
  src,
  alt = "ForgeOS visual",
  width = "100%",
  height = "auto",
  aspectRatio = "741 / 435",
  borderRadius = "8px",
  borderColor = "#222",
  style,
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width,
        height,
        aspectRatio,
        borderRadius,
        border: `1px solid ${borderColor}`,
        overflow: "hidden",
        backgroundColor: "#0d0d0d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <style>{`
        @keyframes forgeImageShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Лоадер-скелетон (пока картинка грузится) */}
      {!isLoaded && !isError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#121212",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(0, 255, 21, 0.08), transparent)",
              animation: "forgeImageShimmer 1.5s infinite",
            }}
          />
          <span style={{ fontSize: "20px", marginBottom: "4px" }}>⚡</span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: "#00ff15",
              letterSpacing: "1px",
            }}
          >
            LOADING_VISUAL...
          </span>
        </div>
      )}

      {/* Обработка ошибки */}
      {isError ? (
        <div
          style={{
            color: "#ff4d4d",
            fontFamily: "monospace",
            fontSize: "12px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          ✕ Ошибка загрузки: {src}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.4s ease-in-out",
          }}
        />
      )}
    </div>
  );
};

export default ForgeImage;
// src/components/BackgroundAudioPlayer.tsx
import React, { useEffect, useRef, useState } from "react";

interface BackgroundAudioPlayerProps {
  videoId?: string;
}

const DEFAULT_VIDEO_ID = "RG2IK8oRZNA";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export const BackgroundAudioPlayer: React.FC<BackgroundAudioPlayerProps> = ({
  videoId = DEFAULT_VIDEO_ID,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);

  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player("bg-yt-audio-frame", {
        height: "0",
        width: "0",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(100);
            setIsReady(true);
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(val);
    }
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#111",
        border: `1px solid ${isPlaying ? "#00ff15" : "#333"}`,
        borderRadius: "20px",
        padding: "3px 10px",
        fontFamily: "monospace",
        boxShadow: isPlaying ? "0 0 10px rgba(0, 255, 21, 0.25)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      {/* Скрытый IFrame */}
      <div id="bg-yt-audio-frame" style={{ display: "none" }} />

      {/* Кнопка Play / Pause */}
      <button
        onClick={togglePlay}
        disabled={!isReady}
        style={{
          background: "none",
          border: "none",
          color: isPlaying ? "#00ff15" : "#888",
          fontSize: "13px",
          cursor: isReady ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
        title={isPlaying ? "Пауза" : "Включить фокус"}
      >
        {isPlaying ? "❚❚" : "▶"}
      </button>

      <span
        style={{
          fontSize: "11px",
          color: isPlaying ? "#00ff15" : "#777",
          fontWeight: "bold",
          userSelect: "none",
          letterSpacing: "0.5px",
        }}
      >
        ADHD
      </span>

      {/* Ползунок громкости */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={handleVolumeChange}
          style={{
            width: "50px",
            accentColor: "#00ff15",
            cursor: "pointer",
            height: "4px",
          }}
        />
        <span style={{ fontSize: "10px", color: "#888", minWidth: "24px" }}>
          {volume}%
        </span>
      </div>
    </div>
  );
};

export default BackgroundAudioPlayer;
// hooks/useBackgroundMusic.ts - SIMPLE VERSION
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setIsPlaying, toggleMute, setVolume } from "@/store/slices/musicSlice";

export const useBackgroundMusic = () => {
  const dispatch = useDispatch();
  const { isEnabled, isMuted, volume } = useSelector(
    (state: RootState) => state.music
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize audio - SIMPLE
  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio("/background.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;

      audioRef.current.addEventListener("canplay", () => {
        setIsReady(true);
        console.log("✅ Audio ready");
      });

      audioRef.current.addEventListener("error", (e) => {
        console.error("❌ Audio error:", e);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Simple play function
  const playMusic = () => {
    if (!audioRef.current || !isEnabled) return;

    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current
      .play()
      .then(() => {
        dispatch(setIsPlaying(true));
        console.log("🎵 Music playing");
      })
      .catch((error) => {
        console.error("❌ Play failed:", error);
      });
  };

  // Simple stop function
  const stopMusic = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    dispatch(setIsPlaying(false));
    console.log("⏸️ Music stopped");
  };

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle enable/disable
  useEffect(() => {
    if (!isEnabled && audioRef.current) {
      stopMusic();
    }
  }, [isEnabled]);

  return {
    playMusic,
    stopMusic,
    isReady,
    isPlaying: useSelector((state: RootState) => state.music.isPlaying),
  };
};

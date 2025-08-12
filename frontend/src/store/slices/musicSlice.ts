// store/slices/musicSlice.ts - SIMPLE VERSION
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MusicState {
  isEnabled: boolean;
  isMuted: boolean;
  volume: number;
  isPlaying: boolean;
}

const initialState: MusicState = {
  isEnabled: true,
  isMuted: false,
  volume: 0.3, // 30% volume
  isPlaying: false,
};

const musicSlice = createSlice({
  name: "music",
  initialState,
  reducers: {
    toggleMusic: (state) => {
      state.isEnabled = !state.isEnabled;
      if (!state.isEnabled) {
        state.isPlaying = false;
      }
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
  },
});

export const { toggleMusic, toggleMute, setVolume, setIsPlaying } =
  musicSlice.actions;

export default musicSlice.reducer;

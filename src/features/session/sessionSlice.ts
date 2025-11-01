import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type RecipeSession = {
  currentStepIndex: number;
  isRunning: boolean;
  stepRemainingSec: number;
  overallRemainingSec: number;
  lastTickTs?: number;
};

type SessionState = {
  activeRecipeId: string | null;
  byRecipeId: Record<string, RecipeSession>;
};

const initialState: SessionState = {
  activeRecipeId: null,
  byRecipeId: {},
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession(
      state,
      action: PayloadAction<{ recipeId: string; stepRemainingSec: number; overallRemainingSec: number }>
    ) {
      const { recipeId, stepRemainingSec, overallRemainingSec } = action.payload;
      // only one active session allowed
      if (state.activeRecipeId && state.activeRecipeId !== recipeId) return;
      state.activeRecipeId = recipeId;
      state.byRecipeId[recipeId] = {
        currentStepIndex: 0,
        isRunning: true,
        stepRemainingSec,
        overallRemainingSec,
        lastTickTs: Date.now(),
      };
    },
    tickSecond(state, action: PayloadAction<{ recipeId: string }>) {
      const r = state.byRecipeId[action.payload.recipeId];
      if (!r || !r.isRunning) return;
      const now = Date.now();
      const deltaSec = Math.max(0, Math.floor((now - (r.lastTickTs || now)) / 1000));
      if (deltaSec <= 0) {
        r.lastTickTs = now;
        return;
      }
      r.stepRemainingSec = Math.max(0, r.stepRemainingSec - deltaSec);
      r.overallRemainingSec = Math.max(0, r.overallRemainingSec - deltaSec);
      r.lastTickTs = now;
    },
    pauseResume(state, action: PayloadAction<{ recipeId: string; isRunning: boolean }>) {
      const r = state.byRecipeId[action.payload.recipeId];
      if (!r) return;
      r.isRunning = action.payload.isRunning;
      r.lastTickTs = Date.now();
    },
    stopStep(state, action: PayloadAction<{ recipeId: string; nextStepRemainingSec?: number; nextOverallRemainingSec?: number }>) {
      const { recipeId, nextStepRemainingSec, nextOverallRemainingSec } = action.payload;
      const r = state.byRecipeId[recipeId];
      if (!r) return;
      // if nextStepRemainingSec provided => move to next step
      if (typeof nextStepRemainingSec === 'number') {
        r.currentStepIndex += 1;
        r.stepRemainingSec = nextStepRemainingSec;
        r.overallRemainingSec = nextOverallRemainingSec ?? r.overallRemainingSec;
        r.isRunning = true;
        r.lastTickTs = Date.now();
      } else {
        // last step ended => end session
        delete state.byRecipeId[recipeId];
        if (state.activeRecipeId === recipeId) state.activeRecipeId = null;
      }
    },
    endSession(state, action: PayloadAction<{ recipeId: string }>) {
      delete state.byRecipeId[action.payload.recipeId];
      if (state.activeRecipeId === action.payload.recipeId) state.activeRecipeId = null;
    },
  },
});

export const { startSession, tickSecond, pauseResume, stopStep, endSession } = sessionSlice.actions;
export default sessionSlice.reducer;

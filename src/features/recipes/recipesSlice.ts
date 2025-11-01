import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Recipe } from '../../types/types';
import { loadRecipes, saveRecipes } from '../../api/recipesStorage';


type RecipesState = {
  list: Recipe[];
};

const initialState: RecipesState = {
  list: loadRecipes(),
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes(state, action: PayloadAction<Recipe[]>) {
      state.list = action.payload;
      saveRecipes(state.list);
    },
    addRecipe(state, action: PayloadAction<Recipe>) {
      state.list.push(action.payload);
      saveRecipes(state.list);
    },
    updateRecipe(state, action: PayloadAction<Recipe>) {
      const idx = state.list.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
      saveRecipes(state.list);
    },
    removeRecipe(state, action: PayloadAction<string>) {
      state.list = state.list.filter((r) => r.id !== action.payload);
      saveRecipes(state.list);
    },
     deleteRecipe: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(r => r.id !== action.payload);
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const r = state.list.find((x) => x.id === action.payload);
      if (r) {
        r.isFavorite = !r.isFavorite;
        saveRecipes(state.list);
      }
    },
  },
});

export const { setRecipes, addRecipe, updateRecipe, removeRecipe, toggleFavorite,deleteRecipe } =
  recipesSlice.actions;

export default recipesSlice.reducer;

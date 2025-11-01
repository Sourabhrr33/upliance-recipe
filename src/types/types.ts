// src/types/types.ts
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Ingredient = {
  id: string;
  name: string;
  quantity: number; // >0
  unit: string;
};

export type CookSettings = {
  temperature: number; // 40–200
  speed: number; // 1–5
};

export type RecipeStep = {
  id: string;
  description: string;
  type: 'cooking' | 'instruction';
  durationMinutes: number; // integer > 0
  cookingSettings?: CookSettings; // required if type='cooking'
  ingredientIds?: string[]; // required if type='instruction'
};

export type Recipe = {
  id: string;
  title: string;
  cuisine?: string;
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
};

// src/api/recipesStorage.ts
import type { Recipe } from '../types/types';


const KEY = 'recipes:v1';

export function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(KEY, JSON.stringify(recipes));
}

export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // basic sanity: check required fields
    return parsed.filter((r) => r?.id && r?.title) as Recipe[];
  } catch {
    return [];
  }
}

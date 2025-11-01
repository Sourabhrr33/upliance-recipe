import  { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store';
import { addRecipe, updateRecipe } from '../features/recipes/recipesSlice';
import type { Recipe, Ingredient, RecipeStep } from '../types/types';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, Typography } from '@mui/material';

const difficulties = ['Easy','Medium','Hard'] as const;

export default function CreateEditRecipe(){
  const { id } = useParams();
  const nav = useNavigate();
  const dispatch = useDispatch();
  const existing = useSelector((s: RootState) => s.recipes.list.find(r => r.id === id));
  const [title, setTitle] = useState(existing?.title ?? '');
  const [cuisine, setCuisine] = useState(existing?.cuisine ?? '');
  const [difficulty, setDifficulty] = useState<any>(existing?.difficulty ?? 'Easy');
  const [ingredients, setIngredients] = useState<Ingredient[]>(existing?.ingredients ?? []);
  const [steps, setSteps] = useState<RecipeStep[]>(existing?.steps ?? []);

  useEffect(()=> {
    if (existing) {
      setTitle(existing.title); setCuisine(existing.cuisine ?? ''); setDifficulty(existing.difficulty); setIngredients(existing.ingredients); setSteps(existing.steps);
    }
  }, [existing]);

  function addIngredient(){
    setIngredients(prev => [...prev, { id: uuid(), name: '', quantity: 1, unit: 'pcs' }]);
  }
  function addStep(type: 'cooking'|'instruction'){
    setSteps(prev => [...prev, { id: uuid(), description: '', type, durationMinutes: 1 }]);
  }

  function save(){
    if (title.trim().length < 3) return alert('Title >= 3 chars');
    if (ingredients.length < 1) return alert('At least 1 ingredient');
    if (steps.length < 1) return alert('At least 1 step');
    // type-aware validations
    for(const s of steps){
      if (s.durationMinutes <= 0) return alert('Step duration > 0');
      if (s.type === 'cooking'){
        if (!s.cookingSettings) return alert('Cooking step requires settings');
        const t = s.cookingSettings.temperature;
        const sp = s.cookingSettings.speed;
        if (t < 40 || t > 200) return alert('Temperature 40-200');
        if (sp < 1 || sp > 5) return alert('Speed 1-5');
      } else {
        if (!s.ingredientIds || s.ingredientIds.length === 0) return alert('Instruction step needs ingredientIds');
      }
    }

    const now = new Date().toISOString();
    const recipe: Recipe = {
      id: existing?.id ?? uuid(),
      title,
      cuisine,
      difficulty,
      ingredients,
      steps,
      isFavorite: existing?.isFavorite ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (existing) dispatch(updateRecipe(recipe));
    else dispatch(addRecipe(recipe));
    nav('/recipes');
  }

  return (
    <Box>
      <Typography variant="h5">{existing ? 'Edit' : 'Create'} Recipe</Typography>
      <Box mt={2} display="flex" gap={2}>
        <TextField label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <TextField label="Cuisine" value={cuisine} onChange={(e)=>setCuisine(e.target.value)} />
        <FormControl>
          <InputLabel>Difficulty</InputLabel>
          <Select value={difficulty} onChange={(e)=>setDifficulty(e.target.value as any)}>
            {difficulties.map(d=> <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">Ingredients</Typography>
        <Button onClick={addIngredient}>Add Ingredient</Button>
        {ingredients.map((ing, i)=>(
          <Box key={ing.id} display="flex" gap={1} mt={1}>
            <TextField value={ing.name} onChange={e=>setIngredients(prev=>{ const c=[...prev]; c[i].name=e.target.value; return c; })} placeholder="Name"/>
            <TextField type="number" value={ing.quantity} onChange={e=>setIngredients(prev=>{ const c=[...prev]; c[i].quantity=Number(e.target.value); return c; })}/>
            <TextField value={ing.unit} onChange={e=>setIngredients(prev=>{ const c=[...prev]; c[i].unit=e.target.value; return c; })}/>
          </Box>
        ))}
      </Box>

      <Box mt={2}>
        <Typography variant="h6">Steps</Typography>
        <Button onClick={()=>addStep('instruction')}>Add Instruction</Button>
        <Button onClick={()=>addStep('cooking')}>Add Cooking</Button>
        {steps.map((s, idx)=>(
          <Box key={s.id} border="1px solid #ddd" p={1} mt={1}>
            <TextField fullWidth value={s.description} onChange={e=>setSteps(prev=>{ const c=[...prev]; c[idx].description=e.target.value; return c; })} placeholder={`Step ${idx+1} description`}/>
            <TextField type="number" value={s.durationMinutes} onChange={e=>setSteps(prev=>{ const c=[...prev]; c[idx].durationMinutes = Math.max(1, Number(e.target.value)); return c; })}/>
            {s.type === 'cooking' && (
              <Box>
                <TextField type="number" value={s.cookingSettings?.temperature ?? ''} onChange={e=>setSteps(prev=>{ const c=[...prev]; c[idx].cookingSettings = {...(c[idx].cookingSettings||{temperature:40,speed:1}), temperature: Number(e.target.value)}; return c; })} placeholder="temperature 40-200"/>
                <TextField type="number" value={s.cookingSettings?.speed ?? ''} onChange={e=>setSteps(prev=>{ const c=[...prev]; c[idx].cookingSettings = {...(c[idx].cookingSettings||{temperature:40,speed:1}), speed: Number(e.target.value)}; return c; })} placeholder="speed 1-5"/>
              </Box>
            )}
            {s.type === 'instruction' && (
              <Box>
                <Typography variant="caption">Choose ingredients</Typography>
                <select multiple value={s.ingredientIds ?? []} onChange={(e)=> {
                  const options = Array.from(e.target.selectedOptions).map(o=>o.value);
                  setSteps(prev=>{ const c=[...prev]; c[idx].ingredientIds = options; return c; });
                }}>
                  {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                </select>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box mt={2}>
        <Button variant="contained" onClick={save}>Save Recipe</Button>
      </Box>
    </Box>
  );
}

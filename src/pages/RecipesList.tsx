import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store';
import { toggleFavorite } from '../features/recipes/recipesSlice';
import type { Recipe } from '../types/types';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, Typography, Select, MenuItem, FormControl, InputLabel,
  Grid, Card, CardContent, IconButton, Stack
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { totalDurationSecFromSteps } from '../utils/timer';
import  { deleteRecipe } from '../features/recipes/recipesSlice';


export default function RecipesList() {
  const recipes = useSelector((s: RootState) => s.recipes.list);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    let arr = recipes.slice();
    if (difficulties.length > 0) arr = arr.filter(r => difficulties.includes(r.difficulty));
    arr.sort((a, b) => {
      const ta = totalDurationSecFromSteps(a.steps);
      const tb = totalDurationSecFromSteps(b.steps);
      return sort === 'asc' ? ta - tb : tb - ta;
    });
    return arr;
  }, [recipes, difficulties, sort]);

  return (
    <Box mt={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Your Recipes</Typography>
        <Button variant="contained" onClick={() => nav('/create')}>
          + New Recipe
        </Button>
      </Box>

      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <FormControl size="small">
          <InputLabel>Sort by time</InputLabel>
          <Select
            value={sort}
            label="Sort by time"
            onChange={(e) => setSort(e.target.value as any)}
          >
            <MenuItem value="asc">Shortest first</MenuItem>
            <MenuItem value="desc">Longest first</MenuItem>
          </Select>
        </FormControl>
        {['Easy', 'Medium', 'Hard'].map((d) => (
          <Chip
            key={d}
            label={d}
            onClick={() =>
              setDifficulties((prev) =>
                prev.includes(d) ? prev.filter((p) => p !== d) : [...prev, d]
              )
            }
            color={difficulties.includes(d) ? 'primary' : 'default'}
          />
        ))}
      </Stack>

 <Grid container spacing={3}>
  {filtered.map((r: Recipe) => {
    const totalMin = Math.round(totalDurationSecFromSteps(r.steps) / 60);
    return (
      <Grid item xs={12} sm={6} md={4} key={r.id} {...({} as any)}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' },
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h6"
                sx={{ cursor: 'pointer' }}
                onClick={() => nav(`/cook/${r.id}`)}
              >
                {r.title}
              </Typography>
              <IconButton onClick={() => dispatch(toggleFavorite(r.id))}>
                {r.isFavorite ? (
                  <StarIcon color="secondary" />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
            </Box>
            <Typography color="text.secondary" variant="body2">
              {r.difficulty} • {totalMin} mins
            </Typography>
         <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Button size="small" onClick={() => nav(`/cook/${r.id}`)}>
                Cook Now
            </Button>
            <Box>
                <IconButton onClick={() => nav(`/create/${r.id}`)}>
                <EditIcon />
                </IconButton>
                <IconButton
                color="error"
                onClick={() => {
                    if (confirm(`Delete "${r.title}" permanently?`)) {
                    dispatch(deleteRecipe(r.id));
                    }
                }}
                >
                <DeleteIcon />
                </IconButton>
            </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  })}
</Grid>;

    </Box>
  );
}

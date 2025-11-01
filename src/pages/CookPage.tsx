// src/pages/CookPage.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store';
import {
  startSession,
  tickSecond,
  pauseResume,
  stopStep,
  endSession,
} from '../features/session/sessionSlice';
import { totalDurationSecFromSteps, secToMMSS } from '../utils/timer';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  CircularProgress,
  Card,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useInterval } from '../hooks/useInterval';

export default function CookPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const nav = useNavigate();
  const dispatch = useDispatch();

  const recipe = useSelector((s: RootState) =>
    s.recipes.list.find((r) => r.id === id)
  );
  const sessionState = useSelector((s: RootState) =>
    id ? s.session.byRecipeId[id] : undefined
  );

  // redirect if invalid recipe
  useEffect(() => {
    if (!recipe && id) nav('/recipes');
  }, [recipe, id, nav]);

  if (!id) return <Typography>Invalid recipe id</Typography>;
  if (!recipe) return <Typography>Recipe not found</Typography>;

  // ✅ from here, recipe is guaranteed defined
  const safeRecipe = recipe;

  const totalSec = totalDurationSecFromSteps(safeRecipe.steps);

  // Timer tick
  useInterval(() => {
    if (sessionState?.isRunning) dispatch(tickSecond({ recipeId: id }));
  }, sessionState?.isRunning ? 1000 : null);

  // Step auto-advance
  useEffect(() => {
    if (!sessionState) return;
    if (sessionState.stepRemainingSec === 0) {
      const curIndex = sessionState.currentStepIndex;
      const isLast = curIndex === safeRecipe.steps.length - 1;
      if (isLast) {
        dispatch(endSession({ recipeId: id }));
      } else {
        const nextIndex = curIndex + 1;
        const nextStepSec = safeRecipe.steps[nextIndex].durationMinutes * 60;
        const remainOverall = sessionState.overallRemainingSec;
        dispatch(
          stopStep({
            recipeId: id,
            nextStepRemainingSec: nextStepSec,
            nextOverallRemainingSec: remainOverall,
          })
        );
      }
    }
  }, [sessionState?.stepRemainingSec, safeRecipe, id, dispatch]);

  const curIndex = sessionState?.currentStepIndex ?? 0;
  const curStep = safeRecipe.steps[curIndex];
  const stepTotalSec = curStep.durationMinutes * 60;
  const stepElapsed =
    stepTotalSec - (sessionState?.stepRemainingSec ?? stepTotalSec);
  const stepPercent = Math.round((stepElapsed / stepTotalSec) * 100);

  const overallElapsed =
    totalSec - (sessionState?.overallRemainingSec ?? totalSec);
  const overallPercent = Math.round((overallElapsed / totalSec) * 100);

  function handleStart() {
    if (sessionState) return;
    const firstStepSec = safeRecipe.steps[0].durationMinutes * 60;
    dispatch(
      startSession({
        recipeId: id,
        stepRemainingSec: firstStepSec,
        overallRemainingSec: totalSec,
      })
    );
  }

  function handlePauseResume() {
    if (!sessionState) return;
    dispatch(
      pauseResume({ recipeId: id, isRunning: !sessionState.isRunning })
    );
  }

  function handleStop() {
    if (!sessionState) return;
    const curIndex = sessionState.currentStepIndex;
    const isLast = curIndex === safeRecipe.steps.length - 1;
    if (isLast) {
      dispatch(endSession({ recipeId: id }));
    } else {
      const nextIndex = curIndex + 1;
      const nextStepSec = safeRecipe.steps[nextIndex].durationMinutes * 60;
      dispatch(
        stopStep({
          recipeId: id,
          nextStepRemainingSec: nextStepSec,
          nextOverallRemainingSec:
            sessionState.overallRemainingSec -
            sessionState.stepRemainingSec,
        })
      );
    }
  }

  return (
    <Box mt={4} display="flex" flexDirection="column" alignItems="center">
      <Card sx={{ p: 4, width: '100%', maxWidth: 700, boxShadow: 4 }}>
        <Typography variant="h4" mb={1}>
          {safeRecipe.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>
          {safeRecipe.cuisine} • {safeRecipe.difficulty} •{' '}
          {Math.round(totalSec / 60)} mins
        </Typography>

        {safeRecipe.ingredients && safeRecipe.ingredients.length > 0 && (
          <>
            <Typography variant="h6" mt={2}>
              Ingredients
            </Typography>

            <List dense sx={{ mb: 2 }}>
              {safeRecipe.ingredients.map((ing) => (
                <ListItem key={ing.id} disableGutters>
                  <ListItemText
                    primary={`${ing.name} — ${ing.quantity} ${ing.unit}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Box display="flex" flexDirection="column" alignItems="center">
          <CircularProgress
            variant="determinate"
            value={stepPercent}
            size={120}
            thickness={5}
            color="secondary"
          />
          <Typography variant="h6" mt={2}>
            Step {curIndex + 1} of {safeRecipe.steps.length}
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ maxWidth: 560 }}>
            {curStep.description}
          </Typography>
          <Typography variant="h5" mt={1} fontFamily="monospace">
            {secToMMSS(sessionState?.stepRemainingSec ?? stepTotalSec)}
          </Typography>

          <Stack direction="row" spacing={2} mt={3}>
            {!sessionState && (
              <Button variant="contained" size="large" onClick={handleStart}>
                Start Cooking
              </Button>
            )}
            {sessionState && (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handlePauseResume}
                >
                  {sessionState.isRunning ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="outlined" color="error" onClick={handleStop}>
                  STOP
                </Button>
              </>
            )}
          </Stack>
        </Box>

        <Box mt={4}>
          <LinearProgress
            variant="determinate"
            value={overallPercent}
            color="primary"
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography mt={1} align="center">
            Overall: {overallPercent}% (
            {secToMMSS(sessionState?.overallRemainingSec ?? totalSec)} left)
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

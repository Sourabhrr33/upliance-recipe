import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { useLocation, useNavigate } from 'react-router-dom';
import { pauseResume, stopStep, endSession } from '../../features/session/sessionSlice';
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

export default function MiniPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const activeId = useSelector((s: RootState) => s.session.activeRecipeId);
  const allSessions = useSelector((s: RootState) => s.session.byRecipeId);
  const allRecipes = useSelector((s: RootState) => s.recipes.list);


  const session = activeId ? allSessions[activeId] : undefined;
  const recipe = activeId ? allRecipes.find(r => r.id === activeId) : undefined;

  if (!activeId || !session || !recipe) return null;
  if (location.pathname === `/cook/${activeId}`) return null;

  const curStep = recipe.steps[session.currentStepIndex];
  const stepTotal = curStep.durationMinutes * 60;
  const stepElapsed = stepTotal - session.stepRemainingSec;
  const pct = Math.round((stepElapsed / stepTotal) * 100);

  const handleToggle = () =>
    dispatch(pauseResume({ recipeId: activeId, isRunning: !session.isRunning }));

  const handleStop = () => {
    const isLast = session.currentStepIndex === recipe.steps.length - 1;
    if (isLast) {
      dispatch(endSession({ recipeId: activeId }));
    } else {
      const nextIndex = session.currentStepIndex + 1;
      const nextStepSec = recipe.steps[nextIndex].durationMinutes * 60;
      dispatch(
        stopStep({
          recipeId: activeId,
          nextStepRemainingSec: nextStepSec,
          nextOverallRemainingSec:
            session.overallRemainingSec - session.stepRemainingSec,
        })
      );
    }
  };

  return (
   <Box
  position="fixed"
  bottom={20}
  right={20}
  bgcolor="white"
  p={1.5}
  pl={2}
  pr={2}
  borderRadius={3}
  boxShadow="0 4px 12px rgba(0,0,0,0.15)"
  display="flex"
  alignItems="center"
  gap={2}
  sx={{
    cursor: 'pointer',
    '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.2)' },
  }}
  onClick={() => navigate(`/cook/${activeId}`)}
>
  <CircularProgress variant="determinate" value={pct} size={40} thickness={5} color="secondary" />
  <Box minWidth="120px">
    <Typography variant="subtitle2">{recipe.title}</Typography>
    <Typography variant="caption" color="text.secondary">
      Step {session.currentStepIndex + 1} •{' '}
      {Math.floor(session.stepRemainingSec / 60)}:
      {String(session.stepRemainingSec % 60).padStart(2, '0')}
    </Typography>
  </Box>
  <IconButton onClick={(e) => { e.stopPropagation(); handleToggle(); }}>
    {session.isRunning ? <PauseIcon /> : <PlayArrowIcon />}
  </IconButton>
  <IconButton onClick={(e) => { e.stopPropagation(); handleStop(); }}>
    <StopIcon color="error" />
  </IconButton>
</Box>

  );
}

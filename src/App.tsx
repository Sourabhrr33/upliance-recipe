// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RecipesList from './pages/RecipesList';
import CreateEditRecipe from './pages/CreateEditRecipe';
import CookPage from './pages/CookPage';
import Header from './components/Header';
import MiniPlayer from './components/MiniPlayer/MiniPlayer';
import { Container } from '@mui/material';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Container sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="/recipes" element={<RecipesList />} />
          <Route path="/create" element={<CreateEditRecipe />} />
          <Route path="/create/:id" element={<CreateEditRecipe />} />
          <Route path="/cook/:id" element={<CookPage />} />
        </Routes>
      </Container>
      <MiniPlayer />
    </BrowserRouter>
  );
}
export default App;

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          to="/recipes"
          sx={{
            textDecoration: 'none',
            color: 'white',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          🍳 Upliance Recipes
        </Typography>

        <Box display="flex" gap={2}>
          {location.pathname !== '/recipes' && (
            <Button color="inherit" component={Link} to="/recipes">
              All Recipes
            </Button>
          )}
          <Button color="inherit" component={Link} to="/create">
            Create Recipe
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Box, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Divider, Toolbar, Collapse } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? 200 : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? 200 : 60,
            boxSizing: 'border-box',
            transition: 'width 0.2s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          <Toolbar sx={{ justifyContent: open ? 'flex-end' : 'center' }}>
            <IconButton onClick={handleDrawerToggle} size="large">
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton selected>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <Collapse in={open} orientation="horizontal">
                  <ListItemText primary="Dashboard" />
                </Collapse>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Box>
          <Divider />
          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <Collapse in={open} orientation="horizontal">
                  <ListItemText primary="Logout" />
                </Collapse>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <div>
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </Box>
    </Box>
  );
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const theme = createTheme();
  const token = localStorage.getItem('access_token');

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/dashboard" />
              ) : (
                <>
                  <Login />
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button component={Link} to="/signup">Don't have an account? Sign Up</Button>
                  </Box>
                </>
              )
            }
          />
          <Route
            path="/signup"
            element={
              token ? (
                <Navigate to="/dashboard" />
              ) : (
                <>
                  <Signup />
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button component={Link} to="/login">Already have an account? Login</Button>
                  </Box>
                </>
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App

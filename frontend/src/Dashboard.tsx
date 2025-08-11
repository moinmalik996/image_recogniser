import React, { useState } from 'react';
import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';
import { Box, Drawer, Toolbar, IconButton, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImageIcon from '@mui/icons-material/Image';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const [selected, setSelected] = useState('dashboard');

  const handleDrawerToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleNav = (route: string) => {
    setSelected(route);
    navigate(`/${route}`);
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
              <ListItemButton selected={selected === 'dashboard'} onClick={() => handleNav('dashboard')}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <Collapse in={open} orientation="horizontal">
                  <ListItemText primary="Dashboard" />
                </Collapse>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton selected={selected === 'images'} onClick={() => handleNav('images')}>
                <ListItemIcon>
                  <ImageIcon />
                </ListItemIcon>
                <Collapse in={open} orientation="horizontal">
                  <ListItemText primary="Images" />
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
            Edit <code>src/Dashboard.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </Box>
    </Box>
  );
};

export default Dashboard;

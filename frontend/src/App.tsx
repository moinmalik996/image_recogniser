import './App.css';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import Images from './Images';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';



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
            path="/images"
            element={
              <RequireAuth>
                <Images />
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

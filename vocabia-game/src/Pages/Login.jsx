import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert
} from '@mui/material';
import { styled } from '@mui/system';

// Wrapper with gradient nature background
const NatureWrapper = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom, #e6ffe6, #b3ffcc)',
  position: 'relative',
  zIndex: 0,
});

// Animated falling leaf
const Leaf = styled('div')(({ x, size, duration, delay }) => ({
  position: 'absolute',
  top: '-10%',
  left: `${x}%`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundImage: 'url("/leaf.png")',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  animation: `fallLeaf ${duration}s linear ${delay}s infinite`,
  opacity: 0.6,
  zIndex: 1
}));

// Floating fireflies
const Firefly = styled('div')(({ x, y, size, duration, delay }) => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: 'rgba(255, 255, 153, 0.8)',
  borderRadius: '50%',
  filter: 'blur(1px)',
  animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
  zIndex: 1,
}));

const NaturePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.85)',
  boxShadow: '0 0 20px rgba(0,100,0,0.2)',
  backdropFilter: 'blur(8px)',
  zIndex: 2,
  position: 'relative',
}));

const NatureButton = styled(Button)({
  background: 'linear-gradient(90deg, #66cc66, #33aa33)',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: '12px',
  '&:hover': {
    background: 'linear-gradient(90deg, #33aa33, #66cc66)',
    boxShadow: '0 0 12px #33aa33',
  },
});

const leaves = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: Math.random() * 30 + 20,
  duration: 8 + Math.random() * 5,
  delay: Math.random() * 5
}));

const fireflies = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: 4 + Math.random() * 4,
  delay: Math.random() * 4
}));

const Login = ({ setIsAuthenticated, setRole }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setIsAuthenticated(true);
        setRole(data.role);
        if (data.role === 'STUDENT') navigate('/student-home');
        else if (data.role === 'TEACHER') navigate('/teacher-home');
      } else {
        setError(typeof data === 'string' ? data : (data.message || 'Login failed'));
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <NatureWrapper>
      {leaves.map(leaf => <Leaf key={leaf.id} {...leaf} />)}
      {fireflies.map(firefly => <Firefly key={firefly.id} {...firefly} />)}

      <NaturePaper>
        <Typography variant="h3" align="center" sx={{
          color: '#2e7d32',
          fontFamily: 'Georgia, serif',
          mb: 3
        }}>
          🌿 VocabVenture
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="email"
              type="email"
              label="Email"
              variant="filled"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
              InputProps={{ style: { color: '#2e7d32' } }}
              InputLabelProps={{ style: { color: '#4caf50' } }}
              sx={{ backgroundColor: '#f0fff0', borderRadius: 1 }}
            />
            <TextField
              name="password"
              type="password"
              label="Password"
              variant="filled"
              fullWidth
              required
              value={form.password}
              onChange={handleChange}
              InputProps={{ style: { color: '#2e7d32' } }}
              InputLabelProps={{ style: { color: '#4caf50' } }}
              sx={{ backgroundColor: '#f0fff0', borderRadius: 1 }}
            />
            <NatureButton type="submit" fullWidth>
              LOGIN
            </NatureButton>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="body2" align="center" sx={{ color: '#2e7d32' }}>
              Don’t have an account?&nbsp;
              <Link to="/register" style={{ color: '#4caf50', textDecoration: 'none' }}>
                Register here
              </Link>
            </Typography>
          </Stack>
        </form>
      </NaturePaper>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes fallLeaf {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(120vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(20px, -20px) scale(1.2);
          }
        }
      `}</style>
    </NatureWrapper>
  );
};

export default Login;

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

// Wrapper with layered space background
const GalacticWrapper = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000',
  zIndex: 0,

  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, rgba(0,255,100,0.08), transparent 70%)',
    zIndex: 0,
  },
});

// Brightened rotating galaxy
const RotatingGalaxy = styled(Box)({
  position: 'absolute',
  inset: 0,
  backgroundImage: 'url("/galaxy.png")',
  backgroundSize: '120% 120%',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  opacity: 0.25,
  animation: 'spin 90s linear infinite',
  filter: 'brightness(1.4) saturate(1.3) blur(1px)',
  zIndex: 0,
  pointerEvents: 'none',
});

// Falling stars
const Star = styled('div')(({ x, y, size, duration, delay }) => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: 'white',
  borderRadius: '50%',
  opacity: 0.5,
  animation: `moveStar ${duration}s linear ${delay}s infinite`,
  zIndex: 1,
}));

const GalacticPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '20px',
  background: 'linear-gradient(160deg, rgba(10,20,10,0.95), rgba(20,40,20,0.95))',
  boxShadow: '0 0 30px rgba(0,255,100,0.3), 0 0 60px rgba(0,200,80,0.2)',
  backdropFilter: 'blur(10px)',
  zIndex: 2,
  position: 'relative',
}));

const GlowButton = styled(Button)({
  background: 'linear-gradient(90deg, #00ff88, #33ff33)',
  color: '#000',
  boxShadow: '0 0 15px #00ff88',
  borderRadius: '12px',
  fontWeight: 'bold',
  '&:hover': {
    background: 'linear-gradient(90deg, #33ff33, #00ff88)',
    boxShadow: '0 0 25px #33ff33',
  },
});

const starsData = Array.from({ length: 100 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  duration: 10 + Math.random() * 10,
  delay: Math.random() * 10
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
    <GalacticWrapper>
      <RotatingGalaxy />

      {starsData.map(star => (
        <Star
          key={star.id}
          x={star.x}
          y={star.y}
          size={star.size}
          duration={star.duration}
          delay={star.delay}
        />
      ))}

      <GalacticPaper>
        <Typography variant="h3" align="center" sx={{
          color: '#00ff88',
          fontFamily: 'Orbitron, sans-serif',
          textShadow: '0 0 10px #00ff88',
          mb: 3
        }}>
          🪐 VocabVenture
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
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#ccc' } }}
              sx={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1 }}
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
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#ccc' } }}
              sx={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1 }}
            />
            <GlowButton type="submit" fullWidth>
              LOGIN
            </GlowButton>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="body2" align="center" sx={{ color: '#ccc' }}>
              Don’t have an account?&nbsp;
              <Link to="/register" style={{ color: '#00ff88', textDecoration: 'none' }}>
                Register here
              </Link>
            </Typography>
          </Stack>
        </form>
      </GalacticPaper>

      <style>{`
        @keyframes moveStar {
          0% { transform: translateY(-100vh) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) scale(0.3); opacity: 0; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </GalacticWrapper>
  );
};

export default Login;

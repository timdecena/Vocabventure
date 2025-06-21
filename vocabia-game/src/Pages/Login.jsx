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

// Arcade Neon wrapper with animated grid background
const ArcadeWrapper = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#18181b',
  position: 'relative',
  zIndex: 0,
  // Neon grid overlay
  backgroundImage: `
    repeating-linear-gradient(90deg, rgba(0,234,255,0.18) 0 2px, transparent 2px 80px),
    repeating-linear-gradient(0deg, rgba(0,234,255,0.18) 0 2px, transparent 2px 80px)
  `,
  boxShadow: '0 0 40px 10px #00eaff33 inset',
  animation: 'arcadeGridMove 12s linear infinite',
});

// Floating neon particles
const NeonParticle = styled('div')(({ x, y, size, duration, delay, color }) => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: color,
  borderRadius: '50%',
  filter: 'blur(1px)',
  boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
  animation: `neonFloat ${duration}s ease-in-out ${delay}s infinite alternate`,
  zIndex: 1,
}));

const ArcadePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '24px',
  background: '#18181b',
  border: '2.5px solid #00eaff',
  boxShadow: '0 0 32px #00eaff80, 0 0 64px #ff00c880',
  backdropFilter: 'blur(8px)',
  zIndex: 2,
  position: 'relative',
  minWidth: '400px',
}));

const ArcadeButton = styled(Button)({
  background: 'transparent',
  color: '#00eaff',
  fontWeight: 'bold',
  fontFamily: "'Press Start 2P', cursive",
  fontSize: '0.9rem',
  border: '2px solid #00eaff',
  borderRadius: '12px',
  padding: '12px 24px',
  textShadow: '0 0 8px #00eaff',
  boxShadow: '0 0 16px #00eaff80',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#00eaff22',
    borderColor: '#ff00c8',
    color: '#fff',
    boxShadow: '0 0 24px #ff00c8',
    textShadow: '0 0 12px #ff00c8',
    transform: 'scale(1.05)',
  },
});

const ArcadeTextField = styled(TextField)({
  '& .MuiFilledInput-root': {
    background: '#23232b',
    border: '2px solid #00eaff',
    borderRadius: '8px',
    color: '#fff',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '0.8rem',
    '&:hover': {
      borderColor: '#ff00c8',
      boxShadow: '0 0 8px #ff00c880',
    },
    '&.Mui-focused': {
      borderColor: '#ff00c8',
      boxShadow: '0 0 12px #ff00c8',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#00eaff',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textShadow: '0 0 6px #00eaff',
    '&.Mui-focused': {
      color: '#ff00c8',
      textShadow: '0 0 8px #ff00c8',
    },
  },
  '& .MuiFilledInput-input': {
    color: '#fff',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '0.8rem',
  },
});

// Generate neon particles
const neonParticles = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 4,
  color: Math.random() > 0.5 ? '#00eaff' : '#ff00c8',
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
        localStorage.setItem('userId', data.userId || data.email || data.sub || 'user-' + Date.now());
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
    <ArcadeWrapper>
      {neonParticles.map(particle => <NeonParticle key={particle.id} {...particle} />)}

      <ArcadePaper>
        <Typography variant="h3" align="center" sx={{
          color: '#fff',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '1.5rem',
          mb: 4,
          textShadow: '0 0 4px #fff, 0 0 12px #ff00c8, 0 0 24px #ff00c8',
        }}>
          VocabVenture
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <ArcadeTextField
              name="email"
              type="email"
              label="Email *"
              variant="filled"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
            />
            <ArcadeTextField
              name="password"
              type="password"
              label="Password *"
              variant="filled"
              fullWidth
              required
              value={form.password}
              onChange={handleChange}
            />
            <ArcadeButton type="submit" fullWidth>
              LOGIN
            </ArcadeButton>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  background: '#ff00c833', 
                  border: '2px solid #ff00c8',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '0.7rem',
                  boxShadow: '0 0 16px #ff00c880',
                  '& .MuiAlert-icon': {
                    color: '#ff00c8',
                    filter: 'drop-shadow(0 0 8px #ff00c8)'
                  }
                }}
              >
                {error}
              </Alert>
            )}
            <Typography variant="body2" align="center" sx={{ 
              color: '#fff', 
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.7rem',
              mt: 2
            }}>
              Don't have an account?&nbsp;
              <Link 
                to="/register" 
                style={{ 
                  color: '#00eaff', 
                  textDecoration: 'none',
                  textShadow: '0 0 8px #00eaff',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ff00c8';
                  e.target.style.textShadow = '0 0 8px #ff00c8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#00eaff';
                  e.target.style.textShadow = '0 0 8px #00eaff';
                }}
              >
                Register here
              </Link>
            </Typography>
          </Stack>
        </form>
      </ArcadePaper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes arcadeGridMove {
          0% {
            background-position: 0 0, 0 0;
          }
          100% {
            background-position: 80px 0, 0 80px;
          }
        }

        @keyframes neonFloat {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translate(30px, -30px) scale(1.3);
            opacity: 1;
          }
        }
      `}</style>
    </ArcadeWrapper>
  );
};

export default Login;

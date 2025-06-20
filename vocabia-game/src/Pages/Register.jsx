import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert,
  MenuItem
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
  minWidth: '450px',
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
  '& .MuiMenuItem-root': {
    background: '#23232b',
    color: '#fff',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '0.8rem',
    '&:hover': {
      background: '#00eaff22',
      color: '#00eaff',
    },
    '&.Mui-selected': {
      background: '#ff00c822',
      color: '#ff00c8',
    },
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

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const msg = await res.text();
        setError(msg);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <ArcadeWrapper>
      {neonParticles.map(particle => <NeonParticle key={particle.id} {...particle} />)}

      <ArcadePaper>
        <Typography variant="h4" align="center" sx={{
          color: '#fff',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '1.2rem',
          mb: 4,
          textShadow: '0 0 4px #fff, 0 0 12px #ff00c8, 0 0 24px #ff00c8',
        }}>
          Create an Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <ArcadeTextField 
              name="firstName" 
              label="First Name *" 
              variant="filled" 
              fullWidth 
              required 
              value={form.firstName} 
              onChange={handleChange}
            />
            <ArcadeTextField 
              name="lastName" 
              label="Last Name *" 
              variant="filled" 
              fullWidth 
              required 
              value={form.lastName} 
              onChange={handleChange}
            />
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
            <ArcadeTextField 
              name="role" 
              select 
              label="Role" 
              variant="filled" 
              fullWidth 
              value={form.role} 
              onChange={handleChange}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      background: '#23232b',
                      border: '2px solid #00eaff',
                      borderRadius: '8px',
                      '& .MuiMenuItem-root': {
                        color: '#fff',
                        fontFamily: "'Press Start 2P', cursive",
                        fontSize: '0.8rem',
                        '&:hover': {
                          background: '#00eaff22',
                          color: '#00eaff',
                        },
                        '&.Mui-selected': {
                          background: '#ff00c822',
                          color: '#ff00c8',
                          '&:hover': {
                            background: '#ff00c833',
                          },
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="TEACHER">Teacher</MenuItem>
            </ArcadeTextField>

            <ArcadeButton type="submit" fullWidth>
              REGISTER
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
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  background: '#00eaff33', 
                  border: '2px solid #00eaff',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '0.7rem',
                  boxShadow: '0 0 16px #00eaff80',
                  animation: 'neonPulse 2s ease-in-out infinite',
                  '& .MuiAlert-icon': {
                    color: '#00eaff',
                    filter: 'drop-shadow(0 0 8px #00eaff)'
                  }
                }}
              >
                {success}
              </Alert>
            )}
            <Typography variant="body2" align="center" sx={{ 
              color: '#fff', 
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.7rem',
              mt: 2
            }}>
              Already have an account?&nbsp;
              <Link 
                to="/" 
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
                Login here
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

        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 0 0 16px #00eaff80;
          }
          50% {
            box-shadow: 0 0 32px #00eaff, 0 0 48px #00eaff80;
          }
        }
      `}</style>
    </ArcadeWrapper>
  );
};

export default Register;

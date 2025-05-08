// File: src/theme.js
import { createTheme } from '@mui/material/styles';

// Create a custom theme based on a gamified space-themed adventure
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00aa7f',
      light: '#00cc99',
      dark: '#007755',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00ffaa',
      light: '#66ffcc',
      dark: '#00cc88',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0a2e',
      paper: 'rgba(10, 15, 30, 0.7)',
      dark: '#0a0a2e',
      darkSecondary: '#1a1a40',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
    border: {
      main: 'rgba(255, 255, 255, 0.15)',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#00ffaa',
      marginBottom: '0.5rem',
      letterSpacing: '1px',
    },
    h2: {
      fontSize: '1.7rem',
      fontWeight: 600,
      color: '#00ffaa',
      marginBottom: '0.5rem',
      letterSpacing: '0.8px',
    },
    subtitle1: {
      fontSize: '1rem',
      color: '#a0a0a0',
      marginBottom: '1rem',
    },
    body1: {
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.1)',
    '0 4px 6px rgba(0, 0, 0, 0.1)',
    '0 10px 15px rgba(0, 0, 0, 0.1)',
    '0 0 10px rgba(0, 255, 170, 0.4)',
    // Add more if needed
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 9999,
          fontWeight: 600,
          padding: '8px 24px',
          position: 'relative',
          overflow: 'hidden',
          letterSpacing: '0.8px',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '30%',
            height: '100%',
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transform: 'skewX(-25deg)',
            transition: 'all 0.75s ease',
          },
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 0 20px rgba(0, 255, 170, 0.5)',
            '&:before': {
              left: '100%',
              transition: 'all 0.75s ease',
            },
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #00aa7f 0%, #00cc99 100%)',
          color: '#ffffff',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #00ffaa 0%, #66ffcc 100%)',
          color: '#000000',
        },
        containedMission: {
          background: 'linear-gradient(45deg, #00c3ff 0%, #0075ff 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 8,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.25)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ffaa',
              boxShadow: '0 0 8px rgba(0, 255, 170, 0.3)',
            },
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
          '& .MuiInputLabel-root': {
            color: '#a0a0a0',
          },
          '& .MuiInputBase-input': {
            color: '#e0e0e0',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(10, 15, 30, 0.7)',
          backdropFilter: 'blur(5px)',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 0 20px rgba(51, 255, 119, 0.2), 0 0 25px rgba(0, 128, 255, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 46, 0.8)',
          backdropFilter: 'blur(5px)',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 0 20px rgba(51, 255, 119, 0.2), 0 0 25px rgba(0, 128, 255, 0.15)',
          animation: 'cardGlow 3s ease-in-out infinite alternate',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#00ffaa',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            textDecoration: 'underline',
            color: '#66ffcc',
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: '#00ffaa',
          color: '#000',
          boxShadow: '0 0 10px #00ffaa',
          animation: 'twinkle 2s infinite ease-in-out',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: '#1a1a40',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(90deg, #00ffaa, #00cc99)',
          animation: 'progressGlow 2s infinite ease-in-out',
        },
      },
    },
  },
});

// Custom keyframes for animations
const globalStyles = {
  '@keyframes cardGlow': {
    '0%': { boxShadow: '0 0 20px rgba(51, 255, 119, 0.2), 0 0 25px rgba(0, 128, 255, 0.1)' },
    '100%': { boxShadow: '0 0 25px rgba(51, 255, 119, 0.3), 0 0 30px rgba(0, 128, 255, 0.15)' },
  },
  '@keyframes twinkle': {
    '0%, 100%': { opacity: 0.3, transform: 'scale(0.9)' },
    '50%': { opacity: 0.7, transform: 'scale(1.05)' },
  },
  '@keyframes progressGlow': {
    '0%': { boxShadow: '0 0 10px #00ffaa' },
    '50%': { boxShadow: '0 0 20px #00ffaa' },
    '100%': { boxShadow: '0 0 10px #00ffaa' },
  },
  '@keyframes meteor': {
    '0%': { transform: 'translate(calc(-100vw), calc(-100vh)) rotate(45deg)', opacity: 0 },
    '5%': { opacity: 0.4 },
    '15%': { opacity: 0.4 },
    '20%': { opacity: 0 },
    '100%': { transform: 'translate(calc(100vw), calc(100vh)) rotate(45deg)', opacity: 0 },
  },
  '@keyframes hover': {
    '0%': { transform: 'translateY(0)' },
    '100%': { transform: 'translateY(-5px)' },
  },
};

export default theme;
export { theme, globalStyles };

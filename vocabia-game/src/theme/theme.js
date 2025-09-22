import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#2563eb', 
      light: '#dbeafe', 
      dark: '#1d4ed8',
      contrastText: '#ffffff'
    },
    secondary: { 
      main: '#7c3aed', 
      light: '#ede9fe', 
      dark: '#5b21b6',
      contrastText: '#ffffff'
    },
    background: { 
      default: '#f8fafc', 
      paper: '#ffffff' 
    },
    success: { 
      main: '#059669', 
      light: '#d1fae5', 
      dark: '#047857' 
    },
    error: { 
      main: '#dc2626', 
      light: '#fecaca', 
      dark: '#b91c1c' 
    },
    warning: { 
      main: '#d97706', 
      light: '#fed7aa', 
      dark: '#92400e' 
    },
    info: { 
      main: '#0284c7', 
      light: '#bae6fd', 
      dark: '#0369a1' 
    },
    text: { 
      primary: '#111827', 
      secondary: '#6b7280' 
    },
    grey: { 
      50: '#f9fafb', 
      100: '#f3f4f6', 
      200: '#e5e7eb', 
      300: '#d1d5db', 
      400: '#9ca3af', 
      500: '#6b7280', 
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    action: { 
      hover: 'rgba(0,0,0,0.04)', 
      selected: 'rgba(37,99,235,0.08)',
      focus: 'rgba(37,99,235,0.12)'
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: 32, fontWeight: 700, lineHeight: 1.25 },
    h2: { fontSize: 28, fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: 24, fontWeight: 700, lineHeight: 1.35 },
    h4: { fontSize: 21, fontWeight: 700, lineHeight: 1.35 },
    h5: { fontSize: 18, fontWeight: 600 },
    h6: { fontSize: 16, fontWeight: 600 },
    subtitle1: { fontSize: 16, fontWeight: 600 },
    body1: { fontSize: 16 },
    body2: { fontSize: 14 },
    caption: { fontSize: 12, fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          transition: 'all 180ms ease',
        },
        containedPrimary: ({ theme }) => ({
          boxShadow: '0 2px 6px ' + theme.palette.primary.main + '22',
          ':hover': { boxShadow: '0 4px 10px ' + theme.palette.primary.main + '33' },
          ':focus-visible': { outline: '2px solid ' + theme.palette.primary.main + '33' },
        }),
        outlined: ({ theme }) => ({
          borderWidth: 2,
          ':hover': { backgroundColor: theme.palette.action.hover },
          ':focus-visible': { outline: '2px solid ' + theme.palette.primary.main + '33' },
        }),
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          border: '1px solid',
          borderColor: theme.palette.grey[200],
          backgroundColor: theme.palette.background.paper,
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          '&:hover': { 
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            borderColor: theme.palette.grey[300],
            transform: 'translateY(-2px)'
          }
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginLeft: 0 } },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          fontWeight: 500,
          fontSize: '0.875rem',
          '&.MuiChip-filled': {
            boxShadow: 'none',
          }
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          '&.MuiPaper-elevation1': {
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
          },
          '&.MuiPaper-elevation2': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.06)',
          },
          '&.MuiPaper-elevation3': {
            boxShadow: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
          },
        }),
      },
    },
  },
});

export default theme;

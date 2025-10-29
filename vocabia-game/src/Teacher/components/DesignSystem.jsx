import React from 'react';
import { Box, Typography, Button as MuiButton, Card as MuiCard, CardContent, TextField } from '@mui/material';

// ==================== COLOR PALETTE - ELDER-FRIENDLY PROFESSIONAL ====================
export const colors = {
  mainBg: '#F5F7FA',           // Soft light gray - easy on eyes
  sidebarBg: '#2C3E50',        // Professional dark blue-gray
  sidebarText: '#ECF0F1',      // Light text for dark sidebar
  primary: '#3498DB',          // Clear, readable blue
  primaryDark: '#2980B9',      // Darker blue for hover
  secondary: '#27AE60',        // Professional green
  secondaryDark: '#229954',    // Darker green for hover
  accent: '#E67E22',           // Warm orange for highlights
  text: '#2C3E50',             // Dark blue-gray for text
  textLight: '#7F8C8D',        // Lighter gray for secondary text
  border: '#D5DBDB',           // Soft border color
  cardBg: '#FFFFFF',           // Pure white for cards
  error: '#E74C3C',            // Clear red
  success: '#27AE60',          // Clear green
  warning: '#F39C12',          // Clear orange
  info: '#3498DB',             // Clear blue
};

// ==================== STANDARDIZED CARD COMPONENT ====================
export const StyledCard = ({ children, sx = {}, ...props }) => {
  return (
    <MuiCard
      elevation={0}
      sx={{
        bgcolor: colors.cardBg,
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderColor: colors.primary,
        },
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </MuiCard>
  );
};

// ==================== STANDARDIZED BUTTON COMPONENTS ====================
export const PrimaryButton = ({ children, sx = {}, ...props }) => {
  return (
    <MuiButton
      variant="contained"
      sx={{
        bgcolor: colors.primary,
        color: '#FFFFFF',
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: '6px',
        px: 3,
        py: 1.25,
        fontSize: '1rem',
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: colors.primaryDark,
          boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
        '&:disabled': {
          bgcolor: colors.border,
          color: colors.textLight,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export const SecondaryButton = ({ children, sx = {}, ...props }) => {
  return (
    <MuiButton
      variant="contained"
      sx={{
        bgcolor: colors.secondary,
        color: '#FFFFFF',
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: '6px',
        px: 3,
        py: 1.25,
        fontSize: '1rem',
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: colors.secondaryDark,
          boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
        '&:disabled': {
          bgcolor: colors.border,
          color: colors.textLight,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export const GhostButton = ({ children, sx = {}, ...props }) => {
  return (
    <MuiButton
      variant="outlined"
      sx={{
        borderColor: colors.primary,
        color: colors.primary,
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: '8px',
        px: 3,
        py: 1.25,
        fontSize: '1rem',
        borderWidth: '2px',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: colors.primary,
          bgcolor: 'rgba(144, 190, 222, 0.08)',
          borderWidth: '2px',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export const DestructiveButton = ({ children, sx = {}, ...props }) => {
  return (
    <MuiButton
      variant="contained"
      sx={{
        bgcolor: colors.error,
        color: colors.white,
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: '8px',
        px: 3,
        py: 1.25,
        fontSize: '1rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: '#C0392B',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

// ==================== PAGE TITLE COMPONENT ====================
export const PageTitle = ({ children, icon, action, sx = {} }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: colors.primary,
              color: colors.white,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: colors.text,
            fontSize: { xs: '1.75rem', md: '2.5rem' },
          }}
        >
          {children}
        </Typography>
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
};

// ==================== STANDARDIZED INPUT COMPONENT ====================
export const StyledInput = ({ label, helperText, error, ...props }) => {
  return (
    <TextField
      label={label}
      helperText={helperText}
      error={error}
      fullWidth
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          bgcolor: colors.white,
          transition: 'all 0.3s ease',
          '& fieldset': {
            borderColor: colors.border,
            borderWidth: '2px',
          },
          '&:hover fieldset': {
            borderColor: colors.primary,
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.primary,
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root': {
          color: colors.text,
          fontWeight: 500,
          '&.Mui-focused': {
            color: colors.primary,
          },
        },
      }}
      {...props}
    />
  );
};

// ==================== SECTION HEADER COMPONENT ====================
export const SectionHeader = ({ children, sx = {} }) => {
  return (
    <Typography
      variant="h5"
      sx={{
        fontWeight: 600,
        color: colors.text,
        mb: 2,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

// ==================== STAT CARD COMPONENT ====================
export const StatCard = ({ icon, value, label, color = colors.primary, onClick, sx = {} }) => {
  return (
    <StyledCard
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            }
          : {},
        ...sx,
      }}
      onClick={onClick}
    >
      <Box sx={{ textAlign: 'center' }}>
        {icon && (
          <Box sx={{ fontSize: 40, color, mb: 1 }}>
            {icon}
          </Box>
        )}
        <Typography variant="h3" sx={{ fontWeight: 700, color, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </StyledCard>
  );
};

// ==================== EMPTY STATE COMPONENT ====================
export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      {icon && (
        <Box
          sx={{
            fontSize: 80,
            color: colors.border,
            mb: 2,
            opacity: 0.5,
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
        {description}
      </Typography>
      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default {
  colors,
  StyledCard,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DestructiveButton,
  PageTitle,
  StyledInput,
  SectionHeader,
  StatCard,
  EmptyState,
};

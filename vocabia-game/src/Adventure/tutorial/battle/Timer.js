import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const TimerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const TimerText = styled(Typography)(({ theme, timeLeft }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: timeLeft <= 10 ? '#ff4444' : '#ffffff',
  textShadow: timeLeft <= 10 ? '0 0 10px rgba(255, 68, 68, 0.5)' : 'none',
  animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
}));

const Timer = ({ timeLeft }) => {
  return (
    <TimerContainer>
      <TimerText timeLeft={timeLeft}>
        {timeLeft}s
      </TimerText>
    </TimerContainer>
  );
};

export default Timer; 
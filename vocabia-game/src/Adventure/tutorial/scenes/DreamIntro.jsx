import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const subtleGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px rgba(255,255,255,0.3);
  }
  50% {
    text-shadow: 0 0 20px rgba(255,255,255,0.6);
  }
`;

const floatingDots = keyframes`
  0%, 100% { 
    opacity: 0.2;
    transform: translateY(0px);
  }
  50% { 
    opacity: 0.8;
    transform: translateY(-10px);
  }
`;

const TextContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 900,
  backgroundColor: '#000000', // Pure black background
  overflow: 'hidden',
  
  // Add subtle floating dots
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(1px 1px at 100px 150px, rgba(255,255,255,0.3), transparent),
      radial-gradient(1px 1px at 300px 300px, rgba(255,255,255,0.2), transparent),
      radial-gradient(1px 1px at 600px 100px, rgba(255,255,255,0.3), transparent),
      radial-gradient(1px 1px at 800px 400px, rgba(255,255,255,0.2), transparent),
      radial-gradient(1px 1px at 200px 500px, rgba(255,255,255,0.3), transparent)
    `,
    backgroundSize: '1000px 600px',
    animation: `${floatingDots} 4s ease-in-out infinite`,
    zIndex: 1,
  },
}));

const TextLine = styled(Typography)(({ theme, visible }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#ffffff',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  letterSpacing: '1px',
  lineHeight: 1.3,
  marginBottom: theme.spacing(2),
  opacity: visible ? 1 : 0,
  transition: 'opacity 1.2s ease-in-out',
  animation: visible ? `${subtleGlow} 3s ease-in-out infinite` : 'none',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90vw',
  textAlign: 'center',
  zIndex: 10,
  whiteSpace: 'nowrap',
  
  // Responsive text sizing
  '@media (max-width: 768px)': {
    fontSize: '2rem',
    whiteSpace: 'normal',
    lineHeight: 1.2,
  },
  
  '@media (max-width: 480px)': {
    fontSize: '1.5rem',
  },
}));

const WhiteOverlay = styled(Box)(({ theme, visible }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'white',
  opacity: visible ? 1 : 0,
  transition: 'opacity 2s ease-in-out',
  zIndex: 1000,
}));

const ClickPrompt = styled(Box)(({ theme, visible }) => ({
  position: 'absolute',
  bottom: '10%',
  left: '50%',
  transform: 'translateX(-50%)',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '1.1rem',
  fontWeight: 400,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  letterSpacing: '0.5px',
  opacity: visible ? 1 : 0,
  pointerEvents: 'none',
  transition: 'opacity 0.8s ease-in-out',
  zIndex: 15,
  animation: visible ? 'pulse 2s infinite' : 'none',
  
  '@keyframes pulse': {
    '0%': { opacity: 0.4 },
    '50%': { opacity: 0.8 },
    '100%': { opacity: 0.4 },
  },
}));

const DreamIntro = ({ onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showWhiteOverlay, setShowWhiteOverlay] = useState(false);
  const [autoProgressInterval, setAutoProgressInterval] = useState(null);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [idleTimeout, setIdleTimeout] = useState(null);

  const dreamSequence = [
    "The world once thrived on knowledge...",
    "Scrolls of wisdom passed from generation to generation...",
    "Until one day... a great silence fell over the lands.",
    "The scrolls... stolen.",
    "The skies darkened. The people forgot.",
    "A prophecy spoke of one...",
    "A child from another time...",
    "...who would rise to bring light back to the minds of the people.",
    "That child... is you.",
    "Awaken, chosen one. Vocabia needs you."
  ];

  const advanceToNextLine = useCallback(() => {
    setShowClickPrompt(false);
    setCurrentLineIndex(prev => {
      if (prev < dreamSequence.length - 1) {
        return prev + 1;
      } else {
        if (autoProgressInterval) {
          clearInterval(autoProgressInterval);
        }
        setTimeout(() => {
          setShowWhiteOverlay(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 2000);
        return prev;
      }
    });
  }, [dreamSequence.length, autoProgressInterval, onComplete]);

  useEffect(() => {
    // Set up automatic progression
    const interval = setInterval(advanceToNextLine, 3500);
    setAutoProgressInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [advanceToNextLine]);

  // Show click prompt if idle for 2s after a new line
  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout) clearTimeout(idleTimeout);
    const timeout = setTimeout(() => setShowClickPrompt(true), 2000);
    setIdleTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [currentLineIndex]);

  const handleClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout) clearTimeout(idleTimeout);
    advanceToNextLine();
  };

  return (
    <TextContainer onClick={handleClick} sx={{ cursor: 'pointer' }}>
      {dreamSequence.map((line, index) => (
        <TextLine
          key={index}
          variant="h1"
          visible={index === currentLineIndex}
        >
          {line}
        </TextLine>
      ))}
      
      <ClickPrompt visible={showClickPrompt}>
        Click to continue
      </ClickPrompt>
      
      <WhiteOverlay visible={showWhiteOverlay} />
    </TextContainer>
  );
};

export default DreamIntro; 
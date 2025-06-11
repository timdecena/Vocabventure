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

const fadeToWhite = keyframes`
  from {
    opacity: 0;
    background-color: transparent;
  }
  to {
    opacity: 1;
    background-color: white;
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
}));

const TextLine = styled(Typography)(({ theme, visible }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#fff',
  textShadow: '0 0 10px rgba(255,255,255,0.5)',
  marginBottom: theme.spacing(2),
  opacity: visible ? 1 : 0,
  transition: 'opacity 1s ease-in-out',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
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
  bottom: '5%',
  left: '50%',
  transform: 'translateX(-50%)',
  color: 'rgba(255,255,255,0.7)',
  fontSize: '1.2rem',
  letterSpacing: '1px',
  opacity: visible ? 1 : 0,
  pointerEvents: 'none',
  transition: 'opacity 0.5s',
  zIndex: 10,
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
    const interval = setInterval(advanceToNextLine, 3000);
    setAutoProgressInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [advanceToNextLine]);

  // Show click prompt if idle for 1.5s after a new line
  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout) clearTimeout(idleTimeout);
    const timeout = setTimeout(() => setShowClickPrompt(true), 1500);
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
      <ClickPrompt visible={showClickPrompt}>Click to continue</ClickPrompt>
      <WhiteOverlay visible={showWhiteOverlay} />
    </TextContainer>
  );
};

export default DreamIntro; 
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const SceneContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url("https://static.vecteezy.com/system/resources/previews/033/875/190/non_2x/village-room-inside-poor-room-interior-old-cottage-illustration-free-vector.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
}));

const SpritesRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '900px',
  position: 'absolute',
  bottom: '200px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
}));

const UserSprite = styled('img')({
  width: '160px',
  height: 'auto',
  marginRight: '32px',
  zIndex: 2,
});

const WizardSprite = styled('img')({
  width: '200px',
  height: 'auto',
  zIndex: 2,
});

const FLESH_BROWN = '#e6c7b2';
const NAME_BG = '#d1a97a';

const DialogueBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  bottom: 0,
  transform: 'translateX(-50%)',
  width: '900px',
  maxWidth: '90vw',
  minWidth: '320px',
  padding: '24px 32px',
  backgroundColor: FLESH_BROWN,
  color: '#3a2a1a',
  textAlign: 'left',
  borderRadius: '18px 18px 0 0',
  zIndex: 3,
  boxShadow: '0 -2px 16px 2px rgba(0,0,0,0.18)',
  border: '3px solid #b48a6e',
  fontFamily: 'monospace',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxSizing: 'border-box',
}));

const NameTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-22px',
  left: '18px',
  background: NAME_BG,
  color: '#3a2a1a',
  borderRadius: '16px',
  padding: '4px 18px',
  fontWeight: 700,
  fontSize: '1.1rem',
  boxShadow: '0 2px 8px #b48a6e44',
  border: '2px solid #b48a6e',
  fontFamily: 'monospace',
  zIndex: 2,
}));

const ClickPrompt = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '16px',
  right: '32px',
  color: '#00996b',
  fontSize: '1.1rem',
  fontWeight: 700,
  opacity: 0.85,
  pointerEvents: 'none',
  zIndex: 5,
  fontFamily: 'monospace',
}));

const messages = [
  "Ah, you're awake! Welcome, traveler.",
  "I am Eldrin, the last sage of Vocabia.",
  "Darkness has stolen our words and wisdom.",
  "You are the one from the prophecy. Only you can help us.",
  "Come, there's no time to waste. The village is under attack!"
];

const WizardScene = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const idleTimeout = useRef(null);

  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    return () => clearTimeout(idleTimeout.current);
  }, [currentMessageIndex]);

  const handleNext = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SceneContainer>
      <SpritesRow>
        <UserSprite 
          src="https://w7.pngwing.com/pngs/928/303/png-transparent-pixel-dodgers-pixel-art-sprite-text-cartoon-fictional-character.png" 
          alt="User Sprite" 
        />
        <WizardSprite 
          src="https://www.shutterstock.com/image-vector/pixel-art-wizard-long-beard-260nw-2544146115.jpg" 
          alt="Wizard Sprite" 
        />
      </SpritesRow>
      <DialogueBox elevation={3} onClick={handleNext} style={{ cursor: 'pointer', userSelect: 'none' }}>
        <NameTag>Eldrin</NameTag>
        <Typography variant="h6" gutterBottom style={{ marginTop: 18, fontFamily: 'monospace' }}>
          {messages[currentMessageIndex]}
        </Typography>
        {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
      </DialogueBox>
    </SceneContainer>
  );
};

export default WizardScene; 
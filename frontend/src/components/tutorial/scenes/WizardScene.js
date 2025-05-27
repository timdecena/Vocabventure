import React, { useState } from 'react';
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
  position: 'absolute',
  bottom: '22%',
  left: 0,
}));

const UserSprite = styled('img')({
  width: '200px',
  height: 'auto',
  marginRight: '80px',
  zIndex: 2,
});

const WizardSprite = styled('img')({
  width: '240px',
  height: 'auto',
  zIndex: 2,
});

const DialogueBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: '3%',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(3),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  maxWidth: '80%',
  textAlign: 'center',
  borderRadius: '10px',
  zIndex: 3,
}));

const NextButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: '#4CAF50',
  color: 'white',
  '&:hover': {
    backgroundColor: '#45a049',
  },
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

  const handleNext = () => {
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
      <DialogueBox elevation={3}>
        <Typography variant="h6" gutterBottom>
          {messages[currentMessageIndex]}
        </Typography>
        <NextButton
          variant="contained"
          onClick={handleNext}
        >
          {currentMessageIndex < messages.length - 1 ? 'Next' : 'Go to Village'}
        </NextButton>
      </DialogueBox>
    </SceneContainer>
  );
};

export default WizardScene; 
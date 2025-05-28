import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const SceneContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url("https://d2gg9evh47fn9z.cloudfront.net/1600px_COLOURBOX37132213.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
}));

const SpritesRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: '900px',
  position: 'absolute',
  bottom: '200px',
  left: 0,
  right: 0,
  margin: '0 auto',
  zIndex: 2,
}));

const LeftSprites = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: '16px',
}));

const RightSprites = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  marginLeft: 'auto',
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

const CommawidowSprite = styled('img')({
  width: '200px',
  height: 'auto',
  zIndex: 2,
});

const FLESH_BROWN = '#e6c7b2';
const NAME_BG = '#d1a97a';

const DialogueBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: '3%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: '900px',
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

const dialogueSequence = [
  { speaker: 'Wizard', text: "This is it... the jungle where Grammowl's corruption began.", sprite: 'wizard' },
  { speaker: 'User', text: "So this is where the first scroll was stolen?", sprite: 'user' },
  { speaker: 'Wizard', text: "Yes. The Scroll of Grammar lies deep within Grammowl's tower. But the path is twisted with beasts that warp language into nonsense.", sprite: 'wizard' },
  { speaker: 'Grammowl', text: "Foolish fledgling... You flutter into my grove thinking you can rewrite fate?", sprite: 'grammowl' },
  { speaker: 'User', text: "Grammowl!", sprite: 'user' },
  { speaker: 'Grammowl', text: "The Scroll belongs to me now. Without it, the villagers' minds will stay broken... just how I like them.", sprite: 'grammowl' },
  { speaker: 'Wizard', text: "Grammowl, your reign of confusion ends here! Chosen one, prepare yourself!", sprite: 'wizard' },
  { speaker: 'Grammowl', text: "You'll have to get through my little pets first… if your tiny brain can handle proper punctuation!", sprite: 'grammowl' },
  { speaker: 'Commawidow', text: "Welcome to my web, sweet reader. One misplaced pause… and you'll be tangled for eternity!", sprite: 'commawidow' },
  { speaker: 'User', text: "I'm not afraid of your tricks!", sprite: 'user' },
  { speaker: 'Commawidow', text: "Then let's play a little game… Answer wrong, and you'll feel the sting of silence!", sprite: 'commawidow' },
];

const JungleLushLevel1 = () => {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [showClickPrompt, setShowClickPrompt] = useState(false);

  const currentDialogue = dialogueSequence[currentDialogueIndex];

  // Show Commawidow sprite only when she is speaking
  const showCommawidow = currentDialogue.sprite === 'commawidow';

  // Hide all sprites for Grammowl (off-screen)
  const showLeftSprites = currentDialogue.sprite !== 'grammowl';

  const handleNext = () => {
    if (currentDialogueIndex < dialogueSequence.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      // TODO: Transition to quiz or next phase
    }
  };

  return (
    <SceneContainer>
      <SpritesRow>
        {showLeftSprites && (
          <LeftSprites>
            <UserSprite
              src="https://w7.pngwing.com/pngs/928/303/png-transparent-pixel-dodgers-pixel-art-sprite-text-cartoon-fictional-character.png"
              alt="User Sprite"
            />
            <WizardSprite
              src="https://www.shutterstock.com/image-vector/pixel-art-wizard-long-beard-260nw-2544146115.jpg"
              alt="Wizard Sprite"
            />
          </LeftSprites>
        )}
        <RightSprites>
          {showCommawidow && (
            <CommawidowSprite
              src="https://img.freepik.com/premium-photo/3d-pixel-art-scary-black-spider-with-white-fang-halloween-decorative-ornament-theme-design_477250-292.jpg"
              alt="Commawidow Sprite"
            />
          )}
        </RightSprites>
      </SpritesRow>
      <DialogueBox elevation={3} onClick={handleNext} style={{ cursor: 'pointer', userSelect: 'none' }}>
        <NameTag>{currentDialogue.speaker}</NameTag>
        <Typography variant="h6" gutterBottom style={{ marginTop: 18, fontFamily: 'monospace' }}>
          {currentDialogue.text}
        </Typography>
        {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
      </DialogueBox>
    </SceneContainer>
  );
};

export default JungleLushLevel1; 
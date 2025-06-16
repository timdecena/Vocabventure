import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const forestBg = "https://wallpapers.com/images/hd/cartoon-forest-background-1920-x-1080-3si03xbjuob5zkdp.jpg";
const wizardSprite = "https://www.shutterstock.com/image-vector/pixel-art-wizard-long-beard-260nw-2544146115.jpg";
const userSprite = "https://w7.pngwing.com/pngs/928/303/png-transparent-pixel-dodgers-pixel-art-sprite-text-cartoon-fictional-character.png";
const monsterSprite = "https://www.vhv.rs/dpng/d/357-3572106_stone-monster-2d-game-hd-png-download.png";
const burningHouse = "https://w7.pngwing.com/pngs/603/536/png-transparent-isolated-modern-house-on-fire-thumbnail.png";

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const SceneContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  backgroundImage: `url(${forestBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const Ground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  bottom: '90px',
  width: '100%',
  height: '40px',
  background: 'linear-gradient(to top, #3e2e1a 80%, rgba(62,46,26,0.2) 100%)',
  zIndex: 2,
  borderTopLeftRadius: '30px',
  borderTopRightRadius: '30px',
  boxShadow: '0 0 16px 2px rgba(0,0,0,0.25)',
}));

const SpritesRow = styled(Box)(({ theme }) => ({
  width: '900px',
  maxWidth: '90vw',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '130px',
  height: '160px',
  zIndex: 3,
  pointerEvents: 'none',
}));

const WizardUserGroup = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: '24px',
}));

const MonsterHouseGroup = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: '32px',
}));

const WizardSprite = styled('img')({
  width: '120px',
  height: 'auto',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  animation: `${bounce} 2.2s infinite`,
});

const UserSprite = styled('img')({
  width: '100px',
  height: 'auto',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  animation: `${bounce} 2s infinite`,
});

const MonsterSprite = styled('img')({
  width: '140px',
  height: 'auto',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  animation: `${bounce} 2.3s infinite`,
});

const BurningHouse = styled('img')({
  width: '90px',
  height: 'auto',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
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
  padding: theme.spacing(3, 4),
  backgroundColor: FLESH_BROWN,
  color: '#3a2a1a',
  textAlign: 'left',
  borderRadius: '18px 18px 0 0',
  zIndex: 10,
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
  "Wizard: This is terrible! The monster is attacking the village!",
  "You: We have to do something! The house is on fire!",
  "Wizard: Be brave! Use your knowledge to defeat the monster and save the village!"
];

const parseMessage = (msg) => {
  const idx = msg.indexOf(':');
  if (idx !== -1) {
    return [msg.slice(0, idx), msg.slice(idx + 1).trim()];
  }
  return ["", msg];
};

const VillageScene = ({ onComplete }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const idleTimeout = useRef(null);

  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    return () => clearTimeout(idleTimeout.current);
  }, [currentMessage]);

  const handleNext = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (currentMessage < messages.length - 1) {
      setCurrentMessage(currentMessage + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SceneContainer>
      <Ground />
      <SpritesRow>
        <WizardUserGroup>
          <WizardSprite src={wizardSprite} alt="Wizard" />
          <UserSprite src={userSprite} alt="User" />
        </WizardUserGroup>
        <MonsterHouseGroup>
          <MonsterSprite src={monsterSprite} alt="Monster" />
          <BurningHouse src={burningHouse} alt="Burning House" />
        </MonsterHouseGroup>
      </SpritesRow>
      <DialogueBox elevation={3} onClick={handleNext} style={{ cursor: 'pointer', userSelect: 'none' }}>
        {(() => {
          const [name, text] = parseMessage(messages[currentMessage]);
          return (
            <>
              {name && <NameTag>{name}</NameTag>}
              <Typography variant="h6" gutterBottom style={{ marginTop: name ? 18 : 0, fontFamily: 'monospace' }}>
                {text}
              </Typography>
            </>
          );
        })()}
        {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
      </DialogueBox>
    </SceneContainer>
  );
};

export default VillageScene; 
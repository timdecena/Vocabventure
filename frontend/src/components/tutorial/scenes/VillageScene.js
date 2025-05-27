import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
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
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  position: 'absolute',
  bottom: '130px',
  left: 0,
  zIndex: 3,
  pointerEvents: 'none',
  padding: '0 4vw',
}));

const WizardUserGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: '24px',
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

const MonsterHouseGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: '32px',
}));

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

const DialogueBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  bottom: 0,
  transform: 'translateX(-50%)',
  padding: theme.spacing(3, 4),
  backgroundColor: 'rgba(0, 0, 0, 0.92)',
  color: 'white',
  width: '90%',
  maxWidth: '700px',
  textAlign: 'center',
  borderRadius: '18px 18px 0 0',
  zIndex: 10,
  minWidth: '320px',
  boxShadow: '0 -2px 16px 2px rgba(0,0,0,0.28)',
}));

const BattleButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: '#f44336',
  color: 'white',
  '&:hover': {
    backgroundColor: '#d32f2f',
  },
}));

const messages = [
  "Wizard: This is terrible! The monster is attacking the village!",
  "You: We have to do something! The house is on fire!",
  "Wizard: Be brave! Use your knowledge to defeat the monster and save the village!"
];

const VillageScene = ({ onComplete }) => {
  const [currentMessage, setCurrentMessage] = useState(0);

  const handleNext = () => {
    if (currentMessage < messages.length - 1) {
      setCurrentMessage(currentMessage + 1);
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
      <DialogueBox elevation={3}>
        <Typography variant="h6" gutterBottom>
          {messages[currentMessage]}
        </Typography>
        {currentMessage < messages.length - 1 ? (
          <Button variant="outlined" color="primary" onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <BattleButton
            variant="contained"
            onClick={onComplete}
          >
            Enter Battle
          </BattleButton>
        )}
      </DialogueBox>
    </SceneContainer>
  );
};

export default VillageScene; 
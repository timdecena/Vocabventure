import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Character Assets - using the same as JungleLushLevel2
// Wizard Animation Frames
import WizardIdle1 from '../../AdventureAssets/Wizard/Idle_1.png';
import WizardIdle2 from '../../AdventureAssets/Wizard/Idle_2.png';

// Adventurer Animation Frames
import SoldierIdle1 from '../../AdventureAssets/Adventurer/Soldier-Idle_1.png';
import SoldierIdle2 from '../../AdventureAssets/Adventurer/Soldier-Idle_2.png';
import SoldierIdle3 from '../../AdventureAssets/Adventurer/Soldier-Idle_3.png';
import SoldierIdle4 from '../../AdventureAssets/Adventurer/Soldier-Idle_4.png';
import SoldierIdle5 from '../../AdventureAssets/Adventurer/Soldier-Idle_5.png';
import SoldierIdle6 from '../../AdventureAssets/Adventurer/Soldier-Idle_6.png';

// Orc Animation Frames
import OrcIdle1 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_1.png';
import OrcIdle2 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_2.png';
import OrcIdle3 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_3.png';
import OrcIdle4 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_4.png';
import OrcIdle5 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_5.png';
import OrcIdle6 from '../../AdventureAssets/Orc(Minion)/Orc-Idle_6.png';
import OrcAttack1 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_1.png';
import OrcAttack2 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_2.png';
import OrcAttack3 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_3.png';
import OrcAttack4 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_4.png';
import OrcAttack5 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_5.png';
import OrcAttack6 from '../../AdventureAssets/Orc(Minion)/Orc-Attack02_6.png';

// 🎯 CHARACTER POSITIONING CONTROLS - ADJUST THESE VALUES
const CHARACTER_POSITIONS = {
  // ⭐ INDIVIDUAL CHARACTER POSITIONING (like JungleLushLevel2)
  WIZARD_LEFT: '-250px',         // 🔧 Wizard distance from left
  WIZARD_BOTTOM: '-40px',       // 🔧 Wizard distance from bottom  
  ADVENTURER_LEFT: '-180px',     // 🔧 Adventurer distance from left
  ADVENTURER_BOTTOM: '-120px',     // 🔧 Adventurer distance from bottom
  ORC_RIGHT: '-200px',           // 🔧 Orc distance from right
  ORC_BOTTOM: '-150px',         // 🔧 Orc distance from bottom
  HOUSE_RIGHT: '-200px',        // 🔧 House distance from right
  HOUSE_BOTTOM: '0px',         // 🔧 House distance from bottom
  
  // ⭐ SPRITES CONTAINER POSITIONING
  SPRITES_BOTTOM: '130px',     // 🔧 Distance from bottom for entire container
  SPRITES_HEIGHT: '250px',     // 🔧 Height of sprites container
};

const forestBg = "https://wallpapers.com/images/hd/cartoon-forest-background-1920-x-1080-3si03xbjuob5zkdp.jpg";

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
  bottom: CHARACTER_POSITIONS.SPRITES_BOTTOM, // 🎯 ADJUST THIS
  height: CHARACTER_POSITIONS.SPRITES_HEIGHT, // 🎯 ADJUST THIS
  zIndex: 3,
  pointerEvents: 'none',
}));

// Individual character positioning (like JungleLushLevel2)
const PositionedWizard = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: CHARACTER_POSITIONS.WIZARD_LEFT,
  bottom: CHARACTER_POSITIONS.WIZARD_BOTTOM,
  zIndex: 4,
}));

const PositionedAdventurer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: CHARACTER_POSITIONS.ADVENTURER_LEFT,
  bottom: CHARACTER_POSITIONS.ADVENTURER_BOTTOM,
  zIndex: 4,
}));

const PositionedOrc = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: CHARACTER_POSITIONS.ORC_RIGHT,
  bottom: CHARACTER_POSITIONS.ORC_BOTTOM,
  zIndex: 4,
}));

const PositionedHouse = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: CHARACTER_POSITIONS.HOUSE_RIGHT,
  bottom: CHARACTER_POSITIONS.HOUSE_BOTTOM,
  zIndex: 4,
}));

// Animated Wizard Component with idle cycling (same as JungleLushLevel2)
const WizardSprite = ({ ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 2);
    }, 1000); // Switch frames every 1 second
    
    return () => clearInterval(interval);
  }, []);

  const WizardImg = styled('img')({
    width: '180px', // Perfect size matching JungleLushLevel2
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    transform: 'scaleX(1)', // 🎯 MAKE WIZARD FACE THE ADVENTURER
  });

  return <WizardImg src={currentFrame === 0 ? WizardIdle1 : WizardIdle2} {...props} />;
};

// Animated Adventurer Component with idle cycling (same as JungleLushLevel2)
const AdventurerSprite = ({ ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 6); // Cycle through 6 frames
    }, 800); // Frame speed
    
    return () => clearInterval(interval);
  }, []);

  const getAdventurerFrame = () => {
    switch (currentFrame) {
      case 0: return SoldierIdle1;
      case 1: return SoldierIdle2;
      case 2: return SoldierIdle3;
      case 3: return SoldierIdle4;
      case 4: return SoldierIdle5;
      case 5: return SoldierIdle6;
      default: return SoldierIdle1;
    }
  };

  const AdventurerImg = styled('img')({
    width: '280px', // Bigger to match with wizard (same as JungleLushLevel2)
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    marginBottom: '0px', // Ensure it's aligned with the platform
  });

  return <AdventurerImg src={getAdventurerFrame()} {...props} />;
};

// Animated Orc Sprite Component that attacks the house (same as JungleLushLevel2)
const OrcSprite = ({ ...props }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationState, setAnimationState] = useState('idle'); // 'idle' or 'attack'
  
  useEffect(() => {
    // Change animation state every 3 seconds (idle -> attack -> idle)
    const stateInterval = setInterval(() => {
      setAnimationState(prev => prev === 'idle' ? 'attack' : 'idle');
      setCurrentFrame(0); // Reset frame when changing state
    }, 3000);
    
    return () => clearInterval(stateInterval);
  }, []);
  
  useEffect(() => {
    const frameInterval = setInterval(() => {
      if (animationState === 'idle') {
        setCurrentFrame(prev => (prev + 1) % 6); // 6 idle frames
      } else if (animationState === 'attack') {
        setCurrentFrame(prev => (prev + 1) % 6); // 6 attack frames
      }
    }, 600); // Frame speed
    
    return () => clearInterval(frameInterval);
  }, [animationState]);

  const getOrcFrame = () => {
    if (animationState === 'attack') {
      switch (currentFrame) {
        case 0: return OrcAttack1;
        case 1: return OrcAttack2;
        case 2: return OrcAttack3;
        case 3: return OrcAttack4;
        case 4: return OrcAttack5;
        case 5: return OrcAttack6;
        default: return OrcAttack1;
      }
    } else {
      switch (currentFrame) {
        case 0: return OrcIdle1;
        case 1: return OrcIdle2;
        case 2: return OrcIdle3;
        case 3: return OrcIdle4;
        case 4: return OrcIdle5;
        case 5: return OrcIdle6;
        default: return OrcIdle1;
      }
    }
  };

  const OrcImg = styled('img')({
    width: '350px', // Orc size (same as JungleLushLevel2)
    height: 'auto',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
    transform: 'scaleX(1)', // Face adventurer
  });

  return <OrcImg src={getOrcFrame()} {...props} />;
};

// Improved House Component 
const ImprovedHouse = styled('div')({
  width: '120px',
  height: '90px',
  position: 'relative',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
  
  // House base
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '0',
    left: '20px',
    width: '80px',
    height: '60px',
    background: 'linear-gradient(145deg, #8B4513 0%, #654321 50%, #4A2C17 100%)',
    borderRadius: '8px',
    border: '2px solid #5D2E0A',
    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.3)',
  },
  
  // Roof
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '50px',
    left: '10px',
    width: '0',
    height: '0',
    borderLeft: '50px solid transparent',
    borderRight: '50px solid transparent',
    borderBottom: '40px solid #D2691E',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
});

// Door
const HouseDoor = styled('div')({
  position: 'absolute',
  bottom: '0px',
  left: '45px',
  width: '30px',
  height: '35px',
  background: 'linear-gradient(145deg, #4A2C17 0%, #2F1B0C 50%, #1A0F08 100%)',
  borderRadius: '15px 15px 0 0',
  border: '1px solid #2F1B0C',
  
  // Door handle
  '&::before': {
    content: '""',
    position: 'absolute',
    right: '6px',
    top: '15px',
    width: '4px',
    height: '4px',
    background: '#FFD700',
    borderRadius: '50%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
});

// Windows
const HouseWindow = styled('div')({
  position: 'absolute',
  width: '12px',
  height: '12px',
  background: 'linear-gradient(145deg, #87CEEB 0%, #4682B4 50%, #2F4F4F 100%)',
  border: '2px solid #8B4513',
  borderRadius: '2px',
  
  // Window cross
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '1px',
    height: '100%',
    background: '#8B4513',
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '1px',
    background: '#8B4513',
  },
});

const LeftWindow = styled(HouseWindow)({
  bottom: '25px',
  left: '30px',
});

const RightWindow = styled(HouseWindow)({
  bottom: '25px',
  right: '30px',
});

// Fire effects for burning house
const FireEffect = styled('div')({
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '60px',
  height: '30px',
  background: 'linear-gradient(0deg, #FF4500 0%, #FF6347 30%, #FFD700 60%, transparent 100%)',
  borderRadius: '50% 50% 0 0',
  opacity: 0.8,
  animation: 'flicker 0.5s infinite alternate',
  
  '@keyframes flicker': {
    '0%': { 
      transform: 'translateX(-50%) scaleY(1) scaleX(1)',
      opacity: 0.8,
    },
    '100%': { 
      transform: 'translateX(-50%) scaleY(1.2) scaleX(0.9)',
      opacity: 1,
    },
  },
  
  // Additional flame
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-10px',
    left: '20%',
    width: '20px',
    height: '25px',
    background: 'linear-gradient(0deg, #FF6347 0%, #FFD700 50%, transparent 100%)',
    borderRadius: '50% 50% 0 0',
    animation: 'flicker2 0.7s infinite alternate',
  },
  
  '@keyframes flicker2': {
    '0%': { 
      transform: 'scaleY(0.8) scaleX(1.1)',
      opacity: 0.6,
    },
    '100%': { 
      transform: 'scaleY(1.3) scaleX(0.8)',
      opacity: 0.9,
    },
  },
});

const BurningHouseComponent = () => (
  <ImprovedHouse>
    <HouseDoor />
    <LeftWindow />
    <RightWindow />
    <FireEffect />
  </ImprovedHouse>
);

const FLESH_BROWN = '#e6c7b2';
const NAME_BG = '#d1a97a';

const DialogueBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  bottom: 0,
  transform: 'translateX(-50%)',
  width: '800px',
  maxWidth: '90vw',
  minWidth: '320px',
  height: '160px', // Fixed height to match JungleLushLevel2
  padding: theme.spacing(3, 4),
  background: 'linear-gradient(145deg, #f4e4c1 0%, #e8d5a6 50%, #dcc48a 100%)',
  color: '#3a2a1a',
  textAlign: 'left',
  borderRadius: '20px 20px 0 0',
  zIndex: 10,
  boxShadow: '0 -4px 24px 4px rgba(0,0,0,0.25), 0 -8px 32px 2px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.6)',
  border: '3px solid #b8956f',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  boxSizing: 'border-box',
  overflow: 'visible',
  backdropFilter: 'blur(2px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
    borderRadius: '20px 20px 0 0',
    pointerEvents: 'none',
  },
}));

const NameTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-25px',
  left: '24px',
  background: 'linear-gradient(145deg, #d4a574 0%, #c19956 50%, #a8834a 100%)',
  color: '#2c1810',
  borderRadius: '18px',
  padding: '8px 20px',
  fontWeight: 800,
  fontSize: '1rem',
  boxShadow: '0 4px 16px rgba(168,131,74,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
  border: '3px solid #9a7a4a',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  zIndex: 100,
  letterSpacing: '0.5px',
  textShadow: '0 1px 2px rgba(255,255,255,0.4)',
  minWidth: '80px',
  textAlign: 'center',
  display: 'block',
  visibility: 'visible',
}));

const DialogueText = styled(Typography)(({ theme }) => ({
  marginTop: 18,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: '1.2rem',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '0.3px',
  color: '#2c1810',
  textShadow: '0 1px 1px rgba(255,255,255,0.3)',
  zIndex: 12,
  position: 'relative',
}));

const ClickPrompt = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '16px',
  right: '32px',
  color: '#2e7d32',
  fontSize: '1rem',
  fontWeight: 700,
  opacity: 0.9,
  pointerEvents: 'none',
  zIndex: 16,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  letterSpacing: '0.3px',
  textShadow: '0 1px 2px rgba(255,255,255,0.5)',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { opacity: 0.7 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.7 },
  },
}));

const messages = [
  "Wizard: This is terrible! The monster is attacking the village!",
  "User: We have to do something! The house is on fire!",
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
        <PositionedWizard>
          <WizardSprite />
        </PositionedWizard>
        <PositionedAdventurer>
          <AdventurerSprite />
        </PositionedAdventurer>
        <PositionedOrc>
          <OrcSprite />
        </PositionedOrc>
        <PositionedHouse>
          <BurningHouseComponent />
        </PositionedHouse>
      </SpritesRow>
      <DialogueBox elevation={6} onClick={handleNext} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
        {(() => {
          const [name, text] = parseMessage(messages[currentMessage]);
          return (
            <>
              {name && <NameTag>{name}</NameTag>}
              <DialogueText variant="h6" gutterBottom>
                {text}
              </DialogueText>
            </>
          );
        })()}
        {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
      </DialogueBox>
    </SceneContainer>
  );
};

export default VillageScene; 
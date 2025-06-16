import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const forestBg = "https://wallpapers.com/images/hd/cartoon-forest-background-1920-x-1080-3si03xbjuob5zkdp.jpg";
const userSprite = "https://w7.pngwing.com/pngs/928/303/png-transparent-pixel-dodgers-pixel-art-sprite-text-cartoon-fictional-character.png";
const monsterSprite = "https://www.vhv.rs/dpng/d/357-3572106_stone-monster-2d-game-hd-png-download.png";
const burningHouse = "https://w7.pngwing.com/pngs/603/536/png-transparent-isolated-modern-house-on-fire-thumbnail.png";
const heartIcon = "https://p7.hiclipart.com/preview/28/266/352/pixel-art-heart-8-bit-color-heart-thumbnail.jpg";
const clockIcon = "https://cdn-icons-png.flaticon.com/512/61/61112.png";

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const BattleContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundImage: `url(${forestBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
  position: 'relative',
}));

const TopBar = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 30,
  padding: '18px 32px',
}));

const RightBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  minWidth: '260px',
  justifyContent: 'flex-end',
}));

const HeartsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
}));

const HeartImg = styled('img')({
  width: '40px',
  height: '40px',
});

const TopRightContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '24px',
  right: '24px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '16px',
  zIndex: 3000,
}));

const TimerBoxStyled = styled(Box)(({ theme }) => ({
  background: '#fffbe6',
  color: '#3a2a1a',
  borderRadius: '12px',
  padding: '6px 18px',
  fontWeight: 700,
  fontFamily: 'monospace',
  fontSize: '1.2rem',
  boxShadow: '0 2px 8px #b48a6e44',
  border: '2px solid #b48a6e',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  position: 'relative',
  minHeight: '350px',
}));

const SpritesRow = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  marginBottom: '32px',
  zIndex: 20,
  pointerEvents: 'none',
  minHeight: '220px',
  position: 'relative',
}));

const UserSprite = styled('img')({
  width: '170px',
  height: 'auto',
  marginRight: '60px',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  animation: `${bounce} 2s infinite`,
  zIndex: 21,
});

const MonsterSprite = styled('img')({
  width: '190px',
  height: 'auto',
  marginLeft: '60px',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  transform: 'scaleX(-1) !important',
  animation: `${bounce} 2.3s infinite`,
  zIndex: 21,
});

const VS = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 900,
  color: '#fff',
  textShadow: '0 2px 8px #000',
  margin: '0 18px',
  zIndex: 22,
  pointerEvents: 'none',
}));

const BurningHouse = styled('img')({
  width: '110px',
  height: 'auto',
  position: 'absolute',
  right: '4vw',
  bottom: '0',
  zIndex: 19,
  opacity: 0.85,
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
});

const Ground = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '40px',
  background: 'linear-gradient(to top, #3e2e1a 80%, rgba(62,46,26,0.2) 100%)',
  zIndex: 10,
  borderTopLeftRadius: '30px',
  borderTopRightRadius: '30px',
  boxShadow: '0 0 16px 2px rgba(0,0,0,0.25)',
  marginBottom: '-10px',
}));

const BottomBar = styled(Box)(({ theme }) => ({
  width: '100vw',
  background: 'rgba(122,62,46,0.97)',
  minHeight: '100px',
  padding: '18px 0 18px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 30,
  borderTopLeftRadius: '32px',
  borderTopRightRadius: '32px',
  boxShadow: '0 -2px 24px 2px rgba(0,0,0,0.32)',
  position: 'relative',
}));

const QuestionText = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontWeight: 600,
  fontSize: '1.35rem',
  marginBottom: '22px',
  textAlign: 'center',
  textShadow: '0 2px 8px #000',
}));

const ChoicesGrid = styled(Grid)(({ theme }) => ({
  width: '100%',
  maxWidth: '520px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: '1fr 1fr',
  gap: '10px',
  justifyItems: 'stretch',
  alignItems: 'stretch',
}));

const pixelFont = `'Press Start 2P', 'VT323', 'Fira Mono', 'monospace'`;

const MoveButton = styled(Button)(({ selected }) => ({
  width: '100%',
  height: '54px',
  background: '#f8f8f8',
  color: '#222',
  fontFamily: pixelFont,
  fontSize: '1.1rem',
  border: selected ? '2.5px solid #d32f2f' : '2.5px solid #444',
  borderRadius: '4px',
  boxShadow: selected ? '0 0 0 2px #ffbdbd' : '0 0 0 2px #222',
  outline: selected ? '2px solid #d32f2f' : 'none',
  textAlign: 'left',
  paddingLeft: '18px',
  transition: 'border 0.1s, box-shadow 0.1s',
  '&:hover': {
    border: '2.5px solid #d32f2f',
    boxShadow: '0 0 0 2px #ffbdbd',
    background: '#fff3f3',
  },
}));

const MonsterHPBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-30px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '120px',
  height: '12px',
  backgroundColor: '#333',
  borderRadius: '6px',
  overflow: 'hidden',
  border: '2px solid #fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
}));

const MonsterHPFill = styled(Box)(({ hp }) => ({
  width: `${hp}%`,
  height: '100%',
  backgroundColor: hp > 50 ? '#4CAF50' : hp > 25 ? '#FFA726' : '#f44336',
  transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
}));

const MonsterHPText = styled(Typography)({
  position: 'absolute',
  top: '-45px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#fff',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
});

const tutorialQuestions = [
  {
    question: "What is the correct form of the verb in this sentence: 'She ___ to the store yesterday.'",
    options: ["go", "goes", "went", "going"],
    correctAnswer: "went"
  },
  {
    question: "Which word is a proper noun?",
    options: ["city", "London", "building", "street"],
    correctAnswer: "London"
  },
  {
    question: "What is the past tense of 'write'?",
    options: ["wrote", "written", "writed", "writing"],
    correctAnswer: "wrote"
  },
  {
    question: "Which sentence uses correct punctuation?",
    options: [
      "The cat, dog and bird are pets.",
      "The cat, dog, and bird are pets.",
      "The cat dog and bird are pets.",
      "The cat; dog; and bird are pets."
    ],
    correctAnswer: "The cat, dog, and bird are pets."
  },
  {
    question: "What is the opposite of 'begin'?",
    options: ["start", "continue", "end", "pause"],
    correctAnswer: "end"
  }
];

const TutorialBattle = ({ onComplete, showQuitButton, onQuit, quitButtonText }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showGameOverAlert, setShowGameOverAlert] = useState(false);
  const [monsterHP, setMonsterHP] = useState(100);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !gameOver) {
      handleWrongAnswer();
    }
  }, [timeLeft, gameOver]);

  const handleAnswer = (answer) => {
    if (answer === tutorialQuestions[currentQuestion].correctAnswer) {
      if (currentQuestion < tutorialQuestions.length - 1) {
        setScore(prev => prev + 1);
        setMonsterHP(prev => {
          const newHP = Math.max(0, prev - 20);
          if (newHP === 0) {
            setTimeout(() => endGame(), 500);
          }
          return newHP;
        });
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(60);
      } else {
        // Last question: increment score and end game with correct score
        setScore(prev => {
          const finalScore = prev + 1;
          setTimeout(() => endGame(finalScore), 500);
          return finalScore;
        });
        setMonsterHP(0);
      }
    } else {
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    setHearts(prev => prev - 1);
    if (hearts <= 1) {
      setShowGameOverAlert(true);
    } else {
      setTimeLeft(60);
    }
  };

  const endGame = (finalScore = score) => {
    setGameOver(true);
    const stars = Math.ceil((finalScore / tutorialQuestions.length) * 3);
    onComplete({
      stars,
      hearts,
      score: finalScore,
      totalQuestions: tutorialQuestions.length
    });
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setHearts(3);
    setTimeLeft(60);
    setScore(0);
    setGameOver(false);
    setSelectedIdx(null);
    setShowGameOverAlert(false);
    setMonsterHP(100);
  };

  const handleQuit = () => {
    onComplete({
      quitToHome: true
    });
  };

  const handleSelect = (option, idx) => {
    setSelectedIdx(idx);
    setTimeout(() => handleAnswer(option), 120);
  };

  if (gameOver) {
    return null;
  }

  return (
    <BattleContainer>
      {showGameOverAlert && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#d32f2f' }}>
              Game Over!
            </Typography>
            <Typography sx={{ mb: 3 }}>
              You've lost all your hearts! Would you like to try again?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRetry}
                sx={{ minWidth: '120px' }}
              >
                Retry
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleQuit}
                sx={{ minWidth: '120px' }}
              >
                Quit
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <TopBar>
        <HeartsRow>
          {[...Array(3)].map((_, idx) => (
            <HeartImg key={idx} src={heartIcon} alt="Heart" style={{ opacity: idx < hearts ? 1 : 0.3 }} />
          ))}
        </HeartsRow>
      </TopBar>
      {showQuitButton && (
        <TopRightContainer>
          <TimerBoxStyled>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace', color: '#3a2a1a', textAlign: 'center' }}>TIMER</Typography>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace', color: '#3a2a1a', textAlign: 'center' }}>{timeLeft}s</Typography>
          </TimerBoxStyled>
          <Button
            variant="contained"
            color="error"
            onClick={onQuit}
            sx={{ fontWeight: 700, fontFamily: 'monospace', borderRadius: 2 }}
          >
            {quitButtonText || 'Quit Tutorial'}
          </Button>
        </TopRightContainer>
      )}
      <MainContent>
        <SpritesRow>
          <UserSprite src={userSprite} alt="User" />
          <VS>VS</VS>
          <Box sx={{ position: 'relative' }}>
            <MonsterHPText>Monster HP</MonsterHPText>
            <MonsterHPBar>
              <MonsterHPFill hp={monsterHP} />
            </MonsterHPBar>
            <MonsterSprite 
              src={monsterSprite} 
              alt="Monster" 
              style={{ 
                opacity: monsterHP === 0 ? 0.5 : 1,
                transform: monsterHP === 0 ? 'scaleX(-1) rotate(90deg)' : 'scaleX(-1)',
                transition: 'all 0.5s ease-in-out'
              }}
            />
          </Box>
          <BurningHouse src={burningHouse} alt="Burning House" />
        </SpritesRow>
        <Ground />
      </MainContent>
      <BottomBar>
        <QuestionText>
          {tutorialQuestions[currentQuestion].question}
        </QuestionText>
        <ChoicesGrid container>
          {tutorialQuestions[currentQuestion].options.map((option, idx) => (
            <Grid item xs={6} key={idx}>
              <MoveButton
                selected={selectedIdx === idx}
                onClick={() => handleSelect(option, idx)}
                disableRipple
              >
                {option}
              </MoveButton>
            </Grid>
          ))}
        </ChoicesGrid>
      </BottomBar>
    </BattleContainer>
  );
};

export default TutorialBattle; 
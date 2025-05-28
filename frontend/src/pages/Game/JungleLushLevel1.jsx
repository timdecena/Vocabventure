import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent, Grid } from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import '../../styles/MapView.css';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const JUNGLE_BG = 'https://png.pngtree.com/background/20220727/original/pngtree-jungle-game-background-arcade-art-picture-image_1829537.jpg';
const WIZARD_IMG = 'https://www.shutterstock.com/image-vector/pixel-art-wizard-long-beard-260nw-2544146115.jpg';
const USER_IMG = 'https://w7.pngwing.com/pngs/928/303/png-transparent-pixel-dodgers-pixel-art-sprite-text-cartoon-fictional-character.png';
const COMMAWIDOW_IMG = 'https://img.freepik.com/premium-photo/3d-pixel-art-scary-black-spider-with-white-fang-halloween-decorative-ornament-theme-design_477250-292.jpg';
const HEART_IMG = 'https://p7.hiclipart.com/preview/28/266/352/pixel-art-heart-8-bit-color-heart-thumbnail.jpg';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
`;

const hit = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(0.9); }
  75% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const flash = keyframes`
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.7; filter: brightness(1.2); }
`;

const userFlash = keyframes`
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.7; filter: brightness(1.2) sepia(1) saturate(10000%) hue-rotate(-50deg); }
`;

const monsterFlash = keyframes`
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.7; filter: brightness(1.2) sepia(1) saturate(10000%) hue-rotate(180deg); }
`;

const SceneContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  backgroundImage: `url(${JUNGLE_BG})`,
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

const CommawidowGroup = styled(Box)(({ theme }) => ({
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

const UserSprite = styled('img')(({ isDamaged }) => ({
  width: '100px',
  height: 'auto',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  animation: `${bounce} 2s infinite, ${isDamaged ? `${shake} 0.5s ease-in-out, ${userFlash} 0.5s ease-in-out` : 'none'}`,
}));

const CommawidowSprite = styled('img')(({ isDamaged }) => ({
  width: '140px',
  height: 'auto',
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
  animation: `${bounce} 2.3s infinite, ${isDamaged ? `${hit} 0.5s ease-in-out, ${monsterFlash} 0.5s ease-in-out` : 'none'}`,
}));

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

const HeartRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  position: 'absolute',
  top: '24px',
  left: '32px',
  zIndex: 20,
}));

const TimerBox = styled(Box)(({ theme }) => ({
  background: '#fffbe6',
  color: '#3a2a1a',
  borderRadius: '12px',
  padding: '6px 18px',
  fontWeight: 700,
  fontFamily: 'monospace',
  fontSize: '1.2rem',
  boxShadow: '0 2px 8px #b48a6e44',
  border: '2px solid #b48a6e',
  zIndex: 20,
  marginLeft: 16,
}));

const VS = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 900,
  color: '#fff',
  textShadow: '0 2px 8px #000',
  margin: '0 18px',
  zIndex: 22,
  pointerEvents: 'none',
}));

const TopBar = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 30,
  padding: '18px 32px',
}));

const CenterBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const BattleSpritesRow = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  marginBottom: '180px',
  zIndex: 20,
  pointerEvents: 'none',
  minHeight: '220px',
  position: 'relative',
}));

const MonsterSpriteWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

const BattleBottomBar = styled(Box)(({ theme }) => ({
  width: '100vw',
  background: 'rgba(122,62,46,0.97)',
  minHeight: '100px',
  padding: '38px 0 18px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 30,
  borderTopLeftRadius: '32px',
  borderTopRightRadius: '32px',
  boxShadow: '0 -2px 24px 2px rgba(0,0,0,0.32)',
  position: 'absolute',
  left: 0,
  bottom: 0,
}));

const QuestionText = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontWeight: 600,
  fontSize: '1.35rem',
  marginBottom: '22px',
  textAlign: 'center',
  textShadow: '0 2px 8px #000',
}));

const MONSTER_MAX_HP = 100;
const TIMER_DURATION = 30;

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
  background: 'linear-gradient(90deg, #4caf50 60%, #b2ff59 100%)',
  transition: 'width 0.4s',
}));
const MonsterHPText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '-48px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  textShadow: '0 2px 8px #000',
  zIndex: 10,
}));

const ChoicesGrid = styled(Box)(({ theme, count }) => ({
  width: count === 3 ? '520px' : '520px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: count === 3 ? '1fr 1fr 1fr' : '1fr 1fr',
  gridTemplateRows: count === 3 ? '1fr' : '1fr 1fr',
  gap: '18px',
  justifyItems: 'stretch',
  alignItems: 'stretch',
  justifyContent: 'center',
}));

const MoveButton = styled(Button)(({ selected }) => ({
  width: '100%',
  minHeight: '64px',
  background: '#f8f8f8',
  color: '#222',
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  border: selected ? '2.5px solid #d32f2f' : '2.5px solid #444',
  borderRadius: '4px',
  boxShadow: selected ? '0 0 0 2px #ffbdbd' : '0 0 0 2px #222',
  outline: selected ? '2px solid #d32f2f' : 'none',
  textAlign: 'center',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  transition: 'border 0.1s, box-shadow 0.1s',
  '&:hover': {
    border: '2.5px solid #d32f2f',
    boxShadow: '0 0 0 2px #ffbdbd',
    background: '#fff3f3',
  },
}));

const dialogueSequence = [
  { speaker: "Wizard", text: "This is it... the jungle where Grammowl's corruption began." },
  { speaker: "User", text: "So this is where the first scroll was stolen?" },
  { speaker: "Wizard", text: "Yes. The Scroll of Grammar lies deep within Grammowl's territory. But the path is twisted with beasts that warp language into nonsense." },
  { speaker: "Grammowl(offscreen)", text: "Foolish fledgling... You flutter into my grove thinking you can rewrite fate?" },
  { speaker: "User", text: "Grammowl!" },
  { speaker: "Grammowl(offscreen)", text: "The Scroll belongs to me now. Without it, the villagers' minds will stay broken... just how I like them." },
  { speaker: "Wizard", text: "Grammowl, your reign of confusion ends here! Chosen one, prepare yourself!" },
  { speaker: "Grammowl(offscreen)", text: "You'll have to get through my little pets first… if your tiny brain can handle proper punctuation!" },
  { speaker: "Commawidow", text: "Welcome to my web, sweet reader. One misplaced pause… and you'll be tangled for eternity!" },
  { speaker: "User", text: "I'm not afraid of your tricks!" },
  { speaker: "Commawidow", text: "Then let's play a little game… Answer wrong, and you'll feel the sting of silence!" },
];

const questions = [
  {
    question: "Which sentence uses commas correctly in a list?",
    options: [
      "I packed my books pencils and erasers.",
      "I packed my books, pencils and erasers.",
      "I packed my books, pencils, and erasers."
    ],
    correctAnswer: 2
  },
  {
    question: "Which greeting is correctly punctuated?",
    options: [
      "Hello John.",
      "Hello, John.",
      "Hello John,"
    ],
    correctAnswer: 1
  },
  {
    question: "Choose the sentence with correct punctuation.",
    options: [
      "I wanted to play but it started raining.",
      "I wanted to play, but it started raining.",
      "I wanted to play but, it started raining."
    ],
    correctAnswer: 1
  },
  {
    question: "Which sentence uses a comma correctly?",
    options: [
      "After dinner we went for a walk.",
      "After dinner, we went for a walk.",
      "After, dinner we went for a walk."
    ],
    correctAnswer: 1
  },
  {
    question: "Which sentence uses commas correctly?",
    options: [
      "It was a cold dark night.",
      "It was a cold, dark night.",
      "It was a cold dark, night."
    ],
    correctAnswer: 1
  }
];

// Overlay for dimming background
const VictoryOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(30, 20, 10, 0.55)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const VictoryContainer = styled(Paper)(({ theme }) => ({
  minWidth: 380,
  maxWidth: '90vw',
  padding: '48px 36px 36px 36px',
  borderRadius: 24,
  background: '#fffbe6',
  boxShadow: '0 8px 48px 8px #000a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 1100,
  border: '4px solid #b48a6e',
}));

const VictoryTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  fontSize: '2.2rem',
  color: '#00996b',
  marginBottom: 18,
  textShadow: '0 2px 8px #b48a6e44',
  fontFamily: 'monospace',
  textAlign: 'center',
}));

const VictoryButton = styled(Button)(({ theme }) => ({
  fontWeight: 700,
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  borderRadius: 16,
  margin: '12px 0',
  minWidth: 180,
  boxShadow: '0 2px 8px #b48a6e44',
}));

const StarRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
  marginTop: -10,
}));
const Star = styled('span')(({ filled }) => ({
  fontSize: '2.2rem',
  color: filled ? '#FFD700' : '#bdbdbd',
  filter: filled ? 'drop-shadow(0 2px 6px #b48a6e88)' : 'none',
  margin: '0 4px',
  transition: 'color 0.2s',
}));

const JungleLushLevel1 = () => {
  const navigate = useNavigate();
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const idleTimeout = useRef(null);
  const [showQuit, setShowQuit] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(MONSTER_MAX_HP);
  const [retryBattle, setRetryBattle] = useState(false);
  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const levelNumber = 1; // This is level 1

  // Show Commawidow sprite only when she is speaking
  const showCommawidow = !showQuiz && dialogueSequence[currentDialogue].speaker === 'Commawidow';
  // Hide left sprites for Grammowl (off-screen)
  const showLeftSprites = !showQuiz && dialogueSequence[currentDialogue].speaker !== 'Grammowl';

  // Dialogue click/idle logic
  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (!showQuiz) {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [currentDialogue, showQuiz]);

  useEffect(() => {
    if (showQuiz && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (showQuiz && timeLeft === 0 && !victory && !gameOver) {
      // Decrease heart, reset timer or game over
      if (hearts > 1) {
        setHearts(h => h - 1);
        setTimeLeft(TIMER_DURATION);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setHearts(0);
        setGameOver(true);
      }
    }
  }, [showQuiz, timeLeft, victory, gameOver, hearts]);

  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (currentDialogue < dialogueSequence.length - 1) {
      setCurrentDialogue(currentDialogue + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === questions[currentQuestion].correctAnswer) {
      // Correct answer - damage monster
      setMonsterDamaged(true);
      setTimeout(() => setMonsterDamaged(false), 500);
      
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - Math.floor(MONSTER_MAX_HP / questions.length));
        if (currentQuestion === questions.length - 1 || newHP === 0) {
          setVictory(true);
        }
        return newHP;
      });
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(TIMER_DURATION);
      }
    } else {
      // Wrong answer - damage user
      setUserDamaged(true);
      setTimeout(() => setUserDamaged(false), 500);
      
      if (hearts > 1) {
        setTimeout(() => {
          setHearts(h => h - 1);
          setSelectedAnswer(null);
          setShowResult(false);
          setTimeLeft(TIMER_DURATION);
        }, 600);
      } else {
        setTimeout(() => {
          setHearts(0);
          setGameOver(true);
        }, 600);
      }
    }
  };

  const handleContinue = () => {
    if (victory || gameOver) {
      navigate('/jungle-lush');
    }
  };

  // Retry handler for battle only
  const handleRetryBattle = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(MONSTER_MAX_HP);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setShowQuiz(true);
    setRetryBattle(false);
  };

  // Persist progress: save stars on victory
  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/progress/levels/1', {
            starsEarned: hearts,
            completed: true
          }, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
        } catch (e) {
          // handle error (optional)
        }
      }
      saveProgress();
    }
  }, [victory]);

  return (
    <SceneContainer>
      <Ground />
      <TopBar>
        {showQuiz ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <img key={idx} src={HEART_IMG} alt="Heart" style={{ width: 40, height: 40, opacity: idx < hearts ? 1 : 0.3 }} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {showQuiz ? (
          <TimerBox>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>TIMER</Typography>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>{timeLeft}s</Typography>
          </TimerBox>
        ) : <div style={{ width: 90 }} />}
        <Button variant="contained" color="error" onClick={() => setShowQuit(true)} startIcon={<CloseIcon />} style={{ fontWeight: 700, fontFamily: 'monospace', borderRadius: 18, marginLeft: 16 }}>
          Quit
        </Button>
      </TopBar>
      {!showQuiz ? (
        <>
          <SpritesRow>
            {showLeftSprites && (
              <WizardUserGroup>
                <WizardSprite src={WIZARD_IMG} />
                <UserSprite src={USER_IMG} />
              </WizardUserGroup>
            )}
            <CommawidowGroup>
              {showCommawidow && (
                <CommawidowSprite src={COMMAWIDOW_IMG} />
              )}
            </CommawidowGroup>
          </SpritesRow>
          <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
            <NameTag>{dialogueSequence[currentDialogue].speaker}</NameTag>
            <Typography variant="h6" gutterBottom style={{ marginTop: 18, fontFamily: 'monospace' }}>
              {dialogueSequence[currentDialogue].text}
            </Typography>
            {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
          </DialogueBox>
        </>
      ) : (
        <>
          <BattleSpritesRow>
            <UserSprite src={USER_IMG} isDamaged={userDamaged} />
            <VS>VS</VS>
            <MonsterSpriteWrapper>
              <MonsterHPText>Commawidow HP</MonsterHPText>
              <MonsterHPBar>
                <MonsterHPFill hp={monsterHP} />
              </MonsterHPBar>
              <CommawidowSprite src={COMMAWIDOW_IMG} isDamaged={monsterDamaged} />
            </MonsterSpriteWrapper>
          </BattleSpritesRow>
          <BattleBottomBar>
            <QuestionText>
              {questions[currentQuestion].question}
            </QuestionText>
            <ChoicesGrid count={questions[currentQuestion].options.length}>
              {questions[currentQuestion].options.map((option, idx) => (
                <MoveButton
                  key={idx}
                  selected={selectedAnswer === idx}
                  onClick={() => handleAnswer(idx)}
                  disableRipple
                  style={{ fontFamily: 'monospace' }}
                  disabled={showResult}
                >
                  {option}
                </MoveButton>
              ))}
            </ChoicesGrid>
          </BattleBottomBar>
        </>
      )}
      <Dialog open={showQuit} onClose={() => setShowQuit(false)}>
        <DialogContent>
          <Typography variant="h6" align="center">Are you sure you want to quit?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuit(false)} color="primary">Cancel</Button>
          <Button onClick={() => navigate('/jungle-lush')} color="error">Quit</Button>
        </DialogActions>
      </Dialog>
      {/* Game over dialog only (not for victory) */}
      <Dialog open={gameOver && hearts === 0} onClose={() => {}}>
        <DialogContent>
          <Typography variant="h5" align="center">Game Over! Try again?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRetryBattle} color="primary">Retry</Button>
          <Button onClick={() => navigate('/jungle-lush')} color="error">Quit</Button>
        </DialogActions>
      </Dialog>
      {victory && (
        <VictoryOverlay>
          <VictoryContainer elevation={12}>
            {/* Star rating */}
            <Typography style={{ color: '#3a2a1a', fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', marginBottom: 2, textAlign: 'center', letterSpacing: 1 }}>Battle Rating</Typography>
            <StarRow>
              {[1,2,3].map(i => (
                <Star key={i} filled={hearts >= i} style={newRecord && hearts >= i ? { animation: 'popIn 0.5s' } : {}}>
                  ★
                </Star>
              ))}
            </StarRow>
            {newRecord && (
              <Typography style={{ color: '#d32f2f', fontWeight: 900, fontFamily: 'monospace', fontSize: '1.3rem', marginBottom: 8, textAlign: 'center', letterSpacing: 1, animation: 'popIn 0.7s' }}>
                New Record!
              </Typography>
            )}
            <VictoryTitle>Victory!<br />You've defeated Commawidow!</VictoryTitle>
            <Typography style={{ color: '#3a2a1a', fontFamily: 'monospace', marginBottom: 24, fontSize: '1.1rem', textAlign: 'center' }}>
              The web is broken, and the path forward is clear.
            </Typography>
            <VictoryButton variant="contained" color="success" onClick={() => navigate('/jungle-lush/level2')}>Go to Next Level</VictoryButton>
            <VictoryButton variant="outlined" color="primary" onClick={handleRetryBattle}>Retry Level</VictoryButton>
            <VictoryButton variant="outlined" color="error" onClick={() => navigate('/jungle-lush')}>Quit</VictoryButton>
          </VictoryContainer>
        </VictoryOverlay>
      )}
      <button className="jl-return-btn" style={{ marginTop: 32 }} onClick={() => navigate('/jungle-lush')}>Return to Jungle Lush</button>
    </SceneContainer>
  );
};

export default JungleLushLevel1; 
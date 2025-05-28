import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, CircularProgress, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import '../../styles/MapView.css';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const JUNGLE_BG = 'https://png.pngtree.com/background/20220727/original/pngtree-jungle-game-background-arcade-art-picture-image_1829537.jpg';
const WIZARD_IMG = 'https://www.shutterstock.com/image-vector/pixel-art-wizard-long-beard-260nw-2544146115.jpg';
const USER_IMG = 'https://w7.pngwing.com/pngs/928/303/png-transparent-pixel-dodgers-pixel-art-sprite-text-cartoon-fictional-character.png';
const PLURIBOG_IMG = 'https://cdna.artstation.com/p/assets/images/images/072/803/668/large/blade-blackwood-frogmonster.jpg?1708254629';
const BLOBBLET_IMG = 'https://static.vecteezy.com/system/resources/previews/027/517/582/non_2x/pixel-cartoon-swamp-monster-png.png';
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
const MonsterGroup = styled(Box)(({ theme }) => ({
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
const MonsterSprite = styled('img')(({ isDamaged }) => ({
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

const dialogueSequence = [
  { speaker: 'Wizard', text: "We've entered Pluribog's Pit. Once, this land echoed with cheerful learning songs… now it reeks of confusion." },
  { speaker: 'Wizard', text: "Pluribog, the Bog Beast of Broken Words, lies ahead. He is the spirit of grammatical neglect—every misused plural breathes new life into him." },
  { speaker: 'Adventurer', text: "Wait—this place was a school?" },
  { speaker: 'Wizard', text: "Indeed. A great academy of grammar once stood at the center… until Pluribog emerged from the swamp. He swallowed every sentence, twisted every textbook. Now, nothing is singular. Or plural. Or anything at all." },
  { speaker: 'Adventurer', text: "Then I guess it's time to retake the test." },
  { speaker: 'Pluribog', text: "Sssssssssingular… pluuuuuuural… Who cares what's many or one? I prefer 'gooses' and 'mices' and 'sheeps'! Hehehe! You've come for the scroll? Foolish whelp. Drown in my grammar muck!" },
  { speaker: 'Blobblet', text: "Time to test your word-counting skills, 'hero'! If you say 'tooths' instead of 'teeth', I win! Let's begin, word-warrior!" },
];
const blobbletQuestions = [
  {
    question: "Choose the correct plural form: 'There are many ___ in the pond.'",
    options: ['fishs', 'fishes', 'fish'],
    correctAnswer: 2
  },
  {
    question: "Which sentence is correct?",
    options: ['The childs is reading.', 'The children are reading.', 'The childrens are reading.'],
    correctAnswer: 1
  },
  {
    question: "What is the plural of 'goose'?",
    options: ['gooses', 'geese', 'goosen'],
    correctAnswer: 1
  }
];
const prePluribogDialogue = [
  { speaker: 'Adventurer', text: "Sticky little grammar gremlin. Not bad, but I've handled worse." },
  { speaker: 'Pluribog', text: "You squashed my slime. Cute. But I am the pit! I am the confusion! I AM THE MISPLACED 'S'! Come then, chosen one. Let's see if your mind is as sharp as your tongue!" },
];
const pluribogQuestions = [
  {
    question: "Choose the correct sentence:",
    options: ['The cactuses in the desert are huge.', 'The cactus are growing quickly.', 'The cacti in the desert are huge.'],
    correctAnswer: 2
  },
  {
    question: "Which is correct?",
    options: ['I saw two sheeps in the field.', 'I saw two sheep in the field.', 'I saw two sheepes in the field.'],
    correctAnswer: 1
  },
  {
    question: "Select the correct plural: 'There were several strange ___ crawling on the log.'",
    options: ['mices', 'mice', 'mouse'],
    correctAnswer: 1
  },
  {
    question: "Choose the correct sentence:",
    options: ['The data are accurate.', 'The datas is accurate.', 'The datum are accurate.'],
    correctAnswer: 0
  },
  {
    question: "What is the plural of 'phenomenon'?",
    options: ['phenomenons', 'phenomena', 'phenomenae'],
    correctAnswer: 1
  }
];
const MONSTER_MAX_HP = 100;

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

const JungleLushLevel3 = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('dialogue');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [prePluribogDialogueIdx, setPrePluribogDialogueIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(100);
  const [monster, setMonster] = useState('blobblet');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const idleTimeout = useRef(null);
  const [newRecord, setNewRecord] = useState(false);
  const levelNumber = 3;

  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue' || phase === 'prepluribog') {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [dialogueIdx, phase, prePluribogDialogueIdx]);

  useEffect(() => {
    if ((phase === 'blobblet' || phase === 'pluribog') && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if ((phase === 'blobblet' || phase === 'pluribog') && timeLeft === 0 && !victory && !gameOver) {
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
  }, [phase, timeLeft, victory, gameOver, hearts]);

  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue') {
      if (dialogueIdx < dialogueSequence.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        setPhase('blobblet');
        setMonster('blobblet');
        setMonsterHP(100);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
      }
    } else if (phase === 'prepluribog') {
      if (prePluribogDialogueIdx < prePluribogDialogue.length - 1) {
        setPrePluribogDialogueIdx(prePluribogDialogueIdx + 1);
      } else {
        setPhase('pluribog');
        setMonster('pluribog');
        setMonsterHP(100);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }
  };

  const handleAnswer = (idx) => {
    setSelectedAnswer(idx);
    setShowResult(true);
    const questions = monster === 'blobblet' ? blobbletQuestions : pluribogQuestions;
    if (idx === questions[currentQuestion].correctAnswer) {
      setMonsterDamaged(true);
      setTimeout(() => setMonsterDamaged(false), 500);
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - Math.floor(100 / questions.length));
        if (currentQuestion === questions.length - 1 || newHP === 0) {
          if (monster === 'blobblet') {
            setPhase('prepluribog');
            setPrePluribogDialogueIdx(0);
          } else {
            setVictory(true);
          }
        }
        return newHP;
      });
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
          setTimeLeft(TIMER_DURATION);
        }, 600);
      }
    } else {
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

  const handleRetryBattle = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(100);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    if (phase === 'pluribog') {
      setPhase('pluribog');
      setMonster('pluribog');
    } else {
      setPhase('blobblet');
      setMonster('blobblet');
    }
  };

  const handleRetryWholeLevel = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(100);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setPhase('dialogue');
    setDialogueIdx(0);
    setPrePluribogDialogueIdx(0);
    setMonster('blobblet');
  };

  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/progress/levels/3', {
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

  let content = null;
  if (phase === 'dialogue') {
    const d = dialogueSequence[dialogueIdx];
    content = (
      <>
        <SpritesRow>
          <WizardUserGroup>
            <WizardSprite src={WIZARD_IMG} />
            <UserSprite src={USER_IMG} />
          </WizardUserGroup>
          <MonsterGroup>
            {d.speaker === 'Pluribog' && <MonsterSprite src={PLURIBOG_IMG} />}
            {d.speaker === 'Blobblet' && <MonsterSprite src={BLOBBLET_IMG} />}
          </MonsterGroup>
        </SpritesRow>
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <Typography variant="h6" gutterBottom style={{ marginTop: 18, fontFamily: 'monospace' }}>
            {d.text}
          </Typography>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  } else if (phase === 'blobblet' || phase === 'pluribog') {
    const questions = monster === 'blobblet' ? blobbletQuestions : pluribogQuestions;
    const monsterImg = monster === 'blobblet' ? BLOBBLET_IMG : PLURIBOG_IMG;
    const monsterName = monster === 'blobblet' ? 'Blobblet' : 'Pluribog';
    content = (
      <>
        <BattleSpritesRow>
          <UserSprite src={USER_IMG} isDamaged={userDamaged} />
          <VS>VS</VS>
          <MonsterSpriteWrapper>
            <MonsterHPText>{monsterName} HP</MonsterHPText>
            <MonsterHPBar>
              <MonsterHPFill hp={monsterHP} />
            </MonsterHPBar>
            <MonsterSprite src={monsterImg} isDamaged={monsterDamaged} />
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
    );
  } else if (phase === 'prepluribog') {
    const d = prePluribogDialogue[prePluribogDialogueIdx];
    content = (
      <>
        <SpritesRow>
          <WizardUserGroup>
            <WizardSprite src={WIZARD_IMG} />
            <UserSprite src={USER_IMG} />
          </WizardUserGroup>
          <MonsterGroup>
            <MonsterSprite src={PLURIBOG_IMG} />
          </MonsterGroup>
        </SpritesRow>
        <DialogueBox elevation={6} onClick={handleDialogueClick} style={{ cursor: 'pointer', userSelect: 'none', marginTop: 180 }}>
          <NameTag>{d.speaker}</NameTag>
          <Typography variant="h6" gutterBottom style={{ marginTop: 18, fontFamily: 'monospace' }}>
            {d.text}
          </Typography>
          {showClickPrompt && <ClickPrompt>Click to continue</ClickPrompt>}
        </DialogueBox>
      </>
    );
  }

  return (
    <SceneContainer>
      <Ground />
      <TopBar>
        {(phase === 'blobblet' || phase === 'pluribog') ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <img key={idx} src={HEART_IMG} alt="Heart" style={{ width: 40, height: 40, opacity: idx < hearts ? 1 : 0.3 }} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {(phase === 'blobblet' || phase === 'pluribog') ? (
          <TimerBox>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>TIMER</Typography>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>{timeLeft}s</Typography>
          </TimerBox>
        ) : <div style={{ width: 90 }} />}
        <Button variant="contained" color="error" onClick={() => setShowQuit(true)} startIcon={<CloseIcon />} style={{ fontWeight: 700, fontFamily: 'monospace', borderRadius: 18, marginLeft: 16 }}>
          Quit
        </Button>
      </TopBar>
      {content}
      <Dialog open={showQuit} onClose={() => setShowQuit(false)}>
        <DialogContent>
          <Typography variant="h6" align="center">Are you sure you want to quit?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuit(false)} color="primary">Cancel</Button>
          <Button onClick={() => navigate('/jungle-lush')} color="error">Quit</Button>
        </DialogActions>
      </Dialog>
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
            <VictoryTitle>Victory!<br />You've defeated Pluribog!</VictoryTitle>
            <Typography style={{ color: '#3a2a1a', fontFamily: 'monospace', marginBottom: 24, fontSize: '1.1rem', textAlign: 'center' }}>
              The pit is calm, and the scroll is yours.
            </Typography>
            <VictoryButton variant="contained" color="success" onClick={() => navigate('/jungle-lush')}>Return to Level Select</VictoryButton>
            <VictoryButton variant="outlined" color="primary" onClick={handleRetryWholeLevel}>Retry Level</VictoryButton>
            <VictoryButton variant="outlined" color="error" onClick={() => navigate('/jungle-lush')}>Quit</VictoryButton>
          </VictoryContainer>
        </VictoryOverlay>
      )}
      <button className="jl-return-btn" style={{ marginTop: 32 }} onClick={() => navigate('/jungle-lush')}>Return to Jungle Lush</button>
    </SceneContainer>
  );
};

export default JungleLushLevel3; 
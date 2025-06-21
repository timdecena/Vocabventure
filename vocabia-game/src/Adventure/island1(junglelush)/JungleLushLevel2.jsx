import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import '../../styles/MapView.css';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const JUNGLE_BG = 'https://png.pngtree.com/background/20220727/original/pngtree-jungle-game-background-arcade-art-picture-image_1829537.jpg';
const WIZARD_IMG = 'https://www.shutterstock.com/image-vector/pixel-art-wizard-long-beard-260nw-2544146115.jpg';
const USER_IMG = 'https://w7.pngwing.com/pngs/928/303/png-transparent-pixel-dodgers-pixel-art-sprite-text-cartoon-fictional-character.png';
const TENSEPHANT_IMG = 'https://files.idyllic.app/files/static/2179601';
const TIMEGRUB_IMG = 'https://i.redd.it/fahn2okk3fy41.png';
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
  marginTop: '12px',
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

// Dialogue sequence for Level 2
const dialogueSequence = [
  { speaker: 'Wizard', text: "We've entered the edge of the jungle where time behaves… unusually." },
  { speaker: 'User', text: "It feels like everything is… stuck, or skipping forward?" },
  { speaker: 'Wizard', text: "That is the influence of Tensaphant, the Tinkerer of Time. His distortions ripple through every sentence, every moment." },
  { speaker: 'Wizard', text: "Here, verbs bend out of shape. The past forgets itself. The future speaks in riddles. Be on guard." },
  { speaker: 'User', text: "So we're dealing with time grammar?" },
  { speaker: 'Wizard', text: "Exactly. Master this, and you'll make the jungle breathe freely again." },
  { speaker: 'Tensaphant', text: "Foolish mortal... trudging through my warped domain." },
  { speaker: 'Tensaphant', text: "The villagers babble nonsense now, caught in echoes of incorrect tenses. I like it that way." },
  { speaker: 'User', text: "Then you won't like what comes next." },
  { speaker: 'Tensaphant', text: "Before you challenge me, face my echo from a fractured timeline." },
  { speaker: 'Timegrub', text: "Past, present, future... all blend in my belly!" },
  { speaker: 'Timegrub', text: "Get the tense wrong, and I'll gnaw on your precious hearts!" },
  { speaker: 'User', text: "You'll be burping grammar rules by the time I'm done." },
];

// Questions for Timegrub (3)
const timegrubQuestions = [
  {
    question: 'Choose the correct sentence (past tense):',
    options: [
      'She eats dinner already.',
      'She ate dinner already.',
      'She eat dinner already.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Select the correct future tense:',
    options: [
      'They will go to the museum tomorrow.',
      'They goes to the museum tomorrow.',
      'They going to the museum tomorrow.'
    ],
    correctAnswer: 0
  },
  {
    question: 'Choose the proper tense:',
    options: [
      'He has finish his test.',
      'He have finished his test.',
      'He has finished his test.'
    ],
    correctAnswer: 2
  },
];

// Pre-Tensaphant battle dialogue
const preTensaphantDialogue = [
  { speaker: 'Timegrub', text: "Urghh… the timeline... corrected… *faints*" },
  { speaker: 'Tensaphant', text: "You've disrupted my rhythm!" },
  { speaker: 'User', text: "Then I'll break the rest of your clock!" },
  { speaker: 'Tensaphant', text: "Let's see how well you handle me, time meddler!" },
];

// Questions for Tensaphant (5)
const tensephantQuestions = [
  {
    question: 'Which sentence is in the simple past tense?',
    options: [
      'She has baked a cake.',
      'She baked a cake.',
      'She was baking a cake.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Choose the correct future perfect tense:',
    options: [
      'I will have finish my work before lunch.',
      'I will have finished my work before lunch.',
      'I had finished my work before lunch.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Which sentence is in the past continuous tense?',
    options: [
      'They were play outside.',
      'They had been playing outside.',
      'They were playing outside.'
    ],
    correctAnswer: 2
  },
  {
    question: 'Pick the correct present perfect continuous sentence:',
    options: [
      'I have been studied all night.',
      'I have been studying all night.',
      'I was studying all night.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Which one is in the future continuous tense?',
    options: [
      'She will be sing at the event.',
      'She will be singing at the event.',
      'She is singing at the event tomorrow.'
    ],
    correctAnswer: 1
  },
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

const JungleLushLevel2 = () => {
  const navigate = useNavigate();
  // Dialogue and battle state
  const [phase, setPhase] = useState('dialogue'); // dialogue, timegrub, pretense, tensephant, victory, gameover
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [preTenseDialogueIdx, setPreTenseDialogueIdx] = useState(0);
  // Battle state
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(MONSTER_MAX_HP);
  const [monster, setMonster] = useState('timegrub'); // 'timegrub' or 'tensephant'
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
  // Star rating state
  const [newRecord, setNewRecord] = useState(false);
  const levelNumber = 2; // This is level 2

  // Dialogue click/idle logic
  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue' || phase === 'pretense') {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [dialogueIdx, phase, preTenseDialogueIdx]);

  // Timer logic
  useEffect(() => {
    if ((phase === 'timegrub' || phase === 'tensephant') && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if ((phase === 'timegrub' || phase === 'tensephant') && timeLeft === 0 && !victory && !gameOver) {
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
  }, [phase, timeLeft, victory, gameOver, hearts]);

  // Dialogue click handler
  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue') {
      if (dialogueIdx < dialogueSequence.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        // Start Timegrub battle
        setPhase('timegrub');
        setMonster('timegrub');
        setMonsterHP(MONSTER_MAX_HP);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
      }
    } else if (phase === 'pretense') {
      if (preTenseDialogueIdx < preTensaphantDialogue.length - 1) {
        setPreTenseDialogueIdx(preTenseDialogueIdx + 1);
      } else {
        // Start Tensephant battle
        setPhase('tensephant');
        setMonster('tensephant');
        setMonsterHP(MONSTER_MAX_HP);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }
  };

  // Answer handler
  const handleAnswer = (idx) => {
    setSelectedAnswer(idx);
    setShowResult(true);
    const questions = monster === 'timegrub' ? timegrubQuestions : tensephantQuestions;
    if (idx === questions[currentQuestion].correctAnswer) {
      setMonsterDamaged(true);
      setTimeout(() => setMonsterDamaged(false), 500);
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - Math.floor(MONSTER_MAX_HP / questions.length));
        if (currentQuestion === questions.length - 1 || newHP === 0) {
          if (monster === 'timegrub') {
            // Pre-Tensephant dialogue
            setPhase('pretense');
            setPreTenseDialogueIdx(0);
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

  // Retry handler for current battle (used on game over)
  const handleRetryBattle = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(MONSTER_MAX_HP);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    // Only reset the current battle phase, not the whole level
    if (phase === 'tensephant') {
      setPhase('tensephant');
      setMonster('tensephant');
    } else {
      setPhase('timegrub');
      setMonster('timegrub');
    }
  };

  // Retry handler for whole level (used on victory)
  const handleRetryWholeLevel = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(MONSTER_MAX_HP);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setPhase('dialogue');
    setDialogueIdx(0);
    setPreTenseDialogueIdx(0);
    setMonster('timegrub');
  };

  // Persist progress: save stars on victory
  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/adventure/level-progress/save', {
            levelName: "Tensephant's Domain",
            completed: true,
            starsEarned: hearts
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

  // Render logic
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
            {d.speaker === 'Tensaphant' && <MonsterSprite src={TENSEPHANT_IMG} />}
            {d.speaker === 'Timegrub' && <MonsterSprite src={TIMEGRUB_IMG} />}
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
  } else if (phase === 'timegrub' || phase === 'tensephant') {
    const questions = monster === 'timegrub' ? timegrubQuestions : tensephantQuestions;
    const monsterImg = monster === 'timegrub' ? TIMEGRUB_IMG : TENSEPHANT_IMG;
    const monsterName = monster === 'timegrub' ? 'Timegrub' : 'Tensaphant';
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
  } else if (phase === 'pretense') {
    const d = preTensaphantDialogue[preTenseDialogueIdx];
    content = (
      <>
        <SpritesRow>
          <WizardUserGroup>
            <WizardSprite src={WIZARD_IMG} />
            <UserSprite src={USER_IMG} />
          </WizardUserGroup>
          <MonsterGroup>
            {d.speaker === 'Tensaphant' && <MonsterSprite src={TENSEPHANT_IMG} />}
            {d.speaker === 'Timegrub' && <MonsterSprite src={TIMEGRUB_IMG} />}
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
        {(phase === 'timegrub' || phase === 'tensephant') ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <img key={idx} src={HEART_IMG} alt="Heart" style={{ width: 40, height: 40, opacity: idx < hearts ? 1 : 0.3 }} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {(phase === 'timegrub' || phase === 'tensephant') ? (
          <TimerBox>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>TIMER</Typography>
            <Typography style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>{timeLeft}s</Typography>
          </TimerBox>
        ) : <div style={{ width: 90 }} />}
        <Button variant="contained" color="error" onClick={() => setShowQuit(true)} startIcon={<CloseIcon />} style={{ fontWeight: 700, fontFamily: 'monospace', borderRadius: 18, marginRight: 48, marginTop: 12 }}>
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
            <VictoryTitle>Victory!<br />You've defeated Tensephant!</VictoryTitle>
            <Typography style={{ color: '#3a2a1a', fontFamily: 'monospace', marginBottom: 24, fontSize: '1.1rem', textAlign: 'center' }}>
              The timeline is restored, and the jungle breathes freely again.
            </Typography>
            <VictoryButton variant="contained" color="success" onClick={() => navigate('/jungle-lush/level3')}>Go to Next Level</VictoryButton>
            <VictoryButton variant="outlined" color="primary" onClick={handleRetryWholeLevel}>Retry Level</VictoryButton>
            <VictoryButton variant="outlined" color="error" onClick={() => navigate('/jungle-lush')}>Quit</VictoryButton>
          </VictoryContainer>
        </VictoryOverlay>
      )}
      <button className="jl-return-btn" style={{ marginTop: 32 }} onClick={() => navigate('/jungle-lush')}>Return to Jungle Lush</button>
    </SceneContainer>
  );
};

export default JungleLushLevel2; 
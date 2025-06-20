import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, CircularProgress, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import '../../styles/MapView.css';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const TOWER_BG = 'https://i.ytimg.com/vi/-NZKGTeJzec/maxresdefault.jpg';
const WIZARD_IMG = 'https://www.shutterstock.com/image-vector/pixel-art-wizard-long-beard-260nw-2544146115.jpg';
const USER_IMG = 'https://w7.pngwing.com/pngs/928/303/png-transparent-pixel-dodgers-pixel-art-sprite-text-cartoon-fictional-character.png';
const GRAMMOWL_IMG = 'https://pics.craiyon.com/2023-09-03/961fec15ab014817b35778ba0c789a44.webp';
const SCROLL_IMG = 'https://i.pinimg.com/736x/f8/93/cb/f893cb2962a5ec989290081903561047.jpg';
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
  backgroundImage: `url(${TOWER_BG})`,
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
  background: 'linear-gradient(90deg, #4caf50 60%, #b2ff59 100%) !important',
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
  width: count === 3 ? '700px' : '600px',
  maxWidth: '95vw',
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

const InputField = styled(TextField)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    fontFamily: 'monospace',
    fontSize: '1.1rem',
    color: '#000 !important',
    fontWeight: 600,
    '& fieldset': {
      borderColor: '#444',
      borderWidth: '2.5px',
    },
    '&:hover fieldset': {
      borderColor: '#d32f2f',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#d32f2f',
    },
  },
  '& input': {
    color: '#000 !important',
    fontWeight: 600,
  },
  '& input::placeholder': {
    color: '#888',
    opacity: 1,
    fontStyle: 'italic',
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

const TIMER_DURATION = 30;
const PHASE2_TIMER_DURATION = 10;
const MONSTER_MAX_HP = 100;

const dialogueSequence = [
  { speaker: "Wizard", text: "This is it… the Tower of Grammowl. The heart of Jungle Lush and the resting place of the first Scroll of Knowledge." },
  { speaker: "Wizard", text: "He has watched your battles. He knows you're coming. Be ready, adventurer… this will not be like before." },
  { speaker: "Adventurer", text: "I've beaten his underlings. I've walked through webs, swamps, and twisted tenses. Let's finish this." },
  { speaker: "Grammowl", text: "You… child of prophecies and misplaced confidence." },
  { speaker: "Grammowl", text: "Did you enjoy playing with my pets? Did their whimpers delight you as you erased them one by one?" },
  { speaker: "Grammowl", text: "They were my voice. My grammar incarnate. And now you've come for my scroll?" },
  { speaker: "Grammowl", text: "You may have passed their petty quizzes, but I am the architect of confusion." },
  { speaker: "Grammowl", text: "Come, chosen one. Let's see if your mind can fly as high as your ego." }
];

const midBattleDialogue = [
  { speaker: "Grammowl", text: "Enough!! Enough of these… child's riddles!" },
  { speaker: "Grammowl", text: "You dare burn half my feathers? You dare light the flames of grammar in my tower?" },
  { speaker: "Grammowl", text: "Let me show you real confusion. Let me strip away your choices. Answer… without a net!" }
];

const defeatDialogue = [
  { speaker: "Grammowl", text: "No… how did you… a mere child… bend the rules so flawlessly?" },
  { speaker: "Grammowl", text: "The scroll… I guarded it for him… He said no one would come…" },
  { speaker: "Grammowl", text: "You've only won a page of the story…" },
  { speaker: "Grammowl", text: "He's still watching… waiting in the shadows… and he is far beyond your comprehension!" },
  { speaker: "Grammowl", text: "HE… will not be as merciful… *faints" }
];

const victoryDialogue = [
  { speaker: "Adventurer", text: "That… that was intense. He almost had me." },
  { speaker: "Wizard", text: "Grammowl… the guardian of the Scroll of Grammar. Once a wise protector, now twisted by the shadows…" },
  { speaker: "Adventurer", text: "He said he served someone—'him'. Who is he talking about?" },
  { speaker: "Wizard", text: "The one whose name we dare not speak lightly… A force that once slept beneath the ruins of forgotten knowledge. Dysauron." },
  { speaker: "Adventurer", text: "Dysauron? That doesn't sound like your average villain…" },
  { speaker: "Wizard", text: "He is the bane of learning, the devourer of words, the shadow that seeks to silence every spark of understanding. Long ago, we locked away his power within the Scrolls of Knowledge…" },
  { speaker: "Adventurer", text: "And now they're scattered. One scroll down… four to go." },
  { speaker: "Wizard", text: "You've passed your first true trial, brave one. But what lies ahead will test your wit, will, and wisdom far beyond this." },
  { speaker: "Adventurer", text: "Then I'll keep going. For the villages… for Vocabia." },
  { speaker: "Wizard", text: "Then let the Scroll of Grammar light your path forward. The shores of spelling await." }
];

const phase1Questions = [
  {
    question: 'Which sentence uses punctuation correctly?',
    options: [
      'She said, "Let\'s leave now".',
      'She said "Let\'s leave now."',
      'She said, "Let\'s leave now".',
      'She said, "Let\'s leave now."'
    ],
    correctAnswer: 3
  },
  {
    question: 'Choose the correct subject-verb agreement:',
    options: [
      'The data was incorrect.',
      'The data were incorrect.',
      'The data is incorrect.',
      'The data has been incorrect.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Identify the grammatically correct sentence:',
    options: [
      'Neither the teacher nor the students was present.',
      'Neither the teacher nor the students were present.',
      'Neither the teacher or the students were present.',
      'Neither the teacher nor the student were present.'
    ],
    correctAnswer: 1
  },
  {
    question: 'Where does the semicolon go?',
    options: [
      'I have a big test tomorrow; I can\'t go out tonight.',
      'I have a big test; tomorrow I can\'t go out tonight.',
      'I have; a big test tomorrow I can\'t go out tonight.',
      'I have a big test tomorrow, I can\'t go out tonight.'
    ],
    correctAnswer: 0
  },
  {
    question: 'Correct sentence with modifiers:',
    options: [
      'Running quickly, the finish line was in sight.',
      'The finish line was in sight, running quickly.',
      'Running quickly, I saw the finish line.',
      'I saw the finish line running quickly.'
    ],
    correctAnswer: 2
  }
];

const phase2Questions = [
  {
    question: 'Fill in the blank with the correct punctuation:\nShe whispered ___ "We\'re not alone."',
    answer: ','
  },
  {
    question: 'What is the correct verb to complete this sentence?\nThe books on the table ___ new.',
    answer: 'are'
  },
  {
    question: 'Fix the verb:\nNeither of them ___ coming.',
    answer: 'is'
  },
  {
    question: 'Fill in the blank with the correct article:\n___ apple a day keeps the doctor away.',
    answer: 'An'
  },
  {
    question: 'Choose the correct word:\nTheir voices echo in ___ memory.',
    answer: 'my'
  }
];

const JungleLushLevel5 = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('dialogue');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [victoryDialogueIdx, setVictoryDialogueIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [monsterHP, setMonsterHP] = useState(100);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [userDamaged, setUserDamaged] = useState(false);
  const [monsterDamaged, setMonsterDamaged] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const idleTimeout = useRef(null);
  const [newRecord, setNewRecord] = useState(false);
  const levelNumber = 5;
  const inputRef = useRef(null);

  useEffect(() => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue' || phase === 'midBattleDialogue' || phase === 'defeatDialogue' || phase === 'victoryDialogue') {
      idleTimeout.current = setTimeout(() => setShowClickPrompt(true), 2000);
    }
    return () => clearTimeout(idleTimeout.current);
  }, [dialogueIdx, phase]);

  useEffect(() => {
    if ((phase === 'battle1' || phase === 'battle2') && timeLeft > 0 && !victory && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if ((phase === 'battle1' || phase === 'battle2') && timeLeft === 0 && !victory && !gameOver) {
      setShowResult(false);
      if (hearts > 1) {
        setHearts(h => h - 1);
        setTimeLeft(phase === 'battle1' ? TIMER_DURATION : PHASE2_TIMER_DURATION);
        setSelectedAnswer(null);
        setUserInput('');
      } else {
        setHearts(0);
        setGameOver(true);
      }
    }
  }, [phase, timeLeft, victory, gameOver, hearts]);

  useEffect(() => {
    if (phase === 'battle2' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, currentQuestion]);

  const handleDialogueClick = () => {
    setShowClickPrompt(false);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (phase === 'dialogue') {
      if (dialogueIdx < dialogueSequence.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        setPhase('battle1');
        setMonsterHP(100);
        setCurrentQuestion(0);
        setTimeLeft(TIMER_DURATION);
      }
    } else if (phase === 'midBattleDialogue') {
      if (dialogueIdx < midBattleDialogue.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        setPhase('battle2');
        setMonsterHP(100);
        setCurrentQuestion(0);
        setTimeLeft(PHASE2_TIMER_DURATION);
        setUserInput('');
        setShowResult(false);
      }
    } else if (phase === 'defeatDialogue') {
      if (dialogueIdx < defeatDialogue.length - 1) {
        setDialogueIdx(dialogueIdx + 1);
      } else {
        setPhase('victoryDialogue');
        setVictoryDialogueIdx(0);
      }
    } else if (phase === 'victoryDialogue') {
      if (victoryDialogueIdx < victoryDialogue.length - 1) {
        setVictoryDialogueIdx(victoryDialogueIdx + 1);
      } else {
        setVictory(true);
      }
    }
  };

  const handleAnswer = (idx) => {
    if (phase !== 'battle1') return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === phase1Questions[currentQuestion].correctAnswer) {
      setMonsterDamaged(true);
      setTimeout(() => setMonsterDamaged(false), 500);
      setMonsterHP(hp => {
        const newHP = Math.max(0, hp - 20); // 5 hits to defeat in phase 1
        if (currentQuestion === 4) {
          setPhase('midBattleDialogue');
          setDialogueIdx(0);
        }
        return newHP;
      });
      if (currentQuestion < phase1Questions.length - 1) {
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

  const handleInputSubmit = (e) => {
    if (phase !== 'battle2' || e.key !== 'Enter') return;
    const answer = userInput.trim().toLowerCase();
    const correctAnswer = phase2Questions[currentQuestion].answer.toLowerCase();
    setShowResult(true);
    if (answer === correctAnswer) {
      setMonsterDamaged(true);
      setTimeout(() => setMonsterDamaged(false), 500);
      if (currentQuestion === phase2Questions.length - 1) {
        setMonsterHP(0);
        setPhase('defeatDialogue');
        setDialogueIdx(0);
      } else {
        setMonsterHP(hp => Math.max(0, hp - 20));
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setUserInput('');
          setShowResult(false);
          setTimeLeft(PHASE2_TIMER_DURATION);
        }, 600);
      }
    } else {
      setUserDamaged(true);
      setTimeout(() => setUserDamaged(false), 500);
      setTimeout(() => {
        setShowResult(false);
      }, 600);
      if (hearts > 1) {
        setTimeout(() => {
          setHearts(h => h - 1);
          setUserInput('');
          setTimeLeft(PHASE2_TIMER_DURATION);
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
    setUserInput('');
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setPhase('battle1');
  };

  const handleRetryWholeLevel = () => {
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setMonsterHP(100);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserInput('');
    setShowResult(false);
    setGameOver(false);
    setVictory(false);
    setPhase('dialogue');
    setDialogueIdx(0);
  };

  useEffect(() => {
    if (victory) {
      async function saveProgress() {
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/progress/levels/5', {
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
            {d.speaker === 'Grammowl' && <MonsterSprite src={GRAMMOWL_IMG} />}
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
  } else if (phase === 'midBattleDialogue') {
    const d = midBattleDialogue[dialogueIdx];
    content = (
      <>
        <SpritesRow>
          <WizardUserGroup>
            <WizardSprite src={WIZARD_IMG} />
            <UserSprite src={USER_IMG} />
          </WizardUserGroup>
          <MonsterGroup>
            <MonsterSprite src={GRAMMOWL_IMG} />
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
  } else if (phase === 'defeatDialogue') {
    const d = defeatDialogue[dialogueIdx];
    content = (
      <>
        <SpritesRow>
          <WizardUserGroup>
            <WizardSprite src={WIZARD_IMG} />
            <UserSprite src={USER_IMG} />
          </WizardUserGroup>
          <MonsterGroup>
            <MonsterSprite src={GRAMMOWL_IMG} />
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
  } else if (phase === 'victoryDialogue') {
    const d = victoryDialogue[victoryDialogueIdx];
    content = (
      <>
        <SpritesRow>
          <WizardUserGroup>
            <WizardSprite src={WIZARD_IMG} />
            <UserSprite src={USER_IMG} />
          </WizardUserGroup>
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
  } else if (phase === 'battle1' || phase === 'battle2') {
    content = (
      <>
        <BattleSpritesRow>
          <UserSprite src={USER_IMG} isDamaged={userDamaged} />
          <VS>VS</VS>
          <MonsterSpriteWrapper>
            <MonsterHPText>Grammowl HP</MonsterHPText>
            <MonsterHPBar>
              <MonsterHPFill hp={monsterHP} />
            </MonsterHPBar>
            <MonsterSprite src={GRAMMOWL_IMG} isDamaged={monsterDamaged} />
          </MonsterSpriteWrapper>
        </BattleSpritesRow>
        <BattleBottomBar>
          <QuestionText>
            {phase === 'battle1' ? phase1Questions[currentQuestion].question : phase2Questions[currentQuestion].question}
          </QuestionText>
          {phase === 'battle1' ? (
            <ChoicesGrid count={4}>
              {phase1Questions[currentQuestion].options.map((option, idx) => (
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
          ) : (
            <InputField
              inputRef={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleInputSubmit}
              placeholder="Type your answer..."
              disabled={showResult}
            />
          )}
        </BattleBottomBar>
      </>
    );
  }

  return (
    <SceneContainer>
      <Ground />
      <TopBar>
        {(phase === 'battle1' || phase === 'battle2') ? (
          <HeartRow>
            {[...Array(3)].map((_, idx) => (
              <img key={idx} src={HEART_IMG} alt="Heart" style={{ width: 40, height: 40, opacity: idx < hearts ? 1 : 0.3 }} />
            ))}
          </HeartRow>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {(phase === 'battle1' || phase === 'battle2') ? (
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
            <VictoryTitle>Victory!<br />You've obtained the Scroll of Grammar!</VictoryTitle>
            <Typography style={{ color: '#3a2a1a', fontFamily: 'monospace', marginBottom: 24, fontSize: '1.1rem', textAlign: 'center' }}>
              The first spark of knowledge is yours.
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

export default JungleLushLevel5;
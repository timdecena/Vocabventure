import React, { useEffect, useReducer, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Button, Typography, CircularProgress,
  Alert, Chip, Snackbar, Paper, Card,
  Fade, Zoom, Slide, Dialog
} from '@mui/material';
import { keyframes } from '@mui/system';
import { 
  ArrowBack as ArrowBackIcon,
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  Lightbulb as LightbulbIcon,
  Cancel as CancelIcon,
  MonetizationOn as GoldIcon
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
import api from '../api/api';
import SoundManager from '../sound/SoundManager';
import AudioControls from '../components/AudioControls';
import { STRINGS, formatters } from './strings';

// Keyframe animations
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -15px, 0); }
  70% { transform: translate3d(0, -7px, 0); }
  90% { transform: translate3d(0, -2px, 0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideInUp = keyframes`
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.4); }
  50% { box-shadow: 0 0 30px rgba(76, 175, 80, 0.8), 0 0 40px rgba(76, 175, 80, 0.6); }
`;

const goldPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Enhanced Image Grid with loading states and animations
const ImageGrid = ({ imageUrls, isLoading }) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [imageErrors, setImageErrors] = useState(new Set());
  const [lightbox, setLightbox] = useState({ open: false, index: null });

  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  const handleImageError = useCallback((index) => {
    setImageErrors(prev => new Set([...prev, index]));
  }, []);

  const openLightbox = useCallback((index) => {
    if (imageUrls && imageUrls[index]) {
      setLightbox({ open: true, index });
    }
  }, [imageUrls]);

  const closeLightbox = useCallback(() => setLightbox({ open: false, index: null }), []);

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '450px',
      margin: '0 auto',
      mb: 4,
      position: 'relative'
    }}>
      <Card sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 2,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 2,
          aspectRatio: '1/1',
        }}>
          {[0, 1, 2, 3].map(i => {
            const hasImage = i < imageUrls.length;
            const isImageLoaded = loadedImages.has(i);
            const hasImageError = imageErrors.has(i);
            
            return (
              <Zoom in timeout={300 + (i * 100)} key={i}>
                <Box 
                  sx={{
                    width: '100%',
                    paddingTop: '100%',
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    border: '3px solid rgba(255,255,255,0.9)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.25)'
                    },
                    cursor: hasImage && !hasImageError ? 'zoom-in' : 'default'
                  }}
                  onClick={() => hasImage && !hasImageError && openLightbox(i)}
                >
                  {/* Loading skeleton */}
                  {(isLoading || (!isImageLoaded && hasImage && !hasImageError)) && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(
                        90deg,
                        #f0f0f0 0px,
                        #e0e0e0 40px,
                        #f0f0f0 80px
                      )`,
                      backgroundSize: '200px',
                      animation: `${shimmer} 1.5s ease-in-out infinite`
                    }}>
                      <CircularProgress size={30} sx={{ color: '#667eea' }} />
                    </Box>
                  )}
                  
                  {/* Actual image */}
                  {hasImage && !hasImageError && (
                    <Fade in={isImageLoaded} timeout={500}>
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                      }}>
                        <img
                          src={imageUrls[i]}
                          alt={`Clue ${i+1}`}
                          onLoad={() => handleImageLoad(i)}
                          onError={() => handleImageError(i)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                      </Box>
                    </Fade>
                  )}
                  
                  {/* Error state */}
                  {hasImageError && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      color: '#999'
                    }}>
                      <CancelIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="caption">Failed to load</Typography>
                    </Box>
                  )}
                  
                  {/* Empty slot */}
                  {!hasImage && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f8f8',
                      color: '#ccc',
                      fontSize: '2rem'
                    }}>
                      ?
                    </Box>
                  )}
                  
                  {/* Image number badge */}
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(102, 126, 234, 0.9)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    {i + 1}
                  </Box>
                </Box>
              </Zoom>
            );
          })}
        </Box>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={lightbox.open} onClose={closeLightbox} maxWidth="lg">
        <Box sx={{ position: 'relative', p: 0, backgroundColor: '#000' }}>
          {lightbox.index !== null && imageUrls[lightbox.index] && (
            <img
              src={imageUrls[lightbox.index]}
              alt={`Clue ${lightbox.index + 1}`}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'block',
                objectFit: 'contain'
              }}
              onClick={closeLightbox}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

// Enhanced Letter Button Component
const LetterButton = ({ letter, onClick, isSelected, isCorrect, isWrong, disabled }) => {
  return (
    <Button
      onClick={() => { if (typeof onClick === 'function') onClick(letter); }}
      disabled={disabled}
      sx={{
        minWidth: { xs: 45, sm: 50 },
        height: { xs: 45, sm: 50 },
        borderRadius: 2,
        fontSize: { xs: '1.1rem', sm: '1.3rem' },
        fontWeight: 700,
        textTransform: 'uppercase',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isSelected
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : isCorrect
          ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
          : isWrong
          ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        color: isSelected || isCorrect || isWrong ? 'white' : '#333',
        border: `2px solid ${isSelected ? '#667eea' : isCorrect ? '#4caf50' : isWrong ? '#f44336' : '#e0e0e0'}`,
        boxShadow: isSelected || isCorrect || isWrong
          ? '0 6px 20px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        animation: isCorrect ? `${bounce} 0.6s ease` : isWrong ? `${pulse} 0.3s ease` : 'none',
        '&:hover': {
          transform: disabled ? 'none' : 'translateY(-2px) scale(1.05)',
          boxShadow: disabled ? 'none' : '0 8px 25px rgba(0,0,0,0.2)'
        },
        '&:disabled': {
          opacity: 0.6,
          cursor: 'not-allowed'
        }
      }}
    >
      {letter}
    </Button>
  );
};

// ---- Enhanced Initial State with Gold Integration ----
const initialState = {
  puzzle: null,
  loading: true,
  error: null,
  selectedLetters: [],
  availableLetters: [],
  attempts: 0,
  hintShown: false,
  success: false,
  disableInput: false,
  snackbar: { open: false, message: '' },
  timeElapsed: 0,
  streak: 0,
  showHint: false,
  gameStarted: false,
  correctLetters: [],
  wrongLetters: [],
  isSubmitting: false,
  // Enhanced gold and progress tracking
  goldBalance: 0,
  canAffordHint: false,
  hintCost: 25,
  goldEarned: 0,
  showGoldAnimation: false,
  completionStatus: null,
  totalLevels: 0,
  categoryComplete: false,
  score: 0,
  efficiency: 100
};

// Load attempts from localStorage if available
const getStoredAttempts = (category, level) => {
  try {
    // Get user ID from localStorage or use anonymous if not available
    const userId = localStorage.getItem("userId") || "anonymous";
    const key = `vocabVenture_${userId}_${category}_${level}_attempts`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  } catch (e) {
    console.error('Error loading attempts:', e);
    return 0;
  }
};

// Save attempts to localStorage
const saveAttempts = (category, level, attempts) => {
  try {
    // Get user ID from localStorage or use anonymous if not available
    const userId = localStorage.getItem("userId") || "anonymous";
    const key = `vocabVenture_${userId}_${category}_${level}_attempts`;
    localStorage.setItem(key, attempts.toString());
  } catch (e) {
    console.error('Error saving attempts:', e);
  }
};

// Helper function to calculate gold earned based on completion count
function calculateGoldEarned(completionCount) {
  switch (completionCount) {
    case 1: return 10; // First completion
    case 2: return 5;  // Second completion (replay)
    default: return 0; // Third+ completions
  }
}

// ---- Reducer ----
function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': 
      return { ...state, loading: action.payload };
    case 'SET_ERROR': 
      return { ...state, error: action.payload, loading: false };
    case 'SET_PUZZLE': 
      return {
        ...state,
        puzzle: action.payload,
        loading: false,
        error: null,
        selectedLetters: [],
        availableLetters: action.availableLetters || [],
        success: false,
        disableInput: false,
        hintShown: false,
      };
    case 'SELECT_LETTER': 
      return {
        ...state,
        selectedLetters: [...state.selectedLetters, action.letter],
        availableLetters: state.availableLetters.map(l => 
          l.id === action.letter.id ? { ...l, used: true } : l
        ),
      };
    case 'REMOVE_LETTER': {
      const letter = state.selectedLetters[action.index];
      return {
        ...state,
        selectedLetters: state.selectedLetters.filter((_, i) => i !== action.index),
        availableLetters: state.availableLetters.map(l => 
          l.id === letter.id ? { ...l, used: false } : l
        ),
      };
    }
    case 'SET_SUCCESS': 
      return { ...state, success: true, disableInput: true };
    case 'INCREMENT_ATTEMPTS': {
      const newAttempts = state.attempts + 1;
      // Save attempts to localStorage when incremented
      if (action.category && action.level) {
        saveAttempts(action.category, action.level, newAttempts);
      }
      return { ...state, attempts: newAttempts };
    }
    case 'SET_STORED_ATTEMPTS':
      return { ...state, attempts: action.payload };
    case 'SET_HINT': 
      return { ...state, hintShown: true };
    case 'SET_SNACKBAR': 
      return { ...state, snackbar: action.payload };
    // Enhanced gold-related actions
    case 'UPDATE_GOLD_BALANCE':
      return {
        ...state,
        goldBalance: action.payload.goldBalance,
        canAffordHint: action.payload.canAffordHint,
        hintCost: action.payload.hintCost || 25
      };
    case 'SHOW_GOLD_EARNED':
      return {
        ...state,
        goldEarned: action.payload,
        showGoldAnimation: true
      };
    case 'HIDE_GOLD_ANIMATION':
      return { ...state, showGoldAnimation: false };
    case 'SET_COMPLETION_STATUS':
      return { ...state, completionStatus: action.payload };
    case 'SET_TOTAL_LEVELS':
      return { ...state, totalLevels: Number(action.payload) || 0 };
    case 'SET_CATEGORY_COMPLETE':
      return { ...state, categoryComplete: !!action.payload };
    case 'UPDATE_SCORE':
      return { ...state, score: action.payload };
    default: 
      return state;
  }
}

// ---- Utility Functions ----
const generateAvailableLetters = (answer) => {
  if (!answer) return [];
  const answerArr = answer.toUpperCase().split('');
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  const needed = Math.max(10, answerArr.length + 6);
  const fillers = [];
  while (fillers.length < needed - answerArr.length) {
    const l = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!answerArr.includes(l) || fillers.filter(f => f === l).length < 2) fillers.push(l);
  }
  return [...answerArr, ...fillers].sort(() => Math.random() - 0.5).map((v, i) => ({ 
    id: i + '-' + v, 
    value: v,
    used: false
  }));
};

// ---- Local Storage Progress Functions ----
function saveCompletedLevel(category, level) {
  try {
    // Get user ID from localStorage or use anonymous if not available
    const userId = localStorage.getItem("userId") || "anonymous";
    
    // Get existing completed levels with user-specific key
    const storageKey = `vocabVenture_${userId}_${category}_completed`;
    const existingData = localStorage.getItem(storageKey);
    const completedLevels = existingData ? JSON.parse(existingData) : {};
    
    // Mark this level as completed
    completedLevels[level] = true;
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(completedLevels));
    
    // Also update the highest level reached
    updateHighestLevel(category, level);
    
    return true;
  } catch (e) {
    console.error("Error saving completed level:", e);
    return false;
  }
}

function updateHighestLevel(category, level) {
  try {
    // Get user ID from localStorage or use anonymous if not available
    const userId = localStorage.getItem("userId") || "anonymous";
    
    const highestKey = `vocabVenture_${userId}_${category}_highest`;
    const currentHighest = localStorage.getItem(highestKey) || 0;
    
    if (Number(level) > Number(currentHighest)) {
      localStorage.setItem(highestKey, level.toString());
    }
  } catch (e) {
    console.error("Error updating highest level:", e);
  }
}

// Read completed levels for a category from localStorage (offline support)
function getCompletedLevelsLocal(category) {
  try {
    const userId = localStorage.getItem("userId") || "anonymous";
    const storageKey = `vocabVenture_${userId}_${category}_completed`;
    const existingData = localStorage.getItem(storageKey);
    const completedLevels = existingData ? JSON.parse(existingData) : {};
    return Object.keys(completedLevels)
      .filter(k => completedLevels[k])
      .map(n => Number(n))
      .filter(n => Number.isFinite(n));
  } catch (e) {
    console.warn('Could not read local completed levels:', e);
    return [];
  }
}

// ---- Main Component ----
const GamePlay = () => {
  const { category, level, id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerStart, setTimerStart] = useState(Date.now());

  // Preload sound effects when GamePlay loads and cleanup on unmount
  useEffect(() => {
    SoundManager.preloadEffects();
    SoundManager.playBgm();
    
    return () => {
      // Stop audio when leaving GamePlay if not navigating to another FPOW screen
      const currentPath = window.location.pathname;
      if (!currentPath.includes('4pic1word')) {
        SoundManager.stopAllAudio();
      }
    };
  }, []);

  // ---- Fetch Puzzle & Progress ----
  useEffect(() => {
  let isMounted = true;

  async function fetchPuzzle() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const storedAttempts = getStoredAttempts(category, level);
      if (storedAttempts > 0) {
        dispatch({ type: 'SET_STORED_ATTEMPTS', payload: storedAttempts });
      }

      const res = await api.get('/api/fpow/puzzle', { params: { category, level } });
      if (!res.data || !res.data.answer) throw new Error('No puzzle found');

      // ✅ Collect the four image URLs from backend
      const rawUrls = [
        res.data.image1Url,
        res.data.image2Url,
        res.data.image3Url,
        res.data.image4Url
      ].filter(Boolean);

      // ✅ Fix paths to match frontend public/static folder
      const imageUrls = rawUrls.map(url => `/static/images/Four_Pic_One_Word_Category${url}`);

      const availableLetters = generateAvailableLetters(res.data.answer);

      if (isMounted) {
        console.log("Fetched images (fixed):", imageUrls);
        dispatch({
          type: 'SET_PUZZLE',
          payload: { ...res.data, imageUrls },
          availableLetters
        });
        setTimerStart(Date.now());
      }
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load puzzle.' });
    }
  }

  fetchPuzzle();
  return () => { isMounted = false; };
}, [category, level]);


  // ---- Timer ----
  useEffect(() => {
    if (state.loading || state.success) return;
    const t = setInterval(() => setElapsedTime(Date.now() - timerStart), 1000);
    return () => clearInterval(t);
  }, [state.loading, state.success, timerStart]);

  // ---- Load Gold Balance and Completion Status ----
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Load gold balance
        const goldResponse = await api.get('/api/user-progress/gold-balance');
        dispatch({ 
          type: 'UPDATE_GOLD_BALANCE', 
          payload: goldResponse.data 
        });

        // Load completion status for this level
        const statusResponse = await api.get(
          `/api/user-progress/level-completion-status?category=${category}&level=${level}`
        );
        dispatch({ 
          type: 'SET_COMPLETION_STATUS', 
          payload: statusResponse.data 
        });

        // Load total levels for this category (to prevent navigating past last level)
        try {
          const completedMeta = await api.get(`/api/user-progress/completed-levels`, { params: { category } });
          const totalLevels = completedMeta?.data?.totalLevels;
          if (typeof totalLevels === 'number') {
            dispatch({ type: 'SET_TOTAL_LEVELS', payload: totalLevels });
          }
        } catch (metaErr) {
          console.warn('Could not load totalLevels metadata:', metaErr);
          // Fallback: fetch levels list (public endpoint) and derive total
          try {
            const levelsRes = await api.get(`/api/fpow/levels`, { params: { category } });
            if (Array.isArray(levelsRes?.data)) {
              dispatch({ type: 'SET_TOTAL_LEVELS', payload: levelsRes.data.length });
            }
          } catch (e2) {
            console.warn('Could not load levels for totalLevels fallback:', e2);
            // leave totalLevels as default 0
          }
        }

        console.log('💰 Gold balance loaded:', goldResponse.data.goldBalance);
        console.log('📊 Completion status loaded:', statusResponse.data);
      } catch (error) {
        console.warn('Failed to load game data:', error);
        // Set default values if API fails
        dispatch({ 
          type: 'UPDATE_GOLD_BALANCE', 
          payload: { goldBalance: 0, canAffordHint: false, hintCost: 25 }
        });
      }
    };

    if (category && level) {
      loadGameData();
    }
  }, [category, level]);

  // ---- Auto-hide Gold Animation ----
  useEffect(() => {
    if (state.showGoldAnimation) {
      const timer = setTimeout(() => {
        dispatch({ type: 'HIDE_GOLD_ANIMATION' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.showGoldAnimation]);

  // ---- Letter Input Handlers ----
  const handleLetterClick = (letter) => {
    if (state.disableInput || state.success || state.selectedLetters.length >= state.puzzle.answer.length) return;
    SoundManager.playEffect('button_press');
    dispatch({ type: 'SELECT_LETTER', letter });
  };
  const handleRemoveLetter = (idx) => {
    if (state.disableInput || state.success) return;
    SoundManager.playEffect('button_press');
    dispatch({ type: 'REMOVE_LETTER', index: idx });
  };

  // ---- Answer Checking ----
  useEffect(() => {
    if (!state.puzzle || state.selectedLetters.length !== state.puzzle.answer?.length || state.success) return;
    const guess = state.selectedLetters.map(l => l.value).join('');
    if (guess === state.puzzle.answer.toUpperCase()) handleCorrect();
    else handleWrong();
    // eslint-disable-next-line
  }, [state.selectedLetters]);

  // ---- Submit Progress to Backend and Local Storage ----
  async function handleCorrect() {
    console.log('🎯 Level completed! Starting progress submission...');
    
    // Don't show success immediately - wait for backend confirmation
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const cleanCategory = category ? category.trim() : "";
    const payload = {
      category: cleanCategory,
      level: Number(level),
      answer: state.puzzle.answer || "",
      usedHint: Boolean(state.hintShown)
    };
    
    console.log('📤 Submitting progress with payload:', payload);
    
    let backendSuccess = false;
    let errorMessage = null;
    let isCategoryComplete = false;
    
    // Try to submit to backend first
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Submit progress to backend
      const submitResponse = await api.post('/api/user-progress/submit', payload);
      console.log('✅ Backend submission successful:', submitResponse.data);
      
      // Validate backend response
      if (!submitResponse.data || !submitResponse.data.success) {
        throw new Error(submitResponse.data?.error || 'Backend returned unsuccessful response');
      }
      
      console.log('📊 Progress data from backend:', submitResponse.data.progress);
      
      // Get updated gold balance after submission
      const goldResponse = await api.get('/api/user-progress/gold-balance');
      
      // Get completion status for reward info
      const statusResponse = await api.get(
        `/api/user-progress/level-completion-status?category=${cleanCategory}&level=${Number(level)}`
      );
      
      const goldEarned = calculateGoldEarned(statusResponse.data.completionCount);
      // Update latest completion status in state
      dispatch({ type: 'SET_COMPLETION_STATUS', payload: statusResponse.data });
      // Determine if the category is now complete
      try {
        const completedList = Array.isArray(statusResponse.data.completedLevels) ? statusResponse.data.completedLevels : [];
        if (state.totalLevels && completedList.length >= state.totalLevels) {
          isCategoryComplete = true;
          dispatch({ type: 'SET_CATEGORY_COMPLETE', payload: true });
        }
      } catch (_) {}
      
      console.log('💰 Gold balance after completion:', goldResponse.data.goldBalance);
      console.log('🏆 Gold earned this completion:', goldEarned);
      console.log('📈 Completion count:', statusResponse.data.completionCount);
      
      // Update gold balance in state
      dispatch({
        type: 'UPDATE_GOLD_BALANCE',
        payload: {
          goldBalance: goldResponse.data.goldBalance,
          canAffordHint: goldResponse.data.canAffordHint,
          hintCost: goldResponse.data.hintCost
        }
      });
      
      // Show gold animation if gold was earned
      if (goldEarned > 0) {
        dispatch({ type: 'SHOW_GOLD_EARNED', payload: goldEarned });
      }
      
      backendSuccess = true;
      
    } catch (error) {
      console.error('❌ Backend submission failed:', error);
      
      // Determine error message based on error type
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 400) {
        // Handle validation errors from backend
        const backendError = error.response?.data?.error || 'Invalid data sent to server';
        errorMessage = `Validation error: ${backendError}`;
        console.error('🔍 Backend validation error:', error.response.data);
      } else if (error.response?.status >= 500) {
        // Handle server errors
        const backendError = error.response?.data?.error || 'Internal server error';
        errorMessage = `Server error: ${backendError}`;
        console.error('🔍 Backend server error:', error.response.data);
      } else if (error.message.includes('No authentication token')) {
        errorMessage = 'Not logged in. Progress saved locally only.';
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Network connection failed. Progress saved locally only.';
      } else {
        errorMessage = `Unexpected error: ${error.message}. Progress saved locally only.`;
      }
      
      console.warn('⚠️ Will save to localStorage as fallback');
    }
    
    // Always save to localStorage as backup (even if backend succeeded)
    try {
      saveCompletedLevel(category, Number(level));
      console.log('💾 Progress saved to localStorage');
    } catch (localError) {
      console.error('❌ Failed to save to localStorage:', localError);
    }
    // If backend did not succeed, determine category completion using local data
    if (!backendSuccess) {
      const localCompleted = getCompletedLevelsLocal(category);
      if (state.totalLevels && localCompleted.length >= state.totalLevels) {
        isCategoryComplete = true;
        dispatch({ type: 'SET_CATEGORY_COMPLETE', payload: true });
      }
    }
    
    // Stop loading and show success
    dispatch({ type: 'SET_SUCCESS', payload: true });
    dispatch({ type: 'SET_LOADING', payload: false });
    
    // Play completion sound effects
    if (isCategoryComplete) {
      SoundManager.playEffect('category_complete');
    } else {
      SoundManager.playEffect('level_complete');
    }
    
    // Play success animation with confetti (bigger celebration on category completion)
    if (isCategoryComplete) {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
      confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.6 } });
      confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.6 } });
    } else {
      confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
    }
    
    // Show appropriate success/warning message
    if (backendSuccess) {
      dispatch({
        type: 'SET_SNACKBAR',
        payload: { 
          open: true, 
          message: '🎉 Level completed! Progress saved to your account.', 
          severity: 'success' 
        }
      });
    } else {
      dispatch({
        type: 'SET_SNACKBAR',
        payload: { 
          open: true, 
          message: `⚠️ Level completed! ${errorMessage}`, 
          severity: 'warning' 
        }
      });
    }
  }

  async function handleWrong() {
    dispatch({ 
      type: 'INCREMENT_ATTEMPTS',
      category: category,
      level: level
    });
    // Play wrong answer sound effect
    SoundManager.playEffect('wrong_answer');
    for (let i = 0; i < state.selectedLetters.length; i++) dispatch({ type: 'REMOVE_LETTER', index: 0 });
    try {
      // The API base URL already includes '/api'
      await api.post('/api/user-progress/wrong', {
        category,
        level,
        answer: state.selectedLetters.map(l => l.value).join('')
      });
    } catch (e) {
      console.error('Failed to submit wrong answer:', e);
      // Save attempts to localStorage as fallback
      saveAttempts(category, level, state.attempts + 1);
    }
    dispatch({
      type: 'SET_SNACKBAR',
      payload: { open: true, message: 'Incorrect! Try again.', severity: 'error' }
    });
  }

  // ---- Local Storage Helper Functions ----
  // Load attempts data from localStorage
  const loadAttempts = (category, level) => {
    try {
      // Get user ID from localStorage or use anonymous if not available
      const userId = localStorage.getItem("userId") || "anonymous";
      const key = `fpow_attempts_${userId}_${category}_${level}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Could not load attempts from localStorage', e);
      return null;
    }
  };

  // Save attempts data to localStorage
  const saveAttempts = (category, level, attempts) => {
    try {
      // Get user ID from localStorage or use anonymous if not available
      const userId = localStorage.getItem("userId") || "anonymous";
      const key = `fpow_attempts_${userId}_${category}_${level}`;
      localStorage.setItem(key, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Could not save attempts to localStorage', e);
    }
  };

  // ---- Hint Handler ----
  const handleHint = async () => {
    // Don't show hint again if already shown
    if (state.hintShown) return;
    
    // Play hint sound effect
    SoundManager.playEffect('hint_buy');
    
    // Always show hint locally first for immediate feedback
    dispatch({ type: 'SET_HINT' });
    dispatch({
      type: 'SET_SNACKBAR',
      payload: { 
        open: true, 
        message: state.puzzle.hint ? `Hint: ${state.puzzle.hint}` : 'Hint used.',
        severity: 'info'
      }
    });
    
    // Track hint usage locally
    const attempts = loadAttempts(category, level) || { count: 0, hintsUsed: 0 };
    attempts.hintsUsed = (attempts.hintsUsed || 0) + 1;
    saveAttempts(category, level, attempts);
    
    // Then try to record it on the server if user is authenticated
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Make sure category and level are properly formatted
        const cleanCategory = category ? category.trim() : "";
        const levelNum = Number(level);
        
        console.log(`Sending hint usage: category=${cleanCategory}, level=${levelNum}`);
        
        // The API base URL already includes '/api'
        const resp = await api.post(`/api/user-progress/use-hint?category=${encodeURIComponent(cleanCategory)}&level=${levelNum}`);
        console.log('Hint usage recorded successfully', resp.data);

        // If backend returned newGoldBalance, update UI immediately
        const newGold = resp?.data?.newGoldBalance;
        const hintCost = resp?.data?.hintCost ?? state.hintCost ?? 25;
        if (typeof newGold === 'number') {
          dispatch({
            type: 'UPDATE_GOLD_BALANCE',
            payload: {
              goldBalance: newGold,
              hintCost,
              canAffordHint: newGold >= hintCost
            }
          });
        } else {
          // Fallback: re-fetch gold from server
          try {
            const goldResponse = await api.get('/api/user-progress/gold-balance');
            dispatch({ type: 'UPDATE_GOLD_BALANCE', payload: goldResponse.data });
          } catch (e) {
            console.warn('Could not refresh gold balance after hint', e);
          }
        }
      }
    } catch (error) {
      // Log error but don't affect user experience - hint is already shown
      console.warn("Could not record hint usage:", error.response?.data || error.message);
      // If insufficient gold, surface a warning and refresh displayed balance
      if (error.response?.status === 400 || error.response?.status === 500) {
        const errMsg = error.response?.data?.error || 'Failed to use hint on server';
        dispatch({
          type: 'SET_SNACKBAR',
          payload: { open: true, message: `Hint not deducted: ${errMsg}`, severity: 'warning' }
        });
        try {
          const goldResponse = await api.get('/api/user-progress/gold-balance');
          dispatch({ type: 'UPDATE_GOLD_BALANCE', payload: goldResponse.data });
        } catch (e) {}
      }
      // Continue with local hint display only
    }
  };

  // ---- Navigation ----
  // Go back to levels list
  const handleBack = () => {
    SoundManager.playEffect('button_press');
    navigate(`/student/classes/${id}/4pic1word/${category}`);
  };
  
  // Retry current level - use window.location for a full reset
  const handleReplay = () => {
    SoundManager.playEffect('button_press');
    // Force a complete reload of the component
    window.location.href = `/student/classes/${id}/4pic1word/${category}/level/${level}`;
  };
  
  // Go to next level with the correct URL structure
  const handleNext = () => {
    SoundManager.playEffect('button_press');
    const current = Number(level);
    if (state.totalLevels && current >= state.totalLevels) {
      // At or beyond last level – return to levels list
      return navigate(`/student/classes/${id}/4pic1word/${category}`);
    }
    return navigate(`/student/classes/${id}/4pic1word/${category}/level/${current + 1}`);
  };

  // ---- Renders ----
  if (state.loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{state.error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
    {/* Animated background elements */}
    <Box sx={{
      position: 'absolute',
      top: '10%',
      right: '5%',
      width: 200,
      height: 200,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      animation: `${slideInUp} 6s ease-in-out infinite`
    }} />
    
    <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          p: 2,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Button 
            onClick={handleBack} 
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Back to Levels
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Gold Balance Display */}
            <Chip 
              icon={<GoldIcon sx={{ color: '#FFD700 !important' }} />}
              label={state.goldBalance}
              onClick={() => {}}
              sx={{
                backgroundColor: 'rgba(255,215,0,0.2)',
                color: '#FFD700',
                fontWeight: 700,
                border: '1px solid rgba(255,215,0,0.3)',
                animation: state.showGoldAnimation ? `${goldPulse} 1s ease` : 'none',
                '& .MuiChip-icon': { color: '#FFD700 !important' }
              }}
            />
            
            <Chip 
              icon={<AccessTimeIcon />}
              label={`${Math.floor(elapsedTime / 1000)}s`}
              onClick={() => {}}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600
              }}
            />
            <Chip 
              icon={<StarIcon />}
              label={`Level ${level}`}
              onClick={() => {}}
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
                color: 'white',
                fontWeight: 700
              }}
            />
          </Box>
        </Box>
      </Fade>
      
      {/* Game Area */}
      <Zoom in timeout={800}>
        <Card sx={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 6,
          p: 4,
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.3)',
          position: 'relative',
          overflow: 'visible'
        }}>
          {/* Success Overlay */}
          {state.success && (
            <Fade in>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(139, 195, 74, 0.9) 100%)',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                animation: `${glow} 2s ease-in-out infinite`
              }}>
                <EmojiEventsIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
                <Typography variant="h3" color="white" fontWeight={800} textAlign="center" mb={1.5}>
                  {state.categoryComplete ? STRINGS.CATEGORY_COMPLETE_TITLE : STRINGS.LEVEL_COMPLETE_TITLE}
                </Typography>
                <Typography variant="h6" color="white" fontWeight={600} textAlign="center" mb={3}>
                  {state.categoryComplete 
                    ? formatters.categoryCompleteSubtext(category)
                    : formatters.levelCompleteSubtext()
                  }
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleNext}
                    sx={{
                      background: 'rgba(255,255,255,0.9)',
                      color: '#2e7d32',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        background: 'white',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {state.totalLevels && Number(level) >= state.totalLevels ? formatters.backToLevelsButton() : formatters.nextLevelButton()}
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={handleReplay}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Replay
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
          
          {/* Stats Bar */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            p: 2,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: 3,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                icon={<StarIcon />} 
                label={`Attempts: ${state.attempts}`} 
                onClick={() => {}}
                color="primary" 
                variant="outlined"
              />
              
              {state.hintShown && (
                <Chip 
                  icon={<LightbulbIcon />} 
                  label="Hint Used" 
                  onClick={() => {}}
                  color="warning" 
                  variant="filled"
                />
              )}
            </Box>
            
            <Button
              startIcon={<LightbulbIcon />}
              onClick={handleHint}
              variant="contained"
              color={state.canAffordHint && !state.hintShown ? "warning" : "inherit"}
              disabled={state.hintShown || state.success || !state.canAffordHint}
              sx={{
                fontWeight: 600,
                px: 3,
                backgroundColor: state.canAffordHint && !state.hintShown ? '#FF9800' : 'rgba(0,0,0,0.12)',
                color: state.canAffordHint && !state.hintShown ? 'white' : 'rgba(0,0,0,0.26)',
                '&:hover': {
                  backgroundColor: state.canAffordHint && !state.hintShown ? '#F57C00' : 'rgba(0,0,0,0.12)',
                },
                '&:disabled': {
                  opacity: 0.6,
                  backgroundColor: 'rgba(0,0,0,0.12)',
                  color: 'rgba(0,0,0,0.26)'
                }
              }}
              title={
                state.hintShown 
                  ? "Hint already used" 
                  : !state.canAffordHint 
                    ? `Need ${state.hintCost} gold (you have ${state.goldBalance})` 
                    : `Use hint for ${state.hintCost} gold`
              }
            >
              {state.hintShown 
                ? 'Hint Used' 
                : !state.canAffordHint 
                  ? `Need ${state.hintCost} Gold` 
                  : `Hint (${state.hintCost} Gold)`
              }
            </Button>
          </Box>
          
          {/* Image Grid */}
          console.log("ImageGrid props:", state.puzzle.imageUrls);
          <ImageGrid imageUrls={state.puzzle.imageUrls} isLoading={state.loading} />
          
          {/* Hint Display */}
          {state.hintShown && state.puzzle.hint && (
            <Slide in direction="up" timeout={500}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  border: '2px solid #2196f3'
                }}
              >
                💡 Hint: {state.puzzle.hint}
              </Alert>
            </Slide>
          )}
          
          {/* Answer Slots */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            gap: 2,
            flexWrap: 'wrap'
          }}>
            {Array.from({ length: state.puzzle.answer.length }).map((_, i) => (
              <Zoom in timeout={300 + (i * 50)} key={i}>
                <Paper
                  elevation={state.selectedLetters[i] ? 8 : 2}
                  sx={{
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 800,
                    borderRadius: 3,
                    cursor: state.selectedLetters[i] ? 'pointer' : 'default',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: state.selectedLetters[i] 
                      ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                      : 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                    color: state.selectedLetters[i] ? 'white' : '#666',
                    border: `3px solid ${state.selectedLetters[i] ? '#4caf50' : '#ddd'}`,
                    '&:hover': state.selectedLetters[i] ? {
                      transform: 'scale(1.1) rotate(5deg)',
                      boxShadow: '0 10px 25px rgba(76, 175, 80, 0.4)'
                    } : {}
                  }}
                  onClick={() => state.selectedLetters[i] && handleRemoveLetter(i)}
                >
                  {state.selectedLetters[i]?.value || ''}
                </Paper>
              </Zoom>
            ))}
          </Box>
          
          {/* Letter Selection */}
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 3,
            mb: 2
          }}>
            <Typography 
              variant="h6" 
              color="white" 
              textAlign="center" 
              mb={3}
              fontWeight={700}
            >
              Choose Your Letters
            </Typography>
            
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1.5
            }}>
              {state.availableLetters.map((letter, index) => (
                <Zoom in timeout={400 + (index * 30)} key={letter.id}>
                  <div>
                    <LetterButton
                      letter={letter.value}
                      onClick={() => handleLetterClick(letter)}
                      disabled={letter.used || state.selectedLetters.length >= state.puzzle.answer.length || state.success}
                      isSelected={false}
                      isCorrect={false}
                      isWrong={false}
                    />
                  </div>
                </Zoom>
              ))}
            </Box>
          </Box>
        </Card>
      </Zoom>
      
      {/* Floating Audio Controls */}
      <AudioControls />
      
      {/* Snackbar */}
      <Snackbar 
        open={state.snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => dispatch({ type: 'SET_SNACKBAR', payload: { ...state.snackbar, open: false } })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={state.snackbar.severity || 'info'} 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 600,
            minWidth: 300
          }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>

      {/* Gold Earned Animation */}
      {state.showGoldAnimation && state.goldEarned > 0 && (
        <Zoom in timeout={300}>
          <Box sx={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
              color: 'white',
              px: 3,
              py: 2,
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(255,215,0,0.5)',
              animation: `${goldPulse} 1s ease-in-out`,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <GoldIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                +{state.goldEarned}
              </Typography>
            </Card>
          </Box>
        </Zoom>
      )}
    </Container>
  </Box>
  );
};

export default GamePlay;
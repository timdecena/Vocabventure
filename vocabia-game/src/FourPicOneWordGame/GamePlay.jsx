import React, { useEffect, useReducer, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Button, Typography, CircularProgress,
  IconButton, Alert, Chip, Snackbar, Paper, Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  EmojiEvents as EmojiEventsIcon,
  Replay as ReplayIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
import api from '../api/api';

// ---- Image Grid ----
const ImageGrid = ({ imageUrls }) => {
  // Fixed dimensions for a professional game look
  return (
    <Box sx={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      mb: 3,
      padding: 1,
      backgroundColor: '#f8f8f8',
      borderRadius: 2,
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 1,
        aspectRatio: '1/1',
      }}>
        {/* Render exactly 4 boxes, using images where available */}
        {[0, 1, 2, 3].map(i => {
          const hasImage = i < imageUrls.length;
          return (
            <Box 
              key={i} 
              sx={{
                width: '100%',
                paddingTop: '100%', // This creates a perfect square regardless of content
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid #e0e0e0',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                backgroundColor: hasImage ? '#ffffff' : '#f0f0f0',
              }}
            >
              {hasImage && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={imageUrls[i]}
                    alt={`Clue ${i+1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ---- Styles ----
const containerStyles = { py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' };
const paperStyles = { p: 3, width: '100%', borderRadius: 3, boxShadow: 3 };
const imageStyles = { width: '100%', height: 140, objectFit: 'cover', borderRadius: 2, border: '1px solid #e0e0e0' };

// ---- Initial State ----
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
  snackbar: { open: false, message: '' }
};

// Load attempts from localStorage if available
const getStoredAttempts = (category, level) => {
  try {
    const key = `vocabVenture_${category}_${level}_attempts`;
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
    const key = `vocabVenture_${category}_${level}_attempts`;
    localStorage.setItem(key, attempts.toString());
  } catch (e) {
    console.error('Error saving attempts:', e);
  }
};

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
    // Get existing completed levels
    const storageKey = `vocabVenture_${category}_completed`;
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
    const highestKey = `vocabVenture_${category}_highest`;
    const currentHighest = localStorage.getItem(highestKey) || 0;
    
    if (Number(level) > Number(currentHighest)) {
      localStorage.setItem(highestKey, level.toString());
    }
  } catch (e) {
    console.error("Error updating highest level:", e);
  }
}

// ---- Main Component ----
const GamePlay = () => {
  const { category, level, id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerStart, setTimerStart] = useState(Date.now());

  // ---- Fetch Puzzle & Progress ----
  useEffect(() => {
    let isMounted = true;
    async function fetchPuzzle() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load stored attempts from localStorage
        const storedAttempts = getStoredAttempts(category, level);
        if (storedAttempts > 0) {
          dispatch({ type: 'SET_STORED_ATTEMPTS', payload: storedAttempts });
        }
        
        // The backend expects requests at /api/fpow/puzzle based on SecurityConfig
    const res = await api.get('/api/fpow/puzzle', { params: { category, level } });
        if (!res.data || !res.data.answer) throw new Error('No puzzle found');
        const imageUrls = [
          res.data.image1Url, res.data.image2Url, res.data.image3Url, res.data.image4Url
        ].filter(Boolean);
        const availableLetters = generateAvailableLetters(res.data.answer);
        if (isMounted) {
          dispatch({ type: 'SET_PUZZLE', payload: { ...res.data, imageUrls }, availableLetters });
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

  // ---- Letter Input Handlers ----
  const handleLetterClick = (letter) => {
    if (state.disableInput || state.success || state.selectedLetters.length >= state.puzzle.answer.length) return;
    dispatch({ type: 'SELECT_LETTER', letter });
  };
  const handleRemoveLetter = (idx) => {
    if (state.disableInput || state.success) return;
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
    dispatch({ type: 'SET_SUCCESS' });
    // Play success animation with confetti
    confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
    
    // Save progress to local storage first (this always works)
    saveCompletedLevel(category, Number(level));
    
    // Try to submit to backend if authenticated
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Ensure all fields match the ProgressSubmissionRequest DTO exactly
        // Make sure category is a string with no extra whitespace
        const cleanCategory = category ? category.trim() : "";
        
        const payload = {
          category: cleanCategory,
          level: Number(level),
          answer: state.puzzle.answer || "",
          usedHint: Boolean(state.hintShown)
        };
        
        // Log the payload for debugging
        console.log("Submitting progress with payload:", payload);
        
        // First try to get the current progress to check if it exists
        try {
          // The backend expects requests at /api/user-progress/submit based on SecurityConfig
          await api.post('/api/user-progress/submit', payload);
          console.log("Progress saved successfully");
        } catch (innerError) {
          // If we get a non-unique result error, try a different approach
          if (innerError.response?.data?.includes("unique result")) {
            console.warn("Handling non-unique result error by using a different endpoint");
            // Fall back to local storage only in this case
            // The backend needs to be fixed to handle this case properly
          } else {
            // Re-throw other errors
            throw innerError;
          }
        }
      }
    } catch (error) {
      // More detailed error logging
      console.warn("Could not save progress to server:", error.response?.data || error.message);
      // Continue with local storage only
    }
    
    dispatch({
      type: 'SET_SNACKBAR',
      payload: { open: true, message: 'Correct! Level completed.', severity: 'success' }
    });
  }

  async function handleWrong() {
    dispatch({ 
      type: 'INCREMENT_ATTEMPTS',
      category: category,
      level: level
    });
    for (let i = 0; i < state.selectedLetters.length; i++) dispatch({ type: 'REMOVE_LETTER', index: 0 });
    try {
      await api.post('/user-progress/wrong', {
        category,
        level,
        answer: state.selectedLetters.map(l => l.letter).join('')
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
      const key = `fpow_attempts_${category}_${level}`;
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
      const key = `fpow_attempts_${category}_${level}`;
      localStorage.setItem(key, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Could not save attempts to localStorage', e);
    }
  };

  // ---- Hint Handler ----
  const handleHint = async () => {
    // Don't show hint again if already shown
    if (state.hintShown) return;
    
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
        
        // Use query parameters as expected by the backend
        await api.post(`/user-progress/use-hint?category=${encodeURIComponent(cleanCategory)}&level=${levelNum}`);
        console.log('Hint usage recorded successfully');
      }
    } catch (error) {
      // Log error but don't affect user experience - hint is already shown
      console.warn("Could not record hint usage:", error.response?.data || error.message);
      // Continue with local hint display only
    }
  };

  // ---- Navigation ----
  // Go back to levels list
  const handleBack = () => navigate(`/student/classes/${id}/4pic1word/${category}`);
  
  // Retry current level - use window.location for a full reset
  const handleReplay = () => {
    // Force a complete reload of the component
    window.location.href = `/student/classes/${id}/4pic1word/${category}/level/${level}`;
  };
  
  // Go to next level with the correct URL structure
  const handleNext = () => navigate(`/student/classes/${id}/4pic1word/${category}/level/${Number(level) + 1}`);

  // ---- Renders ----
  if (state.loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (state.error) return (
    <Container maxWidth="sm" sx={containerStyles}>
      <Paper sx={paperStyles}>
        <Typography variant="h6" color="error" gutterBottom>Error</Typography>
        <Typography variant="body1" paragraph>{state.error}</Typography>
        <Button variant="contained" onClick={handleBack} startIcon={<ArrowBackIcon />}>Back to Levels</Button>
      </Paper>
    </Container>
  );

  return (
    <Container maxWidth="sm" sx={containerStyles}>
      <Paper sx={paperStyles}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Button variant="text" onClick={handleBack} startIcon={<ArrowBackIcon />}>Back</Button>
          <Chip label={state.puzzle.difficulty || 'EASY'}
            color={
              state.puzzle.difficulty === 'HARD' ? 'error'
                : state.puzzle.difficulty === 'MEDIUM' ? 'warning'
                : 'success'
            }
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>
        {/* Image Grid */}
        <ImageGrid imageUrls={state.puzzle.imageUrls} />
        {/* Stat Bar */}
        <Box display="flex" gap={2} mb={2}>
          <Chip icon={<StarIcon fontSize="small" />} label={`Attempts: ${state.attempts}`} variant="outlined" size="small" />
          {state.hintShown && <Chip icon={<LightbulbIcon />} label="Hint Used" color="warning" size="small" variant="outlined" />}
          <Chip icon={<AccessTimeIcon fontSize="small" />} label={`${Math.floor(elapsedTime / 1000)}s`} color="primary" size="small" variant="outlined" />
        </Box>
        {/* Hint */}
        {state.hintShown && state.puzzle.hint && (
          <Alert severity="info" sx={{ mb: 2 }}>Hint: {state.puzzle.hint}</Alert>
        )}
        {/* Answer Slots */}
        <Box display="flex" justifyContent="center" mb={2} gap={1.5} flexWrap="wrap">
          {Array.from({ length: state.puzzle.answer.length }).map((_, i) => (
            <Paper
              key={i}
              elevation={state.selectedLetters[i] ? 3 : 1}
              sx={{
                width: 46, height: 46, fontSize: 22, fontWeight: 700, borderRadius: 2.2,
                backgroundColor: state.selectedLetters[i] ? "#e0f2fe" : "#f5f5f5",
                border: state.selectedLetters[i] ? "2px solid #22d3ee" : "2px solid #ddd",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: state.selectedLetters[i] ? "pointer" : "default",
                transition: "all 0.15s"
              }}
              onClick={() => state.selectedLetters[i] && handleRemoveLetter(i)}
            >
              {state.selectedLetters[i]?.value || ""}
            </Paper>
          ))}
        </Box>
        {/* Letter Tiles */}
        <Box 
          display="flex" 
          flexWrap="wrap" 
          justifyContent="center"
          gap={2.5} 
          sx={{ 
            background: "#f1f5fd", 
            p: 3, 
            borderRadius: 3, 
            mb: 2, 
            boxShadow: 1 
          }}
        >
          {state.availableLetters.map(letter => (
            <Button
              key={letter.id}
              variant="contained"
              disableElevation
              onClick={() => handleLetterClick(letter)}
              disabled={letter.used || state.selectedLetters.length >= state.puzzle.answer.length || state.success}
              sx={{
                width: 52, 
                height: 52, 
                minWidth: 52,
                fontWeight: 900, 
                fontSize: 22, 
                borderRadius: 2,
                margin: '2px',
                background: letter.used ? '#c0c0c0' : "linear-gradient(135deg,#4756ff 60%,#38d7f9 100%)", 
                color: "white",
                letterSpacing: 0,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                "&:hover": { 
                  background: letter.used ? '#c0c0c0' : "linear-gradient(135deg,#2c3187 60%,#35bddf 100%)", 
                  transform: "translateY(-3px)",
                  boxShadow: '0 6px 10px rgba(0,0,0,0.15)'
                },
                "&:disabled": {
                  background: '#c0c0c0',
                  color: '#ffffff'
                }
              }}
            >
              {letter.value}
            </Button>
          ))}
        </Box>
        {/* Hint Button */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Button startIcon={<LightbulbIcon />} onClick={handleHint} variant="outlined" color="warning"
            size="small" disabled={state.hintShown || state.success}>Hint</Button>
        </Box>
        {/* Success */}
        {state.success && (
          <Box textAlign="center" mt={2}>
            <Alert severity="success" icon={<EmojiEventsIcon />} sx={{ mb: 2, fontWeight: 700, background: "#e0ffd9" }}>
              Correct! Level completed.
            </Alert>
            <Grid container spacing={2} justifyContent="center">
              <Grid xs={12} sm="auto">
                <Button variant="contained" color="success" onClick={handleNext} sx={{ borderRadius: 2, px: 5, py: 1.5 }} endIcon={<StarIcon />}>Next Level</Button>
              </Grid>
              <Grid xs={12} sm="auto">
                <Button variant="contained" color="primary" onClick={handleReplay} sx={{ borderRadius: 2, px: 5, py: 1.5 }} endIcon={<ReplayIcon />}>Replay Level</Button>
              </Grid>
              <Grid xs={12} sm="auto">
                <Button variant="contained" color="error" onClick={handleBack} sx={{ borderRadius: 2, px: 5, py: 1.5 }} endIcon={<ArrowBackIcon />}>Back to Levels</Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      <Snackbar open={state.snackbar.open} autoHideDuration={2200} onClose={() => dispatch({ type: 'SET_SNACKBAR', payload: { ...state.snackbar, open: false } })}
        message={state.snackbar.message} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Container>
  );
};

export default GamePlay;
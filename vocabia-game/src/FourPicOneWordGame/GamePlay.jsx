import React, { useState, useEffect, useReducer, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  EmojiObjects as EmojiObjectsIcon,
  EmojiEvents as EmojiEventsIcon,
  Replay as ReplayIcon,
  Star as StarIcon
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
import api from '../api/api';

// Styles
const containerStyles = {
  py: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const paperStyles = {
  p: 3,
  width: '100%',
  borderRadius: 3,
  boxShadow: 3
};

const imageStyles = {
  width: '100%',
  height: '140px',
  objectFit: 'cover',
  borderRadius: 2,
  border: '1px solid #e0e0e0'
};

// Initial state for the reducer
const initialState = {
  puzzle: {},
  loading: true,
  error: null,
  selectedLetters: [],
  availableLetters: [],
  attempts: 0,
  hintShown: false,
  success: false,
  disableInput: false,
  snackbar: {
    open: false,
    message: ''
  }
};

// Reducer function to handle all game state
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
        error: null
      };
    case 'SET_AVAILABLE_LETTERS':
      return { ...state, availableLetters: action.payload };
    case 'SELECT_LETTER':
      return { 
        ...state, 
        selectedLetters: [...state.selectedLetters, action.payload],
        availableLetters: state.availableLetters.filter(l => l.id !== action.payload.id)
      };
    case 'REMOVE_LETTER':
      const letterToReturn = state.selectedLetters[action.payload];
      return {
        ...state,
        selectedLetters: [
          ...state.selectedLetters.slice(0, action.payload),
          ...state.selectedLetters.slice(action.payload + 1)
        ],
        availableLetters: letterToReturn ? [...state.availableLetters, letterToReturn] : state.availableLetters
      };
    case 'INCREMENT_ATTEMPTS':
      return { ...state, attempts: state.attempts + 1 };
    case 'SET_HINT':
      return { ...state, hintShown: true };
    case 'SET_SUCCESS':
      return { ...state, success: true, disableInput: true };
    case 'SET_SNACKBAR':
      return { ...state, snackbar: action.payload };
    case 'DISABLE_INPUT':
      return { ...state, disableInput: action.payload };
    case 'RESET_GAME':
      return { 
        ...initialState, 
        puzzle: state.puzzle,
        loading: false,
        availableLetters: action.payload
      };
    default:
      return state;
  }
}

const GamePlay = () => {
  const { category, level } = useParams();
  const navigate = useNavigate();

  // Game state reducer
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Generate available letters for the puzzle
  const generateAvailableLetters = useCallback((answer) => {
    // Handle null or undefined answer
    if (!answer) {
      console.warn('Answer is null or undefined, using placeholder');
      return "PLACEHOLDER".split("").map((value, id) => ({ id, value }));
    }
    
    const letters = answer.split("");
    const extraLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      .split("")
      .filter(l => !letters.includes(l))
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    return [...letters, ...extraLetters]
      .sort(() => Math.random() - 0.5)
      .map((value, id) => ({ id, value }));
  }, []);

  // Load puzzle data
  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await api.get('/fpow/puzzle', {
          params: { category, level }
        });
        
        // Check if response.data and response.data.answer exist
        if (!response.data || !response.data.answer) {
          console.error('Invalid puzzle data received:', response.data);
          dispatch({ type: 'SET_ERROR', payload: 'Invalid puzzle data received. Please try again.' });
          return;
        }

        dispatch({ type: 'SET_PUZZLE', payload: response.data });
        
        // Generate available letters based on the answer
        const availableLetters = generateAvailableLetters(response.data.answer);
        dispatch({ type: 'SET_AVAILABLE_LETTERS', payload: availableLetters });
      } catch (error) {
        console.error('Error fetching puzzle:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load puzzle. Please try again.' });
      }
    };

    fetchPuzzle();
  }, [category, level, generateAvailableLetters]);

  // Check if answer is correct
  useEffect(() => {
    if (state.selectedLetters.length === state.puzzle.answer?.length && !state.success) {
      const userAnswer = state.selectedLetters.map(l => l.value).join('');
      if (userAnswer === state.puzzle.answer) {
        handleCorrectAnswer();
      } else {
        handleWrongAnswer();
      }
    }
  }, [state.selectedLetters, state.puzzle.answer, state.success]);

  // Handle letter selection
  const handleLetterClick = useCallback((letter) => {
    if (state.disableInput || state.success) return;
    
    if (state.selectedLetters.length < state.puzzle.answer.length) {
      dispatch({ type: 'SELECT_LETTER', payload: letter });
    }
  }, [state.selectedLetters.length, state.puzzle.answer, state.disableInput, state.success]);

  // Handle letter removal
  const handleRemoveLetter = useCallback((index) => {
    if (state.disableInput || state.success) return;
    dispatch({ type: 'REMOVE_LETTER', payload: index });
  }, [state.disableInput, state.success]);

  // Handle correct answer submission
  const handleCorrectAnswer = useCallback(async () => {
    try {
      dispatch({ type: 'DISABLE_INPUT', payload: true });
      dispatch({ type: 'SET_SUCCESS', payload: true });
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Submit progress to backend
      await api.post('/user-progress/submit', {
        category,
        level: parseInt(level),
        usedHint: state.hintShown
      });
      
      dispatch({
        type: 'SET_SNACKBAR',
        payload: {
          open: true,
          message: 'Level completed! XP earned!'
        }
      });
    } catch (error) {
      console.error('Error submitting progress:', error);
    }
  }, [category, level, state.hintShown]);

  // Handle wrong answer
  const handleWrongAnswer = useCallback(async () => {
    dispatch({ type: 'INCREMENT_ATTEMPTS' });
    
    // Reset selected letters
    state.selectedLetters.forEach((_, index) => {
      dispatch({ type: 'REMOVE_LETTER', payload: 0 });
    });
    
    dispatch({
      type: 'SET_SNACKBAR',
      payload: {
        open: true,
        message: 'Incorrect answer. Try again!'
      }
    });
    
    // Record wrong attempt in backend
    try {
      await api.post('/user-progress/wrong', {
        category,
        level: parseInt(level)
      });
    } catch (error) {
      console.error('Error recording wrong attempt:', error);
    }
  }, [category, level, state.selectedLetters]);

  // Handle hint usage
  const handleHint = useCallback(async () => {
    if (state.hintShown) return;
    
    try {
      await api.post('/user-progress/use-hint', {
        category,
        level: parseInt(level)
      });
      
      dispatch({ type: 'SET_HINT' });
    } catch (error) {
      console.error('Error using hint:', error);
      dispatch({
        type: 'SET_SNACKBAR',
        payload: {
          open: true,
          message: 'Failed to use hint. Please try again.'
        }
      });
    }
  }, [category, level, state.hintShown]);

  // Navigation handlers
  const handleBackToLevels = useCallback(() => {
    navigate(`/fpow/levels/${category}`);
  }, [navigate, category]);

  const handleNextLevel = useCallback(() => {
    navigate(`/fpow/play/${category}/${parseInt(level) + 1}`);
  }, [navigate, category, level]);

  const handleReplayLevel = useCallback(() => {
    const { puzzle } = state;
    dispatch({
      type: 'RESET_GAME',
      payload: generateAvailableLetters(puzzle.answer)
    });
  }, [state.puzzle, generateAvailableLetters]);

  // Memoized components for better performance
  const renderImageGrid = useMemo(() => (imageUrls) => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {imageUrls.map((url, index) => (
        <Grid item xs={6} key={index}>
          <Box
            component="img"
            src={url || '/images/placeholder.jpg'}
            alt={`Clue ${index + 1}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder.jpg';
            }}
            sx={imageStyles}
          />
        </Grid>
      ))}
    </Grid>
  ), []);

  const renderStatBar = useMemo(() => () => (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      mb={2} 
      p={1.5} 
      bgcolor="#f5f7ff" 
      borderRadius={2}
    >
      <Chip 
        label={`Level ${level}`} 
        color="primary" 
        size="small" 
        sx={{ fontWeight: 700 }} 
      />
      <Chip 
        label={`Attempts: ${state.attempts}`} 
        color="secondary" 
        size="small" 
        sx={{ fontWeight: 700 }} 
      />
    </Box>
  ), [level, state.attempts]);

  // Loading / error guards
  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (state.error && !state.puzzle) {
    return <Alert severity="error">{state.error}</Alert>;
  }

  if (!state.puzzle?.answer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xs" sx={containerStyles}>
        <Paper elevation={6} sx={paperStyles}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box>
              <Typography variant="h5" fontWeight={800} letterSpacing={1} color="#383c6b">
                Level {level}
              </Typography>
              <Chip
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                color="primary"
                size="small"
                sx={{ mt: 1, fontWeight: 700, letterSpacing: 1 }}
              />
            </Box>
            <Button
              type="button"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToLevels}
              sx={{ borderRadius: 2, minWidth: 0, px: 2 }}
            >
              Levels
            </Button>
          </Box>
          {renderStatBar()}
          {/* 2x2 image grid */}
          {renderImageGrid([
            state.puzzle.image1Url,
            state.puzzle.image2Url,
            state.puzzle.image3Url,
            state.puzzle.image4Url
          ])}
          <Box mt={1} mb={1} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="#595e7d" fontWeight={600}>Attempts: {state.attempts}</Typography>
            {!state.hintShown && (
              <Button
                type="button"
                color="secondary"
                startIcon={<EmojiObjectsIcon />}
                sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                onClick={handleHint}
                disabled={state.hintShown}
              >
                Hint
              </Button>
            )}
          </Box>
          {state.hintShown && state.puzzle.hint && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                borderRadius: 2,
                fontWeight: 600,
                background: "#fffbe7"
              }}
              icon={<EmojiObjectsIcon color="warning" />}
            >
              <span style={{ color: "#6e5b09" }}>{state.puzzle.hint}</span>
            </Alert>
          )}
          {/* Answer slots */}
          <Box display="flex" justifyContent="center" mb={2} gap={1.5} flexWrap="wrap">
            {Array.from({ length: state.puzzle.answer.length }).map((_, i) => (
              <Paper
                key={i}
                elevation={state.selectedLetters[i] ? 3 : 1}
                sx={{
                  width: 46,
                  height: 46,
                  backgroundColor: state.selectedLetters[i] ? "#e0f2fe" : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 22,
                  borderRadius: 2.2,
                  border: state.selectedLetters[i] ? "2px solid #22d3ee" : "2px solid #ddd",
                  cursor: state.selectedLetters[i] ? "pointer" : "default",
                  transition: "all 0.15s"
                }}
                onClick={() => state.selectedLetters[i] && handleRemoveLetter(i)}
              >
                {state.selectedLetters[i] ? state.selectedLetters[i].value : ""}
              </Paper>
            ))}
          </Box>
          {/* Letter tiles */}
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(48px, 1fr))"
            gap={1.2}
            sx={{
              background: "#f1f5fd",
              p: 2,
              borderRadius: 3,
              mb: 2,
              boxShadow: 1
            }}
          >
            {state.availableLetters.map(letter => (
              <Button
                key={letter.id}
                type="button"
                variant="contained"
                disableElevation
                onClick={() => handleLetterClick(letter)}
                disabled={state.selectedLetters.length >= state.puzzle.answer.length || state.success}
                sx={{
                  width: 48,
                  height: 48,
                  fontWeight: 900,
                  fontSize: 21,
                  borderRadius: 3,
                  background: "linear-gradient(135deg,#4756ff 60%,#38d7f9 100%)",
                  color: "white",
                  letterSpacing: 1.5,
                  boxShadow: "0 2px 10px rgba(71,86,255,0.09)",
                  "&:hover": {
                    background: "linear-gradient(135deg,#2c3187 60%,#35bddf 100%)",
                    transform: "scale(1.12)"
                  }
                }}
              >
                {letter.value}
              </Button>
            ))}
          </Box>
          {/* Error message */}
          {state.error && <Alert severity="error" sx={{ mb: 1 }}>{state.error}</Alert>}
          {/* Success */}
          {state.success && (
            <Box textAlign="center" mt={2}>
              <Alert
                severity="success"
                icon={<EmojiEventsIcon />}
                sx={{ mb: 2, fontWeight: 700, background: "#e0ffd9" }}
              >
                Correct! Good job!
              </Alert>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    type="button"
                    variant="contained"
                    color="success"
                    onClick={handleNextLevel}
                    sx={{ borderRadius: 2, px: 5, py: 1.5, fontWeight: 700, fontSize: 16 }}
                    endIcon={<StarIcon />}
                  >
                    Next Level
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={handleReplayLevel}
                    sx={{ borderRadius: 2, px: 5, py: 1.5, fontWeight: 700, fontSize: 16 }}
                    endIcon={<ReplayIcon />}
                  >
                    Replay Level
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="button"
                    variant="contained"
                    color="error"
                    onClick={handleBackToLevels}
                    sx={{ borderRadius: 2, px: 5, py: 1.5, fontWeight: 700, fontSize: 16 }}
                    endIcon={<ArrowBackIcon />}
                  >
                    Back to Levels
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>
      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={2200}
        onClose={() => dispatch({ type: 'SET_SNACKBAR', payload: { ...state.snackbar, open: false } })}
        message={state.snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default GamePlay;

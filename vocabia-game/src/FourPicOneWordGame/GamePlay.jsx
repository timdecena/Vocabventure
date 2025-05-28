import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Typography, Box, Button, CircularProgress, Breadcrumbs, Link, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Stack
} from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NextPlanIcon from "@mui/icons-material/NextPlan";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import axios from "axios";

const SERVER_URL = "http://localhost:8080";
const GAME_TYPE = "FOUR_PIC_ONE_WORD";

export default function GamePlay() {
  const { category, level } = useParams();
  const navigate = useNavigate();

  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [letterChoices, setLetterChoices] = useState([]);
  const [userAnswerArr, setUserAnswerArr] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [correct, setCorrect] = useState(false);
  const [showImage, setShowImage] = useState(null);
  const [levels, setLevels] = useState([]);
  const [userProgress, setUserProgress] = useState(null);

  // Load current puzzle and all levels for navigation
  useEffect(() => {
    const fetchPuzzle = async () => {
      setLoading(true);
      setFeedback("");
      setCorrect(false);

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const puzzleRes = await axios.get(`${SERVER_URL}/api/4pic1word-assets/categories/${category}/levels/${level}`, {
          headers, withCredentials: true
        });
        setPuzzle(puzzleRes.data);
        setLetterChoices(puzzleRes.data.letterTiles || []);
        setUserAnswerArr(Array(puzzleRes.data.answer.length).fill(""));
        setUsedIndexes([]);
      } catch (err) {
        setFeedback("Failed to load puzzle.");
      }

      // Levels for navigation
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const levelsRes = await axios.get(`${SERVER_URL}/api/4pic1word-assets/categories/${category}/levels`, {
          headers, withCredentials: true
        });
        setLevels(levelsRes.data);
      } catch (err) {}
      setLoading(false);
      fetchProgress(); // also fetch latest progress on load
    };
    fetchPuzzle();
    // eslint-disable-next-line
  }, [category, level]);

  // Fetch user progress
  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(
        `${SERVER_URL}/api/game/progress?gameType=${GAME_TYPE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserProgress(res.data);
    } catch {}
  };

  // Auto-check answer
  useEffect(() => {
    if (!puzzle) return;
    const userAnswer = userAnswerArr.join("");
    if (userAnswer.length === puzzle.answer.length) {
      if (userAnswer.toLowerCase() === puzzle.answer.toLowerCase()) {
        setCorrect(true);
        setFeedback("✅ Correct!");
        submitProgress();
      } else {
        setCorrect(false);
        setFeedback("❌ Try again!");
      }
    } else {
      setCorrect(false);
      setFeedback("");
    }
    // eslint-disable-next-line
  }, [userAnswerArr, puzzle]);

  function pickLetter(letter, idx) {
    if (correct) return;
    const emptyIdx = userAnswerArr.findIndex(l => l === "");
    if (emptyIdx === -1) return;
    const answerArrCopy = [...userAnswerArr];
    answerArrCopy[emptyIdx] = letter;
    setUserAnswerArr(answerArrCopy);
    setUsedIndexes([...usedIndexes, idx]);
  }

  function removeLetter(slotIdx) {
    if (userAnswerArr[slotIdx] === "") return;
    const newArr = [...userAnswerArr];
    const removedLetter = newArr[slotIdx];
    newArr[slotIdx] = "";
    const newUsed = [...usedIndexes];
    for (let i = newUsed.length - 1; i >= 0; i--) {
      if (letterChoices[newUsed[i]] === removedLetter) {
        newUsed.splice(i, 1);
        break;
      }
    }
    setUserAnswerArr(newArr);
    setUsedIndexes(newUsed);
  }

  // SUBMIT progress and fetch XP/level live
  function submitProgress() {
    const token = localStorage.getItem("token");
    if (!puzzle?.id || !token) return;
    axios.post(
      `${SERVER_URL}/api/game/submit`,
      {
        puzzleId: puzzle.id,
        gameType: GAME_TYPE,
        answer: puzzle.answer,
        timeTaken: 0,
        hintsUsed: 0,
        category,
        level
      },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => {
      // update global progress
      fetchProgress();
      // Signal to LevelList to refresh on return
      localStorage.setItem("game-completed", "yes");
    }).catch(() => {});
  }

  function handleNext() {
    if (!levels || levels.length === 0) {
      navigate(`/4pic1word/levels/${category}`);
      return;
    }
    const idx = levels.indexOf(level);
    if (idx >= 0 && idx + 1 < levels.length) {
      navigate(`/4pic1word/play/${category}/${levels[idx + 1]}`);
    } else {
      navigate(`/4pic1word/levels/${category}`);
    }
  }

  function requestHint() {
    if (puzzle && puzzle.hint) {
      setHintMessage(puzzle.hint);
      setShowHint(true);
    } else {
      setHintMessage("No hint available.");
      setShowHint(true);
    }
  }

  if (loading || !puzzle) {
    return (
      <Container maxWidth="xs" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#00ffaa" }} />
        <Typography sx={{ mt: 2, color: "#222" }}>Loading puzzle...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, color: "#00ffaa", fontSize: "0.85rem" }}>
        <Link href="#" underline="hover" color="#00ffaa" onClick={() => navigate(`/4pic1word/levels/${category}`)}>Levels</Link>
        <Typography color="#00ffaa" textTransform="capitalize">Level {level.replace(/level/i, "")}</Typography>
      </Breadcrumbs>

      {/* Live progress bar for this game (XP, Level, Streak) */}
      {userProgress && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ minWidth: 80 }}>
              <Typography variant="caption" sx={{ color: "#00ffaa" }}>Level {userProgress.level}</Typography>
              <LinearProgress
                variant="determinate"
                value={userProgress.expToNextLevel !== 0 ? ((userProgress.exp / (userProgress.exp + userProgress.expToNextLevel)) * 100) : 100}
                sx={{ height: 8, borderRadius: 4, background: "#eee", mt: 0.5,
                  '& .MuiLinearProgress-bar': { backgroundColor: "#00ffaa" }
                }}
              />
              <Typography variant="caption" sx={{ color: "#00ffaa" }}>{userProgress.exp} XP</Typography>
            </Box>
            <Box>
              <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 22, mb: -0.5, mr: 0.2 }} />
              <Typography variant="caption" sx={{ color: "#00ffaa" }}>
                Streak: {userProgress.currentStreak || 0}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      <Box sx={{
        background: "#23273b", borderRadius: 4, p: 2.5, mb: 2,
        boxShadow: "0 4px 16px #191b1f22", border: "2px solid #242851"
      }}>
        {/* 2x2 grid */}
        <Box sx={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1, mb: 2, width: "100%"
        }}>
          {puzzle.images.map((img, i) => (
            <Paper key={i} elevation={3}
              sx={{
                background: "#222a", borderRadius: 2, overflow: "hidden", aspectRatio: "1 / 1", width: "100%",
                minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative"
              }}
              onClick={() => setShowImage(SERVER_URL + img)}
            >
              <img
                src={SERVER_URL + img}
                alt={`Pic ${i + 1}`}
                style={{ width: "100%", height: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/120?text=No+Image'; }}
              />
              <ZoomInIcon
                sx={{
                  position: "absolute", bottom: 8, right: 8, color: "#fff",
                  background: "#00ffaa88", borderRadius: "50%", p: 0.5, fontSize: 22,
                }}
              />
            </Paper>
          ))}
        </Box>
        <Dialog open={!!showImage} onClose={() => setShowImage(null)} maxWidth="md">
          <DialogContent sx={{ p: 0, background: "#191b1f" }}>
            <img
              src={showImage}
              alt="Enlarged"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 12
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowImage(null)} color="info">Close</Button>
          </DialogActions>
        </Dialog>
        {/* Hint section */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="outlined"
            color="info"
            startIcon={<LightbulbIcon />}
            onClick={requestHint}
            sx={{ mb: 1 }}
          >
            Show Hint
          </Button>
        </Box>
        <Dialog open={showHint} onClose={() => setShowHint(false)}>
          <DialogTitle>Hint</DialogTitle>
          <DialogContent>
            <Typography>{hintMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHint(false)} color="info">Close</Button>
          </DialogActions>
        </Dialog>
        {/* Answer slots */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1 }}>
          {userAnswerArr.map((letter, idx) => (
            <Paper
              key={idx}
              elevation={3}
              onClick={() => removeLetter(idx)}
              sx={{
                width: 44, height: 44, m: 0.25,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "bold", fontSize: "1.5rem",
                border: letter ? "2px solid #4caf50" : "2px solid #5a6470",
                borderRadius: 2,
                backgroundColor: letter ? "#eafff1" : "#f3f7ff",
                cursor: letter ? "pointer" : "default",
                transition: "all 0.15s"
              }}
            >
              {letter}
            </Paper>
          ))}
        </Box>
        {/* Letter choices */}
        <Box sx={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1, mb: 2
        }}>
          {letterChoices.map((letter, idx) => (
            <Paper
              elevation={4}
              key={idx}
              onClick={() => !usedIndexes.includes(idx) && !correct && pickLetter(letter, idx)}
              sx={{
                width: 44, height: 44, m: "2px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "bold", fontSize: "1.3rem",
                color: "#14213d",
                backgroundColor: usedIndexes.includes(idx) ? "#d3d3d3" : "#fff",
                cursor: usedIndexes.includes(idx) || correct ? "not-allowed" : "pointer",
                border: "2px solid #ccd6f6",
                borderRadius: 2,
                opacity: usedIndexes.includes(idx) || correct ? 0.5 : 1,
                transition: "all 0.15s"
              }}
            >
              {letter}
            </Paper>
          ))}
        </Box>
        {/* Feedback */}
        {feedback && (
          <Box sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: correct ? '#e8f5e9' : '#ffebee',
            mb: 2,
            mt: 1,
            textAlign: "center"
          }}>
            <Typography sx={{
              color: correct ? '#2e7d32' : '#c62828',
              fontWeight: 'bold'
            }}>
              {feedback}
            </Typography>
            {correct && (
              <Button
                variant="contained"
                color="success"
                startIcon={<NextPlanIcon />}
                onClick={handleNext}
                sx={{ mt: 2 }}
              >
                Next
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
}

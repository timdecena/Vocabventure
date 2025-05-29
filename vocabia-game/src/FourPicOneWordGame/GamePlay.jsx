import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Typography, Box, Button, CircularProgress, Breadcrumbs, Link, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    async function fetchPuzzle() {
      setLoading(true);
      setFeedback("");
      try {
        const res = await axios.get(`${SERVER_URL}/api/4pic1word-assets/categories/${category}/levels/${level}`);
        setPuzzle(res.data);
        setLetterChoices(res.data.letterTiles || []);
        setUserAnswerArr(Array(res.data.answer.length).fill(""));
        setUsedIndexes([]);
      } catch {
        setFeedback("Failed to load puzzle.");
      }
      setLoading(false);
    }
    fetchPuzzle();
  }, [category, level]);

  // Answer logic
  useEffect(() => {
    if (!puzzle) return;
    const userAnswer = userAnswerArr.join("");
    if (userAnswer.length === puzzle.answer.length) {
      if (userAnswer.toUpperCase() === puzzle.answer.toUpperCase()) {
        setFeedback("✅ Correct! XP awarded.");
        submitAnswer();
      } else {
        setFeedback("❌ Incorrect! Try again.");
      }
    } else {
      setFeedback("");
    }
    // eslint-disable-next-line
  }, [userAnswerArr, puzzle]);

  function pickLetter(letter, idx) {
    if (!puzzle || feedback.startsWith("✅")) return;
    const emptyIdx = userAnswerArr.findIndex(l => l === "");
    if (emptyIdx === -1) return;
    const arr = [...userAnswerArr];
    arr[emptyIdx] = letter;
    setUserAnswerArr(arr);
    setUsedIndexes([...usedIndexes, idx]);
  }

  function removeLetter(idx) {
    if (!userAnswerArr[idx]) return;
    const arr = [...userAnswerArr];
    const removedLetter = arr[idx];
    arr[idx] = "";
    const newUsed = [...usedIndexes];
    for (let i = newUsed.length - 1; i >= 0; i--) {
      if (letterChoices[newUsed[i]] === removedLetter) {
        newUsed.splice(i, 1);
        break;
      }
    }
    setUserAnswerArr(arr);
    setUsedIndexes(newUsed);
  }

  async function submitAnswer() {
    if (!puzzle?.id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${SERVER_URL}/api/4pic1word/progress/submit`,
        {},
        {
          params: {
            puzzleId: puzzle.id,
            answer: puzzle.answer,
            timeTaken: 0,
            hintsUsed: 0
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // XP/Progress handled on backend, UI just shows feedback.
    } catch {
      // Optional: set feedback for fail
    }
  }

  if (loading || !puzzle) {
    return (
      <Container maxWidth="xs" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress color="secondary" />
        <Typography sx={{ mt: 2 }}>Loading puzzle...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate(`/4pic1word/levels/${category}`)} style={{ cursor: "pointer" }}>
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          Levels
        </Link>
        <Typography color="text.primary">Level {level.replace(/level/i, "")}</Typography>
      </Breadcrumbs>

      {/* Images 2x2 */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2 }}>
        {puzzle.images.map((img, idx) => (
          <Paper key={idx} elevation={3}
            sx={{
              background: "#222a", borderRadius: 2, overflow: "hidden", aspectRatio: "1 / 1", width: "100%",
              minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            <img
              src={SERVER_URL + img}
              alt={`Pic ${idx + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { e.target.src = 'https://via.placeholder.com/120?text=No+Image'; }}
            />
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<HelpOutlineIcon />}
          onClick={() => setHintOpen(true)}
        >
          Show Hint
        </Button>
      </Box>

      <Dialog open={hintOpen} onClose={() => setHintOpen(false)}>
        <DialogTitle>Hint</DialogTitle>
        <DialogContent>
          <Typography>{puzzle.hint || "No hint available."}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHintOpen(false)}>Close</Button>
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
          >{letter}</Paper>
        ))}
      </Box>

      {/* Letter choices */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1, mb: 2 }}>
        {letterChoices.map((letter, idx) => (
          <Paper
            elevation={4}
            key={idx}
            onClick={() => !usedIndexes.includes(idx) && !feedback.startsWith("✅") && pickLetter(letter, idx)}
            sx={{
              width: 44, height: 44, m: "2px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "bold", fontSize: "1.3rem",
              color: "#14213d",
              backgroundColor: usedIndexes.includes(idx) ? "#d3d3d3" : "#fff",
              cursor: usedIndexes.includes(idx) || feedback.startsWith("✅") ? "not-allowed" : "pointer",
              border: "2px solid #ccd6f6",
              borderRadius: 2,
              opacity: usedIndexes.includes(idx) || feedback.startsWith("✅") ? 0.5 : 1,
              transition: "all 0.15s"
            }}
          >{letter}</Paper>
        ))}
      </Box>

      {feedback && (
        <Box sx={{
          p: 2, borderRadius: 2,
          backgroundColor: feedback.startsWith("✅") ? '#e8f5e9' : '#ffebee',
          mb: 2, textAlign: "center"
        }}>
          <Typography sx={{
            color: feedback.startsWith("✅") ? '#2e7d32' : '#c62828',
            fontWeight: 'bold'
          }}>{feedback}</Typography>
          {feedback.startsWith("✅") && (
            <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={() => navigate(`/4pic1word/levels/${category}`)}>
              Back to Levels
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
}

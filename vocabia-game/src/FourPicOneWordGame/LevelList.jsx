import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container, Typography, Grid, Card, CardContent, Box, Button, CircularProgress,
  Breadcrumbs, Link, LinearProgress, Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GamesIcon from "@mui/icons-material/Games";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TimerIcon from "@mui/icons-material/Timer";
import axios from "axios";

const SERVER_URL = "http://localhost:8080";
const GAME_TYPE = "FOUR_PIC_ONE_WORD";

const authAxios = axios.create({
  baseURL: SERVER_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});
authAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default function LevelList() {
  const { category } = useParams();
  const location = useLocation();
  const [levels, setLevels] = useState([]);
  const [levelProgress, setLevelProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProgress, setUserProgress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    function onStorage(event) {
      if (event.key === "game-completed") {
        fetchData();
        localStorage.removeItem("game-completed");
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line
  }, [category, location.key]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Fetch levels
      const levelsResponse = await axios.get(
        `${SERVER_URL}/api/4pic1word-assets/categories/${category}/levels`,
        { headers, withCredentials: true }
      );
      const levelsData = levelsResponse.data;
      setLevels(levelsData);

      // Fetch user progress only if logged in
      if (token) {
        try {
          // User overall progress
          const progressResponse = await authAxios.get(`/api/game/progress?gameType=${GAME_TYPE}`);
          setUserProgress(progressResponse.data);

          // Per-level progress
          const progressPromises = levelsData.map(async (level) => {
            try {
              const resp = await authAxios.get(
                `/api/game/level-progress?gameType=${GAME_TYPE}&category=${category}&level=${level}`
              );
              return { level, progress: resp.data };
            } catch {
              return { level, progress: null };
            }
          });
          const progressResults = await Promise.all(progressPromises);
          const progressMap = {};
          progressResults.forEach(({ level, progress }) => { progressMap[level] = progress; });
          setLevelProgress(progressMap);
        } catch (progressErr) {
          setUserProgress(null);
          setLevelProgress({});
        }
      } else {
        setUserProgress(null);
        setLevelProgress({});
      }
    } catch (err) {
      setError("Failed to load levels. Please check your login.");
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }

  const isLevelUnlocked = (idx) => {
    if (idx === 0) return true;
    const prevLevel = levels[idx - 1];
    return levelProgress[prevLevel]?.completed;
  };

  if (loading) return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
      <CircularProgress sx={{ color: "#00ffaa" }} />
      <Typography sx={{ mt: 2, color: "#222" }}>Loading levels...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, color: "#00ffaa" }}>
        <Link href="#" underline="hover" color="#00ffaa" onClick={() => navigate("/4pic1word")}>Categories</Link>
        <Typography color="#00ffaa" textTransform="capitalize">{category}</Typography>
      </Breadcrumbs>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/4pic1word")}
          sx={{ color: "#00ffaa", mr: 2 }}
          variant="outlined"
        >Back</Button>
        <Typography variant="h4" sx={{ color: "#222", textTransform: "capitalize" }}>
          <GamesIcon sx={{ fontSize: 30, mr: 1 }} />
          {category} Levels
        </Typography>
      </Box>

      {userProgress && (
        <Card sx={{ mb: 4, background: "rgba(20, 20, 60, 0.9)", borderRadius: 2, border: "2px solid #00ffaa33" }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ color: "#00ffaa", mb: 1 }}>Progress</Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={levels.length === 0 ? 0 : (userProgress.completedLevels / levels.length) * 100}
                      sx={{
                        height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.1)",
                        '& .MuiLinearProgress-bar': { backgroundColor: "#00ffaa" }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#fff", minWidth: 45 }}>
                    {userProgress.completedLevels || 0}/{levels.length}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="subtitle1" sx={{ color: "#00ffaa", mb: 1 }}>Level</Typography>
                <Typography variant="h6" sx={{ color: "#fff" }}>{userProgress.level || 1}</Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" sx={{ color: "#ffd700" }}>
                    {userProgress.exp || 0} XP
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="subtitle1" sx={{ color: "#00ffaa", mb: 1 }}>Streak</Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ color: "#fff" }}>
                    {userProgress.currentStreak || 0} days
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Best: {userProgress.bestStreak || 0} days
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {error && <Typography sx={{ color: "red" }}>{error}</Typography>}
      <Grid container spacing={3}>
        {levels.length === 0 && (
          <Grid item xs={12}>
            <Typography sx={{ color: "#222", textAlign: "center" }}>
              No levels found in this category!
            </Typography>
          </Grid>
        )}
        {levels.map((level, idx) => {
          const progress = levelProgress[level] || {};
          const isCompleted = progress.completed || false;
          const expEarned = progress.expEarned || 0;
          const fastestTime = progress.fastestTime;
          const isLocked = !isLevelUnlocked(idx);

          return (
            <Grid item xs={6} sm={4} md={3} key={level}>
              <Card
                sx={{
                  background: isCompleted ? "rgba(30, 80, 30, 0.85)" : isLocked ? "rgba(80, 30, 30, 0.85)" : "rgba(30, 30, 80, 0.85)",
                  borderRadius: 2,
                  border: `2px solid ${isCompleted ? "#00ffaa" : isLocked ? "#ff5252" : "#00ffaa33"}`,
                  textAlign: "center",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  position: "relative",
                  opacity: isLocked ? 0.7 : 1,
                  "&:hover": { borderColor: isLocked ? "#ff5252" : "#00ffaa" }
                }}
                onClick={() => !isLocked && navigate(`/4pic1word/play/${category}/${level}`)}
              >
                {isCompleted && (
                  <Box sx={{
                    position: "absolute", top: -10, right: -10, backgroundColor: "#00ffaa",
                    borderRadius: "50%", width: 24, height: 24, display: "flex",
                    alignItems: "center", justifyContent: "center"
                  }}>
                    <CheckCircleIcon sx={{ color: "#fff", fontSize: 20 }} />
                  </Box>
                )}
                {isLocked && (
                  <Box sx={{
                    position: "absolute", top: -10, right: -10, backgroundColor: "#ff5252",
                    borderRadius: "50%", width: 24, height: 24, display: "flex",
                    alignItems: "center", justifyContent: "center"
                  }}>
                    <LockIcon sx={{ color: "#fff", fontSize: 16 }} />
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" sx={{ color: "#fff" }}>
                    Level {level.replace(/level/i, "")}
                  </Typography>
                  {isCompleted ? (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 0.5 }}>
                        <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: "#ffd700" }}>{expEarned} XP</Typography>
                      </Box>
                      {fastestTime && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TimerIcon sx={{ color: "#00ffaa", fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2" sx={{ color: "#00ffaa" }}>
                            {Math.floor(fastestTime / 60)}:{(fastestTime % 60).toString().padStart(2, '0')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Chip
                      label={isLocked ? "Locked" : "Start"}
                      size="small"
                      sx={{
                        mt: 1,
                        backgroundColor: isLocked ? "#ff525233" : "#00ffaa33",
                        color: isLocked ? "#ff5252" : "#00ffaa",
                        fontWeight: "bold"
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

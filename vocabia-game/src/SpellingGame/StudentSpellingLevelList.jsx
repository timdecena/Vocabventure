import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { styled } from "@mui/system";
import { 
  Typography, 
  Button, 
  CircularProgress,
  Card,
  CardContent,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Alert,
  Fade,
  Zoom,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import { 
  CheckCircle, 
  LockOpen, 
  Search, 
  FilterList,
  Star,
  EmojiEvents,
  PlayArrow,
  School,
  TrendingUp,
  VisibilityOff,
  Visibility,
  RestoreFromTrash
} from "@mui/icons-material";

// Styled Components
const GameContainer = styled("div")({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "24px",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
    `,
  }
});

const ContentContainer = styled("div")({
  maxWidth: 1200,
  margin: "0 auto",
  position: "relative",
  zIndex: 2,
});

const HeaderCard = styled(Card)({
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  padding: "32px",
  marginBottom: "32px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
});

const LevelCard = styled(Card)(({ completed, disabled, removed }) => ({
  background: removed 
    ? "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)"
    : completed 
    ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
    : disabled
    ? "linear-gradient(135deg, #9e9e9e 0%, #757575 100%)"
    : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  borderRadius: "20px",
  padding: "8px",
  marginBottom: "20px",
  boxShadow: removed
    ? "0 8px 32px rgba(255, 167, 38, 0.3)"
    : completed 
    ? "0 8px 32px rgba(76, 175, 80, 0.3)"
    : disabled
    ? "0 4px 16px rgba(0, 0, 0, 0.1)"
    : "0 8px 32px rgba(0, 0, 0, 0.15)",
  border: removed
    ? "2px solid rgba(255, 167, 38, 0.3)"
    : completed 
    ? "2px solid rgba(76, 175, 80, 0.3)"
    : disabled
    ? "2px solid rgba(158, 158, 158, 0.3)"
    : "2px solid rgba(255, 255, 255, 0.5)",
  transition: "all 0.3s ease",
  cursor: disabled ? "not-allowed" : "pointer",
  "&:hover": {
    transform: disabled ? "none" : "translateY(-4px)",
    boxShadow: removed
      ? "0 12px 40px rgba(255, 167, 38, 0.4)"
      : completed 
      ? "0 12px 40px rgba(76, 175, 80, 0.4)"
      : disabled
      ? "0 4px 16px rgba(0, 0, 0, 0.1)"
      : "0 12px 40px rgba(0, 0, 0, 0.2)",
  },
}));

const LevelCardContent = styled(CardContent)(({ completed, removed }) => ({
  padding: "24px !important",
  background: removed ? "rgba(255, 255, 255, 0.95)" : completed ? "transparent" : "rgba(255, 255, 255, 0.9)",
  borderRadius: "16px",
  margin: "4px",
  color: removed ? "#2c3e50" : completed ? "white" : "inherit",
}));

const ProgressContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "12px",
});

const ProgressBar = styled(Box)(({ progress, completed, removed }) => ({
  flex: 1,
  height: "8px",
  background: removed 
    ? "rgba(0, 0, 0, 0.1)"
    : completed 
    ? "rgba(255, 255, 255, 0.3)"
    : "rgba(0, 0, 0, 0.1)",
  borderRadius: "4px",
  overflow: "hidden",
  "&::after": {
    content: '""',
    display: "block",
    height: "100%",
    width: `${progress}%`,
    background: removed
      ? "linear-gradient(90deg, #ffa726, #ff9800)"
      : completed 
      ? "linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))"
      : "linear-gradient(90deg, #4caf50, #45a049)",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  }
}));

const StatsCard = styled(Card)({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: "20px",
  textAlign: "center",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
});

const FilterContainer = styled(Box)({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "24px",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
});

const StartButton = styled(Button)(({ disabled }) => ({
  background: disabled 
    ? "linear-gradient(45deg, #9e9e9e, #757575)"
    : "linear-gradient(45deg, #ff6b6b, #ffa726)",
  borderRadius: "50px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "bold",
  color: "white",
  boxShadow: disabled 
    ? "none"
    : "0 6px 20px rgba(255, 107, 107, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: disabled ? "none" : "translateY(-2px)",
    boxShadow: disabled 
      ? "none"
      : "0 8px 25px rgba(255, 107, 107, 0.6)",
  },
  minWidth: "120px",
}));

const RemoveButton = styled(Button)({
  background: "linear-gradient(45deg, #ffa726, #ff9800)",
  borderRadius: "50px",
  padding: "8px 16px",
  fontSize: "12px",
  fontWeight: "bold",
  color: "white",
  boxShadow: "0 4px 15px rgba(255, 167, 38, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(255, 167, 38, 0.4)",
  },
  minWidth: "140px",
});

const CompletedBadge = styled(Chip)({
  background: "linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
  color: "#4caf50",
  fontWeight: "bold",
  borderRadius: "20px",
  padding: "8px 16px",
  boxShadow: "0 4px 15px rgba(255, 255, 255, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
});

const AttemptsBadge = styled(Chip)(({ low, completed, removed }) => ({
  background: removed
    ? "linear-gradient(45deg, #ffa726, #ff9800)"
    : completed
    ? "linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))"
    : low 
    ? "linear-gradient(45deg, #ff4757, #ff6348)"
    : "linear-gradient(45deg, #2ed573, #1e90ff)",
  color: removed ? "white" : completed ? "#2c3e50" : "white",
  fontWeight: "bold",
  borderRadius: "16px",
  padding: "4px 12px",
  fontSize: "12px",
  border: completed ? "1px solid rgba(255, 255, 255, 0.5)" : "none",
}));

const RemovedBadge = styled(Chip)({
  background: "linear-gradient(45deg, #ffa726, #ff9800)",
  color: "white",
  fontWeight: "bold",
  borderRadius: "20px",
  padding: "8px 16px",
  boxShadow: "0 4px 15px rgba(255, 167, 38, 0.3)",
});

export default function StudentSpellingLevelList() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState(""); 
  const [levels, setLevels] = useState([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState([]);
  const [completedLevelIds, setCompletedLevelIds] = useState([]);
  const [levelScores, setLevelScores] = useState({});
  const [levelChallengeCounts, setLevelChallengeCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState({});
  const [removedLevels, setRemovedLevels] = useState([]);
  const [showRemovedDialog, setShowRemovedDialog] = useState(false);

  // Load removed levels from localStorage on component mount
  useEffect(() => {
    const savedRemovedLevels = localStorage.getItem(`removedLevels_${classId}`);
    if (savedRemovedLevels) {
      setRemovedLevels(JSON.parse(savedRemovedLevels));
    }
  }, [classId]);

  // Save removed levels to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`removedLevels_${classId}`, JSON.stringify(removedLevels));
  }, [removedLevels, classId]);

  // Stats for gamification
  const totalLevels = levels.length;
  const completedLevels = completedLevelIds.length;
  const removedLevelsCount = removedLevels.length;
  const visibleLevels = levels.filter(level => !removedLevels.includes(level.id));
  const completionRate = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

  // Fetch levels and completed challenge IDs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [levelsRes, correctRes] = await Promise.all([
          api.get(`/api/spelling-level/classroom/${classId}`),
          api.get(`/api/game/spelling/correct`)
        ]);

        if (Array.isArray(levelsRes.data)) {
          setLevels(levelsRes.data.sort((a, b) => a.order - b.order));
        } else {
          console.warn("Unexpected levels response:", levelsRes.data);
          setLevels([]);
        }
        setCompletedChallengeIds(correctRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load spelling levels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  // Determine which levels are fully completed & calculate scores
  useEffect(() => {
    const checkCompletedLevelsAndScores = async () => {
      const completed = [];
      const scores = {};
      const challengeCounts = {};
      const attemptsLeft = {};

      for (const level of levels) {
        try {
          const challengesRes = await api.get(`/api/spelling-level/${level.id}/challenges`);
          const attemptsRes = await api.get(`/api/game/spelling/level/${level.id}/remaining-attempts`);

          const challengeIds = challengesRes.data.map((c) => c.id);
          const correctAnswered = challengeIds.filter(id =>
            completedChallengeIds.includes(id)
          );
          const isCompleted =
            challengeIds.length > 0 &&
            correctAnswered.length === challengeIds.length;

          if (isCompleted) completed.push(level.id);

          scores[level.id] = correctAnswered.length;
          challengeCounts[level.id] = challengeIds.length;
          attemptsLeft[level.id] = attemptsRes.data.remainingAttempts;

        } catch (err) {
          console.warn(`Could not fetch challenges for level ${level.id}`);
          scores[level.id] = 0;
          challengeCounts[level.id] = 0;
          attemptsLeft[level.id] = level.maxAttempts;
        }
      }

      setCompletedLevelIds(completed);
      setLevelScores(scores);
      setLevelChallengeCounts(challengeCounts);
      setRemainingAttempts(attemptsLeft);
    };

    if (levels.length && completedChallengeIds.length) {
      checkCompletedLevelsAndScores();
    }
  }, [levels, completedChallengeIds]);

  const calculateProgress = (levelId) => {
    const score = levelScores[levelId] || 0;
    const total = levelChallengeCounts[levelId] || 1;
    return Math.round((score / total) * 100);
  };

  const removeLevel = (levelId) => {
    setRemovedLevels(prev => [...prev, levelId]);
  };

  const restoreLevel = (levelId) => {
    setRemovedLevels(prev => prev.filter(id => id !== levelId));
  };

  const restoreAllLevels = () => {
    setRemovedLevels([]);
    setShowRemovedDialog(false);
  };

  const filteredLevels = levels.filter(level => {
    const completed = completedLevelIds.includes(level.id);
    const hasAttempts = (remainingAttempts[level.id] ?? level.maxAttempts) > 0;
    const isRemoved = removedLevels.includes(level.id);

    // Show removed levels only when searching or in removed filter
    if (filter === "removed" && !isRemoved) return false;
    if (filter !== "removed" && isRemoved) return false;

    if (filter === "completed" && !completed) return false;
    if (filter === "available" && (completed || !hasAttempts)) return false;

    if (search && !level.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <GameContainer>
        <ContentContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Box textAlign="center">
              <CircularProgress size={80} sx={{ color: "white", mb: 3 }} />
              <Typography variant="h5" color="white" fontWeight="bold">
                Loading Spell Quest...
              </Typography>
            </Box>
          </Box>
        </ContentContainer>
      </GameContainer>
    );
  }

  if (error) {
    return (
      <GameContainer>
        <ContentContainer>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: "16px",
              fontSize: "16px",
              padding: "16px"
            }}
          >
            {error}
          </Alert>
        </ContentContainer>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <ContentContainer>
        {/* Header Section */}
        <Zoom in={true} timeout={800}>
          <HeaderCard>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={3}>
              <Box>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <School sx={{ fontSize: 48, color: "#667eea" }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="#2c3e50">
                      Spell Quest
                    </Typography>
                    <Typography variant="h6" color="#666">
                       Master your spelling skills through exciting challenges!
                    </Typography>
                  </Box>
                </Box>
                
                {/* Stats */}
                <Box display="flex" gap={3} flexWrap="wrap">
                  <StatsCard>
                    <Typography variant="h4" fontWeight="bold" color="#667eea">
                      {totalLevels}
                    </Typography>
                    <Typography variant="body2" color="#666">
                      Total Levels
                    </Typography>
                  </StatsCard>
                  <StatsCard>
                    <Typography variant="h4" fontWeight="bold" color="#4caf50">
                      {completedLevels}
                    </Typography>
                    <Typography variant="body2" color="#666">
                      Completed
                    </Typography>
                  </StatsCard>
                  <StatsCard>
                    <Typography variant="h4" fontWeight="bold" color="#ffa726">
                      {completionRate}%
                    </Typography>
                    <Typography variant="body2" color="#666">
                      Progress
                    </Typography>
                  </StatsCard>
                  {removedLevelsCount > 0 && (
                    <StatsCard>
                      <Typography variant="h4" fontWeight="bold" color="#ff9800">
                        {removedLevelsCount}
                      </Typography>
                      <Typography variant="body2" color="#666">
                        Hidden
                      </Typography>
                    </StatsCard>
                  )}
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <EmojiEvents sx={{ fontSize: 80, color: "#ffd700" }} />
                {removedLevelsCount > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<RestoreFromTrash />}
                    onClick={() => setShowRemovedDialog(true)}
                    sx={{
                      background: "linear-gradient(45deg, #ffa726, #ff9800)",
                      borderRadius: "25px",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Manage Hidden ({removedLevelsCount})
                  </Button>
                )}
              </Box>
            </Box>
          </HeaderCard>
        </Zoom>

        {/* Filters Section */}
        <Fade in={true} timeout={1000}>
          <FilterContainer>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FilterList fontSize="small" />
                      Filter Levels
                    </Box>
                  </InputLabel>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Filter Levels"
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="available">Available</MenuItem>
                    {removedLevelsCount > 0 && (
                      <MenuItem value="removed">Hidden Levels</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Search fontSize="small" />
                      Search levels...
                    </Box>
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </FilterContainer>
        </Fade>

        {/* Levels Grid */}
        <Grid container spacing={3}>
          {filteredLevels.length === 0 ? (
            <Grid item xs={12}>
              <Box textAlign="center" py={8}>
                <LockOpen sx={{ fontSize: 80, color: "white", mb: 2, opacity: 0.7 }} />
                <Typography variant="h5" color="white" fontWeight="bold" mb={1}>
                  No Levels Found
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.8)">
                  {filter === "completed" 
                    ? "You haven't completed any levels yet. Start your first challenge!"
                    : filter === "available"
                    ? "All available levels are completed or locked. Great work!"
                    : filter === "removed"
                    ? "No levels are currently hidden from view."
                    : "No levels match your search criteria."}
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredLevels.map((level, index) => {
              const completed = completedLevelIds.includes(level.id);
              const progress = calculateProgress(level.id);
              const total = levelChallengeCounts[level.id] || 0;
              const attemptsLeft = remainingAttempts[level.id] ?? level.maxAttempts;
              const isDisabled = attemptsLeft === 0 && !completed;
              const isRemoved = removedLevels.includes(level.id);

              return (
                <Grid item xs={12} md={6} key={level.id}>
                  <Fade in={true} timeout={800 + (index * 100)}>
                    <LevelCard 
                      completed={completed} 
                      disabled={isDisabled}
                      removed={isRemoved}
                      onClick={() => !isDisabled && !isRemoved && navigate(`/student/classes/${classId}/spelling-challenge?levelId=${level.id}`)}
                    >
                      <LevelCardContent completed={completed} removed={isRemoved}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flex={1}>
                            <Typography 
                              variant="h5" 
                              fontWeight="bold" 
                              color={isRemoved ? "#2c3e50" : completed ? "white" : "#2c3e50"} 
                              mb={1}
                            >
                              {level.title}
                              {isRemoved && " (Hidden)"}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color={isRemoved ? "#666" : completed ? "rgba(255,255,255,0.9)" : "#666"} 
                              mb={1}
                            >
                              {total} word{total !== 1 ? 's' : ''} • {level.maxAttempts} attempt{level.maxAttempts !== 1 ? 's' : ''} allowed
                            </Typography>
                            
                            <Box display="flex" gap={1} mb={2}>
                              <AttemptsBadge 
                                low={attemptsLeft <= 2}
                                completed={completed}
                                removed={isRemoved}
                                icon={attemptsLeft > 0 ? <PlayArrow /> : <LockOpen />}
                                label={`${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left`}
                              />
                              {completed && (
                                <CompletedBadge
                                  icon={<CheckCircle />}
                                  label="Completed"
                                />
                              )}
                              {isRemoved && (
                                <RemovedBadge
                                  icon={<VisibilityOff />}
                                  label="Hidden"
                                />
                              )}
                            </Box>
                          </Box>

                          {!isRemoved && !completed && (
                            <StartButton
                              disabled={isDisabled}
                              startIcon={isDisabled ? <LockOpen /> : <PlayArrow />}
                            >
                              {isDisabled ? "Locked" : "Start"}
                            </StartButton>
                          )}
                          {!isRemoved && completed && (
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLevel(level.id);
                              }}
                              sx={{
                                color: "white",
                                background: "rgba(255,255,255,0.2)",
                                "&:hover": {
                                  background: "rgba(255,255,255,0.3)",
                                }
                              }}
                            >
                              <VisibilityOff />
                            </IconButton>
                          )}
                          {isRemoved && (
                            <RemoveButton
                              startIcon={<Visibility />}
                              onClick={(e) => {
                                e.stopPropagation();
                                restoreLevel(level.id);
                              }}
                            >
                              Show Again
                            </RemoveButton>
                          )}
                        </Box>

                        {/* Progress Bar */}
                        {total > 0 && (
                          <ProgressContainer>
                            <Star sx={{ 
                              color: isRemoved ? "#ffa726" : completed ? "rgba(255,255,255,0.9)" : "#ffd700", 
                              fontSize: 20 
                            }} />
                            <ProgressBar progress={progress} completed={completed} removed={isRemoved} />
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              color={isRemoved ? "#2c3e50" : completed ? "white" : "#2c3e50"}
                              minWidth="60px"
                            >
                              {progress}%
                            </Typography>
                          </ProgressContainer>
                        )}

                        {/* Progress Text */}
                        {total > 0 && (
                          <Typography 
                            variant="body2" 
                            color={isRemoved ? "#666" : completed ? "rgba(255,255,255,0.9)" : "#666"}
                            mt={1}
                          >
                            {levelScores[level.id] || 0} of {total} words mastered
                          </Typography>
                        )}
                      </LevelCardContent>
                    </LevelCard>
                  </Fade>
                </Grid>
              );
            })
          )}
        </Grid>

        {/* Removed Levels Dialog */}
        <Dialog 
          open={showRemovedDialog} 
          onClose={() => setShowRemovedDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <RestoreFromTrash />
              Hidden Levels ({removedLevelsCount})
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              These levels are currently hidden from your main view. You can restore them individually or all at once.
            </Typography>
            <List>
              {removedLevels.map(levelId => {
                const level = levels.find(l => l.id === levelId);
                if (!level) return null;
                
                return (
                  <ListItem key={levelId}>
                    <ListItemText
                      primary={level.title}
                      secondary={`${levelChallengeCounts[levelId] || 0} words • ${remainingAttempts[levelId] || level.maxAttempts} attempts left`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => restoreLevel(levelId)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRemovedDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={restoreAllLevels}
              variant="contained"
              startIcon={<RestoreFromTrash />}
            >
              Restore All
            </Button>
          </DialogActions>
        </Dialog>

        {/* Motivational Message */}
        {completedLevels > 0 && completedLevels === totalLevels && (
          <Fade in={true} timeout={1500}>
            <Box textAlign="center" mt={6} mb={4}>
              <EmojiEvents sx={{ fontSize: 80, color: "#ffd700", mb: 2 }} />
              <Typography variant="h4" color="white" fontWeight="bold" mb={2}>
                🎉 Amazing! You've completed all levels! 🎉
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.9)">
                You're a spelling master! Keep practicing to maintain your skills.
              </Typography>
            </Box>
          </Fade>
        )}
      </ContentContainer>
    </GameContainer>
  );
}
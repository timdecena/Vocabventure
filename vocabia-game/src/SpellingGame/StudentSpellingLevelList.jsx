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
  LinearProgress,
  Box,
  Chip
} from "@mui/material";
import { CheckCircle, LockOpen } from "@mui/icons-material";

const LevelContainer = styled("div")({
  maxWidth: 800,
  margin: "0 auto",
  padding: "24px",
  backgroundColor: "#f9f9f9",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
});

const LevelCard = styled(Card)(({ completed }) => ({
  marginBottom: "16px",
  borderLeft: completed ? "4px solid #4caf50" : "4px solid #2196f3",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
  },
  cursor: "pointer",
}));

const ProgressBarContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  marginTop: "8px",
});

const ProgressText = styled(Typography)({
  marginLeft: "8px",
  minWidth: "80px",
  color: "#555",
});

const CompletedBadge = styled(Chip)({
  backgroundColor: "#4caf50",
  color: "white",
  fontWeight: "bold",
  padding: "4px 8px",
  marginLeft: "auto",
});

export default function StudentSpellingLevelList() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState([]);
  const [completedLevelIds, setCompletedLevelIds] = useState([]);
  const [levelScores, setLevelScores] = useState({});
  const [levelChallengeCounts, setLevelChallengeCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          console.warn("⚠️ Unexpected levels response:", levelsRes.data);
          setLevels([]);
        }
        setCompletedChallengeIds(correctRes.data);
      } catch (err) {
        console.error("❌ Error loading data:", err);
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

      for (const level of levels) {
        try {
          const res = await api.get(`/api/spelling-level/${level.id}/challenges`);
          const challengeIds = res.data.map((c) => c.id);
          const correctAnswered = challengeIds.filter(id => completedChallengeIds.includes(id));
          const isCompleted = challengeIds.length > 0 && correctAnswered.length === challengeIds.length;

          if (isCompleted) completed.push(level.id);
          scores[level.id] = correctAnswered.length;
          challengeCounts[level.id] = challengeIds.length;
        } catch (err) {
          console.warn(`⚠️ Could not fetch challenges for level ${level.id}`);
          scores[level.id] = 0;
          challengeCounts[level.id] = 0;
        }
      }

      setCompletedLevelIds(completed);
      setLevelScores(scores);
      setLevelChallengeCounts(challengeCounts);
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

  if (loading) {
    return (
      <LevelContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={60} />
        </Box>
      </LevelContainer>
    );
  }

  if (error) {
    return (
      <LevelContainer>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </LevelContainer>
    );
  }

  return (
    <LevelContainer>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: "bold",
        color: "#333",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center"
      }}>
        <LockOpen sx={{ marginRight: "12px", fontSize: "32px" }} />
        Spelling Levels
      </Typography>

      {levels.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ color: "#666" }}>
          No spelling levels available for this class yet.
        </Typography>
      ) : (
        levels.map(level => {
          const completed = completedLevelIds.includes(level.id);
          const progress = calculateProgress(level.id);
          const total = levelChallengeCounts[level.id] || 0;

          return (
            <LevelCard key={level.id} completed={completed} >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {level.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {level.description || "Test your spelling skills"}
                    </Typography>
                    
                    {total > 0 && (
                      <ProgressBarContainer>
                        <Box width="100%" mr={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            color={progress === 100 ? "success" : "primary"}
                            sx={{ height: "8px", borderRadius: "4px" }}
                          />
                        </Box>
                        <ProgressText variant="body2">
                          {progress}% ({levelScores[level.id] || 0}/{total})
                        </ProgressText>
                      </ProgressBarContainer>
                    )}
                  </div>

                  {completed ? (
                    <CompletedBadge
                      icon={<CheckCircle />}
                      label="Completed"
                    />
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/student/classes/${classId}/spelling-challenge?levelId=${level.id}`)}
                      sx={{
                        minWidth: "140px",
                        textTransform: "none",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        padding: "8px 16px"
                      }}
                    >
                      Start
                    </Button>
                  )}
                </Box>
              </CardContent>
            </LevelCard>
          );
        })
      )}
    </LevelContainer>
  );
}
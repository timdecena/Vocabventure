import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import api from "../api/api";

// --- STYLED COMPONENTS ---

const PageBg = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100vw",
  background: "linear-gradient(135deg, #202a24 0%, #67e189 100%)",
  padding: 0,
  margin: 0,
  boxSizing: "border-box",
  overflowX: "hidden",
  overflowY: "auto", // always scroll
}));

const Content = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: "0 auto",
  padding: theme.spacing(4, 2, 6, 2),
  [theme.breakpoints.down("md")]: {
    maxWidth: 900,
    padding: theme.spacing(3, 1.5, 4, 1.5),
  },
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100vw",
    padding: theme.spacing(2, 0.5, 3, 0.5),
  },
}));

const CardGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  minWidth: 200,
  maxWidth: 240,
  height: 260,
  borderRadius: 20,
  margin: "auto",
  background: "linear-gradient(140deg, #baffc9 0%, #67e189 100%)",
  boxShadow: "0 6px 24px 0 rgba(72,232,164,0.13), 0 2px 8px 0 rgba(0,0,0,0.09)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  transition: "transform 0.17s, box-shadow 0.17s",
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0 14px 32px 0 rgba(40,255,75,0.18), 0 3px 14px 0 rgba(0,0,0,0.13)",
    transform: "translateY(-2px) scale(1.035)",
    background: "linear-gradient(140deg, #d1ffe6 0%, #84ffb6 100%)",
  },
}));

const CategoryTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: "1.07rem",
  color: "#20412a",
  letterSpacing: "0.4px",
  marginBottom: 10,
  textAlign: "center",
  userSelect: "none",
});

const PlayButton = styled(Button)({
  marginTop: 14,
  borderRadius: "9px",
  background: "linear-gradient(90deg, #32d183 0%, #83ffb2 100%)",
  color: "#20412a",
  fontWeight: 600,
  fontSize: "0.95rem",
  letterSpacing: "0.4px",
  boxShadow: "0 1px 8px 0 #44e8a144",
  textTransform: "none",
  padding: "7px 0",
  transition: "background 0.13s, color 0.13s",
  "&:hover": {
    background: "linear-gradient(90deg, #1b5c38 0%, #baffc9 100%)",
    color: "#184f32",
  },
});

export default function CategoryList() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const categoriesRes = await api.get("/fpow/categories");
        const categoriesData = categoriesRes.data || [];
        setCategories(categoriesData);
        const progressData = {};
        if (token) {
          try {
            const progressRes = await api.get("/user-progress/all");
            if (progressRes.data && Array.isArray(progressRes.data)) {
              progressRes.data.forEach(progress => {
                const categoryName = progress.category;
                if (categoryName) {
                  progressData[categoryName] = {
                    completedLevels: progress.puzzlesSolved || 0,
                    currentLevel: progress.currentLevel || 1,
                  };
                }
              });
            }
          } catch (progressError) { /* fallback ignored */ }
        }
        setUserProgress(progressData);
      } catch (err) {
        setError(err.message || "Failed to load categories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maxLevels = 5;

  if (loading)
    return (
      <PageBg>
        <CircularProgress />
      </PageBg>
    );

  return (
    <PageBg>
      <Content>
        <Typography
          variant="h4"
          fontWeight={800}
          align="center"
          color="#72ffb2"
          sx={{
            mb: 2.5,
            fontFamily: `'Montserrat', 'Segoe UI', Arial, sans-serif`,
            letterSpacing: "0.8px",
            textShadow: "0 2px 10px #184f32, 0 0 8px #52e08a60",
            userSelect: "none"
          }}
        >
          Vocab Adventure
        </Typography>
        <CardGrid container spacing={3} justifyContent="center">
          {categories.map(cat => {
            const progress = userProgress[cat] || {};
            const completedLevels =
              typeof progress.completedLevels === "number"
                ? progress.completedLevels
                : 0;
            return (
              <Grid item key={cat} xs={12} sm={6} md={4} lg={3}>
                <CategoryCard elevation={0} onClick={() => navigate(`/student/classes/${id}/4pic1word/${cat}`)}>
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      px: 1.5,
                      py: 2,
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <CategoryTitle>
                      {cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </CategoryTitle>
                    <Box sx={{ width: "100%", mb: 1, mt: 1 }}>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color="#2b7552"
                        sx={{
                          opacity: 0.78,
                          letterSpacing: "0.06em",
                          mb: 0.5,
                        }}
                      >
                        Level Completion
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(completedLevels / maxLevels) * 100}
                        sx={{
                          height: 7,
                          borderRadius: 5,
                          background: "#e5ffe5",
                          ".MuiLinearProgress-bar": {
                            background: "linear-gradient(90deg, #31d27a 0%, #9ff2ca 100%)",
                          },
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.8}>
                        <Typography variant="caption" fontWeight={600} color="#2b7552">
                          {completedLevels} / {maxLevels} levels
                        </Typography>
                      </Box>
                    </Box>
                    <PlayButton
                      fullWidth
                      endIcon={<ArrowForwardIosIcon />}
                      onClick={() => navigate(`/student/classes/${id}/4pic1word/${cat}`)}
                    >
                      Play Now
                    </PlayButton>
                  </CardContent>
                </CategoryCard>
              </Grid>
            );
          })}
        </CardGrid>
      </Content>
    </PageBg>
  );
}

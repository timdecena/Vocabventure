import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Divider,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Tooltip
} from "@mui/material";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  ArrowBack as ArrowBackIcon,
  SportsEsports as GameIcon,
  ForestIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function StudentViewClassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    
    api.get("/student/classes")
      .then(res => {
        const found = res.data.find(c => c.id === Number(id));
        if (found) {
          setClassroom(found);
        } else {
          setError("Class not found");
        }
      })
      .catch(err => {
        console.error("Error fetching student classes:", err);
        setError("Failed to load class. Please make sure you're logged in as a student.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress size={60} thickness={4} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading class details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/student/classes")}
          sx={{
            bgcolor: "#4caf50",
            '&:hover': { bgcolor: "#388e3c" }
          }}
        >
          Back to My Classes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Nature-themed background with subtle gradient */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #e6f7ff 0%, #e3f2fd 50%, #e1f5fe 100%)",
          zIndex: -1,
          opacity: 0.7
        }}
      />

      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/student/classes")}
          sx={{
            borderColor: "#4caf50",
            color: "#4caf50",
            '&:hover': {
              borderColor: "#388e3c",
              bgcolor: "rgba(76, 175, 80, 0.04)"
            }
          }}
        >
          Back to My Classes
        </Button>
      </Box>

      {/* Main content card */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 8px 32px rgba(0, 105, 92, 0.1)"
        }}
      >
        {/* Class header with background */}
        <Box 
          sx={{ 
            p: 4, 
            background: "linear-gradient(45deg, #81c784 0%, #4caf50 100%)",
            color: "white"
          }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Avatar
                sx={{
                  bgcolor: "#e8f5e9",
                  color: "#2e7d32",
                  width: 64,
                  height: 64,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                <SchoolIcon fontSize="large" />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {classroom.name}
              </Typography>
              <Chip 
                icon={<PersonIcon />} 
                label={`Teacher: ${classroom.teacher?.firstName} ${classroom.teacher?.lastName}`}
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 500,
                  '& .MuiChip-icon': { color: "white" }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Class description */}
        <Box sx={{ p: 4 }}>
          <Typography variant="body1" paragraph>
            {classroom.description || "No description available for this class."}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Action buttons */}
          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600 }}>
            Class Activities
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Game card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  '&:hover': {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 20px -10px rgba(76, 175, 80, 0.3)"
                  },
                  borderRadius: 2
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: "#e8f5e9", 
                    p: 2,
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <GameIcon sx={{ fontSize: 60, color: "#4caf50" }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    4 Pics 1 Word
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Test your vocabulary skills with this fun picture-based word game.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/student/classes/${id}/4pic1word`)}
                    sx={{ 
                      mt: 2,
                      bgcolor: "#4caf50",
                      '&:hover': { bgcolor: "#388e3c" }
                    }}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Classmates card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  '&:hover': {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 20px -10px rgba(76, 175, 80, 0.3)"
                  },
                  borderRadius: 2
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: "#e8f5e9", 
                    p: 2,
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <GroupIcon sx={{ fontSize: 60, color: "#4caf50" }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Classmates
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    View your fellow students and their progress in this class.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/student/classes/${id}/classmates`)}
                    sx={{ 
                      mt: 2,
                      borderColor: "#4caf50",
                      color: "#4caf50",
                      '&:hover': {
                        borderColor: "#388e3c",
                        bgcolor: "rgba(76, 175, 80, 0.04)"
                      }
                    }}
                  >
                    View Classmates
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Group as GroupIcon,
  Home as HomeIcon,
  Forest as ForestIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  SportsEsports as GameIcon,
} from "@mui/icons-material";
import api from "../api/api";

const StudentClassListPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");
    
    api.get("/student/classes")
      .then(res => {
        setClasses(res.data);
      })
      .catch(err => {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress size={60} thickness={4} sx={{ color: "#4caf50" }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your classes...</Typography>
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

      {/* Main content */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 8px 32px rgba(0, 105, 92, 0.1)"
        }}
      >
        {/* Header with background */}
        <Box 
          sx={{ 
            p: 4, 
            background: "linear-gradient(45deg, #81c784 0%, #4caf50 100%)",
            color: "white"
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: "#e8f5e9",
                    color: "#2e7d32",
                    width: 56,
                    height: 56,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    mr: 2
                  }}
                >
                  <SchoolIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    My Classes
                  </Typography>
                  <Chip 
                    icon={<ForestIcon />} 
                    label="Enchanted Spelling Journey"
                    sx={{ 
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 500,
                      '& .MuiChip-icon': { color: "white" }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate("/student/classes/join")}
                sx={{ 
                  bgcolor: "#e8f5e9", 
                  color: "#2e7d32",
                  fontWeight: "bold",
                  '&:hover': { 
                    bgcolor: "#c8e6c9", 
                  },
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >
                Join New Class
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Classes content */}
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mb: 3 }}>
            Your Enrolled Classes
          </Typography>

          {classes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              You haven't joined any classes yet. Use the "Join New Class" button to get started!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {classes.map(classroom => (
                <Grid item xs={12} sm={6} md={4} key={classroom.id}>
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
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid rgba(76, 175, 80, 0.2)"
                    }}
                  >
                    {/* Card header */}
                    <Box 
                      sx={{ 
                        bgcolor: "#e8f5e9", 
                        p: 2,
                        borderBottom: "1px solid rgba(76, 175, 80, 0.1)"
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <HomeIcon sx={{ color: "#4caf50", mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {classroom.name}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Card content */}
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                        {classroom.description || "No description available for this class."}
                      </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <PersonIcon sx={{ color: "#4caf50", fontSize: 20, mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          <strong>Teacher:</strong> {classroom.teacher?.firstName} {classroom.teacher?.lastName}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />
                      
                      {/* Action buttons */}
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => navigate(`/student/classes/${classroom.id}`)}
                          sx={{ 
                            bgcolor: "#4caf50",
                            '&:hover': { bgcolor: "#388e3c" }
                          }}
                        >
                          View Class
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate(`/student/classes/${classroom.id}/classmates`)}
                          sx={{ 
                            borderColor: "#4caf50",
                            color: "#4caf50",
                            '&:hover': {
                              borderColor: "#388e3c",
                              bgcolor: "rgba(76, 175, 80, 0.04)"
                            }
                          }}
                        >
                          Classmates
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default StudentClassListPage;

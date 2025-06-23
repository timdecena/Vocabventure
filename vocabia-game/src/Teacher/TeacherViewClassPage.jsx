import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Snackbar,
  useTheme
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  People as StudentsIcon,
  Edit as EditIcon,
  School as ClassIcon,
  Assignment as AssignmentIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function TeacherViewClassPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/teacher/classes/${id}`);
        setClassroom(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch class data:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view this class");
        } else if (err.response?.status === 404) {
          setError("Class not found");
        } else {
          setError("Failed to load class data");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [id]);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(classroom?.joinCode || "");
    showSnackbar("Join code copied to clipboard", "success");
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate("/teacher/classes")}
        >
          Back to My Classes
        </Button>
      </Box>
    );
  }

  if (!classroom) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Class not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate("/teacher/classes")}
        >
          Back to My Classes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 4 
        }}>
          <Box>
            <Button
              variant="text"
              startIcon={<BackIcon />}
              onClick={() => navigate("/teacher/classes")}
              sx={{ mb: 1 }}
            >
              Back to Classes
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {classroom.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {classroom.description || "No description"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/teacher/classes/${id}/edit`)}
          >
            Edit Class
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Class Info Card */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Class Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Join Code
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Chip
                        label={classroom.joinCode}
                        sx={{ 
                          mr: 1,
                          fontWeight: 600,
                          backgroundColor: "grey.100"
                        }}
                      />
                      <Tooltip title="Copy join code">
                        <IconButton onClick={copyJoinCode}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created On
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      {new Date(classroom.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<StudentsIcon />}
                      onClick={() => navigate(`/teacher/classes/${id}/students`)}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      View Students
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate(`/teacher/classes/${id}/assignments`)}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      View Assignments
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Paper elevation={0} sx={{ 
            p: 3, 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              Activity feed will appear here
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
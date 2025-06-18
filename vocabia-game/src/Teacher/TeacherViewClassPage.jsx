import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ListAltIcon from "@mui/icons-material/ListAlt";
import authService from "../services/authService";

export default function TeacherViewClassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add debugging to track API calls
      console.log(`Attempting to fetch class with ID ${id}`);
      
      // First try to get the class directly using the specific endpoint
      const response = await api.get(`/api/teacher/classes/${id}`);
      console.log("Class details response:", response.data);
      setClassroom(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching class details:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status code:", err.response?.status);
      
      // Check for specific error types
      if (err.response) {
        if (err.response.status === 401) {
          setError("Authentication error. Please log in again.");
        } else if (err.response.status === 403) {
          setError("You don't have permission to view this class.");
        } else if (err.response.status === 404) {
          setError("Class not found. It may have been deleted.");
        } else {
          setError(`Failed to load class details. Server returned: ${err.response.status} ${err.response.statusText}`);
        }
      } else {
        // If the specific endpoint fails, fall back to getting all classes and filtering
        try {
          console.log("Falling back to fetching all classes");
          const allClassesResponse = await api.get("/api/teacher/classes");
          console.log("All classes response:", allClassesResponse.data);
          
          const found = allClassesResponse.data.find(c => c.id === Number(id));
          console.log(`Looking for class with ID ${id}, found:`, found);
          
          if (found) {
            setClassroom(found);
            setError(null);
          } else {
            setError(`Class with ID ${id} not found in the database. Please check if it exists.`);
          }
        } catch (fallbackErr) {
          console.error("Fallback error:", fallbackErr);
          setError("Failed to load class details. Please try again.");
        }
      }
      
      setLoading(false);
    }
  };
  
  const handleCopyJoinCode = () => {
    if (classroom && classroom.joinCode) {
      navigator.clipboard.writeText(classroom.joinCode)
        .then(() => {
          setCopySnackbarOpen(true);
        })
        .catch(err => console.error("Failed to copy join code:", err));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header with back button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ fontSize: 32, mr: 2, color: '#2e7d32' }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            Class Details
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/teacher/classes"
          sx={{
            borderColor: '#2e7d32',
            color: '#2e7d32',
            '&:hover': {
              borderColor: '#1b5e20',
              bgcolor: 'rgba(46, 125, 50, 0.04)'
            }
          }}
        >
          Back to My Classes
        </Button>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress color="success" />
        </Box>
      )}

      {/* Error state */}
      {error && !loading && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }} 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/teacher/classes')}
            >
              Go Back
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Class details */}
      {!loading && !error && classroom && (
        <Grid container spacing={4}>
          {/* Main class info card */}
          <Grid item xs={12} md={8}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  {classroom.name}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                  {classroom.description || "No description provided"}
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Join Code:
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Chip 
                      label={classroom.joinCode} 
                      color="primary" 
                      sx={{ 
                        fontWeight: 'bold', 
                        letterSpacing: 1,
                        bgcolor: '#e8f5e9',
                        color: '#2e7d32',
                        border: '1px dashed #2e7d32'
                      }} 
                    />
                    <Tooltip title="Copy Join Code">
                      <IconButton 
                        size="small" 
                        onClick={handleCopyJoinCode}
                        sx={{ ml: 1, color: '#2e7d32' }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Share this code with your students to join this class
                  </Typography>
                </Box>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/teacher/classes/${id}/edit`}
                    size="small"
                    sx={{ 
                      mr: 1,
                      borderColor: '#ff9800', 
                      color: '#ff9800',
                      '&:hover': { 
                        borderColor: '#f57c00', 
                        bgcolor: 'rgba(255, 152, 0, 0.04)' 
                      }
                    }}
                  >
                    Edit Class
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    component={Link}
                    to={`/teacher/classes/${id}/students`}
                    size="small"
                    sx={{ 
                      borderColor: '#2e7d32', 
                      color: '#2e7d32',
                      '&:hover': { 
                        borderColor: '#1b5e20', 
                        bgcolor: 'rgba(46, 125, 50, 0.04)' 
                      }
                    }}
                  >
                    View Students
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
          
          {/* Actions card */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Class Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<BarChartIcon />}
                      component={Link}
                      to={`/teacher/classes/${id}/fpow-progress`}
                      sx={{ 
                        bgcolor: '#2e7d32', 
                        '&:hover': { bgcolor: '#1b5e20' },
                        py: 1
                      }}
                    >
                      View Progress Reports
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ListAltIcon />}
                      component={Link}
                      to={`/teacher/classes/${id}/word-lists`}
                      sx={{ 
                        borderColor: '#2e7d32', 
                        color: '#2e7d32',
                        '&:hover': { 
                          borderColor: '#1b5e20', 
                          bgcolor: 'rgba(46, 125, 50, 0.04)' 
                        },
                        py: 1
                      }}
                    >
                      Manage Word Lists
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<SportsEsportsIcon />}
                      component={Link}
                      to={`/teacher/classes/${id}/games`}
                      sx={{ 
                        borderColor: '#2e7d32', 
                        color: '#2e7d32',
                        '&:hover': { 
                          borderColor: '#1b5e20', 
                          bgcolor: 'rgba(46, 125, 50, 0.04)' 
                        },
                        py: 1
                      }}
                    >
                      Configure Games
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Copy success snackbar */}
      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setCopySnackbarOpen(false)}
        message={`Join code ${classroom?.joinCode} copied to clipboard!`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

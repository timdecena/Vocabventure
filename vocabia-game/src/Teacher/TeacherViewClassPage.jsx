import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import api from "../api/api";
import authService from "../services/authService";

function TeacherViewClassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Validate token & role
  const validateToken = () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return { valid: false, message: "No authentication token found. Please log in." };
    }
    
    // Get and validate role
    const role = authService.getRole();
    console.log("Validating token and role:", { authenticated: true, role });
    
    if (role !== "TEACHER") {
      return { valid: false, message: `You need teacher access for this page. Current role: ${role || 'none'}` };
    }
    
    try {
      // Get token for additional validation
      const token = localStorage.getItem("token");
      
      // Basic token structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, message: "Invalid token format." };
      }
      
      // Decode the payload
      const payload = JSON.parse(atob(parts[1]));
      console.log("Token payload:", payload);
      
      // Check expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        return { valid: false, message: "Your session has expired. Please log in again." };
      }
      
      // Check if payload contains authorities/roles
      if (payload.authorities) {
        console.log("Token authorities:", payload.authorities);
        // Verify that the token contains the TEACHER role
        let hasTeacherRole = false;
        
        // Handle both array and string formats
        if (Array.isArray(payload.authorities)) {
          hasTeacherRole = payload.authorities.some(auth => 
            auth === "ROLE_TEACHER" || auth === "TEACHER");
        } else if (typeof payload.authorities === 'string') {
          hasTeacherRole = payload.authorities === "ROLE_TEACHER" || 
                          payload.authorities === "TEACHER";
        }
        
        if (!hasTeacherRole) {
          console.warn("Token does not contain TEACHER role!");
        }
      } else {
        console.warn("No authorities found in token payload!");
      }
      
      return { valid: true };
    } catch (error) {
      console.error("Error validating token:", error);
      return { valid: false, message: "Error validating authentication token." };
    }
  };

  useEffect(() => {
    const tokenValidation = validateToken();
    if (!tokenValidation.valid) {
      setError(tokenValidation.message);
      setLoading(false);
      return;
    }
    fetchClassDetails();
    // eslint-disable-next-line
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log(`Fetching class details for ID: ${id}`);
      
      // First try to get the class from the list of teacher's classes
      const classesResponse = await api.get('/api/teacher/classes');
      console.log('All teacher classes:', classesResponse.data);
      
      const foundClass = classesResponse.data.find(c => c.id.toString() === id.toString());
      
      if (foundClass) {
        console.log('Found class in teacher classes:', foundClass);
        
        // If we need students, fetch them separately
        const studentsResponse = await api.get(`/api/teacher/classes/${id}/students`);
        console.log('Class students:', studentsResponse.data);
        
        // Combine class data with students
        const classWithStudents = {
          ...foundClass,
          students: studentsResponse.data
        };
        
        setClassroom(classWithStudents);
      } else {
        throw new Error('Class not found in teacher classes');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching class details:', error);
      
      let errorMessage = "Failed to load class details. Please try again.";
      
      if (error.response) {
        console.log('Error response:', error.response);
        
        if (error.response.status === 403) {
          errorMessage = "You don't have permission to access this class. Please check your account role.";
        } else if (error.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (error.response.status === 404) {
          errorMessage = "Class not found. It may have been deleted or you entered an incorrect ID.";
        }
      } else if (error.request) {
        errorMessage = "Could not connect to the server. Please check your internet connection.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchClassDetails();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading class details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error && !classroom) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3, borderLeft: '5px solid #f44336' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <WarningIcon color="error" sx={{ mr: 2, fontSize: 30 }} />
            <Typography variant="h5" component="h2" color="error.main">
              Error Loading Class
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} mt={3}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
            >
              Retry
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/teacher/classes")}
            >
              Back to Classes
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/teacher/classes")}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Class Details
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={2}>
              <SchoolIcon sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                {classroom?.name || "Class Name"}
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              {classroom?.description || "No description available"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {classroom?.createdAt ? new Date(classroom.createdAt).toLocaleDateString() : "Unknown"}
            </Typography>
            {error && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Grid>
          <Grid item xs={12} md={4} display="flex" justifyContent="flex-end" alignItems="flex-start">
            <Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/teacher/classes/${id}/edit`)}
                sx={{ mb: 2, width: { xs: "100%", md: "auto" } }}
              >
                Edit Class
              </Button>
              <Button
                variant="outlined"
                startIcon={<GroupIcon />}
                onClick={() => navigate(`/teacher/classes/${id}/students`)}
                sx={{ ml: { xs: 0, md: 2 }, width: { xs: "100%", md: "auto" } }}
              >
                Manage Students
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
        Students
      </Typography>
      <Paper elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
        {classroom?.students && classroom.students.length > 0 ? (
          <List>
            {classroom.students.map((student, index) => (
              <React.Fragment key={student.id}>
                <ListItem
                  secondaryAction={
                    <Tooltip title="View Progress">
                      <IconButton
                        edge="end"
                        onClick={() => navigate(`/teacher/classes/${id}/students/${student.id}/fpow-progress`)}
                      >
                        <AssessmentIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={student.name}
                    secondary={student.email}
                  />
                </ListItem>
                {index < classroom.students.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No students in this class yet.
            </Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
        Class Progress
      </Typography>
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                Four Pics One Word Game
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View overall class progress in the vocabulary game
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate(`/teacher/classes/${id}/fpow-progress`, { state: { classId: id } })}
            >
              View Progress
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

export default TeacherViewClassPage;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";

// Icons
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";

export default function TeacherClassListPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success"); // "success", "error", "warning", "info"
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching classes from /api/teacher/classes");
      const response = await api.get("/api/teacher/classes");
      console.log("Classes response:", response.data);
      
      // Filter out classes that were deleted on the frontend
      const deletedClasses = JSON.parse(localStorage.getItem("deletedClasses") || "[]");
      const filteredClasses = response.data.filter(c => !deletedClasses.includes(c.id));
      
      setClasses(filteredClasses);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load classes:", err.response?.data || err.message);
      setError("Failed to load your classes. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;
    
    try {
      console.log(`Attempting to delete class with ID ${classToDelete.id}`);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      
      console.log("Using token:", token);
      
      try {
        // Try using the API first
        await api.delete(`/api/teacher/classes/${classToDelete.id}`);
        
        // If successful, update the UI
        setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
        setDeleteDialogOpen(false);
        setClassToDelete(null);
        
        setSnackbarOpen(true);
        setSnackbarMessage("Class deleted successfully");
        setSeverity("success");
      } catch (apiError) {
        console.error("API delete failed, trying fallback:", apiError);
        
        // Fallback to direct fetch if API call fails
        const response = await fetch(`http://localhost:8080/api/teacher/classes/${classToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Delete error response:", errorData);
          
          if (response.status === 403) {
            throw new Error("You don't have permission to delete this class.");
          } else if (response.status === 401) {
            throw new Error("Your session has expired. Please log in again.");
          } else {
            throw new Error(errorData.message || 'Failed to delete class');
          }
        }
        
        // If we get here, fallback deletion was successful
        setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
        setDeleteDialogOpen(false);
        setClassToDelete(null);
        
        setSnackbarOpen(true);
        setSnackbarMessage("Class deleted successfully");
        setSeverity("success");
      }
    } catch (error) {
      console.error("Error in delete process:", error);
      
      // Try to remove the class from the local state anyway for better UX
      try {
        setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
        setSnackbarOpen(true);
        setSnackbarMessage("Class removed from your view (frontend only)");
        setSeverity("info");
      } catch (fallbackError) {
        console.error("Frontend deletion failed:", fallbackError);
        setError("Failed to remove class from view. Please refresh the page and try again.");
      }
      
      // Show appropriate error message
      if (error.message.includes("permission")) {
        setError("You don't have permission to delete this class. Please check your login status.");
      } else if (error.message.includes("session")) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(`Error: ${error.message}`);
      }
      
      setDeleteDialogOpen(false);
    }
  };

  const handleCopyJoinCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        setCopySnackbarOpen(true);
      })
      .catch(err => console.error("Failed to copy join code:", err));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header with title and create button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ fontSize: 32, mr: 2, color: '#2e7d32' }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            My Classes
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teacher/classes/create")}
          sx={{
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' },
            borderRadius: 2,
            px: 3
          }}
        >
          Create Class
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
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && classes.length === 0 && (
        <Card variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have any classes yet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Create your first class to get started with VocabVenture
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/teacher/classes/create")}
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
          >
            Create Your First Class
          </Button>
        </Card>
      )}

      {/* Classes grid */}
      {!loading && !error && classes.length > 0 && (
        <Grid container spacing={3}>
          {classes.map(classItem => (
            <Grid item xs={12} sm={6} md={4} key={classItem.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    {classItem.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    {classItem.description || "No description provided"}
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Join Code:
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Chip 
                        label={classItem.joinCode} 
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
                          onClick={() => handleCopyJoinCode(classItem.joinCode)}
                          sx={{ ml: 1, color: '#2e7d32' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                  <Box>
                    <Tooltip title="View Class">
                      <IconButton 
                        component={Link} 
                        to={`/teacher/classes/${classItem.id}`}
                        size="small"
                        sx={{ color: '#1976d2' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Class">
                      <IconButton 
                        component={Link} 
                        to={`/teacher/classes/${classItem.id}/edit`}
                        size="small"
                        sx={{ color: '#ff9800' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Class">
                      <IconButton 
                        onClick={() => handleDeleteClick(classItem)}
                        size="small"
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PeopleIcon />}
                    component={Link}
                    to={`/teacher/classes/${classItem.id}/students`}
                    sx={{ 
                      borderColor: '#2e7d32', 
                      color: '#2e7d32',
                      '&:hover': { 
                        borderColor: '#1b5e20', 
                        bgcolor: 'rgba(46, 125, 50, 0.04)' 
                      }
                    }}
                  >
                    Students
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the class "{classToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Copy success snackbar */}
      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setCopySnackbarOpen(false)}
        message={`Join code ${copiedCode} copied to clipboard!`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      {/* Snackbar for action feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={severity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

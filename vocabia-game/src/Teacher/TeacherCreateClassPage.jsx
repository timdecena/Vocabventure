import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/School";
import SaveIcon from "@mui/icons-material/Save";

export default function TeacherCreateClassPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError("Class name is required");
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError("Class name must be at least 3 characters");
      isValid = false;
    } else if (name.trim().length > 50) {
      setNameError("Class name must be less than 50 characters");
      isValid = false;
    } else {
      setNameError("");
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await api.post("/api/teacher/classes", { name, description });
      navigate("/teacher/classes");
    } catch (err) {
      console.error("Error creating class:", err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        setError("Authentication error. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to create classes.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create class. Please try again.");
      }
      
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header with title and back button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ fontSize: 32, mr: 2, color: '#2e7d32' }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            Create New Class
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
          Back to Classes
        </Button>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Create class form */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom mb={3}>
          Class Information
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Class Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={!!nameError}
                helperText={nameError || "Enter a descriptive name for your class"}
                disabled={loading}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                placeholder="Provide a brief description of this class (optional)"
                disabled={loading}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  component={Link}
                  to="/teacher/classes"
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                  sx={{
                    bgcolor: '#2e7d32',
                    '&:hover': { bgcolor: '#1b5e20' },
                    px: 4
                  }}
                >
                  {loading ? "Creating..." : "Create Class"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Box mt={4} p={3} bgcolor="#f5f5f5" borderRadius={2}>
        <Typography variant="subtitle2" color="text.secondary">
          After creating your class, you'll receive a unique join code that you can share with your students.
        </Typography>
      </Box>
    </Container>
  );
}

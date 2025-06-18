import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

export default function TeacherEditClassPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get the class directly using the specific endpoint
      const response = await api.get(`/api/teacher/classes/${id}`);
      setName(response.data.name);
      setDescription(response.data.description || "");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching class details:", err.response?.data || err.message);
      
      // Check for specific error types
      if (err.response) {
        if (err.response.status === 401) {
          setError("Authentication error. Please log in again.");
        } else if (err.response.status === 403) {
          setError("You don't have permission to edit this class.");
        } else if (err.response.status === 404) {
          setError("Class not found. It may have been deleted.");
        } else {
          setError("Failed to load class details. Please try again.");
        }
      } else {
        // If the specific endpoint fails, fall back to getting all classes and filtering
        try {
          console.log("Falling back to fetching all classes");
          const allClassesResponse = await api.get("/api/teacher/classes");
          const found = allClassesResponse.data.find(c => c.id === Number(id));
          
          if (found) {
            setName(found.name);
            setDescription(found.description || "");
            setError(null);
          } else {
            setError("Class not found. It may have been deleted.");
            setTimeout(() => navigate("/teacher/classes"), 2000);
          }
        } catch (fallbackErr) {
          console.error("Fallback error:", fallbackErr);
          setError("Failed to load class details. Please try again.");
        }
      }
      
      setLoading(false);
    }
  };
  
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
    
    setSaving(true);
    setError(null);
    
    try {
      await api.put(`/api/teacher/classes/${id}`, { name, description });
      navigate("/teacher/classes");
    } catch (err) {
      console.error("Error updating class:", err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        setError("Authentication error. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to update this class.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update class. Please try again.");
      }
      
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header with title and back button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ fontSize: 32, mr: 2, color: '#2e7d32' }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            Edit Class
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

      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress color="success" />
        </Box>
      )}

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Edit class form */}
      {!loading && !error && (
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
                  disabled={saving}
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
                  disabled={saving}
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
                    to={`/teacher/classes/${id}`}
                    sx={{ mr: 2 }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={saving}
                    sx={{
                      bgcolor: '#2e7d32',
                      '&:hover': { bgcolor: '#1b5e20' },
                      px: 4
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
    </Container>
  );
}

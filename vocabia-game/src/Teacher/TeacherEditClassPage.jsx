import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  useTheme
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  School as ClassIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function TeacherEditClassPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/teacher/classes/${id}`);
        setName(response.data.name);
        setDescription(response.data.description || "");
        setError(null);
      } catch (err) {
        console.error("Failed to fetch class data:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to edit this class");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await api.put(`/api/teacher/classes/${id}`, { name, description });
      setSuccess(true);
      setTimeout(() => navigate("/teacher/classes"), 1500);
    } catch (err) {
      console.error("Failed to update class:", err);
      setError(err.response?.data?.message || "Failed to update class");
    } finally {
      setSubmitting(false);
    }
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
          Back to Classes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            variant="text"
            startIcon={<BackIcon />}
            onClick={() => navigate("/teacher/classes")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Edit Class
          </Typography>
        </Box>

        {/* Form Card */}
        <Card elevation={0} sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}>
          <CardContent>
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Class updated successfully!
              </Alert>
            )}
            
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
                    disabled={submitting}
                    InputLabelProps={{ shrink: true }}
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
                    disabled={submitting}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/teacher/classes")}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={submitting || !name.trim()}
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Class Preview */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Preview
          </Typography>
          <Paper elevation={0} sx={{ 
            p: 3, 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ClassIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {name || "Class Name"}
                </Typography>
                <Typography color="text.secondary">
                  {description || "Class description will appear here"}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
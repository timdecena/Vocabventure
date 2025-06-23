import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  School as ClassIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function TeacherCreateClassPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Class name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/api/teacher/classes", { name, description });
      navigate("/teacher/classes");
    } catch (err) {
      console.error("Failed to create class:", err);
      setError(err.response?.data?.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setTempName(name);
    setTempDescription(description);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const saveEditChanges = () => {
    setName(tempName);
    setDescription(tempDescription);
    closeEditModal();
  };

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: "#f9fafc", 
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Button
            variant="text"
            startIcon={<BackIcon />}
            onClick={() => navigate("/teacher/classes")}
            sx={{ mr: 2 }}
          >
            Back to Classes
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create New Class
          </Typography>
        </Box>

        {/* Form Card */}
        <Card elevation={0} sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          backgroundColor: "background.paper"
        }}>
          <CardContent>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              mb: 3,
              p: 2,
              backgroundColor: "primary.light",
              borderRadius: 1,
              color: "primary.main"
            }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ClassIcon sx={{ mr: 1.5, fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Class Information
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={openEditModal}
                sx={{ color: "primary.contrastText" }}
              >
                Edit
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Class Name *"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    helperText="Required field"
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
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    helperText="Optional description for your class"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "flex-end", 
                    gap: 2,
                    pt: 2
                  }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/teacher/classes")}
                      disabled={loading}
                      sx={{ minWidth: 120 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                      disabled={loading || !name.trim()}
                      sx={{ minWidth: 120 }}
                    >
                      {loading ? "Creating..." : "Create Class"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Paper elevation={0} sx={{ 
          mt: 4,
          p: 3, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          backgroundColor: "background.paper"
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Class Preview
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ClassIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {name || "New Class"}
              </Typography>
              <Typography color="text.secondary">
                {description || "Class description will appear here"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Edit Class Modal */}
        <Dialog
          open={editModalOpen}
          onClose={closeEditModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: "primary.light",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center"
          }}>
            <EditIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Edit Class Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Class Name *"
                  variant="outlined"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  multiline
                  rows={4}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            <Button 
              onClick={closeEditModal}
              variant="outlined"
              sx={{ borderRadius: 1 }}
            >
              Cancel
            </Button>
            <Button
              onClick={saveEditChanges}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 1 }}
              disabled={!tempName.trim()}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
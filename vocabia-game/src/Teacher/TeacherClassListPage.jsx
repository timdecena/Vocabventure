import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Paper
} from "@mui/material";
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as StudentsIcon,
  Class as ClassIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function TeacherClassListPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/api/teacher/classes");
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError("Failed to load classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/api/teacher/classes/${id}`);
      setClasses(prev => prev.filter(c => c.id !== id));
      showSnackbar("Class deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete class:", err);
      showSnackbar("Failed to delete class", "error");
    }
  };

  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code);
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
        minHeight: "200px"
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      backgroundColor: "#f9fafc",
      minHeight: "100vh"
    }}>
      <Box sx={{ 
        maxWidth: "1200px",
        mx: "auto"
      }}>
        {/* Header Section */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 4 
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            color: "text.primary"
          }}>
            <ClassIcon sx={{ 
              verticalAlign: "middle", 
              mr: 1.5, 
              color: "primary.main",
              fontSize: "inherit" 
            }} />
            My Classes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/teacher/classes/create")}
            sx={{ 
              borderRadius: "8px",
              textTransform: "none",
              px: 3,
              py: 1
            }}
          >
            New Class
          </Button>
        </Box>

        {/* Class List */}
        {classes.length === 0 ? (
          <Paper elevation={0} sx={{ 
            p: 4, 
            textAlign: "center",
            borderRadius: "12px",
            backgroundColor: "background.paper",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)"
          }}>
            <ClassIcon sx={{ 
              fontSize: 60, 
              color: "text.disabled", 
              mb: 2 
            }} />
            <Typography variant="h6" sx={{ 
              mb: 1,
              color: "text.primary"
            }}>
              No Classes Found
            </Typography>
            <Typography variant="body1" sx={{ 
              mb: 3,
              color: "text.secondary"
            }}>
              Get started by creating your first class.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/teacher/classes/create")}
              sx={{ 
                borderRadius: "8px",
                textTransform: "none",
                px: 3
              }}
            >
              Create Class
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {classes.map((cls) => (
              <Grid item xs={12} sm={6} md={4} key={cls.id}>
                <Card sx={{ 
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      color: "text.primary"
                    }}>
                      {cls.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 2,
                      color: "text.secondary",
                      minHeight: "40px"
                    }}>
                      {cls.description || "No description provided"}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: "text.secondary",
                        fontWeight: 500
                      }}>
                        Class Code
                      </Typography>
                      <Box sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        mt: 1 
                      }}>
                        <Chip
                          label={cls.joinCode}
                          size="small"
                          sx={{ 
                            mr: 1,
                            fontWeight: 600,
                            backgroundColor: "grey.100",
                            color: "text.primary"
                          }}
                        />
                        <Tooltip title="Copy join code">
                          <IconButton 
                            size="small" 
                            onClick={() => copyJoinCode(cls.joinCode)}
                            sx={{
                              "&:hover": {
                                backgroundColor: "primary.light",
                                color: "primary.main"
                              }
                            }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ 
                    p: 2,
                    borderTop: "1px solid",
                    borderColor: "divider"
                  }}>
                    <Tooltip title="View class">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "primary.light",
                            color: "primary.main"
                          }
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit class">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/teacher/classes/${cls.id}/edit`)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "secondary.light",
                            color: "secondary.main"
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="View students">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/teacher/classes/${cls.id}/students`)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "info.light",
                            color: "info.main"
                          }
                        }}
                      >
                        <StudentsIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Box sx={{ flexGrow: 1 }} />
                    
                    <Tooltip title="Delete class">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(cls.id)}
                        sx={{ 
                          color: "error.light",
                          "&:hover": {
                            backgroundColor: "error.light",
                            color: "error.main"
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ 
              width: "100%",
              borderRadius: "8px"
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
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
  DialogActions,
  Chip,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  School as ClassIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function TeacherCreateClassPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
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
      await api.post("/api/teacher/classes", { 
        name, 
        description,
        words
      });
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

  const handleAddWord = () => {
    if (currentWord.trim() && !words.includes(currentWord.trim().toLowerCase())) {
      setWords([...words, currentWord.trim().toLowerCase()]);
      setCurrentWord("");
    }
  };

  const handleRemoveWord = (wordToRemove) => {
    setWords(words.filter(word => word !== wordToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: "#f5f7fa", 
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start"
    }}>
      <Box sx={{ 
        maxWidth: 800, 
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3
      }}>
        {/* Header */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => navigate("/teacher/classes")}
              sx={{ mr: 1 }}
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: theme.palette.primary.dark
            }}>
              Create New Class
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ClassIcon />}
            onClick={() => navigate("/teacher/classes")}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: 'none'
            }}
          >
            View All Classes
          </Button>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              backgroundColor: "background.paper",
              height: "100%"
            }}>
              <CardContent>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 3,
                  p: 2,
                  backgroundColor: theme.palette.primary.lighter,
                  borderRadius: 2,
                }}>
                  <ClassIcon sx={{ 
                    mr: 2, 
                    fontSize: 32,
                    color: theme.palette.primary.main 
                  }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: theme.palette.primary.dark
                  }}>
                    Class Information
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
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
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
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
                        rows={3}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>

                    {/* Words Section */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 600,
                        mb: 1,
                        color: theme.palette.text.secondary
                      }}>
                        Add Vocabulary Words
                      </Typography>
                      <Box sx={{ 
                        display: 'flex',
                        gap: 1,
                        mb: 1
                      }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Add a word..."
                          value={currentWord}
                          onChange={(e) => setCurrentWord(e.target.value)}
                          onKeyPress={handleKeyPress}
                          InputProps={{
                            sx: { 
                              borderRadius: 2,
                              backgroundColor: theme.palette.background.default
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAddWord}
                          disabled={!currentWord.trim()}
                          sx={{ 
                            borderRadius: 2,
                            minWidth: 100
                          }}
                        >
                          Add
                        </Button>
                      </Box>
                      
                      {words.length > 0 && (
                        <Paper elevation={0} sx={{ 
                          p: 2,
                          mt: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          maxHeight: 200,
                          overflow: 'auto'
                        }}>
                          <Grid container spacing={1}>
                            {words.map((word, index) => (
                              <Grid item key={index}>
                                <Chip
                                  label={word}
                                  onDelete={() => handleRemoveWord(word)}
                                  deleteIcon={<CloseIcon />}
                                  sx={{ 
                                    borderRadius: 1,
                                    backgroundColor: theme.palette.primary.lighter,
                                    '& .MuiChip-deleteIcon': {
                                      color: theme.palette.error.main
                                    }
                                  }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      )}
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
                          sx={{ 
                            borderRadius: 2,
                            minWidth: 120,
                            textTransform: 'none'
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                          disabled={loading || !name.trim()}
                          sx={{ 
                            borderRadius: 2,
                            minWidth: 120,
                            textTransform: 'none',
                            boxShadow: 'none'
                          }}
                        >
                          {loading ? "Creating..." : "Create Class"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Preview Section */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              backgroundColor: "background.paper",
              height: "100%"
            }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 600,
                color: theme.palette.primary.dark
              }}>
                Class Preview
              </Typography>
              
              <Box sx={{ 
                display: "flex", 
                alignItems: "center",
                mb: 3,
                p: 2,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2
              }}>
                <Avatar sx={{ 
                  mr: 2, 
                  width: 56, 
                  height: 56,
                  backgroundColor: theme.palette.primary.lighter,
                  color: theme.palette.primary.main
                }}>
                  <ClassIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {name || "New Class"}
                  </Typography>
                  <Typography color="text.secondary">
                    {description || "No description provided"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600,
                mb: 2,
                color: theme.palette.text.secondary
              }}>
                Vocabulary Words ({words.length})
              </Typography>

              {words.length > 0 ? (
                <List dense sx={{ 
                  maxHeight: 300,
                  overflow: 'auto',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}>
                  {words.map((word, index) => (
                    <ListItem key={index} sx={{ 
                      borderBottom: index < words.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                    }}>
                      <ListItemText 
                        primary={word} 
                        primaryTypographyProps={{ 
                          sx: { 
                            fontWeight: 500,
                            color: theme.palette.text.primary
                          } 
                        }} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveWord(word)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Paper elevation={0} sx={{ 
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 2
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No words added yet
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Edit Class Modal */}
        <Dialog
          open={editModalOpen}
          onClose={closeEditModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: theme.palette.primary.lighter,
            color: theme.palette.primary.dark,
            display: "flex",
            alignItems: "center",
            fontWeight: 600
          }}>
            <EditIcon sx={{ mr: 1.5 }} />
            Edit Class Details
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
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
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
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
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
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={saveEditChanges}
              variant="contained"
              color="primary"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 'none'
              }}
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
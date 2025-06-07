import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Grid,
  Tooltip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import LogoutIcon from '@mui/icons-material/Logout';
import EditNoteIcon from '@mui/icons-material/EditNote';
import api from '../api/api';
import '../styles/TeacherHomeNature.css';

const TeacherHome = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  // Modal state
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Modal open/close
  const handleOpen = () => {
    setSuccessMsg('');
    setErrorMsg('');
    setClassName('');
    setClassDescription('');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // Submit class creation
  const handleCreateClass = async () => {
    if (!className.trim()) {
      setErrorMsg("Class name is required!");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post("/teacher/classes", {
        name: className,
        description: classDescription,
      });
      setSuccessMsg("Class created successfully!");
      setLoading(false);
      // Optionally, refresh class list here if shown on home page
      setTimeout(() => {
        setOpen(false);
      }, 1000);
    } catch (err) {
      setErrorMsg("Failed to create class. Try again.");
      setLoading(false);
    }
  };

  return (
    <Box className="nature-teacher-root">
      <div className="nature-teacher-bg" />
      <Box className="nature-teacher-content" p={3}>
        {/* Header with Avatar */}
        <Box className="nature-teacher-header" display="flex" alignItems="center" mb={4}>
          <Avatar
            src="/nature/owl_teacher.png"
            alt="Teacher Owl Mascot"
            className="nature-teacher-avatar"
            sx={{ width: 60, height: 60, mr: 2 }}
          />
          <Box>
            <Typography variant="h4" className="nature-teacher-title" fontWeight="bold">
              Welcome, Teacher!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Inspire, create, and guide adventurers.
            </Typography>
          </Box>
        </Box>

        {/* Main Actions */}
        <Grid container spacing={3} mb={3} className="nature-teacher-btn-row">
          <Grid item xs={12} md={4}>
            <Tooltip title="View all your classes" arrow>
              <Button
                className="nature-teacher-btn"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<SchoolIcon />}
                onClick={() => navigate('/teacher/classes')}
              >
                My Classes
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Create a new class" arrow>
              <Button
                className="nature-teacher-btn"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleOpen}
              >
                Create Class
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Design custom spelling adventures" arrow>
              <Button
                className="nature-teacher-btn"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<EditNoteIcon />}
                onClick={() => navigate('/teacher/spelling/create')}
              >
                Create Spelling Level
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Modular Class Creation Modal */}
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogTitle>
            <EmojiNatureIcon sx={{ color: "#5cb675", mr: 1, mb: -0.6 }} />
            Create a New Class
          </DialogTitle>
          <DialogContent>
            {successMsg && <Alert severity="success">{successMsg}</Alert>}
            {errorMsg && <Alert severity="error" sx={{ mb: 1 }}>{errorMsg}</Alert>}
            <TextField
              label="Class Name"
              value={className}
              onChange={e => setClassName(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              autoFocus
              className="nature-teacher-modal-input"
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              label="Description (optional)"
              value={classDescription}
              onChange={e => setClassDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
              maxRows={4}
              variant="outlined"
              className="nature-teacher-modal-input"
              inputProps={{ maxLength: 200 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} color="inherit" disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateClass}
              className="nature-teacher-btn"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Nature Themed Card / Message */}
        <Card className="nature-teacher-card" elevation={6}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <EmojiNatureIcon sx={{ color: "#41824d", fontSize: 36 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary.dark">
                  Tip: Your role shapes the journey!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Every class you create is a new adventure—invite students, build spelling quests, and track their progress as they grow through the enchanted forest!
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Logout */}
        <Box mt={5} textAlign="center">
          <Button
            className="nature-teacher-btn logout-btn"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TeacherHome;

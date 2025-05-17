// File: src/components/JoinClassDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

const JoinClassDialog = ({ open, onClose, onJoined }) => {
  const [joinCode, setJoinCode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleJoinClass = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8081/api/student/class/join',
        null,
        {
          params: { joinCode },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setSnackbar({ open: true, message: 'Successfully joined the class!', severity: 'success' });
      setJoinCode('');
      onJoined(); // Refresh class list or notify parent
      onClose();  // Close dialog
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Failed to join class.',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Join a Class</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Join Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleJoinClass} variant="contained" color="primary">Join</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default JoinClassDialog;

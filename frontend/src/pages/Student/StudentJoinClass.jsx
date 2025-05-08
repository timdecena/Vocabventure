import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const StudentJoinClass = () => {
  const [joinCode, setJoinCode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleJoinClass = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8081/api/teacher/class/join',
        null,
        {
          params: { joinCode },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setSnackbar({ open: true, message: 'Successfully joined the class!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to join class.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Join a Class</Typography>
      <TextField
        label="Join Code"
        fullWidth
        variant="outlined"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleJoinClass}>
        Join Class
      </Button>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentJoinClass;
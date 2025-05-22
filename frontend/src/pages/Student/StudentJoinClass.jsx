import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import JoinClassDialog from './JoinClassDialog';

const StudentJoinClass = ({ onJoined }) => {
  const [code, setCode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [joinedClass, setJoinedClass] = useState(null);

  const handleJoin = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:8081/api/student/class/join',
        { joinCode: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoinedClass(res.data);
      setCode('');
      if (onJoined) onJoined(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to join class.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <Box>
      <TextField
        label="Enter Join Code"
        fullWidth
        value={code}
        onChange={(e) => setCode(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        fullWidth
        disabled={!code.trim()}
        onClick={handleJoin}
      >
        Join Class
      </Button>

      <JoinClassDialog
        open={!!joinedClass}
        onClose={() => setJoinedClass(null)}
        classData={joinedClass || {}}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentJoinClass;

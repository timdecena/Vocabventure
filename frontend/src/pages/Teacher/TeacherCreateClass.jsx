import React, { useState } from 'react';
import { Box, TextField, Button, Snackbar, Alert, Typography } from '@mui/material';
import axios from 'axios';

const TeacherCreateClass = ({ onClassCreated }) => {
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:8081/api/teacher/classes',
        { className, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJoinCode(res.data.joinCode);
      setSnackbar({ open: true, message: 'Class created successfully!', severity: 'success' });
      setClassName('');
      setDescription('');
      if (onClassCreated) onClassCreated(res.data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to create class.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <TextField
        label="Class Name"
        fullWidth
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Description"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={handleCreate}
        disabled={!className || !description}
      >
        Create Class
      </Button>
      {joinCode && (
        <Typography sx={{ mt: 2, fontWeight: 'bold', color: 'lime' }}>
          Class Code: {joinCode}
        </Typography>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherCreateClass;

import React, { useState } from 'react';
import { Box, TextField, Button, Snackbar, Alert, Typography } from '@mui/material';
import axios from 'axios';

const TeacherCreateClass = ({ onClassCreated }) => {
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [createdClassCode, setCreatedClassCode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCreateClass = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8081/api/teacher/class',
        { className, description },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setClassName('');
      setDescription('');
      setCreatedClassCode(response.data.classCode); // store new class code

      setSnackbar({
        open: true,
        message: 'Class created successfully!',
        severity: 'success',
      });

      if (onClassCreated) {
        onClassCreated(response.data); // include full class object
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to create class.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        label="Class Name"
        fullWidth
        variant="outlined"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Description"
        fullWidth
        variant="outlined"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateClass}
        disabled={!className.trim() || !description.trim()}
        fullWidth
      >
        Create Class
      </Button>

      {createdClassCode && (
        <Typography sx={{ mt: 2, fontWeight: 'bold', color: 'lime' }}>
          Class Code: {createdClassCode}
        </Typography>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherCreateClass;

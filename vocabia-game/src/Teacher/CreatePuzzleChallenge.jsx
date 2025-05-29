import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Grid, Paper,
  CircularProgress, Alert, FormControl, InputLabel,
  Select, MenuItem
} from '@mui/material';
import axios from 'axios';

const SERVER_URL = "http://localhost:8080";

export default function CreatePuzzleChallenge({ classes }) {
  const [images, setImages] = useState([null, null, null, null]);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null]);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      // Update image file
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate
    if (images.some(img => !img)) {
      setError('Please provide all 4 images');
      setLoading(false);
      return;
    }
    if (!answer.trim()) {
      setError('Please provide an answer');
      setLoading(false);
      return;
    }

    // Create form data
    const formData = new FormData();
    images.forEach((img, idx) => formData.append('images', img));
    formData.append('answer', answer.trim());
    formData.append('hint', hint.trim());
    if (targetClass) formData.append('targetClass', targetClass);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${SERVER_URL}/api/teacher/challenges/create`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setSuccess('Challenge created successfully!');
      // Reset form
      setImages([null, null, null, null]);
      setImagePreviews([null, null, null, null]);
      setAnswer('');
      setHint('');
      setTargetClass('');
    } catch (err) {
      setError(err.response?.data || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create 4 Pics 1 Word Challenge
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {[0, 1, 2, 3].map((index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '200px',
                position: 'relative'
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, index)}
                style={{ display: 'none' }}
                id={`image-input-${index}`}
              />
              {imagePreviews[index] ? (
                <Box
                  component="img"
                  src={imagePreviews[index]}
                  alt={`Preview ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById(`image-input-${index}`).click()}
                />
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor={`image-input-${index}`}
                  sx={{ height: '100%', width: '100%' }}
                >
                  Upload Image {index + 1}
                </Button>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hint (Optional)"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
            />
          </Grid>
          {classes && classes.length > 0 && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Class (Optional)</InputLabel>
                <Select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  label="Target Class (Optional)"
                >
                  <MenuItem value="">
                    <em>None (Available to all)</em>
                  </MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ mt: 3 }}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Create Challenge'}
      </Button>
    </Box>
  );
}

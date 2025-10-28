import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function TeacherCreateFPOW() {
  const [form, setForm] = useState({
    category: '',
    level: '',
    answer: '',
    hint: '',
    hintType: 'TEXT_HINT',
    difficulty: 'EASY',
    image1Url: '',
    image2Url: '',
    image3Url: '',
    image4Url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in as a teacher.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('category', form.category);
    formData.append('level', form.level);
    formData.append('answer', form.answer);
    formData.append('hint', form.hint);
    formData.append('hintType', form.hintType);
    formData.append('difficulty', form.difficulty);

    if (form.images) {
      Array.from(form.images).forEach((file) => {
        formData.append('images', file);
      });
    }

    await api.post('/api/fpow/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success('✅ Level created successfully!');
    navigate('/teacher/classes');
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || 'Failed to create level.');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Create 4Pics1Word Level
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Category"
                value={form.category}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="level"
                label="Level Number"
                type="number"
                value={form.level}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="answer"
                label="Answer Word"
                value={form.answer}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="hint"
                label="Hint (optional)"
                value={form.hint}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="hintType"
                label="Hint Type"
                value={form.hintType}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="TEXT_HINT">Text Hint</MenuItem>
                <MenuItem value="REVEAL_LETTER">Reveal Letter</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="difficulty"
                label="Difficulty"
                value={form.difficulty}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="EASY">Easy</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HARD">Hard</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
    Upload 1–4 Images
  </Typography>
  <Button
    variant="contained"
    component="label"
    startIcon={<AddPhotoAlternateIcon />}
  >
    Upload Images
    <input
      type="file"
      hidden
      name="images"
      accept="image/*"
      multiple
      onChange={(e) => setForm(prev => ({ ...prev, images: e.target.files }))}
    />
  </Button>
  {form.images && (
    <Typography sx={{ mt: 1 }}>
      {form.images.length} image(s) selected
    </Typography>
  )}
</Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Level'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

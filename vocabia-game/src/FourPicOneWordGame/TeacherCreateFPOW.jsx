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

      const res = await api.post('/api/fpow/create', form);
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
                Image URLs (1–4 allowed)
              </Typography>
              {[1, 2, 3, 4].map((i) => (
                <TextField
                  key={i}
                  name={`image${i}Url`}
                  label={`Image ${i} URL`}
                  value={form[`image${i}Url`]}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <AddPhotoAlternateIcon sx={{ mr: 1 }} />,
                  }}
                />
              ))}
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

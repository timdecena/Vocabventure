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
  Alert,
  Card,
  CardMedia,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
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
  });
  const [images, setImages] = useState([]); // Dynamic image array
  const [imagePreviews, setImagePreviews] = useState([]); // Preview URLs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Dynamic image handling functions
  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count (max 4 total)
    if (images.length + files.length > 4) {
      setError('Maximum 4 images allowed per puzzle');
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const validPreviews = [];

    files.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not a valid image file`);
        return;
      }

      // Check file size (3MB max)
      if (file.size > 3 * 1024 * 1024) {
        setError(`${file.name} is too large. Maximum size is 3MB`);
        return;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...validPreviews]);
      setError(''); // Clear any previous errors
    }

    // Reset file input
    e.target.value = '';
  };

  const handleImageRemove = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageReorder = (fromIndex, toIndex) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    // Swap images
    [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]];
    [newPreviews[fromIndex], newPreviews[toIndex]] = [newPreviews[toIndex], newPreviews[fromIndex]];
    
    setImages(newImages);
    setImagePreviews(newPreviews);
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

      // ✅ Validate minimum image requirement
      if (images.length === 0) {
        setError('At least 1 image is required to create a puzzle.');
        setLoading(false);
        return;
      }

      // ✅ Validate form fields
      if (!form.category.trim() || !form.level || !form.answer.trim()) {
        setError('Category, level, and answer are required fields.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('category', form.category.trim());
      formData.append('level', form.level);
      formData.append('answer', form.answer.trim().toUpperCase());
      formData.append('hint', form.hint.trim());
      formData.append('hintType', form.hintType);
      formData.append('difficulty', form.difficulty);

      // ✅ Append dynamic images (1-4 images)
      images.forEach((file) => {
        formData.append('images', file);
      });

      console.log(`🎯 Creating FPOW puzzle with ${images.length} images`);

      await api.post('/api/fpow/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`✅ Puzzle created successfully with ${images.length} image${images.length > 1 ? 's' : ''}!`);
      navigate('/teacher/classes');
    } catch (err) {
      console.error('FPOW Creation Error:', err);
      setError(err.response?.data || err.message || 'Failed to create puzzle.');
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

            {/* ✅ Dynamic Image Upload Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Upload Images (1-4 required)
              </Typography>
              
              {/* Image Upload Button */}
              <Button
                variant="contained"
                component="label"
                startIcon={<AddPhotoAlternateIcon />}
                disabled={images.length >= 4}
                sx={{ mb: 2 }}
              >
                {images.length === 0 ? 'Add Images' : `Add More Images (${images.length}/4)`}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageAdd}
                />
              </Button>

              {/* Image Count Indicator */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={`${images.length} image${images.length !== 1 ? 's' : ''} selected`}
                  color={images.length === 0 ? 'error' : 'success'}
                  variant={images.length === 0 ? 'outlined' : 'filled'}
                />
                {images.length > 0 && (
                  <Chip 
                    label="Ready to create"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <Grid container spacing={2}>
                  {imagePreviews.map((preview, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Card sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={preview}
                          alt={`Preview ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleImageRemove(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            position: 'absolute', 
                            bottom: 4, 
                            left: 4, 
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            px: 1,
                            borderRadius: 1
                          }}
                        >
                          Image {index + 1}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Preview Button */}
              {images.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => setShowPreview(!showPreview)}
                  sx={{ mt: 2 }}
                >
                  {showPreview ? 'Hide Preview' : 'Preview Puzzle'}
                </Button>
              )}

              {/* Live Preview Section */}
              {showPreview && images.length > 0 && (
                <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🎮 Student View Preview
                  </Typography>
                  <Grid container spacing={1}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={6} key={index}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="100"
                            image={preview}
                            alt={`Game preview ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Answer: {form.answer || '(Enter answer above)'}
                  </Typography>
                  {form.hint && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Hint: {form.hint}
                    </Typography>
                  )}
                </Paper>
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

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  IconButton,
  Chip,
  Stack,
  Container,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  colors,
  StyledCard,
  PageTitle,
  SecondaryButton,
  PrimaryButton,
  StyledInput,
  SectionHeader,
} from '../Teacher/components/DesignSystem';

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
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <PageTitle icon={<CloudUploadIcon />}>
          Create 4Pics1Word Level
        </PageTitle>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <StyledCard sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <SectionHeader>Level Information</SectionHeader>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledInput
                name="category"
                label="Category *"
                value={form.category}
                onChange={handleChange}
                required
                placeholder="e.g., Animals, Food, Sports"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledInput
                name="level"
                label="Level Number *"
                type="number"
                value={form.level}
                onChange={handleChange}
                required
                placeholder="e.g., 1, 2, 3"
              />
            </Grid>
            <Grid item xs={12}>
              <StyledInput
                name="answer"
                label="Answer Word *"
                value={form.answer}
                onChange={handleChange}
                required
                placeholder="Enter the correct answer"
                helperText="This will be converted to uppercase automatically"
              />
            </Grid>
            <Grid item xs={12}>
              <StyledInput
                name="hint"
                label="Hint (Optional)"
                value={form.hint}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Provide a helpful hint for students"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                name="hintType"
                label="Hint Type"
                value={form.hintType}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: colors.cardBg,
                    '& fieldset': { borderColor: colors.border, borderWidth: '2px' },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: '2px' },
                  },
                }}
              >
                <MenuItem value="TEXT_HINT">Text Hint</MenuItem>
                <MenuItem value="REVEAL_LETTER">Reveal Letter</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                name="difficulty"
                label="Difficulty"
                value={form.difficulty}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: colors.cardBg,
                    '& fieldset': { borderColor: colors.border, borderWidth: '2px' },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: '2px' },
                  },
                }}
              >
                <MenuItem value="EASY">Easy</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HARD">Hard</MenuItem>
              </TextField>
            </Grid>

            {/* ✅ Dynamic Image Upload Section */}
            <Grid item xs={12}>
              <SectionHeader sx={{ mt: 3 }}>Upload Images (1-4 required)</SectionHeader>
              
              {/* Drag and Drop Area */}
              <Box
                sx={{
                  border: `2px dashed ${images.length >= 4 ? colors.border : colors.primary}`,
                  borderRadius: '12px',
                  p: 4,
                  textAlign: 'center',
                  bgcolor: images.length >= 4 ? colors.border + '20' : colors.primary + '10',
                  cursor: images.length >= 4 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  mb: 3,
                  '&:hover': images.length < 4 ? {
                    borderColor: colors.primaryDark,
                    bgcolor: colors.primary + '20',
                  } : {},
                }}
                component="label"
              >
                <AddPhotoAlternateIcon sx={{ fontSize: 48, color: images.length >= 4 ? colors.textLight : colors.primary, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, mb: 1 }}>
                  {images.length === 0 ? 'Click to Upload Images' : `Add More Images (${images.length}/4)`}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight }}>
                  Drag and drop or click to browse • Max 4 images • 3MB each
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageAdd}
                  disabled={images.length >= 4}
                />
              </Box>

              {/* Image Count Indicator */}
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Chip 
                  label={`${images.length} image${images.length !== 1 ? 's' : ''} selected`}
                  sx={{
                    bgcolor: images.length === 0 ? colors.error + '20' : colors.success + '20',
                    color: images.length === 0 ? colors.error : colors.success,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                />
                {images.length > 0 && (
                  <Chip 
                    label="✓ Ready to create"
                    sx={{
                      bgcolor: colors.primary + '20',
                      color: colors.primary,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <Grid container spacing={2}>
                  {imagePreviews.map((preview, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Card 
                        sx={{ 
                          position: 'relative',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: `2px solid ${colors.border}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: colors.primary,
                            transform: 'translateY(-4px)',
                            boxShadow: `0 4px 12px ${colors.primary}40`,
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={preview}
                          alt={`Preview ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleImageRemove(index)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: colors.error,
                            color: '#FFFFFF',
                            '&:hover': { 
                              backgroundColor: colors.error,
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <Box
                          sx={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0,
                            right: 0,
                            backgroundColor: colors.primary,
                            color: '#FFFFFF',
                            py: 0.5,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Image {index + 1}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Preview Button */}
              {images.length > 0 && (
                <PrimaryButton
                  startIcon={<PreviewIcon />}
                  onClick={() => setShowPreview(!showPreview)}
                  sx={{ mt: 3 }}
                >
                  {showPreview ? 'Hide Preview' : 'Preview Puzzle'}
                </PrimaryButton>
              )}

              {/* Live Preview Section */}
              {showPreview && images.length > 0 && (
                <StyledCard sx={{ p: 3, mt: 3, bgcolor: colors.primary + '10', border: `2px solid ${colors.primary}` }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: colors.primary }}>
                    🎮 Student View Preview
                  </Typography>
                  <Grid container spacing={2}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={6} key={index}>
                        <Card sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            height="120"
                            image={preview}
                            alt={`Game preview ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 2, p: 2, bgcolor: colors.cardBg, borderRadius: '8px' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.text }}>
                      Answer: {form.answer || '(Enter answer above)'}
                    </Typography>
                    {form.hint && (
                      <Typography variant="body2" sx={{ color: colors.textLight, mt: 1 }}>
                        💡 Hint: {form.hint}
                      </Typography>
                    )}
                  </Box>
                </StyledCard>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <SecondaryButton
                  type="submit"
                  size="large"
                  fullWidth
                  disabled={loading || images.length === 0}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                >
                  {loading ? 'Creating...' : 'Create Level'}
                </SecondaryButton>
              </Box>
            </Grid>
          </Grid>
        </form>
        </StyledCard>
      </Container>
    </Box>
  );
}

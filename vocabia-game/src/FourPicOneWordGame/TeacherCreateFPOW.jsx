import React, { useState, useEffect } from 'react';
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
  Divider,
  Paper,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  colors,
  StyledCard,
  PageTitle,
  SecondaryButton,
  PrimaryButton,
  GhostButton,
  StyledInput,
  SectionHeader,
} from '../Teacher/components/DesignSystem';

export default function TeacherCreateFPOW() {
  const [form, setForm] = useState({
    classroomId: '',
    category: '',
    level: '',
    answer: '',
    hint: '',
    hintType: 'TEXT_HINT',
    difficulty: 'EASY',
  });
  const [classrooms, setClassrooms] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const navigate = useNavigate();

  // Fetch teacher's classrooms on component mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await api.get('/api/teacher/classes');
        setClassrooms(res.data || []);
        // Auto-select first classroom if available
        if (res.data && res.data.length > 0) {
          setForm(prev => ({ ...prev, classroomId: res.data[0].id.toString() }));
        }
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setError('Failed to load classrooms. Please refresh the page.');
      } finally {
        setLoadingClassrooms(false);
      }
    };
    fetchClassrooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ensure classroomId is stored as string for consistency
    if (name === 'classroomId') {
      setForm(prev => ({ ...prev, [name]: value.toString() }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 4) {
      setError('Maximum 4 images allowed per puzzle');
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not a valid image file`);
        return;
      }

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
      setError('');
    }

    e.target.value = '';
  };

  const handleImageRemove = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    const [movedImage] = newImages.splice(dragIndex, 1);
    const [movedPreview] = newPreviews.splice(dragIndex, 1);
    
    newImages.splice(dropIndex, 0, movedImage);
    newPreviews.splice(dropIndex, 0, movedPreview);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    setDragIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form before submission
      if (images.length === 0) {
        setError('At least 1 image is required to create a puzzle.');
        setLoading(false);
        return;
      }

      if (!form.classroomId) {
        setError('Please select a classroom.');
        setLoading(false);
        return;
      }

      if (!form.category.trim() || !form.level || !form.answer.trim()) {
        setError('Category, level, and answer are required fields.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('classroomId', form.classroomId);
      formData.append('category', form.category.trim());
      formData.append('level', form.level);
      formData.append('answer', form.answer.trim().toUpperCase());
      if (form.hint && form.hint.trim()) {
        formData.append('hint', form.hint.trim());
      }
      formData.append('hintType', form.hintType);
      formData.append('difficulty', form.difficulty);

      images.forEach((file) => {
        formData.append('images', file);
      });

      console.log(`🎯 Creating FPOW puzzle with ${images.length} image${images.length !== 1 ? 's' : ''}`);

      await api.post('/api/fpow/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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

  // Validation helpers
  const isFormValid = () => {
    return form.classroomId && 
           form.category.trim() && 
           form.level && 
           form.answer.trim() && 
           images.length > 0;
  };

  const formCompletion = {
    classroom: !!form.classroomId,
    category: !!form.category.trim(),
    level: !!form.level,
    answer: !!form.answer.trim(),
    images: images.length > 0,
  };

  const completionCount = Object.values(formCompletion).filter(Boolean).length;
  const totalFields = Object.keys(formCompletion).length;
  const completionPercentage = (completionCount / totalFields) * 100;

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 4, pt: 2 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <PageTitle icon={<CloudUploadIcon sx={{ fontSize: 32 }} />}>
            Create 4 Pics 1 Word Level
          </PageTitle>
          <Typography 
            variant="body1" 
            sx={{ 
              color: colors.textLight, 
              mt: 1,
              fontWeight: 400,
              fontSize: '1rem'
            }}
          >
            Create engaging picture puzzles for your students
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '0.95rem' }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Progress Indicator */}
        {totalFields > 0 && (
          <StyledCard sx={{ mb: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                    Form Completion
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                    {completionCount}/{totalFields}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: colors.border,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${completionPercentage}%`,
                      bgcolor: completionPercentage === 100 ? colors.success : colors.primary,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
              {completionPercentage === 100 && (
                <CheckCircleIcon sx={{ color: colors.success, fontSize: 32 }} />
              )}
            </Box>
          </StyledCard>
        )}

        <StyledCard sx={{ p: { xs: 3, md: 4 } }}>
          <form onSubmit={handleSubmit}>
            {/* Level Information Section */}
            <SectionHeader sx={{ mb: 3 }}>Level Information</SectionHeader>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box>
                  <TextField
                    select
                    name="classroomId"
                    label="Select Classroom *"
                    value={form.classroomId}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={loadingClassrooms}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        bgcolor: colors.cardBg,
                        '& fieldset': { 
                          borderColor: formCompletion.classroom ? colors.success : colors.border, 
                          borderWidth: '2px',
                          transition: 'all 0.3s ease'
                        },
                        '&:hover fieldset': { borderColor: colors.primary },
                        '&.Mui-focused fieldset': { 
                          borderColor: colors.primary, 
                          borderWidth: '2px',
                          boxShadow: `0 0 0 3px ${colors.primary}20`
                        },
                      },
                      '& .MuiSelect-select': {
                        py: 1.5,
                      }
                    }}
                    helperText={loadingClassrooms ? "Loading classrooms..." : classrooms.length === 0 ? "No classrooms found. Please create a classroom first." : "Select which classroom this puzzle belongs to"}
                  >
                    {classrooms.map((classroom) => (
                      <MenuItem key={classroom.id} value={classroom.id.toString()}>
                        {classroom.name} {classroom.description && `- ${classroom.description}`}
                      </MenuItem>
                    ))}
                  </TextField>
                  {formCompletion.classroom && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: colors.success }} />
                      <Typography variant="caption" sx={{ color: colors.success, fontWeight: 500 }}>
                        Classroom selected
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <StyledInput
                    name="category"
                    label="Category *"
                    value={form.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Animals, Food, Sports"
                  />
                  {formCompletion.category && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: colors.success }} />
                      <Typography variant="caption" sx={{ color: colors.success, fontWeight: 500 }}>
                        Category entered
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <StyledInput
                    name="level"
                    label="Level Number *"
                    type="number"
                    value={form.level}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 1, 2, 3"
                    inputProps={{ min: 1 }}
                  />
                  {formCompletion.level && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: colors.success }} />
                      <Typography variant="caption" sx={{ color: colors.success, fontWeight: 500 }}>
                        Level number set
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box>
                  <StyledInput
                    name="answer"
                    label="Answer Word *"
                    value={form.answer}
                    onChange={handleChange}
                    required
                    placeholder="Enter the correct answer"
                    helperText="This will be converted to uppercase automatically"
                  />
                  {formCompletion.answer && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: colors.success }} />
                      <Typography variant="caption" sx={{ color: colors.success, fontWeight: 500 }}>
                        Answer: {form.answer.toUpperCase()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <StyledInput
                  name="hint"
                  label="Hint (Optional)"
                  value={form.hint}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Provide a helpful hint for students..."
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
                      '& fieldset': { 
                        borderColor: colors.border, 
                        borderWidth: '2px',
                        transition: 'all 0.3s ease'
                      },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { 
                        borderColor: colors.primary, 
                        borderWidth: '2px',
                        boxShadow: `0 0 0 3px ${colors.primary}20`
                      },
                    },
                    '& .MuiSelect-select': {
                      py: 1.5,
                    }
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
                  label="Difficulty Level"
                  value={form.difficulty}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: colors.cardBg,
                      '& fieldset': { 
                        borderColor: colors.border, 
                        borderWidth: '2px',
                        transition: 'all 0.3s ease'
                      },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { 
                        borderColor: colors.primary, 
                        borderWidth: '2px',
                        boxShadow: `0 0 0 3px ${colors.primary}20`
                      },
                    },
                    '& .MuiSelect-select': {
                      py: 1.5,
                    }
                  }}
                >
                  <MenuItem value="EASY">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: colors.success 
                      }} />
                      Easy
                    </Box>
                  </MenuItem>
                  <MenuItem value="MEDIUM">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: colors.warning 
                      }} />
                      Medium
                    </Box>
                  </MenuItem>
                  <MenuItem value="HARD">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: colors.error 
                      }} />
                      Hard
                    </Box>
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, opacity: 0.3 }} />

            {/* Image Upload Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <SectionHeader sx={{ mb: 0 }}>Upload Images</SectionHeader>
                {images.length > 0 && (
                  <Chip
                    label={`${images.length}/4 images`}
                    sx={{
                      bgcolor: images.length === 4 ? colors.success + '20' : colors.primary + '20',
                      color: images.length === 4 ? colors.success : colors.primary,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
              
              {!formCompletion.images && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon />
                    <Typography variant="body2">
                      At least 1 image is required to create a puzzle
                    </Typography>
                  </Box>
                </Alert>
              )}
              
              {/* Upload Area */}
              <Paper
                sx={{
                  border: `2px dashed ${images.length >= 4 ? colors.border : colors.primary}80`,
                  borderRadius: '16px',
                  p: 5,
                  textAlign: 'center',
                  bgcolor: images.length >= 4 ? colors.border + '15' : colors.primary + '08',
                  cursor: images.length >= 4 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  mb: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': images.length < 4 ? {
                    borderColor: colors.primary,
                    bgcolor: colors.primary + '12',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${colors.primary}20`,
                  } : {},
                }}
                component="label"
              >
                <AddPhotoAlternateIcon 
                  sx={{ 
                    fontSize: 56, 
                    color: images.length >= 4 ? colors.textLight : colors.primary, 
                    mb: 2,
                    opacity: 0.8
                  }} 
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                  {images.length === 0 ? 'Upload Puzzle Images' : `Add More Images (${images.length}/4)`}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, maxWidth: 400, mx: 'auto' }}>
                  Drag and drop images here or click to browse • Maximum 4 images • 3MB each
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageAdd}
                  disabled={images.length >= 4}
                />
              </Paper>

              {/* Status Chips */}
              <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={`${images.length} image${images.length !== 1 ? 's' : ''} selected`}
                  sx={{
                    bgcolor: images.length === 0 ? colors.error + '20' : colors.success + '20',
                    color: images.length === 0 ? colors.error : colors.success,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    height: 32,
                  }}
                />
                {images.length > 0 && (
                  <Chip 
                    label="Drag to reorder images"
                    variant="outlined"
                    sx={{
                      borderColor: colors.primary,
                      color: colors.primary,
                      fontWeight: 500,
                      height: 32,
                    }}
                  />
                )}
              </Stack>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <Grid container spacing={2}>
                  {imagePreviews.map((preview, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        sx={{ 
                          position: 'relative',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: `2px solid ${colors.border}`,
                          transition: 'all 0.3s ease',
                          cursor: 'grab',
                          '&:hover': {
                            borderColor: colors.primary,
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${colors.primary}30`,
                          },
                          '&:active': {
                            cursor: 'grabbing',
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="160"
                          image={preview}
                          alt={`Preview ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        
                        {/* Drag Handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            borderRadius: '4px',
                            p: 0.5,
                            color: 'white',
                            cursor: 'grab',
                          }}
                        >
                          <DragIndicatorIcon fontSize="small" />
                        </Box>

                        {/* Remove Button */}
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
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        {/* Image Number Badge */}
                        <Box
                          sx={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                            color: '#FFFFFF',
                            py: 1,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
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
                <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                  <SecondaryButton
                    startIcon={<PreviewIcon />}
                    onClick={() => setShowPreview(!showPreview)}
                    sx={{ 
                      px: 3,
                      borderRadius: 2
                    }}
                  >
                    {showPreview ? 'Hide Preview' : 'Preview Puzzle'}
                  </SecondaryButton>
                  {form.answer && (
                    <Chip
                      label={`Answer: ${form.answer.toUpperCase()}`}
                      sx={{
                        bgcolor: colors.primary + '15',
                        color: colors.primary,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        height: 36,
                      }}
                    />
                  )}
                </Box>
              )}

              {/* Live Preview Section */}
              {showPreview && images.length > 0 && (
                <Paper 
                  sx={{ 
                    p: 4, 
                    mt: 4, 
                    bgcolor: colors.primary + '08', 
                    border: `2px solid ${colors.primary}40`,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.secondary}08 100%)`
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    🎮 Student View Preview
                  </Typography>
                  
                  {/* Image Grid Preview */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={6} key={index}>
                        <Card 
                          sx={{ 
                            borderRadius: '12px', 
                            overflow: 'hidden',
                            border: `2px solid ${colors.border}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.02)',
                            }
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="140"
                            image={preview}
                            alt={`Game preview ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Answer & Hint Preview */}
                  <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: `1px solid ${colors.border}` }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                      🔍 What's the word?
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: colors.primary, 
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      letterSpacing: 2,
                      mb: 2
                    }}>
                      {form.answer.toUpperCase() || 'ENTER ANSWER'}
                    </Typography>
                    {form.hint && (
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: colors.warning + '15', 
                        borderRadius: 1,
                        border: `1px solid ${colors.warning}30`
                      }}>
                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
                          💡 Hint: {form.hint}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>

            <Divider sx={{ my: 4, opacity: 0.3 }} />

            {/* Submit Button */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}>
              <GhostButton
                onClick={() => navigate('/teacher/classes')}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                Cancel
              </GhostButton>
              <PrimaryButton
                type="submit"
                size="large"
                disabled={loading || !isFormValid()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                sx={{
                  minWidth: 200,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  background: loading || !isFormValid()
                    ? `${colors.textLight}40` 
                    : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                  '&:hover': {
                    transform: isFormValid() ? 'translateY(-2px)' : 'none',
                    boxShadow: isFormValid() ? `0 8px 25px ${colors.primary}40` : 'none',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Creating Puzzle...' : `Create Level with ${images.length} Image${images.length !== 1 ? 's' : ''}`}
              </PrimaryButton>
            </Box>
          </form>
        </StyledCard>
      </Box>
    </Box>
  );
}
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
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PreviewIcon from '@mui/icons-material/Preview';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
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
    classroomId: '',
    category: '',
    level: '',
    answer: '',
    hint: '',
    hintType: 'TEXT_HINT',
    difficulty: 'EASY',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [editId, setEditId] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
      if (!file.type.startsWith('image/')) return;
      if (file.size > 3 * 1024 * 1024) return;
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

  // Fetch FPOW entries for the selected classroom/category
  const fetchEntries = async (classroomId, category) => {
    if (!classroomId || !category) return;
    try {
      const res = await api.get('/api/fpow/entries', { params: { classroomId, category } });
      setEntries(res.data || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setEntries([]);
    }
  };

  // Load entries when classroom/category changes
  useEffect(() => {
    if (form.classroomId && form.category) {
      fetchEntries(form.classroomId, form.category);
    }
  }, [form.classroomId, form.category]);

  // Fetch teacher's classrooms on component mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await api.get('/api/teacher/classes');
        setClassrooms(res.data || []);
        // Auto-select first classroom if available
        if (res.data && res.data.length > 0) {
          setForm(prev => ({ ...prev, classroomId: res.data[0].id }));
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

  // Delete entry
  const handleDelete = async (entry) => {
    try {
      await api.delete(`/api/fpow/level/${entry.id}`);
      toast.success('Entry deleted successfully');
      fetchEntries(form.classroomId, form.category);
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data || err.message || 'Failed to delete entry';
      toast.error(errorMsg);
      console.error('Delete error:', err);
    }
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
    // If editing, use PUT instead of POST
    const isEditing = !!editId;

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

      // When creating, require images. When editing, images can be preserved from existing entry
      if (!isEditing && images.length === 0) {
        setError('At least 1 image is required to create a puzzle.');
        setLoading(false);
        return;
      }
      
      // When editing, require either new images or existing image previews
      if (isEditing && images.length === 0 && imagePreviews.length === 0) {
        setError('At least 1 image is required. Please upload images or keep existing ones.');
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
      formData.append('hint', form.hint.trim());
      formData.append('hintType', form.hintType);
      formData.append('difficulty', form.difficulty);

      images.forEach((file) => {
        formData.append('images', file);
      });

      console.log(`🎯 ${isEditing ? 'Updating' : 'Creating'} FPOW puzzle with ${images.length} new image(s)`);

      if (isEditing) {
        await api.put(`/api/fpow/level/${editId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('✅ Entry updated successfully!');
      } else {
        await api.post('/api/fpow/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(`✅ Puzzle created successfully with ${images.length} image${images.length > 1 ? 's' : ''}!`);
      }
      
      setEditId(null);
      setForm({
        classroomId: form.classroomId,
        category: form.category,
        level: '',
        answer: '',
        hint: '',
        hintType: 'TEXT_HINT',
        difficulty: 'EASY',
      });
      setImages([]);
      setImagePreviews([]);
      fetchEntries(form.classroomId, form.category);
    } catch (err) {
      console.error('FPOW Creation Error:', err);
      setError(err.response?.data?.message || err.response?.data || err.message || 'Failed to create puzzle.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditId(entry.id);
    setForm({
      classroomId: entry.classroomId,
      category: entry.category,
      level: entry.level,
      answer: entry.answer,
      hint: entry.hint || '',
      hintType: entry.hintType || 'TEXT_HINT',
      difficulty: entry.difficulty || 'EASY',
    });
    
    // Load existing images from URLs
    const existingImageUrls = [
      entry.image1Url,
      entry.image2Url,
      entry.image3Url,
      entry.image4Url
    ].filter(url => url != null && url.trim() !== '');
    
    if (existingImageUrls.length > 0) {
      // Set previews from URLs (existing images)
      setImagePreviews(existingImageUrls);
      // Set empty array for files since we're using existing images
      // User can add new images or keep existing ones
      setImages([]);
    } else {
      setImages([]);
      setImagePreviews([]);
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 4, pt: 2 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <PageTitle icon={<CloudUploadIcon sx={{ fontSize: 32 }} />}>
            Create 4 Pics 1 Word Level
          </PageTitle>
          <Typography 
            variant="h6" 
            sx={{ 
              color: colors.textLight, 
              mt: 1,
              fontWeight: 400,
              fontSize: '1.1rem'
            }}
          >
            Create engaging picture puzzles for your students
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '0.95rem' }
            }}
          >
            {error}
          </Alert>
        )}

        <StyledCard sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, maxWidth: 450, mx: 'auto', mt: 4, boxShadow: 4 }}>
          {/* List of existing entries */}
          {entries.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Existing Entries</Typography>
              <Grid container spacing={2}>
                {entries.map((entry, idx) => (
                  <Grid item xs={12} key={entry.id || idx}>
                    <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        {/* Image previews */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[entry.image1Url, entry.image2Url, entry.image3Url, entry.image4Url]
                            .filter(url => url != null && url.trim() !== '')
                            .slice(0, 4)
                            .map((url, imgIdx) => (
                              <Box
                                key={imgIdx}
                                component="img"
                                src={url}
                                alt={`Preview ${imgIdx + 1}`}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  border: `1px solid ${colors.border}`,
                                }}
                              />
                            ))}
                        </Box>
                        {/* Entry details */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Level {entry.level}: {entry.answer}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {entry.hint || 'No hint provided'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={entry.difficulty || 'EASY'} 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: entry.difficulty === 'HARD' ? colors.error + '20' : 
                                         entry.difficulty === 'MEDIUM' ? colors.warning + '20' : 
                                         colors.success + '20',
                                color: entry.difficulty === 'HARD' ? colors.error : 
                                       entry.difficulty === 'MEDIUM' ? colors.warning : 
                                       colors.success,
                              }} 
                            />
                            <Chip 
                              label={entry.hintType || 'TEXT_HINT'} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }} 
                            />
                          </Box>
                        </Box>
                      </Box>
                      {/* Action buttons */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="primary" 
                          onClick={() => handleEdit(entry)}
                          startIcon={<EditIcon />}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            setEntryToDelete(entry);
                            setDeleteDialogOpen(true);
                          }}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} alignItems="flex-start">
              <Grid item xs={12} md={7}>
                <Paper elevation={2} sx={{ mb: 2, p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Level Details</Typography>
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
                    sx={{ mb: 2 }}
                    helperText={loadingClassrooms ? "Loading classrooms..." : classrooms.length === 0 ? "No classrooms found. Please create a classroom first." : "Select which classroom this puzzle belongs to"}
                  >
                    {classrooms.map((classroom) => (
                      <MenuItem key={classroom.id} value={classroom.id}>
                        {classroom.name} {classroom.description && `- ${classroom.description}`}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    name="category"
                    label="Category *"
                    value={form.category}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="e.g., Animals, Food, Sports"
                  />
                  <TextField
                    name="level"
                    label="Level Number *"
                    type="number"
                    value={form.level}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="e.g., 1, 2, 3"
                  />
                  <TextField
                    name="answer"
                    label="Answer Word *"
                    value={form.answer}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="Enter the correct answer"
                    helperText="This will be converted to uppercase automatically"
                  />
                  <TextField
                    name="hint"
                    label="Hint (Optional)"
                    value={form.hint}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    multiline
                    rows={2}
                    placeholder="Provide a helpful hint for students..."
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      select
                      name="hintType"
                      label="Hint Type"
                      value={form.hintType}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                    >
                      <MenuItem value="TEXT_HINT">Text Hint</MenuItem>
                      <MenuItem value="REVEAL_LETTER">Reveal Letter</MenuItem>
                    </TextField>
                    <TextField
                      select
                      name="difficulty"
                      label="Difficulty Level"
                      value={form.difficulty}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                    >
                      <MenuItem value="EASY">Easy</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="HARD">Hard</MenuItem>
                    </TextField>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper elevation={2} sx={{ mb: 2, p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Upload Images</Typography>
                  <Paper
                    sx={{
                      border: `2px dashed ${images.length >= 4 ? colors.border : colors.primary}80`,
                      borderRadius: '16px',
                      p: 3,
                      textAlign: 'center',
                      bgcolor: images.length >= 4 ? colors.border + '15' : colors.primary + '08',
                      cursor: images.length >= 4 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      mb: 2,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    component="label"
                  >
                    <AddPhotoAlternateIcon 
                      sx={{ fontSize: 40, color: images.length >= 4 ? colors.textLight : colors.primary, mb: 1.5, opacity: 0.8 }} 
                    />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.text, mb: 1 }}>
                      {images.length === 0 ? 'Upload Puzzle Images' : `Add More Images (${images.length}/4)`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textLight, maxWidth: 300, mx: 'auto' }}>
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
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
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
                  {images.length > 0 && (
                    <Grid container spacing={1}>
                      {imagePreviews.map((preview, index) => (
                        <Grid item xs={6} key={index}>
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
                              mb: 1
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="100"
                              image={preview}
                              alt={`Preview ${index + 1}`}
                              sx={{ objectFit: 'cover' }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleImageRemove(index)}
                              sx={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
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
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <PrimaryButton
                    type="submit"
                    size="large"
                    disabled={loading || images.length === 0}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    sx={{
                      py: 1.5,
                      px: 5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: loading || images.length === 0 
                        ? `${colors.textLight}40` 
                        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                      '&:hover': {
                        transform: images.length > 0 ? 'translateY(-2px)' : 'none',
                        boxShadow: images.length > 0 ? `0 8px 25px ${colors.primary}40` : 'none',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? (editId ? 'Updating...' : 'Creating Puzzle...') : (editId ? 'Update Entry' : `Create Level with ${images.length} Image${images.length !== 1 ? 's' : ''}`)}
                  </PrimaryButton>
                  {editId && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ ml: 2 }}
                      onClick={() => {
                        setEditId(null);
                        setForm({ ...form, level: '', answer: '', hint: '', hintType: 'TEXT_HINT', difficulty: 'EASY' });
                        setImages([]);
                        setImagePreviews([]);
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </StyledCard>
      </Container>
    </Box>
  {/* Delete Confirmation Dialog */}
  <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
    <DialogTitle>Delete Custom 4 Pics 1 Word?</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to delete this custom puzzle? This action cannot be undone.</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
      <Button color="error" onClick={() => {
        if (entryToDelete) {
          handleDelete(entryToDelete);
        }
      }}>Delete</Button>
    </DialogActions>
  </Dialog>


    </>
  );
}

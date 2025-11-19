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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import api from '../api/api';
import { toast } from 'react-toastify';
import {
  colors,
  StyledCard,
  PageTitle,
  PrimaryButton,
} from '../Teacher/components/DesignSystem';

export default function TeacherManageFPOW() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    classroomId: '',
    category: '',
    level: '',
    answer: '',
    hint: '',
    hintType: 'TEXT_HINT',
    difficulty: 'EASY',
  });
  const [editImages, setEditImages] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [originalImageCount, setOriginalImageCount] = useState(0);
  const [saving, setSaving] = useState(false);

  // Fetch all FPOW entries created by the teacher
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/fpow/teacher/entries');
      setEntries(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load FPOW entries. Please refresh the page.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Delete entry
  const handleDelete = async (entry) => {
    try {
      await api.delete(`/api/fpow/level/${entry.id}`);
      toast.success('Entry deleted successfully');
      fetchEntries();
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data || err.message || 'Failed to delete entry';
      toast.error(errorMsg);
      console.error('Delete error:', err);
    }
  };

  // Open edit dialog
  const handleEditClick = (entry) => {
    setEntryToEdit(entry);
    setEditForm({
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
    
    setEditImagePreviews(existingImageUrls);
    setOriginalImageCount(existingImageUrls.length);
    setEditImages([]);
    setEditDialogOpen(true);
  };

  // Handle image add in edit dialog
  const handleEditImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (editImages.length + editImagePreviews.length + files.length > 4) {
      toast.error('Maximum 4 images allowed per puzzle');
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
      setEditImages(prev => [...prev, ...validFiles]);
      setEditImagePreviews(prev => [...prev, ...validPreviews]);
    }
    e.target.value = '';
  };

  // Handle image remove in edit dialog
  const handleEditImageRemove = (index) => {
    // Find if this is a new uploaded image or an existing one
    const existingCount = editImagePreviews.length - editImages.length;
    const isNewImage = index >= existingCount;
    
    if (isNewImage) {
      // Remove new uploaded image
      const newImageIndex = index - existingCount;
      URL.revokeObjectURL(editImagePreviews[index]);
      setEditImages(prev => prev.filter((_, i) => i !== newImageIndex));
      setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove existing image (URL) - user wants to remove it
      // Note: If no new images are uploaded after removing, backend will preserve remaining existing images
      setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Save edited entry
  const handleSaveEdit = async () => {
    if (!entryToEdit) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in as a teacher.');
        setSaving(false);
        return;
      }

      if (editImagePreviews.length === 0) {
        toast.error('At least 1 image is required.');
        setSaving(false);
        return;
      }

      // Check if user removed existing images but didn't upload new ones
      const imagesWereRemoved = editImagePreviews.length < originalImageCount;
      if (imagesWereRemoved && editImages.length === 0) {
        toast.error('Please upload at least one new image when removing existing images, or keep all existing images.');
        setSaving(false);
        return;
      }

      if (!editForm.category.trim() || !editForm.level || !editForm.answer.trim()) {
        toast.error('Category, level, and answer are required fields.');
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append('classroomId', editForm.classroomId);
      formData.append('category', editForm.category.trim());
      formData.append('level', editForm.level);
      formData.append('answer', editForm.answer.trim().toUpperCase());
      formData.append('hint', editForm.hint.trim());
      formData.append('hintType', editForm.hintType);
      formData.append('difficulty', editForm.difficulty);

      // Append new images (files)
      // If new images are uploaded, backend will replace all images with new ones
      // If no new images are uploaded, backend will preserve all existing images
      editImages.forEach((file) => {
        formData.append('images', file);
      });

      await api.put(`/api/fpow/level/${entryToEdit.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('✅ Entry updated successfully!');
      setEditDialogOpen(false);
      setEntryToEdit(null);
      setEditImages([]);
      setEditImagePreviews([]);
      setOriginalImageCount(0);
      fetchEntries();
    } catch (err) {
      console.error('Update error:', err);
      const errorMsg = err?.response?.data?.message || err?.response?.data || err.message || 'Failed to update entry.';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 4, pt: 2 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <PageTitle icon={<EditIcon sx={{ fontSize: 32 }} />}>
            Manage 4 Pics 1 Word Puzzles
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
            View, edit, and delete your custom FPOW puzzles
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

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <StyledCard sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, boxShadow: 4 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Images</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Classroom</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Answer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hint</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" sx={{ color: colors.textLight }}>
                          No custom FPOW puzzles found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => {
                      const imageUrls = [
                        entry.image1Url,
                        entry.image2Url,
                        entry.image3Url,
                        entry.image4Url
                      ].filter(url => url != null && url.trim() !== '');
                      
                      return (
                        <TableRow key={entry.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {imageUrls.slice(0, 4).map((url, idx) => (
                                <Box
                                  key={idx}
                                  component="img"
                                  src={url}
                                  alt={`Preview ${idx + 1}`}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    border: `1px solid ${colors.border}`,
                                  }}
                                />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>{entry.classroomId || 'N/A'}</TableCell>
                          <TableCell>{entry.category}</TableCell>
                          <TableCell>{entry.level}</TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600 }}>{entry.answer}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {entry.hint || 'No hint'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={entry.difficulty || 'EASY'} 
                              size="small" 
                              sx={{ 
                                height: 24, 
                                fontSize: '0.75rem',
                                bgcolor: entry.difficulty === 'HARD' ? colors.error + '20' : 
                                         entry.difficulty === 'MEDIUM' ? colors.warning + '20' : 
                                         colors.success + '20',
                                color: entry.difficulty === 'HARD' ? colors.error : 
                                       entry.difficulty === 'MEDIUM' ? colors.warning : 
                                       colors.success,
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditClick(entry)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                  setEntryToDelete(entry);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledCard>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Custom 4 Pics 1 Word?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this custom puzzle? This action cannot be undone.
              {entryToDelete && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Category:</strong> {entryToDelete.category}<br />
                    <strong>Level:</strong> {entryToDelete.level}<br />
                    <strong>Answer:</strong> {entryToDelete.answer}
                  </Typography>
                </Box>
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              color="error" 
              onClick={() => {
                if (entryToDelete) {
                  handleDelete(entryToDelete);
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => !saving && setEditDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>Edit Custom 4 Pics 1 Word</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="category"
                    label="Category *"
                    value={editForm.category}
                    onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="level"
                    label="Level Number *"
                    type="number"
                    value={editForm.level}
                    onChange={e => setEditForm(f => ({ ...f, level: e.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="answer"
                    label="Answer Word *"
                    value={editForm.answer}
                    onChange={e => setEditForm(f => ({ ...f, answer: e.target.value }))}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="hint"
                    label="Hint (Optional)"
                    value={editForm.hint}
                    onChange={e => setEditForm(f => ({ ...f, hint: e.target.value }))}
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
                    value={editForm.hintType}
                    onChange={e => setEditForm(f => ({ ...f, hintType: e.target.value }))}
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
                    label="Difficulty Level"
                    value={editForm.difficulty}
                    onChange={e => setEditForm(f => ({ ...f, difficulty: e.target.value }))}
                    fullWidth
                  >
                    <MenuItem value="EASY">Easy</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HARD">Hard</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      border: `2px dashed ${editImagePreviews.length >= 4 ? colors.border : colors.primary}80`,
                      borderRadius: '16px',
                      p: 3,
                      textAlign: 'center',
                      bgcolor: editImagePreviews.length >= 4 ? colors.border + '15' : colors.primary + '08',
                      cursor: editImagePreviews.length >= 4 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      mb: 2,
                    }}
                    component="label"
                  >
                    <AddPhotoAlternateIcon 
                      sx={{ fontSize: 40, color: editImagePreviews.length >= 4 ? colors.textLight : colors.primary, mb: 1.5, opacity: 0.8 }} 
                    />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: colors.text, mb: 1 }}>
                      {editImagePreviews.length === 0 ? 'Upload Images' : `Add More Images (${editImagePreviews.length}/4)`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textLight }}>
                      Click to add new images (existing images will be kept if not replaced)
                    </Typography>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      multiple
                      onChange={handleEditImageAdd}
                      disabled={editImagePreviews.length >= 4}
                    />
                  </Paper>
                  {editImagePreviews.length > 0 && (
                    <Grid container spacing={1}>
                      {editImagePreviews.map((preview, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                          <Card 
                            sx={{ 
                              position: 'relative',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              border: `2px solid ${colors.border}`,
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
                              onClick={() => handleEditImageRemove(index)}
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
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <PrimaryButton
              onClick={handleSaveEdit}
              disabled={saving || editImagePreviews.length === 0}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </PrimaryButton>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

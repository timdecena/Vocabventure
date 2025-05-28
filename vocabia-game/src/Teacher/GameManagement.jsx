import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Tabs, Tab, Button, TextField, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Snackbar, Alert, CircularProgress, Divider,
  Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const SERVER_URL = "http://localhost:8080";

// Create an axios instance with auth headers
const authAxios = axios.create({
  baseURL: SERVER_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Add auth token to requests
authAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

function GameManagement() {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [puzzles, setPuzzles] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  
  const [newLevel, setNewLevel] = useState({
    number: '',
    name: '',
    description: ''
  });
  const [editingLevel, setEditingLevel] = useState(null);
  
  const [newPuzzle, setNewPuzzle] = useState({
    levelId: '',
    answer: '',
    hint: '',
    images: ['', '', '', '']
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Dialog states
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openLevelDialog, setOpenLevelDialog] = useState(false);
  const [openPuzzleDialog, setOpenPuzzleDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchLevels();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Try with authentication first
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${SERVER_URL}/api/4pic1word-assets/categories`, {
        headers,
        withCredentials: true
      });
      setCategories(response.data);
    } catch (error) {
      showNotification('Failed to fetch categories', 'error');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch levels
  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await authAxios.get('/api/levels');
      setLevels(response.data);
    } catch (error) {
      showNotification('Failed to fetch levels', 'error');
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch puzzles for a level
  const fetchPuzzlesByLevel = async (levelId) => {
    setLoading(true);
    try {
      const response = await authAxios.get(`/api/puzzles/4pics1word/level/${levelId}`);
      setPuzzles(response.data);
    } catch (error) {
      showNotification('Failed to fetch puzzles', 'error');
      console.error('Error fetching puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new category
  const createCategory = async () => {
    if (!newCategory.trim()) {
      showNotification('Category name cannot be empty', 'error');
      return;
    }

    setLoading(true);
    try {
      // Since there's no direct API for creating categories, we'll need to
      // create a level with this category and a puzzle within it
      // First, create a level for this category
      const levelResponse = await authAxios.post('/api/levels', {
        number: '1',
        name: `${newCategory} Level 1`,
        description: `First level in ${newCategory} category`
      });
      
      // Then create a simple puzzle in this level to establish the category
      await authAxios.post('/api/puzzles/4pics1word', {
        levelId: levelResponse.data.id,
        answer: 'example',
        hint: 'This is a placeholder puzzle',
        images: [
          'https://via.placeholder.com/150?text=Image1',
          'https://via.placeholder.com/150?text=Image2',
          'https://via.placeholder.com/150?text=Image3',
          'https://via.placeholder.com/150?text=Image4'
        ]
      });
      
      fetchCategories();
      fetchLevels();
      setNewCategory('');
      setOpenCategoryDialog(false);
      showNotification('Category created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create category', 'error');
      console.error('Error creating category:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update a category
  const updateCategory = async () => {
    if (!editCategoryName.trim()) {
      showNotification('Category name cannot be empty', 'error');
      return;
    }

    showNotification('Category update feature not available in the current API', 'warning');
    setEditingCategory(null);
    setEditCategoryName('');
    
    // Note: Since there's no direct API for updating categories in the current backend,
    // we would need to implement a custom endpoint or update all puzzles/levels associated
    // with this category. This would require significant backend changes.
  };

  // Delete a category
  const deleteCategory = async () => {
    showNotification('Category deletion feature not available in the current API', 'warning');
    setOpenDeleteDialog(false);
    setDeleteItem(null);
    setDeleteType('');
    
    // Note: Since there's no direct API for deleting categories in the current backend,
    // we would need to implement a custom endpoint or delete all puzzles/levels associated
    // with this category. This would require significant backend changes.
  };

  // Create a new level
  const createLevel = async () => {
    if (!newLevel.number || !newLevel.name) {
      showNotification('Level number and name are required', 'error');
      return;
    }

    setLoading(true);
    try {
      await authAxios.post('/api/levels', newLevel);
      fetchLevels();
      setNewLevel({ number: '', name: '', description: '' });
      setOpenLevelDialog(false);
      showNotification('Level created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create level', 'error');
      console.error('Error creating level:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update a level
  const updateLevel = async () => {
    if (!editingLevel.number || !editingLevel.name) {
      showNotification('Level number and name are required', 'error');
      return;
    }

    setLoading(true);
    try {
      await authAxios.put(`/api/levels/${editingLevel.id}`, editingLevel);
      fetchLevels();
      setEditingLevel(null);
      setOpenLevelDialog(false);
      showNotification('Level updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update level', 'error');
      console.error('Error updating level:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a level
  const deleteLevel = async () => {
    setLoading(true);
    try {
      await authAxios.delete(`/api/levels/${deleteItem}`);
      fetchLevels();
      setOpenDeleteDialog(false);
      setDeleteItem(null);
      setDeleteType('');
      showNotification('Level deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete level', 'error');
      console.error('Error deleting level:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new puzzle
  const createPuzzle = async () => {
    if (!newPuzzle.levelId || !newPuzzle.answer || newPuzzle.images.some(img => !img)) {
      showNotification('All fields are required', 'error');
      return;
    }

    setLoading(true);
    try {
      await authAxios.post('/api/puzzles/4pics1word', newPuzzle);
      setPuzzles([]);
      setOpenPuzzleDialog(false);
      setNewPuzzle({
        levelId: '',
        answer: '',
        hint: '',
        images: ['', '', '', '']
      });
      showNotification('Puzzle created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create puzzle', 'error');
      console.error('Error creating puzzle:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = () => {
    if (deleteType === 'category') {
      deleteCategory();
    } else if (deleteType === 'level') {
      deleteLevel();
    }
  };

  // Show notification
  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Handle image URL change in puzzle form
  const handleImageChange = (index, value) => {
    const updatedImages = [...newPuzzle.images];
    updatedImages[index] = value;
    setNewPuzzle({
      ...newPuzzle,
      images: updatedImages
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
          Game Content Management
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, color: '#7f8c8d' }}>
          Create and manage categories, levels, and puzzles for the 4 Pics 1 Word game
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Categories" />
            <Tab label="Levels" />
            <Tab label="Puzzles" />
          </Tabs>
        </Box>

        {/* Categories Tab */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Categories</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpenCategoryDialog(true)}
                sx={{ 
                  backgroundColor: '#27ae60', 
                  '&:hover': { backgroundColor: '#219653' } 
                }}
              >
                Add Category
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category Name</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center">No categories found</TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {editingCategory === category ? (
                              <TextField
                                fullWidth
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                size="small"
                              />
                            ) : (
                              <Typography sx={{ textTransform: 'capitalize' }}>{category}</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {editingCategory === category ? (
                              <>
                                <IconButton color="primary" onClick={updateCategory}>
                                  <SaveIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => {
                                  setEditingCategory(null);
                                  setEditCategoryName('');
                                }}>
                                  <CancelIcon />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton color="primary" onClick={() => {
                                  setEditingCategory(category);
                                  setEditCategoryName(category);
                                }}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => {
                                  setDeleteItem(category);
                                  setDeleteType('category');
                                  setOpenDeleteDialog(true);
                                }}>
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Levels Tab */}
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Levels</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpenLevelDialog(true)}
                sx={{ 
                  backgroundColor: '#27ae60', 
                  '&:hover': { backgroundColor: '#219653' } 
                }}
              >
                Add Level
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Level Number</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {levels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No levels found</TableCell>
                      </TableRow>
                    ) : (
                      levels.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell>{level.number}</TableCell>
                          <TableCell>{level.name}</TableCell>
                          <TableCell>{level.description}</TableCell>
                          <TableCell align="right">
                            <IconButton color="primary" onClick={() => {
                              setEditingLevel(level);
                              setOpenLevelDialog(true);
                            }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => {
                              setDeleteItem(level.id);
                              setDeleteType('level');
                              setOpenDeleteDialog(true);
                            }}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Puzzles Tab */}
        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Puzzles</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpenPuzzleDialog(true)}
                sx={{ 
                  backgroundColor: '#27ae60', 
                  '&:hover': { backgroundColor: '#219653' } 
                }}
              >
                Add Puzzle
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Select Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Select Category"
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((category, index) => (
                    <MenuItem key={index} value={category} sx={{ textTransform: 'capitalize' }}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {selectedCategory && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Levels in {selectedCategory}:
                </Typography>
                <Grid container spacing={2}>
                  {levels.map((level) => (
                    <Grid item xs={12} sm={6} md={4} key={level.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': { 
                            transform: 'translateY(-5px)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => fetchPuzzlesByLevel(level.id)}
                      >
                        <CardContent>
                          <Typography variant="h6">Level {level.number}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {level.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {puzzles.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Puzzles:
                </Typography>
                <Grid container spacing={2}>
                  {puzzles.map((puzzle) => (
                    <Grid item xs={12} sm={6} md={4} key={puzzle.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Answer: {puzzle.answer}
                          </Typography>
                          {puzzle.hint && (
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Hint: {puzzle.hint}
                            </Typography>
                          )}
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            {puzzle.images.map((image, index) => (
                              <Grid item xs={6} key={index}>
                                <img 
                                  src={image} 
                                  alt={`Puzzle ${index + 1}`} 
                                  style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)} color="error">
            Cancel
          </Button>
          <Button onClick={createCategory} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Level Dialog */}
      <Dialog open={openLevelDialog} onClose={() => setOpenLevelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLevel ? 'Edit Level' : 'Add New Level'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Level Number"
            fullWidth
            variant="outlined"
            value={editingLevel ? editingLevel.number : newLevel.number}
            onChange={(e) => editingLevel 
              ? setEditingLevel({...editingLevel, number: e.target.value})
              : setNewLevel({...newLevel, number: e.target.value})
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Level Name"
            fullWidth
            variant="outlined"
            value={editingLevel ? editingLevel.name : newLevel.name}
            onChange={(e) => editingLevel 
              ? setEditingLevel({...editingLevel, name: e.target.value})
              : setNewLevel({...newLevel, name: e.target.value})
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editingLevel ? editingLevel.description : newLevel.description}
            onChange={(e) => editingLevel 
              ? setEditingLevel({...editingLevel, description: e.target.value})
              : setNewLevel({...newLevel, description: e.target.value})
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenLevelDialog(false);
            setEditingLevel(null);
          }} color="error">
            Cancel
          </Button>
          <Button 
            onClick={editingLevel ? updateLevel : createLevel} 
            color="primary" 
            variant="contained"
          >
            {editingLevel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Puzzle Dialog */}
      <Dialog open={openPuzzleDialog} onClose={() => setOpenPuzzleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Puzzle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="dense">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((category, index) => (
                    <MenuItem key={index} value={category} sx={{ textTransform: 'capitalize' }}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="dense">
                <InputLabel>Level</InputLabel>
                <Select
                  value={newPuzzle.levelId}
                  onChange={(e) => setNewPuzzle({...newPuzzle, levelId: e.target.value})}
                  label="Level"
                  disabled={!selectedCategory}
                >
                  <MenuItem value="">
                    <em>Select a level</em>
                  </MenuItem>
                  {levels
                    .filter(level => selectedCategory) // Filter levels based on selected category if needed
                    .map((level) => (
                      <MenuItem key={level.id} value={level.id}>
                        Level {level.number}: {level.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Answer"
                fullWidth
                variant="outlined"
                value={newPuzzle.answer}
                onChange={(e) => setNewPuzzle({...newPuzzle, answer: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Hint (Optional)"
                fullWidth
                variant="outlined"
                value={newPuzzle.hint}
                onChange={(e) => setNewPuzzle({...newPuzzle, hint: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Image URLs (4 images required)
              </Typography>
              <Grid container spacing={2}>
                {newPuzzle.images.map((image, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <TextField
                      margin="dense"
                      label={`Image ${index + 1}`}
                      fullWidth
                      variant="outlined"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPuzzleDialog(false)} color="error">
            Cancel
          </Button>
          <Button onClick={createPuzzle} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteType}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirmation} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default GameManagement;

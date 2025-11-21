import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";
import api from "../api/api";
import { toast } from "react-toastify";
import { t } from "./utils/i18n";
import {
  colors,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
  StyledInput,
} from "./components/DesignSystem";

export default function TeacherFPOWManage() {
  const navigate = useNavigate();
  const [fpowList, setFpowList] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fpowToDelete, setFpowToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFpow, setEditingFpow] = useState(null);
  const [editForm, setEditForm] = useState({
    category: "",
    level: "",
    answer: "",
    hint: "",
    hintType: "TEXT_HINT",
    difficulty: "EASY",
    isActive: true,
  });
  const [existingImages, setExistingImages] = useState([]); // Array of image URLs
  const [newImages, setNewImages] = useState([]); // Array of File objects
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Array of preview URLs
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    fetchFPOWs();
    fetchClassrooms();
  }, []);

  const fetchFPOWs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/teacher/fpow");
      setFpowList(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load FPOWs:", err);
      setError("Failed to load FPOW puzzles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const res = await api.get("/api/teacher/classes");
      setClassrooms(res.data || []);
    } catch (err) {
      console.error("Failed to load classrooms:", err);
    }
  };

  const handleDeleteClick = (fpow) => {
    setFpowToDelete(fpow);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fpowToDelete) return;
    
    try {
      await api.delete(`/api/teacher/fpow/${fpowToDelete.id}`);
      setFpowList(prev => prev.filter(f => f.id !== fpowToDelete.id));
      showSnackbar("FPOW puzzle deleted successfully", "success");
      setDeleteDialogOpen(false);
      setFpowToDelete(null);
    } catch (err) {
      console.error("Failed to delete FPOW:", err);
      showSnackbar(err.response?.data || "Failed to delete FPOW puzzle", "error");
    }
  };

  const handleEditClick = (fpow) => {
    setEditingFpow(fpow);
    setEditForm({
      category: fpow.category || "",
      level: fpow.level || "",
      answer: fpow.answer || "",
      hint: fpow.hint || "",
      hintType: fpow.hintType || "TEXT_HINT",
      difficulty: fpow.difficulty || "EASY",
      isActive: fpow.isActive !== undefined ? fpow.isActive : true,
    });
    
    // Load existing images from the FPOW
    const imageUrls = [];
    if (fpow.image1Url) imageUrls.push(fpow.image1Url);
    if (fpow.image2Url) imageUrls.push(fpow.image2Url);
    if (fpow.image3Url) imageUrls.push(fpow.image3Url);
    if (fpow.image4Url) imageUrls.push(fpow.image4Url);
    setExistingImages(imageUrls);
    setNewImages([]);
    setNewImagePreviews([]);
    setEditDialogOpen(true);
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newImages.length;
    
    if (totalImages + files.length > 4) {
      showSnackbar("Maximum 4 images allowed per puzzle", "error");
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showSnackbar(`${file.name} is not a valid image file`, "error");
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        showSnackbar(`${file.name} is too large. Maximum size is 3MB`, "error");
        return;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setNewImages(prev => [...prev, ...validFiles]);
      setNewImagePreviews(prev => [...prev, ...validPreviews]);
    }

    e.target.value = '';
  };

  const handleImageRemove = (index, isExisting) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(newImagePreviews[index]);
      setNewImages(prev => prev.filter((_, i) => i !== index));
      setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDragStart = (e, index, isExisting) => {
    setDragIndex({ index, isExisting });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex, isExisting) => {
    e.preventDefault();
    if (!dragIndex || (dragIndex.index === dropIndex && dragIndex.isExisting === isExisting)) return;

    // For simplicity, only allow reordering within the same list (existing or new)
    if (dragIndex.isExisting === isExisting) {
      if (isExisting) {
        const newImages = [...existingImages];
        const [moved] = newImages.splice(dragIndex.index, 1);
        newImages.splice(dropIndex, 0, moved);
        setExistingImages(newImages);
      } else {
        const newImgs = [...newImages];
        const newPrev = [...newImagePreviews];
        const [movedImg] = newImgs.splice(dragIndex.index, 1);
        const [movedPrev] = newPrev.splice(dragIndex.index, 1);
        newImgs.splice(dropIndex, 0, movedImg);
        newPrev.splice(dropIndex, 0, movedPrev);
        setNewImages(newImgs);
        setNewImagePreviews(newPrev);
      }
    }
    setDragIndex(null);
  };

  const handleEditSave = async () => {
    if (!editingFpow) return;

    // Validate at least one image exists
    if (existingImages.length === 0 && newImages.length === 0) {
      showSnackbar("At least 1 image is required", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('category', editForm.category.trim());
      formData.append('level', editForm.level.toString());
      formData.append('answer', editForm.answer.trim().toUpperCase());
      if (editForm.hint) formData.append('hint', editForm.hint.trim());
      formData.append('hintType', editForm.hintType);
      formData.append('difficulty', editForm.difficulty);
      formData.append('isActive', editForm.isActive.toString());

      // Add existing image URLs that should be kept
      existingImages.forEach(url => {
        formData.append('existingImageUrls', url);
      });

      // Add new image files
      newImages.forEach(file => {
        formData.append('images', file);
      });

      await api.put(`/api/teacher/fpow/${editingFpow.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await fetchFPOWs(); // Refresh list
      showSnackbar("FPOW puzzle updated successfully", "success");
      setEditDialogOpen(false);
      setEditingFpow(null);
      setExistingImages([]);
      setNewImages([]);
      setNewImagePreviews([]);
    } catch (err) {
      console.error("Failed to update FPOW:", err);
      showSnackbar(err.response?.data || "Failed to update FPOW puzzle", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getFPOWName = (fpow) => {
    return `${fpow.category} - Level ${fpow.level}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: "100vh", pb: 4, pt: 2 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <PageTitle icon={<ViewIcon sx={{ fontSize: 32 }} />}>
            FPOW Manage
          </PageTitle>
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={() => navigate("/teacher/fpow/create")}
            sx={{ px: 3, py: 1.25 }}
          >
            Create New FPOW
          </PrimaryButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* FPOW List */}
        {fpowList.length === 0 ? (
          <Card sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2, color: colors.textLight }}>
              No FPOW puzzles created yet
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: colors.textLight }}>
              Create your first 4 Pics 1 Word puzzle to get started
            </Typography>
            <PrimaryButton
              startIcon={<AddIcon />}
              onClick={() => navigate("/teacher/fpow/create")}
            >
              Create Your First FPOW
            </PrimaryButton>
          </Card>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: colors.cardBg }}>
                  <TableCell sx={{ fontWeight: 700, color: colors.text }}>FPOW Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.text }}>Classroom</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.text }}>Date Created</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.text }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.text }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fpowList.map((fpow) => (
                  <TableRow
                    key={fpow.id}
                    sx={{
                      "&:hover": { bgcolor: colors.primary + "08" },
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: colors.text }}>
                        {getFPOWName(fpow)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textLight }}>
                        Answer: {fpow.answer}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: colors.text }}>
                        {fpow.classroomName || `Classroom ${fpow.classroomId}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: colors.textLight }}>
                        {formatDate(fpow.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={fpow.isActive ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          bgcolor: fpow.isActive ? colors.success + "20" : colors.error + "20",
                          color: fpow.isActive ? colors.success : colors.error,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(fpow)}
                            sx={{ color: colors.primary }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(fpow)}
                            sx={{ color: colors.error }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete FPOW Puzzle</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{fpowToDelete ? getFPOWName(fpowToDelete) : ""}"?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <SecondaryButton onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </SecondaryButton>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => {
            // Cleanup preview URLs
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
            setEditDialogOpen(false);
            setEditingFpow(null);
            setExistingImages([]);
            setNewImages([]);
            setNewImagePreviews([]);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit FPOW Puzzle</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <StyledInput
                  label="Category *"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledInput
                  label="Level *"
                  type="number"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <StyledInput
                  label="Answer *"
                  value={editForm.answer}
                  onChange={(e) => setEditForm({ ...editForm, answer: e.target.value.toUpperCase() })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <StyledInput
                  label="Hint (Optional)"
                  value={editForm.hint}
                  onChange={(e) => setEditForm({ ...editForm, hint: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Hint Type"
                  value={editForm.hintType}
                  onChange={(e) => setEditForm({ ...editForm, hintType: e.target.value })}
                  fullWidth
                  variant="outlined"
                >
                  <MenuItem value="TEXT_HINT">Text Hint</MenuItem>
                  <MenuItem value="REVEAL_LETTER">Reveal Letter</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Difficulty"
                  value={editForm.difficulty}
                  onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                  fullWidth
                  variant="outlined"
                >
                  <MenuItem value="EASY">Easy</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HARD">Hard</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Status"
                  value={editForm.isActive ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "ACTIVE" })}
                  fullWidth
                  variant="outlined"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              </Grid>

              {/* Image Management Section */}
              <Grid item xs={12}>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: colors.text }}>
                    Images ({existingImages.length + newImages.length}/4)
                  </Typography>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: colors.textLight }}>
                        Current Images
                      </Typography>
                      <Grid container spacing={2}>
                        {existingImages.map((imageUrl, index) => (
                          <Grid item xs={6} sm={4} md={3} key={`existing-${index}`}>
                            <Card
                              draggable
                              onDragStart={(e) => handleDragStart(e, index, true)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index, true)}
                              sx={{
                                position: "relative",
                                borderRadius: 2,
                                overflow: "hidden",
                                border: `2px solid ${colors.border}`,
                                cursor: "grab",
                                "&:hover": {
                                  borderColor: colors.primary,
                                  transform: "translateY(-2px)",
                                },
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="120"
                                image={imageUrl}
                                alt={`Existing ${index + 1}`}
                                sx={{ objectFit: "cover" }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  bgcolor: "rgba(0,0,0,0.6)",
                                  borderRadius: 1,
                                  p: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ color: "white", fontSize: 16 }} />
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleImageRemove(index, true)}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  bgcolor: colors.error,
                                  color: "white",
                                  "&:hover": { bgcolor: colors.error },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                                  color: "white",
                                  p: 0.5,
                                  textAlign: "center",
                                }}
                              >
                                <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                                  Image {index + 1}
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* New Images */}
                  {newImages.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: colors.textLight }}>
                        New Images
                      </Typography>
                      <Grid container spacing={2}>
                        {newImagePreviews.map((preview, index) => (
                          <Grid item xs={6} sm={4} md={3} key={`new-${index}`}>
                            <Card
                              draggable
                              onDragStart={(e) => handleDragStart(e, index, false)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index, false)}
                              sx={{
                                position: "relative",
                                borderRadius: 2,
                                overflow: "hidden",
                                border: `2px solid ${colors.primary}`,
                                cursor: "grab",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                },
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="120"
                                image={preview}
                                alt={`New ${index + 1}`}
                                sx={{ objectFit: "cover" }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  bgcolor: "rgba(0,0,0,0.6)",
                                  borderRadius: 1,
                                  p: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ color: "white", fontSize: 16 }} />
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleImageRemove(index, false)}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  bgcolor: colors.error,
                                  color: "white",
                                  "&:hover": { bgcolor: colors.error },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                                  color: "white",
                                  p: 0.5,
                                  textAlign: "center",
                                }}
                              >
                                <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                                  New {index + 1}
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Upload Area */}
                  {existingImages.length + newImages.length < 4 && (
                    <Paper
                      component="label"
                      sx={{
                        border: `2px dashed ${colors.primary}80`,
                        borderRadius: 2,
                        p: 3,
                        textAlign: "center",
                        cursor: "pointer",
                        bgcolor: colors.primary + "08",
                        "&:hover": {
                          borderColor: colors.primary,
                          bgcolor: colors.primary + "12",
                        },
                      }}
                    >
                      <AddPhotoAlternateIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: colors.text, mb: 0.5 }}>
                        Add More Images
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textLight }}>
                        Maximum 4 images • 3MB each
                      </Typography>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={handleImageAdd}
                      />
                    </Paper>
                  )}

                  {existingImages.length + newImages.length === 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      At least 1 image is required
                    </Alert>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <SecondaryButton onClick={() => setEditDialogOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleEditSave}>
              Save Changes
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}


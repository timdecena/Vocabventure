import React, { useEffect, useState, useMemo } from "react";
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
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  DragIndicator as DragIndicatorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import api from "../api/api";
import { toast } from "react-toastify";
import { t } from "./utils/i18n";
import {
  colors,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  StyledInput,
  StyledCard,
  EmptyState,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classroomFilter, setClassroomFilter] = useState("all");

  useEffect(() => {
    fetchFPOWs();
    fetchClassrooms();
  }, []);

  const fetchFPOWs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/teacher/fpow");
      // Normalize the data to ensure isActive is always a boolean
      // Default to true if null/undefined (matching database default)
      const normalizedData = (res.data || []).map(fpow => {
        const isActive = fpow.isActive;
        let normalizedIsActive = true; // default
        if (isActive === false || isActive === "false" || isActive === 0 || isActive === "0") {
          normalizedIsActive = false;
        } else if (isActive === true || isActive === "true" || isActive === 1 || isActive === "1") {
          normalizedIsActive = true;
        }
        return {
          ...fpow,
          isActive: normalizedIsActive
        };
      });
      setFpowList(normalizedData);
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
    // Normalize isActive to boolean (default to true if null/undefined)
    const isActiveValue = fpow.isActive;
    let normalizedIsActive = true; // default
    if (isActiveValue === false || isActiveValue === "false" || isActiveValue === 0 || isActiveValue === "0") {
      normalizedIsActive = false;
    } else if (isActiveValue === true || isActiveValue === "true" || isActiveValue === 1 || isActiveValue === "1") {
      normalizedIsActive = true;
    }
    setEditForm({
      category: fpow.category || "",
      level: fpow.level || "",
      answer: fpow.answer || "",
      hint: fpow.hint || "",
      hintType: fpow.hintType || "TEXT_HINT",
      difficulty: fpow.difficulty || "EASY",
      isActive: normalizedIsActive,
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
      // Ensure isActive is explicitly sent as "true" or "false" string
      formData.append('isActive', editForm.isActive ? 'true' : 'false');

      // Add existing image URLs that should be kept
      existingImages.forEach(url => {
        formData.append('existingImageUrls', url);
      });

      // Add new image files
      newImages.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.put(`/api/teacher/fpow/${editingFpow.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Immediately update the list with the new status
      // Use form state directly for isActive since that's what user just set (most reliable)
      const updatedIsActive = Boolean(editForm.isActive);
      
      // Store the expected isActive value to preserve it during background refresh
      const expectedIsActive = updatedIsActive;
      const updatedFpowId = editingFpow.id;
      
      // Normalize response data isActive to ensure it's a boolean
      let responseIsActive = expectedIsActive; // Default to expected value
      if (response.data && response.data.hasOwnProperty('isActive')) {
        const respActive = response.data.isActive;
        if (respActive === false || respActive === "false" || respActive === 0 || respActive === "0") {
          responseIsActive = false;
        } else if (respActive === true || respActive === "true" || respActive === 1 || respActive === "1") {
          responseIsActive = true;
        }
      }
      
      // Use expected value (user's choice) if response doesn't match
      const finalIsActive = (responseIsActive === expectedIsActive) ? responseIsActive : expectedIsActive;
      
      // Update state immediately for instant UI feedback
      setFpowList(prevList => {
        return prevList.map(fpow => {
          if (fpow.id === updatedFpowId) {
            // Create new object to ensure React detects the change
            const updated = {
              ...fpow, // Preserve existing fields like classroomName
              ...response.data, // Update with response data
              isActive: finalIsActive, // Use form state for immediate, reliable update
            };
            // Ensure classroomName is preserved
            if (!updated.classroomName && fpow.classroomName) {
              updated.classroomName = fpow.classroomName;
            }
            return updated;
          }
          return fpow;
        });
      });
      
      showSnackbar("FPOW puzzle updated successfully", "success");
      setEditDialogOpen(false);
      setEditingFpow(null);
      setExistingImages([]);
      setNewImages([]);
      setNewImagePreviews([]);
      
      // Refresh from server in background, but preserve the optimistic update for isActive
      // Use a longer delay to ensure server has processed the update
      setTimeout(() => {
        fetchFPOWs().then(() => {
          // After refresh, ensure the isActive value matches what user set
          setFpowList(prevList => {
            return prevList.map(fpow => {
              if (fpow.id === updatedFpowId) {
                // Normalize isActive from server response
                const serverIsActive = fpow.isActive;
                let normalizedIsActive = true; // default
                if (serverIsActive === false || serverIsActive === "false" || serverIsActive === 0 || serverIsActive === "0") {
                  normalizedIsActive = false;
                } else if (serverIsActive === true || serverIsActive === "true" || serverIsActive === 1 || serverIsActive === "1") {
                  normalizedIsActive = true;
                }
                
                // Always use expected value (user's choice) - this is the source of truth
                // The server should have updated by now, but we trust the user's action
                return {
                  ...fpow,
                  isActive: expectedIsActive
                };
              }
              return fpow;
            });
          });
        }).catch(err => {
          console.error("Background refresh failed:", err);
        });
      }, 1000); // Increased delay to give server more time to process
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

  // Filter and search logic
  const filteredFPOWs = useMemo(() => {
    return fpowList.filter((fpow) => {
      const matchesSearch = 
        !searchQuery ||
        getFPOWName(fpow).toLowerCase().includes(searchQuery.toLowerCase()) ||
        fpow.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fpow.classroomName && fpow.classroomName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Ensure isActive is treated as boolean for filtering
      // Default to true if null/undefined
      const isActiveValue = fpow.isActive;
      let isActive = true; // default
      if (isActiveValue === false || isActiveValue === "false" || isActiveValue === 0 || isActiveValue === "0") {
        isActive = false;
      } else if (isActiveValue === true || isActiveValue === "true" || isActiveValue === 1 || isActiveValue === "1") {
        isActive = true;
      }
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);
      
      const matchesClassroom = 
        classroomFilter === "all" ||
        fpow.classroomId.toString() === classroomFilter;
      
      return matchesSearch && matchesStatus && matchesClassroom;
    });
  }, [fpowList, searchQuery, statusFilter, classroomFilter]);

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
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        {fpowList.length > 0 && (
          <StyledCard sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <StyledInput
                placeholder={t("Search FPOW puzzles...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.textLight }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery("")}
                        sx={{ color: colors.textLight }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>{t('Status')}</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label={t('Status')}
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.border, borderWidth: '2px' },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: '2px' },
                    },
                  }}
                >
                  <MenuItem value="all">{t('All Status')}</MenuItem>
                  <MenuItem value="active">{t('Active')}</MenuItem>
                  <MenuItem value="inactive">{t('Inactive')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>{t('Classroom')}</InputLabel>
                <Select
                  value={classroomFilter}
                  onChange={(e) => setClassroomFilter(e.target.value)}
                  label={t('Classroom')}
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: colors.border, borderWidth: '2px' },
                      '&:hover fieldset': { borderColor: colors.primary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: '2px' },
                    },
                  }}
                >
                  <MenuItem value="all">{t('All Classrooms')}</MenuItem>
                  {classrooms.map((c) => (
                    <MenuItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {(searchQuery || statusFilter !== "all" || classroomFilter !== "all") && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<FilterIcon />}
                  label={`${filteredFPOWs.length} ${t('result(s)')}`}
                  sx={{
                    bgcolor: colors.primary + '15',
                    color: colors.primary,
                    fontWeight: 600,
                  }}
                />
                <GhostButton
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setClassroomFilter("all");
                  }}
                >
                  {t('Clear Filters')}
                </GhostButton>
              </Box>
            )}
          </StyledCard>
        )}

        {/* FPOW List */}
        {fpowList.length === 0 ? (
          <EmptyState
            icon={<ViewIcon sx={{ fontSize: 64 }} />}
            title={t('No FPOW puzzles created yet')}
            description={t('Create your first 4 Pics 1 Word puzzle to get started')}
            action={
              <PrimaryButton
                startIcon={<AddIcon />}
                onClick={() => navigate("/teacher/fpow/create")}
              >
                {t('Create Your First FPOW')}
              </PrimaryButton>
            }
          />
        ) : filteredFPOWs.length === 0 ? (
          <EmptyState
            icon={<SearchIcon sx={{ fontSize: 64 }} />}
            title={t('No puzzles found')}
            description={t('Try adjusting your search or filter criteria')}
            action={
              <GhostButton
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setClassroomFilter("all");
                }}
              >
                {t('Clear All Filters')}
              </GhostButton>
            }
          />
        ) : (
          <StyledCard sx={{ p: 0, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.primary + '08' }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                      {t('FPOW Name')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                      {t('Classroom')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                      {t('Date Created')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                      {t('Status')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colors.text, py: 2, textAlign: 'center' }}>
                      {t('Actions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFPOWs.map((fpow) => (
                    <TableRow
                      key={fpow.id}
                      sx={{
                        "&:hover": { bgcolor: colors.primary + "08" },
                        borderBottom: `1px solid ${colors.border}`,
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: colors.text, mb: 0.5 }}>
                          {getFPOWName(fpow)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textLight }}>
                          {t('Answer')}: <strong>{fpow.answer}</strong>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={fpow.classroomName || `Classroom ${fpow.classroomId}`}
                          size="small"
                          sx={{
                            bgcolor: colors.primary + '15',
                            color: colors.primary,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: colors.textLight, fontSize: '0.875rem' }}>
                          {formatDate(fpow.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          // Ensure isActive is properly converted to boolean
                          // Default to true if null/undefined (matching database default)
                          const isActiveValue = fpow.isActive;
                          let isActive = true; // default
                          if (isActiveValue === false || isActiveValue === "false" || isActiveValue === 0 || isActiveValue === "0") {
                            isActive = false;
                          } else if (isActiveValue === true || isActiveValue === "true" || isActiveValue === 1 || isActiveValue === "1") {
                            isActive = true;
                          }
                          return (
                            <Chip
                              label={isActive ? t("Active") : t("Inactive")}
                              size="small"
                              sx={{
                                bgcolor: isActive ? colors.success + "20" : colors.error + "20",
                                color: isActive ? colors.success : colors.error,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                          <Tooltip title={t("Edit")}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(fpow)}
                              sx={{
                                color: colors.primary,
                                '&:hover': { bgcolor: colors.primary + '15' },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("Delete")}>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(fpow)}
                              sx={{
                                color: colors.error,
                                '&:hover': { bgcolor: colors.error + '15' },
                              }}
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
          </StyledCard>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
        >
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
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: colors.mainBg,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2,
            borderBottom: `2px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <EditIcon sx={{ color: colors.primary, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text }}>
              Edit FPOW Puzzle
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ 
                color: colors.textLight, 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 2
              }}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
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
                    sx={{
                      '& input': {
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        letterSpacing: 1
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ 
                color: colors.textLight, 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 2
              }}>
                Hint & Settings
              </Typography>
              <Grid container spacing={3}>
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
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Hint Type</InputLabel>
                    <Select
                      value={editForm.hintType}
                      onChange={(e) => setEditForm({ ...editForm, hintType: e.target.value })}
                      label="Hint Type"
                      sx={{
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: colors.border, borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: colors.primary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: '2px' },
                        },
                      }}
                    >
                      <MenuItem value="TEXT_HINT">Text Hint</MenuItem>
                      <MenuItem value="REVEAL_LETTER">Reveal Letter</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                      label="Difficulty"
                      sx={{
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: colors.border, borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: colors.primary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: '2px' },
                        },
                      }}
                    >
                      <MenuItem value="EASY">Easy</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="HARD">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editForm.isActive ? "ACTIVE" : "INACTIVE"}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "ACTIVE" })}
                      label="Status"
                      sx={{
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: colors.border, borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: colors.primary },
                          '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: '2px' },
                        },
                      }}
                    >
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Image Management Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ 
                color: colors.textLight, 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 2
              }}>
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
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  At least 1 image is required
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            px: 3, 
            py: 2.5,
            borderTop: `2px solid ${colors.border}`,
            gap: 2
          }}>
            <Button
              variant="outlined"
              onClick={() => {
                // Cleanup preview URLs
                newImagePreviews.forEach(url => URL.revokeObjectURL(url));
                setEditDialogOpen(false);
                setEditingFpow(null);
                setExistingImages([]);
                setNewImages([]);
                setNewImagePreviews([]);
              }}
              sx={{ 
                px: 3,
                borderColor: colors.border,
                color: colors.text,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: colors.primary + '08'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSave}
              startIcon={<EditIcon />}
              sx={{ 
                px: 3,
                bgcolor: colors.primary,
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: colors.primaryDark
                }
              }}
            >
              Save Changes
            </Button>
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


import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as StudentsIcon,
  Class as ClassIcon,
} from "@mui/icons-material";
import api from "../api/api";
import ConfirmDialog from "./components/ConfirmDialog";
import { t } from "./utils/i18n";
import {
  colors,
  StyledCard,
  PageTitle,
  SecondaryButton,
  StyledInput,
  EmptyState as DSEmptyState,
  GhostButton,
} from "./components/DesignSystem";

export default function TeacherClassListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [highlightNew, setHighlightNew] = useState(false);
  const [studentCounts, setStudentCounts] = useState({});

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/api/teacher/classes");
        const classesData = res.data;
        setClasses(classesData);
        
        // Fetch student counts for each class
        const counts = {};
        await Promise.all(
          classesData.map(async (cls) => {
            try {
              const studentsRes = await api.get(`/api/teacher/classes/${cls.id}/students`);
              counts[cls.id] = studentsRes.data.length || 0;
            } catch (err) {
              console.warn(`Could not fetch students for class ${cls.id}:`, err);
              counts[cls.id] = 0;
            }
          })
        );
        setStudentCounts(counts);
        
        // Check if we just created a new class
        if (location.state?.justCreated && classesData.length > 0) {
          setHighlightNew(true);
          showSnackbar(t("Class created successfully!"), "success");
          // Clear the state to prevent re-highlighting on refresh
          window.history.replaceState({}, document.title);
          // Remove highlight after animation
          setTimeout(() => setHighlightNew(false), 2000);
        }
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError("Failed to load classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [location.state]);

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/api/teacher/classes/${id}`);
      if (response.data && response.data.success) {
        setClasses(prev => prev.filter(c => c.id !== id));
        // Remove from student counts
        setStudentCounts(prev => {
          const newCounts = { ...prev };
          delete newCounts[id];
          return newCounts;
        });
        showSnackbar(response.data.message || "Class deleted successfully", "success");
      } else {
        showSnackbar(response.data?.message || "Failed to delete class", "error");
      }
    } catch (err) {
      console.error("Failed to delete class:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete class";
      showSnackbar(errorMessage, "error");
    }
  };

  const copyJoinCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showSnackbar(t("Join code copied to clipboard"), "success");
    setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1200);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const openDeleteDialog = (cls) => {
    setClassToDelete(cls);
    setConfirmOpen(true);
  };

  const closeDeleteDialog = () => {
    setConfirmOpen(false);
    setClassToDelete(null);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    await handleDelete(classToDelete.id);
    closeDeleteDialog();
  };

  const filteredClasses = classes.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q) ||
      (c.joinCode || "").toLowerCase().includes(q)
    );
  });

  // Calculate total students across all classes
  const totalStudents = Object.values(studentCounts).reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        minHeight: "200px"
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: colors.mainBg,
      minHeight: "100vh",
      p: 3
    }}>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Page Title with Action */}
        <PageTitle
          icon={<ClassIcon />}
          action={
            <SecondaryButton
              startIcon={<AddIcon />}
              onClick={() => navigate("/teacher/classes/create")}
            >
              {t('New Class')}
            </SecondaryButton>
          }
        >
          {t('My Classes')}
        </PageTitle>

        {/* Page Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={`${classes.length} ${classes.length === 1 ? t('Class') : t('Classes')}`} 
            color="primary" 
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip 
            label={`${totalStudents} ${totalStudents === 1 ? t('Total Student') : t('Total Students')}`} 
            color="secondary" 
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <StyledInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search classes by name, description, or code...')}
          />
        </Box>

        {/* Class List */}
        {classes.length === 0 ? (
          <DSEmptyState
            icon={<ClassIcon />}
            title={t('No Classes Found')}
            description={t('Get started by creating your first class to organize your students and assignments.')}
            action={
              <SecondaryButton
                startIcon={<AddIcon />}
                onClick={() => navigate("/teacher/classes/create")}
              >
                {t('Create Your First Class')}
              </SecondaryButton>
            }
          />
        ) : filteredClasses.length === 0 ? (
          <DSEmptyState
            icon={<ClassIcon />}
            title={t('No results found')}
            description={t('No classes match your search. Try a different term or clear the search.')}
            action={
              <GhostButton onClick={() => setSearch("")}>
                {t('Clear Search')}
              </GhostButton>
            }
          />
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3
          }}>
            {filteredClasses.map((cls, index) => {
              const description = cls.description || t('No description provided');
              const isNewest = index === 0 && highlightNew;
              const studentCount = studentCounts[cls.id] || 0;
              
              return (
                <StyledCard
                  key={cls.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 280,
                    ...(isNewest && {
                      animation: 'highlight 2s ease-in-out',
                      '@keyframes highlight': {
                        '0%, 100%': { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
                        '50%': { boxShadow: `0 0 20px ${colors.secondary}` }
                      }
                    })
                  }}
                >
                  {/* Class Name */}
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                    {cls.name}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.6,
                    }}
                  >
                    {description}
                  </Typography>

                  {/* Stats */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StudentsIcon sx={{ fontSize: 18, color: colors.primary }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        {studentCount} {t('students')}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Join Code */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {t('Class Code')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={cls.joinCode}
                        sx={{
                          fontWeight: 700,
                          bgcolor: colors.primary,
                          color: colors.white,
                          fontSize: '0.875rem',
                          letterSpacing: 1,
                        }}
                      />
                      <Tooltip title={copiedId === cls.id ? t('Copied!') : t('Copy Code')}>
                        <IconButton
                          size="small"
                          onClick={() => copyJoinCode(cls.joinCode, cls.id)}
                          sx={{
                            color: colors.primary,
                            '&:hover': { bgcolor: `${colors.primary}20` }
                          }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2, borderTop: `1px solid ${colors.border}` }}>
                    <Tooltip title={t('View Details')}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                        sx={{
                          color: colors.primary,
                          '&:hover': { bgcolor: `${colors.primary}20` }
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('View Students')}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/teacher/classes/${cls.id}/students`)}
                        sx={{
                          color: colors.primary,
                          '&:hover': { bgcolor: `${colors.primary}20` }
                        }}
                      >
                        <StudentsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('Edit')}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/teacher/classes/${cls.id}/edit`)}
                        sx={{
                          color: colors.secondary,
                          '&:hover': { bgcolor: `${colors.secondary}20` }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title={t('Delete')}>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteDialog(cls)}
                        sx={{
                          color: colors.error,
                          '&:hover': { bgcolor: `${colors.error}20` }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </StyledCard>
              );
            })}
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ 
              width: "100%",
              borderRadius: "8px"
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <ConfirmDialog
          open={confirmOpen}
          title={t('Delete this class?')}
          description={
            classToDelete ? t(`Class "${classToDelete.name}" and its enrollments will be removed. This action cannot be undone.`) :
            t('This action cannot be undone.')
          }
          confirmText={t('Delete')}
          confirmColor="error"
          onConfirm={confirmDelete}
          onCancel={closeDeleteDialog}
        />
      </Box>
    </Box>
  );
}
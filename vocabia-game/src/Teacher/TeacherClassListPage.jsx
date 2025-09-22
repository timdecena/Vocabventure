import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  TextField
} from "@mui/material";
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as StudentsIcon,
  Class as ClassIcon
} from "@mui/icons-material";
import api from "../api/api";
import PageHeader from "./components/PageHeader";
import EmptyState from "./components/EmptyState";
import ConfirmDialog from "./components/ConfirmDialog";
import { t } from "./utils/i18n";

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
  const [expanded, setExpanded] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [highlightNew, setHighlightNew] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/api/teacher/classes");
        setClasses(res.data);
        
        // Check if we just created a new class
        if (location.state?.justCreated && res.data.length > 0) {
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
      await api.delete(`/api/teacher/classes/${id}`);
      setClasses(prev => prev.filter(c => c.id !== id));
      showSnackbar("Class deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete class:", err);
      showSnackbar("Failed to delete class", "error");
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
      p: 3,
      backgroundColor: "#f9fafc",
      minHeight: "100vh"
    }}>
      <Box sx={{ 
        maxWidth: "1200px",
        mx: "auto"
      }}>
        {/* Header Section */}
        <PageHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ClassIcon sx={{ mr: 1.5, color: "primary.main" }} />
              {t('My Classes')}
            </Box>
          }
          subtitle={t('Create and manage your classrooms')}
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/teacher/classes/create")}
              sx={{ borderRadius: 1 }}
            >
              {t('New Class')}
            </Button>
          }
        />

        {/* Toolbar: Search */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search classes by name, description, or code')}
            fullWidth
            size="small"
          />
        </Box>

        {/* Class List */}
        {classes.length === 0 ? (
          <EmptyState
            icon={<ClassIcon sx={{ fontSize: 60 }} />}
            title={t('No Classes Found')}
            description={t('Get started by creating your first class.')}
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/teacher/classes/create")}
              >
                {t('Create Class')}
              </Button>
            }
          />
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            icon={<ClassIcon sx={{ fontSize: 60 }} />}
            title={t('No results found')}
            description={t('No classes match your search. Try a different term or clear the search.')}
            action={
              <Button variant="outlined" onClick={() => setSearch("")}>{t('Clear Search')}</Button>
            }
          />
        ) : (
          <Box sx={{
            maxWidth: 1200,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 3
          }}>
            {filteredClasses.slice(0, 9).map((cls, index) => {
              const isExpanded = !!expanded[cls.id];
              const description = cls.description || t('No description provided');
              const isNewest = index === 0 && highlightNew;
              return (
                <Box key={cls.id} sx={{ minWidth: 0 }}>
                  <Card sx={{ 
                    width: '100%',
                    height: 280,
                    minWidth: 0,
                    overflow: 'hidden',
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.18s, box-shadow 0.18s, background-color 0.5s ease",
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 },
                    ...(isNewest && {
                      backgroundColor: 'success.light',
                      animation: 'fadeToNormal 2s ease-in-out forwards',
                      '@keyframes fadeToNormal': {
                        '0%': { backgroundColor: 'success.light' },
                        '100%': { backgroundColor: 'background.paper' }
                      }
                    })
                  }}>
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, mb: 0.5, color: "text.primary",
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {cls.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: "text.secondary",
                          mb: 0.5,
                          lineHeight: 1.5,
                          // reserve space for 2 lines whether clamped or expanded
                          minHeight: 'calc(1.5em * 2)',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          whiteSpace: isExpanded ? 'pre-wrap' : 'normal',
                          hyphens: 'auto',
                          ...(isExpanded ? {
                            overflow: 'visible'
                          } : {
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          })
                        }}
                      >
                        {description}
                      </Typography>
                      {/* Reserved area for the Show More/Less button to align cards uniformly */}
                      <Box sx={{ height: 24 }}>
                        {description && description.length > 80 && (
                          <Button size="small" variant="text" color="primary" sx={{ p: 0, minWidth: 0, textTransform: 'none' }} onClick={() => setExpanded(prev => ({ ...prev, [cls.id]: !prev[cls.id] }))}>
                            {isExpanded ? t('Show Less') : t('Show More')}
                          </Button>
                        )}
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                          {t('Class Code')}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
                          <Chip
                            label={cls.joinCode}
                            size="small"
                            sx={{ fontWeight: 600, backgroundColor: "grey.100", color: "text.primary" }}
                          />
                          <Tooltip title={t('Copy Code')}>
                            <IconButton 
                              size="small" 
                              onClick={() => copyJoinCode(cls.joinCode, cls.id)}
                              sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'primary.main' } }}
                              aria-label={t('Copy join code')}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {copiedId === cls.id && (
                            <Chip label={t('Copied!')} color="success" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark' }} />
                          )}
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 1.5, pt: 0, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={t('View class')}>
                          <IconButton size="small" onClick={() => navigate(`/teacher/classes/${cls.id}`)} sx={{ '&:hover': { bgcolor: 'primary.light', color: 'primary.main' } }}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('View students')}>
                          <IconButton size="small" onClick={() => navigate(`/teacher/classes/${cls.id}/students`)} sx={{ '&:hover': { bgcolor: 'info.light', color: 'info.main' } }}>
                            <StudentsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('Edit class')}>
                          <IconButton size="small" onClick={() => navigate(`/teacher/classes/${cls.id}/edit`)} sx={{ '&:hover': { bgcolor: 'secondary.light', color: 'secondary.main' } }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Tooltip title={t('Delete class')}>
                        <IconButton size="small" onClick={() => openDeleteDialog(cls)} sx={{ color: 'error.light', '&:hover': { bgcolor: 'error.light', color: 'error.main' } }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Box>
              );
            })}
          </Box>
        )}
        
        {/* View All Button */}
        {filteredClasses.length > 9 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/teacher/classes/all')}
              sx={{ px: 4 }}
            >
              {t('View All Classes')} ({filteredClasses.length})
            </Button>
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
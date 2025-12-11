import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Snackbar,
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  People as StudentsIcon,
  Edit as EditIcon,
  School as ClassIcon,
} from "@mui/icons-material";
import api from "../api/api";
import PageHeader from "./components/PageHeader";
import EmptyState from "./components/EmptyState";
import { t } from "./utils/i18n";

export default function TeacherViewClassPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/teacher/classes/${id}`);
        setClassroom(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch class data:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view this class");
        } else if (err.response?.status === 404) {
          setError("Class not found");
        } else {
          setError("Failed to load class data");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
    
    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        console.log(`[TeacherViewClassPage] Fetching students for class ${id}`);
        const res = await api.get(`/api/teacher/classes/${id}/students`);
        console.log(`[TeacherViewClassPage] Students response:`, res.data);
        
        // Validate and normalize student data
        if (Array.isArray(res.data)) {
          const normalizedStudents = res.data.map((s) => ({
            id: s.id,
            firstName: s.firstName || s.first_name || '',
            lastName: s.lastName || s.last_name || '',
            email: s.email || '',
            // Preserve any additional fields
            ...s
          }));
          console.log(`[TeacherViewClassPage] Normalized ${normalizedStudents.length} students`);
          setStudents(normalizedStudents);
        } else {
          console.warn("[TeacherViewClassPage] Students response is not an array:", res.data);
          setStudents([]);
        }
      } catch (err) {
        console.error("[TeacherViewClassPage] Failed to fetch students:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view students in this class");
        } else if (err.response?.status === 404) {
          setError("Class not found");
        } else {
          console.error("[TeacherViewClassPage] Student fetch error details:", err.response?.data || err.message);
        }
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [id]);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(classroom?.joinCode || "");
    showSnackbar("Join code copied to clipboard", "success");
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate("/teacher/classes")}
        >
          {t('Back to My Classes')}
        </Button>
      </Box>
    );
  }

  if (!classroom) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Class not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate("/teacher/classes")}
        >
          {t('Back to My Classes')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <PageHeader
          backTo="/teacher/classes"
          backLabel={t('Back to Classes')}
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ClassIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              {classroom.name}
            </Box>
          }
          subtitle={classroom.description || t('No description')}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/teacher/classes/${id}/fpow-progress`)}
              >
                {t('FPOW Progress')}
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/teacher/classes/${id}/edit`)}
              >
                {t('Edit Class')}
              </Button>
            </Box>
          }
        />

        <Grid container spacing={3}>
          {/* Class Info Card */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('Class Information')}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Join Code')}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Chip
                        label={classroom.joinCode}
                        sx={{ 
                          mr: 1,
                          fontWeight: 600,
                          backgroundColor: "grey.100"
                        }}
                      />
                      <Tooltip title={t('Copy join code')}>
                        <IconButton onClick={copyJoinCode}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Created On')}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      {new Date(classroom.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Students')}
                    </Typography>
                    <Typography sx={{ mt: 1, fontWeight: 600 }}>
                      {studentsLoading ? '—' : students.length}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('Quick Actions')}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<StudentsIcon />}
                      onClick={() => navigate(`/teacher/classes/${id}/students`)}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      {t('View Students')}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      startIcon={<EditIcon />}
                      onClick={() => navigate('/teacher/fpow/create')}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      {t('Create 4 Pics 1 Word Level')}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(`/teacher/classes/${id}/fpow-progress`)}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      {t('FPOW Progress')}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Students Preview */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {t('Students')}
          </Typography>
          <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            {studentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : students.length === 0 ? (
              <EmptyState
                icon={<StudentsIcon sx={{ fontSize: 48 }} />}
                title={t('No students yet')}
                description={t('Share the class join code to invite students.')}
                action={<Button variant="contained" onClick={copyJoinCode}>{t('Copy Join Code')}</Button>}
              />
            ) : (
              <List>
                {students.slice(0, 6).map((s, idx) => (
                  <ListItem key={s.id || idx} divider={idx < Math.min(6, students.length) - 1} secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => navigate(`/teacher/classes/${id}/students/${s.id}/fpow-progress`)}
                      >
                        {t('FPOW Progress')}
                      </Button>
                      {idx === 0 && (
                        <Button size="small" variant="outlined" onClick={() => navigate(`/teacher/classes/${id}/students`)}>
                          {t('View all')}
                        </Button>
                      )}
                    </Box>
                  }>
                    <Avatar sx={{ mr: 2 }}>
                      {s.firstName?.[0] || s.first_name?.[0] || '?'}
                      {s.lastName?.[0] || s.last_name?.[0] || ''}
                    </Avatar>
                    <ListItemText 
                      primary={`${s.firstName || s.first_name || t('Student')} ${s.lastName || s.last_name || ''}`.trim()} 
                      secondary={s.email || ''} 
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>

        {/* Recent Activity Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {t('Recent Activity')}
          </Typography>
          <Paper elevation={0} sx={{ 
            p: 3, 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              {t('Activity feed will appear here')}
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
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
  );
}
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
  Avatar,
  Stack,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  People as StudentsIcon,
  Edit as EditIcon,
  School as ClassIcon,
  Insights as InsightsIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  VpnKey as KeyIcon,
} from "@mui/icons-material";
import api from "../api/api";
import { t } from "./utils/i18n";
import {
  colors,
  StyledCard,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  SectionHeader,
  EmptyState as DSEmptyState,
} from "./components/DesignSystem";

export default function TeacherViewClassPage() {
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
        const [classRes, studentsRes] = await Promise.all([
          api.get(`/api/teacher/classes/${id}`),
          api.get(`/api/teacher/classes/${id}/students`)
        ]);
        setClassroom(classRes.data);
        
        // Validate and normalize student data
        if (Array.isArray(studentsRes.data)) {
          const normalizedStudents = studentsRes.data.map((s) => ({
            id: s.id,
            firstName: s.firstName || s.first_name || '',
            lastName: s.lastName || s.last_name || '',
            email: s.email || '',
            ...s
          }));
          setStudents(normalizedStudents);
        } else {
          setStudents([]);
        }
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
        setStudentsLoading(false);
      }
    };
    
    fetchClassData();
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

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return '—';
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 3, borderRadius: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
          <GhostButton
          startIcon={<BackIcon />}
          onClick={() => navigate("/teacher/classes")}
        >
          {t('Back to My Classes')}
          </GhostButton>
        </Box>
      </Box>
    );
  }

  if (!classroom) {
    return (
      <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Class not found
        </Alert>
          <GhostButton
          startIcon={<BackIcon />}
          onClick={() => navigate("/teacher/classes")}
        >
          {t('Back to My Classes')}
          </GhostButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', p: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton
            onClick={() => navigate("/teacher/classes")}
            sx={{
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              '&:hover': { bgcolor: colors.primary, color: '#fff' }
            }}
          >
            <BackIcon />
          </IconButton>
          <PageTitle
            icon={<ClassIcon />}
            action={
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <GhostButton
                  startIcon={<InsightsIcon />}
                onClick={() => navigate(`/teacher/classes/${id}/fpow-progress`)}
              >
                  {t('View Progress')}
                </GhostButton>
                <PrimaryButton
                startIcon={<EditIcon />}
                onClick={() => navigate(`/teacher/classes/${id}/edit`)}
              >
                {t('Edit Class')}
                </PrimaryButton>
            </Box>
          }
          >
            {classroom.name}
          </PageTitle>
        </Box>

        {classroom.description && (
          <Typography
            variant="body1"
            sx={{
              color: colors.textLight,
              mb: 4,
              maxWidth: 800,
              lineHeight: 1.7
            }}
          >
            {classroom.description}
          </Typography>
        )}

        {/* Stats and Info Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 4
        }}>
          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: `${colors.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary
                }}
              >
                <StudentsIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                  {studentsLoading ? '—' : students.length}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                  {t('Students')}
                </Typography>
              </Box>
            </Box>
          </StyledCard>

          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: `${colors.secondary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.secondary
                }}
              >
                <KeyIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500, mb: 0.5 }}>
                      {t('Join Code')}
                    </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={classroom.joinCode}
                        sx={{ 
                          fontWeight: 600,
                      bgcolor: `${colors.primary}10`,
                      color: colors.primary,
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                        }}
                      />
                      <Tooltip title={t('Copy join code')}>
                    <IconButton
                      size="small"
                      onClick={copyJoinCode}
                      sx={{
                        color: colors.primary,
                        '&:hover': { bgcolor: `${colors.primary}15` }
                      }}
                    >
                      <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
              </Box>
            </Box>
          </StyledCard>

          <StyledCard
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/teacher/classes/${id}/students`)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: `${colors.info}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.info
                }}
              >
                <InsightsIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.primary, mb: 0.5 }}>
                  {t('View All')}
                    </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                  {t('Student Details')}
                </Typography>
              </Box>
            </Box>
          </StyledCard>
        </Box>

        {/* Main Content Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 4
        }}>
          {/* Students List */}
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <SectionHeader>{t('Students')}</SectionHeader>
              {students.length > 0 && (
                <GhostButton
                  size="small"
                      onClick={() => navigate(`/teacher/classes/${id}/students`)}
                    >
                  {t('View All')}
                </GhostButton>
              )}
            </Box>

            {studentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : students.length === 0 ? (
              <DSEmptyState
                icon={<StudentsIcon sx={{ fontSize: 64 }} />}
                title={t('No students yet')}
                description={t('Share the class join code to invite students to this class.')}
                action={
                  <PrimaryButton onClick={copyJoinCode} startIcon={<CopyIcon />}>
                    {t('Copy Join Code')}
                  </PrimaryButton>
                }
              />
            ) : (
              <Stack spacing={0}>
                {students.slice(0, 8).map((s, idx) => (
                  <Box
                    key={s.id || idx}
                        onClick={() => navigate(`/teacher/classes/${id}/students/${s.id}/fpow-progress`)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderTop: idx > 0 ? `1px solid ${colors.border}` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: `${colors.primary}08`,
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: colors.primary,
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}
                    >
                      {(s.firstName?.[0] || s.first_name?.[0] || '?').toUpperCase()}
                      {(s.lastName?.[0] || s.last_name?.[0] || '').toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: colors.text,
                          mb: 0.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {`${s.firstName || s.first_name || t('Student')} ${s.lastName || s.last_name || ''}`.trim()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.textLight,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {s.email || t('No email')}
                      </Typography>
                    </Box>
                    <GhostButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/classes/${id}/students/${s.id}/fpow-progress`);
                      }}
                    >
                      {t('Progress')}
                    </GhostButton>
                  </Box>
                ))}
                {students.length > 8 && (
                  <Box sx={{ pt: 2, textAlign: 'center' }}>
                    <GhostButton onClick={() => navigate(`/teacher/classes/${id}/students`)}>
                      {t('View All Students', { count: students.length })}
                    </GhostButton>
                  </Box>
                )}
              </Stack>
            )}
          </StyledCard>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <StyledCard>
              <SectionHeader sx={{ mb: 3 }}>{t('Quick Actions')}</SectionHeader>
              <Stack spacing={2}>
                <PrimaryButton
                  fullWidth
                  startIcon={<StudentsIcon />}
                  onClick={() => navigate(`/teacher/classes/${id}/students`)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('View All Students')}
                </PrimaryButton>
                <SecondaryButton
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/teacher/fpow/create', { state: { classroomId: id } })}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('Create FPOW Level')}
                </SecondaryButton>
                <GhostButton
                  fullWidth
                  startIcon={<InsightsIcon />}
                  onClick={() => navigate(`/teacher/classes/${id}/fpow-progress`)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('View Progress')}
                </GhostButton>
              </Stack>
            </StyledCard>

            <StyledCard>
              <SectionHeader sx={{ mb: 3 }}>{t('Class Info')}</SectionHeader>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textLight, mb: 0.5, fontWeight: 500 }}>
                    {t('Join Code')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={classroom.joinCode}
                      sx={{
                        fontWeight: 600,
                        bgcolor: `${colors.primary}10`,
                        color: colors.primary,
                        fontFamily: 'monospace'
                      }}
                    />
                    <Tooltip title={t('Copy')}>
                      <IconButton
                        size="small"
                        onClick={copyJoinCode}
                        sx={{ color: colors.primary }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
        </Box>
              </Stack>
            </StyledCard>
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
    </Box>
  );
}

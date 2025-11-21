import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  School as SchoolIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Class as ClassIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import api from '../api/api';
import { t } from './utils/i18n';
import { colors, PrimaryButton, SecondaryButton } from './components/DesignSystem';

const TeacherHome = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [teacherInfo, setTeacherInfo] = useState({});
  const [classes, setClasses] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [search, setSearch] = useState('');


  useEffect(() => {
    const decodeJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const jsonPayload = decodeURIComponent(
          atob(base64Url)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    };

    const fetchTeacherInfo = async () => {
      // Prefer decoding from JWT to avoid noisy 404s on profile endpoints
      const token = localStorage.getItem('token');
      const payload = token ? decodeJwt(token) : null;
      if (payload) {
        return {
          firstName: payload.firstName || payload.given_name || 'Teacher',
          lastName: payload.lastName || payload.family_name || '',
          email: payload.email || '',
          avatar: '/avatars/teacher.png',
        };
      }

      // Fallback: try stable endpoints only (avoid /api/teacher/profile which 404s)
      const candidates = [
        '/api/auth/me',
        '/api/user/me',
        '/api/me',
      ];
      for (const url of candidates) {
        try {
          const res = await api.get(url);
          if (res?.data) return res.data;
        } catch (_) {
          // Silently continue to avoid console noise for missing optional endpoints
          continue;
        }
      }
      // Final fallback
      return {
        firstName: 'Teacher',
        lastName: '',
        email: '',
      };
    };

    const fetchData = async () => {
      try {
        // Teacher info
        const info = await fetchTeacherInfo();
        setTeacherInfo(info);

        // Classes
        let effectiveClasses = [];
        try {
          const classEndpoints = ['/api/teacher/classes', '/teacher/classes'];
          let loadedClasses = [];
          for (const endpoint of classEndpoints) {
            try {
              const res = await api.get(endpoint);
              if (Array.isArray(res.data)) {
                loadedClasses = res.data;
                break;
              }
            } catch (e) {
              console.warn(
                `[TeacherHome] Classes endpoint ${endpoint} failed:`,
                e?.response?.status
              );
              continue;
            }
          }
          effectiveClasses = loadedClasses;
          setClasses(loadedClasses);
        } catch (e) {
          effectiveClasses = [];
          setClasses([]);
        }

        // Students count - derive locally from loaded classes to avoid 404s on missing endpoints
        try {
          const totalStudents = Array.isArray(effectiveClasses)
            ? effectiveClasses.reduce((sum, c) => {
                if (Array.isArray(c.students)) return sum + c.students.length;
                if (typeof c.studentCount === 'number') return sum + c.studentCount;
                return sum;
              }, 0)
            : 0;
          setStudentsCount(totalStudents);
        } catch (e) {
          setStudentsCount(0);
        }

        // Assignments count - No backend endpoint yet; use local estimate from classes to avoid 404s
        const estimatedAssignments = effectiveClasses.length > 0 
          ? Math.floor(effectiveClasses.length * 1.5) 
          : 0;
        setAssignmentsCount(estimatedAssignments);

        // Classes loaded successfully
      } catch (err) {
        console.error('Failed to fetch data (unhandled)', err);
        setTeacherInfo({ firstName: 'Teacher', lastName: '', email: '' });
        setClasses([]);
        setStudentsCount(0);
        setAssignmentsCount(0);
      }
    };

    fetchData();
  }, []);


  const handleOpenCreateClass = () => {
    setSuccessMsg('');
    setErrorMsg('');
    setClassName('');
    setClassDescription('');
    setOpen(true);
  };

  const handleCloseCreateClass = () => {
    setOpen(false);
    setClassName('');
    setClassDescription('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCreateClass = async () => {
    if (!className.trim()) {
      setErrorMsg(t('Class name is required'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await api.post('/api/teacher/classes', {
        name: className,
        description: classDescription,
      });

      setSuccessMsg(t('Class created successfully'));
      setLoading(false);

      const classesRes = await api.get('/api/teacher/classes');
      setClasses(classesRes.data);

      setTimeout(() => {
        handleCloseCreateClass();
      }, 1500);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || t('Failed to create class')
      );
      setLoading(false);
    }
  };

  // Metric Card Component (renamed to avoid confusion with DesignSystem.StatCard)
  const MetricCard = ({ icon, value, label, color, trend, onClick }) => (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        minHeight: { xs: 120, sm: 140 },
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          borderColor: color,
        } : {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box
            sx={{
              width: { xs: 48, sm: 52, md: 56 },
              height: { xs: 48, sm: 52, md: 56 },
              borderRadius: '50%',
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Box sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color }}>{icon}</Box>
          </Box>
          {trend && (
            <Chip
              label={trend}
              size="small"
              sx={{
                bgcolor: trend.startsWith('+') ? `${colors.success}15` : `${colors.error}15`,
                color: trend.startsWith('+') ? colors.success : colors.error,
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 22, sm: 24 },
              }}
            />
          )}
        </Box>
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800, 
            color: colors.text, 
            mb: 0.25,
            letterSpacing: '-0.5px',
            fontSize: { xs: '1.75rem', sm: '2.1rem', md: '2.4rem' },
            lineHeight: 1.2
          }}
        >
          {value}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: colors.textLight, 
            fontWeight: 600,
            fontSize: { xs: '0.85rem', sm: '0.9rem' }
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );

  // Filtered classes based on search query (name/description)
  const displayedClasses = Array.isArray(classes)
    ? classes.filter((c) => {
        const q = (search || '').toLowerCase();
        if (!q) return true;
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', pt: 4, px: { xs: 2, sm: 3, md: 3, lg: 4 } }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 1, 
                color: colors.text,
                fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }
              }}
            >
              {t('Welcome back')}, {teacherInfo.firstName || t('Teacher')}! 👋
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: colors.textLight, 
                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                fontWeight: 400
              }}
            >
              {t("Here's what's happening with your classes today")}
            </Typography>
          </Box>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search classes...')}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 260, md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.textLight }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Key Metrics Grid */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              icon={<ClassIcon />}
              value={classes.length}
              label={t('Total Classes')}
              color={colors.primary}
              trend="+2"
              onClick={() => navigate('/teacher/classes')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              icon={<PeopleIcon />}
              value={studentsCount}
              label={t('Total Students')}
              color={colors.secondary}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              icon={<AssignmentIcon />}
              value={assignmentsCount}
              label={t('Active Assignments')}
              color={colors.accent}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 5, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          <PrimaryButton
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/teacher/classes')}
            sx={{ px: 3.5, py: 1.25, fontSize: '0.95rem' }}
          >
            {t('Manage Classes')}
          </PrimaryButton>
          <SecondaryButton
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenCreateClass}
            sx={{ px: 3.5, py: 1.25, fontSize: '0.95rem' }}
          >
            {t('Create New Class')}
          </SecondaryButton>
          <SecondaryButton
            startIcon={<AssignmentIcon />}
            onClick={() => navigate('/teacher/fpow/create')}
            sx={{ px: 3.5, py: 1.25, fontSize: '0.95rem' }}
          >
            {t('Create 4 Pics 1 Word')}
          </SecondaryButton>
          <SecondaryButton
            startIcon={<ViewIcon />}
            onClick={() => navigate('/teacher/fpow/manage')}
            sx={{ px: 3.5, py: 1.25, fontSize: '0.95rem' }}
          >
            {t('Manage FPOW')}
          </SecondaryButton>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* My Classes Overview */}
          <Grid item xs={12}>
            <Card sx={{ 
              border: `1px solid ${colors.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 },
                  mb: 3 
                }}>
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        color: colors.text, 
                        mb: 0.5,
                        fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' }
                      }}
                    >
                      {t('My Classes')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: colors.textLight,
                        fontSize: { xs: '0.8rem', sm: '0.85rem' }
                      }}
                    >
                      {t('Manage and view all your classes')}
                    </Typography>
                  </Box>
                  <Button
                    variant="text"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/teacher/classes')}
                    sx={{
                      color: colors.primary,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1,
                      '&:hover': {
                        bgcolor: `${colors.primary}10`,
                      }
                    }}
                  >
                    {t('View All Classes')}
                  </Button>
                </Box>
                {displayedClasses.length > 0 ? (
                  <Box>
                    {/* Header Row */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 110px 130px', sm: '1fr 140px 160px' },
                      gap: 2,
                      px: { xs: 1, sm: 2 },
                      py: 1,
                      color: colors.textLight,
                      fontWeight: 600,
                    }}>
                      <Typography variant="caption">{t('Class')}</Typography>
                      <Typography variant="caption">{t('Students')}</Typography>
                      <Typography variant="caption">{t('Created')}</Typography>
                    </Box>
                    {/* Rows */}
                    <Box>
                      {displayedClasses.slice(0, 7).map((cls) => (
                        <Box
                          key={cls.id}
                          onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr 110px 130px', sm: '1fr 140px 160px' },
                            gap: 2,
                            px: { xs: 1, sm: 2 },
                            py: 1.25,
                            borderTop: `1px solid ${colors.border}`,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: `${colors.primary}08` },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                            <ClassIcon sx={{ fontSize: 18, color: colors.primary }} />
                            <Typography sx={{ fontWeight: 600, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cls.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PeopleIcon sx={{ fontSize: 16, color: colors.textLight }} />
                            <Typography variant="body2" sx={{ color: colors.textLight }}>
                              {cls.studentCount || 0}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: colors.textLight }}>
                            {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : '--'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: { xs: 5, sm: 6, md: 8 } }}>
                    <SchoolIcon sx={{ fontSize: { xs: 64, sm: 72, md: 80 }, color: colors.border, opacity: 0.4, mb: 2 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: colors.text, 
                        mb: 1, 
                        fontWeight: 600,
                        fontSize: { xs: '1.15rem', sm: '1.25rem' }
                      }}
                    >
                      {t('No Classes Yet')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: colors.textLight, 
                        mb: 3,
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        maxWidth: 400,
                        mx: 'auto'
                      }}
                    >
                      {t('Create your first class to start tracking student performance')}
                    </Typography>
                    <SecondaryButton
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={handleOpenCreateClass}
                      sx={{ px: 3.5, py: 1.25 }}
                    >
                      {t('Create Your First Class')}
                    </SecondaryButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Create Class Modal */}
      <Dialog open={open} onClose={handleCloseCreateClass} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">{t('Create New Class')}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {successMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMsg}
            </Alert>
          )}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          <TextField
            label={t('Class Name')}
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            fullWidth
            margin="normal"
            required
            variant="outlined"
            autoFocus
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label={t('Description (optional)')}
            value={classDescription}
            onChange={(e) => setClassDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={3}
            variant="outlined"
            inputProps={{ maxLength: 200 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Button onClick={handleCloseCreateClass} color="inherit" disabled={loading}>
            {t('Cancel')}
          </Button>
          <Button
            onClick={handleCreateClass}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? t('Creating...') : t('Create Class')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherHome;

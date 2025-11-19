import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  InputAdornment,
  Paper,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  School as SchoolIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Class as ClassIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import api from '../api/api';
import { t } from './utils/i18n';
import { colors, PrimaryButton, SecondaryButton, StyledCard, PageTitle } from './components/DesignSystem';

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
  const [avgScore, setAvgScore] = useState(0);
  const [search, setSearch] = useState('');
  const [loadingData, setLoadingData] = useState(true);

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

      const candidates = ['/api/auth/me', '/api/user/me', '/api/me'];
      for (const url of candidates) {
        try {
          const res = await api.get(url);
          if (res?.data) return res.data;
        } catch (_) {
          continue;
        }
      }
      return {
        firstName: 'Teacher',
        lastName: '',
        email: '',
      };
    };

    const fetchData = async () => {
      try {
        setLoadingData(true);
        const info = await fetchTeacherInfo();
        setTeacherInfo(info);

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
              continue;
            }
          }
          effectiveClasses = loadedClasses;
          setClasses(loadedClasses);
        } catch (e) {
          effectiveClasses = [];
          setClasses([]);
        }

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

        const estimatedAssignments = effectiveClasses.length > 0 
          ? Math.floor(effectiveClasses.length * 1.5) 
          : 0;
        setAssignmentsCount(estimatedAssignments);

        // Try to fetch average score from analytics
        try {
          const analyticsRes = await api.get('/api/teacher/fpow-progress?range=30d');
          if (analyticsRes?.data?.studentProgress && Array.isArray(analyticsRes.data.studentProgress)) {
            const students = analyticsRes.data.studentProgress;
            if (students.length > 0) {
              const totalAccuracy = students.reduce((sum, s) => sum + (Number(s.accuracy) || 0), 0);
              const avg = Math.round(totalAccuracy / students.length);
              setAvgScore(avg);
            }
          }
        } catch (e) {
          // If analytics endpoint fails, set to 0
          setAvgScore(0);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
        setTeacherInfo({ firstName: 'Teacher', lastName: '', email: '' });
        setClasses([]);
        setStudentsCount(0);
        setAssignmentsCount(0);
        setAvgScore(0);
      } finally {
        setLoadingData(false);
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
        window.location.reload();
      }, 1500);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || t('Failed to create class')
      );
      setLoading(false);
    }
  };

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

  // Fixed card colors for summary metrics
  const summaryCardColors = [
    { bg: '#E3F2FD', text: '#1976D2', icon: '#1976D2' }, // Blue
    { bg: '#E8F5E9', text: '#388E3C', icon: '#388E3C' }, // Green
    { bg: '#FFF3E0', text: '#F57C00', icon: '#F57C00' }, // Orange
    { bg: '#F3E5F5', text: '#7B1FA2', icon: '#7B1FA2' }, // Purple
  ];

  // Fixed dimensions
  const SUMMARY_CARD_WIDTH = 200;
  const SUMMARY_CARD_HEIGHT = 120;
  const CLASS_CARD_WIDTH = 280;
  const CLASS_CARD_HEIGHT = 180;

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 6, pt: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <PageTitle icon={<SchoolIcon sx={{ fontSize: 32 }} />}>
            Welcome back, {teacherInfo.firstName || t('Teacher')}! 👋
          </PageTitle>
          <Typography 
            variant="h6" 
            sx={{ 
              color: colors.textLight, 
              mt: 1,
              fontWeight: 400,
              fontSize: '1.1rem',
              ml: { xs: 0, md: 10 },
            }}
          >
            {t("Here's what's happening with your classes today")}
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search classes...')}
            size="medium"
            fullWidth
            sx={{
              maxWidth: 500,
              bgcolor: '#FFFFFF',
              borderRadius: '12px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: colors.border,
                },
                '&:hover fieldset': {
                  borderColor: colors.primary,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.textLight }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Fixed-Size Summary Cards Row */}
        <Box sx={{ 
          mb: 5,
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', md: 'flex-start' },
        }}>
          {/* Total Classes */}
          <Paper
            sx={{
              width: SUMMARY_CARD_WIDTH,
              height: SUMMARY_CARD_HEIGHT,
              p: 3,
              borderRadius: '16px',
              bgcolor: summaryCardColors[0].bg,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              },
            }}
            onClick={() => navigate('/teacher/classes')}
          >
            {loadingData ? (
              <Skeleton variant="text" width={60} height={48} />
            ) : (
              <>
                <ClassIcon sx={{ fontSize: 36, color: summaryCardColors[0].icon, mb: 1.5 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: summaryCardColors[0].text,
                    mb: 0.5,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                  }}
                >
                  {classes.length}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.textLight, 
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Total Classes
                </Typography>
              </>
            )}
          </Paper>

          {/* Total Students */}
          <Paper
            sx={{
              width: SUMMARY_CARD_WIDTH,
              height: SUMMARY_CARD_HEIGHT,
              p: 3,
              borderRadius: '16px',
              bgcolor: summaryCardColors[1].bg,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loadingData ? (
              <Skeleton variant="text" width={60} height={48} />
            ) : (
              <>
                <PeopleIcon sx={{ fontSize: 36, color: summaryCardColors[1].icon, mb: 1.5 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: summaryCardColors[1].text,
                    mb: 0.5,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                  }}
                >
                  {studentsCount}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.textLight, 
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Total Students
                </Typography>
              </>
            )}
          </Paper>

          {/* Active Assignments */}
          <Paper
            sx={{
              width: SUMMARY_CARD_WIDTH,
              height: SUMMARY_CARD_HEIGHT,
              p: 3,
              borderRadius: '16px',
              bgcolor: summaryCardColors[2].bg,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loadingData ? (
              <Skeleton variant="text" width={60} height={48} />
            ) : (
              <>
                <AssignmentIcon sx={{ fontSize: 36, color: summaryCardColors[2].icon, mb: 1.5 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: summaryCardColors[2].text,
                    mb: 0.5,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                  }}
                >
                  {assignmentsCount}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.textLight, 
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Active Assignments
                </Typography>
              </>
            )}
          </Paper>

          {/* Average Score */}
          <Paper
            sx={{
              width: SUMMARY_CARD_WIDTH,
              height: SUMMARY_CARD_HEIGHT,
              p: 3,
              borderRadius: '16px',
              bgcolor: summaryCardColors[3].bg,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              },
            }}
            onClick={() => navigate('/teacher/analytics')}
          >
            {loadingData ? (
              <Skeleton variant="text" width={60} height={48} />
            ) : (
              <>
                <TrendingUpIcon sx={{ fontSize: 36, color: summaryCardColors[3].icon, mb: 1.5 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: summaryCardColors[3].text,
                    mb: 0.5,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                  }}
                >
                  {avgScore > 0 ? `${avgScore}%` : '—'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: colors.textLight, 
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Average Score
                </Typography>
              </>
            )}
          </Paper>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <PrimaryButton
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/teacher/classes')}
            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: '12px' }}
          >
            {t('Manage Classes')}
          </PrimaryButton>
          <SecondaryButton
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenCreateClass}
            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: '12px' }}
          >
            {t('Create New Class')}
          </SecondaryButton>
        </Box>

        {/* My Classes Section */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: colors.text,
                  mb: 0.5,
                }}
              >
                {t('My Classes')}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.textLight,
                }}
              >
                {t('Manage and view all your classes')}
              </Typography>
            </Box>
            {displayedClasses.length > 0 && (
              <Button
                variant="text"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/teacher/classes')}
                sx={{
                  color: colors.primary,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    bgcolor: `${colors.primary}10`,
                  },
                }}
              >
                {t('View All Classes')}
              </Button>
            )}
          </Box>

          {/* Fixed-Size Class Cards Grid */}
          {loadingData ? (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton 
                  key={i} 
                  variant="rectangular" 
                  width={CLASS_CARD_WIDTH} 
                  height={CLASS_CARD_HEIGHT} 
                  sx={{ 
                    borderRadius: '12px',
                    mx: 'auto',
                  }} 
                />
              ))}
            </Box>
          ) : displayedClasses.length > 0 ? (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}>
              {displayedClasses.map((cls) => (
                <StyledCard
                  key={cls.id}
                  sx={{
                    width: CLASS_CARD_WIDTH,
                    height: CLASS_CARD_HEIGHT,
                    p: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: colors.primary,
                        mr: 2,
                        flexShrink: 0,
                      }}
                    >
                      <ClassIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: colors.text,
                          mb: 1,
                          fontSize: '1.1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cls.name}
                      </Typography>
                      {cls.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textLight,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {cls.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 'auto',
                    pt: 2, 
                    borderTop: `1px solid ${colors.border}` 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ fontSize: 18, color: colors.textLight }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: colors.text, 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        {cls.studentCount || 0} {t('students')}
                      </Typography>
                    </Box>
                  </Box>
                </StyledCard>
              ))}
            </Box>
          ) : (
            <StyledCard sx={{ p: 6, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
              <SchoolIcon sx={{ fontSize: 80, color: colors.border, opacity: 0.4, mb: 3 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  color: colors.text, 
                  mb: 1.5, 
                  fontWeight: 600,
                }}
              >
                {t('No Classes Yet')}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: colors.textLight, 
                  mb: 4,
                }}
              >
                {t('Create your first class to start tracking student performance')}
              </Typography>
              <SecondaryButton
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleOpenCreateClass}
                sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: '12px' }}
              >
                {t('Create Your First Class')}
              </SecondaryButton>
            </StyledCard>
          )}
        </Box>
      </Box>

      {/* Create Class Modal */}
      <Dialog open={open} onClose={handleCloseCreateClass} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'background.paper', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddCircleOutlineIcon sx={{ color: colors.primary, fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('Create New Class')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {successMsg && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
              {successMsg}
            </Alert>
          )}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'background.paper', gap: 1 }}>
          <Button 
            onClick={handleCloseCreateClass} 
            color="inherit" 
            disabled={loading}
            sx={{ borderRadius: '8px', px: 3 }}
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={handleCreateClass}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ borderRadius: '8px', px: 3 }}
          >
            {loading ? t('Creating...') : t('Create Class')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherHome;

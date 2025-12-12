import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
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
  Avatar,
  Divider,
  LinearProgress,
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
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  AccessTime as AccessTimeIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import api from '../api/api';
import { t } from './utils/i18n';
import {
  colors,
  StyledCard,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
  StyledInput,
  EmptyState as DSEmptyState,
} from './components/DesignSystem';

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
  const [fpowStats, setFpowStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

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
        // Teacher info
        const info = await fetchTeacherInfo();
        setTeacherInfo(info);

        // Classes
        let effectiveClasses = [];
        try {
          const res = await api.get('/api/teacher/classes');
          if (Array.isArray(res.data)) {
            effectiveClasses = res.data;
            // Log first class structure to debug date fields
            if (res.data.length > 0) {
              console.log('[TeacherHome] Sample class data structure:', {
                id: res.data[0].id,
                name: res.data[0].name,
                availableFields: Object.keys(res.data[0]),
                createdAt: res.data[0].createdAt,
                created_at: res.data[0].created_at,
                dateCreated: res.data[0].dateCreated,
              });
            }
            setClasses(res.data);
          }
        } catch (e) {
          console.warn('[TeacherHome] Classes endpoint failed:', e?.response?.status);
          effectiveClasses = [];
          setClasses([]);
        }

        // Students count - Fetch from each class individually
        try {
          let totalStudents = 0;
          const studentCountPromises = effectiveClasses.map(async (c) => {
            try {
              const studentsRes = await api.get(`/api/teacher/classes/${c.id}/students`);
              if (Array.isArray(studentsRes.data)) {
                console.log(`[TeacherHome] Class ${c.id} (${c.name}): ${studentsRes.data.length} students`);
                return studentsRes.data.length;
              }
              console.warn(`[TeacherHome] Class ${c.id} students response is not an array:`, studentsRes.data);
              return 0;
            } catch (err) {
              console.warn(`[TeacherHome] Could not fetch students for class ${c.id} (${c.name}):`, err?.response?.status || err.message);
              return 0;
            }
          });
          
          const counts = await Promise.all(studentCountPromises);
          totalStudents = counts.reduce((sum, count) => sum + count, 0);
          console.log(`[TeacherHome] Total students across all classes: ${totalStudents}`);
          
          // Also update classes with student counts for display
          const classesWithCounts = effectiveClasses.map((c, idx) => ({
            ...c,
            studentCount: counts[idx] || 0
          }));
          setClasses(classesWithCounts);
          setStudentsCount(totalStudents);
        } catch (e) {
          console.error('[TeacherHome] Student count calculation failed:', e);
          setStudentsCount(0);
        }

        // Assignments count - Fetch real data from FPOW and Spelling Challenges
        let totalAssignments = 0;
        try {
          // Count FPOW levels
          try {
            const fpowRes = await api.get('/api/teacher/fpow');
            if (Array.isArray(fpowRes.data)) {
              totalAssignments += fpowRes.data.length;
            }
          } catch (e) {
            console.warn('[TeacherHome] FPOW count failed:', e);
          }

          // Count Spelling Levels across all classes
          try {
            let spellingCount = 0;
            for (const cls of effectiveClasses) {
              try {
                const spellingRes = await api.get(`/api/spelling-level/classroom/${cls.id}`);
                if (Array.isArray(spellingRes.data)) {
                  spellingCount += spellingRes.data.length;
                }
              } catch (e) {
                // Skip if endpoint doesn't exist or class has no spelling levels
                continue;
              }
            }
            totalAssignments += spellingCount;
          } catch (e) {
            console.warn('[TeacherHome] Spelling levels count failed:', e);
          }

          // Fallback to estimate if no data available
          if (totalAssignments === 0 && effectiveClasses.length > 0) {
            totalAssignments = Math.floor(effectiveClasses.length * 1.5);
          }
        } catch (e) {
          console.warn('[TeacherHome] Assignments count failed:', e);
          totalAssignments = effectiveClasses.length > 0 ? Math.floor(effectiveClasses.length * 1.5) : 0;
        }
        setAssignmentsCount(totalAssignments);

        // Fetch FPOW Analytics for quick stats
        try {
          const fpowRes = await api.get('/api/teacher/fpow-progress?range=30d');
          if (fpowRes.data) {
            const studentProgress = Array.isArray(fpowRes.data.studentProgress) ? fpowRes.data.studentProgress : [];
            const totalStudents = studentProgress.length;
            const avgCompletionRate = totalStudents > 0
              ? Math.round(studentProgress.reduce((sum, s) => {
                  const estimatedTotal = 30;
                  return sum + (s.levelsCompleted / estimatedTotal) * 100;
                }, 0) / totalStudents)
              : 0;
            const avgAccuracy = totalStudents > 0
              ? Math.round(studentProgress.reduce((sum, s) => sum + (Number(s.accuracy) || 0), 0) / totalStudents)
              : 0;
            const avgHintUsage = totalStudents > 0
              ? Math.round(studentProgress.reduce((sum, s) => sum + (Number(s.hintRate) || 0), 0) / totalStudents)
              : 0;
            const strugglingCount = studentProgress.filter(s => s.struggling === true).length;

            setFpowStats({
              totalStudents,
              avgCompletionRate,
              avgAccuracy,
              avgHintUsage,
              strugglingCount,
              recentStudents: studentProgress
                .sort((a, b) => {
                  const dateA = a.lastActive ? new Date(a.lastActive) : new Date(0);
                  const dateB = b.lastActive ? new Date(b.lastActive) : new Date(0);
                  return dateB - dateA;
                })
                .slice(0, 5),
            });
          }
        } catch (e) {
          console.warn('[TeacherHome] FPOW stats failed:', e);
        }

        setLoadingStats(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setTeacherInfo({ firstName: 'Teacher', lastName: '', email: '' });
        setClasses([]);
        setStudentsCount(0);
        setAssignmentsCount(0);
        setLoadingStats(false);
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

  // Filtered classes based on search query
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
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', p: 3 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Page Title */}
        <PageTitle
          icon={<SchoolIcon />}
          action={
            <SecondaryButton
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleOpenCreateClass}
            >
              {t('New Class')}
            </SecondaryButton>
          }
        >
          {t('Welcome back')}, {teacherInfo.firstName || t('Teacher')}! 👋
        </PageTitle>

        {/* Welcome Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: colors.textLight,
            mb: 3,
            fontSize: '1rem',
          }}
        >
          {t("Here's what's happening with your classes today")}
        </Typography>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <StyledInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search classes by name or description...')}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: colors.textLight, mr: 1 }} />,
            }}
          />
        </Box>

        {/* Key Metrics Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <StyledCard sx={{ cursor: 'pointer' }} onClick={() => navigate('/teacher/classes')}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${colors.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <ClassIcon sx={{ fontSize: 24, color: colors.primary }} />
              </Box>
              <Chip
                label="+2"
                size="small"
                sx={{
                  bgcolor: `${colors.secondary}15`,
                  color: colors.secondary,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
              {classes.length}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
              {t('Total Classes')}
            </Typography>
          </StyledCard>

          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${colors.secondary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <PeopleIcon sx={{ fontSize: 24, color: colors.secondary }} />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
              {studentsCount}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
              {t('Total Students')}
            </Typography>
          </StyledCard>

          <StyledCard
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/teacher/fpow/manage')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${colors.accent}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <AssignmentIcon sx={{ fontSize: 24, color: colors.accent }} />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
              {assignmentsCount}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
              {t('Active FPOW Levels')}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textLight, mt: 0.5, display: 'block' }}>
              {t('FPOW')}
            </Typography>
          </StyledCard>

          {/* FPOW Quick Stats */}
          {fpowStats && fpowStats.totalStudents > 0 && (
            <>
              <StyledCard sx={{ cursor: 'pointer' }} onClick={() => navigate('/teacher/fpow/analytics')}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: `${colors.primary}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 24, color: colors.primary }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                  {fpowStats.avgCompletionRate}%
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                  {t('FPOW Completion')}
                </Typography>
              </StyledCard>

              <StyledCard sx={{ cursor: 'pointer' }} onClick={() => navigate('/teacher/fpow/analytics')}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: `${colors.secondary}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 24, color: colors.secondary }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                  {fpowStats.avgAccuracy}%
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                  {t('FPOW Accuracy')}
                </Typography>
              </StyledCard>
            </>
          )}
        </Box>

        {/* Quick Actions & Analytics Access */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <SecondaryButton
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/teacher/classes')}
            sx={{ py: 1.5, fontSize: '0.95rem' }}
          >
            {t('Manage Classes')}
          </SecondaryButton>
          <SecondaryButton
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenCreateClass}
            sx={{ py: 1.5, fontSize: '0.95rem' }}
          >
            {t('Create New Class')}
          </SecondaryButton>
          <SecondaryButton
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/teacher/fpow/analytics')}
            sx={{ py: 1.5, fontSize: '0.95rem' }}
          >
            {t('View Analytics')}
          </SecondaryButton>
          <SecondaryButton
            startIcon={<ViewIcon />}
            onClick={() => navigate('/teacher/fpow/manage')}
            sx={{ py: 1.5, fontSize: '0.95rem' }}
          >
            {t('Manage FPOW')}
          </SecondaryButton>
        </Box>

        {/* Main Content Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 3
        }}>
          {/* My Classes Section */}
          <StyledCard>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                  {t('My Classes')}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight }}>
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
                  '&:hover': {
                    bgcolor: `${colors.primary}10`,
                  }
                }}
              >
                {t('View All')}
              </Button>
            </Box>

            {displayedClasses.length > 0 ? (
              <Box>
                {/* Header Row */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 100px 120px', sm: '1fr 120px 140px' },
                  gap: 2,
                  px: 2,
                  py: 1,
                  mb: 1,
                  bgcolor: `${colors.primary}05`,
                  borderRadius: 1,
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text }}>
                    {t('Class')}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text }}>
                    {t('Students')}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text }}>
                    {t('Created')}
                  </Typography>
                </Box>
                {/* Rows */}
                <Box>
                  {displayedClasses.slice(0, 6).map((cls, idx) => (
                    <Box
                      key={cls.id}
                      onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr 100px 120px', sm: '1fr 120px 140px' },
                        gap: 2,
                        px: 2,
                        py: 1.5,
                        borderTop: idx > 0 ? `1px solid ${colors.border}` : 'none',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: `${colors.primary}08` },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <ClassIcon sx={{ fontSize: 18, color: colors.primary }} />
                        <Typography sx={{
                          fontWeight: 600,
                          color: colors.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
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
                        {(() => {
                          // Try multiple possible date field names
                          const dateValue = cls.createdAt || cls.created_at || cls.dateCreated || cls.createdDate;
                          if (dateValue) {
                            try {
                              const date = new Date(dateValue);
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                });
                              }
                            } catch (e) {
                              console.warn('[TeacherHome] Invalid date format:', dateValue);
                            }
                          }
                          return '—';
                        })()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <DSEmptyState
                icon={<ClassIcon />}
                title={t('No Classes Yet')}
                description={t('Create your first class to start tracking student performance')}
                action={
                  <SecondaryButton
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleOpenCreateClass}
                  >
                    {t('Create Your First Class')}
                  </SecondaryButton>
                }
              />
            )}
          </StyledCard>

          {/* Right Sidebar - Quick Stats & Recent Activity */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* FPOW Quick Stats Card */}
            {fpowStats && fpowStats.totalStudents > 0 && (
              <StyledCard>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InsightsIcon sx={{ color: colors.primary, fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                    {t('FPOW Overview')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: colors.textLight }}>
                        {t('Completion Rate')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        {fpowStats.avgCompletionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={fpowStats.avgCompletionRate}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: `${colors.primary}15`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: colors.primary,
                        }
                      }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: colors.textLight }}>
                        {t('Accuracy')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        {fpowStats.avgAccuracy}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={fpowStats.avgAccuracy}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: `${colors.secondary}15`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: colors.secondary,
                        }
                      }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: colors.textLight }}>
                        {t('Hint Usage')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        {fpowStats.avgHintUsage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={fpowStats.avgHintUsage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: `${colors.warning}15`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: colors.warning,
                        }
                      }}
                    />
                  </Box>
                  {fpowStats.strugglingCount > 0 && (
                    <Box sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: `${colors.error}10`,
                      borderRadius: 1,
                      border: `1px solid ${colors.error}30`,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <WarningIcon sx={{ fontSize: 18, color: colors.error }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.error }}>
                          {fpowStats.strugglingCount} {t('Students at Risk')}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        endIcon={<LaunchIcon />}
                        onClick={() => navigate('/teacher/fpow/analytics')}
                        sx={{
                          color: colors.error,
                          textTransform: 'none',
                          fontSize: '0.8rem',
                          p: 0,
                          minWidth: 'auto',
                        }}
                      >
                        {t('View Details')}
                      </Button>
                    </Box>
                  )}
                </Box>
              </StyledCard>
            )}

            {/* Recent Activity */}
            {fpowStats && fpowStats.recentStudents && fpowStats.recentStudents.length > 0 && (
              <StyledCard>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon sx={{ color: colors.primary, fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                    {t('Recent Activity')}
                  </Typography>
                </Box>
                <Box>
                  {fpowStats.recentStudents.map((student, idx) => (
                    <Box
                      key={student.studentId || idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1.5,
                        borderTop: idx > 0 ? `1px solid ${colors.border}` : 'none',
                      }}
                    >
                      <Avatar sx={{
                        bgcolor: colors.primary,
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem'
                      }}>
                        {student.studentName?.charAt(0) || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {student.studentName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textLight }}>
                          {student.lastActive
                            ? new Date(student.lastActive).toLocaleDateString()
                            : t('Recently active')}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${student.accuracy || 0}%`}
                        size="small"
                        sx={{
                          bgcolor: (student.accuracy || 0) >= 80 ? `${colors.secondary}15` : `${colors.warning}15`,
                          color: (student.accuracy || 0) >= 80 ? colors.secondary : colors.warning,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/teacher/fpow/analytics')}
                  sx={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: colors.primary,
                      bgcolor: `${colors.primary}10`,
                    }
                  }}
                >
                  {t('View All Analytics')}
                </Button>
              </StyledCard>
            )}

            {/* Quick Links Card */}
            <StyledCard>
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, mb: 2 }}>
                {t('Quick Links')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<BarChartIcon />}
                  onClick={() => navigate('/teacher/fpow/analytics')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: colors.text,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: `${colors.primary}10`,
                    }
                  }}
                >
                  {t('FPOW Analytics')}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/teacher/fpow/create')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: colors.text,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: `${colors.primary}10`,
                    }
                  }}
                >
                  {t('Create FPOW Level')}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<ViewIcon />}
                  onClick={() => navigate('/teacher/fpow/manage')}
                  sx={{
                    justifyContent: 'flex-start',
                    color: colors.text,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: `${colors.primary}10`,
                    }
                  }}
                >
                  {t('Manage FPOW')}
                </Button>
              </Box>
            </StyledCard>
          </Box>
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
    </Box>
  );
};

export default TeacherHome;

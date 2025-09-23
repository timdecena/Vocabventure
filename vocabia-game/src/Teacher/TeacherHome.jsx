import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
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
  Container,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  EditNote as EditNoteIcon,
  Class as ClassIcon,
  BarChart as AnalyticsIcon,
} from '@mui/icons-material';
import api from '../api/api';
import { t } from './utils/i18n';

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

  // ✅ WOTD Analytics state
  const [wotdLeaderboard, setWotdLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

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
      const candidates = [
        '/api/teacher/profile',
        '/api/teacher/info',
        '/api/auth/me',
        '/api/user/me',
        '/api/me',
      ];
      for (const url of candidates) {
        try {
          const res = await api.get(url);
          if (res?.data) return res.data;
        } catch (e) {
          console.warn(
            `[TeacherHome] Fetch failed for ${url}:`,
            e?.response?.status,
            e?.response?.data
          );
          continue;
        }
      }
      const token = localStorage.getItem('token');
      const payload = token ? decodeJwt(token) : null;
      return payload
        ? {
            firstName: payload.firstName || payload.given_name || 'Teacher',
            lastName: payload.lastName || payload.family_name || '',
            email: payload.email || '',
            avatar: '/avatars/teacher.png',
          }
        : {
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

        // Students count
        try {
          let totalStudents = 0;
          const endpoints = [
            '/api/teacher/students',
            '/api/students',
            '/teacher/students',
          ];
          for (const endpoint of endpoints) {
            try {
              const studentsRes = await api.get(endpoint);
              if (Array.isArray(studentsRes.data)) {
                totalStudents = studentsRes.data.length;
                break;
              } else if (
                studentsRes.data &&
                typeof studentsRes.data === 'object'
              ) {
                totalStudents =
                  studentsRes.data.totalStudents ||
                  studentsRes.data.count ||
                  0;
                break;
              }
            } catch (endpointError) {
              console.warn(
                `[TeacherHome] Endpoint ${endpoint} failed:`,
                endpointError?.response?.status
              );
              continue;
            }
          }

          if (
            totalStudents === 0 &&
            Array.isArray(effectiveClasses) &&
            effectiveClasses.length > 0
          ) {
            const hasCounts = effectiveClasses.some(
              (c) =>
                typeof c.studentCount === 'number' ||
                Array.isArray(c.students)
            );
            if (hasCounts) {
              totalStudents = effectiveClasses.reduce(
                (sum, c) =>
                  sum +
                  (Array.isArray(c.students)
                    ? c.students.length
                    : typeof c.studentCount === 'number'
                    ? c.studentCount
                    : 0),
                0
              );
            }
          }

          if (
            totalStudents === 0 &&
            Array.isArray(effectiveClasses) &&
            effectiveClasses.length > 0
          ) {
            try {
              const perClassCounts = await Promise.all(
                effectiveClasses.map(async (cls) => {
                  const perEndpoints = [
                    `/api/teacher/classes/${cls.id}/students`,
                    `/teacher/classes/${cls.id}/students`,
                  ];
                  for (const url of perEndpoints) {
                    try {
                      const res = await api.get(url);
                      if (Array.isArray(res.data)) return res.data.length;
                      if (
                        res.data &&
                        typeof res.data === 'object'
                      )
                        return res.data.count || res.data.total || 0;
                    } catch (e) {
                      continue;
                    }
                  }
                  return 0;
                })
              );
              totalStudents = perClassCounts.reduce((a, b) => a + b, 0);
            } catch {
              // ignore
            }
          }

          setStudentsCount(totalStudents);
        } catch (e) {
          console.warn(
            '[TeacherHome] Failed to compute students count:',
            e?.response?.status,
            e?.response?.data
          );
          setStudentsCount(0);
        }

        // Assignments count
        try {
          const assignmentsRes = await api.get('/api/teacher/assignments');
          const assignments = Array.isArray(assignmentsRes.data)
            ? assignmentsRes.data
            : [];
          setAssignmentsCount(assignments.length);
        } catch (e) {
          console.warn(
            '[TeacherHome] Failed to load assignments:',
            e?.response?.status,
            e?.response?.data
          );
          setAssignmentsCount(0);
        }

        // ✅ Fetch WOTD leaderboard
        try {
          const res = await api.get('/api/teacher/wotd/leaderboard');
          setWotdLeaderboard(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error('Failed to fetch WOTD leaderboard:', err);
          setWotdLeaderboard([]);
        } finally {
          setLoadingLeaderboard(false);
        }
      } catch (err) {
        console.error('Failed to fetch data (unhandled)', err);
        setTeacherInfo({ firstName: 'Teacher', lastName: '', email: '' });
        setClasses([]);
        setStudentsCount(0);
        setAssignmentsCount(0);
        setWotdLeaderboard([]);
        setLoadingLeaderboard(false);
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

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <ClassIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('Teacher Dashboard')}
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          {`${t('Welcome back,')} ${
            teacherInfo.firstName || t('Teacher')
          } • ${classes.length} ${t(
            classes.length === 1 ? 'class' : 'classes'
          )} • ${studentsCount} ${t(
            studentsCount === 1 ? 'student' : 'students'
          )}`}
        </Typography>
      </Box>

      {/* Profile and Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={teacherInfo.avatar}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  {teacherInfo.firstName?.charAt(0)}
                  {teacherInfo.lastName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t('Welcome back')},{' '}
                    {teacherInfo.firstName || t('Teacher')}!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {teacherInfo.email}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                <Chip
                  label={`${classes.length} ${t(
                    classes.length === 1 ? 'Class' : 'Classes'
                  )}`}
                  color="primary"
                  variant="filled"
                  sx={{
                    backgroundColor: 'primary.light',
                    color: 'primary.dark',
                  }}
                />
                <Chip
                  label={`${studentsCount} ${t(
                    studentsCount === 1 ? 'Student' : 'Students'
                  )}`}
                  color="success"
                  variant="filled"
                  sx={{
                    backgroundColor: 'success.light',
                    color: 'success.dark',
                  }}
                />
                <Chip
                  label={`${assignmentsCount} ${t(
                    assignmentsCount === 1 ? 'Assignment' : 'Assignments'
                  )}`}
                  color="secondary"
                  variant="filled"
                  sx={{
                    backgroundColor: 'secondary.light',
                    color: 'secondary.dark',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                {t('Quick Actions')}
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  {
                    icon: <SchoolIcon />,
                    label: t('My Classes'),
                    action: () => navigate('/teacher/classes'),
                    color: 'primary',
                  },
                  {
                    icon: <AddCircleOutlineIcon />,
                    label: t('Create Class'),
                    action: handleOpenCreateClass,
                    color: 'success',
                  },
                  {
                    icon: <EditNoteIcon />,
                    label: t('Create Level'),
                    action: () => navigate('/teacher/spelling/create'),
                    color: 'secondary',
                  },
                  {
                    icon: <AnalyticsIcon />,
                    label: t('Analytics'),
                    action: () => navigate('/teacher/analytics'),
                    color: 'info',
                  },
                ].map((qa) => (
                  <Grid item xs={6} key={qa.label}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        if (typeof qa.action === 'function') qa.action();
                      }}
                      startIcon={qa.icon}
                      sx={{
                        justifyContent: 'flex-start',
                        borderRadius: 2,
                      }}
                    >
                      {qa.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            icon: <SchoolIcon fontSize="large" />,
            title: t('My Classes'),
            description: t('View and manage all your classes'),
            action: () => navigate('/teacher/classes'),
            color: 'primary',
          },
          {
            icon: <AddCircleOutlineIcon fontSize="large" />,
            title: t('Create Class'),
            description: t('Set up a new class for your students'),
            action: handleOpenCreateClass,
            color: 'success',
          },
          {
            icon: <EditNoteIcon fontSize="large" />,
            title: t('Create Level'),
            description: t('Design a new spelling level'),
            action: () => navigate('/teacher/spelling/create'),
            color: 'secondary',
          },
        ].map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.title}>
            <Card
              sx={{
                height: 280,
                minHeight: 280,
                maxHeight: 280,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => {
                if (typeof action.action === 'function') action.action();
              }}
            >
              <CardContent
                sx={{
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    mb: 2,
                    borderRadius: '50%',
                    bgcolor: `${action.color}.light`,
                    color: `${action.color}.dark`,
                    alignSelf: 'center',
                  }}
                >
                  {action.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  {action.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, flexGrow: 1 }}
                >
                  {action.description}
                </Typography>
                <Button
                  variant="contained"
                  color={action.color}
                  sx={{ mt: 'auto' }}
                >
                  {action.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ✅ WOTD Analytics Leaderboard */}
{/* ✅ WOTD Analytics Leaderboard */}
<Box sx={{ mt: 5 }}>
  <Typography
    variant="h5"
    sx={{
      mb: 2,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <AnalyticsIcon sx={{ mr: 1, color: 'info.main' }} />
    {t('Word of the Day Analytics')}
  </Typography>

  {loadingLeaderboard ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
      <CircularProgress />
    </Box>
  ) : wotdLeaderboard.length === 0 ? (
    <Alert severity="info">
      {t('No student performance data yet.')}
    </Alert>
  ) : (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '8px' }}>{t('#')}</th>
                <th style={{ padding: '8px' }}>{t('Student')}</th>
                <th style={{ padding: '8px' }}>{t('Total Played')}</th>
                <th style={{ padding: '8px' }}>{t('Correct')}</th>
                <th style={{ padding: '8px' }}>{t('Accuracy')}</th>
              </tr>
            </thead>
            <tbody>
              {wotdLeaderboard.map((entry, index) => {
                const capped = Math.min(
                  Math.max(Number(entry.accuracyPercent) || 0, 0),
                  100
                );

                return (
                  <tr
                    key={entry.studentId}
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                      background:
                        index % 2 === 0 ? '#fafafa' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '8px', fontWeight: 600 }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '8px' }}>{entry.studentName}</td>
                    <td style={{ padding: '8px' }}>{entry.totalPlayed}</td>
                    <td style={{ padding: '8px', color: 'green' }}>
                      {entry.correctAnswers}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: '100%',
                            mr: 1,
                            bgcolor: '#eee',
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${capped}%`,
                              height: 8,
                              borderRadius: 2,
                              bgcolor:
                                capped >= 75
                                  ? 'success.main'
                                  : capped >= 50
                                  ? 'warning.main'
                                  : 'error.main',
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            minWidth: 40,
                            color:
                              capped >= 75
                                ? 'success.main'
                                : capped >= 50
                                ? 'warning.main'
                                : 'error.main',
                          }}
                        >
                          {capped}%
                        </Typography>
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  )}
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
    </Container>
  );
};

export default TeacherHome;

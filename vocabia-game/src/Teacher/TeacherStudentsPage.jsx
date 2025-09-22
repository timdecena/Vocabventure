import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import ClassIcon from '@mui/icons-material/Class';
import PageHeader from './components/PageHeader';
import EmptyState from './components/EmptyState';
import api from '../api/api';
import { t } from './utils/i18n';

export default function TeacherStudentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  const fetchClasses = useCallback(async () => {
    const endpoints = ['/api/teacher/classes', '/teacher/classes'];
    
    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        if (res.data && Array.isArray(res.data)) {
          return res.data;
        }
      } catch (error) {
        console.warn(`Classes endpoint ${endpoint} failed:`, error?.response?.status);
        continue;
      }
    }
    
    // Return empty array if all endpoints fail
    return [];
  }, []);

  // Fetch a single student's progress (DB-only values, no randoms)
  const fetchStudentProgress = useCallback(async (studentId, classId) => {
    if (!studentId) return {};
    const endpoints = [
      `/api/teacher/classes/${classId}/students/${studentId}/progress`,
      `/api/user-progress/student/${studentId}`,
      `/teacher/students/${studentId}/progress`
    ];
    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        if (res.data) {
          return {
            accuracy: res.data.averageAccuracy ?? res.data.accuracy ?? 0,
            completion: res.data.completionRate ?? res.data.completion ?? 0,
            totalLevelsCompleted: res.data.totalLevelsCompleted ?? res.data.levelsCompleted ?? 0,
            hintsUsed: res.data.hintsUsed ?? 0,
            goldEarned: res.data.goldEarned ?? res.data.totalGold ?? 0,
            lastActive: res.data.lastActive || res.data.updatedAt
          };
        }
      } catch (error) {
        console.warn(`Progress endpoint ${endpoint} failed:`, error?.response?.status);
        continue;
      }
    }
    return {
      accuracy: 0,
      completion: 0,
      totalLevelsCompleted: 0,
      hintsUsed: 0,
      goldEarned: 0,
      lastActive: null
    };
  }, []);

  const fetchStudentsWithProgress = useCallback(async (classesData) => {
    const endpoints = ['/api/teacher/students', '/teacher/students'];
    let studentsData = [];
    
    // Try to fetch students from multiple endpoints
    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        if (res.data && Array.isArray(res.data)) {
          studentsData = res.data;
          break;
        }
      } catch (error) {
        console.warn(`Students endpoint ${endpoint} failed:`, error?.response?.status);
        continue;
      }
    }
    
    // Enhance students with progress data and class information
    const enhancedStudents = await Promise.all(
      studentsData.map(async (student) => {
        // Find student's class
        const studentClass = classesData.find(cls => cls.id === student.classId) || 
                           classesData.find(cls => cls.students?.some(s => s.id === student.id));
        
        // Fetch progress data for this student
        const progressData = await fetchStudentProgress(student.id, studentClass?.id);
        
        return {
          ...student,
          className: studentClass?.name || 'Unknown Class',
          classId: studentClass?.id || null,
          accuracy: progressData?.accuracy ?? 0,
          completion: progressData?.completion ?? 0,
          totalLevelsCompleted: progressData?.totalLevelsCompleted ?? 0,
          hintsUsed: progressData?.hintsUsed ?? 0,
          goldEarned: progressData?.goldEarned ?? 0,
          lastActive: progressData?.lastActive || progressData?.updatedAt || null
        };
      })
    );
    
    return enhancedStudents;
  }, [fetchStudentProgress]);

  useEffect(() => {
    let mounted = true;
    
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch classes first
        const classesData = await fetchClasses();
        if (!mounted) return;
        
        // Fetch students with progress data
        const studentsData = await fetchStudentsWithProgress(classesData);
        if (!mounted) return;
        
        setClasses(classesData);
        setStudents(studentsData);
        
      } catch (err) {
        console.error('Failed to fetch students data:', err);
        if (mounted) {
          setError('Failed to load students data');
          // Use minimal fallback
          setClasses([]);
          setStudents([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAll();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAll, 30000);
    
    return () => { 
      mounted = false; 
      clearInterval(interval);
    };
  }, [fetchClasses, fetchStudentsWithProgress]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(s => {
      const matchesText = !q || `${s.firstName} ${s.lastName} ${s.email} ${s.className}`.toLowerCase().includes(q);
      const matchesClass = classFilter === 'all' || String(s.classId) === String(classFilter);
      return matchesText && matchesClass;
    });
  }, [students, search, classFilter]);

  const pastel = ['#e3f2fd','#e8f5e9','#f3e5f5','#fff3e0','#e0f2f1','#fce4ec'];
  const colorFor = (seed) => {
    const str = String(seed ?? '0');
    let sum = 0; for (let i = 0; i < str.length; i++) sum = (sum + str.charCodeAt(i)) % pastel.length;
    return pastel[sum];
  };

  return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        backTo="/teacher-home"
        backLabel={t('Back to Dashboard')}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupsIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            {t('Students')}
          </Box>
        }
        subtitle={t('All students across your classes')}
      />

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search students...')}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{t('Class')}</InputLabel>
              <Select label={t('Class')} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <MenuItem value="all">{t('All Classes')}</MenuItem>
                {classes.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            </Box>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(_, v) => v && setView(v)}
              size="small"
              aria-label={t('View toggle')}
            >
              <ToggleButton value="grid" aria-label={t('Grid view')}>{t('Grid')}</ToggleButton>
              <ToggleButton value="list" aria-label={t('List view')}>{t('List')}</ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Grid>

        {/* Content */}
        {loading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
          </Grid>
        ) : error ? (
          <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>
        ) : filtered.length === 0 ? (
          <Grid item xs={12}>
            <EmptyState
              icon={<GroupsIcon sx={{ fontSize: 56 }} />}
              title={t('No students found')}
              description={t('Try adjusting filters or clearing search')}
              action={<Button variant="outlined" onClick={() => { setSearch(''); setClassFilter('all'); }}>{t('Clear Filters')}</Button>}
            />
          </Grid>
        ) : view === 'grid' ? (
          filtered.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: colorFor(s.id), color: 'text.primary' }}>{s.firstName?.[0]}{s.lastName?.[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{s.firstName} {s.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.email}</Typography>
                    <Box mt={1}>
                      <Chip size="small" icon={<ClassIcon />} label={`${t('Class')}: ${s.className}`} sx={{ mr: 1 }} />
                    </Box>
                  </Box>
                </Box>

                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">{t('Completion')}</Typography>
                  <LinearProgress variant="determinate" value={s.completion} aria-label={t('Completion')} sx={{ height: 8, borderRadius: 6 }} />
                  <Typography variant="caption" color="text.secondary">{s.completion}%</Typography>
                </Box>
                <Box mt={1.5}>
                  <Typography variant="caption" color="text.secondary">{t('Accuracy')}</Typography>
                  <LinearProgress color="success" variant="determinate" value={s.accuracy} aria-label={t('Accuracy')} sx={{ height: 8, borderRadius: 6 }} />
                  <Typography variant="caption" color="text.secondary">{s.accuracy}%</Typography>
                </Box>

                <Box display="flex" gap={1.5} mt={2}>
                  <Button size="small" variant="outlined" onClick={() => navigate(`/teacher/classes/${s.classId}`)}>
                    {t('View Class')}
                  </Button>
                  <Button size="small" variant="contained" onClick={() => navigate(`/teacher/classes/${s.classId}/students/${s.id}/fpow-progress`)}>
                    {t('View Progress')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Table size="small" aria-label={t('Students table')}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Student')}</TableCell>
                    <TableCell>{t('Email')}</TableCell>
                    <TableCell>{t('Class')}</TableCell>
                    <TableCell width={220}>{t('Completion')}</TableCell>
                    <TableCell width={220}>{t('Accuracy')}</TableCell>
                    <TableCell align="right">{t('Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: colorFor(s.id), color: 'text.primary', width: 28, height: 28 }}>{s.firstName?.[0]}{s.lastName?.[0]}</Avatar>
                          <Typography variant="body2">{s.firstName} {s.lastName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.className}</TableCell>
                      <TableCell>
                        <LinearProgress variant="determinate" value={s.completion} aria-label={t('Completion')} sx={{ height: 8, borderRadius: 6, mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">{s.completion}%</Typography>
                      </TableCell>
                      <TableCell>
                        <LinearProgress color="success" variant="determinate" value={s.accuracy} aria-label={t('Accuracy')} sx={{ height: 8, borderRadius: 6, mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">{s.accuracy}%</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="text" onClick={() => navigate(`/teacher/classes/${s.classId}`)}>{t('View Class')}</Button>
                        <Button size="small" variant="contained" sx={{ ml: 1 }} onClick={() => navigate(`/teacher/classes/${s.classId}/students/${s.id}/fpow-progress`)}>{t('View Progress')}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DownloadIcon from '@mui/icons-material/Download';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/api';
import PageHeader from './components/PageHeader';
import EmptyState from './components/EmptyState';
import { t } from './utils/i18n';
// Using ONLY backend analytics. Removed mock transformations and estimations.

export default function TeacherAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30d');
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [classFilter, setClassFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [fpowData, setFpowData] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    let mounted = true;
    
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try multiple endpoints for real data with better error handling
        const endpoints = [
          `/api/teacher/analytics?range=${range}`,
          `/api/analytics?range=${range}`,
          `/teacher/analytics?range=${range}`
        ];
        
        let data = null;
        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint);
            if (res.data && mounted) {
              data = res.data;
              break;
            }
          } catch (endpointError) {
            console.warn(`Analytics endpoint ${endpoint} failed:`, endpointError?.response?.status);
            continue;
          }
        }
        
        if (mounted) {
          if (data) {
            setStats(data);
          } else {
            setStats(null);
            setError(t('No analytics data available'));
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Analytics fetch error:', err);
          setError('Failed to load analytics data');
          setStats(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    
    return () => { 
      mounted = false; 
      clearInterval(interval);
    };
  }, [range]);
  // FPOW data fetcher (no mock). Auto-refresh with filters.
  useEffect(() => {
    let mounted = true;
    const fetchFpow = async () => {
      try {
        const endpoints = [
          `/api/teacher/fpow-progress?range=${range}&class=${classFilter}&game=${gameFilter}`,
          `/api/user-progress/fpow-analytics?range=${range}`,
          `/teacher/fpow-analytics?range=${range}`
        ];
        let data = null;
        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint);
            if (res.data) { data = res.data; break; }
          } catch (e) {
            console.warn(`FPOW endpoint ${endpoint} failed:`, e?.response?.status);
            continue;
          }
        }
        if (mounted) setFpowData(data);
      } catch (e) {
        if (mounted) setFpowData(null);
      }
    };
    fetchFpow();
    const interval = setInterval(fetchFpow, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [range, classFilter, gameFilter]);

  // Load classes for FPOW Class filter
  useEffect(() => {
    let mounted = true;
    const loadClasses = async () => {
      const endpoints = ['/api/teacher/classes', '/teacher/classes'];
      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          if (Array.isArray(res.data)) {
            if (mounted) setClasses(res.data);
            break;
          }
        } catch (e) {
          console.warn(`Classes endpoint ${endpoint} failed:`, e?.response?.status);
          continue;
        }
      }
    };
    loadClasses();
    return () => { mounted = false; };
  }, []);

  const hasData = !!stats && (stats?.classProgress?.length || stats?.weeklyActivity?.length);

  return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        backTo="/teacher-home"
        backLabel={t('Back to Dashboard')}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InsightsIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            {t('Analytics')}
          </Box>
        }
        subtitle={t('Class performance, student engagement, and progress trends')}
        actions={
          <Button variant="outlined" startIcon={<DownloadIcon />}>{t('Export')}</Button>
        }
      />

      <Grid container spacing={3}>
        {/* Filters and Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label={t('Overview')} />
              <Tab label={t('Engagement')} />
              <Tab label={t('Accuracy')} />
              <Tab label={t('FPOW Progress')} />
            </Tabs>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small">
                <InputLabel>{t('Range')}</InputLabel>
                <Select label={t('Range')} value={range} onChange={(e) => setRange(e.target.value)}>
                  <MenuItem value="7d">{t('Last 7 days')}</MenuItem>
                  <MenuItem value="30d">{t('Last 30 days')}</MenuItem>
                  <MenuItem value="all">{t('All time')}</MenuItem>
                </Select>
              </FormControl>
              {tab === 3 && ( // FPOW Progress tab
                <>
                  <FormControl size="small">
                    <InputLabel>{t('Class')}</InputLabel>
                    <Select label={t('Class')} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                      <MenuItem value="all">{t('All Classes')}</MenuItem>
                      {classes.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>{t('Category')}</InputLabel>
                    <Select label={t('Category')} value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>
                      <MenuItem value="all">{t('All Categories')}</MenuItem>
                      <MenuItem value="animals">{t('Animals')}</MenuItem>
                      <MenuItem value="food">{t('Food')}</MenuItem>
                      <MenuItem value="objects">{t('Objects')}</MenuItem>
                      <MenuItem value="nature">{t('Nature')}</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Summary cards */}
        <Grid item xs={12}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : !hasData ? (
            <EmptyState
              icon={<InsightsIcon sx={{ fontSize: 56 }} />}
              title={t('No analytics yet')}
              description={t('As your students engage, analytics will appear here.')}
              action={
                <Button component={Link} to="/teacher/classes" variant="contained">{t('Go to Classes')}</Button>
              }
            />
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">{t('Active Classes')}</Typography>
                  </Box>
                  <Typography variant="h4">{stats?.summary?.activeClasses || stats?.kpis?.activeClasses || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <GroupsIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">{t('Students')}</Typography>
                  </Box>
                  <Typography variant="h4">{stats?.summary?.students || stats?.kpis?.totalStudents || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">{t('Avg Accuracy')}</Typography>
                  </Box>
                  <Typography variant="h4">{stats?.summary?.avgAccuracy || stats?.kpis?.avgScore || 0}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmojiEventsIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">{t('Gold Earned')}</Typography>
                  </Box>
                  <Typography variant="h4">{stats?.summary?.goldEarned || stats?.kpis?.goldEarned || 0}</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Charts */}
        {!loading && hasData && (
          <>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{t('Class Progress Over Time')}</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={stats.classProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: t('Percentage'), angle: -90, position: 'insideLeft' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completion" name={t('Completion %')} stroke="#42a5f5" activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="accuracy" name={t('Accuracy %')} stroke="#66bb6a" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{t('Weekly Activity')}</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis label={{ value: t('Number of Activities'), angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completedLevels" name={t('Levels Completed')} fill="#42a5f5" />
                    <Bar dataKey="hintsUsed" name={t('Hints Used')} fill="#ffb300" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </>
        )}

        {/* FPOW Progress Tab */}
        {tab === 3 && fpowData && (
          <>
            {/* Student Progress Table */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{t('Student FPOW Progress')}</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Student')}</TableCell>
                      <TableCell>{t('Class')}</TableCell>
                      <TableCell align="right">{t('Levels Completed')}</TableCell>
                      <TableCell align="right">{t('Accuracy')}</TableCell>
                      <TableCell align="right">{t('Hints Used')}</TableCell>
                      <TableCell align="right">{t('Time Spent')}</TableCell>
                      <TableCell>{t('Last Active')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fpowData.studentProgress
                      .filter(student => classFilter === 'all' || String(student.classId) === String(classFilter) || (student.className && student.className.toLowerCase() === String(classFilter).toLowerCase()))
                      .map((student, index) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, width: 32, height: 32 }}>{student.studentName.charAt(0)}</Avatar>
                            {student.studentName}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={student.className} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="right">{student.levelsCompleted}</TableCell>
                        <TableCell align="right">{student.accuracy}%</TableCell>
                        <TableCell align="right">{student.hintsUsed}</TableCell>
                        <TableCell align="right">{student.timeSpent}min</TableCell>
                        <TableCell>{new Date(student.lastActive).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            {/* Category Progress */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{t('Category Progress')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fpowData.categoryProgress.filter(cat => 
                    gameFilter === 'all' || cat.category.toLowerCase() === gameFilter
                  )}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis label={{ value: t('Levels'), angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name={t('Completed')} fill="#4caf50" />
                    <Bar dataKey="total" name={t('Total')} fill="#e0e0e0" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Weekly Activity */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{t('Weekly FPOW Activity')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fpowData.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: t('Count'), angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="levelsCompleted" name={t('Levels Completed')} stroke="#2196f3" />
                    <Line type="monotone" dataKey="studentsActive" name={t('Active Students')} stroke="#ff9800" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </>
        )}
        {tab === 3 && !loading && !fpowData && (
          <Grid item xs={12}>
            <EmptyState
              icon={<InsightsIcon sx={{ fontSize: 56 }} />}
              title={t('No FPOW analytics yet')}
              description={t('When students play FPOW, detailed analytics will appear here.')}
            />
          </Grid>
        )}
      </Grid>
      </Container>
  );
}

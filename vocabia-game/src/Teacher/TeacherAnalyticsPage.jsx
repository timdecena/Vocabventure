import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip as MuiTooltip,
  IconButton,
  Skeleton,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import PageHeader from './components/PageHeader';
import EmptyState from './components/EmptyState';
import { t } from './utils/i18n';

export default function TeacherAnalyticsPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [classFilter, setClassFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [fpowData, setFpowData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);

  // staged filters (Apply UX)
  const [pendingRange, setPendingRange] = useState(range);
  const [pendingClassFilter, setPendingClassFilter] = useState(classFilter);
  const [pendingGameFilter, setPendingGameFilter] = useState(gameFilter);

  useEffect(() => {
    setPendingRange(range);
    setPendingClassFilter(classFilter);
    setPendingGameFilter(gameFilter);
  }, [range, classFilter, gameFilter]);

  const handleApplyFilters = () => {
    setRange(pendingRange);
    setClassFilter(pendingClassFilter);
    setGameFilter(pendingGameFilter);
  };

  // fetch analytics
  useEffect(() => {
    let mounted = true;
    const fetchFpow = async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set('range', range);
        if (classFilter && classFilter !== 'all') qs.set('class', classFilter);
        if (gameFilter) qs.set('game', gameFilter);

        // primary endpoint (teacher analytics)
        const endpoint = `/api/teacher/fpow-progress?${qs.toString()}`;
        const res = await api.get(endpoint);
        const data = res.data || null;
        if (mounted) {
          setFpowData(data);
          if (data?.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        }
      } catch (e) {
        if (mounted) setFpowData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFpow();
    const interval = setInterval(fetchFpow, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [range, classFilter, gameFilter]);

  // load classes list
  useEffect(() => {
    let mounted = true;
    const loadClasses = async () => {
      try {
        const res = await api.get('/api/teacher/classes');
        if (mounted && Array.isArray(res.data)) setClasses(res.data);
      } catch (e) {
        // ignore
      }
    };
    loadClasses();
    return () => { mounted = false; };
  }, []);

  // derived
  const hasData = !!fpowData;
  const weeklyData = Array.isArray(fpowData?.weeklyProgress) ? fpowData.weeklyProgress : [];
  const categoryDataRaw = Array.isArray(fpowData?.categoryProgress) ? fpowData.categoryProgress : [];
  const categoryData = categoryDataRaw.filter(cat =>
    gameFilter === 'all' || String(cat.category).toLowerCase() === String(gameFilter).toLowerCase()
  );

  const studentRows = Array.isArray(fpowData?.studentProgress) ? fpowData.studentProgress : [];
  const activeStudents = studentRows.length;
  const avgAccuracy = studentRows.length
    ? Math.round(studentRows.reduce((sum, r) => sum + (Number(r.accuracy) || 0), 0) / studentRows.length)
    : 0;
  const totalLevelsCompleted = studentRows.reduce((sum, r) => sum + (Number(r.levelsCompleted) || 0), 0);
  const strugglingCount = studentRows.reduce((sum, r) => sum + (r?.struggling ? 1 : 0), 0);

  const accuracyColor = (v) => (v >= 90 ? 'success.main' : v >= 70 ? 'warning.main' : 'error.main');
  const muiChipColors = ['primary','secondary','success','info','warning','error'];
  const colorForClass = (name) => {
    if (!name) return 'default';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return muiChipColors[hash % muiChipColors.length];
  };
  const formatMinutes = (m) => {
    const mins = Number(m) || 0;
    const h = Math.floor(mins / 60);
    const mm = mins % 60;
    if (h > 0) return `${h}h ${mm}m`;
    return `${mm}m`;
  };
  const formatDay = (d) => {
    try {
      const dd = new Date(d);
      if (!isNaN(dd)) return dd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return d;
    } catch { return d; }
  };

  const chartPaperSx = {
    p: 3,
    borderRadius: 3,
    border: (t) => `1px solid ${t.palette.divider}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
      transform: 'translateY(-2px)'
    }
  };
  const chartBoxSx = { width: '100%', height: { xs: 320, sm: 380, md: 420 }, mt: 1 };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, bgcolor: '#F7F8FC', borderRadius: 3, p: { xs: 1, sm: 2 } }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(5, 1fr)',
        gap: 2,
        minHeight: '80vh'
      }}>
        {/* Header */}
        <Box sx={{ gridColumn: 'span 5', gridRow: '1', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PageHeader
            backTo="/teacher-home"
            backLabel={t('Back to Dashboard')}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InsightsIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                {t('FOUR PIC ONE WORD PROGRESS')}
              </Box>
            }
            subtitle={t('Detailed progress and activity for Four Pics One Word')}
            actions={<Button variant="outlined" startIcon={<DownloadIcon />}>{t('Export')}</Button>}
          />

          {/* Filters */}
          <Paper sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'nowrap',
            gap: 3,
            overflowX: 'auto',
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'nowrap', alignItems: 'center' }}>
              <FormControl size="medium" sx={{ minWidth: 200 }}>
                <InputLabel>{t('Range')}</InputLabel>
                <Select label={t('Range')} value={pendingRange} onChange={(e) => setPendingRange(e.target.value)}>
                  <MenuItem value="7d">{t('Last 7 days')}</MenuItem>
                  <MenuItem value="30d">{t('Last 30 days')}</MenuItem>
                  <MenuItem value="all">{t('All time')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="medium" sx={{ minWidth: 200 }}>
                <InputLabel>{t('Class')}</InputLabel>
                <Select label={t('Class')} value={pendingClassFilter} onChange={(e) => setPendingClassFilter(e.target.value)}>
                  <MenuItem value="all">{t('All Classes')}</MenuItem>
                  {classes.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="medium" sx={{ minWidth: 200 }}>
                <InputLabel>{t('Category')}</InputLabel>
                <Select label={t('Category')} value={pendingGameFilter} onChange={(e) => setPendingGameFilter(e.target.value)}>
                  <MenuItem value="all">{t('All Categories')}</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={String(cat)}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleApplyFilters}>{t('Apply Filters')}</Button>
            </Box>
          </Paper>
        </Box>

        {/* Charts + Stats */}
        <Box sx={{ gridColumn: 'span 5', gridRowStart: 2 }}>
          <Grid container spacing={4}>
            {/* Stat Cards */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.06)', border: (t) => `1px solid ${t.palette.divider}` }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>{t('Active Students')}</Typography>
                    {loading ? (
                      <Skeleton variant="text" width={64} height={40} sx={{ mt: 0.5 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>{activeStudents}</Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.06)', border: (t) => `1px solid ${t.palette.divider}` }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>{t('Average Accuracy')}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {loading ? (
                        <Skeleton variant="circular" width={42} height={42} />
                      ) : (
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress variant="determinate" value={avgAccuracy} size={42} thickness={5} sx={{ color: accuracyColor(avgAccuracy) }} />
                          <Box sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Typography variant="subtitle2" component="div" color="text.primary">
                              {`${avgAccuracy}%`}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.06)', border: (t) => `1px solid ${t.palette.divider}` }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>{t('Total Levels Completed')}</Typography>
                    {loading ? (
                      <Skeleton variant="text" width={80} height={40} sx={{ mt: 0.5 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalLevelsCompleted}</Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.06)', border: (t) => `1px solid ${t.palette.divider}` }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>{t('Struggling Students')}</Typography>
                    {loading ? (
                      <Skeleton variant="text" width={80} height={40} sx={{ mt: 0.5 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>{strugglingCount}</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {/* Category Progress */}
            {!loading && hasData && (
              <>
                <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
                  <Paper sx={chartPaperSx}>
                    <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                      {t('Category Progress')}
                    </Typography>
                    <Box sx={chartBoxSx}>
                      {categoryData.length === 0 ? (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                          <Typography variant="body2">{t('No data to display')}</Typography>
                        </Box>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} barCategoryGap={40} barGap={12}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="category" tick={{ fontSize: 13, fontWeight: 500 }} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={60} />
                            <YAxis allowDecimals={false} domain={[0, 'dataMax + 2']} tick={{ fontSize: 13, fontWeight: 500 }} tickLine={false} axisLine={false} width={60} />
                            <RechartsTooltip formatter={(v, n) => [v, t(n)]} contentStyle={{ background: theme.palette.background.paper, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                            <Legend verticalAlign="bottom" height={40} iconSize={14} wrapperStyle={{ fontSize: 14, fontWeight: 500, paddingTop: '20px' }} />
                            <Bar dataKey="completed" name={t('Completed')} fill="#4caf50" radius={[6,6,0,0]} barSize={36} label={{ position: 'top', fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <Bar dataKey="total" name={t('Total')} fill="#e8eaf6" radius={[6,6,0,0]} barSize={36} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Weekly Activity */}
                <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
                  <Paper sx={chartPaperSx}>
                    <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                      {t('Levels Completed This Week')}
                    </Typography>
                    <Box sx={chartBoxSx}>
                      {weeklyData.length === 0 ? (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                          <Typography variant="body2">{t('No data to display')}</Typography>
                        </Box>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 13, fontWeight: 500 }} tickLine={false} axisLine={false} height={60} />
                            <YAxis allowDecimals={false} domain={[0, 'dataMax + 2']} tick={{ fontSize: 13, fontWeight: 500 }} tickLine={false} axisLine={false} width={60} />
                            <RechartsTooltip formatter={(v, n) => [v, t(n)]} labelFormatter={(l) => formatDay(l)} contentStyle={{ background: theme.palette.background.paper, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                            <Legend verticalAlign="bottom" height={40} iconSize={14} wrapperStyle={{ fontSize: 14, fontWeight: 500, paddingTop: '20px' }} />
                            <Area type="monotone" dataKey="levelsCompleted" name={t('Levels Completed')} stroke="#1e88e5" strokeWidth={2} fill="#90caf9" fillOpacity={0.35} dot={{ r: 3 }} />
                            <Area type="monotone" dataKey="studentsActive" name={t('Active Students')} stroke="#fb8c00" strokeWidth={2} fill="#ffcc80" fillOpacity={0.35} dot={{ r: 3 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        {/* Student Table */}
        <Box sx={{ gridColumn: 'span 5', gridRowStart: 3 }}>
          {hasData && (
            <Paper sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)', mt: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
                {t('Student FOUR PIC ONE WORD Progress')}
              </Typography>
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Student')}</TableCell>
                      <TableCell sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Class')}</TableCell>
                      <TableCell align="right" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Levels Completed')}</TableCell>
                      <TableCell align="right" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Accuracy')}</TableCell>
                      <TableCell align="right" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Hints Used')}</TableCell>
                      <TableCell align="right" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Hint Rate')}</TableCell>
                      <TableCell align="right" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Unfinished Categories')}</TableCell>
                      <TableCell align="right" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Levels Remaining')}</TableCell>
                      <TableCell align="right" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Time Spent')}</TableCell>
                      <TableCell sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Last Active')}</TableCell>
                      <TableCell align="center" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Struggling')}</TableCell>
                      <TableCell align="right" sx={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{t('Actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentRows
                      .filter(student => classFilter === 'all' || String(student.classId) === String(classFilter) || (student.className && student.className.toLowerCase() === String(classFilter).toLowerCase()))
                      .map((student) => (
                        <TableRow key={student.studentId} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 1, width: 32, height: 32 }}>{(student.studentName || '?').charAt(0)}</Avatar>
                              <Typography sx={{ fontWeight: 600 }}>{student.studentName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={student.className} size="small" color={colorForClass(student.className)} variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{student.levelsCompleted}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress variant="determinate" value={Number(student.accuracy) || 0} size={28} thickness={5} sx={{ color: accuracyColor(Number(student.accuracy) || 0) }} />
                                <Box sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <Typography variant="caption" component="div" color="text.primary">
                                    {`${Number(student.accuracy) || 0}%`}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{student.hintsUsed}</TableCell>
                          <TableCell align="right">{student.hintRate != null ? `${student.hintRate}%` : '0%'}</TableCell>
                          <TableCell align="right">{student.unfinishedCategories ?? 0}</TableCell>
                          <TableCell align="right">{student.levelsRemaining ?? 0}</TableCell>
                          <TableCell align="right">{formatMinutes(student.timeSpent)}</TableCell>
                          <TableCell>{student.lastActive ? new Date(student.lastActive).toLocaleDateString() : '-'}</TableCell>
                          <TableCell align="center">
                            <MuiTooltip title={(student.strugglingReasons || []).map(r => {
                              if (r === 'low_accuracy') return t('Low accuracy');
                              if (r === 'high_hint_usage') return t('High hint usage');
                              if (r === 'inactive_recently') return t('Inactive recently');
                              return r;
                            }).join(', ') || t('No issues detected')}>
                              <Chip
                                label={student.struggling ? t('At Risk') : t('OK')}
                                size="small"
                                color={student.struggling ? 'error' : 'success'}
                                variant={student.struggling ? 'filled' : 'outlined'}
                              />
                            </MuiTooltip>
                          </TableCell>
                          <TableCell align="right">
                            <MuiTooltip title={t('View Details')}>
                              <IconButton size="small" onClick={() => {
                                const path = student.classId
                                  ? `/teacher/classes/${student.classId}/students/${student.studentId}/fpow-progress`
                                  : `/teacher/student/${student.studentId}`;
                                navigate(path);
                              }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </MuiTooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {!loading && !fpowData && (
            <EmptyState
              icon={<InsightsIcon sx={{ fontSize: 56 }} />}
              title={t('No FOUR PIC ONE WORD analytics yet')}
              description={t('When students play Four Pics One Word, detailed analytics will appear here.')}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
}


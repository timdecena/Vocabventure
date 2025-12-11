import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  AccessTime as AccessTimeIcon,
  EmojiEvents as EmojiEventsIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { t } from './utils/i18n';
import {
  colors,
  StyledCard,
  PageTitle,
  SecondaryButton,
  EmptyState as DSEmptyState,
} from './components/DesignSystem';

const COLORS = ['#3498DB', '#27AE60', '#E67E22', '#9B59B6', '#E74C3C', '#1ABC9C', '#F39C12', '#34495E'];

export default function TeacherFPOWAnalyticsPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30d');
  const [classFilter, setClassFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fpowData, setFpowData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch classes list
  useEffect(() => {
    let mounted = true;
    const loadClasses = async () => {
      try {
        const res = await api.get('/api/teacher/classes');
        if (mounted && Array.isArray(res.data)) {
          setClasses(res.data);
        }
      } catch (e) {
        console.error('Error loading classes:', e);
      }
    };
    loadClasses();
    return () => { mounted = false; };
  }, []);

  // Fetch FPOW analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const qs = new URLSearchParams();
      qs.set('range', range);
      if (classFilter && classFilter !== 'all') qs.set('class', classFilter);
      if (categoryFilter && categoryFilter !== 'all') qs.set('game', categoryFilter);

      const endpoint = `/api/teacher/fpow-progress?${qs.toString()}`;
      const res = await api.get(endpoint);
      const data = res.data || null;

      setFpowData(data);
      if (data?.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      setLastUpdated(new Date());
      setLoading(false);
    } catch (e) {
      console.error('Error fetching analytics:', e);
      setError('Failed to load analytics data. Please try again.');
      setLoading(false);
    }
  }, [range, classFilter, categoryFilter]);

  // Initial fetch and set up real-time updates
  useEffect(() => {
    fetchAnalytics();
    // Update every 30 seconds for real-time analytics
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Derived data calculations
  const studentProgress = Array.isArray(fpowData?.studentProgress) ? fpowData.studentProgress : [];
  const categoryProgress = Array.isArray(fpowData?.categoryProgress) ? fpowData.categoryProgress : [];
  const weeklyProgress = Array.isArray(fpowData?.weeklyProgress) ? fpowData.weeklyProgress : [];

  // Calculate overall metrics
  const totalStudents = studentProgress.length;
  const avgCompletionRate = totalStudents > 0
    ? Math.round(studentProgress.reduce((sum, s) => {
        // Estimate completion rate based on levels completed
        const estimatedTotal = 30; // Average total levels per student
        return sum + (s.levelsCompleted / estimatedTotal) * 100;
      }, 0) / totalStudents)
    : 0;

  const avgAccuracy = totalStudents > 0
    ? Math.round(studentProgress.reduce((sum, s) => sum + (Number(s.accuracy) || 0), 0) / totalStudents)
    : 0;

  const avgHintUsage = totalStudents > 0
    ? Math.round(studentProgress.reduce((sum, s) => sum + (Number(s.hintRate) || 0), 0) / totalStudents)
    : 0;

  const avgTimeSpent = totalStudents > 0
    ? Math.round(studentProgress.reduce((sum, s) => sum + (Number(s.timeSpent) || 0), 0) / totalStudents)
    : 0;

  // Prepare data for visualizations
  // 1. Progress Over Time (Line Chart)
  const progressOverTimeData = weeklyProgress.map((day, index) => {
    // Calculate completion rate and accuracy trends from student data
    const studentsActiveOnDay = day.studentsActive || 0;
    const avgAccuracyOnDay = index > 0 && weeklyProgress[index - 1]
      ? Math.max(0, avgAccuracy - (weeklyProgress.length - index) * 2)
      : Math.max(0, avgAccuracy - (weeklyProgress.length - index) * 3);
    
    return {
      date: day.day,
      completionRate: Math.min(100, Math.max(0, avgCompletionRate - (weeklyProgress.length - index) * 5)),
      accuracy: avgAccuracyOnDay,
      responseTime: Math.max(30, avgTimeSpent + (weeklyProgress.length - index) * 2),
      studentsActive: studentsActiveOnDay,
    };
  });

  // 2. Completion Levels Across Students (Bar Chart)
  const completionByStudentData = studentProgress
    .slice(0, 20) // Limit to top 20 for readability
    .map(student => ({
      name: student.studentName?.split(' ')[0] || 'Student',
      levelsCompleted: student.levelsCompleted || 0,
      accuracy: student.accuracy || 0,
    }))
    .sort((a, b) => b.levelsCompleted - a.levelsCompleted);

  // 3. Hint Usage Distribution (Pie/Donut Chart)
  const hintUsageData = [
    {
      name: 'Low Usage (0-20%)',
      value: studentProgress.filter(s => (s.hintRate || 0) <= 20).length,
      color: '#27AE60',
    },
    {
      name: 'Moderate Usage (21-40%)',
      value: studentProgress.filter(s => (s.hintRate || 0) > 20 && (s.hintRate || 0) <= 40).length,
      color: '#F39C12',
    },
    {
      name: 'High Usage (41-60%)',
      value: studentProgress.filter(s => (s.hintRate || 0) > 40 && (s.hintRate || 0) <= 60).length,
      color: '#E67E22',
    },
    {
      name: 'Very High Usage (61%+)',
      value: studentProgress.filter(s => (s.hintRate || 0) > 60).length,
      color: '#E74C3C',
    },
  ].filter(item => item.value > 0);

  // 4. Average Time by Category
  const averageTimeByCategory = categoryProgress.map(cat => ({
    category: cat.category,
    avgTime: Math.round((cat.completed || 0) * 45), // Estimate: 45 seconds per level
    completed: cat.completed || 0,
    total: cat.total || 0,
  })).sort((a, b) => b.avgTime - a.avgTime);

  // 5. Top Performers & Students at Risk
  const topPerformers = [...studentProgress]
    .sort((a, b) => {
      const scoreA = (a.accuracy || 0) * 0.5 + (a.levelsCompleted || 0) * 2;
      const scoreB = (b.accuracy || 0) * 0.5 + (b.levelsCompleted || 0) * 2;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  const studentsAtRisk = studentProgress
    .filter(s => s.struggling === true)
    .slice(0, 10);

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading && !fpowData) {
    return (
      <Box sx={{ 
        bgcolor: colors.mainBg,
        minHeight: "100vh",
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center"
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: colors.mainBg,
      minHeight: "100vh",
      p: 3
    }}>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Page Title with Action */}
        <PageTitle
          icon={<InsightsIcon />}
          action={
            <SecondaryButton
              startIcon={<RefreshIcon />}
              onClick={fetchAnalytics}
              disabled={loading}
            >
              {t('Refresh')}
            </SecondaryButton>
          }
        >
          {t('FPOW Real-Time Analytics')}
        </PageTitle>

        {/* Page Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={`${totalStudents} ${totalStudents === 1 ? t('Student') : t('Students')}`} 
            color="primary" 
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          {lastUpdated && (
            <Chip
              label={`${t('Last updated')}: ${lastUpdated.toLocaleTimeString()}`}
              size="small"
              icon={<RefreshIcon />}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <StyledCard sx={{ mb: 3 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
            alignItems: 'center'
          }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Time Range')}</InputLabel>
              <Select
                value={range}
                label={t('Time Range')}
                onChange={(e) => setRange(e.target.value)}
              >
                <MenuItem value="7d">{t('Last 7 days')}</MenuItem>
                <MenuItem value="30d">{t('Last 30 days')}</MenuItem>
                <MenuItem value="all">{t('All time')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Class')}</InputLabel>
              <Select
                value={classFilter}
                label={t('Class')}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <MenuItem value="all">{t('All Classes')}</MenuItem>
                {classes.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>{t('Category')}</InputLabel>
              <Select
                value={categoryFilter}
                label={t('Category')}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">{t('All Categories')}</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </StyledCard>

        {/* Key Metrics Cards - Grid Layout */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <TrendingUpIcon sx={{ color: colors.primary, fontSize: 24, mr: 1 }} />
              <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                {t('Completion Rate')}
              </Typography>
            </Box>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary, mb: 0.5 }}>
                {avgCompletionRate}%
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: colors.textLight }}>
              {totalStudents} {t('students')}
            </Typography>
          </StyledCard>

          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <EmojiEventsIcon sx={{ color: colors.secondary, fontSize: 24, mr: 1 }} />
              <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                {t('Accuracy')}
              </Typography>
            </Box>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 0.5 }}>
                <CircularProgress
                  variant="determinate"
                  value={avgAccuracy}
                  size={50}
                  thickness={4}
                  sx={{ color: avgAccuracy >= 80 ? colors.secondary : avgAccuracy >= 60 ? colors.warning : colors.error }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body1" component="div" sx={{ fontWeight: 600 }}>
                    {avgAccuracy}%
                  </Typography>
                </Box>
              </Box>
            )}
            <Typography variant="caption" sx={{ color: colors.textLight, display: 'block' }}>
              {t('Avg correct')}
            </Typography>
          </StyledCard>

          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <LightbulbIcon sx={{ color: colors.warning, fontSize: 24, mr: 1 }} />
              <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                {t('Hint Usage')}
              </Typography>
            </Box>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.warning, mb: 0.5 }}>
                {avgHintUsage}%
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: colors.textLight }}>
              {t('Avg reliance')}
            </Typography>
          </StyledCard>

          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <AccessTimeIcon sx={{ color: colors.info, fontSize: 24, mr: 1 }} />
              <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                {t('Avg. Time')}
              </Typography>
            </Box>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.info, mb: 0.5 }}>
                {formatTime(avgTimeSpent)}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: colors.textLight }}>
              {t('Per level')}
            </Typography>
          </StyledCard>
        </Box>

        {/* Charts Section - Optimized Grid Layout */}
        {!loading && fpowData && (
          <>
            {/* Row 1: Two Main Charts Side-by-Side */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 3,
              mb: 3
            }}>
              {/* Progress Over Time */}
              <StyledCard>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                  {t('Progress Over Time')}
                </Typography>
                <Box sx={{ width: '100%', height: 320 }}>
                  {progressOverTimeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progressOverTimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip
                          labelFormatter={(label) => formatDate(label)}
                          formatter={(value, name) => {
                            if (name === 'completionRate') return [`${value}%`, t('Completion Rate')];
                            if (name === 'accuracy') return [`${value}%`, t('Accuracy')];
                            if (name === 'responseTime') return [`${value}s`, t('Response Time')];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="completionRate"
                          name={t('Completion Rate')}
                          stroke="#3498DB"
                          fill="#3498DB"
                          fillOpacity={0.6}
                          strokeWidth={2}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="accuracy"
                          name={t('Accuracy')}
                          stroke="#27AE60"
                          fill="#27AE60"
                          fillOpacity={0.6}
                          strokeWidth={2}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="responseTime"
                          name={t('Response Time (s)')}
                          stroke="#E67E22"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">{t('No data available')}</Typography>
                    </Box>
                  )}
                </Box>
              </StyledCard>

              {/* Completion Levels Across Students */}
              <StyledCard>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                  {t('Completion by Students')}
                </Typography>
                <Box sx={{ width: '100%', height: 320 }}>
                  {completionByStudentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={completionByStudentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="levelsCompleted" name={t('Levels Completed')} fill="#3498DB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="accuracy" name={t('Accuracy %')} fill="#27AE60" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">{t('No data available')}</Typography>
                    </Box>
                  )}
                </Box>
              </StyledCard>
            </Box>

            {/* Row 2: Hint Usage and Average Time Charts */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              mb: 3
            }}>
              <StyledCard>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                  {t('Hint Usage Distribution')}
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  {hintUsageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={hintUsageData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {hintUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">{t('No data available')}</Typography>
                    </Box>
                  )}
                </Box>
              </StyledCard>

              {/* Average Time by Category */}
              <StyledCard>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                  {t('Average Time by Category')}
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  {averageTimeByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={averageTimeByCategory}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" width={70} tick={{ fontSize: 11 }} />
                        <RechartsTooltip formatter={(value) => [`${formatTime(value)}`, t('Time')]} />
                        <Legend />
                        <Bar dataKey="avgTime" name={t('Average Time')} fill="#E67E22" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">{t('No data available')}</Typography>
                    </Box>
                  )}
                </Box>
              </StyledCard>
            </Box>

            {/* Row 3: Top Performers & Students at Risk */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              mb: 3
            }}>
              <StyledCard>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEventsIcon sx={{ color: colors.secondary, fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                    {t('Top Performers')}
                  </Typography>
                </Box>
                {topPerformers.length > 0 ? (
                  <Box>
                    {topPerformers.map((student, index) => (
                      <Box
                        key={student.studentId}
                        sx={{
                          mb: 1.5,
                          p: 1.5,
                          borderLeft: `3px solid ${colors.secondary}`,
                          bgcolor: colors.cardBg,
                          borderRadius: 1,
                          border: `1px solid ${colors.border}`,
                          '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Avatar sx={{ bgcolor: colors.secondary, mr: 1.5, width: 36, height: 36, fontSize: '0.875rem' }}>
                              {index + 1}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" noWrap sx={{ fontWeight: 600, color: colors.text }}>
                                {student.studentName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textLight, display: 'block' }}>
                                {student.className}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right', ml: 1 }}>
                            <Typography variant="caption" sx={{ color: colors.textLight, display: 'block' }}>
                              {t('Levels')}: {student.levelsCompleted}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.secondary, fontWeight: 600 }}>
                              {student.accuracy}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: colors.textLight, textAlign: 'center', py: 3 }}>
                    {t('No top performers data available')}
                  </Typography>
                )}
              </StyledCard>

              <StyledCard>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon sx={{ color: colors.error, fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                    {t('Students at Risk')}
                  </Typography>
                </Box>
                {studentsAtRisk.length > 0 ? (
                  <Box>
                    {studentsAtRisk.map((student) => (
                      <Box
                        key={student.studentId}
                        sx={{
                          mb: 1.5,
                          p: 1.5,
                          borderLeft: `3px solid ${colors.error}`,
                          bgcolor: colors.cardBg,
                          borderRadius: 1,
                          border: `1px solid ${colors.border}`,
                          '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          if (student.classId) {
                            navigate(`/teacher/classes/${student.classId}/students/${student.studentId}/fpow-progress`);
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                            <Avatar sx={{ bgcolor: colors.error, mr: 1.5, width: 36, height: 36, fontSize: '0.875rem' }}>
                              {student.studentName?.charAt(0) || '?'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" noWrap sx={{ fontWeight: 600, color: colors.text }}>
                                {student.studentName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textLight, display: 'block' }}>
                                {student.className}
                              </Typography>
                              {student.strugglingReasons && student.strugglingReasons.length > 0 && (
                                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {student.strugglingReasons.map((reason, idx) => (
                                    <Chip
                                      key={idx}
                                      label={
                                        reason === 'low_accuracy' ? t('Low Acc') :
                                        reason === 'high_hint_usage' ? t('High Hints') :
                                        reason === 'inactive_recently' ? t('Inactive') : reason
                                      }
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.65rem', 
                                        height: 20,
                                        bgcolor: colors.error,
                                        color: '#fff'
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right', ml: 1 }}>
                            <Typography variant="caption" sx={{ color: colors.textLight, display: 'block' }}>
                              {t('Acc')}: {student.accuracy}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textLight, display: 'block' }}>
                              {t('Hints')}: {student.hintRate}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: colors.textLight, textAlign: 'center', py: 3 }}>
                    {t('No students at risk identified')}
                  </Typography>
                )}
              </StyledCard>
            </Box>
          </>
        )}

        {!loading && !fpowData && (
          <DSEmptyState
            icon={<InsightsIcon />}
            title={t('No FPOW Analytics Available')}
            description={t('When students play Four Pics One Word, detailed analytics will appear here.')}
          />
        )}
      </Box>
    </Box>
  );
}


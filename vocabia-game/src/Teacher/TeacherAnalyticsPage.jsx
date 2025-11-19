import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  IconButton,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import WarningIcon from '@mui/icons-material/Warning';
import SortIcon from '@mui/icons-material/Sort';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../api/api';
import { colors, StyledCard, PageTitle } from './components/DesignSystem';
import { t } from './utils/i18n';

export default function TeacherAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [classFilter, setClassFilter] = useState('all');
  const [fpowData, setFpowData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [sortBy, setSortBy] = useState('score'); // 'score' or 'progress'
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  // Fetch analytics
  useEffect(() => {
    let mounted = true;
    const fetchFpow = async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set('range', range);
        if (classFilter && classFilter !== 'all') qs.set('class', classFilter);

        const endpoint = `/api/teacher/fpow-progress?${qs.toString()}`;
        const res = await api.get(endpoint);
        const data = res.data || null;
        if (mounted) {
          setFpowData(data);
        }
      } catch (e) {
        if (mounted) setFpowData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFpow();
    return () => { mounted = false; };
  }, [range, classFilter]);

  // Load classes list
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

  // Derived data
  const hasData = !!fpowData;
  const studentRows = Array.isArray(fpowData?.studentProgress) ? fpowData.studentProgress : [];
  const categoryData = Array.isArray(fpowData?.categoryProgress) ? fpowData.categoryProgress : [];

  // Calculate summary metrics
  const totalStudents = studentRows.length;
  const avgScore = studentRows.length
    ? Math.round(studentRows.reduce((sum, r) => sum + (Number(r.accuracy) || 0), 0) / studentRows.length)
    : 0;
  const completionRate = totalStudents > 0 
    ? Math.round((studentRows.filter(r => (Number(r.levelsCompleted) || 0) > 0).length / totalStudents) * 100)
    : 0;

  // Get last activity
  const getLastActivity = () => {
    if (studentRows.length === 0) return 'No activity';
    const dates = studentRows
      .map(r => r.lastActive ? new Date(r.lastActive) : null)
      .filter(d => d !== null && !isNaN(d.getTime()));
    if (dates.length === 0) return 'No activity';
    const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
    const today = new Date();
    const diffTime = today - mostRecent;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return mostRecent.toLocaleDateString();
  };

  // Get actionable insights
  const getInsights = () => {
    const insights = {
      topPerformers: [],
      needsAttention: [],
    };

    // Top performers (improved or high scores)
    const topStudents = [...studentRows]
      .filter(s => (Number(s.accuracy) || 0) >= 85)
      .sort((a, b) => (Number(b.accuracy) || 0) - (Number(a.accuracy) || 0))
      .slice(0, 3)
      .map(s => s.studentName);

    // Needs attention (struggling or inactive)
    const strugglingStudents = studentRows
      .filter(s => s.struggling || !s.lastActive || new Date(s.lastActive) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
      .slice(0, 3)
      .map(s => s.studentName);

    insights.topPerformers = topStudents;
    insights.needsAttention = strugglingStudents;

    return insights;
  };

  // Prepare chart data - Class Performance if multiple classes, otherwise Category Performance
  const getChartData = () => {
    if (classes.length > 1 && classFilter === 'all') {
      // Show class performance
      return classes.map(cls => {
        const classStudents = studentRows.filter(s => String(s.classId) === String(cls.id));
        const classAvgScore = classStudents.length > 0
          ? Math.round(classStudents.reduce((sum, s) => sum + (Number(s.accuracy) || 0), 0) / classStudents.length)
          : 0;
        return {
          name: cls.name,
          score: classAvgScore,
        };
      });
    } else {
      // Show category performance
      return categoryData.map(cat => ({
        name: cat.category || 'Unknown',
        score: Math.round((Number(cat.completed) || 0) / Math.max(Number(cat.total) || 1, 1) * 100),
      }));
    }
  };

  const chartData = getChartData();

  // Sort students
  const sortedStudents = [...studentRows]
    .filter(student => 
      classFilter === 'all' || 
      String(student.classId) === String(classFilter) ||
      (student.className && student.className.toLowerCase() === String(classFilter).toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (Number(b.accuracy) || 0) - (Number(a.accuracy) || 0);
      } else {
        return (Number(b.levelsCompleted) || 0) - (Number(a.levelsCompleted) || 0);
      }
    });

  // Format last activity for student
  const formatStudentLastActive = (lastActive) => {
    if (!lastActive) return 'Never';
    const date = new Date(lastActive);
    if (isNaN(date.getTime())) return 'Never';
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Fixed card colors
  const cardColors = [
    { bg: '#E3F2FD', text: '#1976D2', icon: '#1976D2' },
    { bg: '#E8F5E9', text: '#388E3C', icon: '#388E3C' },
    { bg: '#FFF3E0', text: '#F57C00', icon: '#F57C00' },
    { bg: '#F3E5F5', text: '#7B1FA2', icon: '#7B1FA2' },
  ];

  const chartColors = ['#3498DB', '#27AE60', '#E67E22', '#9B59B6', '#1ABC9C'];

  const getScoreColor = (score) => {
    if (score >= 90) return colors.success;
    if (score >= 70) return colors.warning;
    return colors.error;
  };

  const insights = getInsights();

  // Fixed dimensions
  const METRIC_CARD_WIDTH = 220;
  const METRIC_CARD_HEIGHT = 140;
  const STUDENT_CARD_HEIGHT = 120;

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 6, pt: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
            <PageTitle icon={<InsightsIcon sx={{ fontSize: 32 }} />}>
              Analytics
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
              Quick overview of student progress and performance
              </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{
              borderColor: colors.border,
              color: colors.text,
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              '&:hover': {
                borderColor: colors.primary,
                bgcolor: `${colors.primary}10`,
              },
            }}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={() => { setExportMenuAnchor(null); /* TODO: Implement CSV export */ }}>
              Export as CSV
            </MenuItem>
            <MenuItem onClick={() => { setExportMenuAnchor(null); /* TODO: Implement PDF export */ }}>
              Export as PDF
            </MenuItem>
          </Menu>
        </Box>

        {/* Quick Filters */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant={range === '7d' ? 'contained' : 'outlined'}
            onClick={() => setRange('7d')}
            sx={{
              ...(range === '7d' ? {
                bgcolor: colors.primary,
                color: '#FFFFFF',
                '&:hover': { bgcolor: colors.primaryDark },
              } : {
                borderColor: colors.border,
                color: colors.text,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: `${colors.primary}10`,
                },
              }),
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '12px',
            }}
          >
            Last 7 Days
          </Button>
          <Button
            variant={range === '30d' ? 'contained' : 'outlined'}
            onClick={() => setRange('30d')}
            sx={{
              ...(range === '30d' ? {
                bgcolor: colors.primary,
                color: '#FFFFFF',
                '&:hover': { bgcolor: colors.primaryDark },
              } : {
                borderColor: colors.border,
                color: colors.text,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: `${colors.primary}10`,
                },
              }),
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '12px',
            }}
          >
            Last Month
          </Button>
          <Button
            variant={range === 'all' ? 'contained' : 'outlined'}
            onClick={() => setRange('all')}
            sx={{
              ...(range === 'all' ? {
                bgcolor: colors.primary,
                color: '#FFFFFF',
                '&:hover': { bgcolor: colors.primaryDark },
              } : {
                borderColor: colors.border,
                color: colors.text,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: `${colors.primary}10`,
                },
              }),
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '12px',
            }}
          >
            All Time
          </Button>

          {classes.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 200, ml: 'auto' }}>
              <InputLabel>Class</InputLabel>
              <Select
                label="Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '12px',
                }}
              >
                <MenuItem value="all">All Classes</MenuItem>
              {classes.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          )}
        </Box>

        {/* Fixed-Size Metric Cards */}
        <Box sx={{ 
          mb: 5,
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', md: 'flex-start' },
        }}>
          {/* Total Students */}
          <Paper
            sx={{
              width: METRIC_CARD_WIDTH,
              height: METRIC_CARD_HEIGHT,
              p: 3,
              borderRadius: '16px',
              bgcolor: cardColors[0].bg,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={60} height={48} />
            ) : (
              <>
                <PeopleIcon sx={{ fontSize: 36, color: cardColors[0].icon, mb: 1.5 }} />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: cardColors[0].text,
                    mb: 0.5,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                  }}
                >
                  {totalStudents}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500, fontSize: '0.875rem' }}>
                  Total Students
              </Typography>
              </>
            )}
          </Paper>

          {/* Average Score */}
          <Paper
            sx={{
              width: METRIC_CARD_WIDTH,
              height: METRIC_CARD_HEIGHT,
              p: 3,
              borderRadius: '16px',
              bgcolor: cardColors[1].bg,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={60} height={48} />
            ) : (
              <>
                <TrendingUpIcon sx={{ fontSize: 36, color: cardColors[1].icon, mb: 1.5 }} />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: cardColors[1].text,
                    mb: 0.5,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                  }}
                >
                  {avgScore}%
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500, fontSize: '0.875rem' }}>
                  Average Score
                    </Typography>
              </>
            )}
          </Paper>

          {/* Completion Rate */}
          <Paper
            sx={{
              width: METRIC_CARD_WIDTH,
              height: METRIC_CARD_HEIGHT,
              p: 3,
              borderRadius: '16px',
              bgcolor: cardColors[2].bg,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={60} height={48} />
            ) : (
              <>
                <CheckCircleIcon sx={{ fontSize: 36, color: cardColors[2].icon, mb: 1.5 }} />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: cardColors[2].text,
                    mb: 0.5,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                  }}
                >
                  {completionRate}%
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500, fontSize: '0.875rem' }}>
                  Completion Rate
              </Typography>
              </>
            )}
          </Paper>

          {/* Last Activity */}
          <Paper
            sx={{
              width: METRIC_CARD_WIDTH,
              height: METRIC_CARD_HEIGHT,
              p: 3,
              borderRadius: '16px',
              bgcolor: cardColors[3].bg,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={60} height={48} />
            ) : (
              <>
                <AccessTimeIcon sx={{ fontSize: 36, color: cardColors[3].icon, mb: 1.5 }} />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: cardColors[3].text,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    lineHeight: 1,
                  }}
                >
                  {getLastActivity()}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500, fontSize: '0.875rem' }}>
                  Last Activity
              </Typography>
              </>
            )}
          </Paper>
        </Box>

        {/* Actionable Insights */}
        {(insights.topPerformers.length > 0 || insights.needsAttention.length > 0) && (
          <Box sx={{ mb: 5, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {insights.topPerformers.length > 0 && (
              <StyledCard sx={{ flex: 1, minWidth: 280, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ArrowUpwardIcon sx={{ color: colors.success, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                    Top Performers
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: colors.textLight }}>
                  {insights.topPerformers.length} student{insights.topPerformers.length > 1 ? 's' : ''} with high scores: {insights.topPerformers.join(', ')}
                </Typography>
              </StyledCard>
            )}
            {insights.needsAttention.length > 0 && (
              <StyledCard sx={{ flex: 1, minWidth: 280, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon sx={{ color: colors.warning, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                    Needs Attention
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: colors.textLight }}>
                  {insights.needsAttention.length} student{insights.needsAttention.length > 1 ? 's' : ''} need support: {insights.needsAttention.join(', ')}
                </Typography>
              </StyledCard>
            )}
          </Box>
        )}

        {/* Main Chart */}
        {!loading && hasData && chartData.length > 0 && (
          <StyledCard sx={{ mb: 5, p: 4 }}>
        <Typography
          variant="h5"
              sx={{
                fontWeight: 600,
                mb: 4,
                color: colors.text,
                textAlign: 'center',
              }}
            >
              {classes.length > 1 && classFilter === 'all' ? 'Class Performance' : 'Category Performance'}
            </Typography>
            <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 14, fill: colors.textLight }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                  <YAxis
                    tick={{ fontSize: 14, fill: colors.textLight }}
                    domain={[0, 100]}
                    label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', fill: colors.text }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${value}%`, 'Score']}
                    labelStyle={{ color: colors.text, fontWeight: 600 }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
              </BarChart>
            </ResponsiveContainer>
            </Box>
          </StyledCard>
        )}

        {/* Student Progress List */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
              Student Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                sx={{ color: colors.text }}
              >
                <SortIcon />
              </IconButton>
              <Menu
                anchorEl={sortMenuAnchor}
                open={Boolean(sortMenuAnchor)}
                onClose={() => setSortMenuAnchor(null)}
              >
                <MenuItem onClick={() => { setSortBy('score'); setSortMenuAnchor(null); }}>
                  Sort by Score
                </MenuItem>
                <MenuItem onClick={() => { setSortBy('progress'); setSortMenuAnchor(null); }}>
                  Sort by Progress
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {loading ? (
            <Box>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height={STUDENT_CARD_HEIGHT} sx={{ mb: 2, borderRadius: 2 }} />
              ))}
            </Box>
          ) : sortedStudents.length === 0 ? (
            <StyledCard sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: colors.textLight }}>
                No student data available yet
              </Typography>
            </StyledCard>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sortedStudents.map((student) => {
                const score = Number(student.accuracy) || 0;
                const progress = Math.min(score, 100);
                
                return (
                  <StyledCard
                    key={student.studentId}
                    sx={{
                      p: 3,
                      height: STUDENT_CARD_HEIGHT,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => {
                      if (student.classId) {
                        navigate(`/teacher/classes/${student.classId}/students/${student.studentId}/fpow-progress`);
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: colors.primary,
                          fontSize: '1.3rem',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {(student.studentName || '?').charAt(0).toUpperCase()}
                            </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                            {student.studentName}
                          </Typography>
                          <Chip 
                            label={`${score}%`}
                            sx={{
                              bgcolor: getScoreColor(score) + '20',
                              color: getScoreColor(score),
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              height: 32,
                            }}
                          />
                        </Box>
                        <Box sx={{ mb: 1.5 }}>
                          <LinearProgress
                                variant="determinate" 
                            value={progress}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: colors.border,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getScoreColor(score),
                                borderRadius: 5,
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: colors.textLight }}>
                            {student.levelsCompleted || 0} levels completed
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textLight }}>
                            {formatStudentLastActive(student.lastActive)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                  </StyledCard>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

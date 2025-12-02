import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Snackbar,
  Grid,
  alpha,
  Stack
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as ClassIcon,
  CheckCircle as CorrectIcon,
  TrendingUp as ProgressIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Insights as InsightsIcon,
  FilterList as FilterIcon
} from "@mui/icons-material";
import api from "../api/api";
import PageHeader from "./components/PageHeader";
import EmptyState from "./components/EmptyState";
import { t } from "./utils/i18n";

export default function TeacherClassStudentsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState({ name: "", joinCode: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classRes, studentsRes] = await Promise.all([
          api.get(`/api/teacher/classes/${id}`),
          api.get(`/api/teacher/classes/${id}/students`)
        ]);
        
        setClassInfo({
          name: classRes.data.name,
          joinCode: classRes.data.joinCode
        });
        setStudents(studentsRes.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load class data");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = !q
      ? students
      : students.filter((s) =>
          `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q)
        );
    const sorted = [...base].sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
      if (sortBy === 'name_asc') return nameA.localeCompare(nameB);
      if (sortBy === 'name_desc') return nameB.localeCompare(nameA);
      if (sortBy === 'correct_desc') return (b.correctAnswers || 0) - (a.correctAnswers || 0);
      if (sortBy === 'progress_desc') return (b.progressPoints || 0) - (a.progressPoints || 0);
      return 0;
    });
    return sorted;
  }, [students, search, sortBy]);

  const avgCorrect = useMemo(() => {
    if (!students.length) return 0;
    const sum = students.reduce((acc, s) => acc + (s.correctAnswers || 0), 0);
    return Math.round((sum / students.length) * 10) / 10;
  }, [students]);

  const avgProgress = useMemo(() => {
    if (!students.length) return 0;
    const sum = students.reduce((acc, s) => acc + (s.progressPoints || 0), 0);
    return Math.round((sum / students.length) * 10) / 10;
  }, [students]);

  const copyJoinCode = () => {
    if (!classInfo.joinCode) return;
    navigator.clipboard.writeText(classInfo.joinCode);
    setSnackbar({ 
      open: true, 
      message: t('Class code copied to clipboard'), 
      severity: 'success' 
    });
  };

  const closeSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  const exportToCSV = () => {
    const rows = filteredStudents.map((s) => ({
      firstName: s.firstName || '',
      lastName: s.lastName || '',
      email: s.email || '',
      correctAnswers: s.correctAnswers || 0,
      progressPoints: s.progressPoints || 0,
    }));
    const headers = ['First Name','Last Name','Email','Correct Answers','Progress Points'];
    const csv = [headers.join(','), ...rows.map(r => [r.firstName, r.lastName, r.email, r.correctAnswers, r.progressPoints].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${classInfo.name || 'class'}_students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'CSV exported successfully',
      severity: 'success'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card sx={{ 
      borderRadius: 2,
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh"
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate("/teacher/classes")}
              sx={{ borderRadius: 2 }}
            >
              {t('Back to Classes')}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Header */}
          <PageHeader
            backTo={`/teacher/classes/${id}`}
            backLabel={t('Back to Class')}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ClassIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  {classInfo.name} {t('Students')}
                </Typography>
              </Box>
            }
            subtitle={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  size="small"
                  label={`${t('Class Code')}: ${classInfo.joinCode}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                <Typography variant="body2" color="text.secondary">
                  • {t('Custom WordList Progress')}
                </Typography>
              </Stack>
            }
            actions={
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${students.length} ${students.length === 1 ? t('Student') : t('Students')}`}
                  color="primary"
                  variant="outlined"
                  sx={{ height: 36, fontWeight: 600 }}
                />
                <Tooltip title={t('Copy class code')}>
                  <IconButton 
                    onClick={copyJoinCode}
                    sx={{ 
                      border: '1px solid', 
                      borderColor: 'divider',
                      borderRadius: 1.5
                    }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />} 
                  onClick={exportToCSV}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                >
                  {t('Export CSV')}
                </Button>
              </Stack>
            }
          />

          {/* Stats Section */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <StatCard
                title={t('Total Students')}
                value={students.length}
                icon={PersonIcon}
                color="#4f46e5"
                subtitle={t('Enrolled in class')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title={t('Avg. Correct Answers')}
                value={avgCorrect}
                icon={CorrectIcon}
                color="#10b981"
                subtitle={t('Average per student')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title={t('Avg. Progress Points')}
                value={avgProgress}
                icon={ProgressIcon}
                color="#f59e0b"
                subtitle={t('Learning progress')}
              />
            </Grid>
          </Grid>

          {/* Toolbar */}
          <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder={t('Search students by name or email...')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 1.5 }
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>{t('Sort By')}</InputLabel>
                  <Select 
                    label={t('Sort By')} 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterIcon fontSize="small" />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="name_asc">{t('Name (A–Z)')}</MenuItem>
                    <MenuItem value="name_desc">{t('Name (Z–A)')}</MenuItem>
                    <MenuItem value="correct_desc">{t('Correct Answers (High→Low)')}</MenuItem>
                    <MenuItem value="progress_desc">{t('Progress Points (High→Low)')}</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          {/* Students Table */}
          {filteredStudents.length === 0 ? (
            <Card sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider',
              p: 4 
            }}>
              <EmptyState
                icon={<PersonIcon sx={{ fontSize: 56, color: 'text.secondary' }} />}
                title={search ? t('No students match your search') : t('No students enrolled in this class')}
                description={search ? t('Try a different term or clear the search') : t('Share the class code to invite students')}
                action={search ? (
                  <Button 
                    variant="outlined" 
                    onClick={() => setSearch("")}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('Clear Search')}
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={copyJoinCode}
                    startIcon={<CopyIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('Copy Class Code')}
                  </Button>
                )}
              />
            </Card>
          ) : (
            <Card sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, py: 2.5 }}>
                        {t('Student')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2.5 }}>
                        {t('Email')}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                          <CorrectIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          <span>{t('Correct')}</span>
                        </Stack>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                          <ProgressIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                          <span>{t('Progress')}</span>
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2.5 }}>
                        {t('Actions')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id} 
                        hover
                        sx={{ 
                          '&:last-child td': { borderBottom: 0 },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                fontWeight: 600
                              }}
                            >
                              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {student.firstName} {student.lastName}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Typography variant="body2" color="text.primary">
                              {student.email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2.5 }}>
                          <Chip
                            label={student.correctAnswers || 0}
                            color="success"
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              minWidth: 60 
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2.5 }}>
                          <Chip
                            label={student.progressPoints || 0}
                            color="warning"
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              minWidth: 60 
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<InsightsIcon />}
                            onClick={() => navigate(`/teacher/classes/${id}/students/${student.id}/fpow-progress`)}
                            sx={{
                              borderRadius: 1.5,
                              textTransform: 'none',
                              fontWeight: 500
                            }}
                          >
                            {t('View 4 Pics 1 Word Progress')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Box>
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={closeSnackbar} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
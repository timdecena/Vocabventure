import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
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
  useTheme,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Snackbar
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as ClassIcon,
  CheckCircle as CorrectIcon,
  Star as ProgressIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon
} from "@mui/icons-material";
import api from "../api/api";
import PageHeader from "./components/PageHeader";
import EmptyState from "./components/EmptyState";
import { t } from "./utils/i18n";

export default function TeacherClassStudentsPage() {
  const theme = useTheme();
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
    setSnackbar({ open: true, message: t('Join code copied to clipboard'), severity: 'success' });
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
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: "#f9fafc"
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: "#f9fafc" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate("/teacher/classes")}
        >
          {t('Back to Classes')}
        </Button>
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ClassIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              {classInfo.name} {t('Students')}
            </Box>
          }
          subtitle={`${t('Class Code')}: ${classInfo.joinCode}`}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${students.length} ${students.length === 1 ? t('Student') : t('Students')}`}
                color="primary"
                variant="outlined"
                sx={{ height: 36 }}
              />
              <Tooltip title={t('Copy join code')}>
                <IconButton onClick={copyJoinCode}>
                  <CopyIcon />
                </IconButton>
              </Tooltip>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToCSV}>
                {t('Export CSV')}
              </Button>
            </Box>
          }
        />

        {/* Snapshot Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="primary" />
              <Typography variant="subtitle2" color="text.secondary">{t('Total Students')}</Typography>
            </Box>
            <Typography variant="h5" sx={{ mt: 1 }}>{students.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CorrectIcon color="success" />
              <Typography variant="subtitle2" color="text.secondary">{t('Avg. Correct')}</Typography>
            </Box>
            <Typography variant="h5" sx={{ mt: 1 }}>{avgCorrect}</Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <ProgressIcon color="warning" />
              <Typography variant="subtitle2" color="text.secondary">{t('Avg. Progress')}</Typography>
            </Box>
            <Typography variant="h5" sx={{ mt: 1 }}>{avgProgress}</Typography>
          </Paper>
        </Box>

        {/* Toolbar: Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            placeholder={t('Search students by name or email')}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t('Sort By')}</InputLabel>
            <Select label={t('Sort By')} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="name_asc">{t('Name (A–Z)')}</MenuItem>
              <MenuItem value="name_desc">{t('Name (Z–A)')}</MenuItem>
              <MenuItem value="correct_desc">{t('Correct (High→Low)')}</MenuItem>
              <MenuItem value="progress_desc">{t('Progress (High→Low)')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Students */}
        {filteredStudents.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <EmptyState
              icon={<PersonIcon sx={{ fontSize: 56 }} />}
              title={search ? t('No students match your search') : t('No students enrolled in this class')}
              description={search ? t('Try a different term or clear the search') : t('Share the class join code to invite students')}
              action={search ? (
                <Button variant="outlined" onClick={() => setSearch("")}>{t('Clear Search')}</Button>
              ) : (
                <Button variant="contained" onClick={copyJoinCode}>{t('Copy Join Code')}</Button>
              )}
            />
          </Paper>
        ) : (
        <Paper elevation={0} sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden"
        }}>
          <TableContainer sx={{ maxHeight: 560 }}>
            <Table stickyHeader size="small">
              <TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('Student')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('Email')}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CorrectIcon sx={{ mr: 1, color: "success.main" }} />
                      {t('Correct')}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ProgressIcon sx={{ mr: 1, color: "warning.main" }} />
                      {t('Progress')}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              mr: 2,
                              bgcolor: "primary.light",
                              color: "primary.main"
                            }}
                          >
                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                          </Avatar>
                          <Typography>
                            {student.firstName} {student.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                          {student.email}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={student.correctAnswers || 0}
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={student.progressPoints || 0}
                          color="warning"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/teacher/classes/${id}/students/${student.id}/fpow-progress`)}
                        >
                          {t('View Progress')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/teacher/classes/${id}/students/add`)}
            sx={{ ml: 2 }}
          >
            {t('Add Students')}
          </Button>
        </Box>
      </Box>
    </Box>
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
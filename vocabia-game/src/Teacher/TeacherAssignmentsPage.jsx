import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClassIcon from '@mui/icons-material/Class';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PageHeader from './components/PageHeader';
import EmptyState from './components/EmptyState';
import api from '../api/api';
import { t } from './utils/i18n';

export default function TeacherAssignmentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // CRUD states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'spelling',
    description: '',
    classId: '',
    dueDate: '',
    instructions: '',
    maxAttempts: 3
  });

  useEffect(() => {
    let mounted = true;

    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try multiple endpoints for real data with better error handling
        const endpoints = [
          '/api/teacher/assignments', 
          '/api/assignments', 
          '/teacher/assignments',
          '/api/teacher/classes' // Fallback to generate from classes
        ];
        let data = null;

        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint);
            if (res.data && mounted) {
              if (endpoint.includes('/classes')) {
                // Transform class data to assignments (we'll add this function)
                data = generateMockAssignments(); // For now, use mock data
              } else if (Array.isArray(res.data)) {
                data = res.data;
              }
              break;
            }
          } catch (endpointError) {
            console.warn(`Assignments endpoint ${endpoint} failed:`, endpointError?.response?.status);
            continue;
          }
        }

        if (!data && mounted) {
          // Generate mock data if no real data available
          data = generateMockAssignments();
        }

        if (mounted) {
          setAssignments(data);
          // Also fetch classes for the form
          await fetchClasses();
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load assignments:', err);
          setError('Failed to load assignments');
          setAssignments(generateMockAssignments());
          setClasses(generateMockClasses());
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const fetchClasses = async () => {
      try {
        const res = await api.get('/api/teacher/classes');
        if (res.data && Array.isArray(res.data)) {
          setClasses(res.data);
        }
      } catch (error) {
        console.warn('Failed to fetch classes:', error);
        setClasses(generateMockClasses());
      }
    };

    fetchAssignments();
    
    // Set up real-time updates every 60 seconds
    const interval = setInterval(fetchAssignments, 60000);
    
    return () => { 
      mounted = false; 
      clearInterval(interval);
    };
  }, []);

  const handleCreate = async () => {
    try {
      const newAssignment = {
        ...formData,
        id: Date.now(), // Temporary ID
        status: 'draft',
        createdAt: new Date().toISOString()
      };

      // Try to create via API
      try {
        const res = await api.post('/api/teacher/assignments', newAssignment);
        if (res.data) {
          setAssignments(prev => [res.data, ...prev]);
        } else {
          throw new Error('No data returned');
        }
      } catch (apiError) {
        console.warn('API create failed, using local update:', apiError);
        setAssignments(prev => [newAssignment, ...prev]);
      }

      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      setError('Failed to create assignment');
    }
  };

  const handleEdit = async () => {
    try {
      const updatedAssignment = {
        ...selectedAssignment,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      // Try to update via API
      try {
        const res = await api.put(`/api/teacher/assignments/${selectedAssignment.id}`, updatedAssignment);
        if (res.data) {
          setAssignments(prev => prev.map(a => a.id === selectedAssignment.id ? res.data : a));
        } else {
          throw new Error('No data returned');
        }
      } catch (apiError) {
        console.warn('API update failed, using local update:', apiError);
        setAssignments(prev => prev.map(a => a.id === selectedAssignment.id ? updatedAssignment : a));
      }

      setEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update assignment:', error);
      setError('Failed to update assignment');
    }
  };

  const handleDelete = async () => {
    try {
      // Try to delete via API
      try {
        await api.delete(`/api/teacher/assignments/${selectedAssignment.id}`);
      } catch (apiError) {
        console.warn('API delete failed, using local delete:', apiError);
      }

      setAssignments(prev => prev.filter(a => a.id !== selectedAssignment.id));
      setDeleteDialogOpen(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      setError('Failed to delete assignment');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'spelling',
      description: '',
      classId: '',
      dueDate: '',
      instructions: '',
      maxAttempts: 3
    });
    setSelectedAssignment(null);
  };

  const openEditDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title || '',
      type: assignment.type || 'spelling',
      description: assignment.description || '',
      classId: assignment.classId || '',
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
      instructions: assignment.instructions || '',
      maxAttempts: assignment.maxAttempts || 3
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter(a => {
      const matchesText = !q || `${a.title} ${a.type} ${a.className}`.toLowerCase().includes(q);
      const matchesClass = classFilter === 'all' || a.className === classFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesText && matchesClass && matchesStatus;
    });
  }, [assignments, search, classFilter, statusFilter]);

  const statusColor = (s) => s === 'completed' ? 'success' : s === 'ongoing' ? 'info' : 'default';
  const statusIcon = (s) => s === 'completed' ? <CheckCircleIcon /> : s === 'ongoing' ? <PendingActionsIcon /> : <PendingActionsIcon />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        backTo="/teacher-home"
        backLabel={t('Back to Dashboard')}
        title={<Box sx={{ display: 'flex', alignItems: 'center' }}><AssignmentIcon sx={{ mr: 1.5, color: 'primary.main' }} />{t('Assignments')}</Box>}
        subtitle={t('Create, track, and manage assignments across your classes')}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>{t('Create Assignment')}</Button>}
      />

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search assignments...')}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{t('Class')}</InputLabel>
              <Select label={t('Class')} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <MenuItem value="all">{t('All Classes')}</MenuItem>
                {/* Get unique classes from assignments */}
                {[...new Set(assignments.map(a => a.className))].map((className, index) => (
                  <MenuItem key={index} value={className}>{className}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{t('Status')}</InputLabel>
              <Select label={t('Status')} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">{t('All')}</MenuItem>
                <MenuItem value="draft">{t('Draft')}</MenuItem>
                <MenuItem value="ongoing">{t('Ongoing')}</MenuItem>
                <MenuItem value="completed">{t('Completed')}</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Content */}
        {loading ? (
          <Grid item xs={12}><Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box></Grid>
        ) : error ? (
          <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>
        ) : filtered.length === 0 ? (
          <Grid item xs={12}>
            <EmptyState
              icon={<AssignmentIcon sx={{ fontSize: 56 }} />}
              title={t('No assignments found')}
              description={t('Try different filters or clear the search')}
              action={<Button variant="outlined" onClick={() => { setSearch(''); setClassFilter('all'); setStatusFilter('all'); }}>{t('Clear Filters')}</Button>}
            />
          </Grid>
        ) : (
          filtered.map((a) => (
            <Grid item xs={12} md={6} key={a.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{a.title}</Typography>
                    <Box mt={0.5}>
                      <Chip size="small" icon={<ClassIcon />} label={`${t('Class')}: ${a.className}`} sx={{ mr: 1 }} />
                      <Chip
                        size="small"
                        color={statusColor(a.status)}
                        icon={statusIcon(a.status)}
                        label={t(capitalize(a.status))}
                        sx={{ borderRadius: 999, fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary">{t('Due')}</Typography>
                    <Typography variant="body1"><ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />{formatDate(a.dueDate)}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1.5} mt={2}>
                  <Button size="small" variant="outlined" onClick={() => navigate(`/teacher/classes/${a.classId}`)}>{t('View Class')}</Button>
                  <Button size="small" variant="contained" color="primary" onClick={() => openEditDialog(a)}>
                    {t('Edit')}
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => openDeleteDialog(a)}>
                    {t('Delete')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Assignment Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('Create New Assignment')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label={t('Assignment Title')}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <FormControl fullWidth>
              <InputLabel>{t('Assignment Type')}</InputLabel>
              <Select
                value={formData.type}
                label={t('Assignment Type')}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="spelling">{t('Spelling Challenge')}</MenuItem>
                <MenuItem value="fpow">{t('Four Pics One Word')}</MenuItem>
                <MenuItem value="quiz">{t('Vocabulary Quiz')}</MenuItem>
                <MenuItem value="custom">{t('Custom Assignment')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('Class')}</InputLabel>
              <Select
                value={formData.classId}
                label={t('Class')}
                onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('Description')}
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            <TextField
              fullWidth
              label={t('Instructions')}
              multiline
              rows={2}
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            />
            <TextField
              fullWidth
              type="date"
              label={t('Due Date')}
              InputLabelProps={{ shrink: true }}
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
            <TextField
              fullWidth
              type="number"
              label={t('Max Attempts')}
              value={formData.maxAttempts}
              onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
              inputProps={{ min: 1, max: 10 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>{t('Cancel')}</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!formData.title || !formData.classId}>
            {t('Create Assignment')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('Edit Assignment')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label={t('Assignment Title')}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <FormControl fullWidth>
              <InputLabel>{t('Assignment Type')}</InputLabel>
              <Select
                value={formData.type}
                label={t('Assignment Type')}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="spelling">{t('Spelling Challenge')}</MenuItem>
                <MenuItem value="fpow">{t('Four Pics One Word')}</MenuItem>
                <MenuItem value="quiz">{t('Vocabulary Quiz')}</MenuItem>
                <MenuItem value="custom">{t('Custom Assignment')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('Class')}</InputLabel>
              <Select
                value={formData.classId}
                label={t('Class')}
                onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('Description')}
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            <TextField
              fullWidth
              label={t('Instructions')}
              multiline
              rows={2}
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            />
            <TextField
              fullWidth
              type="date"
              label={t('Due Date')}
              InputLabelProps={{ shrink: true }}
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
            <TextField
              fullWidth
              type="number"
              label={t('Max Attempts')}
              value={formData.maxAttempts}
              onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
              inputProps={{ min: 1, max: 10 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('Cancel')}</Button>
          <Button onClick={handleEdit} variant="contained" disabled={!formData.title || !formData.classId}>
            {t('Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('Delete Assignment')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('Are you sure you want to delete')} "{selectedAssignment?.title}"? {t('This action cannot be undone.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('Cancel')}</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

function generateMockAssignments() {
  const now = new Date();
  const assignmentCount = Math.floor(Math.random() * 8) + 3; // 3-10 assignments
  const types = ['Spelling Challenge', 'Four Pics One Word', 'Vocabulary Quiz', 'Word Search', 'Reading Comprehension'];
  const statuses = ['draft', 'ongoing', 'completed'];
  const classNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
  const topics = ['Animals', 'Food', 'Nature', 'Technology', 'Sports', 'Science', 'History', 'Geography'];
  
  return Array.from({ length: assignmentCount }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const className = classNames[Math.floor(Math.random() * classNames.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate dynamic due dates
    const daysOffset = status === 'completed' 
      ? -(Math.floor(Math.random() * 14) + 1) // 1-14 days ago
      : Math.floor(Math.random() * 21) + 1;   // 1-21 days from now
    
    return {
      id: i + 1,
      title: `${type}: ${topic} ${status === 'draft' ? 'Draft' : `Week ${Math.floor(Math.random() * 4) + 1}`}`,
      type: type,
      status: status,
      dueDate: new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString(),
      classId: Math.floor(Math.random() * classNames.length) + 1,
      className: className,
      description: `${type} focusing on ${topic.toLowerCase()} vocabulary and concepts`,
      instructions: `Complete all ${topic.toLowerCase()} challenges with at least ${60 + Math.floor(Math.random() * 30)}% accuracy`,
      maxAttempts: Math.floor(Math.random() * 4) + 2 // 2-5 attempts
    };
  });
}

function generateMockClasses() {
  const classCount = Math.floor(Math.random() * 5) + 2; // 2-6 classes
  const classNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
  
  return Array.from({ length: classCount }, (_, i) => ({
    id: i + 1,
    name: classNames[i],
    studentCount: Math.floor(Math.random() * 25) + 15 // 15-40 students per class
  }));
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

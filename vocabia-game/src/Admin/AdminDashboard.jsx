import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Rating,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import SortIcon from '@mui/icons-material/Sort';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [sortBy]);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/feedback/all?sortBy=${sortBy}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackList(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/feedback/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/feedback/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchFeedback();
        fetchStats();
      } catch (error) {
        console.error('Failed to delete feedback:', error);
      }
    }
  };

  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setSortBy(newSort);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: 3
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 3
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            🛡️ Admin Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: '#fff' }}>
                  <PeopleIcon sx={{ fontSize: 40, marginBottom: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalFeedback}
                  </Typography>
                  <Typography variant="body2">Total Feedback</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: '#fff' }}>
                  <StarIcon sx={{ fontSize: 40, marginBottom: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.fiveStars}
                  </Typography>
                  <Typography variant="body2">5 Stars</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: '#fff' }}>
                  <StarIcon sx={{ fontSize: 40, marginBottom: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.fourStars}
                  </Typography>
                  <Typography variant="body2">4 Stars</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: '#fff' }}>
                  <StarIcon sx={{ fontSize: 40, marginBottom: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.threeStars}
                  </Typography>
                  <Typography variant="body2">3 Stars</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: '#fff' }}>
                  <StarIcon sx={{ fontSize: 40, marginBottom: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.twoStars}
                  </Typography>
                  <Typography variant="body2">2 Stars</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card sx={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
                <CardContent sx={{ textAlign: 'center', color: '#fff' }}>
                  <StarIcon sx={{ fontSize: 40, marginBottom: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.oneStar}
                  </Typography>
                  <Typography variant="body2">1 Star</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Feedback Table */}
        <Paper
          elevation={8}
          sx={{
            padding: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Sort Controls */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              User Feedback
            </Typography>
            <ToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={handleSortChange}
              size="small"
            >
              <ToggleButton value="date">
                <SortIcon sx={{ marginRight: 0.5 }} />
                Sort by Date
              </ToggleButton>
              <ToggleButton value="rating">
                <StarIcon sx={{ marginRight: 0.5 }} />
                Sort by Rating
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 5 }}>
              <CircularProgress />
            </Box>
          ) : feedbackList.length === 0 ? (
            <Box sx={{ textAlign: 'center', padding: 5 }}>
              <Typography variant="h6" color="text.secondary">
                No feedback submitted yet
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Comments</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedbackList.map((feedback) => (
                    <TableRow
                      key={feedback.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f9f9f9',
                        },
                      }}
                    >
                      <TableCell>{feedback.name}</TableCell>
                      <TableCell>{feedback.email}</TableCell>
                      <TableCell>
                        <Chip label={feedback.grade} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Rating value={feedback.rating} readOnly size="small" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {feedback.comments || <em style={{ color: '#999' }}>No comments</em>}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDate(feedback.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(feedback.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;


import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";

// Utility function to generate avatar colors based on name
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Function to get initials from name
const getInitials = (firstName, lastName) => {
  return `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`;
};

export default function TeacherClassStudentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchStudents();
    fetchClassName();
  }, [id]);

  const fetchClassName = async () => {
    try {
      const response = await api.get(`/api/teacher/classes/${id}`);
      setClassName(response.data.name);
    } catch (err) {
      console.error("Failed to fetch class name:", err);
      // Don't set error state here as we want to prioritize the students fetch error if any
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/teacher/classes/${id}/students`);
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load students:", err);
      setError("Failed to load students. Please try again.");
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header with title and back button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <SchoolIcon sx={{ fontSize: 32, mr: 2, color: '#2e7d32' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
              Enrolled Students
            </Typography>
            {className && (
              <Typography variant="subtitle1" color="text.secondary">
                {className}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to={`/teacher/classes/${id}`}
          sx={{
            borderColor: '#2e7d32',
            color: '#2e7d32',
            '&:hover': {
              borderColor: '#1b5e20',
              bgcolor: 'rgba(46, 125, 50, 0.04)'
            }
          }}
        >
          Back to Class
        </Button>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress color="success" />
        </Box>
      )}

      {/* Error state */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && students.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No students enrolled
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Share the class join code with your students to get started
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/teacher/classes/${id}`)}
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
          >
            View Class Details
          </Button>
        </Paper>
      )}

      {/* Students table */}
      {!loading && !error && students.length > 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#e8f5e9', fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell sx={{ bgcolor: '#e8f5e9', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#e8f5e9', fontWeight: 'bold' }}>Joined Date</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#e8f5e9', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => (
                    <TableRow 
                      key={student.id}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                        '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.04)' }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: stringToColor(`${student.firstName} ${student.lastName}`),
                              mr: 2,
                              color: '#fff'
                            }}
                          >
                            {getInitials(student.firstName, student.lastName)}
                          </Avatar>
                          <Typography variant="body1">
                            {student.firstName} {student.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{student.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {student.joinedDate ? new Date(student.joinedDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Progress">
                          <IconButton 
                            size="small"
                            component={Link}
                            to={`/teacher/classes/${id}/students/${student.id}/progress`}
                            sx={{ color: '#2e7d32' }}
                          >
                            <BarChartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={students.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
          />
        </Paper>
      )}

      {/* Summary stats */}
      {!loading && !error && students.length > 0 && (
        <Box mt={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Class Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Chip 
                icon={<PersonIcon />} 
                label={`${students.length} Students Enrolled`} 
                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} 
              />
              {/* Add more stats chips here as needed */}
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
}

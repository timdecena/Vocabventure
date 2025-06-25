import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import {
  Box,
  Typography,
  Paper,
  Link as MuiLink,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from "@mui/material";
import { Home, People, Games } from "@mui/icons-material";

export default function StudentViewClassPage() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/student/classes`);
        const classData = response.data.find(c => c.id === parseInt(id));
        
        if (classData) {
          setClassroom(classData);
          setError(null);
        } else {
          setError("Class not found or you don't have access to this class");
        }
      } catch (err) {
        console.error("Failed to fetch class data:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view classes");
        } else {
          setError("Failed to load class data: " + (err.response?.data || err.message));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [id]);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={3}>
      <Alert severity="error">
        {error}
      </Alert>
      <Box mt={2}>
        <Button 
          component={Link} 
          to="/student/classes" 
          variant="outlined" 
          startIcon={<Home />}
        >
          Back to My Classes
        </Button>
      </Box>
    </Box>
  );

  if (!classroom) return (
    <Box p={3}>
      <Alert severity="warning">
        Class not found
      </Alert>
      <Box mt={2}>
        <Button 
          component={Link} 
          to="/student/classes" 
          variant="outlined" 
          startIcon={<Home />}
        >
          Back to My Classes
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {classroom.name}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {classroom.description}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary">
          Teacher: {classroom.teacher?.firstName} {classroom.teacher?.lastName}
        </Typography>
      </Paper>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Class Actions
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              component={Link}
              to={`/student/classes/${id}/classmates`}
              variant="contained"
              color="primary"
              startIcon={<People />}
              fullWidth
            >
              View Classmates
            </Button>
            
            <Button
              component={Link}
              to={`/student/classes/${id}/4pic1word`}
              variant="contained"
              color="secondary"
              startIcon={<Games />}
              fullWidth
            >
              Play 4 Pics 1 Word Game
            </Button>
            
            <Button
              component={Link}
              to="/student/classes"
              variant="outlined"
              startIcon={<Home />}
              fullWidth
            >
              Back to My Classes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
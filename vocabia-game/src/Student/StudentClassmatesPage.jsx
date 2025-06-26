import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { 
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Paper,
  Divider
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function StudentClassmatesPage() {
  const { id } = useParams();
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassmates = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/student/classes/${id}/classmates`);
        setClassmates(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load classmates:", err);
        if (err.response?.status === 403) {
          setError("You don't have permission to view this class's students");
        } else if (err.response?.status === 404) {
          setError("Class not found");
        } else {
          setError("Failed to load classmates. Please try again later.");
        }
        setClassmates([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassmates();
  }, [id]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Classmates
        </Typography>
        
        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box>
            <Typography color="error" paragraph>{error}</Typography>
            <Button 
              component={Link}
              to={`/student/classes/${id}`}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
            >
              Back to Class
            </Button>
          </Box>
        ) : classmates.length === 0 ? (
          <Box>
            <Typography paragraph>No classmates found in this class.</Typography>
            <Button 
              component={Link}
              to={`/student/classes/${id}`}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
            >
              Back to Class
            </Button>
          </Box>
        ) : (
          <>
            <List>
              {classmates.map(student => (
                <ListItem key={student.id} divider>
                  <ListItemText 
                    primary={`${student.firstName} ${student.lastName}`}
                    secondary={student.email}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2 }}>
              <Button 
                component={Link}
                to={`/student/classes/${id}`}
                startIcon={<ArrowBackIcon />}
                variant="outlined"
              >
                Back to Class
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
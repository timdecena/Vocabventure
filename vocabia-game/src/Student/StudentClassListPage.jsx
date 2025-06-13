import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { Box, Typography, Button, List, ListItem, Paper, Divider, CircularProgress, Alert } from "@mui/material";

export default function StudentClassListPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Use the API instance which already handles authentication
        const response = await api.get("/api/student/classes");
        setClasses(response.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
        if (err.response) {
          // Server responded with an error
          if (err.response.status === 403) {
            setError("You don't have permission to access this resource. Please log in again.");
          } else if (err.response.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else {
            setError(`Error: ${err.response.data.message || "Failed to load classes"}`); 
          }
        } else if (err.request) {
          // Request was made but no response received
          setError("No response from server. Please check your connection.");
        } else {
          // Something happened in setting up the request
          setError("Failed to load classes. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Classes
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate("/student/classes/join")}
        >
          Join New Class
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : classes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">
            You haven't joined any classes yet. Click "Join New Class" to get started.
          </Typography>
        </Paper>
      ) : (
        <List component={Paper} sx={{ p: 0 }}>
          {classes.map((c, index) => (
            <React.Fragment key={c.id}>
              {index > 0 && <Divider />}
              <ListItem sx={{ display: "block", p: 2 }}>
                <Typography variant="h6" gutterBottom>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {c.description}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Teacher: {c.teacher?.firstName} {c.teacher?.lastName}
                </Typography>
                <Box>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => navigate(`/student/classes/${c.id}`)}
                    sx={{ mr: 1 }}
                  >
                    View Class
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => navigate(`/student/classes/${c.id}/classmates`)}
                  >
                    Classmates
                  </Button>
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}

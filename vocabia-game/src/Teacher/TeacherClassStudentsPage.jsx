import React, { useEffect, useState } from "react";
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
  useTheme
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as ClassIcon,
  CheckCircle as CorrectIcon,
  Star as ProgressIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function TeacherClassStudentsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState({ name: "", joinCode: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          Back to Classes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f9fafc", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 4,
          flexWrap: "wrap",
          gap: 2
        }}>
          <Box>
            <Button
              variant="text"
              startIcon={<BackIcon />}
              onClick={() => navigate(`/teacher/classes/${id}`)}
              sx={{ mb: 1 }}
            >
              Back to Class
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {classInfo.name} Students
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Class Code: {classInfo.joinCode}
            </Typography>
          </Box>
          <Chip
            label={`${students.length} ${students.length === 1 ? 'Student' : 'Students'}`}
            color="primary"
            variant="outlined"
            sx={{ height: 40, fontSize: "1rem" }}
          />
        </Box>

        {/* Students Table */}
        <Paper elevation={0} sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden"
        }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CorrectIcon sx={{ mr: 1, color: "success.main" }} />
                      Correct
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ProgressIcon sx={{ mr: 1, color: "warning.main" }} />
                      Progress
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <PersonIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No students enrolled in this class
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/teacher/classes/${id}/students/add`)}
            sx={{ ml: 2 }}
          >
            Add Students
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
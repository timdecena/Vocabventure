import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent,
  CircularProgress, Alert, Button, Divider, List, ListItem, ListItemText
} from "@mui/material";
import { 
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from "../api/api";

export default function TeacherStudentFPOWProgressPage() {
  const { classId, studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [className, setClassName] = useState("");

  // Mock data for development and testing
  const mockStudentData = {
    id: studentId,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@example.com",
    joinedDate: "2025-01-15T10:30:00"
  };

  const mockProgressData = {
    summary: {
      levelsCompleted: 21,
      totalLevels: 30,
      accuracy: 79,
      averageTime: 51,
      hintUsage: 30,
      lastActive: '2025-06-12T09:45:00',
      streak: 5,
      bestCategory: "Animals",
      worstCategory: "Technology"
    },
    progressOverTime: [
      { date: '2025-05-01', levelsCompleted: 8, accuracy: 70 },
      { date: '2025-05-08', levelsCompleted: 12, accuracy: 72 },
      { date: '2025-05-15', levelsCompleted: 15, accuracy: 75 },
      { date: '2025-05-22', levelsCompleted: 18, accuracy: 77 },
      { date: '2025-05-29', levelsCompleted: 21, accuracy: 79 }
    ],
    categoryPerformance: [
      { category: "Animals", accuracy: 90, completionRate: 85, averageTime: 42 },
      { category: "Food", accuracy: 82, completionRate: 75, averageTime: 48 },
      { category: "Sports", accuracy: 78, completionRate: 70, averageTime: 52 },
      { category: "Technology", accuracy: 68, completionRate: 60, averageTime: 58 },
      { category: "Nature", accuracy: 76, completionRate: 65, averageTime: 55 }
    ],
    skillRadar: [
      { subject: 'Accuracy', A: 79, fullMark: 100 },
      { subject: 'Speed', A: 65, fullMark: 100 },
      { subject: 'Consistency', A: 72, fullMark: 100 },
      { subject: 'Completion', A: 70, fullMark: 100 },
      { subject: 'Independence', A: 60, fullMark: 100 },
    ],
    recentActivity: [
      { date: '2025-06-12T09:45:00', word: 'Elephant', category: 'Animals', correct: true, attempts: 1, timeSpent: 38, usedHint: false },
      { date: '2025-06-12T09:42:00', word: 'Laptop', category: 'Technology', correct: true, attempts: 3, timeSpent: 65, usedHint: true },
      { date: '2025-06-12T09:38:00', word: 'Soccer', category: 'Sports', correct: true, attempts: 2, timeSpent: 47, usedHint: false },
      { date: '2025-06-12T09:35:00', word: 'Banana', category: 'Food', correct: true, attempts: 1, timeSpent: 42, usedHint: false },
      { date: '2025-06-12T09:30:00', word: 'Router', category: 'Technology', correct: false, attempts: 4, timeSpent: 78, usedHint: true }
    ]
  };

  useEffect(() => {
    fetchStudentData();
    fetchClassName();
  }, [classId, studentId]);

  const fetchClassName = async () => {
    try {
      const response = await api.get(`/api/teacher/classes/${classId}`);
      setClassName(response.data.name);
    } catch (err) {
      console.error("Error fetching class name:", err);
      setClassName("Class");
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // In a production environment, these would be real API calls
      // For now, we'll use mock data and simulate API delay
      
      setTimeout(() => {
        setStudentData(mockStudentData);
        setProgressData(mockProgressData);
        setLoading(false);
      }, 1000);

      // Commented out real API calls for future implementation
      /*
      // Get student data
      const studentResponse = await api.get(`/api/teacher/classes/${classId}/students/${studentId}`);
      setStudentData(studentResponse.data);
      
      // Get student progress data
      const progressResponse = await api.get(`/api/teacher/classes/${classId}/students/${studentId}/fpow-progress`);
      setProgressData(progressResponse.data);
      
      setLoading(false);
      */
    } catch (err) {
      setError("Failed to load student progress data. Please try again later.");
      setLoading(false);
      console.error("Error fetching student progress data:", err);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">
            {studentData.firstName} {studentData.lastName}'s Progress
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Four Pic One Word - {className}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          component={Link}
          to={`/teacher/classes/${classId}/fpow-progress`}
        >
          Back to Class Progress
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Completion
                </Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {progressData.summary.levelsCompleted}/{progressData.summary.totalLevels}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round((progressData.summary.levelsCompleted / progressData.summary.totalLevels) * 100)}% of levels completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Accuracy
                </Typography>
              </Box>
              <Typography variant="h3" color="secondary">
                {progressData.summary.accuracy}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Correct answers ratio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <LightbulbIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Hint Usage
                </Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {progressData.summary.hintUsage}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Levels with hints used
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTimeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Avg. Time
                </Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {progressData.summary.averageTime}s
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Per level completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Over Time */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Progress Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData.progressOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="levelsCompleted" name="Levels Completed" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Skill Radar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Skill Analysis</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={progressData.skillRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Category Performance</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" name="Accuracy %" fill="#8884d8" />
                <Bar dataKey="completionRate" name="Completion %" fill="#82ca9d" />
                <Bar dataKey="averageTime" name="Avg. Time (sec)" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <List>
              {progressData.recentActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start" sx={{
                    backgroundColor: activity.correct ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="subtitle1" fontWeight={500}>
                            {activity.word} ({activity.category})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {activity.correct ? 'Correct' : 'Incorrect'} • {activity.attempts} attempt{activity.attempts !== 1 ? 's' : ''} • {activity.timeSpent}s
                          </Typography>
                          {activity.usedHint && 
                            <Typography component="span" variant="body2" color="warning.main" sx={{ ml: 1 }}>
                              Used hint
                            </Typography>
                          }
                        </>
                      }
                    />
                  </ListItem>
                  {index < progressData.recentActivity.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Strengths and Areas for Improvement */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Analysis & Recommendations</Typography>
            
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Strengths
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={`Strong performance in ${progressData.summary.bestCategory} category (${progressData.categoryPerformance.find(c => c.category === progressData.summary.bestCategory)?.accuracy}% accuracy)`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={`Current learning streak: ${progressData.summary.streak} days`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Good completion rate for basic vocabulary words" 
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Areas for Improvement
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={`Struggles with ${progressData.summary.worstCategory} category (${progressData.categoryPerformance.find(c => c.category === progressData.summary.worstCategory)?.accuracy}% accuracy)`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={`High hint usage (${progressData.summary.hintUsage}% of levels)`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Takes longer than average to complete technology-related words" 
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Recommendations
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Assign additional practice with technology vocabulary words to improve performance in this category.
            </Alert>
            <Alert severity="success">
              Encourage continued practice in the Animals category where the student shows strong performance.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

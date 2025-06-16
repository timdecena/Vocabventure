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

  // Mock data that uses database categories when available
  const mockProgressData = {
    summary: {
      levelsCompleted: 21,
      totalLevels: 30,
      accuracy: 79,
      averageTime: 51,
      hintUsage: 30,
      lastActive: '2025-06-12T09:45:00',
      streak: 5,
      bestCategory: "", // Will be populated from actual data
      worstCategory: "" // Will be populated from actual data
    },
    progressOverTime: [
      { date: '2025-05-01', levelsCompleted: 8, accuracy: 70 },
      { date: '2025-05-08', levelsCompleted: 12, accuracy: 72 },
      { date: '2025-05-15', levelsCompleted: 15, accuracy: 75 },
      { date: '2025-05-22', levelsCompleted: 18, accuracy: 77 },
      { date: '2025-05-29', levelsCompleted: 21, accuracy: 79 }
    ],
    categoryPerformance: [], // Will be populated from database categories
    skillRadar: [
      { subject: 'Accuracy', A: 79, fullMark: 100 },
      { subject: 'Speed', A: 65, fullMark: 100 },
      { subject: 'Consistency', A: 72, fullMark: 100 },
      { subject: 'Completion', A: 70, fullMark: 100 },
      { subject: 'Independence', A: 60, fullMark: 100 },
    ],
    recentActivity: [] // Will be populated from actual data if available
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
      setError(null);
      
      console.log(`Fetching student data for class ID: ${classId}, student ID: ${studentId}`);
      
      try {
        // Get student progress data
        const progressResponse = await api.get(`/api/teacher/classes/${classId}/students/${studentId}/progress`);
        console.log("Student progress response:", progressResponse.data);
        
        // Set student basic info
        setStudentData({
          id: progressResponse.data.id,
          firstName: progressResponse.data.firstName || 'Unknown',
          lastName: progressResponse.data.lastName || 'Student',
          email: progressResponse.data.email || 'No email',
          joinedDate: new Date().toISOString() // This info isn't provided by the API yet
        });
        
        // Set progress data
        setProgressData({
          summary: progressResponse.data.summary || {},
          progressOverTime: progressResponse.data.progressOverTime || [],
          categoryPerformance: progressResponse.data.categoryPerformance || [],
          skillRadar: progressResponse.data.skillRadar || [],
          // For recent activity, we don't have this data yet, so use placeholder
          recentActivity: []
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student progress data:", err.response?.data || err.message);
        
        // Check for specific error types
        if (err.response) {
          if (err.response.status === 401) {
            setError("Authentication error. Please log in again.");
          } else if (err.response.status === 403) {
            setError("You don't have permission to access this student's data.");
          } else if (err.response.status === 404) {
            setError("Student data not found. The student may not exist or is not enrolled in this class.");
          } else {
            setError(err.response?.data?.message || "Failed to load student progress data. Please try again later.");
          }
        } else {
          setError("Network error. Please check your connection and try again.");
        }
        
        // Fall back to mock data for development/testing
        console.log("Falling back to mock data due to API error");
        setStudentData(mockStudentData);
        
        // Try to get categories from the backend if possible
        try {
          // Attempt to fetch categories from the backend
          const categoriesResponse = await api.get('/api/categories');
          const dbCategories = categoriesResponse.data || [];
          
          if (dbCategories && dbCategories.length > 0) {
            console.log("Using categories from database for mock data", dbCategories);
            
            // Create mock category performance data using real categories
            const mockCategoryPerformance = dbCategories.map((category, index) => {
              // Generate varied performance metrics for each category
              const baseAccuracy = 75 + (Math.floor(Math.random() * 20) - 10);
              const baseCompletionRate = 70 + (Math.floor(Math.random() * 25) - 10);
              const baseTime = 45 + (Math.floor(Math.random() * 20) - 10);
              
              return {
                category: category.name || category,
                accuracy: Math.min(100, Math.max(0, baseAccuracy)),
                completionRate: Math.min(100, Math.max(0, baseCompletionRate)),
                averageTime: Math.max(1, baseTime)
              };
            });
            
            // Find best and worst categories based on accuracy
            const bestCategory = [...mockCategoryPerformance].sort((a, b) => b.accuracy - a.accuracy)[0];
            const worstCategory = [...mockCategoryPerformance].sort((a, b) => a.accuracy - b.accuracy)[0];
            
            // Update the mock data with real categories
            mockProgressData.categoryPerformance = mockCategoryPerformance;
            mockProgressData.summary.bestCategory = bestCategory ? bestCategory.category : "";
            mockProgressData.summary.worstCategory = worstCategory ? worstCategory.category : "";
            
            // Generate mock recent activity using real categories
            mockProgressData.recentActivity = dbCategories.slice(0, 5).map((category, index) => {
              const date = new Date();
              date.setMinutes(date.getMinutes() - (index * 5));
              
              const words = {
                Animals: ['Elephant', 'Tiger', 'Giraffe', 'Penguin', 'Koala'],
                Food: ['Banana', 'Pasta', 'Sushi', 'Quinoa', 'Burger'],
                Sports: ['Soccer', 'Tennis', 'Basketball', 'Golf', 'Swimming'],
                Technology: ['Laptop', 'Router', 'Firewall', 'Tablet', 'Server'],
                Nature: ['Forest', 'Mountain', 'Ocean', 'Desert', 'Glacier'],
                // Add fallback for any other category
                Default: ['Word1', 'Word2', 'Word3', 'Word4', 'Word5']
              };
              
              const categoryName = category.name || category;
              const wordList = words[categoryName] || words.Default;
              const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
              
              return {
                date: date.toISOString(),
                word: randomWord,
                category: categoryName,
                correct: Math.random() > 0.2, // 80% chance of being correct
                attempts: Math.floor(Math.random() * 3) + 1,
                timeSpent: 30 + Math.floor(Math.random() * 50),
                usedHint: Math.random() > 0.7 // 30% chance of using hint
              };
            });
          }
        } catch (categoryErr) {
          console.error("Error fetching categories for mock data:", categoryErr);
          // If we can't get categories, use default mock data
          mockProgressData.categoryPerformance = [
            { category: "Animals", accuracy: 90, completionRate: 85, averageTime: 42 },
            { category: "Food", accuracy: 82, completionRate: 75, averageTime: 48 },
            { category: "Sports", accuracy: 78, completionRate: 70, averageTime: 52 },
            { category: "Technology", accuracy: 68, completionRate: 60, averageTime: 58 },
            { category: "Nature", accuracy: 76, completionRate: 65, averageTime: 55 }
          ];
          mockProgressData.summary.bestCategory = "Animals";
          mockProgressData.summary.worstCategory = "Technology";
          mockProgressData.recentActivity = [
            { date: '2025-06-12T09:45:00', word: 'Elephant', category: 'Animals', correct: true, attempts: 1, timeSpent: 38, usedHint: false },
            { date: '2025-06-12T09:42:00', word: 'Laptop', category: 'Technology', correct: true, attempts: 3, timeSpent: 65, usedHint: true },
            { date: '2025-06-12T09:38:00', word: 'Soccer', category: 'Sports', correct: true, attempts: 2, timeSpent: 47, usedHint: false },
            { date: '2025-06-12T09:35:00', word: 'Banana', category: 'Food', correct: true, attempts: 1, timeSpent: 42, usedHint: false },
            { date: '2025-06-12T09:30:00', word: 'Router', category: 'Technology', correct: false, attempts: 4, timeSpent: 78, usedHint: true }
          ];
        }
        
        setProgressData(mockProgressData);
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to load student progress data. Please try again later.");
      setLoading(false);
      console.error("Error in fetchStudentData:", err);
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
              {progressData.summary.bestCategory && progressData.categoryPerformance.find(c => c.category === progressData.summary.bestCategory) && (
                <ListItem>
                  <ListItemText 
                    primary={`Strong performance in ${progressData.summary.bestCategory} category (${progressData.categoryPerformance.find(c => c.category === progressData.summary.bestCategory)?.accuracy}% accuracy)`} 
                  />
                </ListItem>
              )}
              
              {progressData.summary.streak > 0 && (
                <ListItem>
                  <ListItemText 
                    primary={`Current learning streak: ${progressData.summary.streak} days`} 
                  />
                </ListItem>
              )}
              
              {progressData.categoryPerformance.some(c => c.completionRate > 75) && (
                <ListItem>
                  <ListItemText 
                    primary={`Good completion rate for ${progressData.categoryPerformance.find(c => c.completionRate > 75)?.category || 'vocabulary'} words`} 
                  />
                </ListItem>
              )}
              
              {!progressData.summary.bestCategory && !progressData.categoryPerformance.some(c => c.completionRate > 75) && (
                <ListItem>
                  <ListItemText primary="No specific strengths identified yet. Keep practicing!" />
                </ListItem>
              )}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Areas for Improvement
            </Typography>
            <List dense>
              {progressData.summary.worstCategory && progressData.categoryPerformance.find(c => c.category === progressData.summary.worstCategory) && (
                <ListItem>
                  <ListItemText 
                    primary={`Struggles with ${progressData.summary.worstCategory} category (${progressData.categoryPerformance.find(c => c.category === progressData.summary.worstCategory)?.accuracy}% accuracy)`} 
                  />
                </ListItem>
              )}
              
              {progressData.summary.hintUsage > 30 && (
                <ListItem>
                  <ListItemText primary={`High hint usage (${progressData.summary.hintUsage}%). Try to solve puzzles without hints.`} />
                </ListItem>
              )}
              
              {!progressData.summary.worstCategory && progressData.summary.hintUsage <= 30 && (
                <ListItem>
                  <ListItemText primary="No specific areas of concern identified. Keep up the good work!" />
                </ListItem>
              )}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Recommendations
            </Typography>
            {progressData.summary.worstCategory && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Assign additional practice with {progressData.summary.worstCategory} vocabulary words to improve performance in this category.
              </Alert>
            )}
            {progressData.summary.bestCategory && (
              <Alert severity="success">
                Encourage continued practice in the {progressData.summary.bestCategory} category where the student shows strong performance.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

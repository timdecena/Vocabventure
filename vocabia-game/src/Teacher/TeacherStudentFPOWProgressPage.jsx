import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, CircularProgress, Alert, LinearProgress, Chip, Avatar
} from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from "../api/api";
import { t } from "./utils/i18n";
import {
  colors,
  StyledCard,
  PageTitle,
} from "./components/DesignSystem";

export default function TeacherStudentFPOWProgressPage() {
  const { classId, studentId } = useParams();
  const navigate = useNavigate();
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

  const fetchClassName = useCallback(async () => {
    try {
      const response = await api.get(`/api/teacher/classes/${classId}`);
      setClassName(response.data.name);
    } catch (err) {
      console.error("Error fetching class name:", err);
      setClassName("Class");
    }
  }, [classId]);

  const fetchStudentData = useCallback(async () => {
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
  }, [classId, studentId]);

  useEffect(() => {
    fetchStudentData();
    fetchClassName();
  }, [fetchStudentData, fetchClassName]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: "100vh", pb: 4, pt: 2 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    </Box>
  );

  const completionPercentage = progressData?.summary?.totalLevels > 0 
    ? Math.round((progressData.summary.levelsCompleted / progressData.summary.totalLevels) * 100)
    : 0;

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: "100vh", pb: 4, pt: 2 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box
            onClick={() => navigate(`/teacher/classes/${classId}/fpow-progress`)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: colors.primary,
              '&:hover': { color: colors.primaryDark }
            }}
          >
            <ArrowBackIcon sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('Back to Class Progress')}
            </Typography>
          </Box>
        </Box>

        <PageTitle icon={<EmojiEventsIcon sx={{ fontSize: 32 }} />}>
          {studentData?.firstName} {studentData?.lastName}{t("'s Progress")}
        </PageTitle>
        
        <Typography variant="body1" sx={{ color: colors.textLight, mb: 4 }}>
          {t('Four Pic One Word')} - {className}
        </Typography>

        {/* Key Metrics Grid - Matching TeacherHome style */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${colors.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 24, color: colors.primary }} />
              </Box>
              <Chip
                label={`${completionPercentage}%`}
                size="small"
                sx={{
                  bgcolor: `${colors.secondary}15`,
                  color: colors.secondary,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
              {progressData?.summary?.levelsCompleted || 0}/{progressData?.summary?.totalLevels || 0}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500, mb: 1.5 }}>
              {t('Levels Completed')}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: colors.border,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.primary,
                  borderRadius: 3
                }
              }}
            />
          </StyledCard>

          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${colors.secondary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 24, color: colors.secondary }} />
              </Box>
              <Chip
                label={progressData?.summary?.accuracy >= 80 ? 'Excellent' : progressData?.summary?.accuracy >= 60 ? 'Good' : 'Needs Improvement'}
                size="small"
                sx={{
                  bgcolor: progressData?.summary?.accuracy >= 80 
                    ? `${colors.success}15` 
                    : progressData?.summary?.accuracy >= 60 
                    ? `${colors.warning}15` 
                    : `${colors.error}15`,
                  color: progressData?.summary?.accuracy >= 80 
                    ? colors.success 
                    : progressData?.summary?.accuracy >= 60 
                    ? colors.warning 
                    : colors.error,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
              {progressData?.summary?.accuracy || 0}%
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500, mb: 1.5 }}>
              {t('Accuracy Rate')}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progressData?.summary?.accuracy || 0}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: colors.border,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.secondary,
                  borderRadius: 3
                }
              }}
            />
          </StyledCard>

          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${colors.warning}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <LightbulbIcon sx={{ fontSize: 24, color: colors.warning }} />
              </Box>
              <Chip
                label={progressData?.summary?.hintUsage < 30 ? 'Low' : progressData?.summary?.hintUsage < 50 ? 'Moderate' : 'High'}
                size="small"
                sx={{
                  bgcolor: progressData?.summary?.hintUsage < 30 
                    ? `${colors.success}15` 
                    : progressData?.summary?.hintUsage < 50 
                    ? `${colors.warning}15` 
                    : `${colors.error}15`,
                  color: progressData?.summary?.hintUsage < 30 
                    ? colors.success 
                    : progressData?.summary?.hintUsage < 50 
                    ? colors.warning 
                    : colors.error,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
              {progressData?.summary?.hintUsage || 0}%
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500, mb: 1.5 }}>
              {t('Hint Usage Rate')}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progressData?.summary?.hintUsage || 0}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: colors.border,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.warning,
                  borderRadius: 3
                }
              }}
            />
          </StyledCard>

          <StyledCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${colors.info}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 24, color: colors.info }} />
              </Box>
              <Chip
                label={progressData?.summary?.averageTime < 45 ? 'Fast' : progressData?.summary?.averageTime < 60 ? 'Average' : 'Slow'}
                size="small"
                sx={{
                  bgcolor: progressData?.summary?.averageTime < 45 
                    ? `${colors.success}15` 
                    : progressData?.summary?.averageTime < 60 
                    ? `${colors.warning}15` 
                    : `${colors.error}15`,
                  color: progressData?.summary?.averageTime < 45 
                    ? colors.success 
                    : progressData?.summary?.averageTime < 60 
                    ? colors.warning 
                    : colors.error,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
              {progressData?.summary?.averageTime || 0}s
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
              {t('Average Time per Level')}
            </Typography>
          </StyledCard>
        </Box>

        {/* Progress Summary Section - Matching TeacherHome style */}
        <StyledCard sx={{ mt: 3 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                {t('Progress Summary')}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textLight }}>
                {t('Overall performance and completion status')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                {t('Overall Progress')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                {progressData?.summary?.levelsCompleted || 0} / {progressData?.summary?.totalLevels || 0} {t('levels')}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: colors.border,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.primary,
                  borderRadius: 5
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip 
              label={`${t('Completed')}: ${progressData?.summary?.levelsCompleted || 0}`}
              sx={{
                bgcolor: `${colors.success}15`,
                color: colors.success,
                fontWeight: 600,
                fontSize: '0.875rem',
                height: 32,
              }}
            />
            <Chip 
              label={`${t('Remaining')}: ${(progressData?.summary?.totalLevels || 0) - (progressData?.summary?.levelsCompleted || 0)}`}
              sx={{
                bgcolor: `${colors.border}`,
                color: colors.text,
                fontWeight: 600,
                fontSize: '0.875rem',
                height: 32,
              }}
            />
            {progressData?.summary?.bestCategory && (
              <Chip 
                label={`${t('Best Category')}: ${progressData.summary.bestCategory}`}
                sx={{
                  bgcolor: `${colors.primary}15`,
                  color: colors.primary,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: 32,
                }}
              />
            )}
            {progressData?.summary?.worstCategory && progressData.summary.worstCategory !== 'None' && (
              <Chip 
                label={`${t('Needs Practice')}: ${progressData.summary.worstCategory}`}
                sx={{
                  bgcolor: `${colors.warning}15`,
                  color: colors.warning,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: 32,
                }}
              />
            )}
          </Box>
        </StyledCard>
      </Box>
    </Box>
  );
}

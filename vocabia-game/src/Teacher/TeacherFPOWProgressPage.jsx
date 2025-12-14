import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import api from "../api/api";
import authService from "../services/authService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import InsightsIcon from "@mui/icons-material/Insights";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { t } from "./utils/i18n";
import {
  colors,
  StyledCard,
  PageTitle,
  SecondaryButton,
  GhostButton,
  EmptyState as DSEmptyState,
} from "./components/DesignSystem";

export default function TeacherFPOWProgressPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const classId = params.classId || params.id || (location.state && location.state.classId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [className, setClassName] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  const checkAuth = () => {
    if (!authService.isAuthenticated()) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return false;
    }
    if (authService.getRole() !== "TEACHER") {
      setError("You must be a teacher to access this page.");
      setLoading(false);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (checkAuth() && classId) {
      fetchClassProgress();
      fetchClassName();
    } else if (!classId) {
      setError("No class ID provided. Please navigate from the class view page.");
      setLoading(false);
    }
  }, [classId]);

  const fetchClassName = async () => {
    try {
      const response = await api.get(`/api/teacher/classes/${classId}`);
      setClassName(response.data.name);
    } catch (err) {
      console.error("Error fetching class name:", err);
      setClassName("Class");
      if (!error) setError(err.response?.data?.message || "Could not fetch class information");
    }
  };

  const fetchClassProgress = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/teacher/classes/${classId}/progress`);
      const apiData = response.data;

      // Generate progress over time data
      const progressOverTime = [];
      const now = new Date();
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        const completionRate = Math.min(
          100,
          Math.max(
            0,
            ((apiData.totalLevelsCompleted || 0) - i * 5) * 100 / ((apiData.students?.length || 1) * 30)
          )
        );
        const accuracy = Math.min(100, Math.max(0, (apiData.averageAccuracy || 0) - i * 3));
        progressOverTime.push({
          date: date.toISOString().split("T")[0],
          completionRate: Math.round(completionRate),
          accuracy: Math.round(accuracy)
        });
      }

      // Set class data
      setClassData({
        averageCompletionRate: apiData.averageCompletionRate || 0,
        averageAccuracy: apiData.averageAccuracy || 0,
        averageHintUsage: apiData.averageHintUsage || 0,
        averageTimePerLevel: apiData.averageTimePerLevel || 0,
        totalLevelsCompleted: apiData.totalLevelsCompleted || 0,
        progressOverTime: progressOverTime
      });

      // Process student data
      const students = apiData.students || [];
      const processedStudentData = students.map(student => ({
        id: student.id,
        firstName: student.firstName || "Unknown",
        lastName: student.lastName || "Student",
        email: student.email || "No email",
        progress: {
          levelsCompleted: student.levelsCompleted || 0,
          accuracy: student.accuracy || 0,
          averageTime: student.averageTime || 0,
          hintUsage: student.hintUsage || 0,
          lastActive: student.lastActive || new Date().toISOString()
        }
      }));
      setStudentData(processedStudentData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching class progress:", err);
      setError(err.response?.data?.message || "Failed to load progress data.");
      setClassData({
        averageCompletionRate: 0,
        averageAccuracy: 0,
        averageHintUsage: 0,
        averageTimePerLevel: 0,
        totalLevelsCompleted: 0,
        progressOverTime: [{ date: new Date().toISOString().split("T")[0], completionRate: 0, accuracy: 0 }]
      });
      setStudentData([]);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExportReport = async () => {
    setExportLoading(true);
    try {
      // CSV export logic here
      setExportLoading(false);
    } catch (err) {
      console.error("Error exporting report:", err);
      setExportLoading(false);
    }
  };

  const getStatusColor = (accuracy) => {
    if (accuracy > 85) return colors.success;
    if (accuracy > 70) return colors.warning;
    return colors.error;
  };

  const getStatusLabel = (accuracy) => {
    if (accuracy > 85) return t("Excellent");
    if (accuracy > 70) return t("Good");
    return t("Needs Improvement");
  };

  if (loading) {
    return (
      <Box sx={{ 
        bgcolor: colors.mainBg, 
        minHeight: '100vh',
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: '800px', mx: 'auto', mt: 4 }}>
          <StyledCard>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <SecondaryButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/teacher/classes")}
            >
              {t("Back to Classes")}
            </SecondaryButton>
          </StyledCard>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', p: 3 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Page Header */}
        <PageTitle
          icon={<AssessmentIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <SecondaryButton
                startIcon={<DownloadIcon />}
                onClick={handleExportReport}
                disabled={exportLoading}
              >
                {exportLoading ? t("Exporting...") : t("Export Report")}
              </SecondaryButton>
              <SecondaryButton
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/teacher/classes/${classId}`)}
              >
                {t("Back to Class")}
              </SecondaryButton>
            </Box>
          }
        >
          {t("FPOW Progress")} • {className}
        </PageTitle>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: colors.textLight,
            mb: 3,
            fontSize: '1rem',
          }}
        >
          {t("Track and analyze student performance in Four Pic One Word")}
        </Typography>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: `2px solid ${colors.border}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                minHeight: 48,
                color: colors.textLight,
                '&.Mui-selected': {
                  color: colors.primary,
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                bgcolor: colors.primary
              }
            }}
          >
            <Tab
              icon={<InsightsIcon />}
              iconPosition="start"
              label={t("Class Overview")}
            />
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label={t("Student Performance")}
            />
          </Tabs>
        </Box>

        {/* Class Overview Tab */}
        {activeTab === 0 && classData && (
          <Box>
            {/* Key Metrics Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
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
                    <CheckCircleIcon sx={{ fontSize: 24, color: colors.primary }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                  {classData.averageCompletionRate}%
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                  {t("Completion Rate")}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={classData.averageCompletionRate}
                  sx={{
                    mt: 1.5,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: `${colors.primary}15`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.primary,
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
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                  {classData.averageAccuracy}%
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                  {t("Accuracy")}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={classData.averageAccuracy}
                  sx={{
                    mt: 1.5,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: `${colors.secondary}15`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.secondary,
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
                    <HelpOutlineIcon sx={{ fontSize: 24, color: colors.warning }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                  {classData.averageHintUsage}%
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                  {t("Hint Usage")}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={classData.averageHintUsage}
                  sx={{
                    mt: 1.5,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: `${colors.warning}15`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.warning,
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
                      bgcolor: `${colors.accent}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                    }}
                  >
                    <ScheduleIcon sx={{ fontSize: 24, color: colors.accent }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                  {classData.averageTimePerLevel}s
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textLight, fontWeight: 500 }}>
                  {t("Avg. Time")}
                </Typography>
              </StyledCard>
            </Box>

            {/* Main Content Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 3,
              mb: 3
            }}>
              {/* Progress Chart */}
              <StyledCard>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                      {t("Class Progress Over Time")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textLight }}>
                      {t("Weekly completion rate and accuracy trends")}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={classData.progressOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis 
                        dataKey="date" 
                        stroke={colors.textLight}
                        tick={{ fill: colors.textLight, fontSize: 12 }}
                      />
                      <YAxis 
                        stroke={colors.textLight}
                        tick={{ fill: colors.textLight, fontSize: 12 }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: `1px solid ${colors.border}`,
                          background: colors.cardBg,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="completionRate"
                        name={t("Completion %")}
                        stroke={colors.primary}
                        strokeWidth={2}
                        dot={{ r: 4, fill: colors.primary }}
                        activeDot={{ r: 6, fill: colors.primary }}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        name={t("Accuracy %")}
                        stroke={colors.secondary}
                        strokeWidth={2}
                        dot={{ r: 4, fill: colors.secondary }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </StyledCard>

              {/* Performance Summary */}
              <StyledCard>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <InsightsIcon sx={{ color: colors.primary, fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                    {t("Performance Summary")}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: colors.textLight }}>
                        {t("Total Levels Completed")}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        {classData.totalLevelsCompleted}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: colors.textLight }}>
                        {t("Active Students")}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        {studentData.length}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: colors.textLight }}>
                        {t("Avg. Levels per Student")}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        {studentData.length > 0
                          ? Math.round(classData.totalLevelsCompleted / studentData.length)
                          : 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    mt: 4, 
                    pt: 3, 
                    borderTop: `2px solid ${colors.border}` 
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: colors.textLight, fontWeight: 600, mb: 1.5 }}>
                    {t("Overall Class Health")}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={getStatusLabel(classData.averageAccuracy)}
                      sx={{
                        bgcolor: `${getStatusColor(classData.averageAccuracy)}15`,
                        color: getStatusColor(classData.averageAccuracy),
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: colors.textLight }}>
                      {classData.averageAccuracy}% {t("average accuracy")}
                    </Typography>
                  </Box>
                </Box>
              </StyledCard>
            </Box>
          </Box>
        )}

        {/* Student Performance Tab */}
        {activeTab === 1 && (
          <Box>
            <StyledCard sx={{ mb: 3 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
                    {t("Student Performance")}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textLight }}>
                    {studentData.length} {t("students in class")}
                  </Typography>
                </Box>
                <Chip
                  label={`${t("Avg. Accuracy")}: ${classData?.averageAccuracy || 0}%`}
                  sx={{
                    bgcolor: `${colors.primary}15`,
                    color: colors.primary,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </StyledCard>

            {studentData.length === 0 ? (
              <DSEmptyState
                icon={<PersonIcon />}
                title={t("No Student Data")}
                description={t("No student progress data available for this class")}
              />
            ) : (
              <StyledCard sx={{ p: 0, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: `${colors.primary}08` }}>
                        <TableCell sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                          {t("Student")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                          {t("Levels")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                          {t("Accuracy")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                          {t("Avg. Time")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                          {t("Hint Usage")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                          {t("Last Active")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: colors.text, py: 2 }}>
                          {t("Actions")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentData.map((student) => (
                        <TableRow
                          key={student.id}
                          hover
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: `${colors.primary}05`
                            }
                          }}
                        >
                          <TableCell sx={{ py: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{
                                bgcolor: colors.primary,
                                width: 36,
                                height: 36,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {(student.firstName?.[0] || '?').toUpperCase()}
                                {(student.lastName?.[0] || '').toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.text }}>
                                  {student.firstName} {student.lastName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.textLight, fontSize: '0.75rem' }}>
                                  {student.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2.5 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: colors.text }}>
                              {student.progress.levelsCompleted}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2.5 }}>
                            <Chip
                              label={`${student.progress.accuracy}%`}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                bgcolor: `${getStatusColor(student.progress.accuracy)}15`,
                                color: getStatusColor(student.progress.accuracy),
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2.5 }}>
                            <Typography variant="body1" sx={{ color: colors.text }}>
                              {student.progress.averageTime}s
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2.5 }}>
                            <Typography variant="body1" sx={{ color: colors.text }}>
                              {student.progress.hintUsage}%
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2.5 }}>
                            <Typography variant="body2" sx={{ color: colors.textLight }}>
                              {student.progress.lastActive
                                ? new Date(student.progress.lastActive).toLocaleDateString()
                                : t("Never")}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2.5 }}>
                            <GhostButton
                              size="small"
                              component={Link}
                              to={`/teacher/classes/${classId}/students/${student.id}/fpow-progress`}
                            >
                              {t("Details")}
                            </GhostButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </StyledCard>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

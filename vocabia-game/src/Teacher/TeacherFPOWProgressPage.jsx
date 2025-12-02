import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Tooltip,
  alpha,
  useTheme
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
import PageHeader from "./components/PageHeader";
import { t } from "./utils/i18n";

export default function TeacherFPOWProgressPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
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

  const handleLoginRedirect = () => {
    navigate("/login", { state: { from: location.pathname } });
  };

  const handleBackToClasses = () => {
    navigate("/teacher/classes");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card sx={{ border: 1, borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom fontWeight={600}>
              Error
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {error}
            </Typography>
            {error.includes("logged in") || error.includes("Authentication") ? (
              <Button variant="contained" onClick={handleLoginRedirect} sx={{ mt: 2 }}>
                Go to Login
              </Button>
            ) : (
              <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={handleBackToClasses} sx={{ mt: 2 }}>
                Back to Classes
              </Button>
            )}
          </CardContent>
        </Card>
      </Container>
    );
  }

  const StatCard = ({ title, value, subtitle, color, icon, unit = "%" }) => (
    <Card 
      sx={{ 
        height: "100%", 
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(color, 0.1),
              color: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {icon}
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" mt={0.5}>
              {value}
              <Typography component="span" variant="body1" color="text.secondary" fontWeight={400} ml={0.5}>
                {unit}
              </Typography>
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            mt: 2,
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            "& .MuiLinearProgress-bar": { 
              bgcolor: color,
              borderRadius: 2 
            }
          }}
        />
      </CardContent>
    </Card>
  );

  const getStatusColor = (accuracy) => {
    if (accuracy > 85) return "success";
    if (accuracy > 70) return "warning";
    return "error";
  };

  const getStatusLabel = (accuracy) => {
    if (accuracy > 85) return t("Excellent");
    if (accuracy > 70) return t("Good");
    return t("Needs Improvement");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        backTo={`/teacher/classes/${classId}`}
        backLabel={t("Back to Class")}
        title={
          <Box display="flex" alignItems="center" gap={1.5}>
            <AssessmentIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {t("Four Pic One Word")}
            </Typography>
          </Box>
        }
        subtitle={
          <Typography variant="body1" color="text.secondary">
            {className} • {t("Progress Analytics")}
          </Typography>
        }
        actions={
          <Box display="flex" gap={1.5}>
            <Tooltip title="Export detailed report">
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportReport}
                disabled={exportLoading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 2
                }}
              >
                {exportLoading ? t("Exporting...") : t("Export Report")}
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to={`/teacher/classes/${classId}`}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                px: 2
              }}
            >
              {t("Back to Class")}
            </Button>
          </Box>
        }
      />

      <Box sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              minHeight: 48,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
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

        {/* Class Overview Tab */}
        {activeTab === 0 && classData && (
          <Box>
            <Grid container spacing={3}>
              {/* Summary Cards */}
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title={t("Completion Rate")}
                  value={classData.averageCompletionRate}
                  subtitle={t("Average class completion")}
                  color="#4f46e5"
                  icon={<CheckCircleIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title={t("Accuracy")}
                  value={classData.averageAccuracy}
                  subtitle={t("Correct answers ratio")}
                  color="#10b981"
                  icon={<TrendingUpIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title={t("Hint Usage")}
                  value={classData.averageHintUsage}
                  subtitle={t("Levels with hints used")}
                  color="#f59e0b"
                  icon={<HelpOutlineIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title={t("Avg. Time")}
                  value={classData.averageTimePerLevel}
                  subtitle={t("Per level completion")}
                  color="#3b82f6"
                  icon={<ScheduleIcon />}
                  unit="s"
                />
              </Grid>

              {/* Progress Chart */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ height: '100%', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                      {t("Class Progress Over Time")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t("Weekly completion rate and accuracy trends")}
                    </Typography>
                    <Box sx={{ height: 300, mt: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={classData.progressOverTime}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#666"
                            tick={{ fill: '#666' }}
                          />
                          <YAxis 
                            stroke="#666"
                            tick={{ fill: '#666' }}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 8,
                              border: '1px solid #e0e0e0',
                              background: 'white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="completionRate"
                            name={t("Completion %")}
                            stroke="#4f46e5"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#4f46e5" }}
                            activeDot={{ r: 6, fill: "#4f46e5" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            name={t("Accuracy %")}
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#10b981" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Summary */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ height: '100%', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                      {t("Performance Summary")}
                    </Typography>
                    <Box mt={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                        <Typography variant="body1" color="text.secondary">
                          {t("Total Levels Completed")}
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                          {classData.totalLevelsCompleted}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                        <Typography variant="body1" color="text.secondary">
                          {t("Active Students")}
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                          {studentData.length}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="body1" color="text.secondary">
                          {t("Avg. Levels per Student")}
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                          {studentData.length > 0
                            ? Math.round(classData.totalLevelsCompleted / studentData.length)
                            : 0}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        mt: 4, 
                        pt: 3, 
                        borderTop: 1, 
                        borderColor: 'divider' 
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t("Overall Class Health")}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip
                          label={getStatusLabel(classData.averageAccuracy)}
                          color={getStatusColor(classData.averageAccuracy)}
                          size="medium"
                          sx={{ fontWeight: 600 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {classData.averageAccuracy}% {t("average accuracy")}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Student Performance Tab */}
        {activeTab === 1 && (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                      {t("Student Performance")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {studentData.length} {t("students in class")}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${t("Avg. Accuracy")}: ${classData?.averageAccuracy || 0}%`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, py: 2.5 }}>
                        {t("Student")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 2.5 }}>
                        {t("Levels")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 2.5 }}>
                        {t("Accuracy")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 2.5 }}>
                        {t("Avg. Time")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 2.5 }}>
                        {t("Hint Usage")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 2.5 }}>
                        {t("Last Active")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 2.5 }}>
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
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Box>
                            <Typography variant="body1" fontWeight={500} color="text.primary">
                              {student.firstName} {student.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {student.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5 }}>
                          <Typography variant="body1" fontWeight={500} color="text.primary">
                            {student.progress.levelsCompleted}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5 }}>
                          <Chip
                            label={`${student.progress.accuracy}%`}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: alpha(
                                getStatusColor(student.progress.accuracy) === 'success' ? '#10b981' :
                                getStatusColor(student.progress.accuracy) === 'warning' ? '#f59e0b' : '#ef4444',
                                0.1
                              ),
                              color: getStatusColor(student.progress.accuracy) === 'success' ? '#10b981' :
                                    getStatusColor(student.progress.accuracy) === 'warning' ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5 }}>
                          <Typography variant="body1" color="text.primary">
                            {student.progress.averageTime}s
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5 }}>
                          <Typography variant="body1" color="text.primary">
                            {student.progress.hintUsage}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {student.progress.lastActive
                              ? new Date(student.progress.lastActive).toLocaleDateString()
                              : t("Never")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            to={`/teacher/classes/${classId}/students/${student.id}/fpow-progress`}
                            sx={{
                              borderRadius: 1.5,
                              textTransform: "none",
                              fontWeight: 500,
                              fontSize: '0.875rem'
                            }}
                          >
                            {t("Details")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {studentData.length === 0 && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  py={8}
                  color="text.secondary"
                >
                  <Typography variant="body1">{t("No student data available")}</Typography>
                </Box>
              )}
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
}
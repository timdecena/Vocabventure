import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
  Container
} from "@mui/material";
import {
  Add as AddIcon,
  School as ClassIcon,
  
} from "@mui/icons-material";
import api from "../api/api";
import PageHeader from "./components/PageHeader";
import { t } from "./utils/i18n";

export default function TeacherCreateClassPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('Class name is required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/api/teacher/classes", { name, description });
      navigate("/teacher/classes", { state: { justCreated: true } });
    } catch (err) {
      console.error("Failed to create class:", err);
      setError(err.response?.data?.message || t('Failed to create class'));
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box>
        {/* Header */}
        <PageHeader
          backTo="/teacher/classes"
          backLabel={t('Back to Classes')}
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ClassIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              {t('Create New Class')}
            </Box>
          }
        />

        {/* Form Card */}
        <Card elevation={0} sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          backgroundColor: "background.paper"
        }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ClassIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('Class Information')}</Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label={t('Class Name *')}
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  sx={{ maxWidth: 500 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label={t('Description')}
                  variant="outlined"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={4}
                  sx={{ maxWidth: 500 }}
                  InputLabelProps={{ shrink: true }}
                  placeholder={t('Optional description for your class')}
                />
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "flex-end", 
                  gap: 2,
                  pt: 2
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/teacher/classes")}
                    disabled={loading}
                    sx={{ minWidth: 120 }}
                  >
                    {t('Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                    disabled={loading || !name.trim()}
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? t('Creating...') : t('Create Class')}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Paper elevation={0} sx={{ mt: 3, p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, backgroundColor: "background.paper" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {t('Class Preview')}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ClassIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {name || t('New Class')}
              </Typography>
              <Typography color="text.secondary">
                {description || t('Class description will appear here')}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Removed confusing Edit modal to keep create flow simple */}
      </Box>
    </Container>
  );
}
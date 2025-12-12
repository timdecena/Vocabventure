import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  School as ClassIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import api from "../api/api";
import { t } from "./utils/i18n";
import {
  colors,
  StyledCard,
  PageTitle,
  PrimaryButton,
  GhostButton,
  StyledInput,
  SectionHeader,
} from "./components/DesignSystem";

export default function TeacherCreateClassPage() {
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

  const nameValid = name.trim().length > 0;
  const nameCharCount = name.length;
  const descCharCount = description.length;

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 4, pt: 2 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <PageTitle icon={<ClassIcon sx={{ fontSize: 32 }} />}>
          {t('Create New Class')}
        </PageTitle>
        <Typography 
          variant="body1" 
          sx={{ 
            color: colors.textLight, 
            mb: 4,
            fontSize: '1rem',
            fontWeight: 400
          }}
        >
          {t('Set up a new classroom for your students to join')}
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '0.95rem' }
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Form Card */}
        <StyledCard sx={{ mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <SectionHeader sx={{ mb: 3 }}>{t('Class Information')}</SectionHeader>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Class Name Field */}
              <Box>
                <StyledInput
                  label={t('Class Name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t('e.g., Math 101, English Literature')}
                  helperText={`${nameCharCount}/50 characters`}
                  inputProps={{ maxLength: 50 }}
                />
                {nameValid && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <CheckIcon sx={{ fontSize: 16, color: colors.success }} />
                    <Typography variant="caption" sx={{ color: colors.success, fontWeight: 500 }}>
                      {t('Class name looks good')}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Description Field */}
              <Box>
                <StyledInput
                  label={t('Description')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={4}
                  placeholder={t('Optional: Add a description to help students understand what this class is about...')}
                  helperText={`${descCharCount}/200 characters`}
                  inputProps={{ maxLength: 200 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 4, opacity: 0.3 }} />

            {/* Action Buttons */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <GhostButton
                onClick={() => navigate("/teacher/classes")}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {t('Cancel')}
              </GhostButton>
              <PrimaryButton
                type="submit"
                disabled={loading || !name.trim()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ClassIcon />}
                sx={{ minWidth: 160 }}
              >
                {loading ? t('Creating...') : t('Create Class')}
              </PrimaryButton>
            </Box>
          </form>
        </StyledCard>

        {/* Live Preview Section */}
        <StyledCard>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ClassIcon sx={{ color: colors.primary, fontSize: 24, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
              {t('Class Preview')}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3, opacity: 0.3 }} />
          <Box sx={{ 
            p: 3, 
            bgcolor: colors.primary + '08', 
            borderRadius: 2,
            border: `1px solid ${colors.primary}20`,
            transition: 'all 0.3s ease'
          }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ClassIcon sx={{ color: '#FFFFFF', fontSize: 32 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: colors.text,
                    mb: 0.5,
                    wordBreak: 'break-word'
                  }}
                >
                  {name || t('New Class')}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: description ? colors.text : colors.textLight,
                    fontStyle: description ? 'normal' : 'italic',
                    wordBreak: 'break-word'
                  }}
                >
                  {description || t('Class description will appear here')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </StyledCard>
      </Box>
    </Box>
  );
}
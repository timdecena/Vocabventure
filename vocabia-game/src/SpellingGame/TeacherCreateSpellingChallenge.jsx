import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  LinearProgress,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Class as ClassIcon,
  VolumeUp as VolumeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import api from "../api/api";
import { t } from "../Teacher/utils/i18n";
import {
  colors,
  StyledCard,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  StyledInput,
  SectionHeader,
  EmptyState,
} from "../Teacher/components/DesignSystem";

export default function TeacherCreateSpellingLevel() {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [title, setTitle] = useState("");
  const [words, setWords] = useState([]);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const mediaRecordersRef = useRef({}); // Store MediaRecorder per word index
  const streamsRef = useRef({}); // Store streams per word index for cleanup

  useEffect(() => {
    api.get("/api/teacher/classes")
      .then((res) => setClassrooms(res.data))
      .catch(() => setMessage({ text: t("Failed to load classrooms"), severity: "error" }));
  }, []);

  const handleWordChange = (index, field, value) => {
    const updated = [...words];
    updated[index][field] = value;
    setWords(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...words];
    updated[index] = { 
      ...updated[index],
      file,
      audioBlob: null,
      audioUrl: null,
      recordingBlob: null,
      recordingUrl: null
    };
    setWords(updated);
  };

  const startRecording = async (index) => {
    try {
      // Stop any existing recording for this word
      if (mediaRecordersRef.current[index] && mediaRecordersRef.current[index].state !== 'inactive') {
        mediaRecordersRef.current[index].stop();
      }
      
      // Clean up any existing stream for this word
      if (streamsRef.current[index]) {
        streamsRef.current[index].getTracks().forEach(track => track.stop());
        delete streamsRef.current[index];
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Store stream for cleanup
      streamsRef.current[index] = stream;

      // Determine MIME type based on browser support
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      const mr = new MediaRecorder(stream, { mimeType });
      let chunks = [];
      
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(blob);
        const updated = [...words];
        updated[index] = {
          ...updated[index],
          isRecording: false,
          recordingBlob: blob,
          recordingUrl: audioUrl
        };
        setWords(updated);
        
        // Clean up stream
        if (streamsRef.current[index]) {
          streamsRef.current[index].getTracks().forEach(track => track.stop());
          delete streamsRef.current[index];
        }
        delete mediaRecordersRef.current[index];
      };

      mr.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setMessage({ text: t("Recording error occurred"), severity: "error" });
        const updated = [...words];
        updated[index] = {
          ...updated[index],
          isRecording: false
        };
        setWords(updated);
        
        // Clean up on error
        if (streamsRef.current[index]) {
          streamsRef.current[index].getTracks().forEach(track => track.stop());
          delete streamsRef.current[index];
        }
        delete mediaRecordersRef.current[index];
      };
      
      // Start recording
      mr.start(100); // Collect data every 100ms
      
      // Update word state
      const updated = [...words];
      updated[index] = {
        ...updated[index],
        isRecording: true,
        file: null,
        recordingBlob: null,
        recordingUrl: null,
        audioBlob: null,
        audioUrl: null
      };
      setWords(updated);
      
      // Store MediaRecorder
      mediaRecordersRef.current[index] = mr;
      
    } catch (err) {
      console.error('Recording error:', err);
      let errorMessage = t("Microphone access denied");
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = t("Please allow microphone access to record audio");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = t("No microphone found. Please connect a microphone.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = t("Microphone is already in use by another application");
      } else {
        errorMessage = t("Failed to start recording: ") + err.message;
      }
      setMessage({ text: errorMessage, severity: "error" });
      
      // Update word state to remove recording flag
      const updated = [...words];
      updated[index] = {
        ...updated[index],
        isRecording: false
      };
      setWords(updated);
    }
  };

  const stopRecording = (index) => {
    if (mediaRecordersRef.current[index]) {
      const mr = mediaRecordersRef.current[index];
      if (mr.state === 'recording') {
        mr.stop();
      }
    }
  };

  const handleUseRecording = (index) => {
    const updated = [...words];
    if (updated[index].recordingBlob && updated[index].recordingUrl) {
      updated[index] = {
        ...updated[index],
        audioBlob: updated[index].recordingBlob,
        audioUrl: updated[index].recordingUrl,
        recordingBlob: null,
        recordingUrl: null,
        isRecording: false
      };
      setWords(updated);
    }
  };

  // Cleanup function to stop all recordings when component unmounts
  useEffect(() => {
    return () => {
      // Stop all active recordings
      Object.keys(mediaRecordersRef.current).forEach(index => {
        const mr = mediaRecordersRef.current[index];
        if (mr && mr.state !== 'inactive') {
          mr.stop();
        }
      });
      
      // Stop all streams
      Object.keys(streamsRef.current).forEach(index => {
        const stream = streamsRef.current[index];
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      });
    };
  }, []);

  const removeWordRow = (index) => {
    const updated = [...words];
    updated.splice(index, 1);
    setWords(updated);
  };

  const addWordRow = () => {
    setWords([
      ...words,
      {
        word: "",
        definition: "",
        sentence: "",
        file: null,
        audioBlob: null,
        audioUrl: null,
        isRecording: false,
        recordingBlob: null,
        recordingUrl: null
      }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage({ text: t("Please complete all fields and ensure every word has audio"), severity: "error" });
      return;
    }
    
    setIsSubmitting(true);
    try {
  const uploads = await Promise.all(
    words.map(async (word) => {
      let audioUrl = "";

      if (word.file) {
        const formData = new FormData();
        // always include a filename
        formData.append("file", word.file, word.file.name || "upload.mp3");

        const res = await api.post("/api/teacher/spelling/upload-audio", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        audioUrl = res.data.url;

      } else if (word.audioBlob) {
        const formData = new FormData();
        // always include a filename for blob
        formData.append("file", word.audioBlob, "recording.webm");

        const res = await api.post("/api/teacher/spelling/upload-audio", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        audioUrl = res.data.url;
      }

      return { ...word, audioUrl };
    })
    );

    await api.post("/api/spelling-level/create", {
      title,
      classroomId: Number(classroomId),   // ✅ force numeric
      maxAttempts: Number(maxAttempts),   // ✅ ensure numeric
      words: uploads.map((w) => ({
        word: w.word,
        definition: w.definition,
        sentence: w.sentence,
        audioUrl: w.audioUrl
      }))
    });

      setMessage({ text: t("Level created successfully!"), severity: "success" });
      setWords([]);
      setTitle("");
      setClassroomId("");
    } catch (err) {
      setMessage({ text: t("Failed to create level"), severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = () => {
    if (!title.trim() || !classroomId) return false;
    if (words.length === 0) return false;
    return words.every(word => (
      word.word.trim() && 
      word.definition.trim() && 
      word.sentence.trim() && 
      (word.file || word.audioBlob)
    ));
  };

  const completedWords = words.filter(w => 
    w.word.trim() && w.definition.trim() && w.sentence.trim() && (w.file || w.audioBlob)
  ).length;
  const completionPercentage = words.length > 0 ? (completedWords / words.length) * 100 : 0;
  const isWordComplete = (word) => 
    word.word.trim() && word.definition.trim() && word.sentence.trim() && (word.file || word.audioBlob);

  return (
    <Box sx={{ bgcolor: colors.mainBg, minHeight: '100vh', pb: 4, pt: 2 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <PageTitle icon={<ClassIcon sx={{ fontSize: 32 }} />}>
          {t('Create Spelling Challenge')}
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
          {t('Build a spelling challenge with words, definitions, and audio pronunciations')}
        </Typography>

        {/* Message Alert */}
        {message.text && (
          <Alert 
            severity={message.severity} 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '0.95rem' }
            }}
            onClose={() => setMessage({ text: '', severity: 'info' })}
          >
            {message.text}
          </Alert>
        )}

        {/* Main Form Card */}
        <StyledCard sx={{ mb: 3 }}>
          <SectionHeader sx={{ mb: 3 }}>{t('Challenge Information')}</SectionHeader>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledInput
                label={t('Level Title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder={t('e.g., Week 1 Vocabulary, Animal Names')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label={t('Select Classroom')}
                value={classroomId}
                onChange={(e) => setClassroomId(Number(e.target.value))}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: colors.cardBg,
                    '& fieldset': { 
                      borderColor: colors.border, 
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { 
                      borderColor: colors.primary, 
                      borderWidth: '2px',
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>{t('Select Classroom')}</MenuItem>
                {classrooms.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledInput
                type="number"
                label={t('Maximum Attempts')}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                required
                inputProps={{ min: 1 }}
                helperText={t('Number of times students can attempt each word')}
              />
            </Grid>
          </Grid>
        </StyledCard>

        {/* Words Section */}
        <StyledCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <SectionHeader sx={{ mb: 0 }}>
              {t('Words')} 
              <Badge 
                badgeContent={words.length} 
                color="primary" 
                sx={{ ml: 1.5, '& .MuiBadge-badge': { fontSize: '0.75rem', height: 20, minWidth: 20 } }}
              />
            </SectionHeader>
            {words.length > 0 && (
              <Chip
                label={`${completedWords}/${words.length} ${t('complete')}`}
                sx={{
                  bgcolor: completionPercentage === 100 ? colors.success + '20' : colors.warning + '20',
                  color: completionPercentage === 100 ? colors.success : colors.warning,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          {/* Progress Bar */}
          {words.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: colors.border,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: completionPercentage === 100 ? colors.success : colors.primary,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          )}

          <Divider sx={{ mb: 3, opacity: 0.3 }} />

          {/* Words List */}
          {words.length === 0 ? (
            <EmptyState
              icon={<AddIcon sx={{ fontSize: 64 }} />}
              title={t('No words added yet')}
              description={t("Click 'Add Word' below to start building your spelling list")}
              action={
                <PrimaryButton
                  startIcon={<AddIcon />}
                  onClick={addWordRow}
                >
                  {t('Add Your First Word')}
                </PrimaryButton>
              }
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {words.map((word, index) => {
                const complete = isWordComplete(word);
                return (
                  <StyledCard
                    key={index}
                    sx={{
                      border: `2px solid ${complete ? colors.success + '40' : colors.border}`,
                      bgcolor: complete ? colors.success + '05' : colors.cardBg,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Badge
                          badgeContent={index + 1}
                          color="primary"
                          sx={{
                            '& .MuiBadge-badge': {
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                            },
                          }}
                        >
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: complete ? colors.success : colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {complete ? (
                              <CheckCircleIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
                            ) : (
                              <WarningIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
                            )}
                          </Box>
                        </Badge>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                          {t('Word')} {index + 1}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => removeWordRow(index)}
                        sx={{
                          color: colors.error,
                          '&:hover': { bgcolor: colors.error + '15' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12}>
                        <StyledInput
                          label={t('Word')}
                          value={word.word}
                          onChange={(e) => handleWordChange(index, "word", e.target.value)}
                          required
                          placeholder={t('Enter the word to spell')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledInput
                          label={t('Definition')}
                          value={word.definition}
                          onChange={(e) => handleWordChange(index, "definition", e.target.value)}
                          required
                          multiline
                          rows={2}
                          placeholder={t('What does this word mean?')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledInput
                          label={t('Sentence')}
                          value={word.sentence}
                          onChange={(e) => handleWordChange(index, "sentence", e.target.value)}
                          required
                          multiline
                          rows={2}
                          placeholder={t('Use the word in a sentence')}
                        />
                      </Grid>
                    </Grid>

                    {/* Audio Section */}
                    <Box sx={{
                      p: 2,
                      bgcolor: colors.primary + '08',
                      borderRadius: 2,
                      border: `1px solid ${colors.primary}20`,
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: colors.text }}>
                        {t('Audio Pronunciation')}
                      </Typography>
                      
                      {!word.audioUrl && !word.audioBlob && (
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                          <SecondaryButton
                            component="label"
                            startIcon={<UploadIcon />}
                            sx={{ minWidth: 140 }}
                            disabled={word.isRecording}
                          >
                            {t('Upload MP3')}
                            <input
                              type="file"
                              accept=".mp3,audio/mp3,audio/mpeg,audio/*"
                              hidden
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileChange(index, e.target.files[0]);
                                }
                              }}
                            />
                          </SecondaryButton>
                          <SecondaryButton
                            startIcon={word.isRecording ? <StopIcon /> : <MicIcon />}
                            onClick={() => {
                              if (word.isRecording) {
                                stopRecording(index);
                              } else {
                                startRecording(index);
                              }
                            }}
                            color={word.isRecording ? "error" : "primary"}
                            sx={{ minWidth: 140 }}
                          >
                            {word.isRecording ? t('Stop Recording') : t('Record Audio')}
                          </SecondaryButton>
                          {word.isRecording && (
                            <Chip
                              label={t('Recording...')}
                              color="error"
                              size="small"
                              sx={{
                                animation: 'pulse 1.5s ease-in-out infinite',
                                '@keyframes pulse': {
                                  '0%, 100%': { opacity: 1 },
                                  '50%': { opacity: 0.5 }
                                }
                              }}
                            />
                          )}
                        </Box>
                      )}

                      {word.file && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                          <Chip
                            icon={<VolumeIcon />}
                            label={word.file.name}
                            onDelete={() => handleWordChange(index, "file", null)}
                            sx={{
                              bgcolor: colors.primary + '20',
                              color: colors.primary,
                              fontWeight: 600,
                            }}
                          />
                          <audio controls src={URL.createObjectURL(word.file)} style={{ flex: 1, maxWidth: 300 }} />
                        </Box>
                      )}

                      {word.recordingUrl && !word.isRecording && (
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                              {t('Recording Preview')}:
                            </Typography>
                            <audio 
                              controls 
                              src={word.recordingUrl} 
                              style={{ flex: 1, minWidth: 200, maxWidth: 400 }} 
                            />
                          </Box>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap' }}>
                            <PrimaryButton
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleUseRecording(index)}
                            >
                              {t('Use This Recording')}
                            </PrimaryButton>
                            <GhostButton
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => {
                                // Clean up the recording URL
                                if (word.recordingUrl) {
                                  URL.revokeObjectURL(word.recordingUrl);
                                }
                                const updated = [...words];
                                updated[index] = {
                                  ...updated[index],
                                  recordingBlob: null,
                                  recordingUrl: null,
                                  isRecording: false
                                };
                                setWords(updated);
                              }}
                            >
                              {t('Discard')}
                            </GhostButton>
                            <GhostButton
                              size="small"
                              startIcon={<MicIcon />}
                              onClick={() => startRecording(index)}
                            >
                              {t('Record Again')}
                            </GhostButton>
                          </Box>
                        </Box>
                      )}

                      {word.audioUrl && !word.file && !word.isRecording && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<VolumeIcon />}
                            label={t('Recording')}
                            onDelete={() => {
                              // Clean up the audio URL
                              if (word.audioUrl && word.audioUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(word.audioUrl);
                              }
                              const updated = [...words];
                              updated[index] = {
                                ...updated[index],
                                audioBlob: null,
                                audioUrl: null
                              };
                              setWords(updated);
                            }}
                            sx={{
                              bgcolor: colors.secondary + '20',
                              color: colors.secondary,
                              fontWeight: 600,
                            }}
                          />
                          <audio 
                            controls 
                            src={word.audioUrl} 
                            style={{ flex: 1, minWidth: 200, maxWidth: 400 }} 
                          />
                        </Box>
                      )}
                    </Box>
                  </StyledCard>
                );
              })}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 3, borderTop: `1px solid ${colors.border}`, flexWrap: 'wrap' }}>
            <SecondaryButton
              startIcon={<AddIcon />}
              onClick={addWordRow}
            >
              {t('Add Word')}
            </SecondaryButton>
            <Box sx={{ flex: 1 }} />
            <PrimaryButton
              onClick={handleSubmit}
              disabled={!validate() || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
              sx={{ minWidth: 180 }}
            >
              {isSubmitting ? t('Creating...') : t('Create Spelling Challenge')}
            </PrimaryButton>
          </Box>
        </StyledCard>
      </Box>
    </Box>
  );
}
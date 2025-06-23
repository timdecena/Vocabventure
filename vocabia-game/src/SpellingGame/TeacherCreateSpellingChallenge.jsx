import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  List,
  ListItem
} from "@mui/material";
import {
  Add as AddIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Class as ClassIcon
} from "@mui/icons-material";
import api from "../api/api";

export default function TeacherCreateSpellingLevel() {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [title, setTitle] = useState("");
  const [words, setWords] = useState([]);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [recordingIndex, setRecordingIndex] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get("/api/teacher/classes")
      .then((res) => setClassrooms(res.data))
      .catch(() => setMessage({ text: "Failed to load classrooms", severity: "error" }));
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      let chunks = [];
      
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        const updated = [...words];
        updated[index] = {
          ...updated[index],
          isRecording: false,
          recordingBlob: blob,
          recordingUrl: audioUrl
        };
        setWords(updated);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mr.start();
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
      setRecordingIndex(index);
      setMediaRecorder(mr);
    } catch (err) {
      setMessage({ text: "Microphone access denied", severity: "error" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setRecordingIndex(null);
    }
  };

  const handleUseRecording = (index) => {
    const updated = [...words];
    updated[index] = {
      ...updated[index],
      audioBlob: updated[index].recordingBlob,
      audioUrl: updated[index].recordingUrl,
      recordingBlob: null,
      recordingUrl: null
    };
    setWords(updated);
  };

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
      setMessage({ text: "Please complete all fields and ensure every word has audio", severity: "error" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const uploads = await Promise.all(words.map(async (word) => {
        let audioUrl = "";
        if (word.file) {
          const formData = new FormData();
          formData.append("file", word.file);
          const res = await api.post("/api/teacher/spelling/upload-audio", formData);
          audioUrl = res.data.url;
        } else if (word.audioBlob) {
          const formData = new FormData();
          formData.append("file", word.audioBlob, "recording.webm");
          const res = await api.post("/api/teacher/spelling/upload-audio", formData);
          audioUrl = res.data.url;
        }
        return { ...word, audioUrl };
      }));

      await api.post("/api/spelling-level/create", {
        title,
        classroomId,
        words: uploads.map(({ word, definition, sentence, audioUrl }) => ({
          word, definition, sentence, audioUrl
        }))
      });

      setMessage({ text: "Level created successfully!", severity: "success" });
      setWords([]);
      setTitle("");
      setClassroomId("");
    } catch (err) {
      setMessage({ text: "Failed to create level", severity: "error" });
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

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", p: 0.5 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <ClassIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Create Spelling Challenge
            </Typography>
          </Box>

          {message.text && (
            <Alert severity={message.severity} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Level Title"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                fullWidth
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                displayEmpty
                required
              >
                <MenuItem value="" disabled>Select Classroom</MenuItem>
                {classrooms.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Words ({words.length})
          </Typography>

          <Paper sx={{ maxHeight: 500, overflow: "auto", p: 2, mb: 2 }}>
            {words.length === 0 ? (
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography color="text.secondary">
                  No words added yet
                </Typography>
              </Box>
            ) : (
              <List>
                {words.map((word, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      mb: 2,
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      flexDirection: "column",
                      alignItems: "flex-start"
                    }}
                  >
                    <Box sx={{ width: "100%", mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Word {index + 1}
                        </Typography>
                        <IconButton onClick={() => removeWordRow(index)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Box>
                      
                      <TextField
                        fullWidth
                        label="Word"
                        value={word.word}
                        onChange={(e) => handleWordChange(index, "word", e.target.value)}
                        required
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Definition"
                        value={word.definition}
                        onChange={(e) => handleWordChange(index, "definition", e.target.value)}
                        required
                        multiline
                        rows={2}
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Sentence"
                        value={word.sentence}
                        onChange={(e) => handleWordChange(index, "sentence", e.target.value)}
                        required
                        multiline
                        rows={2}
                        sx={{ mb: 2 }}
                      />
                    </Box>

                    <Box sx={{ width: "100%" }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Audio
                      </Typography>
                      
                      {/* Upload option */}
                      {!word.audioUrl && !word.isRecording && (
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<UploadIcon />}
                          sx={{ mr: 2, mb: 2 }}
                        >
                          Upload MP3
                          <input
                            type="file"
                            accept=".mp3,audio/mp3,audio/mpeg"
                            hidden
                            onChange={(e) => handleFileChange(index, e.target.files[0])}
                          />
                        </Button>
                      )}

                      {/* Record option */}
                      {!word.audioUrl && !word.file && (
                        <Button
                          variant="outlined"
                          startIcon={word.isRecording ? <StopIcon /> : <MicIcon />}
                          onClick={() => word.isRecording ? stopRecording() : startRecording(index)}
                          color={word.isRecording ? "error" : "primary"}
                          sx={{ mb: 2 }}
                        >
                          {word.isRecording ? "Stop Recording" : "Record"}
                        </Button>
                      )}

                      {/* Audio previews */}
                      {word.file && (
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <Chip
                            label={word.file.name}
                            onDelete={() => handleWordChange(index, "file", null)}
                            sx={{ mr: 2 }}
                          />
                          <audio controls src={URL.createObjectURL(word.file)} />
                        </Box>
                      )}

                      {word.recordingUrl && (
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Typography variant="body2">Recording Preview:</Typography>
                            <audio controls src={word.recordingUrl} />
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleUseRecording(index)}
                            >
                              Use This
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => handleWordChange(index, "recordingUrl", null)}
                            >
                              Discard
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {word.audioUrl && !word.file && (
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <Chip
                            label="Recording"
                            onDelete={() => handleWordChange(index, "audioUrl", null)}
                            sx={{ mr: 2 }}
                          />
                          <audio controls src={word.audioUrl} />
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addWordRow}
            sx={{ mr: 2 }}
          >
            Add Word
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!validate() || isSubmitting}
            sx={{ mt: 2 }}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Creating..." : "Create Level"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
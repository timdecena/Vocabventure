import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function TeacherCreateSpellingLevel() {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [title, setTitle] = useState("");
  const [words, setWords] = useState([]);
  const [message, setMessage] = useState("");
  const [recordingIndex, setRecordingIndex] = useState(null); // Which word is being recorded
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    api.get("/teacher/classes").then((res) => setClassrooms(res.data));
  }, []);

  // --- Word field changes ---
  const handleWordChange = (index, field, value) => {
    const updated = [...words];
    updated[index][field] = value;
    setWords(updated);
  };

  // --- File upload handling ---
  const handleFileChange = (index, file) => {
    const updated = [...words];
    updated[index].file = file;
    // Remove any existing recordings if uploading a file
    updated[index].audioBlob = null;
    updated[index].audioUrl = null;
    updated[index].recordingBlob = null;
    updated[index].recordingUrl = null;
    setWords(updated);
  };

  // --- Remove file ---
  const handleRemoveFile = (index) => {
    const updated = [...words];
    updated[index].file = null;
    setWords(updated);
  };

  // --- Recording ---
  const startRecording = async (index) => {
    if (!navigator.mediaDevices) {
      alert("Audio recording not supported in this browser");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new window.MediaRecorder(stream);
    let chunks = [];
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(blob);
      const updated = [...words];
      updated[index].isRecording = false;
      updated[index].recordingBlob = blob;      // TEMP: preview before accept
      updated[index].recordingUrl = audioUrl;
      setWords(updated);
      stream.getTracks().forEach(track => track.stop());
    };
    mr.start();
    const updated = [...words];
    updated[index].isRecording = true;
    updated[index].recordingBlob = null;
    updated[index].recordingUrl = null;
    updated[index].file = null; // Remove file upload if present
    updated[index].audioBlob = null;
    updated[index].audioUrl = null;
    setWords(updated);
    setRecordingIndex(index);
    setMediaRecorder(mr);
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
    updated[index].audioBlob = updated[index].recordingBlob; // FINAL: submit this
    updated[index].audioUrl = updated[index].recordingUrl;
    updated[index].recordingBlob = null; // clear preview
    updated[index].recordingUrl = null;
    setWords(updated);
  };

  const handleRemoveRecordingPreview = (index) => {
    const updated = [...words];
    updated[index].recordingBlob = null;
    updated[index].recordingUrl = null;
    setWords(updated);
  };

  const handleRemoveRecording = (index) => {
    const updated = [...words];
    updated[index].audioBlob = null;
    updated[index].audioUrl = null;
    setWords(updated);
  };

  // --- Add new word row ---
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

  // --- Upload logic ---
  const uploadAudios = async () => {
    const uploaded = [];
    for (const entry of words) {
      let audioUrl = "";
      if (entry.file) {
        // Prioritize uploaded .mp3 file
        const formData = new FormData();
        formData.append("file", entry.file);
        const res = await api.post("/teacher/spelling/upload-audio", formData);
        audioUrl = res.data.url;
      } else if (entry.audioBlob) {
        // Use accepted recording if no file
        const formData = new FormData();
        formData.append("file", entry.audioBlob, "recorded.webm");
        const res = await api.post("/teacher/spelling/upload-audio", formData);
        audioUrl = res.data.url;
      }
      uploaded.push({ ...entry, audioUrl });
    }
    return uploaded;
  };

  // --- Validation ---
  const validate = () => {
    if (!title.trim() || !classroomId) return false;
    if (words.length === 0) return false;
    for (const entry of words) {
      if (
        !entry.word.trim() ||
        !entry.definition.trim() ||
        !entry.sentence.trim() ||
        (!(entry.file) && !(entry.audioBlob))
      ) return false;
    }
    return true;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage("❌ Please complete all fields and ensure every word has audio.");
      return;
    }
    try {
      const uploadedEntries = await uploadAudios();
      const formattedWords = uploadedEntries.map(({ word, definition, sentence, audioUrl }) => ({
        word, definition, sentence, audioUrl,
      }));

      await api.post("/spelling-level/create", {
        title,
        classroomId,
        words: formattedWords,
      });

      setMessage("✅ Level created successfully!");
      setWords([]);
      setTitle("");
      setClassroomId("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to create level.");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 32 }}>
      <h2>Create Spelling Challenge Level</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Level Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Classroom:</label>
          <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)} required>
            <option value="">-- Select --</option>
            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <br />
        <h4>Words:</h4>
        {words.map((entry, i) => (
          <div key={i} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <input
              placeholder="Word"
              value={entry.word}
              onChange={(e) => handleWordChange(i, "word", e.target.value)}
              required
            /><br />
            <textarea
              placeholder="Definition"
              value={entry.definition}
              onChange={(e) => handleWordChange(i, "definition", e.target.value)}
              required
            /><br />
            <textarea
              placeholder="Sentence"
              value={entry.sentence}
              onChange={(e) => handleWordChange(i, "sentence", e.target.value)}
              required
            /><br />

            {/* AUDIO UI */}
            <div>
              {/* UPLOAD: disabled if recording in progress or a final audio is attached */}
              <input
                type="file"
                accept=".mp3,audio/mp3,audio/mpeg"
                disabled={!!entry.audioUrl || !!entry.isRecording}
                onChange={(e) => handleFileChange(i, e.target.files[0])}
              />
              {entry.file && (
                <div>
                  <strong>Uploaded: </strong> {entry.file.name}
                  <button type="button" onClick={() => handleRemoveFile(i)}>Remove</button>
                  <audio controls src={URL.createObjectURL(entry.file)} />
                </div>
              )}

              {/* RECORD UI: only if no file and no final audio */}
              {!entry.file && !entry.audioUrl && (
                <>
                  {!entry.isRecording && !entry.recordingUrl && (
                    <button type="button" onClick={() => startRecording(i)}>🎤 Record</button>
                  )}
                  {entry.isRecording && recordingIndex === i && (
                    <button type="button" onClick={stopRecording}>⏹️ Stop</button>
                  )}
                  {/* PREVIEW after recording */}
                  {entry.recordingUrl && (
                    <div>
                      <audio controls src={entry.recordingUrl} />
                      <button type="button" onClick={() => handleUseRecording(i)}>Use Recording</button>
                      <button type="button" onClick={() => handleRemoveRecordingPreview(i)}>Discard</button>
                    </div>
                  )}
                </>
              )}

              {/* FINAL: After "Use Recording", show and allow remove */}
              {!entry.file && entry.audioUrl && (
                <div>
                  <audio controls src={entry.audioUrl} />
                  <button type="button" onClick={() => handleRemoveRecording(i)}>Remove</button>
                </div>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={addWordRow}>➕ Add Word</button>
        <br /><br />
        <button type="submit" disabled={!validate()}>✅ Submit Level</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

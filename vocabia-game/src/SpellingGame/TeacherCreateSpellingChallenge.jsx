import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function TeacherCreateSpellingChallenge() {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [sentence, setSentence] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/teacher/classes").then((res) => setClassrooms(res.data));
  }, []);

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const uploadAudio = async () => {
    if (!audioFile) return null;
    const formData = new FormData();
    formData.append("file", audioFile);
    const res = await api.post("/teacher/spelling/upload-audio", formData);
    return res.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadedAudioUrl = await uploadAudio();
      await api.post("/teacher/spelling/create", {
        word,
        definition,
        sentence,
        audioUrl: uploadedAudioUrl,
        classroomId,
      });
      setMessage("✅ Challenge created");
      setWord("");
      setDefinition("");
      setSentence("");
      setAudioFile(null);
      setAudioUrl("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to create challenge");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 32 }}>
      <h2>Create Spelling Challenge</h2>
      <form onSubmit={handleSubmit}>
        <div><label>Word:</label><input type="text" value={word} onChange={(e) => setWord(e.target.value)} required /></div>
        <div><label>Definition:</label><textarea value={definition} onChange={(e) => setDefinition(e.target.value)} required /></div>
        <div><label>Sentence:</label><textarea value={sentence} onChange={(e) => setSentence(e.target.value)} required /></div>
        <div><label>Audio File:</label><input type="file" accept="audio/*" onChange={handleFileChange} required /></div>
        <div>
          <label>Classroom:</label>
          <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)} required>
            <option value="">-- Select --</option>
            {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button type="submit" style={{ marginTop: 16 }}>Submit Challenge</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function TeacherCreateSpellingLevel() {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [title, setTitle] = useState("");
  const [words, setWords] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/teacher/classes").then((res) => setClassrooms(res.data));
  }, []);

  const handleWordChange = (index, field, value) => {
    const updated = [...words];
    updated[index][field] = value;
    setWords(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...words];
    updated[index].file = file;
    setWords(updated);
  };

  const addWordRow = () => {
    setWords([...words, { word: "", definition: "", sentence: "", file: null }]);
  };

  const uploadAudios = async () => {
    const uploaded = [];
    for (const entry of words) {
      if (entry.file) {
        const formData = new FormData();
        formData.append("file", entry.file);
        const res = await api.post("/teacher/spelling/upload-audio", formData);
        uploaded.push({ ...entry, audioUrl: res.data.url });
      }
    }
    return uploaded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadedEntries = await uploadAudios();
      const formattedWords = uploadedEntries.map(({ word, definition, sentence, audioUrl }) => ({
        word, definition, sentence, audioUrl,
      }));

      await api.post("/teacher/spelling/level/create", {
        title,
        classroomId,
        words: formattedWords,
      });

      setMessage("✅ Level created successfully!");
      setWords([]);
      setTitle("");
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
            <input placeholder="Word" value={entry.word} onChange={(e) => handleWordChange(i, "word", e.target.value)} required />
            <br />
            <textarea placeholder="Definition" value={entry.definition} onChange={(e) => handleWordChange(i, "definition", e.target.value)} required />
            <br />
            <textarea placeholder="Sentence" value={entry.sentence} onChange={(e) => handleWordChange(i, "sentence", e.target.value)} required />
            <br />
            <input type="file" accept="audio/*" onChange={(e) => handleFileChange(i, e.target.files[0])} required />
          </div>
        ))}
        <button type="button" onClick={addWordRow}>➕ Add Word</button>
        <br /><br />
        <button type="submit">✅ Submit Level</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

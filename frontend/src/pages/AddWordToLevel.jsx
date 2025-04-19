import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddWordToLevel.css";

const AddWordToLevel = ({ levelId }) => {
  const [word, setWord] = useState("");
  const navigate = useNavigate();

  const handleAdd = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/api/adventure/level/${levelId}/word?word=${word}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error adding word");
      const data = await res.json();
      alert(`Word added: ${data.word}`);
      setWord("");
    } catch (err) {
      alert("Failed to add word.");
    }
  };

  return (
    <div className="add-word-form">
      <h2>Add Word to Level</h2>
      <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Enter a word" />
      <button onClick={handleAdd}>Add Word</button>
    </div>
  );
};

export default AddWordToLevel;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateAdventureLevel.css";

const CreateAdventureLevel = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [monsterName, setMonsterName] = useState("");
  const [monsterHP, setMonsterHP] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");
  const navigate = useNavigate();

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const level = {
      title,
      description,
      monsterName,
      monsterImageUrl: "/images/default.png",
      difficulty,
      monsterHP
    };

    try {
      const res = await fetch("http://localhost:8080/api/adventure/level", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(level)
      });
      if (!res.ok) throw new Error("Failed to create level");
      const data = await res.json();
      alert(`Level created: ${data.title}`);
      navigate("/adventure-levels");
    } catch (err) {
      alert("Error creating level.");
    }
  };

  return (
    <div className="create-level-form">
      <h2>Create Adventure Level</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Level Title" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input value={monsterName} onChange={(e) => setMonsterName(e.target.value)} placeholder="Monster Name" />
      <input
        type="number"
        value={monsterHP}
        onChange={(e) => setMonsterHP(parseInt(e.target.value))}
        placeholder="Monster HP"
      />
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button onClick={handleCreate}>Create Level</button>
    </div>
  );
};

export default CreateAdventureLevel;

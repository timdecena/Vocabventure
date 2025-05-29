import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function JungleLushLevel1() {
  const [levelData, setLevelData] = useState(null);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const levelId = 1;

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const res = await api.get(`/adventure/levels/${levelId}`);
        setLevelData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load level data", err);
        setFeedback("❌ Error loading level.");
      }
    };

    fetchLevel();
  }, []);

  const handleSubmit = async () => {
    if (!levelData) return;

    const correct = selected === levelData.correctAnswer;

    setFeedback(correct ? "✅ Correct! XP earned!" : "❌ Incorrect! Try again.");

    if (correct) {
      try {
        // Save level stats
        await api.post("/adventure/stats/save", {
          levelName: levelData.title,
          score: 100,
          attempts: 1,
        });

        // Save progress
        await api.post("/adventure/level-progress/save", {
          levelName: levelData.title,
          completed: true,
        });

        // Optional redirect or reward screen
        setTimeout(() => navigate("/student/adventure"), 2000);
      } catch (error) {
        console.error("Failed to save progress", error);
      }
    }
  };

  if (loading) return <p style={{ padding: "2rem", color: "#fff" }}>Loading...</p>;

  return (
    <div style={{ padding: "2rem", color: "#fff", backgroundColor: "#111", minHeight: "100vh" }}>
      <h2>🌿 {levelData.title}</h2>
      <p style={{ fontSize: "1.2rem" }}>{levelData.question}</p>

      <div style={{ marginTop: "1rem" }}>
        {levelData.options.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelected(opt)}
            style={{
              display: "block",
              margin: "0.5rem 0",
              padding: "10px 15px",
              backgroundColor: selected === opt ? "#2196f3" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              width: "250px",
              textAlign: "left",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected}
        style={{
          marginTop: "1rem",
          padding: "10px 20px",
          backgroundColor: "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Submit
      </button>

      <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>{feedback}</p>
    </div>
  );
}

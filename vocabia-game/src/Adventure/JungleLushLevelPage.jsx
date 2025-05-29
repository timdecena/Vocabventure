// src/Adventure/JungleLushLevelPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function JungleLushLevelPage() {
  const { id } = useParams(); // dynamic level id from URL
  const [levelData, setLevelData] = useState(null);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const res = await api.get(`/adventure/levels/${id}`);
        setLevelData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to load level", err);
        setFeedback("Error loading level.");
        setLoading(false);
      }
    };

    fetchLevel();
  }, [id]);

  const handleSubmit = async () => {
    if (!levelData) return;

    const correct = selected === levelData.correctAnswer;
    setFeedback(correct ? "✅ Correct! XP earned!" : "❌ Incorrect! Try again.");

    if (correct) {
      try {
        await api.post("/adventure/stats/save", {
          levelName: levelData.title,
          score: 100,
          attempts: 1,
        });

        await api.post("/adventure/level-progress/save", {
          levelName: levelData.title,
          completed: true,
        });

        setTimeout(() => navigate("/student/adventure"), 1500);
      } catch (error) {
        console.error("❌ Failed to save progress", error);
      }
    }
  };

  if (loading) return <p style={{ padding: "2rem", color: "#fff" }}>Loading level...</p>;

  return (
    <div style={{ padding: "2rem", color: "#fff", backgroundColor: "#111", minHeight: "100vh" }}>
      {levelData ? (
  <>
    <h2>{levelData.title}</h2>
    {/* continue rendering */}
  </>
) : (
  <p style={{ color: "red" }}>{feedback || "Unable to load level."}</p>
)}
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

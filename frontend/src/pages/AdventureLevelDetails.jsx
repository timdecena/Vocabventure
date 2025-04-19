import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdventureLevelDetails.css";

const AdventureLevelDetails = ({ levelId }) => {
  const [details, setDetails] = useState(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:8080/api/adventure/level/${levelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(setDetails)
      .catch((err) => {
        setError("You are not authorized or the level doesn't exist.");
        console.error(err);
      });
  }, [levelId, navigate]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/api/adventure/level/${levelId}/submit?answer=${answer}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      alert(`Progress updated. Score: ${data.score}`);
    } catch (err) {
      alert("Submission failed.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!details) return <p>Loading...</p>;

  return (
    <div className="adventure-level-details">
      <h2>{details.levelInfo.title}</h2>
      <p>{details.levelInfo.description}</p>
      <ul className="word-list">
        {details.wordList.map((w) => (
          <li key={w.wordId} className="word-item">{w.word}</li>
        ))}
      </ul>
      <div className="answer-section">
        <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer" />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default AdventureLevelDetails;

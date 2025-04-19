// File: src/components/AdventureLevelsList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdventureLevelsList.css";

const AdventureLevelsList = () => {
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      navigate("/login");
      return;
    }

    fetch("http://localhost:8080/api/adventure/levels", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        return res.json();
      })
      .then(setLevels)
      .catch((err) => {
        console.error("Error fetching levels:", err);
        setError("Failed to load levels. You may not be authorized.");
      });
  }, [navigate]);

  return (
    <div className="adventure-levels-container">
      <h2>Adventure Levels</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {levels.map((level) => (
          <li key={level.levelId} className="level-item">
            <strong>{level.title}</strong>: {level.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdventureLevelsList;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function StudentJoinClassPage() {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/student/classes/join", { joinCode });
      navigate("/student/classes");
    } catch (err) {
      setError("Failed to join class: " + (err.response?.data || "Unknown error"));
    }
  };

  return (
    <div>
      <h2>Join Class</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Join Code: <input value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
        </label>
        <button type="submit">Join</button>
      </form>
      {error && <div style={{color:"red"}}>{error}</div>}
    </div>
  );
}

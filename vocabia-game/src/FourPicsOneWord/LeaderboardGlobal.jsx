import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function LeaderboardGlobal() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get("/game/4pics1word/leaderboard/global")
      .then((res) => setEntries(res.data))
      .catch(() => alert("Failed to fetch leaderboard"));
  }, []);

  return (
    <div>
      <h2>Global Leaderboard</h2>
      <ol>
        {entries.map((e, idx) => (
          <li key={idx}>
            {e.studentName} — {e.totalScore} points
          </li>
        ))}
      </ol>
    </div>
  );
}

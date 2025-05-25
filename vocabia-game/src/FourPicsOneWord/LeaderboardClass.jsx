import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function LeaderboardClass() {
  const { classId } = useParams();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get(`/game/4pics1word/leaderboard/class/${classId}`)
      .then((res) => setEntries(res.data))
      .catch(() => alert("Failed to fetch class leaderboard"));
  }, [classId]);

  return (
    <div>
      <h2>Class Leaderboard</h2>
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

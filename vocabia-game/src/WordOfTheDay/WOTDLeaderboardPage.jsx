import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function WOTDLeaderboardPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get("/leaderboard/wotd")
      .then(res => setEntries(res.data))
      .catch(() => alert("Failed to load leaderboard"));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🏆 Word of the Day Leaderboard</h2>
      <table border="1" cellPadding="8" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Correct</th>
            <th>Played</th>
            <th>Accuracy (%)</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.studentId}>
              <td>{index + 1}</td>
              <td>{entry.studentName}</td>
              <td>{entry.correctAnswers}</td>
              <td>{entry.totalPlayed}</td>
              <td>{entry.accuracyPercent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

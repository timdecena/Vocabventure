import React, { useEffect, useState } from 'react';
import api from "../api/api"; // ✅ CORRECT

export default function ArenaLeaderboard({ wordListId }) {
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    api.get(`/arena/leaderboard/${wordListId}`).then(res => setRanks(res.data));
  }, [wordListId]);

  return (
    <div>
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Name</th><th>Score</th><th>Accuracy</th><th>Time</th></tr>
        </thead>
        <tbody>
          {ranks.map((r, i) => (
            <tr key={i}>
              <td>{i+1}</td>
              <td>{r.name}</td>
              <td>{r.totalScore}</td>
              <td>{r.correctAnswers}/10</td>
              <td>{r.avgResponseTime.toFixed(1)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

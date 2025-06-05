import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function StudentSpellingLevelList() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState([]);
  const [completedLevelIds, setCompletedLevelIds] = useState([]);
  const [levelScores, setLevelScores] = useState({}); // key: levelId, value: score
  const [levelChallengeCounts, setLevelChallengeCounts] = useState({}); // key: levelId, value: total challenges
  const [error, setError] = useState(null);

  // Fetch levels and completed challenge IDs
  useEffect(() => {
  const fetchData = async () => {
    try {
      const levelsRes = await api.get(`/spelling-level/classroom/${classId}`);
      const correctRes = await api.get(`/game/spelling/correct`);

      if (Array.isArray(levelsRes.data)) {
        setLevels(levelsRes.data);
      } else {
        console.warn("⚠️ Unexpected levels response:", levelsRes.data);
        setLevels([]);
      }
      setCompletedChallengeIds(correctRes.data); // Only set this once, after correct fetch!
    } catch (err) {
      console.error("❌ Error loading levels or correct challenge IDs:", err);
      setError("Failed to load spelling levels. Please try again.");
    }
  };

  fetchData();
}, [classId]);


  // Determine which levels are fully completed & calculate scores
  useEffect(() => {
    const checkCompletedLevelsAndScores = async () => {
      const completed = [];
      const scores = {};
      const challengeCounts = {};

      for (const level of levels) {
        try {
          const res = await api.get(`/spelling-level/${level.id}/challenges`);
          const challengeIds = res.data.map((c) => c.id);
          const correctAnswered = challengeIds.filter(id => completedChallengeIds.includes(id));
          const isCompleted = challengeIds.length > 0 && correctAnswered.length === challengeIds.length;

          if (isCompleted) completed.push(level.id);
          scores[level.id] = correctAnswered.length;
          challengeCounts[level.id] = challengeIds.length;
        } catch (err) {
          console.warn(`⚠️ Could not fetch challenges for level ${level.id}`);
        }
      }

      setCompletedLevelIds(completed);
      setLevelScores(scores);
      setLevelChallengeCounts(challengeCounts);
    };

    if (levels.length && completedChallengeIds.length) {
      checkCompletedLevelsAndScores();
    }
  }, [levels, completedChallengeIds]);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 32 }}>
      <h2>📘 Spelling Levels</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {levels.length === 0 ? (
        <p>No levels found for this class.</p>
      ) : (
        levels.map(level => {
          const completed = completedLevelIds.includes(level.id);
          const score = levelScores[level.id] || 0;
          const total = levelChallengeCounts[level.id] || 0;
          return (
            <div key={level.id} style={{ marginBottom: 12 }}>
              <b>{level.title}</b>{" "}
              <span style={{
                fontWeight: "bold",
                color: score === total && total !== 0 ? "green" : "#333"
              }}>
                {total > 0 && `(Score: ${score} / ${total})`}
              </span>
              <button
                onClick={() => navigate(`/student/classes/${classId}/spelling-challenge?levelId=${level.id}`)}
                disabled={completed}
                style={{
                  marginLeft: 10,
                  backgroundColor: completed ? "#ccc" : "",
                  color: completed ? "#666" : "#000",
                  cursor: completed ? "not-allowed" : "pointer"
                }}
              >
                {completed ? "Already Attempted" : "Start Level"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function StudentSpellingLevelList() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState([]);
  const [completedLevelIds, setCompletedLevelIds] = useState([]);
  const [error, setError] = useState(null);

  // Fetch levels and completed challenge IDs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const levelsRes = await api.get(`/spelling-level/classroom/${classId}`);
        const completedRes = await api.get(`/game/spelling/completed`);

        if (Array.isArray(levelsRes.data)) {
          setLevels(levelsRes.data);
          setCompletedChallengeIds(completedRes.data);
        } else {
          console.warn("⚠️ Unexpected levels response:", levelsRes.data);
          setLevels([]);
        }
      } catch (err) {
        console.error("❌ Error loading levels or completed challenges:", err);
        setError("Failed to load spelling levels. Please try again.");
      }
    };

    fetchData();
  }, [classId]);

  // Determine which levels are fully completed
  useEffect(() => {
    const checkCompletedLevels = async () => {
      const completed = [];

      for (const level of levels) {
        try {
          const res = await api.get(`/spelling-level/${level.id}/challenges`);
          const challengeIds = res.data.map((c) => c.id);
          const isCompleted = challengeIds.every(id => completedChallengeIds.includes(id));

          if (isCompleted) {
            completed.push(level.id);
          }
        } catch (err) {
          console.warn(`⚠️ Could not fetch challenges for level ${level.id}`);
        }
      }

      setCompletedLevelIds(completed);
    };

    if (levels.length && completedChallengeIds.length) {
      checkCompletedLevels();
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
          return (
            <div key={level.id} style={{ marginBottom: 12 }}>
              <b>{level.title}</b>
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

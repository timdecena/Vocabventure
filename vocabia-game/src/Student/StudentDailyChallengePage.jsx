import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function StudentDailyChallengePage() {
  const { classId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: get current week and day
  function getCurrentWeekDay() {
    const now = new Date();
    // Week of year:
    const jan1 = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - jan1) / 86400000) + jan1.getDay() + 1) / 7);
    // Day of week: 1 = Monday, 7 = Sunday
    const dayNumber = now.getDay() === 0 ? 7 : now.getDay();
    return { weekNumber, dayNumber };
  }

  useEffect(() => {
    const { weekNumber, dayNumber } = getCurrentWeekDay();

    // DEBUG
    console.log("classId:", classId, "week:", weekNumber, "day:", dayNumber);

    axios.get(`http://localhost:8080/api/wordlist/student/${classId}/week/${weekNumber}/day/${dayNumber}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => setItems(res.data))
      .catch(err => {
        alert("No challenge found or error!");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <div>Loading daily challenge...</div>;

  if (!items.length) return <div>No daily challenge for today!</div>;

  return (
    <div>
      <h2>Daily Challenge</h2>
      {items.map((item, i) => (
        <div key={item.id || i}>
          <h3>{item.word}</h3>
          <p>{item.definition}</p>
          {item.imageUrl && <img src={item.imageUrl} alt={item.word} />}
        </div>
      ))}
    </div>
  );
}

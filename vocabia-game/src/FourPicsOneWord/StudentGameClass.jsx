import React, { useEffect, useState } from "react";
import api from "../api/api";
import SubmitAnswerForm from "./SubmitAnswerForm";

export default function StudentGameClass() {
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    api.get(`/student/classes`) // get all classes the student is in
      .then(res => {
        const classIds = res.data.map(c => c.id);
        return Promise.all(classIds.map(id =>
          api.get(`/game/4pics1word/levels/class/${id}`)
        ));
      })
      .then(responses => {
        const allLevels = responses.flatMap(res => res.data);
        setLevels(allLevels);
      })
      .catch(() => alert("Failed to fetch levels"));
  }, []);

  return (
    <div>
      <h2>4 Pics 1 Word - Class Levels</h2>
      {levels.length === 0 ? <p>No levels found in your classes.</p> : levels.map((level) => (
        <div key={level.id} style={{ marginBottom: 40 }}>
          <SubmitAnswerForm level={level} />
        </div>
      ))}
    </div>
  );
}

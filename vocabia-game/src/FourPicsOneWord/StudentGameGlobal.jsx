import React, { useEffect, useState } from "react";
import api from "../api/api";
import SubmitAnswerForm from "./SubmitAnswerForm";

export default function StudentGameGlobal() {
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    api.get("/game/4pics1word/levels/global")
      .then((res) => setLevels(res.data))
      .catch(() => alert("Failed to fetch global levels"));
  }, []);

  return (
    <div>
      <h2>4 Pics 1 Word - Global Levels</h2>
      {levels.map((level) => (
        <div key={level.id} style={{ marginBottom: 40 }}>
          <SubmitAnswerForm level={level} />
        </div>
      ))}
    </div>
  );
}

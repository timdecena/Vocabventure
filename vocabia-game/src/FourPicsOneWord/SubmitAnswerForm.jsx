import React, { useState } from "react";
import api from "../api/api";

export default function SubmitAnswerForm({ level }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    try {
      await api.post("/game/4pics1word/submit", {
        levelId: level.id,
        answer
      });
      setFeedback("Answer submitted!");
    } catch {
      setFeedback("Failed to submit");
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 16 }}>
      <p><b>Definition:</b> {level.definition}</p>
      <div style={{ display: "flex", gap: 10 }}>
        {[level.image1Url, level.image2Url, level.image3Url, level.image4Url].map((src, idx) => (
          <img key={idx} src={src} alt="" width={100} height={100} />
        ))}
      </div>
      <br />
      <input
        placeholder="Your answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
      {feedback && <p>{feedback}</p>}
    </div>
  );
}

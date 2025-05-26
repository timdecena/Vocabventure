import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function StudentWordOfTheDay() {
  const [definition, setDefinition] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    api.get("/game/word-of-the-day")
      .then(res => {
        setDefinition(res.data.definition);
        setHasPlayed(res.data.hasPlayed);
        setImageUrl(`http://localhost:8080${res.data.imageUrl}`); // ✅ Add full path
      })
      .catch(() => setResult("Failed to load word"));
  }, []);

  const submitGuess = async () => {
    try {
      const res = await api.post("/game/word-of-the-day/submit", { guess });
      setResult(res.data.correct ? "✅ Correct!" : "❌ Incorrect");
      setHasPlayed(true);
    } catch {
      setResult("Already played or error occurred");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Word of the Day</h2>
      <p><b>Definition:</b> {definition}</p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Word Visual"
          style={{ maxWidth: "300px", marginBottom: "10px" }}
        />
      )}
      {hasPlayed ? (
        <p>You’ve already played today!</p>
      ) : (
        <>
          <input value={guess} onChange={e => setGuess(e.target.value)} placeholder="Enter your guess" />
          <button onClick={submitGuess}>Submit</button>
        </>
      )}
      {result && <p>{result}</p>}
    </div>
  );
}

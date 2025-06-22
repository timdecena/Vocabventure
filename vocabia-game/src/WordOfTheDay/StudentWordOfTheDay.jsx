import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function StudentWordOfTheDay() {
  const [definition, setDefinition] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [gold, setGold] = useState(null);

  const fetchWordData = async () => {
    try {
      const res = await api.get("/game/word-of-the-day");
      setDefinition(res.data.definition);
      setHasPlayed(res.data.hasPlayed);
      setImageUrl(`http://localhost:8080${res.data.imageUrl}`);
      if (res.data.gold !== undefined) setGold(res.data.gold);
    } catch {
      setResult("❌ Failed to load word");
    }
  };

  useEffect(() => {
    fetchWordData();
  }, []);

  const submitGuess = async () => {
    try {
      const res = await api.post("/game/word-of-the-day/submit", { guess });
      setResult(res.data.correct ? "✅ Correct!" : "❌ Incorrect");
      setHasPlayed(true);
      if (res.data.gold !== undefined) setGold(res.data.gold);
    } catch {
      setResult("❌ Already played or error occurred");
    }
  };

  const handleRetry = async () => {
  try {
    const res = await api.post("/game/word-of-the-day/retry");
    setHasPlayed(false);
    setGuess("");
    setResult("");
    if (res.data.gold !== undefined) setGold(res.data.gold);
  } catch (err) {
    const message = err.response?.data?.message || "Unknown error";
    if (message.includes("Not enough gold")) {
      setResult("⚠️ You need at least 10 gold to retry.");
    } else {
      setResult("⚠️ Retry failed: " + message);
    }
  }
};

  return (
    <div style={{ padding: 20 }}>
      <h2>📘 Word of the Day</h2>
      <p><b>Definition:</b> {definition}</p>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Word Visual"
          style={{ maxWidth: "300px", marginBottom: "10px" }}
        />
      )}

      {gold !== null && <p><b>🪙 Gold:</b> {gold}</p>}

      {hasPlayed ? (
        <>
          <p>❌ You’ve already played today!</p>
          <button onClick={handleRetry}>🔁 Use 10 Gold to Try Again</button>
        </>
      ) : (
        <>
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
            style={{ padding: "8px", width: "80%", marginBottom: "10px" }}
          />
          <br />
          <button onClick={submitGuess} disabled={!guess.trim()}>
            Submit
          </button>
        </>
      )}

      {result && <p><b>{result}</b></p>}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useParams } from "react-router-dom";

export default function StudentSpellingChallenge() {
  const { classId } = useParams();
  const [challenges, setChallenges] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timer, setTimer] = useState(15);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get(`/game/spelling/${classId}`);
        setChallenges(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load challenges", err);
        setError("❌ You are not authorized to view this or no challenges found.");
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [classId]);

  useEffect(() => {
    if (!isSubmitted && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timer === 0 && !isSubmitted) {
      handleSubmit(); // auto-submit on timer end
    }
  }, [timer, isSubmitted]);

  const handleSubmit = async () => {
    try {
      const res = await api.post("/game/spelling/submit", {
        challengeId: challenges[current].id,
        guess: answer,
      });
      setFeedback(res.data.correct ? "✅ Correct!" : "❌ Incorrect.");
    } catch (err) {
      setFeedback("⚠️ Already answered or error submitting answer.");
    } finally {
      setIsSubmitted(true);
    }
  };

  const nextChallenge = () => {
    setAnswer("");
    setFeedback("");
    setTimer(15);
    setIsSubmitted(false);
    setCurrent((prev) => prev + 1);
  };

  if (loading) return <p>🔄 Loading spelling challenges...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!challenges.length) return <p>⚠️ No challenges available for this class.</p>;
  if (current >= challenges.length) return <h3>🎉 All challenges completed!</h3>;

  const currentChallenge = challenges[current];

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 32 }}>
      <h2>📝 Spelling Challenge</h2>
      <p><b>Challenge {current + 1} of {challenges.length}</b></p>
      <p><b>Definition:</b> {currentChallenge.definition}</p>
      <p><b>Sentence:</b> {currentChallenge.exampleSentence}</p>

      <audio controls autoPlay src={`http://localhost:8080${currentChallenge.audioUrl}`}></audio>

      <p><b>⏱️ Time Left:</b> {timer}s</p>

      {!isSubmitted ? (
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the word"
            autoFocus
          />
          <button onClick={handleSubmit} disabled={isSubmitted || !answer.trim()}>
            Submit
          </button>
        </div>
      ) : (
        <div>
          <p><b>{feedback}</b></p>
          {current < challenges.length - 1 ? (
            <button onClick={nextChallenge}>Next</button>
          ) : (
            <p>✅ You've completed all challenges!</p>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useRef, useCallback } from "react"; // ✅ add useCallback
import api from "../api/api";
import { useLocation } from "react-router-dom";

export default function StudentSpellingChallenge() {
  const [challenges, setChallenges] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timer, setTimer] = useState(15);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [waterLevel, setWaterLevel] = useState(0);
  const [maxWaterLevel, setMaxWaterLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const audioRef = useRef(null);
  const attackSoundRef = useRef(null);
  const drowningSoundRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const levelId = queryParams.get("levelId");

  // Difficulty factors
  const difficultyFactor = Math.min(1 + current * 0.1, 1.5);
  const baseTime = 15;
  const waterRiseSpeed = difficultyFactor * (100 / baseTime);
const [completedIds, setCompletedIds] = useState([]);

  // Fetch challenges
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [challengesRes, completedRes] = await Promise.all([
        api.get(`/api/spelling-level/${levelId}/challenges`),
        api.get(`/api/game/spelling/completed`)
      ]);

      setChallenges(Array.isArray(challengesRes.data) ? challengesRes.data : []);
      setCompletedIds(Array.isArray(completedRes.data) ? completedRes.data : []);
    } catch {
      setError("Error loading challenges or unauthorized.");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [levelId]);

  // Reset challenge state when moving to next
  useEffect(() => {
    setTimer(baseTime);
    setWaterLevel(0);
    setMaxWaterLevel(0);
  }, [current]);

  const handleSubmit = useCallback(async () => {
  if (isSubmitted) return; 
  setIsSubmitted(true);   

  const endTime = Date.now();
  const elapsedTime = (endTime - startTime) / 1000;

  try {
    const res = await api.post("/api/game/spelling/submit", {
      challengeId: challenges[current].id,
      guess: answer,
      elapsedTime,
    });

    const correct = res.data.correct;
    setFeedback(correct ? "Correct!" : "Wrong!");
    attackSoundRef.current?.play();

    if (correct) {
      const timeBonus = Math.max(0, (baseTime - elapsedTime) / baseTime);
      const waterReduction = 20 + timeBonus * 60;
      setWaterLevel((prev) => Math.max(0, prev - waterReduction));

      if (res.data.score === 1) setScore((s) => s + 1);
    }
  } catch {
    setFeedback("Already answered or error submitting.");
  } finally {
    setTimeout(() => nextChallenge(), 2000);
  }
}, [isSubmitted, startTime, challenges, current, answer]); // ✅ proper deps

  // Timer countdown + water rising
  useEffect(() => {
  if (timerStarted && !isSubmitted && timer > 0) {
    const t = setTimeout(() => {
      setTimer((t) => t - 1);
      const newWater = Math.min(waterLevel + waterRiseSpeed, 100);
      setWaterLevel(newWater);
      setMaxWaterLevel((prev) => Math.max(prev, newWater));
    }, 1000);
    return () => clearTimeout(t);
  }

  if (timer === 0 && !isSubmitted) {
    setWaterLevel(100);
    setTimeout(() => handleSubmit(), 500);
  }
}, [timerStarted, timer, isSubmitted, waterLevel, waterRiseSpeed, handleSubmit]); // ✅ fixed

  const handlePlayAudio = () => {
    if (audioRef.current?.src) {
      audioRef.current.play();
      setTimerStarted(true);
      setStartTime(Date.now());
    }
  };



  const nextChallenge = () => {
    setAnswer("");
    setFeedback("");
    setTimerStarted(false);
    setIsSubmitted(false);
    setCurrent((prev) => prev + 1);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!challenges.length) return <p>No challenges available.</p>;

 if (current >= challenges.length) {
  return (
    <div>
      <h3>All challenges completed!</h3>
      <p>Your Score: {score} / {challenges.length}</p>
      <p>Highest water level reached: {Math.round(maxWaterLevel)}%</p>
    </div>
  );
}

const currentChallenge = challenges[current];
if (completedIds.includes(currentChallenge.id)) {
  return (
    <div>
      <h2>Spelling Challenge</h2>
      <p>Challenge {current + 1} of {challenges.length}</p>
      <p>Score: {score}</p>
      <p style={{ color: "orange" }}>You already answered this challenge.</p>
      <button onClick={nextChallenge}>Next Challenge</button>
    </div>
  );
}

  return (
    <div>
      <h2>Spelling Challenge</h2>
      <p>Challenge {current + 1} of {challenges.length}</p>
      <p>Score: {score}</p>
      <p>Timer: {timer}s</p>
      <p>Water Level: {Math.round(waterLevel)}%</p>

      {currentChallenge.audioUrl && (
        <>
          <audio ref={audioRef} src={`http://localhost:8080${currentChallenge.audioUrl}`} preload="auto" />
          <audio ref={attackSoundRef} src="/sounds/spell-attack.mp3" preload="auto" />
          <audio ref={drowningSoundRef} src="/sounds/drowning-alarm.mp3" preload="auto" />
          <button onClick={handlePlayAudio} disabled={timerStarted}>
            Play Word ({timer}s left)
          </button>
        </>
      )}

      {!isSubmitted ? (
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer"
            disabled={!timerStarted}
          />
          <button onClick={handleSubmit} disabled={!timerStarted || !answer.trim()}>
            Submit
          </button>
        </div>
      ) : (
        <div>
          <p>{feedback}</p>
          {current < challenges.length - 1 && <p>Next challenge in 2 seconds...</p>}
        </div>
      )}
    </div>
  );
}

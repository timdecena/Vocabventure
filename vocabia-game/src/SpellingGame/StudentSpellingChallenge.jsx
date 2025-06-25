import React, { useEffect, useState, useRef } from "react";
import api from "../api/api";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/system";
import { Typography } from "@mui/material";

const GameWrapper = styled("div")({
  minHeight: "100vh",
  width: "100vw",
  backgroundImage: "url('/sprites/forest-game-bg.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  overflow: "hidden",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  paddingTop: "20px",
  paddingBottom: "40px",
});

const WaterContainer = styled("div")({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  zIndex: 1,
});

const WaterOverlay = styled("div")(({ waterLevel }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: `${waterLevel}%`,
  background: "linear-gradient(to top, rgba(30, 144, 255, 0.7), rgba(0, 191, 255, 0.5))",
  transition: "height 0.5s ease-out",
}));

const WaterSurface = styled("div")({
  position: "absolute",
  top: 0,
  width: "100%",
  height: "20px",
  backgroundImage: "url('/sprites/water-layer.gif')",
  backgroundSize: "cover",
});

const Bubbles = styled("div")({
  position: "absolute",
  bottom: 0,
  width: "100%",
  height: "100%",
  backgroundImage: "url('/sprites/bubbles.gif')",
  backgroundSize: "contain",
  opacity: 0.6,
});

const CharacterContainer = styled("div")({
  position: "relative",
  zIndex: 2,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  gap: "100px",
  position: "absolute",
  bottom: "200px",
  width: "100%",
});

const CharacterSprite = styled("img")({
  width: "220px",
  height: "220px",
  objectFit: "contain",
  transition: "transform 0.3s ease-out",
});

const EnemySprite = styled("img")(({ hurt }) => ({
  width: "180px",
  height: "180px",
  objectFit: "contain",
  transition: "transform 0.2s, filter 0.2s",
  transform: hurt ? "scale(1.2) translateY(-10px)" : "scale(1)",
  filter: hurt ? "brightness(70%) sepia(100%) hue-rotate(-50deg)" : "none",
}));

const FloatingUI = styled("div")({
  background: "rgba(255, 255, 255, 0.85)",
  padding: "16px 24px",
  borderRadius: "16px",
  boxShadow: "0 0 20px rgba(0,0,0,0.2)",
  textAlign: "center",
  maxWidth: "500px",
  width: "90%",
  position: "absolute",
  top: "20px",
  zIndex: 3,
});

const DrowningAlert = styled("div")({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "rgba(255, 50, 50, 0.8)",
  color: "white",
  padding: "20px 40px",
  fontSize: "28px",
  borderRadius: "12px",
  zIndex: 99,
  boxShadow: "0 0 15px rgba(0,0,0,0.5)",
  animation: "pulse 1.5s infinite",
  "@keyframes pulse": {
    "0%": { transform: "translate(-50%, -50%) scale(1)" },
    "50%": { transform: "translate(-50%, -50%) scale(1.1)" },
    "100%": { transform: "translate(-50%, -50%) scale(1)" },
  },
});

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
  const [attackResultText, setAttackResultText] = useState("");
  const [showResultText, setShowResultText] = useState(false);
  const [slimeHurt, setSlimeHurt] = useState(false);
  const [showDrowningAlert, setShowDrowningAlert] = useState(false);

  const audioRef = useRef(null);
  const attackSoundRef = useRef(null);
  const splashSoundRef = useRef(null);
  const drowningSoundRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const levelId = queryParams.get("levelId");

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get(`/api/spelling-level/${levelId}/challenges`);
        if (Array.isArray(res.data)) {
          setChallenges(res.data);
        } else {
          setChallenges([]);
        }
      } catch (err) {
        setError("❌ You are not authorized to view this or no challenges found.");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [levelId]);

  useEffect(() => {
    setWaterLevel(0);
    setMaxWaterLevel(0);
    setShowDrowningAlert(false);
  }, [current]);

  useEffect(() => {
    if (timerStarted && !isSubmitted && timer > 0) {
      const t = setTimeout(() => {
        setTimer((t) => t - 1);
        const newWaterLevel = Math.min(waterLevel + (100 / 15), 100);
        setWaterLevel(newWaterLevel);
        setMaxWaterLevel(prev => Math.max(prev, newWaterLevel));
        
        // Show drowning alert when water reaches 80%
        if (newWaterLevel >= 80 && !showDrowningAlert) {
          setShowDrowningAlert(true);
          drowningSoundRef.current?.play();
        } else if (newWaterLevel < 80 && showDrowningAlert) {
          setShowDrowningAlert(false);
        }
      }, 1000);
      return () => clearTimeout(t);
    }
    if (timer === 0 && !isSubmitted) {
      setWaterLevel(100);
      setTimeout(() => handleSubmit(), 500);
    }
  }, [timerStarted, timer, isSubmitted, waterLevel, showDrowningAlert]);

  const handlePlayAudio = () => {
    if (audioRef.current?.src) {
      audioRef.current.play();
      setTimerStarted(true);
      setStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000;

    try {
      const res = await api.post("/api/game/spelling/submit", {
        challengeId: challenges[current].id,
        guess: answer,
        elapsedTime,
      });

      const correct = res.data.correct;
      setFeedback(correct ? "✅ Correct!" : "❌ Attack failed.");
      setAttackResultText(correct ? "🧙 Attack Successful!" : "💥 Attack Failed!");
      setShowResultText(true);
      setSlimeHurt(true);
      attackSoundRef.current?.play();

      if (correct) {
        const timeBonus = Math.max(0, (15 - elapsedTime) / 15);
        const waterReduction = 30 + (timeBonus * 50);
        setWaterLevel(prev => Math.max(0, prev - waterReduction));
        if (res.data.score === 1) setScore((s) => s + 1);
      }

      setTimeout(() => setShowResultText(false), 1500);
      setTimeout(() => setSlimeHurt(false), 600);

    } catch (err) {
      setFeedback("⚠️ Already answered or error submitting answer.");
    } finally {
      setIsSubmitted(true);
      setTimeout(() => {
        nextChallenge();
      }, 2000);
    }
  };

  const nextChallenge = () => {
    setAnswer("");
    setFeedback("");
    setTimer(15);
    setTimerStarted(false);
    setIsSubmitted(false);
    setCurrent((prev) => prev + 1);
  };

  const getCharacterSprite = () => {
    if (waterLevel >= 80) return "/sprites/Boy_Panicking1.png";
    return "/sprites/Boy_Stand.png";
  };

  if (loading) return <p>🔄 Loading spelling challenges...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!challenges.length) return <p>⚠️ No challenges available for this level.</p>;
  if (current >= challenges.length) {
    return (
      <GameWrapper>
        <h3>🎉 All challenges completed!</h3>
        <Typography variant="h5" sx={{ mt: 2 }}>
          Your Score: {score} / {challenges.length}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Highest water level reached: {Math.round(maxWaterLevel)}%
        </Typography>
      </GameWrapper>
    );
  }

  const currentChallenge = challenges[current];

  return (
    <GameWrapper>
      <WaterContainer>
        <WaterOverlay waterLevel={waterLevel}>
          {waterLevel > 10 && <WaterSurface />}
          <Bubbles style={{ opacity: waterLevel / 150 }} />
        </WaterOverlay>
      </WaterContainer>

      {showDrowningAlert && (
        <DrowningAlert>
          DANGER! The water is rising!
        </DrowningAlert>
      )}

      {showResultText && (
        <div style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "20px 40px",
          fontSize: "28px",
          borderRadius: "12px",
          zIndex: 99,
          boxShadow: "0 0 15px rgba(0,0,0,0.5)"
        }}>
          {attackResultText}
        </div>
      )}

      <Typography variant="h4" sx={{ color: "#fff", textShadow: "1px 1px 4px #000", zIndex: 2 }}>
        VOCABVENTURE
      </Typography>

      <CharacterContainer>
        <CharacterSprite 
          src={getCharacterSprite()} 
          alt="character" 
          style={{ transform: `translateY(${-waterLevel * 0.3}px)` }} 
        />
        <EnemySprite src="/sprites/Slime_Idle.png" alt="slime" hurt={slimeHurt} />
      </CharacterContainer>

      <FloatingUI>
        <Typography variant="h6">
          Challenge {current + 1} / {challenges.length}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Score: {score} / {challenges.length}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: waterLevel > 70 ? "red" : "inherit",
          fontWeight: waterLevel > 70 ? "bold" : "normal"
        }}>
          Water Level: {Math.round(waterLevel)}% {waterLevel > 70 && "⚠️ Hurry!"}
        </Typography>

        {currentChallenge.audioUrl && (
          <>
            <audio ref={audioRef} src={`http://localhost:8080${currentChallenge.audioUrl}`} preload="auto" />
            <audio ref={attackSoundRef} src="/sounds/spell-attack.mp3" preload="auto" />
            <audio ref={splashSoundRef} src="/sounds/water-splash.mp3" preload="auto" />
            <audio ref={drowningSoundRef} src="/sounds/drowning-alarm.mp3" preload="auto" />
            <button 
              onClick={handlePlayAudio} 
              disabled={timerStarted} 
              style={{ 
                marginTop: "10px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: timerStarted ? "#ccc" : "#4CAF50",
                color: "white",
                cursor: timerStarted ? "not-allowed" : "pointer"
              }}
            >
              ▶️ Play Word
            </button>
          </>
        )}

        <p><b>⏱️ Time Left:</b> {timerStarted ? `${timer}s` : "Not started"}</p>

        {!isSubmitted ? (
          <div>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Spell the word you hear"
              disabled={!timerStarted}
              autoFocus
              style={{ 
                padding: "10px", 
                fontSize: "16px", 
                borderRadius: "8px", 
                width: "100%",
                border: "2px solid #ddd",
                marginTop: "10px"
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!timerStarted || !answer.trim()}
              style={{ 
                marginTop: "10px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: (!timerStarted || !answer.trim()) ? "#ccc" : "#2196F3",
                color: "white",
                cursor: (!timerStarted || !answer.trim()) ? "not-allowed" : "pointer"
              }}
            >
              Cast Spell
            </button>
          </div>
        ) : (
          <div>
            <p><b>{feedback}</b></p>
            {current < challenges.length - 1 && <p>➡️ Preparing next challenge...</p>}
          </div>
        )}
      </FloatingUI>
    </GameWrapper>
  );
}
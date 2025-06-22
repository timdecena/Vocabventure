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

const SpriteRow = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  gap: "100px",
  position: "absolute",
  bottom: "200px",
  height: "auto",
});

const CharacterSprite = styled("img")({
  width: "220px",
  height: "220px",
  objectFit: "contain",
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
  zIndex: 2,
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
  const [animationPhase, setAnimationPhase] = useState("stand");
  const [spriteFrame, setSpriteFrame] = useState(1);

  // --- Score state ---
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [attackResultText, setAttackResultText] = useState("");
  const [showResultText, setShowResultText] = useState(false);
  const [slimeHurt, setSlimeHurt] = useState(false);

  const audioRef = useRef(null);
  const attackSoundRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const levelId = queryParams.get("levelId");

  const wizardSprites = {
    stand: ["Wizard_Stand"],
    attack: ["Wizard_Attack1", "Wizard_Attack2", "Wizard_Attack3", "Wizard_Attack4"],
    run: ["Wizard_Run1", "Wizard_Run2", "Wizard_Run3", "Wizard_Run4"],
  };

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
    if (timerStarted && !isSubmitted && timer > 0) {
      const t = setTimeout(() => setTimer((t) => t - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timer === 0 && !isSubmitted) handleSubmit();
    // eslint-disable-next-line
  }, [timerStarted, timer, isSubmitted]);

  useEffect(() => {
    if (animationPhase === "attack" || animationPhase === "run") {
      const frames = wizardSprites[animationPhase];
      let index = 0;
      const interval = setInterval(() => {
        setSpriteFrame((index % frames.length) + 1);
        index++;
        if (index >= frames.length) {
          clearInterval(interval);
          if (animationPhase === "attack") {
            setTimeout(() => {
              setAnimationPhase("run");
              setSpriteFrame(1);
            }, 300);
          } else if (animationPhase === "run") {
            setTimeout(() => {
              nextChallenge();
              setAnimationPhase("stand");
              setSpriteFrame(1);
            }, 300);
          }
        }
      }, 300); // slower animation
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [animationPhase]);

  const handlePlayAudio = () => {
    if (audioRef.current?.src) {
      audioRef.current.play();
      setTimerStarted(true);
      setStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
  const endTime = Date.now();
  const elapsedTime = (endTime - startTime) / 1000; // ⏱️ in seconds

  try {
    const res = await api.post("/api/game/spelling/submit", {
      challengeId: challenges[current].id,
      guess: answer,
      elapsedTime, // ✅ send to backend
    });

    const correct = res.data.correct;
    setFeedback(correct ? "✅ Correct!" : "❌ Attack failed.");
    setAttackResultText(correct ? "🧙 Attack Successful!" : "💥 Attack Failed!");
    setShowResultText(true);
    setSlimeHurt(true);
    attackSoundRef.current?.play();

    if (res.data.score === 1) setScore((s) => s + 1);

    setTimeout(() => setShowResultText(false), 1500);
    setTimeout(() => setSlimeHurt(false), 600);

  } catch (err) {
    setFeedback("⚠️ Already answered or error submitting answer.");
  } finally {
    setIsSubmitted(true);
    setAnimationPhase("attack");
    setSpriteFrame(1);
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

  const currentSprite = () => {
    if (animationPhase === "stand") return "/sprites/Wizard_Stand.png";
    return `/sprites/${wizardSprites[animationPhase][spriteFrame - 1]}.png`;
  };

  if (loading) return <p>🔄 Loading spelling challenges...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!challenges.length) return <p>⚠️ No challenges available for this level.</p>;
  if (current >= challenges.length)
    return (
      <GameWrapper>
        <h3>🎉 All challenges completed!</h3>
        <Typography variant="h5" sx={{ mt: 2 }}>
          Your Score: {score} / {challenges.length}
        </Typography>
      </GameWrapper>
    );

  const currentChallenge = challenges[current];

  return (
    <GameWrapper>
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

      <Typography variant="h4" sx={{ color: "#fff", textShadow: "1px 1px 4px #000" }}>
        Spelling Challenge
      </Typography>

      <SpriteRow>
        <CharacterSprite src={currentSprite()} alt="wizard" />
        <EnemySprite src="/sprites/Slime_Idle.png" alt="slime" hurt={slimeHurt} />
      </SpriteRow>

      <FloatingUI>
        <Typography variant="h6">
          Challenge {current + 1} / {challenges.length}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Score: {score} / {challenges.length}
        </Typography>

        {currentChallenge.audioUrl && (
          <>
            <audio ref={audioRef} src={`http://localhost:8080${currentChallenge.audioUrl}`} preload="auto" />
            <audio ref={attackSoundRef} src="/sounds/spell-attack.mp3" preload="auto" />
            <button onClick={handlePlayAudio} disabled={timerStarted} style={{ marginTop: "10px" }}>
              ▶️ Play Audio
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
              placeholder="Type the word"
              disabled={!timerStarted}
              autoFocus
              style={{ padding: "10px", fontSize: "16px", borderRadius: "8px", width: "100%" }}
            />
            <button
              onClick={handleSubmit}
              disabled={!timerStarted || !answer.trim()}
              style={{ marginTop: "10px" }}
            >
              Submit
            </button>
          </div>
        ) : (
          <div>
            <p><b>{feedback}</b></p>
            {current < challenges.length - 1 && <p>➡️ Proceeding to next challenge...</p>}
          </div>
        )}
      </FloatingUI>
    </GameWrapper>
  );
}

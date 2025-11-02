import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/api";
import { useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import { 
  Typography, 
  Button, 
  TextField, 
  Box,
  Card,
  CardContent,
  Fade,
  Zoom,
  Slide,
  Alert,
  Chip,
  CircularProgress
} from "@mui/material";
import { 
  VolumeUp, 
  EmojiEvents, 
  Star,
  AccessTime,
  FormatQuote,
  Lightbulb,
  PlayArrow
} from "@mui/icons-material";

// Styled Components
const GameContainer = styled("div")({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
    `,
  }
});

const FloatingParticles = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
});

const Particle = styled("div")({
  position: "absolute",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
  animation: "float 6s ease-in-out infinite",
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(180deg)" },
  }
});

const MainCard = styled(Card)({
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  padding: "40px 32px",
  width: "100%",
  maxWidth: "600px",
  boxShadow: `
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1)
  `,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  position: "relative",
  zIndex: 2,
});

const LevelInfoCard = styled(Card)({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "24px",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
});

const TimerCircle = styled("div")(({ percentage, isCritical }) => ({
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: `conic-gradient(
    ${isCritical ? "#ff4757" : "#2ed573"} 0% ${percentage}%, 
    rgba(255, 255, 255, 0.2) ${percentage}% 100%
  )`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  }
}));

const TimerText = styled(Typography)(({ isCritical }) => ({
  position: "relative",
  zIndex: 1,
  fontWeight: "bold",
  fontSize: "32px",
  color: isCritical ? "#ff4757" : "#2ed573",
  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
}));

const PlayButton = styled(Button)({
  background: "linear-gradient(45deg, #ff6b6b, #ffa726)",
  borderRadius: "50px",
  padding: "16px 32px",
  fontSize: "18px",
  fontWeight: "bold",
  color: "white",
  boxShadow: "0 8px 25px rgba(255, 107, 107, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 35px rgba(255, 107, 107, 0.6)",
  },
  "&:disabled": {
    background: "#ccc",
    transform: "none",
    boxShadow: "none",
  }
});

const SubmitButton = styled(Button)(({ timer, disabled }) => ({
  background: disabled ? "#ccc" : 
    timer < 5 ? 
    "linear-gradient(45deg, #ff4757, #ff6348)" :
    "linear-gradient(45deg, #2ed573, #1e90ff)",
  borderRadius: "50px",
  padding: "16px 40px",
  fontSize: "18px",
  fontWeight: "bold",
  color: "white",
  boxShadow: disabled ? "none" : "0 8px 25px rgba(46, 213, 115, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: disabled ? "none" : "translateY(-2px)",
    boxShadow: disabled ? "none" : "0 12px 35px rgba(46, 213, 115, 0.6)",
  }
}));

const ScoreBadge = styled("div")({
  background: "linear-gradient(45deg, #ffd700, #ffa500)",
  borderRadius: "20px",
  padding: "8px 16px",
  color: "white",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 4px 15px rgba(255, 215, 0, 0.4)",
});

const ResultOverlay = styled("div")(({ type }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: type === "success" ? 
    "radial-gradient(circle, rgba(46, 213, 115, 0.95) 0%, rgba(46, 213, 115, 0.8) 100%)" :
    "radial-gradient(circle, rgba(255, 71, 87, 0.95) 0%, rgba(255, 71, 87, 0.8) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  color: "white",
}));

const Confetti = styled("div")({
  position: "fixed",
  width: "10px",
  height: "10px",
  background: "linear-gradient(45deg, #ff6b6b, #ffa726, #2ed573, #1e90ff, #a55eea)",
  animation: "confettiFall 1s ease-out forwards",
  "@keyframes confettiFall": {
    "0%": { transform: "translateY(-100px) rotate(0deg)", opacity: 1 },
    "100%": { transform: "translateY(100vh) rotate(360deg)", opacity: 0 },
  }
});

const DefinitionBox = styled(Box)({
  background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  borderRadius: "12px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: "4px solid #667eea",
});

const ExampleBox = styled(Box)({
  background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
  borderRadius: "12px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: "4px solid #ffa726",
  fontStyle: "italic",
});

const WordRevealCard = styled(Card)({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  borderRadius: "20px",
  padding: "32px",
  margin: "16px 0",
  textAlign: "center",
});

export default function StudentSpellingChallenge() {
  const [challenges, setChallenges] = useState([]);
  const [levelInfo, setLevelInfo] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timer, setTimer] = useState(15);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState("");
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [showWordInfo, setShowWordInfo] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const audioRef = useRef(null);
  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const levelId = queryParams.get("levelId");

  const timePercentage = (timer / 15) * 100;
  const isCriticalTime = timer <= 5;

  // Generate floating particles
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 20 + 10,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4
      });
    }
    setParticles(newParticles);
  }, []);

  // Fetch challenges, level info, and remaining attempts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challengesRes, completedRes, attemptsRes] = await Promise.all([
          api.get(`/api/spelling-level/${levelId}/challenges`),
          api.get(`/api/game/spelling/completed`),
          api.get(`/api/game/spelling/level/${levelId}/remaining-attempts`)
        ]);
        
        setChallenges(Array.isArray(challengesRes.data) ? challengesRes.data : []);
        setCompletedIds(Array.isArray(completedRes.data) ? completedRes.data : []);
        setRemainingAttempts(attemptsRes.data.remainingAttempts || 0);
        
      } catch (err) {
        setError("Error loading game data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [levelId]);

  // Timer logic
  useEffect(() => {
    if (timerStarted && !isSubmitted && timer > 0) {
      const timeout = setTimeout(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearTimeout(timeout);
    }
    if (timer === 0 && !isSubmitted) {
      handleAutoSubmit();
    }
  }, [timerStarted, timer, isSubmitted]);

  const handlePlayAudio = () => {
    if (audioRef.current?.src) {
      audioRef.current.play().catch(err => {
        console.error("Audio play error:", err);
      });
      setTimerStarted(true);
      setStartTime(Date.now());
      setShowHint(true); // Show hints when audio starts playing
    }
  };

  const createConfetti = () => {
    const confettiPieces = [];
    for (let i = 0; i < 50; i++) {
      confettiPieces.push({
        id: Math.random(),
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 1
      });
    }
    setConfetti(confettiPieces);
    setTimeout(() => setConfetti([]), 2000);
  };

  const handleAutoSubmit = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    
    setResultType("error");
    setFeedback("Time's up! ⏰");
    setShowResult(true);
    errorSoundRef.current?.play();
    
    setTimeout(() => {
      setShowResult(false);
      setShowWordInfo(true);
    }, 1500);
  };

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
      const pointsEarned = res.data.score;
      
      setResultType(correct ? "success" : "error");
      setShowResult(true);

      if (correct) {
        setFeedback(`Correct! 🎯 +${pointsEarned} points`);
        setScore(s => s + pointsEarned);
        successSoundRef.current?.play();
        createConfetti();
      } else {
        setFeedback("Incorrect ❌");
        errorSoundRef.current?.play();
      }

      // Refresh remaining attempts after submission
      const attemptsRes = await api.get(`/api/game/spelling/level/${levelId}/remaining-attempts`);
      setRemainingAttempts(attemptsRes.data.remainingAttempts);

      setTimeout(() => {
        setShowResult(false);
        setShowWordInfo(true);
      }, 1500);

    } catch (err) {
      console.error("Submission error:", err);
      setFeedback("Error submitting answer");
      setResultType("error");
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        setShowWordInfo(true);
      }, 1500);
    }
  }, [isSubmitted, startTime, challenges, current, answer, levelId]);

  const nextChallenge = () => {
    setAnswer("");
    setFeedback("");
    setTimerStarted(false);
    setIsSubmitted(false);
    setTimer(15);
    setShowWordInfo(false);
    setShowHint(false);
    setCurrent(prev => prev + 1);
  };

  const canAttempt = remainingAttempts > 0;

  if (loading) return (
    <GameContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
        <Typography variant="h5" color="white" sx={{ zIndex: 2 }}>
          Loading Challenges...
        </Typography>
      </Box>
    </GameContainer>
  );

  if (error) return (
    <GameContainer>
      <Alert severity="error" sx={{ maxWidth: '500px', zIndex: 2 }}>
        {error}
      </Alert>
    </GameContainer>
  );

  if (!challenges.length) return (
    <GameContainer>
      <Typography variant="h6" color="white" sx={{ zIndex: 2 }}>
        No challenges available for this level
      </Typography>
    </GameContainer>
  );

  if (!canAttempt) {
    return (
      <GameContainer>
        <FloatingParticles>
          {particles.map(particle => (
            <Particle
              key={particle.id}
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </FloatingParticles>

        <Zoom in={true} timeout={1000}>
          <MainCard>
            <CardContent sx={{ textAlign: "center" }}>
              <EmojiEvents sx={{ fontSize: 80, color: "#ff4757", mb: 2 }} />
              <Typography variant="h3" gutterBottom color="#2c3e50">
                Attempts Exhausted
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You've used all attempts for this level
              </Typography>
              <Typography variant="h1" color="#e74c3c" sx={{ mb: 3, fontWeight: "bold" }}>
                Final Score: {score}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate("/levels")}
                sx={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  borderRadius: "25px",
                  padding: "16px 40px",
                  fontSize: "18px",
                  fontWeight: "bold"
                }}
              >
                Return to Levels
              </Button>
            </CardContent>
          </MainCard>
        </Zoom>
      </GameContainer>
    );
  }

  if (current >= challenges.length) {
    return (
      <GameContainer>
        <FloatingParticles>
          {particles.map(particle => (
            <Particle
              key={particle.id}
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </FloatingParticles>

        <Zoom in={true} timeout={1000}>
          <MainCard>
            <CardContent sx={{ textAlign: "center" }}>
              <EmojiEvents sx={{ fontSize: 80, color: "#ffd700", mb: 2 }} />
              <Typography variant="h3" gutterBottom color="#2c3e50">
                Level Complete! 🎉
              </Typography>
              
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your Final Score
              </Typography>
              <Typography variant="h1" color="#e74c3c" sx={{ mb: 3, fontWeight: "bold" }}>
                {score}
              </Typography>
              
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Chip 
                  icon={<AccessTime />} 
                  label={`${remainingAttempts} attempts remaining`} 
                  color={remainingAttempts > 0 ? "primary" : "error"}
                />
              </Box>

              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate("/levels")}
                sx={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  borderRadius: "25px",
                  padding: "16px 40px",
                  fontSize: "18px",
                  fontWeight: "bold"
                }}
              >
                Return to Levels
              </Button>
            </CardContent>
          </MainCard>
        </Zoom>
      </GameContainer>
    );
  }

  const currentChallenge = challenges[current];
  const alreadyAnswered = completedIds.includes(currentChallenge.id);

  return (
    <GameContainer>
      {/* Floating Particles */}
      <FloatingParticles>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </FloatingParticles>

      {/* Confetti */}
      {confetti.map(confetto => (
        <Confetti
          key={confetto.id}
          style={{
            left: `${confetto.left}%`,
            animationDelay: `${confetto.delay}s`,
            animationDuration: `${confetto.duration}s`
          }}
        />
      ))}

      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4, zIndex: 2, width: '100%', maxWidth: '600px' }}>
        <Typography 
          variant="h2" 
          color="white" 
          sx={{ 
            fontWeight: "bold",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            mb: 2
          }}
        >
          Spell Master
        </Typography>
        
        {/* Level Information */}
        {currentChallenge.level && (
          <LevelInfoCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" color="#2c3e50" gutterBottom>
                  {currentChallenge.level.title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<AccessTime />} 
                  label={`${remainingAttempts} attempts left`} 
                  color={remainingAttempts > 0 ? "primary" : "error"}
                  size="small" 
                />
              </Box>
            </Box>
          </LevelInfoCard>
        )}
        
        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
          <ScoreBadge>
            <Star sx={{ fontSize: 20 }} />
            Score: {score}
          </ScoreBadge>
          <ScoreBadge sx={{ background: "linear-gradient(45deg, #2ed573, #1e90ff)" }}>
            <PlayArrow sx={{ fontSize: 20 }} />
            {current + 1} / {challenges.length}
          </ScoreBadge>
        </Box>
      </Box>

      {/* Main Game Card */}
      <Slide in={true} direction="up" timeout={500}>
        <MainCard>
          <CardContent sx={{ textAlign: "center" }}>

            {!showWordInfo ? (
              <>
                {/* Timer */}
                <TimerCircle percentage={timePercentage} isCritical={isCriticalTime}>
                  <TimerText isCritical={isCriticalTime}>
                    {timer}s
                  </TimerText>
                </TimerCircle>

                {alreadyAnswered && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    ✨ You've attempted this word before
                  </Alert>
                )}

                {/* Audio Section */}
                {currentChallenge.audioUrl && (
                  <>
                    <audio
  ref={audioRef}
  src={
    currentChallenge.audioUrl.startsWith("http")
      ? currentChallenge.audioUrl
      : `${window.location.origin}/${currentChallenge.audioUrl.replace(/^\/?/, "")}`
  }
  preload="auto"
/>
                    <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto" />
                    <audio ref={errorSoundRef} src="/sounds/error.mp3" preload="auto" />
                    
                    <PlayButton
                      variant="contained"
                      startIcon={<VolumeUp />}
                      onClick={handlePlayAudio}
                      disabled={timerStarted}
                      sx={{ mb: 4 }}
                    >
                      {timerStarted ? `Playing... (${timer}s)` : "Play Word"}
                    </PlayButton>
                  </>
                )}

                {/* Show hints when audio starts playing */}
                {showHint && (
                  <Fade in={true} timeout={800}>
                    <Box>
                      {currentChallenge.definition && (
                        <DefinitionBox>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Lightbulb sx={{ color: '#667eea', mr: 1 }} />
                            <Typography variant="h6" color="#495057">
                              Definition:
                            </Typography>
                          </Box>
                          <Typography variant="body1">
                            {currentChallenge.definition}
                          </Typography>
                        </DefinitionBox>
                      )}

                      {currentChallenge.exampleSentence && (
                        <ExampleBox>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <FormatQuote sx={{ color: '#ffa726', mr: 1 }} />
                            <Typography variant="h6" color="#495057">
                              Example Sentence:
                            </Typography>
                          </Box>
                          <Typography variant="body1">
                            "{currentChallenge.exampleSentence}"
                          </Typography>
                        </ExampleBox>
                      )}
                    </Box>
                  </Fade>
                )}

                {/* Input Section */}
                {!isSubmitted ? (
                  <Fade in={true} timeout={800}>
                    <Box>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Type the word you hear"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={!timerStarted}
                        autoFocus
                        sx={{
                          mb: 4,
                          mt: showHint ? 3 : 0,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "16px",
                            fontSize: "18px",
                            background: "white",
                            "&.Mui-focused fieldset": {
                              borderColor: isCriticalTime ? "#ff4757" : "#2ed573",
                              borderWidth: "2px",
                            }
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: isCriticalTime ? "#ff4757" : "#2ed573",
                          }
                        }}
                      />

                      <SubmitButton
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!timerStarted || !answer.trim()}
                        timer={timer}
                      >
                        {!timerStarted ? "Start First" : 
                         isCriticalTime ? "QUICK! SUBMIT! 🚀" : 
                         "Submit Answer"}
                      </SubmitButton>
                    </Box>
                  </Fade>
                ) : (
                  <Fade in={true} timeout={800}>
                    <Box>
                      <Typography 
                        variant="h4" 
                        color={resultType === "success" ? "#2ed573" : "#ff4757"}
                        sx={{ mb: 2, fontWeight: "bold" }}
                      >
                        {feedback}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Showing word details...
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </>
            ) : (
              /* Word Information after submission */
              <Fade in={true} timeout={800}>
                <Box>
                  <WordRevealCard>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold" }}>
                      {currentChallenge.word}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      The word was:
                    </Typography>
                  </WordRevealCard>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={nextChallenge}
                    sx={{
                      background: "linear-gradient(45deg, #667eea, #764ba2)",
                      borderRadius: "25px",
                      padding: "16px 40px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      mt: 2
                    }}
                  >
                    {current < challenges.length - 1 ? "Next Word" : "See Results"}
                  </Button>
                </Box>
              </Fade>
            )}
          </CardContent>
        </MainCard>
      </Slide>

      {/* Result Overlay */}
      {showResult && (
        <ResultOverlay type={resultType}>
          <Zoom in={true} timeout={500}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h1" sx={{ mb: 2, fontWeight: "bold" }}>
                {resultType === "success" ? "🎯 CORRECT!" : "💥 INCORRECT!"}
              </Typography>
              <Typography variant="h4" sx={{ opacity: 0.9 }}>
                {feedback}
              </Typography>
            </Box>
          </Zoom>
        </ResultOverlay>
      )}
    </GameContainer>
  );
}
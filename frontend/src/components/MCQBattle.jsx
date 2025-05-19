import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  {
    question: "Which sentence is correct?",
    options: [
      "She don't like apples.",
      "She doesn't likes apples.",
      "She doesn't like apples.",
      "She don't likes apples."
    ],
    correctAnswer: 2
  },
  {
    question: "Choose the correct form: 'He ____ to the store every day.'",
    options: [
      "go",
      "goes",
      "gone",
      "going"
    ],
    correctAnswer: 1
  },
  {
    question: "Which is a complete sentence?",
    options: [
      "Running in the park.",
      "Because it was raining.",
      "The cat slept on the mat.",
      "After the movie."
    ],
    correctAnswer: 2
  }
];

const TIMER_DURATION = 30;

export default function MCQBattle() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stars, setStars] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered]);

  const handleTimeUp = () => {
    setHearts(prev => prev - 1);
    setIsAnswered(true);
  };

  const handleAnswer = (answerIndex) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answerIndex);
    if (answerIndex !== QUESTIONS[currentQuestion].correctAnswer) {
      setHearts(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(TIMER_DURATION);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      setStars(hearts);
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setShowResults(false);
    setStars(0);
  };

  if (showResults) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 1000
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Grammowl Defeated!</h1>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ fontSize: '3rem', color: i < stars ? '#FFD700' : '#444', transition: 'color 0.3s' }}>★</div>
          ))}
        </div>
        <button onClick={handleRetry} style={{ padding: '12px 24px', fontSize: '1.1rem', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Try Again</button>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 1000 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Game Over</h1>
        <button onClick={handleRetry} style={{ padding: '12px 24px', fontSize: '1.1rem', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', zIndex: 1000, padding: '2rem' }}>
      {/* Hearts and Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ fontSize: '2rem', color: i < hearts ? '#ff4444' : '#444', transition: 'color 0.3s' }}>♥</div>
          ))}
        </div>
        <div style={{ fontSize: '1.5rem', color: timeLeft <= 10 ? '#ff4444' : '#fff', transition: 'color 0.3s' }}>{timeLeft}s</div>
      </div>
      {/* Question */}
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{QUESTIONS[currentQuestion].question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {QUESTIONS[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={isAnswered}
              style={{
                padding: '1rem',
                fontSize: '1.1rem',
                backgroundColor: selectedAnswer === index
                  ? index === QUESTIONS[currentQuestion].correctAnswer
                    ? '#4CAF50'
                    : '#ff4444'
                  : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isAnswered ? 'default' : 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      {/* Next Button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          style={{ padding: '12px 24px', fontSize: '1.1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {currentQuestion < QUESTIONS.length - 1 ? 'Next Question' : 'Finish'}
        </button>
      )}
    </div>
  );
} 
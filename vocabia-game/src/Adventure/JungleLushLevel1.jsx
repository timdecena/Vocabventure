import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLevelData, submitLevelProgress } from '../api/adventure';
import Timer from '../components/Timer';
import '../styles/Adventure.css';

export default function JungleLushLevel1() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');

  useEffect(() => {
    async function fetchLevel() {
      try {
        const data = await getLevelData(levelId);
        setLevel(data);
        // Simulate loading a question
        setQuestion("What is the plural form of 'mouse'?");
        setAnswer("mice");
      } catch (error) {
        console.error('Failed to load level', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLevel();
  }, [levelId]);

  const handleSubmitAnswer = () => {
    if (userAnswer.trim().toLowerCase() === answer.toLowerCase()) {
      setScore((prev) => prev + 10); // Award 10 points for correct answer
      alert('Correct!');
    } else {
      alert('Incorrect!');
    }
    finishBattle();
  };

  const finishBattle = async () => {
    try {
      await submitLevelProgress({
        levelId: parseInt(levelId),
        score,
        timeTaken,
      });
      alert('Battle Completed!');
      navigate('/adventure');
    } catch (error) {
      console.error('Failed to submit level progress', error);
    }
  };

  const handleTimeUp = (elapsedTime) => {
    setTimeTaken(elapsedTime);
    finishBattle();
  };

  if (loading) return <div>Loading...</div>;
  if (!level) return <div>Level not found</div>;

  return (
    <div className="level-container">
      <h2>{level.title}</h2>
      <p>{level.description}</p>
      <img src={level.imageUrl} alt={level.title} className="level-image" />

      <div className="battle-area">
        <Timer duration={60} onTimeUp={handleTimeUp} /> {/* 60 seconds timer */}
        <div className="question">{question}</div>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your Answer"
        />
        <button onClick={handleSubmitAnswer}>Submit Answer</button>
      </div>
    </div>
  );
}

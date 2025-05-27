import React, { useState } from 'react';
import api from "../api/api"; // ✅ CORRECT

export default function ArenaGame({ words, wordListId }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());

  const handleAnswer = (e) => {
    if (e.key === 'Enter') {
      const end = Date.now();
      const responseTime = (end - startTime) / 1000;
      const answer = {
        correctWord: words[step].correctWord,
        studentAnswer: e.target.value.trim(),
        responseTime
      };

      setAnswers([...answers, answer]);
      e.target.value = "";
      if (step + 1 < words.length) {
        setStep(step + 1);
        setStartTime(Date.now());
      } else {
        api.post('/arena/submit', { wordListId, answers: [...answers, answer] });
      }
    }
  };

  if (!words.length) return <p>Loading...</p>;

  return (
    <div>
      <h3>Definition:</h3>
      <p>{words[step].definition}</p>
      <input autoFocus onKeyDown={handleAnswer} placeholder="Type the word here..." />
      <p>{step + 1} / {words.length}</p>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function WordOfTheDayGame() {
  const [level, setLevel] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    api.get('/game/word-of-the-day')
      .then(res => setLevel(res.data))
      .catch(() => setFeedback("❌ Couldn't load today's word."));
  }, []);

  const handleSubmit = () => {
    if (!level || !level.word) return;
    if (answer.toLowerCase() === level.word.toLowerCase()) {
      api.post(`/game/word-of-the-day/submit?score=10`)
        .then(() => setFeedback("✅ Correct! Score saved."))
        .catch(err => setFeedback("❌ Already submitted or error"));
    } else {
      setFeedback("❌ Incorrect!");
    }
  };

  if (!level) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <p><b>Sentence:</b> The lawyer was so _________ that the jury was easily convinced.</p>
      <img src={level.imageUrl} alt="clue" style={{ width: 200 }} />
      <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your Answer" />
      <button onClick={handleSubmit}>Submit</button>
      <p>{feedback}</p>
    </div>
  );
}

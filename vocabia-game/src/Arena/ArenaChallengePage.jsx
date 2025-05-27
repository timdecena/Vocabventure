import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ArenaGame from './ArenaGame';
import api from '../api/api';

export default function ArenaChallengePage() {
  const { wordListId } = useParams(); // ✅ Get from URL
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (wordListId) {
      api.get(`/arena/start/${wordListId}`)
        .then(res => setWords(res.data))
        .catch(err => console.error("Failed to fetch words:", err));
    }
  }, [wordListId]);

  return <ArenaGame words={words} wordListId={wordListId} />;
}

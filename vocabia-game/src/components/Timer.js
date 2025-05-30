import React, { useState, useEffect } from 'react';

export default function Timer({ duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp(duration);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, duration, onTimeUp]);

  return (
    <div className="timer">
      <h3>Time Left: {timeLeft}s</h3>
    </div>
  );
}

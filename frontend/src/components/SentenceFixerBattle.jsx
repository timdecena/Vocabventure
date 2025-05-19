import React, { useState, useEffect } from 'react';
const PUZZLES = [
  {
    broken: 'the dog brown quick jumps fence the over',
    options: [
      'The quick brown dog jumps over the fence.',
      'The dog jumps quick brown over the fence.',
      'The brown quick dog jumps the fence over.',
      'The dog brown quick jumps fence the over.'
    ],
    correct: 0
  },
  {
    broken: 'to the store I went buy to milk',
    options: [
      'I went to the store to buy milk.',
      'To the store I went to buy milk.',
      'To buy milk I went to the store.',
      'To the store to buy milk I went.'
    ],
    correct: 0
  },
  {
    broken: 'raining it was so umbrella my took I',
    options: [
      'It was raining so I took my umbrella.',
      'I took my umbrella so it was raining.',
      'So it was raining I took my umbrella.',
      'Raining it was so umbrella my took I.'
    ],
    correct: 0
  }
];
const TIMER_DURATION = 30;
export default function SentenceFixerBattle() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stars, setStars] = useState(0);
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered]);
  const handleTimeUp = () => {
    setHearts(h => h - 1);
    setIsAnswered(true);
  };
  const handleSelect = (idx) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelected(idx);
    if (idx !== PUZZLES[currentPuzzle].correct) {
      setHearts(h => h - 1);
    }
  };
  const handleNext = () => {
    if (currentPuzzle < PUZZLES.length - 1) {
      setCurrentPuzzle(p => p + 1);
      setTimeLeft(TIMER_DURATION);
      setIsAnswered(false);
      setSelected(null);
    } else {
      setStars(hearts);
      setShowResults(true);
    }
  };
  const handleRetry = () => {
    setCurrentPuzzle(0);
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setIsAnswered(false);
    setSelected(null);
    setShowResults(false);
    setStars(0);
  };
  if (showResults) return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',color:'#fff',zIndex:1000}}>
      <h1 style={{fontSize:'2.5rem',marginBottom:'2rem'}}>Fraggmorr Defeated!</h1>
      <div style={{display:'flex',gap:'1rem',marginBottom:'2rem'}}>{[...Array(3)].map((_,i)=>(<div key={i} style={{fontSize:'3rem',color:i<stars?'#FFD700':'#444'}}>★</div>))}</div>
      <button onClick={handleRetry} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#666',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>Try Again</button>
    </div>
  );
  if (hearts<=0) return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',color:'#fff',zIndex:1000}}>
      <h1 style={{fontSize:'2.5rem',marginBottom:'2rem'}}>Game Over</h1>
      <button onClick={handleRetry} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#666',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>Try Again</button>
    </div>
  );
  const puzzle = PUZZLES[currentPuzzle];
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',color:'#fff',zIndex:1000,padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',width:'100%',maxWidth:'600px',marginBottom:'2rem'}}>
        <div style={{display:'flex',gap:'0.5rem'}}>{[...Array(3)].map((_,i)=>(<div key={i} style={{fontSize:'2rem',color:i<hearts?'#ff4444':'#444'}}>♥</div>))}</div>
        <div style={{fontSize:'1.5rem',color:timeLeft<=10?'#ff4444':'#fff'}}>{timeLeft}s</div>
      </div>
      <div style={{maxWidth:'600px',width:'100%',textAlign:'center',marginBottom:'2rem'}}>
        <h2 style={{fontSize:'1.5rem',marginBottom:'1rem'}}>Fix the sentence:</h2>
        <div style={{fontSize:'1.2rem',marginBottom:'1rem',color:'#FFD700'}}>{puzzle.broken}</div>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {puzzle.options.map((opt,idx)=>(
            <button key={idx} onClick={()=>handleSelect(idx)} disabled={isAnswered} style={{padding:'1rem',fontSize:'1.1rem',backgroundColor:selected===idx?(idx===puzzle.correct?'#4CAF50':'#ff4444'):'#333',color:'white',border:'none',borderRadius:'4px',cursor:isAnswered?'default':'pointer',transition:'background-color 0.3s'}}>{opt}</button>
          ))}
        </div>
      </div>
      {isAnswered && (
        <button onClick={handleNext} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>{currentPuzzle<PUZZLES.length-1?'Next Puzzle':'Finish'}</button>
      )}
    </div>
  );
} 
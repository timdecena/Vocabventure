import React, { useState, useEffect } from 'react';
const PUZZLES = [
  { word: 'SPELL', shuffled: 'LLEPS', hint: 'To form a word by putting letters together.' },
  { word: 'MAGIC', shuffled: 'GICAM', hint: 'A word for something supernatural.' },
  { word: 'WIZARD', shuffled: 'ZADWIR', hint: 'A person who uses magic.' }
];
const TIMER_DURATION = 30;
export default function WordBuilderBattle() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [input, setInput] = useState('');
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
  const handleSubmit = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    if (input.trim().toUpperCase() !== PUZZLES[currentPuzzle].word) {
      setHearts(h => h - 1);
    }
  };
  const handleNext = () => {
    if (currentPuzzle < PUZZLES.length - 1) {
      setCurrentPuzzle(p => p + 1);
      setTimeLeft(TIMER_DURATION);
      setIsAnswered(false);
      setInput('');
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
    setInput('');
    setShowResults(false);
    setStars(0);
  };
  if (showResults) return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',color:'#fff',zIndex:1000}}>
      <h1 style={{fontSize:'2.5rem',marginBottom:'2rem'}}>Spellisk Defeated!</h1>
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
        <h2 style={{fontSize:'1.5rem',marginBottom:'1rem'}}>Unscramble the word:</h2>
        <div style={{fontSize:'2rem',letterSpacing:'0.5rem',marginBottom:'1rem'}}>{puzzle.shuffled.split('').join(' ')}</div>
        <div style={{fontSize:'1rem',marginBottom:'1rem',color:'#FFD700'}}>{puzzle.hint}</div>
        <input value={input} onChange={e=>setInput(e.target.value)} disabled={isAnswered} style={{padding:'0.5rem',fontSize:'1.1rem',borderRadius:'4px',border:'1px solid #ccc',marginBottom:'1rem'}} />
        <br/>
        <button onClick={handleSubmit} disabled={isAnswered} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'4px',cursor:isAnswered?'default':'pointer'}}>Submit</button>
      </div>
      {isAnswered && (
        <button onClick={handleNext} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>{currentPuzzle<PUZZLES.length-1?'Next Puzzle':'Finish'}</button>
      )}
    </div>
  );
} 
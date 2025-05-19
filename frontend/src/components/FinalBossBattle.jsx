import React, { useState, useEffect } from 'react';

// --- Question Pools ---
const MCQ = [
  {
    type: 'mcq',
    question: "Which is the correct sentence?",
    options: [
      "He go to school every day.",
      "He goes to school every day.",
      "He going to school every day.",
      "He gone to school every day."
    ],
    correct: 1
  },
  {
    type: 'mcq',
    question: "Choose the correct form: 'They ____ finished their work.'",
    options: ["has", "have", "having", "had"],
    correct: 1
  }
];
const WORD_BUILDER = [
  {
    type: 'word',
    word: 'DRAGON',
    shuffled: 'GDRONA',
    hint: 'A mythical fire-breathing creature.'
  },
  {
    type: 'word',
    word: 'SPELLING',
    shuffled: 'LINGSPEL',
    hint: 'The process of forming words with letters.'
  }
];
const SENTENCE_FIXER = [
  {
    type: 'sentence',
    broken: 'the volcano erupted suddenly',
    options: [
      'The volcano erupted suddenly.',
      'Suddenly the volcano erupted.',
      'Erupted the volcano suddenly.',
      'The suddenly volcano erupted.'
    ],
    correct: 0
  },
  {
    type: 'sentence',
    broken: 'bravely knight the fought dragon the',
    options: [
      'The knight bravely fought the dragon.',
      'Bravely the knight fought dragon the.',
      'The dragon fought bravely the knight.',
      'Knight the bravely fought the dragon.'
    ],
    correct: 0
  }
];
const READING_PUZZLE = [
  {
    type: 'reading',
    passage: 'Dysauron, the ancient word dragon, guards the final scroll. Only the bravest can defeat him.',
    question: 'Who guards the final scroll?',
    options: ['The wizard', 'Dysauron', 'The knight', 'The owl'],
    correct: 1
  },
  {
    type: 'reading',
    passage: 'A volcano can erupt with little warning, sending ash and lava into the sky.',
    question: 'What can a volcano send into the sky?',
    options: ['Water', 'Ash and lava', 'Sand', 'Snow'],
    correct: 1
  }
];

// --- Mix and shuffle questions ---
function getRandomQuestions() {
  const all = [
    ...MCQ,
    ...WORD_BUILDER,
    ...SENTENCE_FIXER,
    ...READING_PUZZLE
  ];
  // Shuffle and pick 6
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, 6);
}

const TIMER_DURATION = 20;

export default function FinalBossBattle() {
  const [questions, setQuestions] = useState(getRandomQuestions());
  const [current, setCurrent] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stars, setStars] = useState(0);
  const [showEnding, setShowEnding] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

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

  // --- Handlers for each type ---
  const handleMCQ = idx => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelected(idx);
    if (idx !== questions[current].correct) setHearts(h => h - 1);
  };
  const handleWord = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    if (input.trim().toUpperCase() !== questions[current].word) setHearts(h => h - 1);
  };
  const handleSentence = idx => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelected(idx);
    if (idx !== questions[current].correct) setHearts(h => h - 1);
  };
  const handleReading = idx => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelected(idx);
    if (idx !== questions[current].correct) setHearts(h => h - 1);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setTimeLeft(TIMER_DURATION);
      setIsAnswered(false);
      setSelected(null);
      setInput('');
    } else {
      setStars(hearts);
      setShowResults(true);
    }
  };
  const handleRetry = () => {
    setQuestions(getRandomQuestions());
    setCurrent(0);
    setHearts(3);
    setTimeLeft(TIMER_DURATION);
    setIsAnswered(false);
    setSelected(null);
    setInput('');
    setShowResults(false);
    setStars(0);
    setShowEnding(false);
    setShowCongrats(false);
  };

  // --- Ending cutscene and congrats ---
  if (showCongrats) {
    return (
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#222',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#fff',zIndex:1000}}>
        <h1 style={{fontSize:'3rem',marginBottom:'2rem'}}>Congratulations!</h1>
        <p style={{fontSize:'1.3rem',marginBottom:'2rem',maxWidth:600,textAlign:'center'}}>You have defeated Dysauron and restored peace to Vocabia!<br/>Thank you for playing VocabVenture.</p>
        <div style={{fontSize:'2.5rem',color:'#FFD700',marginBottom:'2rem'}}>🏆</div>
        <button onClick={handleRetry} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>Play Again</button>
      </div>
    );
  }
  if (showEnding) {
    return (
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#111',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#fff',zIndex:1000}}>
        <h1 style={{fontSize:'2.5rem',marginBottom:'1.5rem'}}>Dysauron is vanquished!</h1>
        <div style={{fontSize:'2rem',marginBottom:'1.5rem'}}>🌋 🐉 ✨</div>
        <p style={{fontSize:'1.2rem',maxWidth:600,textAlign:'center',marginBottom:'2rem'}}>
          As Dysauron falls, the skies clear and the land of Vocabia is filled with light.<br/>
          The final scroll is yours, and the power of words is restored.<br/>
          The people of Vocabia cheer your name!
        </p>
        <button onClick={()=>setShowCongrats(true)} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#FFD700',color:'#222',border:'none',borderRadius:'4px',cursor:'pointer'}}>Continue</button>
      </div>
    );
  }
  if (showResults) {
    return (
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.95)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',color:'#fff',zIndex:1000}}>
        <h1 style={{fontSize:'2.5rem',marginBottom:'2rem'}}>Dysauron Defeated!</h1>
        <div style={{display:'flex',gap:'1rem',marginBottom:'2rem'}}>{[...Array(3)].map((_,i)=>(<div key={i} style={{fontSize:'3rem',color:i<stars?'#FFD700':'#444'}}>★</div>))}</div>
        <button onClick={()=>setShowEnding(true)} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#FFD700',color:'#222',border:'none',borderRadius:'4px',cursor:'pointer'}}>See Ending</button>
      </div>
    );
  }
  if (hearts<=0) {
    return (
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.95)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',color:'#fff',zIndex:1000}}>
        <h1 style={{fontSize:'2.5rem',marginBottom:'2rem'}}>Game Over</h1>
        <button onClick={handleRetry} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#666',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>Try Again</button>
      </div>
    );
  }

  // --- Render current question by type ---
  const q = questions[current];
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.95)',display:'flex',flexDirection:'column',alignItems:'center',color:'#fff',zIndex:1000,padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',width:'100%',maxWidth:'600px',marginBottom:'2rem'}}>
        <div style={{display:'flex',gap:'0.5rem'}}>{[...Array(3)].map((_,i)=>(<div key={i} style={{fontSize:'2rem',color:i<hearts?'#ff4444':'#444'}}>♥</div>))}</div>
        <div style={{fontSize:'1.5rem',color:timeLeft<=7?'#ff4444':'#fff'}}>{timeLeft}s</div>
      </div>
      {/* Render by type */}
      {q.type==='mcq' && (
        <div style={{maxWidth:'600px',width:'100%',textAlign:'center',marginBottom:'2rem'}}>
          <h2 style={{fontSize:'1.5rem',marginBottom:'1rem'}}>{q.question}</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {q.options.map((opt,idx)=>(
              <button key={idx} onClick={()=>handleMCQ(idx)} disabled={isAnswered} style={{padding:'1rem',fontSize:'1.1rem',backgroundColor:selected===idx?(idx===q.correct?'#4CAF50':'#ff4444'):'#333',color:'white',border:'none',borderRadius:'4px',cursor:isAnswered?'default':'pointer',transition:'background-color 0.3s'}}>{opt}</button>
            ))}
          </div>
        </div>
      )}
      {q.type==='word' && (
        <div style={{maxWidth:'600px',width:'100%',textAlign:'center',marginBottom:'2rem'}}>
          <h2 style={{fontSize:'1.5rem',marginBottom:'1rem'}}>Unscramble the word:</h2>
          <div style={{fontSize:'2rem',letterSpacing:'0.5rem',marginBottom:'1rem'}}>{q.shuffled.split('').join(' ')}</div>
          <div style={{fontSize:'1rem',marginBottom:'1rem',color:'#FFD700'}}>{q.hint}</div>
          <input value={input} onChange={e=>setInput(e.target.value)} disabled={isAnswered} style={{padding:'0.5rem',fontSize:'1.1rem',borderRadius:'4px',border:'1px solid #ccc',marginBottom:'1rem'}} />
          <br/>
          <button onClick={handleWord} disabled={isAnswered} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'4px',cursor:isAnswered?'default':'pointer'}}>Submit</button>
        </div>
      )}
      {q.type==='sentence' && (
        <div style={{maxWidth:'600px',width:'100%',textAlign:'center',marginBottom:'2rem'}}>
          <h2 style={{fontSize:'1.5rem',marginBottom:'1rem'}}>Fix the sentence:</h2>
          <div style={{fontSize:'1.2rem',marginBottom:'1rem',color:'#FFD700'}}>{q.broken}</div>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {q.options.map((opt,idx)=>(
              <button key={idx} onClick={()=>handleSentence(idx)} disabled={isAnswered} style={{padding:'1rem',fontSize:'1.1rem',backgroundColor:selected===idx?(idx===q.correct?'#4CAF50':'#ff4444'):'#333',color:'white',border:'none',borderRadius:'4px',cursor:isAnswered?'default':'pointer',transition:'background-color 0.3s'}}>{opt}</button>
            ))}
          </div>
        </div>
      )}
      {q.type==='reading' && (
        <div style={{maxWidth:'600px',width:'100%',textAlign:'center',marginBottom:'2rem'}}>
          <h2 style={{fontSize:'1.5rem',marginBottom:'1rem'}}>Read and answer:</h2>
          <div style={{fontSize:'1.1rem',marginBottom:'1rem',color:'#FFD700'}}>{q.passage}</div>
          <div style={{fontWeight:'bold',marginBottom:'1rem'}}>{q.question}</div>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {q.options.map((opt,idx)=>(
              <button key={idx} onClick={()=>handleReading(idx)} disabled={isAnswered} style={{padding:'1rem',fontSize:'1.1rem',backgroundColor:selected===idx?(idx===q.correct?'#4CAF50':'#ff4444'):'#333',color:'white',border:'none',borderRadius:'4px',cursor:isAnswered?'default':'pointer',transition:'background-color 0.3s'}}>{opt}</button>
            ))}
          </div>
        </div>
      )}
      {/* Next Button */}
      {isAnswered && (
        <button onClick={handleNext} style={{padding:'12px 24px',fontSize:'1.1rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>{current<questions.length-1?'Next':'Finish'}</button>
      )}
    </div>
  );
} 
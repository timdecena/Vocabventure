import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StoryIntro() {
  const [currentLine, setCurrentLine] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  const storyLines = [
    "You are the chosen one the prophecy has foretold...",
    "Your life is about to change...",
    "A great evil has returned to Vocabia...",
    "The land of words and knowledge is in peril...",
    "Only you can restore the power of vocabulary..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLine(prev => {
        if (prev < storyLines.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => setShowWizard(true), 2000);
          return prev;
        }
      });
    }, 3000); // Show each line for 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {!showWizard ? (
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          {storyLines.map((line, index) => (
            <div
              key={index}
              style={{
                opacity: currentLine >= index ? 1 : 0,
                transform: `translateY(${currentLine >= index ? '0' : '20px'})`,
                transition: 'opacity 1s ease-in-out, transform 1s ease-in-out',
                marginBottom: '20px',
                fontSize: '1.5rem',
                color: '#fff',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
              }}
            >
              {line}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '20px',
          animation: 'fadeIn 1s ease-in-out'
        }}>
          <div style={{
            width: '150px',
            height: '150px',
            margin: '0 auto 20px',
            background: 'url("/assets/wizard.png") center/contain no-repeat',
            animation: 'float 3s ease-in-out infinite'
          }} />
          <div style={{
            fontSize: '1.2rem',
            color: '#fff',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            "Ah, young adventurer! I've been expecting you. The ancient scrolls speak of your arrival.
            The realm of Vocabia needs your help. Dark forces are corrupting our words, making them lose their meaning.
            You must learn the ancient arts of vocabulary to restore balance to our world.
            Are you ready to begin your training?"
          </div>
          <button
            onClick={() => navigate('/tutorial-battle')}
            style={{
              padding: '12px 24px',
              fontSize: '1.1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'transform 0.2s, background-color 0.2s',
              ':hover': {
                transform: 'scale(1.05)',
                backgroundColor: '#45a049'
              }
            }}
          >
            Begin Training
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
} 
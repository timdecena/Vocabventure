import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import DreamIntro from './scenes/DreamIntro';
import WizardScene from './scenes/WizardScene';
import VillageScene from './scenes/VillageScene';
import TutorialBattle from './battle/TutorialBattle';
import VictoryScene from './scenes/VictoryScene';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const FullScreenContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000', // fully opaque black background
  color: 'white',
  overflow: 'hidden',
}));

const QuitButton = styled(Button)(({ theme, fixed }) => ({
  backgroundColor: 'rgba(255, 0, 0, 0.7)',
  color: 'white',
  zIndex: 3000,
  pointerEvents: 'auto',
  position: fixed ? 'fixed' : 'static',
  top: fixed ? '24px' : undefined,
  right: fixed ? '24px' : undefined,
  '&:hover': {
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
  },
}));

const TutorialSequence = ({ onClose }) => {
  const [currentScene, setCurrentScene] = useState('dream');
  const [battleResults, setBattleResults] = useState(null);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  const [profileDebug, setProfileDebug] = useState(null); // For debug info
  
  // Add battle state preservation
  const [battleState, setBattleState] = useState(null);
  
  const navigate = useNavigate();

  // Check if user is new (no adventure profile or tutorial not completed)
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Use the main API helper to get the adventure profile
        const res = await api.get(`/api/adventure/profile`);
        setProfileDebug(res.data); // Save profile data for debug
        if (res.data && typeof res.data === 'object') {
          setIsNewUser(!res.data.tutorialCompleted);
          setHasCompletedTutorial(res.data.tutorialCompleted === true);
          console.log('Tutorial completion status:', res.data.tutorialCompleted);
        } else {
          setIsNewUser(true);
          setHasCompletedTutorial(false);
        }
      } catch (err) {
        setProfileDebug('Error fetching profile: ' + (err?.message || err));
        setIsNewUser(true);
        setHasCompletedTutorial(false);
      }
    };
    checkUserStatus();
  }, []);

  // Add debug log for isNewUser state
  useEffect(() => {
    console.log('isNewUser state changed:', isNewUser);
  }, [isNewUser]);

  const handleSceneComplete = (nextScene) => {
    setCurrentScene(nextScene);
  };

  const handleBattleComplete = (results) => {
    if (results.quitToHome) {
      navigate('/home');
      return;
    }
    setBattleResults(results);
    setBattleState(null); // Clear battle state on completion
    setCurrentScene('victory');
    // Mark tutorial as completed
    const markTutorialCompleted = async () => {
      try {
        await api.post(`/api/adventure/profile/complete-tutorial`);
        setHasCompletedTutorial(true);
        setIsNewUser(false);
      } catch (err) {
        console.error('Failed to mark tutorial as completed:', err);
      }
    };
    markTutorialCompleted();
  };

  // Handle battle state changes (save current state)
  const handleBattleStateChange = (state) => {
    setBattleState(state);
  };

  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitCancel = () => {
    setShowQuitDialog(false);
  };

  const renderScene = () => {
    switch (currentScene) {
      case 'dream':
        return <DreamIntro onComplete={() => handleSceneComplete('wizard')} />;
      case 'wizard':
        return <WizardScene onComplete={() => handleSceneComplete('village')} />;
      case 'village':
        return <VillageScene onComplete={() => handleSceneComplete('battle')} />;
      case 'battle':
        return <TutorialBattle 
          onComplete={handleBattleComplete} 
          onStateChange={handleBattleStateChange}
          initialState={battleState}
          showQuitButton 
          onQuit={handleQuitClick} 
          quitButtonText={isNewUser ? 'Quit Tutorial' : 'Exit Tutorial'} 
        />;
      case 'victory':
        return <VictoryScene results={battleResults} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <FullScreenContainer>
      {currentScene === 'battle' ? null : (
        <QuitButton
          variant="contained"
          color="error"
          onClick={handleQuitClick}
          fixed
        >
          {isNewUser ? 'Quit Tutorial' : 'Exit Tutorial'}
        </QuitButton>
      )}

      {!showQuitDialog && renderScene()}

      <Dialog
        open={showQuitDialog}
        onClose={handleQuitCancel}
        PaperProps={{
          style: {
            background: 'linear-gradient(145deg, #2a2a3e 0%, #1e1e2f 50%, #16213e 100%)',
            color: '#fff',
            borderRadius: '24px',
            border: '3px solid rgba(255, 215, 0, 0.3)',
            minWidth: '420px',
            maxWidth: '90vw',
            padding: '8px',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.6),
              0 10px 30px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            position: 'relative',
            overflow: 'visible',
          },
        }}
        sx={{ 
          zIndex: 4000, 
          '& .MuiBackdrop-root': { 
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)'
          } 
        }}
      >
        <DialogTitle sx={{
          fontFamily: '"Cinzel", "Serif", Georgia, serif',
          fontWeight: 800,
          fontSize: '1.8rem',
          color: '#FFD700',
          textAlign: 'center',
          textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)',
          padding: '24px 24px 12px 24px',
          position: 'relative',
          '&::before': {
            content: '"⚔️"',
            marginRight: '12px',
          },
          '&::after': {
            content: '"⚔️"',
            marginLeft: '12px',
          },
        }}>
          Quit Tutorial?
        </DialogTitle>
        <DialogContent sx={{
          padding: '16px 32px 24px 32px',
          textAlign: 'center',
        }}>
          <Typography sx={{
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            fontSize: '1.1rem',
            color: '#E6E6FA',
            lineHeight: 1.6,
            textShadow: '0 1px 5px rgba(230, 230, 250, 0.3)',
          }}>
            {isNewUser
              ? "⚠️ Are you sure you want to quit the tutorial? Your progress will be lost and you'll need to start over."
              : "🎯 Are you sure you want to exit the tutorial? You can continue where you left off anytime."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          padding: '0 24px 24px 24px',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Button 
            onClick={handleQuitCancel} 
            variant="contained"
            sx={{
              background: 'linear-gradient(145deg, #4CAF50 0%, #45a049 30%, #3d8b40 100%)',
              color: '#fff',
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: '16px',
              padding: '12px 24px',
              border: '2px solid #2e7d32',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4), 0 3px 10px rgba(0, 0, 0, 0.3)',
              textTransform: 'none',
              letterSpacing: '0.5px',
              minWidth: '140px',
              transition: 'all 0.3s ease',
              '&::before': {
                content: '"▶️"',
                marginRight: '8px',
              },
              '&:hover': {
                background: 'linear-gradient(145deg, #66bb6a 0%, #4caf50 30%, #388e3c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
              },
            }}
          >
            Continue Tutorial
          </Button>
          {hasCompletedTutorial && (
            <Button 
              onClick={() => { if (onClose) onClose(); navigate('/map'); }} 
              variant="contained"
              sx={{
                background: 'linear-gradient(145deg, #2196F3 0%, #1976D2 30%, #1565C0 100%)',
                color: '#fff',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: '16px',
                padding: '12px 24px',
                border: '2px solid #0d47a1',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4), 0 3px 10px rgba(0, 0, 0, 0.3)',
                textTransform: 'none',
                letterSpacing: '0.5px',
                minWidth: '140px',
                transition: 'all 0.3s ease',
                '&::before': {
                  content: '"🗺️"',
                  marginRight: '8px',
                },
                '&:hover': {
                  background: 'linear-gradient(145deg, #42a5f5 0%, #2196f3 30%, #1976d2 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(33, 150, 243, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
                },
              }}
            >
              Return to Map
            </Button>
          )}
          <Button 
            onClick={() => navigate('/home')} 
            variant="contained"
            sx={{
              background: 'linear-gradient(145deg, #f44336 0%, #e53935 30%, #d32f2f 100%)',
              color: '#fff',
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: '16px',
              padding: '12px 24px',
              border: '2px solid #c62828',
              boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4), 0 3px 10px rgba(0, 0, 0, 0.3)',
              textTransform: 'none',
              letterSpacing: '0.5px',
              minWidth: '140px',
              transition: 'all 0.3s ease',
              '&::before': {
                content: '"🏠"',
                marginRight: '8px',
              },
              '&:hover': {
                background: 'linear-gradient(145deg, #ef5350 0%, #f44336 30%, #e53935 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(244, 67, 54, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)',
              },
            }}
          >
            Quit to Homepage
          </Button>
        </DialogActions>
      </Dialog>
    </FullScreenContainer>
  );
};

export default TutorialSequence; 
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import DreamIntro from './scenes/DreamIntro';
import WizardScene from './scenes/WizardScene';
import VillageScene from './scenes/VillageScene';
import TutorialBattle from './battle/TutorialBattle';
import VictoryScene from './scenes/VictoryScene';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const navigate = useNavigate();

  // Check if user is new (no adventure profile or tutorial not completed)
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setIsNewUser(true);
          setProfileDebug('No user in localStorage');
          return;
        }
        const user = JSON.parse(userStr);
        const res = await axios.get(`http://localhost:8081/api/adventure-profile?userId=${user.id}`, { withCredentials: true });
        setProfileDebug(res.data); // Save profile data for debug
        
        if (res.data && typeof res.data === 'object') {
          // If the user has any adventure profile, treat as returning user
          setIsNewUser(false);
          // Check if tutorial is completed
          const tutorialCompleted = res.data.tutorialCompleted === true;
          setHasCompletedTutorial(tutorialCompleted);
          console.log('Tutorial completion status:', tutorialCompleted);
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
    setCurrentScene('victory');
    // Mark tutorial as completed
    const markTutorialCompleted = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const response = await axios.put(`http://localhost:8081/api/adventure-profile/complete-tutorial?userId=${user.id}`, {}, { withCredentials: true });
        if (response.data) {
          setHasCompletedTutorial(true);
          setIsNewUser(false);
        }
      } catch (err) {
        console.error('Failed to mark tutorial as completed:', err);
      }
    };
    markTutorialCompleted();
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
        return <TutorialBattle onComplete={handleBattleComplete} showQuitButton onQuit={handleQuitClick} quitButtonText={isNewUser ? 'Quit Tutorial' : 'Exit Tutorial'} />;
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
            backgroundColor: '#1e1e1e', // fully opaque dark
            color: 'white',
            minWidth: '300px',
            zIndex: 4000,
            position: 'fixed',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
          },
        }}
        sx={{ zIndex: 4000, '& .MuiBackdrop-root': { backgroundColor: 'rgba(0,0,0,0.7)' } }}
      >
        <DialogTitle>Quit Tutorial?</DialogTitle>
        <DialogContent>
          <Typography>
            {isNewUser
              ? "Are you sure you want to quit the tutorial? Your progress will be lost."
              : "Are you sure you want to exit the tutorial?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQuitCancel} color="primary" variant="contained">
            Continue Tutorial
          </Button>
          <Button onClick={() => { if (onClose) onClose(); navigate('/map'); }} color="secondary" variant="contained">
            Return to Map
          </Button>
          {isNewUser ? (
            <Button onClick={() => navigate('/home')} color="error" variant="contained">
              Quit to Homepage
            </Button>
          ) : (
            <Button onClick={() => navigate('/home')} color="error" variant="contained">
              Return to Home
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </FullScreenContainer>
  );
};

export default TutorialSequence; 
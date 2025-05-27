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
  backgroundColor: 'black',
  color: 'white',
  overflow: 'hidden',
}));

const QuitButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  right: '20px',
  backgroundColor: 'rgba(255, 0, 0, 0.7)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
  },
  zIndex: 1000,
}));

const TutorialSequence = () => {
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
        return <TutorialBattle onComplete={handleBattleComplete} />;
      case 'victory':
        return <VictoryScene results={battleResults} />;
      default:
        return null;
    }
  };

  return (
    <FullScreenContainer>
      <QuitButton
        variant="contained"
        onClick={handleQuitClick}
      >
        {isNewUser ? 'Quit Tutorial' : 'Exit Tutorial'}
      </QuitButton>

      {!showQuitDialog && renderScene()}

      <Dialog
        open={showQuitDialog}
        onClose={handleQuitCancel}
        PaperProps={{
          style: {
            backgroundColor: '#1a1a1a',
            color: 'white',
            minWidth: '300px',
          },
        }}
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
          {isNewUser ? (
            <Button onClick={() => navigate('/home')} color="error" variant="contained">
              Quit Tutorial
            </Button>
          ) : (
            <>
              <Button onClick={() => navigate('/home')} color="error" variant="contained">
                Return to Home
              </Button>
              {hasCompletedTutorial && (
                <Button onClick={() => navigate('/map')} color="secondary" variant="contained">
                  Return to Map
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </FullScreenContainer>
  );
};

export default TutorialSequence; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLevelData } from '../api/adventure';
import MapView from './MapView';
import ProgressStats from '../components/ProgressStats';
import StoryIntro from '../components/StoryIntro';
import '../styles/Adventure.css';

export default function Adventure() {
  const [showStory, setShowStory] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Example: Fetch user progress to decide if StoryIntro should be shown
    async function fetchProgress() {
      try {
        // Simulate fetching user story progress
        const storySeen = localStorage.getItem('storySeen');
        if (!storySeen) {
          setShowStory(true);
        }
      } catch (error) {
        console.error('Failed to load progress', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (showStory) {
    return <StoryIntro onComplete={() => setShowStory(false)} />;
  }

  return (
    <div className="adventure-container">
      <ProgressStats />
      <MapView />
    </div>
  );
}

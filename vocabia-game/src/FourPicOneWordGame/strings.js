// Centralized strings for Four Pics One Word UI
// Helps avoid hardcoded strings sprinkled across JSX

export const STRINGS = {
  LEVEL_COMPLETE_TITLE: 'LEVEL COMPLETE!',
  CATEGORY_COMPLETE_TITLE: 'CATEGORY COMPLETE!'
};

export const formatters = {
  formatTime: (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  },
  levelCompleteSubtext: () => 'You have completed this level.',
  categoryCompleteSubtext: (category) => `You have completed all levels in ${category}.`,
  nextLevelButton: () => 'Next Level',
  backToLevelsButton: () => 'Back to Levels'
};

export const LEVEL_LIST_STRINGS = {
  play: 'Play Level',
  locked: 'Locked',
  progress: 'Progress',
  chooseChallenge: 'Choose your challenge',
  noLevels: 'No levels available for this category.'
};

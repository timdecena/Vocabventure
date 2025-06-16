/**
 * Utility functions for managing localStorage data
 */

/**
 * Clears all game progress data from localStorage
 * This includes:
 * - Authentication tokens
 * - User role
 * - Game progress for all categories
 * - Any other game-related data
 */
export const clearAllGameData = () => {
    try {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Find and clear all game progress data
      const keysToRemove = [];
      
      // Identify all keys related to game progress
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Match patterns for game progress data
        if (key && (
          key.startsWith('vocabVenture_') || // Game progress
          key.includes('_completed') ||      // Level completion data
          key.includes('_progress') ||       // Progress tracking
          key.includes('_game_state') ||     // Game state
          key.includes('_hints') ||          // Hint usage
          key.includes('_score')             // Score data
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all identified keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`Cleared ${keysToRemove.length} game progress items from localStorage`);
      return true;
    } catch (error) {
      console.error('Error clearing game data from localStorage:', error);
      return false;
    }
  };
  
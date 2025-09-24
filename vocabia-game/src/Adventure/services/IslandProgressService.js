import axios from 'axios';

/**
 * Service for managing island progress with the new standardized API
 */
class IslandProgressService {
  constructor() {
    this.baseUrl = '/api/adventure/island-progress';
  }

  /**
   * Island name constants
   */
  static ISLANDS = {
    JUNGLE_LUSH: 'Jungle Lush',
    WATERSIDE_SHORES: 'Waterside Shores',
    SHADOW_ISLES: 'The Shadow Isles'
  };

  /**
   * Update progress when completing a level
   * @param {string} islandName - Name of the island
   * @param {number} completedLevel - Level number completed
   * @param {number} starsEarned - Stars earned for this completion
   */
  async updateProgress(islandName, completedLevel, starsEarned = 0) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${this.baseUrl}/${encodeURIComponent(islandName)}/update`,
        {
          completedLevel,
          starsEarned
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update island progress:', error);
      throw error;
    }
  }

  /**
   * Get progress for all islands
   */
  async getAllProgress() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(this.baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get all progress:', error);
      throw error;
    }
  }

  /**
   * Get progress for a specific island
   * @param {string} islandName - Name of the island
   */
  async getIslandProgress(islandName) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${this.baseUrl}/${encodeURIComponent(islandName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get island progress:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed a specific level
   * @param {string} islandName - Name of the island
   * @param {number} level - Level number to check
   */
  async hasCompletedLevel(islandName, level) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${this.baseUrl}/${encodeURIComponent(islandName)}/completed/${level}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      return response.data.completed;
    } catch (error) {
      console.error('Failed to check level completion:', error);
      return false;
    }
  }

  /**
   * Get user's total stars across all islands
   */
  async getTotalStars() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${this.baseUrl}/total-stars`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      return response.data.totalStars;
    } catch (error) {
      console.error('Failed to get total stars:', error);
      return 0;
    }
  }

  /**
   * Reset progress for an island (for testing)
   * @param {string} islandName - Name of the island
   */
  async resetIslandProgress(islandName) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${this.baseUrl}/${encodeURIComponent(islandName)}/reset`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to reset island progress:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * Converts old level names to new format
   */
  async saveLevelProgress(levelName, completed, starsEarned = 0) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${this.baseUrl}/save`,
        {
          levelName,
          completed,
          starsEarned
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to save level progress:', error);
      throw error;
    }
  }

  /**
   * Helper method to get level number from level name
   * @param {string} levelName - Name of the level
   */
  static getLevelNumberFromName(levelName) {
    if (levelName.includes("Commawidow's Web")) return 1;
    if (levelName.includes("Tensaphant's Tense")) return 2;
    if (levelName.includes("Pluribog's Pit")) return 3;
    if (levelName.includes("Triple Threat")) return 4;
    if (levelName.includes("Grammowl's Gauntlet")) return 5;
    return 1; // Default fallback
  }

  /**
   * Helper method to get island name from level name
   * @param {string} levelName - Name of the level
   */
  static getIslandNameFromLevel(levelName) {
    // For now, all existing levels are Jungle Lush
    // This can be expanded for other islands
    return IslandProgressService.ISLANDS.JUNGLE_LUSH;
  }
}

export default IslandProgressService;

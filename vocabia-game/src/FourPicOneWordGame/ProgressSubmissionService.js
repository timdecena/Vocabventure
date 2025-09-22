// Enhanced Progress Submission Service
// Handles all user progress submissions with comprehensive error handling and retry logic

import api from '../api/api';

class ProgressSubmissionService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Submit progress with comprehensive error handling and retry logic
   */
  async submitProgress(category, level, answer, usedHint) {
    console.log('🎯 ProgressSubmissionService.submitProgress called');
    console.log('📋 Payload:', { category, level, answer, usedHint });

    // Validate inputs
    if (!category || typeof category !== 'string') {
      throw new Error('Invalid category provided');
    }
    
    if (!level || level <= 0) {
      throw new Error('Invalid level provided');
    }

    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No authentication token found - saving to local storage only');
      this.saveToLocalStorage(category, level, answer, usedHint);
      return { success: true, source: 'localStorage' };
    }

    // Prepare payload exactly matching backend DTO
    const payload = {
      category: category.trim(),
      level: parseInt(level, 10),
      answer: answer ? answer.trim() : '',
      usedHint: Boolean(usedHint)
    };

    console.log('📤 Sending payload to backend:', payload);

    // Attempt submission with retry logic
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Submission attempt ${attempt}/${this.maxRetries}`);
        
        const response = await api.post('/api/user-progress/submit', payload);
        
        console.log('✅ Progress submitted successfully:', response.data);
        
        // Also save to local storage as backup
        this.saveToLocalStorage(category, level, answer, usedHint);
        
        return {
          success: true,
          source: 'backend',
          data: response.data,
          attempt: attempt
        };

      } catch (error) {
        console.error(`❌ Submission attempt ${attempt} failed:`, error);
        
        // Check if it's a 403/401 error (authentication issue)
        if (error.response?.status === 403 || error.response?.status === 401) {
          console.error('🔒 Authentication error - token may be invalid');
          
          // Clear invalid token and save to local storage
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          
          this.saveToLocalStorage(category, level, answer, usedHint);
          
          return {
            success: false,
            error: 'Authentication failed',
            source: 'localStorage',
            needsReauth: true
          };
        }

        // Check if it's a server error (5xx)
        if (error.response?.status >= 500) {
          console.error('🔥 Server error detected');
          
          if (attempt < this.maxRetries) {
            console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
            await this.delay(this.retryDelay);
            continue; // Retry
          }
        }

        // If this is the last attempt or a non-retryable error
        if (attempt === this.maxRetries) {
          console.error('💀 All submission attempts failed');
          
          // Save to local storage as fallback
          this.saveToLocalStorage(category, level, answer, usedHint);
          
          return {
            success: false,
            error: error.message,
            source: 'localStorage',
            attempts: attempt
          };
        }
      }
    }
  }

  /**
   * Save progress to local storage as fallback
   */
  saveToLocalStorage(category, level, answer, usedHint) {
    try {
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      // Save completed level
      const completedKey = `vocabVenture_${userId}_${category}_completed`;
      const existingCompleted = JSON.parse(localStorage.getItem(completedKey) || '{}');
      existingCompleted[level] = {
        completed: true,
        answer: answer,
        usedHint: usedHint,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(completedKey, JSON.stringify(existingCompleted));
      
      // Update highest level
      const highestKey = `vocabVenture_${userId}_${category}_highest`;
      const currentHighest = parseInt(localStorage.getItem(highestKey) || '0', 10);
      if (level > currentHighest) {
        localStorage.setItem(highestKey, level.toString());
      }
      
      // Save progress summary
      const progressKey = `vocabVenture_${userId}_progress`;
      const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
      
      if (!progressData[category]) {
        progressData[category] = {
          completedLevels: 0,
          totalLevels: 5, // Default, should be updated from backend
          hintsUsed: 0
        };
      }
      
      progressData[category].completedLevels = Object.keys(existingCompleted).length;
      if (usedHint) {
        progressData[category].hintsUsed = (progressData[category].hintsUsed || 0) + 1;
      }
      
      localStorage.setItem(progressKey, JSON.stringify(progressData));
      
      console.log('💾 Progress saved to localStorage successfully');
      
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  }

  /**
   * Utility function to delay execution
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get progress from local storage
   */
  getLocalProgress(category, userId = null) {
    try {
      const actualUserId = userId || localStorage.getItem('userId') || 'anonymous';
      const completedKey = `vocabVenture_${actualUserId}_${category}_completed`;
      const highestKey = `vocabVenture_${actualUserId}_${category}_highest`;
      
      const completed = JSON.parse(localStorage.getItem(completedKey) || '{}');
      const highest = parseInt(localStorage.getItem(highestKey) || '0', 10);
      
      return {
        completedLevels: Object.keys(completed),
        highestLevel: highest,
        completedData: completed
      };
      
    } catch (error) {
      console.error('❌ Failed to get local progress:', error);
      return {
        completedLevels: [],
        highestLevel: 0,
        completedData: {}
      };
    }
  }

  /**
   * Check if level is completed locally
   */
  isLevelCompletedLocally(category, level, userId = null) {
    const progress = this.getLocalProgress(category, userId);
    return progress.completedLevels.includes(level.toString());
  }
}

// Export singleton instance
export default new ProgressSubmissionService();

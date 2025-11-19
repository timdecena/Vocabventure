/**
 * Triggers the feedback modal after boss defeat
 * This should be called from Level5 components when the final boss is defeated
 */
export const triggerFeedbackAfterBoss = () => {
  // Set a flag in localStorage that MapView will check
  localStorage.setItem('showBossFeedback', 'true');
  localStorage.setItem('feedbackTriggerType', 'boss');
};

/**
 * Check if boss feedback should be shown
 * This should be called by MapView to check if feedback needs to be shown
 */
export const shouldShowBossFeedback = () => {
  return localStorage.getItem('showBossFeedback') === 'true';
};

/**
 * Clear boss feedback flag
 * This should be called by MapView after showing the feedback
 */
export const clearBossFeedbackFlag = () => {
  localStorage.removeItem('showBossFeedback');
  localStorage.removeItem('feedbackTriggerType');
};


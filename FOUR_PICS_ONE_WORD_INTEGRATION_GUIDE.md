# Four Pics One Word - Integrated Gold System Guide

## 🎯 Overview
Your Four Pics One Word game now has a fully integrated gold system that works seamlessly with your existing games (Word of the Day, Spelling Challenge). Students earn and spend gold across all games using a unified balance.

## 🏆 Gold Reward System

### Level Completion Rewards:
- **1st completion**: +10 gold
- **2nd completion**: +5 gold  
- **3rd+ completions**: 0 gold

### Gold Spending:
- **Hints**: 5 gold per hint
- **Cross-game usage**: Gold earned here can be spent in other games

## 🔧 API Endpoints

### 1. Submit Level Completion (Enhanced)
```http
POST /api/user-progress/submit
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "category": "Animals",
  "level": 1,
  "answer": "PANDA",
  "usedHint": false
}
```

**Response**: UserProgressDTO with updated progress + gold awarded to user's main balance

### 2. Use Hint (Enhanced with Gold)
```http
POST /api/user-progress/use-hint?category=Animals&level=1
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "progress": { /* UserProgressDTO */ },
  "newGoldBalance": 25,
  "hintCost": 5
}
```

**Error Response** (insufficient gold):
```json
{
  "error": "Insufficient gold for hint. Required: 5, Available: 2",
  "success": false
}
```

### 3. Check Gold Balance
```http
GET /api/user-progress/gold-balance
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "goldBalance": 30,
  "hintCost": 5,
  "canAffordHint": true
}
```

### 4. Level Completion Status
```http
GET /api/user-progress/level-completion-status?category=Animals&level=1
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "category": "Animals",
  "level": 1,
  "completionCount": 2,
  "hasCompleted": true,
  "nextGoldReward": 0,
  "completedLevels": [1, 2, 3]
}
```

## 🎮 Frontend Integration Examples

### Check if User Can Afford Hint
```javascript
const checkHintAffordability = async () => {
  try {
    const response = await api.get('/api/user-progress/gold-balance');
    const { canAffordHint, goldBalance, hintCost } = response.data;
    
    if (canAffordHint) {
      console.log(`✅ Can afford hint! Balance: ${goldBalance}, Cost: ${hintCost}`);
      return true;
    } else {
      console.log(`❌ Cannot afford hint. Need ${hintCost}, have ${goldBalance}`);
      return false;
    }
  } catch (error) {
    console.error('Error checking gold balance:', error);
    return false;
  }
};
```

### Use Hint with Gold Validation
```javascript
const useHintWithGold = async (category, level) => {
  try {
    const response = await api.post(`/api/user-progress/use-hint?category=${category}&level=${level}`);
    
    if (response.status === 200) {
      const { newGoldBalance, hintCost } = response.data;
      console.log(`💡 Hint used! New balance: ${newGoldBalance} (spent ${hintCost} gold)`);
      
      // Update UI with new gold balance
      updateGoldDisplay(newGoldBalance);
      
      return response.data;
    }
  } catch (error) {
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      console.log(`❌ ${errorData.error}`);
      
      // Show user-friendly message
      showNotification('Not enough gold for hint!', 'error');
    }
    throw error;
  }
};
```

### Submit Level with Gold Rewards
```javascript
const submitLevelCompletion = async (category, level, answer, usedHint) => {
  try {
    const payload = { category, level, answer, usedHint };
    const response = await api.post('/api/user-progress/submit', payload);
    
    if (response.status === 200) {
      console.log('🎉 Level completed successfully!');
      
      // Check how much gold was earned
      const goldResponse = await api.get('/api/user-progress/gold-balance');
      const newBalance = goldResponse.data.goldBalance;
      
      // Check completion status to see what reward was given
      const statusResponse = await api.get(
        `/api/user-progress/level-completion-status?category=${category}&level=${level}`
      );
      const { completionCount } = statusResponse.data;
      
      // Calculate gold earned based on completion count
      let goldEarned = 0;
      if (completionCount === 1) goldEarned = 10;
      else if (completionCount === 2) goldEarned = 5;
      
      if (goldEarned > 0) {
        showNotification(`🎉 Level completed! +${goldEarned} gold earned!`, 'success');
      } else {
        showNotification('🎉 Level completed!', 'success');
      }
      
      updateGoldDisplay(newBalance);
      return response.data;
    }
  } catch (error) {
    console.error('Error submitting level:', error);
    throw error;
  }
};
```

### Display Gold Rewards Preview
```javascript
const showGoldRewardPreview = async (category, level) => {
  try {
    const response = await api.get(
      `/api/user-progress/level-completion-status?category=${category}&level=${level}`
    );
    
    const { completionCount, nextGoldReward } = response.data;
    
    if (nextGoldReward > 0) {
      const rewardText = completionCount === 0 
        ? `Complete this level to earn ${nextGoldReward} gold!`
        : `Replay this level to earn ${nextGoldReward} gold!`;
      
      showGoldRewardBadge(rewardText);
    } else {
      showGoldRewardBadge('No gold reward for additional completions');
    }
  } catch (error) {
    console.error('Error getting reward preview:', error);
  }
};
```

## 🧪 Testing

### Quick Test in Browser Console:
1. Login to your application
2. Open browser console (F12)
3. Copy and paste the test script from `test-integrated-gold-system.js`
4. Run the script to see the complete gold system in action

### Manual Testing Steps:
1. **Check initial gold balance**
2. **Complete a level** → Should get +10 gold
3. **Complete same level again** → Should get +5 gold
4. **Complete same level third time** → Should get 0 gold
5. **Try to use hint** → Should deduct 5 gold if available
6. **Try to use hint without gold** → Should show error message

## 🎯 Integration with Existing Games

The gold system is now unified across:
- **Four Pics One Word** (your game)
- **Word of the Day** (existing)
- **Spelling Challenge** (existing)

Students can:
- Earn gold in any game
- Spend gold in any game
- See unified balance across all games
- Teachers can track gold usage across all modules

## 🚀 Production Ready

The system includes:
- ✅ **Transaction safety** with `@Transactional`
- ✅ **Comprehensive error handling**
- ✅ **Detailed logging** for debugging
- ✅ **Input validation** and security
- ✅ **Database persistence** of all progress
- ✅ **RESTful API design**
- ✅ **Cross-game compatibility**

Your Four Pics One Word game is now fully integrated with the VocabVenture gold economy! 🎉

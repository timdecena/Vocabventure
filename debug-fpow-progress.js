// Debug script to test Four Pics One Word progress submission
// This script will help identify why progress is not being saved to the database

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8080';
const TEST_USER = {
  email: 'student@example.com',
  password: 'password123'
};

let authToken = null;

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
    data
  };
  
  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
}

// Step 1: Login to get authentication token
async function login() {
  console.log('🔐 Step 1: Logging in...');
  
  const result = await makeRequest('POST', '/api/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Login successful');
    console.log('📋 Token:', authToken.substring(0, 20) + '...');
    return true;
  } else {
    console.error('❌ Login failed:', result.error);
    console.error('📋 Response:', result.data);
    return false;
  }
}

// Step 2: Check current progress before submission
async function checkProgressBefore() {
  console.log('\n📊 Step 2: Checking current progress...');
  
  const result = await makeRequest('GET', '/api/user-progress/all');
  
  if (result.success) {
    console.log('✅ Current progress retrieved');
    console.log('📋 Progress records:', result.data.length);
    
    // Look for Animals category specifically
    const animalsProgress = result.data.find(p => p.category === 'Animals');
    if (animalsProgress) {
      console.log('🐾 Animals progress found:');
      console.log('   - Current Level:', animalsProgress.currentLevel);
      console.log('   - Puzzles Solved:', animalsProgress.puzzlesSolved);
      console.log('   - Correct Answers:', animalsProgress.correctAnswers);
      console.log('   - Level Gold Earned:', animalsProgress.levelGoldEarned);
    } else {
      console.log('🐾 No Animals progress found - will be created on first submission');
    }
    
    return result.data;
  } else {
    console.error('❌ Failed to get current progress:', result.error);
    return null;
  }
}

// Step 3: Submit a test progress
async function submitTestProgress() {
  console.log('\n🎯 Step 3: Submitting test progress...');
  
  const testPayload = {
    category: 'Animals',
    level: 1,
    answer: 'DOG',
    usedHint: false
  };
  
  console.log('📤 Payload:', testPayload);
  
  const result = await makeRequest('POST', '/api/user-progress/submit', testPayload);
  
  if (result.success) {
    console.log('✅ Progress submission successful');
    console.log('📋 Response:', JSON.stringify(result.data, null, 2));
    return result.data;
  } else {
    console.error('❌ Progress submission failed');
    console.error('📋 Status:', result.status);
    console.error('📋 Error:', result.error);
    console.error('📋 Response:', result.data);
    return null;
  }
}

// Step 4: Check progress after submission
async function checkProgressAfter() {
  console.log('\n📊 Step 4: Checking progress after submission...');
  
  const result = await makeRequest('GET', '/api/user-progress/all');
  
  if (result.success) {
    console.log('✅ Progress retrieved after submission');
    
    const animalsProgress = result.data.find(p => p.category === 'Animals');
    if (animalsProgress) {
      console.log('🐾 Animals progress after submission:');
      console.log('   - Current Level:', animalsProgress.currentLevel);
      console.log('   - Puzzles Solved:', animalsProgress.puzzlesSolved);
      console.log('   - Correct Answers:', animalsProgress.correctAnswers);
      console.log('   - Level Gold Earned:', animalsProgress.levelGoldEarned);
      console.log('   - Last Played Level:', animalsProgress.lastPlayedLevel);
      console.log('   - Last Active:', animalsProgress.lastActive);
    } else {
      console.log('❌ Still no Animals progress found after submission!');
    }
    
    return result.data;
  } else {
    console.error('❌ Failed to get progress after submission:', result.error);
    return null;
  }
}

// Step 5: Check category progress endpoint
async function checkCategoryProgress() {
  console.log('\n📈 Step 5: Checking category progress endpoint...');
  
  const result = await makeRequest('GET', '/api/user-progress/category-progress');
  
  if (result.success) {
    console.log('✅ Category progress retrieved');
    console.log('📋 Category Progress:', JSON.stringify(result.data, null, 2));
    return result.data;
  } else {
    console.error('❌ Failed to get category progress:', result.error);
    return null;
  }
}

// Step 6: Check gold balance
async function checkGoldBalance() {
  console.log('\n💰 Step 6: Checking gold balance...');
  
  const result = await makeRequest('GET', '/api/user-progress/gold-balance');
  
  if (result.success) {
    console.log('✅ Gold balance retrieved');
    console.log('📋 Gold Balance:', result.data.goldBalance);
    console.log('📋 Can Afford Hint:', result.data.canAffordHint);
    return result.data;
  } else {
    console.error('❌ Failed to get gold balance:', result.error);
    return null;
  }
}

// Step 7: Test level completion status
async function checkLevelCompletionStatus() {
  console.log('\n🏆 Step 7: Checking level completion status...');
  
  const result = await makeRequest('GET', '/api/user-progress/level-completion-status?category=Animals&level=1');
  
  if (result.success) {
    console.log('✅ Level completion status retrieved');
    console.log('📋 Completion Status:', JSON.stringify(result.data, null, 2));
    return result.data;
  } else {
    console.error('❌ Failed to get level completion status:', result.error);
    return null;
  }
}

// Main test function
async function runDiagnostics() {
  console.log('🔍 FOUR PICS ONE WORD PROGRESS DIAGNOSTIC');
  console.log('==========================================\n');
  
  try {
    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.log('\n❌ Cannot proceed without authentication');
      return;
    }
    
    // Step 2: Check progress before
    const progressBefore = await checkProgressBefore();
    
    // Step 3: Submit test progress
    const submissionResult = await submitTestProgress();
    
    // Step 4: Check progress after
    const progressAfter = await checkProgressAfter();
    
    // Step 5: Check category progress
    const categoryProgress = await checkCategoryProgress();
    
    // Step 6: Check gold balance
    const goldBalance = await checkGoldBalance();
    
    // Step 7: Check level completion status
    const completionStatus = await checkLevelCompletionStatus();
    
    // Analysis
    console.log('\n🔍 ANALYSIS:');
    console.log('=============');
    
    if (submissionResult) {
      console.log('✅ Backend accepted the progress submission');
      
      if (progressAfter) {
        const animalsAfter = progressAfter.find(p => p.category === 'Animals');
        if (animalsAfter) {
          console.log('✅ Progress record exists in database');
          
          if (animalsAfter.puzzlesSolved > 0) {
            console.log('✅ Puzzles solved count increased');
          } else {
            console.log('⚠️  Puzzles solved count is still 0');
          }
          
          if (animalsAfter.correctAnswers > 0) {
            console.log('✅ Correct answers count increased');
          } else {
            console.log('⚠️  Correct answers count is still 0');
          }
        } else {
          console.log('❌ No progress record found in database after submission');
        }
      }
    } else {
      console.log('❌ Backend rejected the progress submission');
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('===============');
    
    if (submissionResult && progressAfter?.find(p => p.category === 'Animals')?.puzzlesSolved > 0) {
      console.log('✅ Progress submission is working correctly!');
    } else {
      console.log('❌ Progress submission is NOT working - needs investigation');
      
      if (!submissionResult) {
        console.log('   → Issue: Backend API call failed');
      } else if (!progressAfter?.find(p => p.category === 'Animals')) {
        console.log('   → Issue: Progress record not created in database');
      } else {
        console.log('   → Issue: Progress record created but values not updated');
      }
    }
    
  } catch (error) {
    console.error('💥 Diagnostic failed with error:', error.message);
  }
}

// Run the diagnostics
runDiagnostics();

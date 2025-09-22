// Browser console test for Four Pics One Word progress saving
// Copy and paste this into your browser's developer console while logged into the game

async function testFPOWProgressSaving() {
  console.log('🧪 Testing Four Pics One Word Progress Saving...');
  console.log('================================================\n');
  
  // Check if we're authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No authentication token found. Please log in first.');
    return;
  }
  
  console.log('✅ Authentication token found');
  
  // Test payload - simulating a level completion
  const testPayload = {
    category: 'Animals',
    level: 1,
    answer: 'DOG',
    usedHint: false
  };
  
  console.log('📤 Test payload:', testPayload);
  
  try {
    // Step 1: Check progress before submission
    console.log('\n📊 Step 1: Checking current progress...');
    
    const progressBefore = await fetch('/api/user-progress/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const progressBeforeData = await progressBefore.json();
    const animalsBefore = progressBeforeData.find(p => p.category === 'Animals');
    
    console.log('🐾 Animals progress BEFORE:', animalsBefore || 'None found');
    
    // Step 2: Submit progress
    console.log('\n🎯 Step 2: Submitting progress...');
    
    const submitResponse = await fetch('/api/user-progress/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📋 Submit response status:', submitResponse.status);
    
    const submitData = await submitResponse.json();
    console.log('📋 Submit response data:', submitData);
    
    if (!submitResponse.ok) {
      console.error('❌ Submission failed with status:', submitResponse.status);
      console.error('❌ Error details:', submitData);
      return;
    }
    
    if (!submitData.success) {
      console.error('❌ Backend returned success=false:', submitData.error);
      return;
    }
    
    console.log('✅ Progress submitted successfully!');
    
    // Step 3: Check progress after submission
    console.log('\n📊 Step 3: Checking progress after submission...');
    
    const progressAfter = await fetch('/api/user-progress/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const progressAfterData = await progressAfter.json();
    const animalsAfter = progressAfterData.find(p => p.category === 'Animals');
    
    console.log('🐾 Animals progress AFTER:', animalsAfter || 'None found');
    
    // Step 4: Analysis
    console.log('\n🔍 ANALYSIS:');
    console.log('=============');
    
    if (!animalsAfter) {
      console.log('❌ No Animals progress record found after submission');
      return;
    }
    
    const puzzlesBefore = animalsBefore?.puzzlesSolved || 0;
    const puzzlesAfter = animalsAfter.puzzlesSolved || 0;
    
    const correctBefore = animalsBefore?.correctAnswers || 0;
    const correctAfter = animalsAfter.correctAnswers || 0;
    
    console.log(`📈 Puzzles solved: ${puzzlesBefore} → ${puzzlesAfter} (${puzzlesAfter > puzzlesBefore ? '✅ INCREASED' : '❌ NO CHANGE'})`);
    console.log(`📈 Correct answers: ${correctBefore} → ${correctAfter} (${correctAfter > correctBefore ? '✅ INCREASED' : '❌ NO CHANGE'})`);
    console.log(`📈 Current level: ${animalsAfter.currentLevel}`);
    console.log(`📈 Last played level: ${animalsAfter.lastPlayedLevel}`);
    
    // Step 5: Check gold balance
    console.log('\n💰 Step 4: Checking gold balance...');
    
    const goldResponse = await fetch('/api/user-progress/gold-balance', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const goldData = await goldResponse.json();
    console.log('💰 Gold balance:', goldData.goldBalance);
    
    // Final result
    console.log('\n🎯 FINAL RESULT:');
    console.log('=================');
    
    if (puzzlesAfter > puzzlesBefore && correctAfter > correctBefore) {
      console.log('🎉 SUCCESS: Progress is being saved correctly!');
      console.log('✅ The fix is working - puzzle completions are now saved to the database.');
    } else {
      console.log('💥 FAILURE: Progress is still not being saved correctly.');
      console.log('❌ The issue persists - further investigation needed.');
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testFPOWProgressSaving();

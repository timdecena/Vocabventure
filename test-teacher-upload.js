// Test script to verify teacher can upload Four Pics One Word puzzles to database
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testTeacherUpload() {
    console.log('🧪 Testing Teacher Upload to Database...\n');
    
    try {
        // Step 1: Login as teacher to get token
        console.log('1️⃣ Logging in as teacher...');
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'teacher@example.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Teacher login successful');
        
        // Step 2: Create a test image file (1x1 pixel PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x21, 0x18, 0xE6, 0x27, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        // Step 3: Create FormData for upload
        console.log('2️⃣ Preparing test puzzle data...');
        const formData = new FormData();
        formData.append('category', 'Test Category');
        formData.append('level', '999'); // Use high number to avoid conflicts
        formData.append('answer', 'TEST');
        formData.append('hint', 'This is a test puzzle');
        formData.append('hintType', 'TEXT_HINT');
        formData.append('difficulty', 'EASY');
        formData.append('images', testImageBuffer, {
            filename: 'test-image.png',
            contentType: 'image/png'
        });
        
        // Step 4: Upload puzzle
        console.log('3️⃣ Uploading puzzle to database...');
        const uploadResponse = await axios.post('http://localhost:8080/api/fpow/create', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Upload successful!');
        console.log('📊 Created puzzle:', {
            id: uploadResponse.data.id,
            category: uploadResponse.data.category,
            level: uploadResponse.data.level,
            answer: uploadResponse.data.answer,
            difficulty: uploadResponse.data.difficulty,
            imageUrls: [
                uploadResponse.data.image1Url,
                uploadResponse.data.image2Url,
                uploadResponse.data.image3Url,
                uploadResponse.data.image4Url
            ].filter(Boolean)
        });
        
        // Step 5: Verify it's in database by fetching it back
        console.log('4️⃣ Verifying puzzle exists in database...');
        const verifyResponse = await axios.get(`http://localhost:8080/api/fpow/puzzle?category=Test Category&level=999`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Verification successful! Puzzle found in database.');
        console.log('🎯 Database contains:', {
            id: verifyResponse.data.id,
            category: verifyResponse.data.category,
            level: verifyResponse.data.level,
            answer: verifyResponse.data.answer,
            createdAt: verifyResponse.data.createdAt
        });
        
        console.log('\n🎉 SUCCESS: Teachers CAN upload directly to database!');
        console.log('📝 Flow: Upload Images → Save to Filesystem → Save Metadata to Database → Return Success');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('🔐 Authentication issue - check teacher credentials');
        } else if (error.response?.status === 403) {
            console.log('🚫 Permission issue - check teacher role');
        } else if (error.response?.status === 500) {
            console.log('🔥 Server error - check upload directory and database');
        }
    }
}

// Run the test
testTeacherUpload();

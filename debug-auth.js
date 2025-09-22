// Quick authentication debug script
// Run this in the browser console on localhost:3000

async function debugAuth() {
    console.log("🔍 Starting authentication debug...");
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log("📋 Token from localStorage:", token ? token.substring(0, 50) + '...' : 'None');
    
    if (!token) {
        console.error("❌ No token found! User needs to login first.");
        return;
    }
    
    try {
        // Test token validation
        console.log("🔐 Testing token validation...");
        const validateResponse = await fetch('http://localhost:8080/api/auth/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ token })
        });
        
        const validateData = await validateResponse.json();
        console.log("✅ Token validation result:", validateData);
        
        if (!validateData.valid) {
            console.error("❌ Token is invalid!");
            return;
        }
        
        if (validateData.role !== 'STUDENT') {
            console.error(`❌ Wrong role! Expected: STUDENT, Got: ${validateData.role}`);
            return;
        }
        
        if (!validateData.authorityMatch) {
            console.error("❌ Authority mismatch!");
            console.log("Expected:", validateData.expectedAuthority);
            console.log("Got:", validateData.tokenAuthority);
            return;
        }
        
        // Test the problematic endpoint
        console.log("🎯 Testing POST /api/user-progress/submit...");
        const submitResponse = await fetch('http://localhost:8080/api/user-progress/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({
                category: 'animals',
                level: 1,
                answer: 'test',
                usedHint: false
            })
        });
        
        console.log("📊 Submit response status:", submitResponse.status);
        
        if (submitResponse.status === 403) {
            console.error("💀 STILL 403 FORBIDDEN! The security fix didn't work!");
        } else if (submitResponse.ok) {
            console.log("🎉 SUCCESS! 403 error is fixed!");
            const submitData = await submitResponse.json();
            console.log("Response data:", submitData);
        } else {
            console.log("⚠️ Different error:", submitResponse.status);
            const errorText = await submitResponse.text();
            console.log("Error details:", errorText);
        }
        
    } catch (error) {
        console.error("❌ Network error:", error);
    }
}

// Auto-run the debug
debugAuth();

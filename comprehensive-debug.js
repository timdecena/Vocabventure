// Comprehensive 403 Debug Script
// Run this in the browser console on localhost:3000

async function comprehensiveDebug() {
    console.log("🔍 COMPREHENSIVE 403 DEBUG ANALYSIS");
    console.log("=====================================");
    
    // Step 1: Check JWT Token
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("❌ FATAL: No JWT token found in localStorage!");
        return;
    }
    
    console.log("✅ JWT Token found in localStorage");
    
    // Step 2: Decode JWT Token
    try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        
        const now = Math.floor(Date.now() / 1000);
        const isExpired = now >= payload.exp;
        
        console.log("📋 JWT Details:");
        console.log("  - Subject (email):", payload.sub);
        console.log("  - Authorities:", payload.authorities);
        console.log("  - Issued at:", new Date(payload.iat * 1000));
        console.log("  - Expires at:", new Date(payload.exp * 1000));
        console.log("  - Is expired:", isExpired ? "❌ YES" : "✅ NO");
        
        if (isExpired) {
            console.error("❌ FATAL: JWT token is EXPIRED! User needs to login again.");
            return;
        }
        
        if (payload.authorities !== "ROLE_STUDENT") {
            console.error(`❌ FATAL: Wrong role! Expected: ROLE_STUDENT, Got: ${payload.authorities}`);
            return;
        }
        
    } catch (error) {
        console.error("❌ FATAL: Cannot decode JWT token:", error);
        return;
    }
    
    // Step 3: Test Token Validation Endpoint
    console.log("\n🔐 Testing token validation...");
    try {
        const validateResponse = await fetch('http://localhost:8080/api/auth/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token })
        });
        
        const validateData = await validateResponse.json();
        console.log("📊 Validation Response:", validateData);
        
        if (!validateResponse.ok || !validateData.valid) {
            console.error("❌ FATAL: Token validation failed on server!");
            return;
        }
        
    } catch (error) {
        console.error("❌ FATAL: Token validation request failed:", error);
        return;
    }
    
    // Step 4: Test a simple GET endpoint first
    console.log("\n📖 Testing GET /api/user-progress/all...");
    try {
        const getResponse = await fetch('http://localhost:8080/api/user-progress/all', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        
        console.log("📊 GET Response Status:", getResponse.status);
        
        if (getResponse.status === 403) {
            console.error("❌ FATAL: Even GET requests are returning 403! Security config is broken.");
            return;
        }
        
        if (getResponse.ok) {
            console.log("✅ GET request successful - authentication is working");
        }
        
    } catch (error) {
        console.error("❌ GET request failed:", error);
    }
    
    // Step 5: Test the problematic POST endpoint
    console.log("\n🎯 Testing POST /api/user-progress/submit...");
    try {
        const postResponse = await fetch('http://localhost:8080/api/user-progress/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({
                category: 'Animals',
                level: 1,
                answer: 'TEST',
                usedHint: false
            })
        });
        
        console.log("📊 POST Response Status:", postResponse.status);
        
        if (postResponse.status === 403) {
            console.error("💀 CONFIRMED: POST /api/user-progress/submit returns 403 Forbidden");
            console.error("🔍 This means our security configuration fix did NOT work");
        } else if (postResponse.ok) {
            console.log("🎉 SUCCESS! POST request worked! 403 error is FIXED!");
            const responseData = await postResponse.json();
            console.log("📋 Response data:", responseData);
        } else {
            console.log(`⚠️ Different error: ${postResponse.status}`);
            const errorText = await postResponse.text();
            console.log("📋 Error details:", errorText);
        }
        
    } catch (error) {
        console.error("❌ POST request failed:", error);
    }
    
    console.log("\n🏁 Debug analysis complete!");
}

// Run the comprehensive debug
comprehensiveDebug();

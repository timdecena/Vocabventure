// FINAL 403 ERROR TEST SCRIPT
// Run this in the browser console after logging in to test the fix

const final403Test = async () => {
    console.log("🎯 FINAL 403 ERROR TEST - COMPREHENSIVE VERIFICATION");
    console.log("====================================================");
    
    // Step 1: Verify authentication state
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    
    console.log("📋 Authentication State:");
    console.log("  - Token exists:", !!token);
    console.log("  - Role:", role);
    console.log("  - User ID:", userId);
    
    if (!token) {
        console.error("❌ CRITICAL: No JWT token found! Please login first.");
        console.log("🔧 SOLUTION: Go to login page and authenticate");
        return;
    }
    
    // Step 2: Decode and validate JWT
    try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        
        const now = Math.floor(Date.now() / 1000);
        const isExpired = now >= payload.exp;
        
        console.log("🔐 JWT Token Analysis:");
        console.log("  - Subject (email):", payload.sub);
        console.log("  - Authorities:", payload.authorities);
        console.log("  - Issued at:", new Date(payload.iat * 1000));
        console.log("  - Expires at:", new Date(payload.exp * 1000));
        console.log("  - Is expired:", isExpired ? "❌ YES" : "✅ NO");
        
        if (isExpired) {
            console.error("❌ CRITICAL: JWT token is EXPIRED!");
            console.log("🔧 SOLUTION: Logout and login again to get fresh token");
            return;
        }
        
        if (!payload.authorities || !payload.authorities.includes("ROLE_STUDENT")) {
            console.error("❌ CRITICAL: Invalid role! Expected ROLE_STUDENT, got:", payload.authorities);
            return;
        }
        
    } catch (error) {
        console.error("❌ CRITICAL: Cannot decode JWT token:", error);
        return;
    }
    
    // Step 3: Test CORS preflight (OPTIONS request)
    console.log("\n🌐 Testing CORS preflight (OPTIONS)...");
    try {
        const optionsResponse = await fetch('http://localhost:8080/api/user-progress/submit', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        });
        
        console.log("📊 OPTIONS Response Status:", optionsResponse.status);
        console.log("📊 CORS Headers:", {
            'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': optionsResponse.headers.get('Access-Control-Allow-Credentials')
        });
        
        if (optionsResponse.status !== 200) {
            console.error("❌ CORS preflight failed!");
            return;
        } else {
            console.log("✅ CORS preflight successful");
        }
        
    } catch (error) {
        console.error("❌ CORS preflight request failed:", error);
        return;
    }
    
    // Step 4: Test the actual POST request
    console.log("\n🎯 Testing POST /api/user-progress/submit...");
    
    const testPayload = {
        category: 'Animals',
        level: 1,
        answer: 'PANDA',
        usedHint: false
    };
    
    console.log("📤 Request payload:", testPayload);
    
    try {
        const response = await fetch('http://localhost:8080/api/user-progress/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': 'http://localhost:3000'
            },
            credentials: 'include',
            body: JSON.stringify(testPayload)
        });
        
        console.log("📊 POST Response Status:", response.status);
        console.log("📊 Response Headers:", Object.fromEntries(response.headers));
        
        if (response.status === 403) {
            console.error("💀 STILL GETTING 403 FORBIDDEN!");
            console.error("🔍 This indicates the backend security fix did not resolve the issue");
            
            // Try to get response body for more details
            try {
                const responseText = await response.text();
                console.error("📋 Response body:", responseText);
            } catch (e) {
                console.error("📋 Could not read response body:", e.message);
            }
            
            console.log("\n🔧 DEBUGGING STEPS:");
            console.log("1. Check server logs for JWT filter messages");
            console.log("2. Verify the Authorization header is being sent");
            console.log("3. Check if the user has ROLE_STUDENT authority");
            console.log("4. Verify Spring Security configuration");
            
        } else if (response.status === 401) {
            console.error("🔒 401 UNAUTHORIZED - Authentication failed");
            console.log("🔧 SOLUTION: Check JWT token validity and format");
            
        } else if (response.ok) {
            console.log("🎉 SUCCESS! 403 ERROR IS FIXED!");
            const responseData = await response.json();
            console.log("📋 Response data:", responseData);
            console.log("✅ Progress submission is now working correctly");
            
        } else {
            console.log(`⚠️ Different error: ${response.status}`);
            const errorText = await response.text();
            console.log("📋 Error details:", errorText);
        }
        
    } catch (error) {
        console.error("❌ POST request failed completely:", error);
        console.log("🔧 This might be a network or CORS issue");
    }
    
    console.log("\n🏁 FINAL TEST COMPLETE!");
    console.log("If you see 'SUCCESS!' above, the 403 error is resolved.");
    console.log("If you still see 403, check the server logs for JWT filter debugging info.");
};

// Run the test
final403Test();

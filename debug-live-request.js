// Debug script to test the actual request being made by the frontend
// Run this in the browser console while on the game page

const debugLiveRequest = async () => {
    console.log("🔍 DEBUGGING LIVE REQUEST TO /api/user-progress/submit");
    console.log("=====================================================");
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    
    console.log("📋 Current Authentication State:");
    console.log("  - Token exists:", !!token);
    console.log("  - Role:", role);
    console.log("  - User ID:", userId);
    
    if (!token) {
        console.error("❌ FATAL: No JWT token found! User needs to login first.");
        return;
    }
    
    // Decode the JWT token
    try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        
        const now = Math.floor(Date.now() / 1000);
        const isExpired = now >= payload.exp;
        
        console.log("🔐 JWT Token Details:");
        console.log("  - Subject (email):", payload.sub);
        console.log("  - Authorities:", payload.authorities);
        console.log("  - Issued at:", new Date(payload.iat * 1000));
        console.log("  - Expires at:", new Date(payload.exp * 1000));
        console.log("  - Is expired:", isExpired ? "❌ YES" : "✅ NO");
        
        if (isExpired) {
            console.error("❌ FATAL: JWT token is EXPIRED!");
            return;
        }
        
    } catch (error) {
        console.error("❌ FATAL: Cannot decode JWT token:", error);
        return;
    }
    
    // Test the exact request that's failing
    console.log("\n🎯 Testing the EXACT request that's failing...");
    
    const requestPayload = {
        category: 'Animals',
        level: 1,
        answer: 'PANDA',
        usedHint: false
    };
    
    console.log("📤 Request payload:", requestPayload);
    
    try {
        const response = await fetch('http://localhost:8080/api/user-progress/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(requestPayload)
        });
        
        console.log("📊 Response Status:", response.status);
        console.log("📊 Response Headers:", Object.fromEntries(response.headers));
        
        if (response.status === 403) {
            console.error("💀 CONFIRMED: Still getting 403 Forbidden!");
            console.error("🔍 This means our JWT filter fix did NOT work as expected");
            
            // Try to get response body for more details
            try {
                const responseText = await response.text();
                console.error("📋 Response body:", responseText);
            } catch (e) {
                console.error("📋 Could not read response body:", e.message);
            }
            
        } else if (response.ok) {
            console.log("🎉 SUCCESS! Request worked!");
            const responseData = await response.json();
            console.log("📋 Response data:", responseData);
        } else {
            console.log(`⚠️ Different error: ${response.status}`);
            const errorText = await response.text();
            console.log("📋 Error details:", errorText);
        }
        
    } catch (error) {
        console.error("❌ Request failed completely:", error);
    }
    
    console.log("\n🏁 Debug complete!");
};

// Run the debug
debugLiveRequest();

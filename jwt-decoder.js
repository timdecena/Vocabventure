// JWT Token Decoder - Run this in browser console
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        
        console.log("🔍 JWT Header:", header);
        console.log("🔍 JWT Payload:", payload);
        
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        const exp = payload.exp;
        const iat = payload.iat;
        
        console.log("⏰ Current time:", now);
        console.log("⏰ Token issued at:", iat, new Date(iat * 1000));
        console.log("⏰ Token expires at:", exp, new Date(exp * 1000));
        console.log("⏰ Token valid:", now < exp ? "✅ YES" : "❌ EXPIRED");
        
        console.log("👤 Subject (email):", payload.sub);
        console.log("🔐 Authorities:", payload.authorities);
        
        return { header, payload, valid: now < exp };
    } catch (error) {
        console.error("❌ Error decoding JWT:", error);
        return null;
    }
}

// Get token from localStorage and decode it
const token = localStorage.getItem('token');
if (token) {
    console.log("🎯 Decoding JWT token...");
    decodeJWT(token);
} else {
    console.error("❌ No token found in localStorage");
}

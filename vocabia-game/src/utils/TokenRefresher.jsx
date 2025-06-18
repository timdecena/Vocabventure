import { useEffect } from 'react';
import api from '../api/api';

/**
 * TokenRefresher component to handle token validation and refreshing
 * This component doesn't render anything but performs token validation
 * and refreshing in the background
 */
const TokenRefresher = () => {
  useEffect(() => {
    const validateAndRefreshToken = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token) {
          console.log('No token found, skipping token validation');
          return;
        }
        
        console.log('Validating token...');
        
        // Call the validate token endpoint
        console.log('Validating token with backend...');
        const response = await api.post('/api/auth/validate', { token });
        console.log('Token validation response:', response.data);
        
        if (response.data && response.data.valid) {
          console.log('Token is valid');
          
          // If the response includes role information, update localStorage
          if (response.data.role) {
            // Check if the role in localStorage matches the one from the server
            if (response.data.role !== role) {
              console.log(`Updating role from ${role} to ${response.data.role}`);
              localStorage.setItem('role', response.data.role);
            }
            
            // Check if the token has the correct authority format
            if (response.data.authorityMatch === false) {
              console.warn('Token authority does not match expected format. This may cause authorization issues.');
              console.warn(`Token authority: ${response.data.tokenAuthority}, Expected: ${response.data.expectedAuthority}`);
              
              // Attempt to refresh the token to get the correct authority format
              console.log('Attempting to refresh token to fix authority format...');
              try {
                const refreshResponse = await api.post('/api/auth/refresh', { token });
                if (refreshResponse.data && refreshResponse.data.token) {
                  console.log('Token refreshed successfully with correct authority format');
                  localStorage.setItem('token', refreshResponse.data.token);
                }
              } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
              }
            }
          }
        } else {
          // Token is invalid, attempt to refresh
          console.log('Token is invalid, attempting to refresh...');
          try {
            const refreshResponse = await api.post('/api/auth/refresh', { token });
            if (refreshResponse.data && refreshResponse.data.token) {
              console.log('Token refreshed successfully');
              localStorage.setItem('token', refreshResponse.data.token);
              if (refreshResponse.data.role) {
                localStorage.setItem('role', refreshResponse.data.role);
              }
            } else {
              // Refresh failed, clear token
              console.error('Token refresh failed');
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              // Optionally redirect to login page
              // window.location.href = '/login';
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('role');
          }
        }
      } catch (error) {
        console.error('Error validating token:', error);
      }
    };

    // Validate token immediately when component mounts
    validateAndRefreshToken();
    
    // Then set up interval to validate token periodically (e.g., every 15 minutes)
    const intervalId = setInterval(validateAndRefreshToken, 15 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // This component doesn't render anything
  return null;
};

export default TokenRefresher;

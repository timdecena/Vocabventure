import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, Divider, Alert } from '@mui/material';
import api from '../api/api';

// Function to decode JWT without using external libraries
const decodeJwt = (token) => {
  try {
    // JWT consists of three parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format' };
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { payload };
  } catch (error) {
    return { error: 'Error decoding token: ' + error.message };
  }
};

const JwtDebugger = () => {
  const [token, setToken] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [authInfo, setAuthInfo] = useState({
    token: null,
    role: null,
  });
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  
  useEffect(() => {
    // Get token and role from localStorage
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    setAuthInfo({
      token: storedToken ? storedToken.substring(0, 20) + '...' : 'Not found',
      role: storedRole || 'Not found',
    });
    
    if (storedToken) {
      setToken(storedToken);
      setDecodedToken(decodeJwt(storedToken));
    }
  }, []);
  
  const handleDecodeToken = () => {
    setDecodedToken(decodeJwt(token));
  };
  
  const validateTokenWithBackend = async () => {
    setValidating(true);
    setValidationError(null);
    setValidationResult(null);
    
    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setValidationError('No token found in localStorage');
        return;
      }
      
      const response = await api.post('/api/auth/validate', { token: currentToken });
      console.log('Validation response:', response.data);
      setValidationResult(response.data);
      
      // If token has authority issues, try to refresh it
      if (response.data && response.data.authorityMatch === false) {
        try {
          console.log('Attempting to refresh token due to authority mismatch...');
          const refreshResponse = await api.post('/api/auth/refresh', { token: currentToken });
          
          if (refreshResponse.data && refreshResponse.data.token) {
            console.log('Token refreshed successfully');
            localStorage.setItem('token', refreshResponse.data.token);
            
            // Update the decoded token and auth info
            setToken(refreshResponse.data.token);
            setDecodedToken(decodeJwt(refreshResponse.data.token));
            setAuthInfo(prev => ({
              ...prev,
              token: refreshResponse.data.token.substring(0, 20) + '...',
              role: refreshResponse.data.role || prev.role
            }));
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
        }
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setValidationError(error.response?.data || error.message || 'Unknown error');
    } finally {
      setValidating(false);
    }
  };
  
  const formatJson = (json) => {
    return JSON.stringify(json, null, 2);
  };
  
  const checkRoleIssues = () => {
    if (!decodedToken || decodedToken.error) return null;
    
    const payload = decodedToken.payload;
    const issues = [];
    
    // Check if token has expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      issues.push('Token has expired');
    }
    
    // Check for role field
    const storedRole = localStorage.getItem('role');
    if (!payload.role && !payload.roles && !payload.authorities) {
      issues.push('No role/roles/authorities field found in JWT');
    } else {
      // Check if the role in localStorage matches the one in JWT
      let jwtRole = null;
      if (payload.role) jwtRole = payload.role;
      else if (payload.roles && Array.isArray(payload.roles)) jwtRole = payload.roles[0];
      else if (payload.authorities) {
        // Handle both array and string formats for authorities
        if (Array.isArray(payload.authorities)) {
          const teacherAuth = payload.authorities.find(auth => 
            auth === 'ROLE_TEACHER' || auth === 'TEACHER');
          if (teacherAuth) jwtRole = 'TEACHER';
        } else if (typeof payload.authorities === 'string') {
          if (payload.authorities === 'ROLE_TEACHER' || payload.authorities === 'TEACHER') {
            jwtRole = 'TEACHER';
          }
        }
      }
      
      if (jwtRole !== storedRole) {
        issues.push(`Role mismatch: JWT has "${jwtRole}", localStorage has "${storedRole}"`);
      }
      
      // Check if the role format is correct for Spring Security
      if (jwtRole === 'TEACHER') {
        let hasRolePrefix = false;
        
        if (Array.isArray(payload.authorities)) {
          hasRolePrefix = payload.authorities.includes('ROLE_TEACHER');
        } else if (typeof payload.authorities === 'string') {
          hasRolePrefix = payload.authorities === 'ROLE_TEACHER';
        }
        
        if (!hasRolePrefix) {
          issues.push('JWT may be missing "ROLE_" prefix required by Spring Security');
        }
      }
    }
    
    return issues.length > 0 ? issues : ['No issues detected with roles'];
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>JWT Token Debugger</Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Current Authentication State</Typography>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #ddd' }}>
            <Typography><strong>Token in localStorage:</strong> {authInfo.token}</Typography>
            <Typography><strong>Role in localStorage:</strong> {authInfo.role}</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={validateTokenWithBackend} 
              disabled={validating} 
              sx={{ mt: 2 }}
            >
              {validating ? 'Validating...' : 'Validate Token with Backend'}
            </Button>
            
            {validationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {typeof validationError === 'string' ? validationError : JSON.stringify(validationError)}
              </Alert>
            )}
            
            {validationResult && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Validation Results:</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1, 
                  border: '1px solid #ddd',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                  mt: 1
                }}>
                  {formatJson(validationResult)}
                </Box>
                
                {validationResult.authorityMatch === false && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Token authority format mismatch detected. The token has been refreshed automatically.
                  </Alert>
                )}
                
                {validationResult.authorityMatch === true && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Token authority format is correct!
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Decoded JWT Token</Typography>
          {decodedToken ? (
            decodedToken.error ? (
              <Typography color="error">{decodedToken.error}</Typography>
            ) : (
              <>
                <Typography variant="subtitle1" gutterBottom>Payload:</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1, 
                  border: '1px solid #ddd',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto'
                }}>
                  {formatJson(decodedToken.payload)}
                </Box>
                
                <Typography variant="subtitle1" sx={{ mt: 3 }}>Role Analysis:</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1, 
                  border: '1px solid #ddd',
                  mt: 1
                }}>
                  {checkRoleIssues().map((issue, index) => (
                    <Typography key={index} color={issue.startsWith('No issues') ? 'success.main' : 'error'}>
                      • {issue}
                    </Typography>
                  ))}
                </Box>
              </>
            )
          ) : (
            <Typography>No token decoded yet</Typography>
          )}
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Troubleshooting Steps</Typography>
          <ol>
            <li>
              <Typography>
                <strong>Check if JWT contains the TEACHER role</strong> - The payload should have a role/roles field with "TEACHER" or authorities with "ROLE_TEACHER"
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Verify Spring Security configuration</strong> - Ensure you have <code>.requestMatchers("/api/teacher/**").hasRole("TEACHER")</code>
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Check UserDetailsService</strong> - It should return "ROLE_TEACHER" for teachers, not just "TEACHER"
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Verify JwtFilter</strong> - Ensure it extracts roles correctly and adds "ROLE_" prefix if needed
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Use the Validate Token button</strong> - This will check your token with the backend and automatically refresh it if needed
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Check browser console</strong> - Look for authentication and authorization error messages
              </Typography>
            </li>
          </ol>
        </Box>
      </Paper>
    </Container>
  );
};

export default JwtDebugger;

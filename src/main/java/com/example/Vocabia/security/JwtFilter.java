package com.example.Vocabia.security;

import com.example.Vocabia.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain) throws ServletException, IOException {
        // Log the request path for debugging
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        System.out.println(" JwtFilter processing request: " + method + " " + requestPath);
        
        // Log client information for debugging
        System.out.println(" Client IP: " + request.getRemoteAddr());
        System.out.println(" Client Host: " + request.getRemoteHost());
        System.out.println(" Origin: " + request.getHeader("Origin"));
        
        // Skip authentication for OPTIONS requests (pre-flight CORS requests)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            System.out.println(" Skipping JWT authentication for OPTIONS request");
            response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
            filterChain.doFilter(request, response);
            return;
        }
        
        // Skip authentication for public endpoints
        if (isPublicEndpoint(requestPath)) {
            System.out.println(" Public endpoint, skipping authentication: " + requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        System.out.println(" Authorization header: " + (authHeader != null ? 
            (authHeader.length() > 20 ? authHeader.substring(0, 20) + "..." : authHeader) : "null"));
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
                // Log the token and extracted authority for debugging
                String authority = jwtUtil.extractAuthority(jwt);
                System.out.println(" JWT Token - Email: " + email);
                System.out.println(" JWT Token - Authority: " + authority);
            } catch (Exception e) {
                System.out.println(" Error extracting JWT data: " + e.getMessage());
                System.out.println(" Invalid token: " + (jwt != null ? 
                    (jwt.length() > 20 ? jwt.substring(0, 20) + "..." : jwt) : "null"));
                e.printStackTrace();
                filterChain.doFilter(request, response);
                return;
            }
        } else {
            System.out.println(" No valid Authorization header found");
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                System.out.println(" Loading user details for: " + email);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                System.out.println(" User details loaded successfully");
                
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    // Log authentication details for debugging
                    System.out.println(" JWT Authentication - Email: " + email);
                    System.out.println(" JWT Authentication - Authorities: " + userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println(" Authentication set in SecurityContext");
                } else {
                    System.out.println(" JWT token validation failed");
                }
            } catch (Exception e) {
                System.out.println(" Error during authentication: " + e.getMessage());
                e.printStackTrace();
            }
        } else if (email == null) {
            System.out.println(" No email extracted from token");
        } else {
            System.out.println(" Authentication already exists in SecurityContext");
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Check if the endpoint is public and doesn't require authentication
     */
    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth/") || 
               path.equals("/api/auth/login") || 
               path.equals("/api/auth/register") || 
               path.equals("/api/auth/validate") || 
               path.startsWith("/api/4pic1word-assets/") || 
               path.equals("/api/fpow/categories") || 
               path.equals("/api/fpow/levels");
    }
}

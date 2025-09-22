package com.example.Vocabia.security;

import com.example.Vocabia.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        String authHeader = request.getHeader("Authorization");
        
        System.out.println("🛡️ JwtFilter processing: " + method + " " + requestPath);
        System.out.println("🛡️ Authorization header: " + (authHeader != null ? "Bearer [" + authHeader.length() + " chars]" : "null"));
        System.out.println("🛡️ Origin: " + request.getHeader("Origin"));
        System.out.println("🛡️ Content-Type: " + request.getHeader("Content-Type"));

        // No bypassing - all endpoints should go through JWT authentication if they have tokens
        String email = null;
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
                String authority = jwtUtil.extractAuthority(jwt);
                System.out.println("✅ JWT Token - Email: " + email);
                System.out.println("✅ JWT Token - Authority: " + authority);
            } catch (Exception e) {
                System.out.println("❌ Error extracting JWT data: " + e.getMessage());
                // Continue with the request - let Spring Security handle authorization
                filterChain.doFilter(request, response);
                return;
            }
        } else {
            System.out.println("❌ No valid Authorization header found");
            // For permitAll endpoints, continue without JWT
            if (isPermitAllEndpoint(requestPath, method)) {
                System.out.println("🚀 Continuing with permitAll endpoint without JWT");
                filterChain.doFilter(request, response);
                return;
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    System.out.println("🔐 JWT validated for user: " + email);
                    System.out.println("🔐 Authorities: " + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("❌ JWT validation failed for user: " + email);
                    // Continue with the request - let Spring Security handle authorization
                }
            } catch (Exception e) {
                System.out.println("❌ Error during JWT validation: " + e.getMessage());
                // Continue with the request - let Spring Security handle authorization
            }
        } else {
            System.out.println("⚠️ Skipping authentication setup (email missing or already authenticated)");
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPermitAllEndpoint(String requestPath, String method) {
        // Define endpoints that don't require JWT authentication
        return (requestPath.startsWith("/api/auth/") ||
                requestPath.startsWith("/images/") ||
                requestPath.startsWith("/audio/") ||
                requestPath.startsWith("/nature/") ||
                requestPath.startsWith("/api/4pic1word-assets/") ||
                requestPath.equals("/api/fpow/categories") ||
                requestPath.equals("/api/fpow/levels"));
    }
}

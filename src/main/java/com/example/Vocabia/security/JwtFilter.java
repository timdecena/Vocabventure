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
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) throws ServletException, IOException {
    String authHeader = request.getHeader("Authorization");
    String email = null;
    String jwt = null;

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        jwt = authHeader.substring(7);
        try {
            email = jwtUtil.extractEmail(jwt);
            System.out.println("✅ JWT email extracted: " + email);
        } catch (Exception e) {
            System.out.println("❌ Failed to extract email from JWT: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }
    } else {
        System.out.println("❌ No valid Authorization header found");
    }

    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        System.out.println("🔐 Loaded user details: " + userDetails.getUsername() + " | Authorities: " + userDetails.getAuthorities());

        if (jwtUtil.validateToken(jwt, userDetails)) {
            System.out.println("✅ JWT validated successfully");

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        } else {
            System.out.println("❌ JWT validation failed for user: " + email);
        }
    } else {
        System.out.println("❌ Email is null or SecurityContext already has auth");
    }

    filterChain.doFilter(request, response);
}
}

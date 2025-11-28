package com.example.Vocabia.config;

import com.example.Vocabia.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import jakarta.annotation.PostConstruct;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
// Temporarily disable method security to test if it's blocking requests
// @EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
        System.out.println("🔧🔧🔧 SecurityConfig CONSTRUCTOR CALLED - JwtFilter injected");
    }

    @PostConstruct
    public void init() {
        System.out.println("🔧🔧🔧 SecurityConfig @PostConstruct - Bean is being initialized");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("🔧🔧🔧 SecurityConfig: Building SecurityFilterChain with JwtFilter");
        http
            // CRITICAL: Disable CSRF for stateless JWT authentication
            .csrf(csrf -> csrf.disable())
            
            // CRITICAL: Use explicit CORS configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CRITICAL: Stateless session for JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // CRITICAL: Proper request authorization order (most specific first)
            .authorizeHttpRequests(authz -> authz
                // Actuator health/info for uptime checks
                .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
                // CRITICAL: Allow all OPTIONS requests for CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Public static resources (front-end)
                .requestMatchers("/images/**", "/audio/**", "/nature/**", "/static/**",
                                "/avatars/**", "/default-avatar.png", "/fantasy/**", "/game-thumbnail/**").permitAll()
                .requestMatchers("/api/4pic1word-assets/**").permitAll()
                
                // Authentication endpoints (must be public)
                .requestMatchers("/api/auth/**").permitAll()

                // Public game metadata
                
                .requestMatchers("/api/fpow/categories", "/api/fpow/levels").permitAll()
                
                // CRITICAL: User progress endpoints - REQUIRE STUDENT ROLE
                .requestMatchers("/api/user-progress/**").hasRole("STUDENT")
                
                // Game endpoints
                // IMPORTANT: Specific rules MUST come before broad patterns
                .requestMatchers(HttpMethod.GET, "/api/game/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/game/word-of-the-day/submit").hasRole("STUDENT")
                .requestMatchers(HttpMethod.POST, "/api/game/word-of-the-day/retry").hasRole("STUDENT")
                .requestMatchers("/api/game/spelling/**").hasRole("STUDENT")

                // Leaderboards accessible by both STUDENT and TEACHER
                .requestMatchers("/api/leaderboard/**").hasAnyRole("STUDENT", "TEACHER")

                
                // Four Pics One Word gameplay
.requestMatchers(HttpMethod.POST, "/api/fpow/create").hasRole("TEACHER")
.requestMatchers("/api/fpow/categories", "/api/fpow/levels").permitAll()
.requestMatchers("/api/fpow/cleanup/**").permitAll() // Cleanup endpoints (temporary for migration)
.requestMatchers("/api/fpow/**").authenticated()
                // Teacher FPOW Management
.requestMatchers("/api/teacher/fpow/**").hasRole("TEACHER")                
                // Teacher endpoints
                .requestMatchers(HttpMethod.POST, "/api/teacher/spelling/upload-audio").hasRole("TEACHER")
                .requestMatchers("/api/teacher/**").hasRole("TEACHER")
                
                // Student endpoints
                .requestMatchers("/api/student/**").hasRole("STUDENT")
                
                // Adventure mode
                .requestMatchers("/api/adventure/**").hasRole("STUDENT")
                .requestMatchers("/api/adventure-profile/**").authenticated()
                
                // Spelling levels
                .requestMatchers("/api/spelling-level/**").hasAnyRole("TEACHER", "STUDENT")
                
                // TEMPORARY: open catch-all to resolve 403 while stabilizing WOTD
                .anyRequest().permitAll()
            )
            
            // CRITICAL: Add JWT filter before Spring's authentication filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // CRITICAL: Allow React development server origins
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://34.207.235.102",
            "http://54.210.180.36",
            "https://vocabia.duckdns.org" 
));
        
        // CRITICAL: Allow all HTTP methods including OPTIONS for preflight
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"
        ));
        
        // CRITICAL: Allow all headers including Authorization
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // CRITICAL: Allow credentials for JWT tokens
        configuration.setAllowCredentials(true);
        
        // CRITICAL: Expose headers that frontend might need
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"
        ));
        
        // CRITICAL: Set max age for preflight cache
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

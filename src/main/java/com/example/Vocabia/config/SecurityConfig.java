package com.example.Vocabia.config;

import com.example.Vocabia.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Allow static and public resources
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/images/**", "/audio/**", "/nature/**").permitAll()
                .requestMatchers("/api/4pic1word-assets/**").permitAll()
                // Auth endpoints
                .requestMatchers("/api/auth/**").permitAll()
                // Public FourPicsOneWord metadata endpoints
                .requestMatchers("/api/fpow/categories", "/api/fpow/levels").permitAll()
                // Game and progress tracking (authenticated)

.requestMatchers("/api/game/word-of-the-day/retry").hasRole("STUDENT")

                .requestMatchers("/api/fpow/**").authenticated()
.requestMatchers("/api/user-progress/**").hasRole("STUDENT")                // Spelling game audio upload
                .requestMatchers(HttpMethod.POST, "/api/teacher/spelling/upload-audio").hasRole("TEACHER")
                // Spelling level access
                .requestMatchers("/api/spelling-level/**").hasAnyRole("TEACHER", "STUDENT")
                // Teacher-only APIs
                .requestMatchers("/api/teacher/**").hasRole("TEACHER")
                // Student-only APIs
                .requestMatchers("/api/student/**").hasRole("STUDENT")
                // Adventure mode
                .requestMatchers("/api/adventure/**").hasRole("STUDENT")
                .requestMatchers("/api/adventure-profile/**").authenticated()
                // Game and leaderboard
                .requestMatchers("/api/game/**", "/api/leaderboard/**", "/api/game/spelling/**").hasRole("STUDENT")
                // Everything else
                .anyRequest().authenticated()
            )
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
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

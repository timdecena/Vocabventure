package com.example.Vocabia.config;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * This configuration class automatically creates an admin account on application startup
 * if it doesn't already exist.
 * 
 * HOW TO CREATE ADMIN ACCOUNT:
 * ============================
 * This class uses Spring Boot's CommandLineRunner to execute code after the application starts.
 * It checks if an admin user exists, and if not, creates one with:
 * - Username: admin
 * - Password: admin123 (hashed using BCrypt)
 * - Email: admin@vocabia.com
 * - Role: ADMIN
 * 
 * The admin account will be created automatically when you start the Spring Boot application.
 * You can log in with these credentials on the login page.
 */
@Configuration
public class AdminInitializer {
    
    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin user already exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                // Create admin user
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@vocabia.com");
                admin.setPassword(passwordEncoder.encode("admin123")); // Hash the password
                admin.setRole("ADMIN");
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setGold(0);
                admin.setCorrectAnswers(0);
                admin.setProgressPoints(0);
                
                userRepository.save(admin);
                
                System.out.println("========================================");
                System.out.println("✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!");
                System.out.println("========================================");
                System.out.println("Username: admin");
                System.out.println("Password: admin123");
                System.out.println("Email: admin@vocabia.com");
                System.out.println("Role: ADMIN");
                System.out.println("========================================");
                System.out.println("You can now log in with these credentials.");
                System.out.println("========================================");
            } else {
                System.out.println("ℹ️  Admin account already exists.");
            }
        };
    }
}


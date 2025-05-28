package com.example.Vocabia.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.repository.UserProgressRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProgressRepository userProgressRepository;

    public UserService(UserRepository repo, PasswordEncoder encoder, UserProgressRepository progressRepo) {
        this.userRepository = repo;
        this.passwordEncoder = encoder;
        this.userProgressRepository = progressRepo;
    }

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        // Create progress entry if it doesn't exist
        if (userProgressRepository.findByUser(saved).orElse(null) == null) {
            UserProgress progress = new UserProgress(saved);
            userProgressRepository.save(progress);
        }
        return saved;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }
}

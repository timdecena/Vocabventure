package com.example.Vocabia.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.repository.UserProgressRepository;

import java.util.Optional;

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

    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);

        // Create progress entry if it doesn't exist
        userProgressRepository.findByUser(saved)
                .orElseGet(() -> userProgressRepository.save(new UserProgress(saved)));
        return saved;
    }

    // This now returns Optional<User>
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}

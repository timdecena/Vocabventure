package com.example.Vocabia.service;

import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.repository.FourPicOneWordPuzzleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FourPicOneWordPuzzleService {

    private final FourPicOneWordPuzzleRepository puzzleRepository;

    public FourPicOneWordPuzzleService(FourPicOneWordPuzzleRepository repo) {
        this.puzzleRepository = repo;
    }

    public List<FourPicOneWordPuzzle> getAllPuzzles() {
        return puzzleRepository.findAll();
    }

    public Optional<FourPicOneWordPuzzle> getPuzzleById(Long id) {
        return puzzleRepository.findById(id);
    }

    public List<FourPicOneWordPuzzle> getPuzzlesByLevel(Level level) {
        return puzzleRepository.findByLevel(level);
    }

    public FourPicOneWordPuzzle savePuzzle(FourPicOneWordPuzzle puzzle) {
        return puzzleRepository.save(puzzle);
    }

    public void deletePuzzle(Long id) {
        puzzleRepository.deleteById(id);
    }
}

    package com.example.Vocabia.service;

    import com.example.Vocabia.entity.Level;
    import com.example.Vocabia.repository.LevelRepository;
    import org.springframework.stereotype.Service;

    import java.util.List;
    import java.util.Optional;

    @Service
    public class LevelService {

        private final LevelRepository levelRepository;

        public LevelService(LevelRepository repo) {
            this.levelRepository = repo;
        }

        public List<Level> getAllLevels() {
            return levelRepository.findAll();
        }

        public Optional<Level> getLevelById(Long id) {
            return levelRepository.findById(id);
        }

        public Level saveLevel(Level level) {
            return levelRepository.save(level);
        }

        public void deleteLevel(Long id) {
            levelRepository.deleteById(id);
        }
    }

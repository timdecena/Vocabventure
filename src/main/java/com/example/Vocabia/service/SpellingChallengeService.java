package com.example.Vocabia.service;

import com.example.Vocabia.entity.SpellingChallenge;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.repository.SpellingChallengeRepository;
import com.example.Vocabia.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpellingChallengeService {

    private final SpellingChallengeRepository challengeRepo;
    private final ClassroomRepository classroomRepo;

    public SpellingChallenge createChallenge(String word, String definition, String sentence, String audioUrl, User teacher, Long classroomId) {
        Classroom classroom = classroomRepo.findById(classroomId).orElseThrow(() -> new RuntimeException("Classroom not found"));

        SpellingChallenge challenge = new SpellingChallenge();
        challenge.setWord(word);
        challenge.setDefinition(definition);
        challenge.setExampleSentence(sentence);
        challenge.setAudioUrl(audioUrl);
        challenge.setTeacher(teacher);
        challenge.setClassroom(classroom);

        return challengeRepo.save(challenge);
    }

    public List<SpellingChallenge> getTeacherChallenges(User teacher) {
        return challengeRepo.findByTeacher(teacher);
    }
}

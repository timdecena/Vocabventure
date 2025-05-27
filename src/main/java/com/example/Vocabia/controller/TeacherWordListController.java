package com.example.Vocabia.controller;

import com.example.Vocabia.entity.WordList;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.repository.WordListRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherWordListController {

    private final WordListRepository wordListRepository;
    private final UserRepository userRepository;

    @GetMapping("/wordlists")
    public List<WordList> getTeacherWordLists(Principal principal) {
        User teacher = userRepository.findByEmail(principal.getName()).orElseThrow();
        return wordListRepository.findByCreatedById(teacher.getId());
    }

    @PostMapping("/wordlists/create")
public ResponseEntity<?> createWordList(@RequestBody WordList wordList, Principal principal) {
    User teacher = userRepository.findByEmail(principal.getName()).orElseThrow();
    wordList.setCreatedBy(teacher);
    wordList.getItems().forEach(item -> item.setWordList(wordList));
    wordListRepository.save(wordList);
    return ResponseEntity.ok().build();
}
}

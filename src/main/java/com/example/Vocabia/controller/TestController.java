package com.example.Vocabia.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @PostMapping("/api/wordlist/permitall-test")
    public String test() {
        return "permit all works!";
    }
}

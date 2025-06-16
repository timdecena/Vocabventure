package com.example.Vocabia.config;

import com.example.Vocabia.service.StaticImporterService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StaticImportRunner {

    private final StaticImporterService staticImporterService;

    public StaticImportRunner(StaticImporterService staticImporterService) {
        this.staticImporterService = staticImporterService;
    }

    @Bean
    public CommandLineRunner runImport() {
        return args -> {
            System.out.println("Starting Static Import...");
            staticImporterService.importPuzzles();
            System.out.println("Static Import Completed!");
        };
    }
}

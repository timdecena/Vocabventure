package com.example.Vocabia.config;

import com.example.Vocabia.service.StaticImporterService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * DISABLED: Static level import is now disabled.
 * Teachers will create all Four Pics One Word categories and levels.
 * Adventure Mode content is managed separately and remains active.
 */
@Configuration
public class StaticImportRunner {
    

    private final StaticImporterService staticImporterService;

    public StaticImportRunner(StaticImporterService staticImporterService) {
        this.staticImporterService = staticImporterService;
    }

    // DISABLED: Commented out to prevent auto-import of static levels
    // Teachers now create all content via the teacher dashboard
    /*
    @Bean
    public CommandLineRunner runImport() {
        return args -> {
            System.out.println("Starting Static Import...");
            staticImporterService.importPuzzles();
            System.out.println("Static Import Completed!");
        };
    }
    */
}

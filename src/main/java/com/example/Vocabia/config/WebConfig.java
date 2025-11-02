package com.example.Vocabia.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:}")  // optional property, default empty
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {

        // Images and static resources (existing)
        registry.addResourceHandler("/images/**")
                .addResourceLocations(
                        "classpath:/static/images/",
                        "file:src/main/resources/static/images/"
                );

        registry.addResourceHandler("/static/**")
                .addResourceLocations(
                        "classpath:/static/",
                        "file:src/main/resources/static/"
                );

        // Audio dynamic path
        String audioDir;
        try {
            Path testPath = Paths.get(uploadDir != null ? uploadDir : "");
            if (uploadDir == null || uploadDir.isEmpty() || !Files.isWritable(testPath)) {
                audioDir = System.getProperty("user.dir") + "/uploads/audio/";
            } else {
                audioDir = uploadDir + "/audio/";
            }
        } catch (Exception e) {
            // fallback just in case
            audioDir = System.getProperty("user.dir") + "/uploads/audio/";
        }

        registry.addResourceHandler("/audio/**")
                .addResourceLocations("file:" + audioDir);
    }
}

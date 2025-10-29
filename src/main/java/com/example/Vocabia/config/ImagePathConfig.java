package com.example.Vocabia.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import java.io.File;

/**
 * Dynamic image path configuration that works across different developer machines
 * Automatically detects project structure and sets up image directories
 */
@Component
@Configuration
public class ImagePathConfig {
    
    private String projectRoot;
    private String fpowImageDir;
    private String staticImageDir;
    
    @PostConstruct
public void initializePaths() {
    try {
        String ec2Path = "/home/ec2-user/Vocabventure/uploads";

        File ec2Dir = new File(ec2Path);
        if (ec2Dir.exists()) {
            // ✅ Use EC2 path if running on the server
            fpowImageDir = ec2Path + "/Four_Pic_One_Word_Category";
            staticImageDir = ec2Path;

            ensureDirectoryExists(fpowImageDir, "FPOW Images (EC2)");
            ensureDirectoryExists(staticImageDir, "Static Images (EC2)");

            System.out.println("🌍 Using EC2 upload paths:");
            System.out.println("   🖼️ FPOW Images: " + fpowImageDir);
            System.out.println("   📷 Static Images: " + staticImageDir);
            return;
        }

        // 🔧 Otherwise, fall back to your local logic
        projectRoot = findProjectRoot();
        if (projectRoot != null) {
            fpowImageDir = projectRoot + "/vocabia-game/public/static/images/Four_Pic_One_Word_Category";
            staticImageDir = projectRoot + "/vocabia-game/public/static/images";
        } else {
            setupFallbackPaths();
        }

        ensureDirectoryExists(fpowImageDir, "FPOW Images");
        ensureDirectoryExists(staticImageDir, "Static Images");

    } catch (Exception e) {
        System.err.println("❌ Error initializing image paths: " + e.getMessage());
        setupFallbackPaths();
    }
}
    
    private String findProjectRoot() {
        File currentDir = new File(System.getProperty("user.dir"));
        
        // Look for pom.xml in current directory and parent directories
        while (currentDir != null) {
            File pomFile = new File(currentDir, "pom.xml");
            if (pomFile.exists()) {
                System.out.println("✅ Found project root at: " + currentDir.getAbsolutePath());
                return currentDir.getAbsolutePath();
            }
            currentDir = currentDir.getParentFile();
        }
        
        System.out.println("⚠️ Could not find project root (pom.xml), using fallback paths");
        return null;
    }
    
    private void ensureDirectoryExists(String path, String description) {
        File dir = new File(path);
        if (!dir.exists()) {
            if (dir.mkdirs()) {
                System.out.println("✅ Created " + description + " directory: " + path);
            } else {
                System.err.println("❌ Failed to create " + description + " directory: " + path);
            }
        } else {
            System.out.println("✅ Found existing " + description + " directory: " + path);
        }
    }
    
    private void setupFallbackPaths() {
        fpowImageDir = "src/main/resources/static/images/Four_Pic_One_Word_Category";
        staticImageDir = "src/main/resources/static/images";
        
        ensureDirectoryExists(fpowImageDir, "FPOW Images (Fallback)");
        ensureDirectoryExists(staticImageDir, "Static Images (Fallback)");
        
        System.out.println("🔄 Using fallback image paths:");
        System.out.println("   🖼️ FPOW Images: " + fpowImageDir);
        System.out.println("   📷 Static Images: " + staticImageDir);
    }
    
    // Getter methods for other components to use
    public String getProjectRoot() {
        return projectRoot;
    }
    
    public String getFpowImageDir() {
        return fpowImageDir;
    }
    
    public String getStaticImageDir() {
        return staticImageDir;
    }
    
    /**
     * Get relative path for frontend URLs
     */
    public String getFpowImageUrl(String filename) {
        return "/static/images/Four_Pic_One_Word_Category/" + filename;
    }
    
    /**
     * Get absolute file path for saving images
     */
    public String getFpowImagePath(String filename) {
        return fpowImageDir + File.separator + filename;
    }
    
    /**
     * Check if the current configuration is using the main project structure
     */
    public boolean isUsingProjectStructure() {
        return projectRoot != null;
    }
}

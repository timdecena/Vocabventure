// src/main/java/com/example/Vocabia/exception/GlobalExceptionHandler.java
package com.example.Vocabia.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntime(RuntimeException ex) {
        // Log here if needed
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidation(MethodArgumentNotValidException ex) {
        String errorMessage = "Validation error";
        
        try {
            if (ex.getBindingResult() != null) {
                FieldError fieldError = ex.getBindingResult().getFieldError();
                if (fieldError != null && fieldError.getDefaultMessage() != null) {
                    errorMessage = fieldError.getDefaultMessage();
                }
            }
        } catch (Exception e) {
            log.warn("Error processing validation exception", e);
        }
        
        return ResponseEntity.badRequest().body(errorMessage);
    }
}
